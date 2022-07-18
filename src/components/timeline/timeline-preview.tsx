import {h} from 'preact';
import {useMemo} from 'preact/hooks';
import * as styles from './timeline-preview.scss';
import {icons} from '../icons';
import {ThumbnailInfo, KalturaQuizQuestionTypes, QuizTranslates} from '../../types';

const {Icon} = KalturaPlayer.ui.components;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates: QuizTranslates = {
  questionTranslate: <Text id="ivq.question">Question</Text>,
  reflectionPointTranslate: <Text id="ivq.reflection_point">Reflection Point</Text>
};

interface TimelinePreviewProps {
  onQuestionLinkClick: () => void;
  thumbnailInfo: ThumbnailInfo;
  questionBunch: Array<number>;
  questionType: KalturaQuizQuestionTypes;
}

const getFramePreviewImgContainerStyle = (thumbnailInfo: ThumbnailInfo) => {
  return thumbnailInfo ? {
    height: `${thumbnailInfo.height}px`,
    width: `${thumbnailInfo.width}px`
  } : {};
};
const getFramePreviewImgStyle = (thumbnailInfo: ThumbnailInfo) => {
  if (thumbnailInfo) {
    let framePreviewImgStyle = `height: 100%; width: 100%; background: url(${thumbnailInfo.url});`;
    framePreviewImgStyle += `background-position: -${thumbnailInfo.x}px -${thumbnailInfo.y}px;`;
    return framePreviewImgStyle;
  }
  return '';
};

export const TimelinePreview = withText(translates)(
  ({
    onQuestionLinkClick,
    thumbnailInfo,
    questionBunch,
    questionType,
    questionTranslate,
    reflectionPointTranslate
  }: TimelinePreviewProps & QuizTranslates) => {
    const title = useMemo(() => {
      const firstIndex = questionBunch[0] + 1;
      if (questionBunch.length > 1) {
        return {
          type: questionTranslate,
          firstIndex,
          lastIndex: `-${questionBunch[questionBunch.length - 1] + 1}`
        };
      } else {
        return {
          type: questionType === KalturaQuizQuestionTypes.Reflection ? reflectionPointTranslate : questionTranslate,
          firstIndex,
          lastIndex: ''
        };
      }
    }, [questionBunch]);
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Icon
            id="ivq-quiz-question"
            height={icons.SmallSize}
            width={icons.SmallSize}
            viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
            path={icons.QUIZ_ICON}
          />
          <span className={styles.title}>{`${title.type} ${title.firstIndex}${title.lastIndex}`}</span>
          <button className={styles.questionLink} onClick={onQuestionLinkClick}>
            <Icon id="ivq-question-link" height={18} width={18} viewBox={`0 0 ${18} ${18}`} path={icons.QUESTION_LINK} />
          </button>
        </div>
        <div style={getFramePreviewImgContainerStyle(thumbnailInfo)}>
          <div style={getFramePreviewImgStyle(thumbnailInfo)} />
        </div>
      </div>
    );
  }
);
