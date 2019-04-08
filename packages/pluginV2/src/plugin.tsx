import { h, render } from "preact";
import Stage, {
    LoadCallback,
    NotifyEventTypes,
    Props as StageProps
} from "@plugin/shared/components/Stage";
import { log, enableLogIfNeeded } from "@playkit-js/playkit-js-ovp/logger";
import { convertToCuepoints } from "@plugin/shared/cuepoints";
import { AnalyticsEvents } from "@plugin/shared/analyticsEvents";


(function(mw, $) {
    enableLogIfNeeded("ivq");

    function isIpad() {
        return navigator.userAgent.indexOf("iPad") != -1;
    }

    function isIphone() {
        return navigator.userAgent.indexOf("iPhone") != -1 && !isIpad();
    }

    mw.kalturaPluginWrapper(function() {
        mw.PluginManager.add(
            "ivq",
            mw.KBaseComponent.extend({
                _root: null,
                _videoSize: null,
                _wasPlayed: false,
                stage: null,
                defaultConfig: {
                    parent: "videoHolder",
                    order: 1
                },

                setup: function() {
                    // if (isIphone()) {
                    //     log("log", "plugin::setup", "iphone detected, disable plugin");
                    //     return;
                    // }

                    this.addBindings();
                },

                sendAnalytics: function(event: AnalyticsEvents) {
                    // TBD
                },

                pauseVideo: function() {
                    this.getPlayer().sendNotification("doPause");
                },

                loadCuePoints: function(callback: LoadCallback) {
                    // do the api request
                    this.getKalturaClient().doRequest(
                        {
                            service: "cuepoint_cuepoint",
                            action: "list",
                            "filter:entryIdEqual": this.getPlayer().kentryid,
                            "filter:objectType": "KalturaCuePointFilter",
                            "filter:cuePointTypeEqual": "annotation.Annotation",
                            "filter:tagsLike": ""
                        },
                        function(data: any) {
                            // if an error pop out:
                            const hasError = !data || data.code;

                            if (hasError) {
                                callback({
                                    error: { message: data.code || "failure" }
                                });
                            } else {
                                const cuepoints = convertToCuepoints(data);
                                callback({ cuepoints });
                            }
                        }
                    );
                },

                addBindings: function() {
                    this.bind("playerReady", () => {
                        const props: StageProps = {
                            getCurrentTime: this._getCurrentTime.bind(this),
                            loadCuePoints: this.loadCuePoints.bind(this),
                            pauseVideo: this.pauseVideo.bind(this),
                            sendAnalytics: this.sendAnalytics.bind(this)
                        };

                        const parentElement = jQuery('[id="ivqOverlay"]')[0];

                        this._root = render(
                            <Stage {...props} ref={(ref: any) => (this.stage = ref)} />,
                            parentElement
                        );

                        log("debug", "plugin::bind(playerReady)", "created root component", {
                            parentElement,
                            root: this._root
                        });
                    });

                    this.bind("updateLayout", () => {
                        log("debug", "plugin::bind(updateLayout)", "invoked");
                        this.stage.handleResize();
                    });

                    this.bind("firstPlay", () => {
                        log("debug", "plugin::bind(firstPlay)", "invoked");

                        if (!this._wasPlayed) {
                            this._wasPlayed = true;
                        }
                    });

                    this.bind("seeked", () => {
                        log("debug", "plugin::bind(seeked)", "invoked");

                        if (!this._wasPlayed) {
                            this._wasPlayed = true;
                        }
                    });

                    this.bind("onChangeMedia", () => {
                        log("debug", "plugin::bind(onChangeMedia)", "invoked");

                        // DEVELOPER NOTICE: this is the destruction place.
                        this._wasPlayed = false;
                        this._videoSize = null;

                        const parentElement = jQuery('[id="ivqOverlay"]')[0];

                        render(
                            // @ts-ignore
                            h(null),
                            parentElement,
                            this._root
                        );

                        this._root = null;
                        this.stage = null;
                    });

                    this.bind("monitorEvent", () => {
                        this.stage.notify({ type: NotifyEventTypes.Monitor });
                    });

                    this.bind("mediaLoaded", () => {
                    });

                    this.bind("seeked", () => {
                        this.stage.notify({ type: NotifyEventTypes.Monitor });
                    });
                },

                _getCurrentTime() {
                    return this.getPlayer().currentTime * 1000;
                },

                getComponent: function() {
                    if (!this.$el) {
                        this.$el = jQuery("<div></div>")
                            .attr("id", "ivqOverlay")
                            .css({
                                position: "absolute",
                                height: "0",
                                width: "0",
                                top: 0,
                                left: 0,
                                overflow: "visible"
                            });
                    }

                    return this.$el;
                }
            })
        );
    });
})((window as any).mw, (window as any).jQuery);
