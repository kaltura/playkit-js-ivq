/// <reference path="./global.d.ts" />

import {Ivq} from './ivq';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {Ivq as Plugin};
export {VERSION, NAME};
export {IvqEventTypes as EventType} from './types';

const pluginName: string = 'ivq';
KalturaPlayer.core.registerPlugin(pluginName, Ivq);
