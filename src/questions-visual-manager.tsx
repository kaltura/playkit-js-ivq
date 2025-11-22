// @ts-ignore
import {core} from '@playkit-js/kaltura-player-js';
import {h} from 'preact';
import {useState} from 'preact/hooks';
import {
  QuizQuestion,
  KalturaQuizQuestion,
  QuizQuestionMap,
  QuizQuestionUI,
  Selected,
  KalturaQuizQuestionTypes,
  SubmissionDetails,
  PresetAreas,
  UiComponentArea,
  IvqEventTypes
} from './types';
import {QuizQuestionWrapper} from './components/quiz-question';

const {EventType, FakeEvent} = core;

const SEEK_DELTA = 0.3;

export class QuestionsVisualManager {
  private _updateQuestionComponent = (qui: QuizQuestionUI) => {};
  public quizQuestionJumping = false;
  private _lastQuizCuePointId: string | null = null;
  private _getCurrentSelected: (() => Selected) | null = null;

  constructor(
    private _getQuizQuestionMap: () => QuizQuestionMap,
    private _getUnansweredQuestions: () => Array<QuizQuestion>,
    private _player: KalturaPlayerTypes.Player,
    private _eventManager: KalturaPlayerTypes.EventManager,
    private _setOverlay: (overlay: Function) => void,
    private _removeOverlay: () => void,
    private _isOverlayExist: () => boolean,
    private _getSeekBarNode: () => Element | null,
    private _dispatchQuestionChanged: () => void,
    private _updatePlayerHover: () => void,
    private _isQuestionSkipped: (id: string) => boolean
  ) {
    this._eventManager.listen(this._player, EventType.SEEKING, this._resetLastQuizCuePointId);
  }

  public onQuestionCuepointActive({id}: KalturaQuizQuestion) {
    if (this.quizQuestionJumping || this._player.paused || id === this._lastQuizCuePointId) {
      return;
    }
    const quizQuestion = this._getQuizQuestionMap().get(id);
    if (quizQuestion) {
      this.preparePlayer(quizQuestion);
    }
  }

  public getSubmissionDetails = (): SubmissionDetails => {
    const unansweredQuestions = this._getUnansweredQuestions();
    const reviewQuestion = unansweredQuestions[0] || this._getQuizQuestionMap().values().next().value;
    const submissionDetails: SubmissionDetails = {
      onReview: () => this.preparePlayer(reviewQuestion, true),
      submitAllowed: !unansweredQuestions.length
    };
    return submissionDetails;
  };

  public getReviewDetails = (): Array<QuizQuestion> => {
    return Array.from(this._getQuizQuestionMap().values());
  };

  public preparePlayer = (qq: QuizQuestion, manualChange = false, showQuestion = true) => {
    this._lastQuizCuePointId = qq.id;
    const {startTime} = qq;
    const isNotCurrentTime = this._player.currentTime < startTime - SEEK_DELTA || this._player.currentTime > startTime + SEEK_DELTA;
    if (manualChange && isNotCurrentTime) {
      this.quizQuestionJumping = true;
      this._player.currentTime = startTime;
      this._eventManager.listenOnce(this._player, EventType.SEEKED, () => {
        this.quizQuestionJumping = false;
      });
    }
    if (showQuestion) {
      this._showQuestion(qq, manualChange);
    }
  };

  private _resetLastQuizCuePointId = () => {
    if (!this._isOverlayExist()) {
      this._lastQuizCuePointId = null;
    }
  };

  private _renderUiComponent = (quizQuestionUi: QuizQuestionUI, updateComponent: boolean) => {
    if (updateComponent && this._isOverlayExist()) {
      this._updateQuestionComponent(quizQuestionUi);
    } else {
      this._setOverlay(
        this._player.ui.addComponent({
          label: 'kaltura-ivq-question-wrapper',
          presets: PresetAreas,
          container: UiComponentArea,
          get: () => {
            const [qui, setQui] = useState<QuizQuestionUI | null>(null);
            this._updateQuestionComponent = (qui: QuizQuestionUI) => {
              setQui(qui);
            };
            return (
              <QuizQuestionWrapper qui={qui || quizQuestionUi} getSeekBarNode={this._getSeekBarNode} updatePlayerHover={this._updatePlayerHover} />
            );
          }
        })
      );
    }
  };

