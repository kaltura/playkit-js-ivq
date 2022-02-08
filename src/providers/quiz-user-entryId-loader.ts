import ILoader = KalturaPlayerTypes.ILoader;
import {KalturaUserEntryResponse} from './response-types';
const {RequestBuilder} = KalturaPlayer.providers;

interface QuizUserEntryIdLoaderParams {
  entryId: string;
}

export class QuizUserEntryIdLoader implements ILoader {
  _entryId: string;
  _requests: any[] = [];
  _response: any = {};

  static get id(): string {
    return 'quizUserEntryId';
  }

  constructor({entryId}: QuizUserEntryIdLoaderParams) {
    this._entryId = entryId;
    const headers: Map<string, string> = new Map();

    const userEntryIdRequest = new RequestBuilder(headers);
    userEntryIdRequest.service = 'userEntry';
    userEntryIdRequest.action = 'add';
    userEntryIdRequest.ignoreNull = 1;
    userEntryIdRequest.format = 1;
    userEntryIdRequest.params = {
      userEntry: {
        objectType: 'KalturaQuizUserEntry',
        entryId: this._entryId
      }
    };
    this.requests.push(userEntryIdRequest);
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
