/// <reference path="./global.d.ts" />

import {Ivq, PLUGIN_NAME} from './ivq';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {Ivq as Plugin};
export {VERSION, NAME};
export {IvqEventTypes as EventType} from './types';

KalturaPlayer.core.registerPlugin(PLUGIN_NAME, Ivq);
