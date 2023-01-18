import {A11yWrapper, OnClick} from '@playkit-js/common';
import {useState, useCallback} from 'preact/hooks';
import {h} from 'preact';
import {icons} from '../icons';
import {QuizTranslates} from '../../types';
import {Spinner} from '../spinner';
import * as styles from './ivq-pupup.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {Icon} = KalturaPlayer.ui.components;

export enum IvqPupupTypes {
  almostDone,
  submit,
  completed,
  submitted
}

export interface IvqPopupProps {
  type: IvqPupupTypes;
  score: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onReview: OnClick;
}

const translates = ({type, score}: IvqPopupProps): QuizTranslates => {
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
      title: <Text id="ivq.quiz_almost_done_title">You’re almost done</Text>,
      description: (
        <Text id="ivq.quiz_almost_done_description">It appears that some questions remained unanswered. Please complete the quiz to submit.</Text>
      )
    };
  } else if (type === IvqPupupTypes.submit) {
    return {
      ...ivqTranslates,
      title: <Text id="ivq.submit_title">Quiz completed</Text>,
      description: <Text id="ivq.quiz_submit_description">Take a moment to review your answers or go ahead to submit your answers.</Text>
    };
  } else if (type === IvqPupupTypes.completed) {
    return {
      ...ivqTranslates,
      title: <Text id="ivq.submit_title">Quiz completed</Text>,
      description: <Text id="ivq.quiz_completed_description">Watch the video until the end to submit.</Text>
    };
  }
  return {
    ...ivqTranslates,
    title: <Text id="ivq.quiz_submitted_title">The quiz submitted.</Text>,
    description: (
      <Text
        id="ivq.quiz_score"
        fields={{
          quizScore: `${score}/100`
        }}>
        {`Your score is ${score}/100`}
      </Text>
    )
  };
};

export const IvqPopup = withText(translates)(({type, onClose, onSubmit, onReview, ...otherProps}: IvqPopupProps & QuizTranslates) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitClick = useCallback(() => {
    if (onSubmit) {
      setIsLoading(true);
      onSubmit().finally(() => {
        setIsLoading(false);
      });
    }
  }, []);

  const popupClasses = [styles.popupRoot];
  if (type === IvqPupupTypes.submit) {
    popupClasses.push(styles.submit);
  } else if (type === IvqPupupTypes.almostDone) {
    popupClasses.push(styles.almostDone);
  } else {
    popupClasses.push(styles.completed);
  }
  return (
    <div className={popupClasses.join(' ')} data-testid="ivqPopupRoot">
      <A11yWrapper onClick={onClose}>
        <div role="button" tabIndex={0} className={styles.closeButton} aria-label={otherProps.closeButton} data-testid="ivqPopupCloseButton">
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
      <div className={styles.title} data-testid="ivqPopupTitle">
        {otherProps.title}
      </div>
      <div className={styles.description} data-testid="ivqPopupDescription">
        {otherProps.description}
      </div>
      {type === IvqPupupTypes.submit && (
        <div className={styles.buttonsWrapper}>
          <A11yWrapper onClick={onReview}>
            <div
              role="button"
              tabIndex={0}
              className={styles.secondaryButton}
              aria-label={otherProps.reviewButtonAriaLabel}
              data-testid="ivqPopupReviewButton">
              {otherProps.reviewButton}
            </div>
          </A11yWrapper>
          <A11yWrapper onClick={handleSubmitClick}>
            <div
              role="button"
              tabIndex={0}
              className={styles.primaryButton}
              aria-label={otherProps.submitButtonAriaLabel}
              disabled={isLoading}
              data-testid="ivqPopupSubmitButton">
              {isLoading ? <Spinner /> : otherProps.submitButton}
            </div>
          </A11yWrapper>
        </div>
      )}
    </div>
  );
});
