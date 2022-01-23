import {KalturaQuizAnswer} from './kaltura-quiz-answer';
const {ServiceResult} = KalturaPlayer.providers;

export class KalturaQuizAnswerListResponse extends ServiceResult {
  totalCount?: number;
  data: Array<KalturaQuizAnswer> = [];

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.totalCount = responseObj.totalCount;
      if (this.totalCount! > 0) {
        this.data = [];
        responseObj.objects.map((quizAnswer: KalturaQuizAnswer) => this.data.push(new KalturaQuizAnswer(quizAnswer)));
      }
    }
  }
}
