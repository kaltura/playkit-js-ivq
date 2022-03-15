import {h} from 'preact';
import {useMemo, useCallback, useState} from 'preact/hooks';
import {QuizQuestionUI} from '../../types';
import {TrueFalse} from './true-false';
import {MultiChoice} from './multi-choice';
import {ReflectionPoint} from './reflection-point';
import {OpenQuestion} from './open-question';
import {KalturaQuizQuestionTypes, Selected, QuestionProps, QuizTranslates} from '../../types';
import {IvqOverlay} from '../ivq-overlay';
import {Spinner} from '../spinner';
import {IvqBottomBar} from '../ivq-bottom-bar';
import * as styles from './quiz-question-wrapper.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

interface QuizQuestionWrapperProps {
  qui: QuizQuestionUI;
}

const translates = ({qui}: QuizQuestionWrapperProps): QuizTranslates => {
  return {
    continueButton: <Text id="ivq.continue_button">Continue</Text>,
    continueButtonAriaLabel: <Text id="ivq.continue_button_area_label">Click to continue</Text>,
    skipButton: <Text id="ivq.skip_button">Skip</Text>,
    skipButtonAriaLabel: <Text id="ivq.skip_button_area_label">Click to skip</Text>,
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
  const {qui} = props;
  const [selected, setSelected] = useState<Selected>(getSelected(qui));
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    qui.onContinue(newAnswer).finally(() => {
      setIsLoading(false);
    });
  }, [qui, selected]);

  const handleSkip = useCallback(() => {
    qui.onSkip!();
  }, [qui]);

  const onSelect = useCallback(
    (data: Selected) => {
      setSelected(data);
    },
    [setSelected]
  );

  const renderIvqQuestion = useMemo(() => {
    const {question, optionalAnswers, hint} = qui.q;
    const questionProps: QuestionProps = {
      question,
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
        return <MultiChoice {...questionProps} multiAnswer />;
    }
  }, [qui, selected, isLoading]);

  const renderIvqButtons = useMemo(() => {
    const continueDisabled = !selected.length;
    return (
      <div className={styles.ivqButtonsWrapper}>
        <button
          onClick={handleContinue}
          disabled={continueDisabled}
          aria-label={props.continueButtonAriaLabel}
          className={[styles.continueButton, continueDisabled ? styles.disabled : ''].join(' ')}>
          {isLoading ? <Spinner /> : props.continueButton}
        </button>
        {qui.onSkip && (
          <button
            onClick={handleSkip}
            aria-label={props.skipButtonAriaLabel}
            className={[styles.skipButton, isLoading ? styles.disabled : ''].join(' ')}
            disabled={isLoading}>
            {props.skipButton}
          </button>
        )}
      </div>
    );
  }, [qui, selected, isLoading]);

  return (
    <IvqOverlay>
      <div className={styles.ivqQuestionContainer}>
        <div className={styles.ivqQuestionWrapper}>{renderIvqQuestion}</div>
        {renderIvqButtons}
      </div>
      <IvqBottomBar questionCounter={props.questionCounter} onPrev={qui.onPrev} onNext={qui.onNext} />
    </IvqOverlay>
  );
});
