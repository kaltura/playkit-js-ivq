import {h} from 'preact';
import {useCallback, useEffect, useRef} from 'preact/hooks';
import {makeQuestionLabels, wrapLinksWithTags} from '../../../utils';
import {QuestionProps, QuizTranslates} from '../../../types';
import {QuestionAddons} from '../question-addons';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import * as styles from './multi-choice.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = (): QuizTranslates => {
  return {
    answerNumber: <Text id="ivq.answer_number">answer number</Text>,
    yourAnswer: <Text id="ivq.your_answer">Your answer</Text>,
    questionLabel: <Text id="ivq.question">Question</Text>
  };
};

interface MultiChoiceProps {
  multiAnswer?: boolean;
}

const questionLabels = makeQuestionLabels();

export const MultiChoice = withText(translates)(
  ({
    question,
    optionalAnswers,
    selected,
    onSelect,
    hint,
    multiAnswer,
    questionIndex,
    ...otherProps
  }: QuestionProps & MultiChoiceProps & QuizTranslates) => {
    const selectedArray = selected ? selected.split(',') : [];
    const disabled = !onSelect;
    const quizQuestionRef = useRef<HTMLLegendElement>(null);
    let answersOptionsRefMap: Map<number, HTMLElement | null> = new Map();

    useEffect(() => {
      if (!disabled) {
        quizQuestionRef.current?.focus();
      }
    }, [question]);

    useEffect(() => {
      return () => {
        answersOptionsRefMap = new Map();
      };
    }, []);

    const handleSelect = useCallback(
      (key: string, isActive: boolean) => (e: Event, byKeyboard?: boolean) => {
        let newAnswer = key;
        if (multiAnswer) {
          if (isActive) {
            newAnswer = selectedArray.filter(k => k !== key).toString();
          } else {
            newAnswer = [...selectedArray, key].toString();
          }
        }
        onSelect && onSelect(newAnswer, byKeyboard);
      },
      [onSelect, selectedArray]
    );

    const setAnswerOptionRef = (index: number, ref: HTMLElement | null) => {
      return answersOptionsRefMap.set(index, ref);
    };

    const getAnswerOptionRef = (index: number) => {
      return answersOptionsRefMap.get(index);
    };

    const handleUpKeyPressed = (currentIndex: number) => {
      getAnswerOptionRef(currentIndex - 1)?.focus();
    };

    const handleDownKeyPressed = (currentIndex: number) => {
      getAnswerOptionRef(currentIndex + 1)?.focus();
    };

    return (
      <div className={styles.multiChoiceWrapper} data-testid="multipleChoiceContainer">
        <legend className={styles.questionText} data-testid="multipleChoiceQuestionTitle" tabIndex={0} ref={quizQuestionRef}>
          <span className={styles.visuallyHidden}>{`${otherProps.questionLabel} #${questionIndex}:`}</span>
          <div dangerouslySetInnerHTML={{ __html: wrapLinksWithTags(question) }} />
        </legend>
        {hint && <QuestionAddons hint={hint} />}
        <div className={styles.optionalAnswersWrapper} data-testid="multipleChoiceAnswersWrapper">
          <div className={styles.optionalAnswersContainer} role="listbox" data-testid="multipleChoiceAnswersContainer">
            {optionalAnswers.map(({key, text}, index) => {
              const isActive = selectedArray.includes(key);
              return (
                <A11yWrapper
                  onClick={handleSelect(key, isActive)}
                  onUpKeyPressed={() => handleUpKeyPressed(index)}
                  onDownKeyPressed={() => handleDownKeyPressed(index)}
                  role="option">
                  <div
                    ref={node => {
                      setAnswerOptionRef(index, node);
                    }}
                    key={key}
                    tabIndex={0}
                    data-testid="multipleChoiceSelectAnswer"
                    aria-selected={isActive}
                    aria-disabled={disabled}
                    aria-multiselectable={Boolean(multiAnswer)}
                    aria-label={`${otherProps.answerNumber} ${index + 1}, ${text}${isActive ? `. ${otherProps.yourAnswer}` : ''}`}
                    className={[styles.multiSelectAnswer, isActive ? styles.active : '', disabled ? styles.disabled : ''].join(' ')}>
                    <div className={styles.questionLabel} data-testid="multipleChoiceQuestionLabel">
                      {questionLabels[index]}
                    </div>
                    <div className={styles.questionContent} data-testid="multipleChoiceQuestionContent">
                      {text}
                    </div>
                  </div>
                </A11yWrapper>
              );
            })}
          </div>
          <div />
        </div>
      </div>
    );
  }
);
