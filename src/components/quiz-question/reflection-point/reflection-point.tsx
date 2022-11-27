import {h} from 'preact';
import {useEffect, useRef} from 'preact/hooks';
import {QuestionProps, QuizTranslates} from '../../../types';
import * as styles from './reflection-point.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = (): QuizTranslates => {
  return {
    reflectionPoint: <Text id="ivq.reflection_point">Reflection Point</Text>
  };
};

export const ReflectionPoint = withText(translates)(({question, reflectionPoint}: QuestionProps & QuizTranslates) => {
  const quizQuestionRef = useRef<HTMLLegendElement>(null);
  useEffect(() => {
    quizQuestionRef.current?.focus();
  }, [question]);

  return (
    <div className={styles.reflectionPointWrapper}>
      <legend
        className={styles.reflectionText}
        data-testid="reflectionPointTitle"
        tabIndex={0}
        role="text"
        ref={quizQuestionRef}
        aria-label={`${reflectionPoint} ${question}`}>
        {question}
      </legend>
    </div>
  );
});
