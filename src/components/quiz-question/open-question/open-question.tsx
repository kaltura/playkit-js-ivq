import {h} from 'preact';
import {useCallback, useEffect, useRef, useState} from 'preact/hooks';
import {debounce} from '@playkit-js/common/dist/utils-common';
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
    const lastAnnouncedCountRef = useRef<number>(-1);
    const charCountAnnouncerRef = useRef<any>(null);

    const handleChange = useCallback(
      (e: any) => {
        onSelect && onSelect(e.target.value);
      },
      [onSelect]
    );
    if (!charCountAnnouncerRef.current) {
      charCountAnnouncerRef.current = debounce((characterCount: number) => {
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
      }, 1500);
    }

    // Trigger debounced announcement when the answer text changes
    useEffect(() => {
      charCountAnnouncerRef.current?.(selected.length);
    }, [selected]);
    // Cancel pending announcement on unmount
    useEffect(() => {
      return () => {
        charCountAnnouncerRef.current?.cancel?.();
      };
    }, []);

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