  private _showQuestion = (qq: QuizQuestion, manualChange: boolean) => {
    const {next, prev, q, a, disabled} = qq;
    let onNext;
    let onPrev;
    if (next) {
      // allow go to next CP: 1 - if canSkip is true; 2 - if canSkip is false but current CP and next CP is already answered
      const nextQuestion = this._getQuizQuestionMap().get(next.id)!;
      if (qq.skipAvailable || (a && nextQuestion.a)) {
        onNext = () => {
          // save current answer before navigating
          if (this._getCurrentSelected) {
            const currentSelected = this._getCurrentSelected();
            if (currentSelected && currentSelected.length > 0) {
              qq.onContinue(currentSelected).finally(() => {
                this.preparePlayer(nextQuestion, true);
              });
              return;
            }
          }
          this.preparePlayer(nextQuestion, true);
        };
      }
    }
    if (prev) {
      // allow go to prev CP: 1 - if canSkip is true; 2 - if canSkip is false but current CP and prev CP is already answered
      const prevQuestion = this._getQuizQuestionMap().get(prev.id)!;
      if (qq.skipAvailable || (a && prevQuestion.a)) {
        onPrev = () => {
          // save current answer before navigating
          if (this._getCurrentSelected) {
            const currentSelected = this._getCurrentSelected();
            if (currentSelected && currentSelected.length > 0) {
              qq.onContinue(currentSelected).finally(() => {
                this.preparePlayer(this._getQuizQuestionMap().get(prev.id)!, true);
              });
              return;
            }
          }
          this.preparePlayer(this._getQuizQuestionMap().get(prev.id)!, true);
        };
      }
    }

    const onSkip = () => {
      if (qq.startTime === next?.startTime) {
        // check if there are multiple questions at the same time and find the next available one
        const questionsAtSameTime = Array.from(this._getQuizQuestionMap().values())
          .filter(q => q.startTime === qq.startTime)
          .sort((a, b) => a.index - b.index); // sort by question index

        // find the first unanswered and unskipped question at this time
        const nextQuestion = questionsAtSameTime.find(q => !q.a && !q.disabled && !this._isQuestionSkipped(q.id));

        if (nextQuestion) {
          this.preparePlayer(nextQuestion, true);
        } else {
          this._removeOverlay();
          this._player.play();
        }
      } else {
        this._removeOverlay();
        this._player.play();
      }
      this._player.dispatchEvent(new FakeEvent(IvqEventTypes.QUIZ_SKIPPED, {questionIndex: qq.index + 1}));
    };

    const onContinue = (data: Selected | null) => {
      if (data) {
        return qq
          .onContinue(data)
          .then(onSkip)
          .catch(e => {
            // TODO: show notification
          });
      } else {
        onSkip();
        this._dispatchQuestionChanged();
        return Promise.resolve();
      }
    };

    const quizQuestionUi: QuizQuestionUI = {
      q,
      a,
      questionIndex: [qq.index + 1, this._getQuizQuestionMap().size],
      onNext,
      onPrev,
      onContinue,
      disabled: disabled || Boolean(!qq.allowAnswerUpdate && a),
      setCurrentSelectedGetter: (getCurrentSelectedFn: () => Selected) => {
        this._getCurrentSelected = getCurrentSelectedFn;
      }
    };

    if (qq.skipAvailable && qq.q.questionType !== KalturaQuizQuestionTypes.Reflection) {
      quizQuestionUi.onSkip = onSkip;
    }

    this._renderUiComponent(quizQuestionUi, manualChange);
  };

  public reset = () => {
    this.quizQuestionJumping = false;
    this._lastQuizCuePointId = null;
  };
}
