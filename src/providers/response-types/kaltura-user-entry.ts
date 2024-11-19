export enum KalturaUserEntryType {
  quiz = 'quiz.QUIZ',
  registration = 'registration.REGISTRATION',
  viewHistory = 'viewHistory.VIEW_HISTORY',
  watchLater = 'watchLater.WATCH_LATER'
}

export enum KalturaUserEntryStatus {
  active = '1',
  deleted = '2',
  quizSubmitted = 'quiz.3'
}

export interface KalturaUserEntryArgs {
  calculatedScore: number;
  score: number;
  id: string;
  entryId: string;
  userId: string;
  partnerId: number;
  status: KalturaUserEntryStatus;
  createdAt: string;
  updatedAt: string;
  type: KalturaUserEntryType;
  version: number;
}

export class KalturaUserEntry {
  calculatedScore: number | undefined;
  score: number | undefined;
  id: string;
  entryId: string;
  userId: string;
  partnerId: number;
  status: KalturaUserEntryStatus;
  createdAt: string;
  updatedAt: string;
  type: KalturaUserEntryType;
  version: number | undefined;

  constructor(userEntry: KalturaUserEntryArgs) {
    this.calculatedScore = userEntry.calculatedScore;
    this.score = userEntry.score;
    this.id = userEntry.id;
    this.entryId = userEntry.entryId;
    this.userId = userEntry.userId;
    this.partnerId = userEntry.partnerId;
    this.status = userEntry.status;
    this.createdAt = userEntry.createdAt;
    this.updatedAt = userEntry.updatedAt;
    this.type = userEntry.type;
    this.version = userEntry.version;
  }
}
