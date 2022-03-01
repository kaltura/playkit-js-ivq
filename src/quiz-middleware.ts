export class KalturaIvqMiddleware extends KalturaPlayer.core.BaseMiddleware {
  constructor(private _shouldPreventSeek: (to: number) => boolean) {
    super();
  }

  setCurrentTime(to: number, next: Function) {
    if (this._shouldPreventSeek(to)) {
      return;
    }
    this.callNext(next);
  }
}
