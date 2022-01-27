// @ts-ignore
import {core} from 'kaltura-player-js';
import {h} from 'preact';
import {KalturaQuizAnswer} from './providers/response-types';
import {QuizQuestion, KalturaQuizQuestion, QuizQuestionMap} from './data-sync-manager';
import {QuizQuestionWrapper} from './components/quiz-question';

const {EventType} = core;

export interface QuizQuestionUI {
  q: KalturaQuizQuestion;
  a?: KalturaQuizAnswer;
  questionIndex: [number, number];
  onNext?: () => void;
  onPrev?: () => void;
  onContinue: () => void;
}

export class QuestionsManager {
  private _removeActives = () => {};
  private _active = true;
  constructor(
    private _quizQuestionMap: QuizQuestionMap,
    private _player: KalturaPlayerTypes.Player,
    private _eventManager: KalturaPlayerTypes.EventManager
  ) {}

  public onQuestionBecomeActive({id}: KalturaQuizQuestion) {
    const quizQuestion = this._quizQuestionMap.get(id);
    if (quizQuestion && this._active) {
      this._prepareQuestion(quizQuestion);
    }
  }

  private _prepareQuestion = (qq: QuizQuestion, manualChange = false) => {
    const {startTime} = qq;
    this._removeActives();
    this._player.pause();
    if (manualChange && this._player.currentTime !== startTime) {
      this._active = false;
      this._player.currentTime = startTime;
      this._eventManager.listenOnce(this._player, EventType.SEEKED, () => {
        this._active = true;
      });
    }
    this._showQuestion(qq);
  };

  private _showQuestion = (qq: QuizQuestion) => {
    const {next, prev, q, a} = qq;
    let onNext;
    let onPrev;
    if (next) {
      onNext = () => {
        this._prepareQuestion(this._quizQuestionMap.get(next.id)!, true);
      };
    }
    if (prev) {
      onPrev = () => {
        this._prepareQuestion(this._quizQuestionMap.get(prev.id)!, true);
      };
    }

    const onContinue = () => {
      qq.onContinue();
      this._removeActives();
      if (qq.startTime === next?.startTime) {
        this._prepareQuestion(this._quizQuestionMap.get(next.id)!);
      } else {
        this._player.play();
      }
    };

    const quizQuestionUi: QuizQuestionUI = {
      q,
      a,
      questionIndex: [qq.index + 1, this._quizQuestionMap.size],
      onNext,
      onPrev,
      onContinue
    };

    this._removeActives = this._player.ui.addComponent({
      label: 'kaltura-ivq-question-wrapper',
      presets: ['Playback'],
      container: 'GuiArea',
      get: () => <QuizQuestionWrapper qui={quizQuestionUi} />
    });
  };
}
