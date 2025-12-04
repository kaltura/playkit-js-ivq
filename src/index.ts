/// <reference path="./global.d.ts" />

import {Ivq, PLUGIN_NAME} from './ivq';
import {registerPlugin} from '@playkit-js/kaltura-player-js';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {Ivq as Plugin};
export {VERSION, NAME};
export {IvqEventTypes as EventType} from './types';

registerPlugin(PLUGIN_NAME, Ivq as any);
