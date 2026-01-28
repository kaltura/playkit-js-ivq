import {h} from 'preact';
import {useCallback, useEffect, useRef, useState} from 'preact/hooks';
import {QuestionProps, QuizTranslates} from '../../../types';
import {QuestionAddons} from '../question-addons';
import * as styles from './open-question.scss';
import {wrapLinksWithTags} from '../../../utils';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const MAX_LENGTH = 250;

const translates = (): QuizTranslates => {
  return {
    openQuestionPlaceHolder: <Text id="ivq.open_question_placeholder">Type your answer here...</Text>,
    questionLabel: <Text id="ivq.question">Question</Text>,
    textAriaLabel: <Text id="ivq.textarea_aria_label">Open-ended quiz answer, maximum 250 characters.</Text>
  };
};

export const OpenQuestion = withText(translates)(
  ({question, selected, onSelect, hint, questionIndex, ...otherProps}: QuestionProps & QuizTranslates) => {
    const disabled = !onSelect;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [liveMessage, setLiveMessage] = useState<preact.ComponentChild>(null);
    const liveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastAnnouncedCountRef = useRef<number>(-1);

    const handleChange = useCallback(
      (e: any) => {
        onSelect && onSelect(e.target.value);
      },
      [onSelect]
    );

    useEffect(() => {
      if (!disabled) {
        textareaRef.current?.focus();
      }
    }, [question]);

    useEffect(() => {
      if (liveTimeoutRef.current) {
        clearTimeout(liveTimeoutRef.current);
      }

      const characterCount = selected.length;

      //setTimeout is used to avoid announcing on every keystroke
      //the message will be announced only if the user stops typing for 800ms
      liveTimeoutRef.current = setTimeout(() => {
        if (characterCount !== lastAnnouncedCountRef.current) {
          setLiveMessage(
            <Text
              id="ivq.open_question_char_count"
              fields={{
                count: characterCount,
                max: MAX_LENGTH,
              }}
            >
              {`${characterCount} of ${MAX_LENGTH} characters used`}
            </Text>
          );
          lastAnnouncedCountRef.current = characterCount;
        }
      }, 800);

      return () => {
        if (liveTimeoutRef.current) {
          clearTimeout(liveTimeoutRef.current);
        }
      };
    }, [selected]);

    return (
      <div className={styles.openQuestionWrapper} data-testid="openQuestionContainer">
        <legend className={styles.questionText} data-testid="openQuestionTitle">
          <span className={styles.visuallyHidden}>{`${otherProps.questionLabel} #${questionIndex}:`}</span>
          <div dangerouslySetInnerHTML={{__html: wrapLinksWithTags(question)}} />
        </legend>
        {hint && <QuestionAddons hint={hint} />}
        <div className={styles.textAreaWrapper}>
          <textarea
            tabIndex={0}
            className={styles.questionAnswer}
            value={selected}
            placeholder={otherProps.openQuestionPlaceHolder as string}
            aria-label={otherProps.textAriaLabel as string}
            maxLength={MAX_LENGTH}
            onChange={handleChange}
            disabled={disabled}
            data-testid="openQuestionAnswerInput"
            ref={textareaRef}
          />
          <div className={styles.charCounter} aria-hidden="true">{`${selected.length}/${MAX_LENGTH}`}</div>
          <span className={styles.visuallyHidden} role="status" aria-live="polite" aria-atomic="true">
            {liveMessage}
          </span>
        </div>
      </div>
    );
  }
);
