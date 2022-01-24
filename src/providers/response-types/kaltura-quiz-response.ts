import {KalturaQuiz} from './kaltura-quiz';
const {ServiceResult} = KalturaPlayer.providers;

export class KalturaQuizResponse extends ServiceResult {
  data?: KalturaQuiz;

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.data = new KalturaQuiz(responseObj);
    }
  }
}
