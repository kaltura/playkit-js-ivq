// @ts-ignore
import {core} from 'kaltura-player-js';
import {h} from 'preact';
import {QuizQuestion, KalturaQuizQuestion, QuizQuestionMap, QuizQuestionUI, Selected, KalturaQuizQuestionTypes} from './types';
import {QuizQuestionWrapper} from './components/quiz-question';

const {EventType} = core;

export class QuestionsManager {
  private _removeActives = () => {};
  private _ignoreCuepointEvents = false;
  constructor(
    private _quizQuestionMap: QuizQuestionMap,
    private _player: KalturaPlayerTypes.Player,
    private _eventManager: KalturaPlayerTypes.EventManager
  ) {}

  public onQuestionCuepointActive({id}: KalturaQuizQuestion) {
    if (this._ignoreCuepointEvents) {
      return;
    }
    const quizQuestion = this._quizQuestionMap.get(id);
    if (quizQuestion) {
      this._prepareQuestion(quizQuestion);
    }
  }

  private _prepareQuestion = (qq: QuizQuestion, manualChange = false) => {
    const {startTime} = qq;
    this._removeActives();
    this._player.pause();
    if (manualChange && this._player.currentTime !== startTime) {
      this._ignoreCuepointEvents = true;
      this._player.currentTime = startTime;
      this._eventManager.listenOnce(this._player, EventType.SEEKED, () => {
        this._ignoreCuepointEvents = false;
      });
    }
    this._showQuestion(qq);
  };

  private _showQuestion = (qq: QuizQuestion) => {
    const {next, prev, q, a, disabled} = qq;
    let onNext;
    let onPrev;
    if (next) {
      // allow go to next CP: 1 - if canSkip is true; 2 - if canSkip is false but current CP and next CP is already answered
      const nextQuestion = this._quizQuestionMap.get(next.id)!;
      if (qq.skipAvailable || (a && nextQuestion.a)) {
        onNext = () => {
          this._prepareQuestion(nextQuestion, true);
        };
      }
    }
    if (prev) {
      // allow go to prev CP: 1 - if canSkip is true; 2 - if canSkip is false but current CP and prev CP is already answered
      const prevQuestion = this._quizQuestionMap.get(prev.id)!;
      if (qq.skipAvailable || (a && prevQuestion.a)) {
        onPrev = () => {
          this._prepareQuestion(this._quizQuestionMap.get(prev.id)!, true);
        };
      }
    }

    const onSkip = () => {
      this._removeActives();
      if (qq.startTime === next?.startTime) {
        this._prepareQuestion(this._quizQuestionMap.get(next.id)!);
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
      }
    };

    const quizQuestionUi: QuizQuestionUI = {
      q,
      a,
      questionIndex: [qq.index + 1, this._quizQuestionMap.size],
      onNext,
      onPrev,
      onContinue,
      disabled
    };

    if (qq.skipAvailable && qq.q.questionType !== KalturaQuizQuestionTypes.Reflection) {
      quizQuestionUi.onSkip = onSkip;
    }

    this._removeActives = this._player.ui.addComponent({
      label: 'kaltura-ivq-question-wrapper',
      presets: ['Playback'],
      container: 'GuiArea',
      get: () => <QuizQuestionWrapper qui={quizQuestionUi} />
    });
  };
}
