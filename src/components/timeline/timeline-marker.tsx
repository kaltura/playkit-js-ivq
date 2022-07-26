import {h} from 'preact';
import {useMemo} from 'preact/hooks';
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

export const TimelineMarker = withText(translates)(({isDisabled, onClick, ...otherProps}: TimelineMarkerProps & QuizTranslates) => {
  const hoverActive = useSelector((state: any) => state.seekbar.hoverActive);
  useSelector((state: any) => state.seekbar); // trigger update of marker component
  const disabled = isDisabled();
  const renderMarker = useMemo(() => {
    return (
      <A11yWrapper onClick={onClick}>
        <div
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
