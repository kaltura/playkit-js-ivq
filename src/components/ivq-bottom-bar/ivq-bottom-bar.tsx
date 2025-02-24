import {h, VNode} from 'preact';
import {useMemo, useRef, useLayoutEffect} from 'preact/hooks';
import {A11yWrapper, OnClick} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import {icons} from '../icons';
import {QuizTranslates} from '../../types';
import * as styles from './ivq-bottom-bar.scss';

const {Icon} = KalturaPlayer.ui.components;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

interface IvqBottomBarProps {
  onPrev?: OnClick;
  onNext?: OnClick;
  questionCounter: string | VNode<{}>;
  getSeekBarNode: () => Element | null;
  updateHover: () => void;
}

const translates: QuizTranslates = {
  nextQuestionButtonAriaLabel: <Text id="ivq.next_question_area_label">Next Question</Text>,
  prevQuestionButtonAriaLabel: <Text id="ivq.prev_question_area_label">Previous Question</Text>
};

export const IvqBottomBar = withText(translates)(
  ({onPrev, onNext, questionCounter, getSeekBarNode, updateHover, ...otherProps}: IvqBottomBarProps & QuizTranslates) => {
    const ivqBottomBarRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      window.dispatchEvent(new Event('updateHover'));
      const seekBarNode = getSeekBarNode();
      if (ivqBottomBarRef.current && seekBarNode) {
        // inject player seek bar into IvqBottomBar component
        ivqBottomBarRef.current.prepend(seekBarNode);
      }
    }, []);

    const renderIvqNavigation = useMemo(() => {
      return (
        <div className={styles.ivqNavigationWrapper}>
          <A11yWrapper onClick={onPrev ? onPrev : () => {}}>
            <div
              tabIndex={0}
              disabled={!onPrev}
              aria-disabled={!onPrev}
              className={[styles.navigationButton, !onPrev ? styles.disabled : ''].join(' ')}
              aria-label={otherProps.prevQuestionButtonAriaLabel}>
              <Icon id="ivq-chevron-left" height={14} width={9} viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`} path={icons.CHEVRON_LEFT} />
            </div>
          </A11yWrapper>
          <div className={styles.questionIndex}>{questionCounter}</div>
          <A11yWrapper onClick={onNext ? onNext : () => {}}>
            <div
              tabIndex={0}
              disabled={!onNext}
              aria-disabled={!onNext}
              className={[styles.navigationButton, !onNext ? styles.disabled : ''].join(' ')}
              aria-label={otherProps.nextQuestionButtonAriaLabel}>
              <Icon id="ivq-chevron-right" height={14} width={9} viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`} path={icons.CHEVRON_RIGHT} />
            </div>
          </A11yWrapper>
        </div>
      );
    }, [onNext, onPrev, questionCounter]);

    return (
      <div className={styles.ivqBottomBar} ref={ivqBottomBarRef}>
        {renderIvqNavigation}
      </div>
    );
  }
);
