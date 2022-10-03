import {h} from 'preact';
import {useMemo, useCallback} from 'preact/hooks';
import * as styles from './timeline-marker.scss';
import {QuizTranslates, TimelineMarkerProps} from '../../types';
import {A11yWrapper} from '../a11y-wrapper';
const {withText, Text} = KalturaPlayer.ui.preacti18n;

const {
  redux: {useSelector}
} = KalturaPlayer.ui;

const translates = ({questionIndex}: TimelineMarkerProps): QuizTranslates => {
  const index = questionIndex + 1;
  return {
    markerAriaLabel: (
      <Text
        id="ivq.marker_area_label"
        fields={{
          questionIndex: index
        }}>{`Jump to Question ${index}`}</Text>
    )
  };
};

export const TimelineMarker = withText(translates)(({isDisabled, onClick, getSeekBarNode, ...otherProps}: TimelineMarkerProps & QuizTranslates) => {
  const hoverActive = useSelector((state: any) => state.seekbar.hoverActive);
  useSelector((state: any) => state.seekbar); // trigger update of marker component
  const handleFocus = useCallback(() => {
    const seekBarNode = getSeekBarNode();
    if (seekBarNode) {
      // change slider valuetext attribute to force screen-reader read question marker
      // once playback continue - valuetext changed by seekbar component to playback-time value
      seekBarNode.setAttribute('aria-valuetext', otherProps.markerAriaLabel as string);
    }
  }, []);
  const disabled = isDisabled();
  const renderMarker = useMemo(() => {
    return (
      <A11yWrapper onClick={onClick}>
        <div
          onFocus={handleFocus}
          role="button"
          title={otherProps.markerAriaLabel as string}
          tabIndex={disabled ? -1 : 0}
          data-testid="cuePointContainer"
          className={`${styles.markerWrapper} ${hoverActive ? styles.hover : ''}`}>
          <div className={`${styles.marker}`} />
        </div>
      </A11yWrapper>
    );
  }, [disabled, hoverActive]);

  return renderMarker;
});
