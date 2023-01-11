import {h} from 'preact';
import * as styles from './spinner.scss';
interface SpinnerProps {
  height: string;
  width: string;
}
export const Spinner = (props: SpinnerProps) => (
  <div style={{height: props.height, width: props.width}} className={styles.ivqLoader} data-testid="ivqSpinner" />
);
Spinner.defaultProps = {
  height: '22px',
  width: '22px'
};
