import {A11yWrapper, OnClick} from '@playkit-js/common';
import {h} from 'preact';
import {icons} from '../icons';
import {QuizTranslates} from '../../types';
import * as styles from './ivq-pupup.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {Icon} = KalturaPlayer.ui.components;

export enum IvqPupupTypes {
  almostDone,
  submit,
  completed
}

export interface IvqPopupProps {
  type: IvqPupupTypes;
  onClose: () => void;
  onSubmit: OnClick;
  onReview: OnClick;
}

const translates = ({type}: IvqPopupProps): QuizTranslates => {
  const ivqTranslates = {
    closeButton: <Text id="ivq.close_button">Close</Text>,
    submitButton: <Text id="ivq.submit_button">Submit</Text>,
    submitButtonAriaLabel: <Text id="ivq.submit_button_area_label">Click to submit quiz</Text>,
    reviewButton: <Text id="ivq.review_button">Review</Text>,
    reviewButtonAriaLabel: <Text id="ivq.review_button_area_label">Click to review quiz</Text>
  };
  if (type === IvqPupupTypes.almostDone) {
    return {
      ...ivqTranslates,
      title: <Text id="ivq.almost_done">You’re Almost Done</Text>,
      description: (
        <Text id="ivq.almost_done_description">It appears that some questions remained unanswered. Please complete the quiz to submit.</Text>
      )
    };
  } else if (type === IvqPupupTypes.submit) {
    return {
      ...ivqTranslates,
      title: <Text id="ivq.quiz_completed_title">Quiz Completed</Text>,
      description: <Text id="ivq.quiz_submit_description">Take a moment to review your answers or go ahead to submit your answers.</Text>
    };
  } else {
    return {
      ...ivqTranslates,
      title: <Text id="ivq.quiz_completed">Quiz Completed</Text>,
      description: <Text id="ivq.quiz_completed_description">Watch the video until the end to submit.</Text>
    };
  }
};

export const IvqPopup = withText(translates)(({type, onClose, onSubmit, onReview, ...otherProps}: IvqPopupProps & QuizTranslates) => {
  const popupClasses = [styles.popupRoot];
  if (type === IvqPupupTypes.submit) {
    popupClasses.push(styles.submit);
  } else if (type === IvqPupupTypes.completed) {
    popupClasses.push(styles.completed);
  } else {
    popupClasses.push(styles.almostDone);
  }
  return (
    <div className={popupClasses.join(' ')} data-testid="ivqPopupRoot">
      <A11yWrapper onClick={onClose}>
        <div role="button" tabIndex={0} className={styles.closeButton} aria-label={otherProps.closeButton}>
          <Icon
            id="ivq-close"
            data-testid="closeIvqPopup"
            height={icons.MediumSize}
            width={icons.MediumSize}
            viewBox={`0 0 ${icons.MediumSize} ${icons.MediumSize}`}
            path={icons.CLOSE}
          />
        </div>
      </A11yWrapper>
      <div className={styles.title}>{otherProps.title}</div>
      <div className={styles.description}>{otherProps.description}</div>
      {type === IvqPupupTypes.submit && (
        <div className={styles.buttonsWrapper}>
          <A11yWrapper onClick={onReview}>
            <div role="button" tabIndex={0} className={styles.secondaryButton} aria-label={otherProps.reviewButtonAriaLabel}>
              {otherProps.reviewButton}
            </div>
          </A11yWrapper>
          <A11yWrapper onClick={onSubmit}>
            <div role="button" tabIndex={0} className={styles.primaryButton} aria-label={otherProps.submitButtonAriaLabel}>
              {otherProps.submitButton}
            </div>
          </A11yWrapper>
        </div>
      )}
    </div>
  );
});
