export interface KalturaKeyValue {
  key? : string;
  value? : string;
}

export enum KalturaNullableBoolean {
  falseValue=0,
  nullValue=-1,
  trueValue=1
}

export enum KalturaScoreType {
  average=5,
  first=4,
  highest=1,
  latest=3,
  lowest=2
}

export interface KalturaQuizArgs {
  version: number;
  uiAttributes: KalturaKeyValue[];
  showResultOnAnswer: KalturaNullableBoolean;
  showCorrectKeyOnAnswer: KalturaNullableBoolean;
  allowAnswerUpdate: boolean;
  showCorrectAfterSubmission: boolean;
  allowDownload: KalturaNullableBoolean;
  showGradeAfterSubmission: KalturaNullableBoolean;
  attemptsAllowed: number;
  scoreType: KalturaScoreType;
}

export class KalturaQuiz {
  version : number;
  uiAttributes : KalturaKeyValue[];
  showResultOnAnswer : KalturaNullableBoolean;
  showCorrectKeyOnAnswer : KalturaNullableBoolean;
  allowAnswerUpdate : boolean;
  showCorrectAfterSubmission : boolean;
  allowDownload : KalturaNullableBoolean;
  showGradeAfterSubmission : KalturaNullableBoolean;
  attemptsAllowed : number;
  scoreType : KalturaScoreType;

  constructor(data : KalturaQuizArgs) {
    this.version = data.version;
    this.uiAttributes = data.uiAttributes;
    this.showResultOnAnswer = data.showResultOnAnswer;
    this.showCorrectKeyOnAnswer = data.showCorrectKeyOnAnswer;
    this.allowAnswerUpdate = data.allowAnswerUpdate;
    this.showCorrectAfterSubmission = data.showCorrectAfterSubmission;
    this.allowDownload = data.allowDownload;
    this.showGradeAfterSubmission = data.showGradeAfterSubmission;
    this.attemptsAllowed = data.attemptsAllowed;
    this.scoreType = data.scoreType;
  }
}
