export interface CorrectAnswerKeys {
  objectType: string;
  value: string;
}

export class KalturaQuizAnswer {
  answerKey: string;
  correctAnswerKeys: Array<CorrectAnswerKeys>;
  objectType: string;
  isCorrect: boolean;
  parentId: string;
  quizUserEntryId: string;
  userId: string;
  id: string;
  explanation?: string;
  openAnswer?: string;
  partnerId: number;
  createdAt: string;
  updatedAt: string;

  constructor(codeCuePoint: any) {
    this.answerKey = codeCuePoint.answerKey;
    this.correctAnswerKeys = codeCuePoint.correctAnswerKeys;
    this.objectType = codeCuePoint.objectType;
    this.isCorrect = codeCuePoint.isCorrect;
    this.parentId = codeCuePoint.parentId;
    this.quizUserEntryId = codeCuePoint.quizUserEntryId;
    this.userId = codeCuePoint.userId;
    this.id = codeCuePoint.id;
    this.explanation = codeCuePoint.explanation;
    this.openAnswer = codeCuePoint.openAnswer;
    this.partnerId = codeCuePoint.partnerId;
    this.createdAt = codeCuePoint.createdAt;
    this.updatedAt = codeCuePoint.updatedAt;
  }
}
