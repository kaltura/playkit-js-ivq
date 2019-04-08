import { h, render } from "preact";

import Stage, {
    LoadCallback,
    NotifyEventTypes,
    Props as StageProps
} from "@plugin/shared/components/Stage";

import { PlayerCompat } from "@playkit-js/playkit-js-ovp/playerCompat";
import { KalturaClient } from "kaltura-typescript-client";
import { CuePointListAction } from "kaltura-typescript-client/api/types/CuePointListAction";
import { KalturaCuePointFilter } from "kaltura-typescript-client/api/types/KalturaCuePointFilter";
import { KalturaCuePointType } from "kaltura-typescript-client/api/types/KalturaCuePointType";
import { UIManager } from "@playkit-js/playkit-js-ovp/pluginV7/uiManager";
import { AnalyticsEvents } from "@plugin/shared/analyticsEvents";
import { convertToCuepoints } from "@plugin/shared/cuepoints";

export class IVQPlugin extends KalturaPlayer.core.BasePlugin {
    static defaultConfig = {};

    private playerCompat = new PlayerCompat(this.player);
    private _root: any;
    private _uiManager: UIManager;
    private _kalturaClient: KalturaClient;

    static isValid(player: any) {
        return true;
    }

    constructor(name: any, player: any, config: any) {
        super(name, player, config);
        this._addBindings();

        this._uiManager = new UIManager(this, "ivq", this._renderRoot, "ivqOverlay");

        this._kalturaClient = new KalturaClient({
            clientTag: "playkit-js-ivq",
            endpointUrl: this.player.config.provider.env.serviceUrl
        });
    }

    destroy() {
        // TODO unlisten to events on destroy
    }

    reset() {
        // TODO cancel load request

        if (!this._root) {
            return;
        }

        render(
            // @ts-ignore
            h(null),
            this._rootParent,
            this._root
        );

        this._root = null;
    }

    private _getCurrentTime(): number {
        return this.player.currentTime * 1000;
    }

    private _pauseVideo() {
        this.player.pause();
    }

    private _sendAnalytics(event: AnalyticsEvents) {
        // TBD
    }

    private _loadCuePoints(callback: LoadCallback) {
        this._kalturaClient
            .request(
                new CuePointListAction({
                    filter: new KalturaCuePointFilter({
                        entryIdEqual: this.player.config.sources.id,
                        tagsLike: ""
                    })
                }).setRequestOptions({
                    ks: this.player.config.session.ks,
                    partnerId: this.player.config.session.partnerId,
                    acceptedTypes: []
                })
            )
            .then(
                response => {
                    if (!response) {
                        return;
                    }

                    const cuepoints = convertToCuepoints(response);

                    callback({ cuepoints });
                },
                reason => {
                    callback({
                        error: { message: reason.message || "failure" }
                    });
                }
            );
    }

    private _renderRoot = (): any => {
        const props: StageProps = {
            getCurrentTime: this._getCurrentTime.bind(this),
            loadCuePoints: this._loadCuePoints.bind(this),
            pauseVideo: this._pauseVideo.bind(this),
            sendAnalytics: this._sendAnalytics.bind(this)
        };

        return <Stage {...props} />;
    };

    private _addBindings() {
        this.eventManager.listenOnce(this.player, this.player.Event.FIRST_PLAY, () => {});
        this.eventManager.listen(this.player, this.player.Event.SEEKED, () => {});
        this.eventManager.listen(this.player, this.player.Event.TIME_UPDATE, () => {
            this._uiManager.root.notify({ type: NotifyEventTypes.TimeUpdated });
        });
        this.eventManager.listen(this.player, this.player.Event.RESIZE, () => {
            this._uiManager.root.handleResize();
        });
    }
}

KalturaPlayer.core.registerPlugin("ivq", IVQPlugin);
