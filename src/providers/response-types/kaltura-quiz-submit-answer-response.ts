import {KalturaQuizAnswer} from './kaltura-quiz-answer';
const {BaseServiceResult} = KalturaPlayer.providers.ResponseTypes;

export class KalturaQuizSubmitAnswerResponse extends BaseServiceResult {
  data?: KalturaQuizAnswer;

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.data = new KalturaQuizAnswer(responseObj);
    }
  }
}
