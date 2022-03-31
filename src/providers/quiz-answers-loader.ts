import ILoader = KalturaPlayerTypes.ILoader;
import {KalturaQuizAnswerListResponse} from './response-types';
const {RequestBuilder} = KalturaPlayer.providers;

interface QuizAnswerLoaderParams {
  entryId: string;
  quizUserEntryId: number;
}

interface QuizAnswerLoaderResponse {
  quizAnswers?: Array<any>;
}

export class QuizAnswerLoader implements ILoader {
  _entryId: string = '';
  _quizUserEntryId: number = 0;
  _requests: any[] = [];
  _response: QuizAnswerLoaderResponse = {
    quizAnswers: []
  };

  static get id(): string {
    return 'answers';
  }

  constructor({entryId, quizUserEntryId}: QuizAnswerLoaderParams) {
    this._entryId = entryId;
    this._quizUserEntryId = quizUserEntryId;
    const headers: Map<string, string> = new Map();

    // quiz answers request
    const quizAnswersRequest = new RequestBuilder(headers);
    quizAnswersRequest.service = 'cuepoint_cuepoint';
    quizAnswersRequest.action = 'list';
    quizAnswersRequest.params = {
      filter: {
        objectType: 'KalturaAnswerCuePointFilter',
        entryIdEqual: this._entryId,
        cuePointTypeEqual: 'quiz.QUIZ_ANSWER',
        quizUserEntryIdEqual: this._quizUserEntryId
      }
    };

    this.requests.push(quizAnswersRequest);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    const quizAnswersResponse = new KalturaQuizAnswerListResponse(response[0]?.data);
    if (quizAnswersResponse && quizAnswersResponse.totalCount) {
      this._response.quizAnswers = quizAnswersResponse?.data;
    }
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return Boolean(this._entryId && this._quizUserEntryId);
  }
}
