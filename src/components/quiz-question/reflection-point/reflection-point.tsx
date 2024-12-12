import {h, RefObject} from 'preact';
import {useEffect, useRef} from 'preact/hooks';
import {QuestionProps, QuizTranslates} from '../../../types';
import * as styles from './reflection-point.scss';
import {wrapLinksWithTags} from '../../../utils';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

interface reflectionPointProps {
  continueButton: RefObject<HTMLDivElement>;
}

const translates = (): QuizTranslates => {
  return {
    reflectionPoint: <Text id="ivq.reflection_point">Reflection Point</Text>,
    questionLabel: <Text id="ivq.question">Question</Text>
  };
};

export const ReflectionPoint = withText(translates)(({question, questionIndex, ...otherProps}: QuestionProps & QuizTranslates & reflectionPointProps) => {
  const quizQuestionRef = useRef<HTMLLegendElement>(null);
  useEffect(() => {
    otherProps.continueButton.current?.focus();
  }, [question]);

  return (
    <div className={styles.reflectionPointWrapper}>
      <legend className={styles.reflectionText} data-testid="reflectionPointTitle" ref={quizQuestionRef}>
        <span className={styles.visuallyHidden}>{`${otherProps.questionLabel}# ${questionIndex}, ${otherProps.reflectionPoint}:`}</span>
        <div dangerouslySetInnerHTML={{ __html: wrapLinksWithTags(question) }} />
      </legend>
    </div>
  );
});
