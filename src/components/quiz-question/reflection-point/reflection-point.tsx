import {h} from 'preact';
import {useEffect, useRef} from 'preact/hooks';
import {QuestionProps, QuizTranslates} from '../../../types';
import * as styles from './reflection-point.scss';
import {wrapLinksWithTags} from '../../../utils';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = (): QuizTranslates => {
  return {
    reflectionPoint: <Text id="ivq.reflection_point">Reflection Point</Text>,
    questionLabel: <Text id="ivq.question">Question</Text>
  };
};

export const ReflectionPoint = withText(translates)(({question, questionIndex, ...otherProps}: QuestionProps & QuizTranslates) => {

  return (
    <div className={styles.reflectionPointWrapper}>
      <legend className={styles.reflectionText} data-testid="reflectionPointTitle">
        <span className={styles.visuallyHidden}>{`${otherProps.questionLabel}# ${questionIndex}, ${otherProps.reflectionPoint}:`}</span>
        <div dangerouslySetInnerHTML={{ __html: wrapLinksWithTags(question) }} />
      </legend>
    </div>
  );
});
