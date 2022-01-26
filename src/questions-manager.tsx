import {h} from 'preact';
import {KalturaQuizAnswer} from './providers/response-types';
import {QuizQuestion, KalturaQuizQuestion, QuizQuestionMap} from './data-sync-manager';
import {QuizQuestionWrapper} from './components/quiz-question';

export interface QuizQuestionUi {
  // TODO: consider flat Q and A
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
          this._showQuestion(next!);
        }
      };
    }
    if (prev) {
      onPrev = () => {
        if (qq.startTime !== prev!.startTime) {
          this._player.currentTime = prev!.startTime;
        } else {
          this._showQuestion(prev!);
        }
      };
    }

    const onContinue = () => {
      qq.onContinue();
      this._removeActives();
      if (qq.startTime !== next!.startTime) {
        this._player.play();
      } else {
        this._showQuestion(next!);
      }
    };

    const quizQuestionUi: QuizQuestionUi = {
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
