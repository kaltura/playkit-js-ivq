import ILoader = KalturaPlayerTypes.ILoader;
const {RequestBuilder} = KalturaPlayer.providers;

interface QuizLoaderParams {
  entryId: string;
}

export class QuizDownloadLoader implements ILoader {
  _entryId: string = '';
  _requests: any[] = [];
  _response: string = '';

  static get id(): string {
    return 'quizDownload';
  }

  constructor({entryId}: QuizLoaderParams) {
    this._entryId = entryId;
    const headers: Map<string, string> = new Map();

    // quiz request
    const quizDownloadRequest = new RequestBuilder(headers);
    quizDownloadRequest.service = 'quiz_quiz';
    quizDownloadRequest.action = 'getUrl';
    quizDownloadRequest.params = {
      entryId: this._entryId,
      quizOutputType: 1
    };

    this.requests.push(quizDownloadRequest);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    this._response = response[0]?.data;
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return !!this._entryId;
  }
}
