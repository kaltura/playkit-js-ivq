import {h} from 'preact';
import {useMemo, useCallback, useEffect, useState} from 'preact/hooks';
import {QuizQuestionUI} from '../../types';
import {TrueFalse} from './true-false';
import {MultiChoise} from './multi-choise';
import {KalturaQuizQuestionTypes, Selected, QuestionProps, QuizTranslates} from '../../types';
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

export const QuizQuestionWrapper = withText(translates)((props: QuizQuestionWrapperProps & QuizTranslates) => {
  const {qui} = props;
  const [selected, setSelected] = useState<Selected>(qui.a?.answerKey ? qui.a.answerKey : '');

  useEffect(() => {
    // TODO: hide player controls and seekbar
    return () => {
      // TODO: show player controls and seekbar
    };
  });

  const handleContinue = useCallback(() => {
    if (!selected.length) {
      return;
    }
    qui.onContinue(qui.a?.answerKey !== selected ? selected : null);
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

  const renderQuestion = useMemo(() => {
    const {question, optionalAnswers, hint} = qui.q;
    const questionProps: QuestionProps = {
      question,
      optionalAnswers,
      hint,
      onSelect,
      selected
    };
    switch (qui.q.questionType) {
      case KalturaQuizQuestionTypes.TrueFalse:
        return <TrueFalse {...questionProps} />;
      case KalturaQuizQuestionTypes.MultiChoise:
        return <MultiChoise {...questionProps} />;
    }
  }, [qui, selected]);

  return (
    <div className={styles.quizQuestionWrapper}>
      <div className={styles.questioContainer}>
        {renderQuestion}
        <div className={styles.buttonWrapper}>
          <button
            onClick={handleContinue}
            disabled={!selected.length}
            tabIndex={0}
            aria-label={props.continueButtonAriaLabel}
            className={[styles.ivqButton, styles.continueButton, !selected.length ? styles.disabled : ''].join(' ')}>
            {props.continueButton}
          </button>
          {qui.onSkip && (
            <button
              onClick={handleSkip}
              tabIndex={0}
              aria-label={props.skipButtonAriaLabel}
              className={[styles.ivqButton, styles.skipButton].join(' ')}>
              {props.skipButton}
            </button>
          )}
        </div>
      </div>
      <div className={styles.timeLineWrapper}>
        <div style={{height: '4px', width: '100%', background: 'white'}}>timeline placeholder</div>
      </div>
      <div className={styles.navigationWrapper}>
        {
          <button disabled={!qui.onPrev} onClick={qui.onPrev}>
            prev
          </button>
        }
        <div className={styles.questionIndex}>{props.questionCounter}</div>
        {
          <button disabled={!qui.onNext} onClick={qui.onNext}>
            next
          </button>
        }
      </div>
    </div>
  );
});
