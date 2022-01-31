import {h} from 'preact';
import {QuestionProps, QuizTranslates} from '../../../types';
import * as styles from './open-question.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = (): QuizTranslates => {
  return {
    openQuestionPlaceHolder: <Text id="ivq.open_question_placeholder">Type your answer here...</Text>
  };
};

export const OpenQuestion = withText(translates)(({question, selected, onSelect, openQuestionPlaceHolder}: QuestionProps & QuizTranslates) => {
  return (
    <div className={styles.openQuestionWrapper}>
      <div className={styles.questionText}>{question}</div>
      <textarea
        className={styles.questionAnswer}
        value={selected}
        placeholder={openQuestionPlaceHolder as string}
        onChange={e => {
          // @ts-ignore
          onSelect(e.target.value);
        }}
      />
      <div>
        {
          // TODO: add char counter
        }
      </div>
    </div>
  );
});
