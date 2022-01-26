import {h} from 'preact';
import {KalturaQuizAnswer} from './providers/response-types';
import {QuizQuestion, KalturaQuizQuestion, QuizQuestionMap} from './data-sync-manager';
import {QuizQuestionWrapper} from './components/quiz-question';

export interface QuizQuestionUI {
  q: KalturaQuizQuestion;
  a?: KalturaQuizAnswer;
  onNext?: () => void;
  onPrev?: () => void;
  onContinue: () => void;
}

export class QuestionsManager {
  _removeActives = () => {};
  constructor(private _quizQuestionMap: QuizQuestionMap, private _player: KalturaPlayerTypes.Player) {}

  public onQuestionBecomeActive({id}: KalturaQuizQuestion) {
    const quizQuestion = this._quizQuestionMap.get(id);
    if (quizQuestion) {
      this._showQuestion(quizQuestion);
    }
  }

  private _showQuestion = (qq: QuizQuestion) => {
    const {next, prev, q, a} = qq;
    this._removeActives();
    this._player.pause();
    let onNext;
    let onPrev;
    if (next) {
      onNext = () => {
        if (qq.startTime !== next!.startTime) {
          this._player.currentTime = next!.startTime;
        } else {
          this._showQuestion(this._quizQuestionMap.get(next.id)!);
        }
      };
    }
    if (prev) {
      onPrev = () => {
        if (qq.startTime !== prev!.startTime) {
          this._player.currentTime = prev!.startTime;
        } else {
          this._showQuestion(this._quizQuestionMap.get(prev.id)!);
        }
      };
    }

    const onContinue = () => {
      qq.onContinue();
      this._removeActives();
      if (qq.startTime === next?.startTime) {
        this._showQuestion(this._quizQuestionMap.get(next.id)!);
      } else {
        this._player.play();
      }
    };

    const quizQuestionUi: QuizQuestionUI = {
      q,
      a,
      onNext,
      onPrev,
      onContinue
    };

    this._removeActives = this._player.ui.addComponent({
      label: 'kaltura-ivq-question-wrapper',
      presets: ['Playback'],
      container: 'GuiArea',
      get: () => <QuizQuestionWrapper q={quizQuestionUi} />
    });
  };
}
