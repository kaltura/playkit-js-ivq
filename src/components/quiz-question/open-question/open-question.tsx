import {h} from 'preact';
import {useCallback} from 'preact/hooks';
import {QuestionProps, QuizTranslates} from '../../../types';
import * as styles from './open-question.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const MAX_LENGTH = 250;

const translates = (): QuizTranslates => {
  return {
    openQuestionPlaceHolder: <Text id="ivq.open_question_placeholder">Type your answer here...</Text>
  };
};

export const OpenQuestion = withText(translates)(({question, selected, onSelect, openQuestionPlaceHolder}: QuestionProps & QuizTranslates) => {
  const handleChange = useCallback((e: any) => {
    onSelect(e.target.value);
  }, []);
  return (
    <div className={styles.openQuestionWrapper}>
      <div className={styles.questionText}>{question}</div>
      <div className={styles.textAreaWrapper}>
        <textarea
          className={styles.questionAnswer}
          value={selected}
          placeholder={openQuestionPlaceHolder as string}
          maxLength={MAX_LENGTH}
          onChange={handleChange}
        />
        <div className={styles.charCounter}>{`${selected.length}/${MAX_LENGTH}`}</div>
      </div>
    </div>
  );
});
