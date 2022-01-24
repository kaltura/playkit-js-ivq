// @ts-ignore
import {cuepoint, core} from 'kaltura-player-js';

const {TimedMetadata} = core;

interface TimedMetadataEvent {
  payload: {
    cues: Array<typeof TimedMetadata>;
  };
}
export class QuestionsSyncManager {
  _eventManager: KalturaPlayerTypes.EventManager;
  _player: KalturaPlayerTypes.Player;
  _question: ...

  constructor(eventManager: KalturaPlayerTypes.EventManager, player: KalturaPlayerTypes.Player) {
    this._eventManager = eventManager;
    this._player = player;

    this._syncEvents();
  }

  private _syncEvents = () => {
    this._eventManager.listen(this._player, this._player.Event.TIMED_METADATA_CHANGE, this._onTimedMetadataChange);
    this._eventManager.listen(this._player, this._player.Event.TIMED_METADATA_ADDED, this._onTimedMetadataAdded);
  };

  public addQuizData(){

  }

  private _onTimedMetadataChange = ({payload}: TimedMetadataEvent) => {};
  private _onTimedMetadataAdded = ({payload}: TimedMetadataEvent) => {};
}
