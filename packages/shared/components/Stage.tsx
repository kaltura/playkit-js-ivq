import { h, Component } from "preact";
import { AnalyticsEvents } from "../analyticsEvents";
import { Cuepoint } from "@plugin/shared/cuepoints";
import {
    KalturaListResponse,
    KalturaQuiz,
    KalturaCuePointListResponse,
    KalturaUserEntryListResponse,
    KalturaQuizUserEntry
} from "kaltura-typescript-client/api/types";

export type LoadCallback = (result: { error?: { message: string }; results?: any }) => void;

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
    loadAnswerCuepoints(userEntryId: number, callback: LoadCallback): void;
    addUserEntry(callback: LoadCallback): void;
    loadData(callback: LoadCallback): void;
    sendAnalytics(event: AnalyticsEvents): void;
    getCurrentTime(): number;
    pauseVideo(): void;
}

interface State {
    isLoading: boolean;
    hasError: boolean;
    cuepointsCount: number | null;
    quiz?: KalturaQuiz | undefined;
    quizUserEntry?: any;
    questionsCuepoints?: any[];
    answersCuepoints?: any[];
}

export default class Stage extends Component<Props, State> {
    initialState = {
        isLoading: true,
        hasError: false,
        cuepointsCount: null,
        quiz: undefined,
        quizUserEntry: null,
        questionsCuepoints: [],
        answersCuepoints: []
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

    handleResize = (): void => {};

    private reset = () => {
        this.setState(
            {
                ...this.initialState
            },
            () => {
                this.props.loadData(this._handleData.bind(this));
            }
        );
    };

    private _handleAddedUserEntry = (results: any) => {
        debugger;
    };

    private _handleAnswerCuepoints(results: any) {
        this.setState({ isLoading: false, answersCuepoints: results.results.objects });
    }

    private _handleData = (results: any) => {
        const { results: res } = results;

        // multirequest: [quiz-list,questionsCuepoints-list,userEntry-list]
        const quizData: KalturaQuiz = res[0].result;
        const quizCuepoints: KalturaCuePointListResponse = res[1].result;
        const quizUserEntries: KalturaUserEntryListResponse = res[2].result;

        this.setState({
            quiz: quizData,
            questionsCuepoints: quizCuepoints.objects,
            quizUserEntry: quizUserEntries.totalCount ? quizUserEntries.objects[0] : undefined
        });
        // check if there is a user entry. If not - we need to add one
        if (quizUserEntries.totalCount) {
            // found a previous userEntry - we can load answers cuepoint now
            const latestUserEntry: KalturaQuizUserEntry = quizUserEntries
                .objects[0] as KalturaQuizUserEntry;
            this.props.loadAnswerCuepoints(
                latestUserEntry.id,
                this._handleAnswerCuepoints.bind(this)
            );
        } else {
            // TODO - test later
            this.props.addUserEntry((results: any) => {
                this.props.loadAnswerCuepoints(results.id, this._handleAnswerCuepoints.bind(this));
            });
        }
    };

    render() {
        const { isLoading, hasError, cuepointsCount } = this.state;

        const style = {
            position: "absolute",
            display: "block",
            overflow: "visible",
            top: 0,
            left: 0,
            width: "100px",
            height: "100px"
        };

        return !isLoading ? (
            <div style={style}>
                <div
                    style="width:100%;height:100%;background:green;font-size:11px"
                    className="open-screen"
                >
                    OPEN SCREEN
                </div>
            </div>
        ) : (
            <div
                style="width:100%;height:100%;background:wheat;font-size:11px"
                className="open-screen"
            >
                LOADING
            </div>
        );
    }
}
