import ILoader = KalturaPlayerTypes.ILoader;
import {KalturaUserEntryResponse} from './response-types';
const {RequestBuilder} = KalturaPlayer.providers;

interface QuizSubmitLoaderParams {
  entryId: string;
  quizUserEntryId: number;
}

export class QuizSubmitLoader implements ILoader {
  _entryId: string;
  _requests: any[] = [];
  _response: any = {};

  static get id(): string {
    return 'quizSubmit';
  }

  constructor({entryId, quizUserEntryId}: QuizSubmitLoaderParams) {
    this._entryId = entryId;
    const headers: Map<string, string> = new Map();

    const quizSubmitRequest = new RequestBuilder(headers);
    quizSubmitRequest.service = 'userEntry';
    quizSubmitRequest.action = 'submitQuiz';
    quizSubmitRequest.ignoreNull = 1;
    quizSubmitRequest.format = 1;
    quizSubmitRequest.params = {
      id: quizUserEntryId
    };
    this.requests.push(quizSubmitRequest);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    const userEntryIdResponse = new KalturaUserEntryResponse(response[0]?.data);
    if (userEntryIdResponse) {
      this._response.userEntry = userEntryIdResponse?.data;
    }
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return Boolean(this._entryId);
  }
}
