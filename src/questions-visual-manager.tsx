// @ts-ignore
import {core} from 'kaltura-player-js';
import {h} from 'preact';
import {
  QuizQuestion,
  KalturaQuizQuestion,
  QuizQuestionMap,
  QuizQuestionUI,
  Selected,
  KalturaQuizQuestionTypes,
  SubmissionDetails,
  PresetAreas
} from './types';
import {QuizQuestionWrapper} from './components/quiz-question';

const {EventType} = core;

export class QuestionsVisualManager {
  private _removeActives = () => {};
  public quizQuestionJumping = false;
  constructor(
    private _getQuizQuestionMap: () => QuizQuestionMap,
    private _player: KalturaPlayerTypes.Player,
    private _eventManager: KalturaPlayerTypes.EventManager
  ) {}

  public onQuestionCuepointActive({id}: KalturaQuizQuestion) {
    if (this.quizQuestionJumping) {
      return;
    }
    const quizQuestion = this._getQuizQuestionMap().get(id);
    if (quizQuestion) {
      this.preparePlayer(quizQuestion);
    }
  }

  public getSubmissionDetails = (): SubmissionDetails => {
    const unansweredQuestions: Array<QuizQuestion> = [];
    this._getQuizQuestionMap().forEach(qq => {
      if (!qq.a) {
        unansweredQuestions.push(qq);
      }
    });
    const reviewQuestion = unansweredQuestions[0] || this._getQuizQuestionMap().values().next().value;
    const submissionDetails: SubmissionDetails = {
      onReview: () => this.preparePlayer(reviewQuestion, true),
      showSubmitButton: !unansweredQuestions.length
    };
    return submissionDetails;
  };

  public getReviewDetails = (): Array<QuizQuestion> => {
    return Array.from(this._getQuizQuestionMap().values());
  };

  public preparePlayer = (qq: QuizQuestion, manualChange = false, showQuestion = true) => {
    const {startTime} = qq;
    this._player.pause();
    if (manualChange && this._player.currentTime !== startTime) {
      this.quizQuestionJumping = true;
      this._player.currentTime = startTime;
      this._eventManager.listenOnce(this._player, EventType.SEEKED, () => {
        this.quizQuestionJumping = false;
      });
    }
    if (showQuestion) {
      this._showQuestion(qq);
    }
  };

  private _showQuestion = (qq: QuizQuestion) => {
    this._removeActives();
    const {next, prev, q, a, disabled} = qq;
    let onNext;
    let onPrev;
    if (next) {
      // allow go to next CP: 1 - if canSkip is true; 2 - if canSkip is false but current CP and next CP is already answered
      const nextQuestion = this._getQuizQuestionMap().get(next.id)!;
      if (qq.skipAvailable || (a && nextQuestion.a)) {
        onNext = () => {
          this.preparePlayer(nextQuestion, true);
        };
      }
    }
    if (prev) {
      // allow go to prev CP: 1 - if canSkip is true; 2 - if canSkip is false but current CP and prev CP is already answered
      const prevQuestion = this._getQuizQuestionMap().get(prev.id)!;
      if (qq.skipAvailable || (a && prevQuestion.a)) {
        onPrev = () => {
          this.preparePlayer(this._getQuizQuestionMap().get(prev.id)!, true);
        };
      }
    }

    const onSkip = () => {
      this._removeActives();
      if (qq.startTime === next?.startTime) {
        this.preparePlayer(this._getQuizQuestionMap().get(next.id)!);
      } else {
        this._player.play();
      }
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
      disabled: disabled || Boolean(!qq.allowAnswerUpdate && a)
    };

    if (qq.skipAvailable && qq.q.questionType !== KalturaQuizQuestionTypes.Reflection) {
      quizQuestionUi.onSkip = onSkip;
    }

    this._removeActives = this._player.ui.addComponent({
      label: 'kaltura-ivq-question-wrapper',
      presets: PresetAreas,
      container: 'GuiArea',
      get: () => <QuizQuestionWrapper qui={quizQuestionUi} />
    });
  };
}
