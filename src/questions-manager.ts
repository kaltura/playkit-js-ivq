import {QuizQuestion, KalturaQuizQuestion, QuizQuestionMap} from './data-sync-manager';

export class QuestionsManager {
  private _quizQuestionArray: QuizQuestion[];
  constructor(private _quizQuestionMap: QuizQuestionMap) {
    this._quizQuestionArray = Object.keys(_quizQuestionMap).map(id => _quizQuestionMap[id]);
    // TODO: array of question for question length value and render list of questins
  }

  public onQuestionsBecomeActive(qq: KalturaQuizQuestion[]) {
    qq.forEach(cue => {
      // TODO: active question this._quizQuestionMap[cue.id]
    });
  }
}
