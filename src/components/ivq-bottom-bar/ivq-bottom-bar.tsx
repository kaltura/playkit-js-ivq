import {h, VNode} from 'preact';
import {useMemo, useEffect, useState} from 'preact/hooks';
import {icons} from '../icons';
import {QuizTranslates} from '../../types';
import * as styles from './ivq-bottom-bar.scss';

const {SeekBarPlaybackContainer, Icon} = KalturaPlayer.ui.components;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

interface IvqBottomBarProps {
  onPrev?: () => void;
  onNext?: () => void;
  questionCounter: string | VNode<{}>;
}

const translates: QuizTranslates = {
  nextQuestionButtonAriaLabel: <Text id="ivq.next_question_area_label">Next Question</Text>,
  prevQuestionButtonAriaLabel: <Text id="ivq.prev_question_area_label">Previous Question</Text>
};

export const IvqBottomBar = withText(translates)(({onPrev, onNext, questionCounter, ...translates}: IvqBottomBarProps & QuizTranslates) => {
  const [ivqSeekBar, setIvqSeekBar] = useState<VNode<typeof SeekBarPlaybackContainer> | null>(null);

  useEffect(() => {
    // SeekBar for caulculation uses width of parent element,
    // so proper calculation happens only if parent element already mount
    setIvqSeekBar(<SeekBarPlaybackContainer />);
    return () => {
      setIvqSeekBar(null);
    };
  }, []);

  const renderIvqNavigation = useMemo(() => {
    return (
      <div className={styles.ivqNavigationWrapper}>
        <button
          disabled={!onPrev}
          onClick={onPrev}
          className={[styles.navigationButton, !onPrev ? styles.disabled : ''].join(' ')}
          aria-label={translates.prevQuestionButtonAriaLabel}>
          <Icon id="ivq-chevron-left" height={14} width={9} viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`} path={icons.CHEVRON_LEFT} />
        </button>
        <div className={styles.questionIndex}>{questionCounter}</div>
        <button
          disabled={!onNext}
          onClick={onNext}
          className={[styles.navigationButton, !onNext ? styles.disabled : ''].join(' ')}
          aria-label={translates.nextQuestionButtonAriaLabel}>
          <Icon id="ivq-chevron-right" height={14} width={9} viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`} path={icons.CHEVRON_RIGHT} />
        </button>
      </div>
    );
  }, [onNext, onPrev, questionCounter]);

  return (
    <div className={styles.ivqBottomBar}>
      {ivqSeekBar}
      {renderIvqNavigation}
    </div>
  );
});
