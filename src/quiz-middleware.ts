export class KalturaIvqMiddleware extends KalturaPlayer.core.BaseMiddleware {
  constructor(
    private _shouldPreventSeek: (to: number) => boolean,
    private _showNoSeekAlertMessage: () => void
  ) {
    super();
  }


  setCurrentTime(to: number, next: Function) {
    if (this._shouldPreventSeek(to)) {
      this._showNoSeekAlertMessage()
   //   console.log("_preventSeekAlertText " + this._getSeekAlertText())
      return;
    }
    this.callNext(next);
  }
}
