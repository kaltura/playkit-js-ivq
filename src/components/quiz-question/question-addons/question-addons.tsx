import {h} from 'preact';
import {useMemo, useCallback, useState} from 'preact/hooks';
import {QuizTranslates} from '../../../types';
import {icons} from '../../icons';
import {A11yWrapper} from '../../a11y-wrapper';
import * as styles from './question-addons.scss';

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

export const QuestionAddons = withText(translates)(({hint, explanation, feedback, ...translates}: HintProps & QuizTranslates) => {
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
    <div className={styles.questionAddonsWrapper}>
      <A11yWrapper onClick={handleClick}>
        <div role="button" tabIndex={0} className={styles.questionAddonsButton}>
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
      </A11yWrapper>
      {isOpen && <div className={styles.questionAddonsContent}>{getContent}</div>}
    </div>
  );
});
