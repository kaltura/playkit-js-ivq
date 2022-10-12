import {h} from 'preact';
import {QuestionProps} from '../../../types';
import * as styles from './reflection-point.scss';

export const ReflectionPoint = ({question}: QuestionProps) => {
  return (
    <div className={styles.reflectionPointWrapper}>
      <legend className={styles.reflectionText} data-testid="reflectionPointTitle" tabIndex={0} role="text">{question}</legend>
    </div>
  );
};
