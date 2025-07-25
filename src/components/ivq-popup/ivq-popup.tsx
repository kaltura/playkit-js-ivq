import {A11yWrapper, OnClick} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import {Button, ButtonSize, ButtonType} from '@playkit-js/common/dist/components/button';
import {useState, useCallback, useEffect} from 'preact/hooks';
import {Fragment, h} from 'preact';
import {icons} from '../icons';
import {QuizTranslates} from '../../types';
import * as styles from './ivq-pupup.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {Icon} = KalturaPlayer.ui.components;

export enum IvqPopupTypes {
  none,
  almostDone,
  submit,
  completed,
  submitted
}

export interface IvqPopupProps {
  type: IvqPopupTypes;
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
  if (type === IvqPopupTypes.almostDone) {
    return {
      ...ivqTranslates,
      title: <Text id="ivq.quiz_almost_done_title">You’re almost done</Text>,
      description: (
        <Text id="ivq.quiz_almost_done_description">It appears that some questions remained unanswered You must answer all questions before you can submit</Text>
      )
    };
  } else if (type === IvqPopupTypes.submit) {
    return {
      ...ivqTranslates,
      title: <Text id="ivq.submit_title">Quiz completed</Text>,
      description: <Text id="ivq.quiz_submit_description">Take a moment to review your answers or go ahead to submit your answers.</Text>
    };
  } else if (type === IvqPopupTypes.completed) {
    return {
      ...ivqTranslates,
      title: <Text id="ivq.submit_title">Quiz completed</Text>,
      description: <Text id="ivq.quiz_completed_description">Watch the video until the end to submit.</Text>
    };
  }
  return {
    ...ivqTranslates,
    title: <Text id="ivq.quiz_submitted_title">Quiz submitted</Text>,
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
  const [liveMessage, setLiveMessage] = useState('');

  useEffect(() => {    
    if (type !== IvqPopupTypes.none) {
      const msg = `${otherProps.title} ${otherProps.description}`;
      setLiveMessage(msg);      
    } else {
      setLiveMessage('');
    }
  }, [type]);

  const handleSubmitClick = useCallback(() => {
    if (onSubmit) {
      setIsLoading(true);
      onSubmit().finally(() => {
        setIsLoading(false);
      });
    }
  }, []);

  const popupClasses = [styles.popupRoot];
  if (type === IvqPopupTypes.submit) {
    popupClasses.push(styles.submit);
  } else if (type === IvqPopupTypes.almostDone) {
    popupClasses.push(styles.almostDone);
  } else {
    popupClasses.push(styles.completed);
  }
  return (
    <Fragment>
      <div
        role='alert'
        aria-live="assertive"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          padding: 0,
          overflow: 'hidden',
          border: 0,
          whiteSpace: 'nowrap'
        }}
      >
        {liveMessage}
      </div>
      <div
        className={popupClasses.join(' ')}
        data-testid="ivqPopupRoot"
        role="dialog"
        aria-modal="false"
        aria-label={`${otherProps.title} ${otherProps.description}`}
      >
        <A11yWrapper onClick={onClose}>
          <div tabIndex={0} className={styles.closeButton} aria-label={otherProps.closeButton} data-testid="ivqPopupCloseButton">
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
        {type === IvqPopupTypes.submit && (
          <div className={styles.buttonsWrapper}>
            <Button
              onClick={onReview}
              type={ButtonType.secondary}
              size={ButtonSize.medium}
              ariaLabel={otherProps.reviewButtonAriaLabel as string}
              testId="ivqPopupReviewButton"
              className={styles.ivqPopupButtons}>
              {otherProps.reviewButton}
            </Button>
            <Button
              onClick={handleSubmitClick}
              type={ButtonType.primary}
              size={ButtonSize.medium}
              testId="ivqPopupSubmitButton"
              ariaLabel={otherProps.submitButtonAriaLabel as string}
              loading={isLoading}
              className={[styles.ivqPopupButtons, styles.primaryButton].join(' ')}>
              {otherProps.submitButton}
            </Button>
          </div>
        )}
      </div>
    </Fragment>
  );
});
