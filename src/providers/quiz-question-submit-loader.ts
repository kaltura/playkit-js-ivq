import ILoader = KalturaPlayerTypes.ILoader;
import {KalturaQuizSubmitAnswerResponse} from './response-types';
const {RequestBuilder} = KalturaPlayer.providers;

interface QuizAnswerSubmitLoaderParams {
  entryId: string;
  quizUserEntryId: number;
  parentId?: string;
  answerKey: number; // TODO: check multi-opiton API
  id?: string;
  openAnswer?: string;
}

export class QuizAnswerSubmitLoader implements ILoader {
  _entryId: string;
  _quizUserEntryId: number;
  _parentId?: string;
  _answerKey: number;
  _id?: string;
  _requests: any[] = [];
  _response: any = {};

  static get id(): string {
    return 'quizAnswerSubmit';
  }

  constructor({entryId, quizUserEntryId, parentId, answerKey, id, openAnswer}: QuizAnswerSubmitLoaderParams) {
    this._entryId = entryId;
    this._quizUserEntryId = quizUserEntryId;
    this._parentId = parentId;
    this._answerKey = answerKey;
    this._id = id;
    const headers: Map<string, string> = new Map();

    // userEntry request
    const submitAnswerRequest = new RequestBuilder(headers);
    submitAnswerRequest.service = 'cuepoint_cuepoint';
    submitAnswerRequest.action = this._id ? 'update' : 'add';
    submitAnswerRequest.ignoreNull = 1;
    submitAnswerRequest.format = 1;
    submitAnswerRequest.params = {
      cuePoint: {
        objectType: 'KalturaAnswerCuePoint',
        answerKey: this._answerKey,
        quizUserEntryId: this._quizUserEntryId,
        entryId: this._entryId
      }
    };

    if (openAnswer) {
      submitAnswerRequest.params.cuePoint.openAnswer = openAnswer;
    }

    if (this._id) {
      submitAnswerRequest.params.id = this._id;
    } else {
      submitAnswerRequest.params.cuePoint.parentId = this._parentId;
      submitAnswerRequest.params.cuePoint.startTime = 0;
    }
    this.requests.push(submitAnswerRequest);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    const quizAnswersResponse = new KalturaQuizSubmitAnswerResponse(response[0]?.data);
    if (quizAnswersResponse) {
      this._response.quizAnswer = quizAnswersResponse?.data;
    }
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return Boolean(this._entryId && this._answerKey && this._quizUserEntryId && (this._parentId || this._id));
  }
}
