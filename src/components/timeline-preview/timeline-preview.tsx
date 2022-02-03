import {h} from 'preact';
import * as style from './timeline-preview.scss';
import {icons} from '../icons';
const {
  redux: {useSelector}
} = KalturaPlayer.ui;
const {Icon} = KalturaPlayer.ui.components;

export const TimelinePreview = (props: any) => {
  const thumbnailInfo = props.player.getThumbnail(props.defaultPreviewProps.virtualTime);
  const getFramePreviewImgContainerStyle = (thumbnailInfo: any): any => {
    return {
      height: `${thumbnailInfo.height}px`,
      width: `${thumbnailInfo.width}px`
    };
  };
  const getFramePreviewImgStyle = (thumbnailInfo: any): string => {
    let framePreviewImgStyle = `height: 100%; width: 100%; background: url(${thumbnailInfo.url});`;
    framePreviewImgStyle += `background-position: -${thumbnailInfo.x}px -${thumbnailInfo.y}px;`;
    return framePreviewImgStyle;
  };
  return (
    <div className={style.container}>
      <div className={style.header}>
        <Icon
          className={style.icon}
          id="ivq-quiz-question"
          height={icons.SmallSize}
          width={icons.SmallSize}
          viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
          path={icons.QUIZ_ICON}
        />
        Header
      </div>
      <div style={getFramePreviewImgContainerStyle(thumbnailInfo)}>
        <div style={getFramePreviewImgStyle(thumbnailInfo)} />
      </div>
    </div>
  );
};

export const TimelineMarker = (props: any) => {
  const hoverActive = useSelector((state: any) => state.seekbar.hoverActive);
  return <div className={`${style.marker} ${hoverActive ? style.hover : ''}`}></div>;
};
