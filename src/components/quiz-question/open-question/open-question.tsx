import {h} from 'preact';
import {useCallback, useEffect, useRef} from 'preact/hooks';
import {QuestionProps, QuizTranslates} from '../../../types';
import {QuestionAddons} from '../question-addons';
import * as styles from './open-question.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const MAX_LENGTH = 250;

const translates = (): QuizTranslates => {
  return {
    openQuestionPlaceHolder: <Text id="ivq.open_question_placeholder">Type your answer here...</Text>,
    questionLabel: <Text id="ivq.question">Question</Text>
  };
};

export const OpenQuestion = withText(translates)(
  ({question, selected, onSelect, hint, questionIndex, ...otherProps}: QuestionProps & QuizTranslates) => {
    const disabled = !onSelect;

    const handleChange = useCallback(
      (e: any) => {
        onSelect && onSelect(e.target.value);
      },
      [onSelect]
    );

    const quizQuestionRef = useRef<HTMLLegendElement>(null);
    useEffect(() => {
      if (!disabled) {
        quizQuestionRef.current?.focus();
      }
    }, [question]);

    return (
      <div className={styles.openQuestionWrapper} data-testid="openQuestionContainer">
        <legend className={styles.questionText} data-testid="openQuestionTitle" tabIndex={0} ref={quizQuestionRef}>
          <span className={styles.visuallyHidden}>{`${otherProps.questionLabel} #${questionIndex}:`}</span>
          {question}
        </legend>
        {hint && <QuestionAddons hint={hint} />}
        <div className={styles.textAreaWrapper}>
          <textarea
            tabIndex={0}
            className={styles.questionAnswer}
            value={selected}
            placeholder={otherProps.openQuestionPlaceHolder as string}
            aria-label={otherProps.openQuestionPlaceHolder as string}
            maxLength={MAX_LENGTH}
            onChange={handleChange}
            disabled={disabled}
            data-testid="openQuestionAnswerInput"
          />
          <div className={styles.charCounter}>{`${selected.length}/${MAX_LENGTH}`}</div>
        </div>
      </div>
    );
  }
);
