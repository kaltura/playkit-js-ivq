import {h} from 'preact';
import {QuestionProps} from '../../../types';
import * as styles from './reflection-point.scss';

export const ReflectionPoint = ({question}: QuestionProps) => {
  return (
    <div className={styles.reflectionPointWrapper} role="alert">
      <legend className={styles.reflectionText} data-testid="reflectionPointTitle">{question}</legend>
    </div>
  );
};
