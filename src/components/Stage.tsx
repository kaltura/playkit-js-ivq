import { h, Component } from "preact";

export interface Props {
    currentTime: number;
}

interface State {}

export default class Stage extends Component<Props, State> {
    initialState = {};

    state: State = {
        ...this.initialState
    };

    componentDidUpdate(
        previousProps: Readonly<Props>,
        previousState: Readonly<State>,
        previousContext: any
    ): void {}

    componentDidMount() {
        this.reset();
    }

    private reset = () => {
        this.setState({
            ...this.initialState
        });
    };

    formatSecondsAsTime(secs: number, format?: string) {
        let hr: any = Math.floor(secs / 3600);
        let min: any = Math.floor((secs - hr * 3600) / 60);
        let sec: any = Math.floor(secs - hr * 3600 - min * 60);

        if (hr < 10) {
            hr = "0" + hr;
        }
        if (min < 10) {
            min = "0" + min;
        }
        if (sec < 10) {
            sec = "0" + sec;
        }
        if (hr) {
            hr = "00";
        }

        if (format != null) {
            var formatted_time = format.replace("hh", hr);
            formatted_time = formatted_time.replace("h", hr * 1 + ""); // check for single hour formatting
            formatted_time = formatted_time.replace("mm", min);
            formatted_time = formatted_time.replace("m", min * 1 + ""); // check for single minute formatting
            formatted_time = formatted_time.replace("ss", sec);
            formatted_time = formatted_time.replace("s", sec * 1 + ""); // check for single second formatting
            return formatted_time;
        } else {
            return hr + ":" + min + ":" + sec;
        }
    }

    render() {
        const { currentTime } = this.props;
        const containerStyles = {
            position: "absolute",
            display: "table",
            boxSizing: "border-box",
            outline: "none",
            top: "calc(50% - 25px)",
            left: "calc(50% - 100px)",
            height: "50px",
            width: "200px"
        };

        const contentStyles = {
            position: "relative",
            width: "100%",
            height: "100%",
            appearance: "none",
            fontSize: "15px",
            border: "none",
            background: "darkblue",
            color: "white",
            display: "table-cell",
            verticalAlign: "middle",
            textAlign: "center",
            cursor: "pointer",
            wordBreak: "break-all",
            textRendering: "geometricPrecision"
        };

        const formattedTime = this.formatSecondsAsTime(currentTime / 1000);

        return (
            <div style={containerStyles}>
                <div style={contentStyles}>
                    <div>Hello Kalturians!</div>
                    <div>{formattedTime}</div>
                </div>
            </div>
        );
    }
}
