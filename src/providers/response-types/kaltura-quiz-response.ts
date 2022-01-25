import {KalturaQuiz} from './kaltura-quiz';
const {BaseServiceResult} = KalturaPlayer.providers.ResponseTypes;

export class KalturaQuizResponse extends BaseServiceResult {
  data?: KalturaQuiz;

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.data = new KalturaQuiz(responseObj);
    }
  }
}
