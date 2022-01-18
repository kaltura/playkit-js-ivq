import ILoader = KalturaPlayerTypes.ILoader;

const {RequestBuilder, ResponseTypes} = KalturaPlayer.providers;

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

  constructor({ entryId }: QuizLoaderParams) {
    this._entryId = entryId;
    const headers: Map<string, string> = new Map();

    // userEntry request
    const userEntryRequest = new RequestBuilder(headers);
    userEntryRequest.service = 'userEntry';
    userEntryRequest.action = 'list';
    userEntryRequest.params = {
      filter: {
        objectType: 'KalturaQuizUserEntryFilter',
        typeEqual: ResponseTypes.KalturaUserEntry.UserEntryType.quiz,
        entryIdEqual: this._entryId,
        userIdEqualCurrent: 1,
        orderBy: "-createdAt"
      }
    };

    // quiz request
    const quizRequest = new RequestBuilder(headers);
    quizRequest.service = 'quiz_quiz';
    quizRequest.action = 'get';
    quizRequest.params = {
      entryId: this._entryId
    };
    
    this.requests.push(userEntryRequest);
    this.requests.push(quizRequest);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    const userEntryListResponse = new ResponseTypes.KalturaUserEntryListResponse(response[0]?.data);
    if (userEntryListResponse.totalCount) {
      this._response.userEntries = userEntryListResponse?.data;
    }
    const quizResponse = new ResponseTypes.KalturaQuizResponse(response[1]?.data);
    if (quizResponse) {
      this._response.quiz = quizResponse?.data;
    }
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return !!this._entryId;
  }
}
