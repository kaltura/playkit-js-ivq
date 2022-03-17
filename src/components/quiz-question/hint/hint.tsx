import {h} from 'preact';
import {useMemo, useCallback, useState} from 'preact/hooks';
import {QuizTranslates} from '../../../types';
import {icons} from '../../icons';
import * as styles from './hint.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {Icon} = KalturaPlayer.ui.components;

interface HintProps {
  hint?: string;
  explanation?: string;
  feedback?: string;
}

const translates = ({hint, explanation}: HintProps): QuizTranslates => {
  if (hint) {
    return {
      show: <Text id="ivq.show_hint">Show hint</Text>,
      hide: <Text id="ivq.hide_hint">Hide hint</Text>
    };
  } else if (explanation) {
    return {
      show: <Text id="ivq.show_why">Show why</Text>,
      hide: <Text id="ivq.hide_why">Hide why</Text>
    };
  }
  return {
    show: <Text id="ivq.show_feedback">Show feedback</Text>,
    hide: <Text id="ivq.hide_feedback">Hide feedback</Text>
  };
};

export const Hint = withText(translates)(({hint, explanation, feedback, ...translates}: HintProps & QuizTranslates) => {
  const [isOpen, setIsOpen] = useState(false);
  const getContent = useMemo(() => {
    if (hint) {
      return hint;
    } else if (explanation) {
      return explanation;
    } else if (feedback) {
      const feedbackArr = feedback.split('||');
      return feedbackArr[feedbackArr.length - 1];
    }
  }, [hint, explanation, feedback]);
  const handleClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);
  return (
    <div className={styles.hintWrapper}>
      <div role="button" tabIndex={0} className={styles.hintButton} onClick={handleClick}>
        {isOpen ? translates.hide : translates.show}
        <div className={[styles.iconWrapper, isOpen ? styles.active : ''].join(' ')}>
          <Icon
            id="ivq-down-icon"
            height={icons.SmallSize}
            width={icons.SmallSize}
            viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
            path={icons.DOWN}
          />
        </div>
        <div className={[styles.iconWrapper, !isOpen ? styles.active : ''].join(' ')}>
          <Icon
            id="ivq-right-icon"
            height={icons.SmallSize}
            width={icons.SmallSize}
            viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
            path={icons.RIGHT}
          />
        </div>
      </div>
      {isOpen && <div className={styles.hintContent}>{getContent}</div>}
    </div>
  );
});