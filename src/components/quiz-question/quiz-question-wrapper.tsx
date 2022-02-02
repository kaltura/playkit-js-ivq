import {h} from 'preact';
import {useMemo, useCallback, useEffect, useState} from 'preact/hooks';
import {QuizQuestionUI} from '../../types';
import {TrueFalse} from './true-false';
import {MultiChoice} from './multi-choice';
import {ReflectionPoint} from './reflection-point';
import {OpenQuestion} from './open-question';
import {KalturaQuizQuestionTypes, Selected, QuestionProps, QuizTranslates} from '../../types';
import {icons} from '../icons';
import * as styles from './quiz-question-wrapper.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {Overlay, SeekBarPlaybackContainer, Icon} = KalturaPlayer.ui.components;

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
    qui.onContinue(newAnswer);
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
      onSelect,
      selected
    };
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
  }, [qui, selected]);

  const renderIvqButtons = useMemo(() => {
    const disabled = !selected.length;
    return (
      <div className={styles.ivqButtonsWrapper}>
        <button
          onClick={handleContinue}
          disabled={disabled}
          tabIndex={0}
          aria-label={props.continueButtonAriaLabel}
          className={[styles.continueButton, disabled ? styles.disabled : ''].join(' ')}>
          {props.continueButton}
        </button>
        {qui.onSkip && (
          <button onClick={handleSkip} tabIndex={0} aria-label={props.skipButtonAriaLabel} className={styles.skipButton}>
            {props.skipButton}
          </button>
        )}
      </div>
    );
  }, [qui, selected]);

  const renderIvqSeekBar = useMemo(() => {
    const seekBarContainer = document.getElementsByClassName('playkit-gui-area')[0];
    return <SeekBarPlaybackContainer playerContainer={seekBarContainer} />;
  }, []);

  const renderIvqNavigation = useMemo(() => {
    return (
      <div className={styles.ivqNavigationWrapper}>
        <button disabled={!qui.onPrev} onClick={qui.onPrev} className={[styles.navigationButton, !qui.onPrev ? styles.disabled : ''].join(' ')}>
          <Icon id="ivq-chevron-left" height={14} width={9} viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`} path={icons.CHEVRON_LEFT} />
        </button>
        <div className={styles.questionIndex}>{props.questionCounter}</div>
        <button disabled={!qui.onNext} onClick={qui.onNext} className={[styles.navigationButton, !qui.onNext ? styles.disabled : ''].join(' ')}>
          <Icon id="ivq-chevron-right" height={14} width={9} viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`} path={icons.CHEVRON_RIGHT} />
        </button>
      </div>
    );
  }, [qui]);

  return (
    <Overlay open permanent>
      <div className={styles.ivqQuestionContainer}>
        {renderIvqQuestion}
        {renderIvqButtons}
      </div>
      <div className={['playkit-bottom-bar', styles.ivqBottomBar, styles.ivqSeekBarWrapper].join(' ')}>
        {renderIvqSeekBar}
        {renderIvqNavigation}
      </div>
    </Overlay>
  );
});
