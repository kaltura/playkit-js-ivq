import {h} from 'preact';
import {IvqConfig} from './types/IvqConfig';
import {ReservedPresetAreas} from './enum/reservedPresetAreasEnum';
const PRESETS = ['Playback', 'Live', 'Ads'];

export class Ivq extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;

  static defaultConfig: IvqConfig = {};

  constructor(name: string, player: any, config: IvqConfig) {
    super(name, player, config);
    this._player = player;
  }

  get ready() {
    return Promise.resolve();
  }

  loadMedia(): void {
    this._player.addEventListener('firstplaying', () => {
      setTimeout(() => {
        this._player.pause();
        // @ts-ignore
        this._player.ui.addComponent({
          label: 'kaltura-dual-screen-pip',
          presets: PRESETS,
          container: ReservedPresetAreas.PlayerArea,
          get: () => (
            // @ts-ignore
            <KalturaPlayer.ui.components.Overlay open>
              Welcome
              <KalturaPlayer.ui.components.SeekBarPlaybackContainer
                playerContainer={document.getElementsByClassName('playkit-gui-area')[0]}></KalturaPlayer.ui.components.SeekBarPlaybackContainer>
            </KalturaPlayer.ui.components.Overlay>
          )
        });
      }, 1000);
    });
  }

  static isValid(): boolean {
    return true;
  }

  reset(): void {}

  destroy(): void {}
}
