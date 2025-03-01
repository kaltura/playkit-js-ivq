import {h} from 'preact';
import {useCallback, useState, useMemo} from 'preact/hooks';
import {QuizQuestion} from '../../types';
import {IvqOverlay} from '../ivq-overlay';
import {QuestionReview, ReviewQuestion} from './question-review';
import {QuestionListReview} from './question-list-review';

export interface QuizReviewProps {
  preparePlayer: (qq: QuizQuestion, manualChange: boolean, showQuestion: false) => void;
  reviewDetails: Array<QuizQuestion>;
  onRetake?: () => Promise<void>;
  score: string;
  onClose: () => void;
  showAnswers: boolean;
  showScores: boolean;
  getSeekBarNode: () => Element | null;
  restoreSeekBar: () => void;
  updatePlayerHover: () => void;
}

export const QuizReview = ({
  reviewDetails,
  preparePlayer,
  getSeekBarNode,
  restoreSeekBar,
  updatePlayerHover,
  ...questionListReviewProps
}: QuizReviewProps) => {
  const [reviewQuestion, setReviewQuestion] = useState<ReviewQuestion | null>(null);

  const handleQuestionClick = useCallback(
    (qq: QuizQuestion, index: number) => (e: Event, byKeyboard?: boolean) => {
      preparePlayer(qq, true, false);
      setReviewQuestion({
        qq,
        index,
        byKeyboard
      });
    },
    []
  );
  const handleBackClick = useCallback(() => {
    setReviewQuestion(null);
    restoreSeekBar();
  }, [restoreSeekBar]);
  const handleNavigationClick = useCallback(
    (shift: number) => {
      const nextQuizQuestion = reviewQuestion && reviewDetails[reviewQuestion.index + shift];
      if (nextQuizQuestion) {
        return () => {
          preparePlayer(nextQuizQuestion, true, false);
          setReviewQuestion({
            qq: nextQuizQuestion,
            index: reviewQuestion.index + shift
          });
        };
      }
    },
    [reviewQuestion, reviewDetails]
  );

  const renderReviewQuestion = useMemo(() => {
    return (
      <QuestionReview
        onBack={handleBackClick}
        onNext={handleNavigationClick(1)}
        onPrev={handleNavigationClick(-1)}
        reviewQuestion={reviewQuestion}
        questionsAmount={reviewDetails.length}
        getSeekBarNode={getSeekBarNode}
        updatePlayerHover={updatePlayerHover}
      />
    );
  }, [reviewQuestion, reviewDetails, getSeekBarNode]);

  const renderReviewQuestionsList = useMemo(() => {
    return <QuestionListReview onQuestionClick={handleQuestionClick} reviewDetails={reviewDetails} {...questionListReviewProps} />;
  }, [questionListReviewProps, reviewDetails]);

  return <IvqOverlay>{reviewQuestion ? renderReviewQuestion : renderReviewQuestionsList}</IvqOverlay>;
};
