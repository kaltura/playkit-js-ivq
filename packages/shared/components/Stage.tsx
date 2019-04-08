import { h, Component } from "preact";
import { AnalyticsEvents } from "../analyticsEvents";
import { Cuepoint } from "@plugin/shared/cuepoints";

export type LoadCallback = (result: {
    error?: { message: string };
    cuepoints?: Cuepoint[];
}) => void;

export enum NotifyEventTypes {
    Monitor = "monitor",
    Seeked = "seeked",
    TimeUpdated = "timeUpdated"
}

interface TimeUpdatedEvent {
    type: NotifyEventTypes.TimeUpdated;
}
interface SeekedEvent {
    type: NotifyEventTypes.Seeked;
}

interface MonitorEvent {
    type: NotifyEventTypes.Monitor;
}

type NotifyEvents = SeekedEvent | MonitorEvent | TimeUpdatedEvent;

export interface Props {
    loadCuePoints(callback: LoadCallback): void;
    sendAnalytics(event: AnalyticsEvents): void;
    getCurrentTime(): number;
    pauseVideo(): void;
}

interface State {
    isLoading: boolean;
    hasError: boolean;
    cuepointsCount: number | null; // for demonstration only - can be removed
}

export default class Stage extends Component<Props, State> {

    initialState = {
        isLoading: true,
        hasError: false,
        cuepointsCount: null
    };

    state: State = {
        ...this.initialState
    };


    notify = (event: NotifyEvents) => {
        switch (event.type) {
            case NotifyEventTypes.Monitor:
            case NotifyEventTypes.Seeked:
            case NotifyEventTypes.TimeUpdated:
                break;
            default:
                break;
        }
    };

    componentDidMount() {
        this.reset();
    }

    handleResize = (): void => {
    };

    private reset = () => {
        this.setState(
            {
                ...this.initialState
            },
            () => {
                this.props.loadCuePoints(this._handleCuepoints);
            }
        );
    };

    private _handleCuepoints = (result: {
        error?: { message: string };
        cuepoints?: Cuepoint[];
    }) => {
        const { cuepoints, error } = result;

        if (error || !cuepoints) {
            console.log('error', 'Stage::_handleCuepoints', 'failed to load cuepoints', { error: error ? error.message : 'missing cuepoints array' });
            this.setState({
                isLoading: false,
                hasError: true
            });
            return;
        }

        this.setState(
            {
                isLoading: false,
                hasError: false,
                cuepointsCount: cuepoints.length
            },
            () => {

            }
        );
    };

    render() {
        const { isLoading, hasError, cuepointsCount } = this.state;

        const style = {
            position: "absolute",
            display: "block",
            overflow: "visible",
            top: 0,
            left: 0,
            width: 0,
            height: 0
        };

        return <div style={style}>
            <div style="background:papayawhip;font-size:12px;width:200px;height:50px;color:black">
                {isLoading ? <div>loading</div> : null}
                {hasError ? <div>failed to get cuepoints</div> : null}
                {cuepointsCount ? <div>Got {cuepointsCount} cuepoints</div> : null}
            </div>
        </div>;
    }
}
