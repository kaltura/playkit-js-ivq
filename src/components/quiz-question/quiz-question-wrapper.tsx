import {h} from 'preact';
import {useMemo, useCallback, useState, useEffect, useRef} from 'preact/hooks';
import {QuizQuestionUI} from '../../types';
import {TrueFalse} from './true-false';
import {MultiChoice} from './multi-choice';
import {ReflectionPoint} from './reflection-point';
import {OpenQuestion} from './open-question';
import {KalturaQuizQuestionTypes, Selected, QuestionProps, QuizTranslates} from '../../types';
import {IvqOverlay} from '../ivq-overlay';
import {Spinner} from '../spinner';
import {IvqBottomBar} from '../ivq-bottom-bar';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import * as styles from './quiz-question-wrapper.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {
  redux: {useSelector}
} = KalturaPlayer.ui;

interface QuizQuestionWrapperProps {
  qui: QuizQuestionUI;
  getSeekBarNode: Element | null;
  updatePlayerHover: () => void;
}

const translates = ({qui}: QuizQuestionWrapperProps): QuizTranslates => {
  return {
    continueButton: <Text id="ivq.continue_button">Continue</Text>,
    continueButtonAriaLabel: <Text id="ivq.continue_button_area_label">Continue quiz with the selected answer</Text>,
    skipButton: <Text id="ivq.skip_button">Skip</Text>,
    skipButtonAriaLabel: <Text id="ivq.skip_button_area_label">Skip for now</Text>,
    questionCounter: (
      <Text
        id="ivq.question_counter"
        fields={{
          current: qui.questionIndex[0],
          total: qui.questionIndex[1]
        }}>{`Question ${qui.questionIndex[0]} of ${qui.questionIndex[1]}`}</Text>
    )
  };
};

const getSelected = (qui: QuizQuestionUI): string => {
  if (qui.q.questionType === KalturaQuizQuestionTypes.Reflection) {
    // Reflection question type uses '1' as flag that question answered
    return '1';
  }
  if (qui.q.questionType === KalturaQuizQuestionTypes.OpenQuestion) {
    return qui.a?.openAnswer || '';
  }
  return qui.a?.answerKey || '';
};

export const QuizQuestionWrapper = withText(translates)((props: QuizQuestionWrapperProps & QuizTranslates) => {
  const {qui, getSeekBarNode, updatePlayerHover} = props;
  const [selected, setSelected] = useState<Selected>(getSelected(qui));
  const [isLoading, setIsLoading] = useState(false);
  const continueButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(getSelected(qui));
    setIsLoading(false);
    if (qui.a || qui.q.questionType === KalturaQuizQuestionTypes.Reflection) {
      continueButtonRef.current?.focus();
    }
  }, [qui]);

  const handleContinue = useCallback(() => {
    if (!selected) {
      return;
    }
    let newAnswer: string | null = selected;
    if (
      (qui.q.questionType === KalturaQuizQuestionTypes.Reflection && qui.a?.answerKey) ||
      (qui.q.questionType === KalturaQuizQuestionTypes.OpenQuestion && qui.a?.openAnswer === selected) ||
      ([KalturaQuizQuestionTypes.TrueFalse, KalturaQuizQuestionTypes.MultiAnswer, KalturaQuizQuestionTypes.MultiChoice].includes(
        qui.q.questionType
      ) &&
        qui.a?.answerKey === selected)
    ) {
      // for Reflection question type prevent send answer if answer already sent
      // for another types - prevent send the same answer
      newAnswer = null;
    }
    if (newAnswer) {
      setIsLoading(true);
    }
    qui.onContinue(newAnswer).finally(() => {
      setIsLoading(false);
    });
  }, [qui, selected]);

  const handleSkip = useCallback(() => {
    qui.onSkip!();
  }, [qui]);

  const onSelect = useCallback(
    (data: Selected, byKeyboard?: boolean) => {
      setSelected(data);
    },
    [selected, continueButtonRef]
  );

  const renderIvqQuestion = useMemo(() => {
    const {question, optionalAnswers, hint} = qui.q;
    const questionProps: QuestionProps = {
      question,
      questionIndex: qui.questionIndex[0],
      optionalAnswers,
      hint,
      selected
    };
    if (!(qui.disabled || isLoading)) {
      questionProps.onSelect = onSelect;
    }
    switch (qui.q.questionType) {
      case KalturaQuizQuestionTypes.TrueFalse:
        return <TrueFalse {...questionProps} />;
      case KalturaQuizQuestionTypes.MultiChoice:
        return <MultiChoice {...questionProps} />;
      case KalturaQuizQuestionTypes.Reflection:
        return <ReflectionPoint {...questionProps} />;
      case KalturaQuizQuestionTypes.OpenQuestion:
        return <OpenQuestion {...questionProps} />;
      case KalturaQuizQuestionTypes.MultiAnswer:
      default:
        return <MultiChoice {...questionProps} multiAnswer />;
    }
  }, [qui.q, selected, isLoading]);

  const renderIvqButtons = useMemo(() => {
    const continueDisabled = !selected.length;
    const continueButtonAriaLabel = qui.q.questionType === KalturaQuizQuestionTypes.Reflection ? props.continueButton : props.continueButtonAriaLabel;
    return (
      <div className={styles.ivqButtonsWrapper}>
        <A11yWrapper onClick={handleContinue}>
          <div
            tabIndex={0}
            ref={continueButtonRef}
            data-testid="continueButton"
            disabled={continueDisabled}
            aria-disabled={continueDisabled}
            aria-label={continueButtonAriaLabel}
            className={[styles.continueButton, continueDisabled ? styles.disabled : ''].join(' ')}>
            {isLoading ? <Spinner /> : props.continueButton}
          </div>
        </A11yWrapper>

        {qui.onSkip && (
          <A11yWrapper onClick={handleSkip}>
            <div
              tabIndex={0}
              data-testid="skipButton"
              aria-label={props.skipButtonAriaLabel}
              className={[styles.skipButton, isLoading ? styles.disabled : ''].join(' ')}
              disabled={isLoading}>
              {props.skipButton}
            </div>
          </A11yWrapper>
        )}
      </div>
    );
  }, [qui, selected, isLoading, continueButtonRef]);

  return (
    <IvqOverlay>
      <div className={['ivq', styles.ivqQuestionContainer].join(' ')} data-testid="ivqQuestionContainer">
        <div className={styles.ivqQuestionWrapper} data-testid="ivqQuestionWrapper">
          {renderIvqQuestion}
        </div>
        {renderIvqButtons}
      </div>
      <IvqBottomBar
        questionCounter={props.questionCounter}
        onPrev={qui.onPrev}
        onNext={qui.onNext}
        getSeekBarNode={getSeekBarNode}
        updatePlayerHover={updatePlayerHover}
      />
    </IvqOverlay>
  );
});
