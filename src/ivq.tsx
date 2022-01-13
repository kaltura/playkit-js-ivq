import {h} from 'preact';
import { IvqConfig } from "./types/IvqConfig";

// @ts-ignore
export class Ivq extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;

  static defaultConfig: IvqConfig = {

  };

  constructor(name: string, player: any, config: IvqConfig) {
    super(name, player, config);
    this._player = player;
  }

  get ready() {
    return Promise.resolve();
  }

  loadMedia(): void {}

  static isValid(): boolean {
    return true;
  }

  reset(): void {}

  destroy(): void {}
}
