import ILoader = KalturaPlayerTypes.ILoader;
import {KalturaQuizResponse, KalturaUserEntryListResponse, KalturaQuizAnswerListResponse, KalturaUserEntryType} from './response-types';
const {RequestBuilder} = KalturaPlayer.providers;

interface QuizLoaderParams {
  entryId: string;
}

export class QuizLoader implements ILoader {
  _entryId: string = '';
  _requests: any[] = [];
  _response: any = {
    userEntries: [],
    quiz: {}
  };

  static get id(): string {
    return 'quiz';
  }

  constructor({entryId}: QuizLoaderParams) {
    this._entryId = entryId;
    const headers: Map<string, string> = new Map();

    // userEntry request
    const userEntryRequest = new RequestBuilder(headers);
    userEntryRequest.service = 'userEntry';
    userEntryRequest.action = 'list';
    userEntryRequest.params = {
      filter: {
        objectType: 'KalturaQuizUserEntryFilter',
        typeEqual: KalturaUserEntryType.quiz,
        entryIdEqual: this._entryId,
        userIdEqualCurrent: 1,
        orderBy: '-createdAt'
      }
    };

    // quiz request
    const quizRequest = new RequestBuilder(headers);
    quizRequest.service = 'quiz_quiz';
    quizRequest.action = 'get';
    quizRequest.params = {
      entryId: this._entryId
    };

    // quiz answers request
    const quizAnswersRequest = new RequestBuilder(headers);
    quizAnswersRequest.service = 'cuepoint_cuepoint';
    quizAnswersRequest.action = 'list';
    quizAnswersRequest.params = {
      filter: {
        objectType: 'KalturaAnswerCuePointFilter',
        entryIdEqual: this._entryId,
        cuePointTypeEqual: 'quiz.QUIZ_ANSWER',
        quizUserEntryIdEqual: '{1:result:objects:0:id}'
      }
    };

    this.requests.push(userEntryRequest);
    this.requests.push(quizRequest);
    this.requests.push(quizAnswersRequest);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    const userEntryListResponse = new KalturaUserEntryListResponse(response[0]?.data);
    if (userEntryListResponse.totalCount) {
      this._response.userEntries = userEntryListResponse?.data;
    }
    const quizResponse = new KalturaQuizResponse(response[1]?.data);
    if (quizResponse) {
      this._response.quiz = quizResponse?.data;
    }
    const quizAnswersResponse = new KalturaQuizAnswerListResponse(response[2]?.data);
    if (quizAnswersResponse && quizAnswersResponse.totalCount) {
      this._response.quizAnswers = quizAnswersResponse?.data;
    }
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return !!this._entryId;
  }
}
