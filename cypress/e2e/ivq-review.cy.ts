import {mockKalturaBe, loadPlayer, MANIFEST, MANIFEST_SAFARI} from './env';

describe('IVQ review', () => {
  beforeEach(() => {
    // manifest
    cy.intercept('GET', '**/a.m3u8*', Cypress.browser.name === 'webkit' ? MANIFEST_SAFARI : MANIFEST);
    // thumbnails
    cy.intercept('GET', '**/width/164/vid_slices/100', {fixture: '100.jpeg'});
    cy.intercept('GET', '**/height/360/width/640', {fixture: '640.jpeg'});
    // kava
    cy.intercept('POST', '**/index.php?service=analytics*', {});
  });

  describe('quiz review', () => {
    it('should display the correct score result', () => {
      mockKalturaBe('quiz_review/correct_answers_quiz.json', 'quiz_review/correct_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="quizReviewWrapper"]').should('be.visible');
          cy.get('[data-testid="quizScoreTitle"]').should('have.text', 'Your score is 100/100');
          cy.get('[data-testid="reviewCloseButton"]').contains('Close').click({force: true});
        });
      });
    });

    it('should display question list review with correct answers', () => {
      mockKalturaBe('quiz_review/correct_answers_quiz.json', 'quiz_review/correct_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="reviewAnswer"]').should('have.length', 4);

          cy.get('[data-testid="reviewAnswer"]')
            .eq(0)
            .within(() => {
              cy.get('[data-testid="reviewQuestionLabel"]').contains('1');
              cy.get('[data-testid="reviewQuestionContent"]').should('have.text', 'True/false question');
              cy.get('i').should('have.class', 'playkit-icon-ivq-question-correct-answer');
            });

          cy.get('[data-testid="reviewAnswer"]')
            .eq(1)
            .within(() => {
              cy.get('[data-testid="reviewQuestionLabel"]').contains('2');
              cy.get('[data-testid="reviewQuestionContent"]').should('have.text', 'Multi-choice question');
              cy.get('i').should('have.class', 'playkit-icon-ivq-question-correct-answer');
            });

          cy.get('[data-testid="reviewAnswer"]')
            .eq(2)
            .within(() => {
              cy.get('[data-testid="reviewQuestionLabel"]').contains('3');
              cy.get('[data-testid="reviewQuestionContent"]').should('have.text', 'Reflection point');
              cy.get('i').should('have.class', 'playkit-icon-ivq-reflectin-point');
            });

          cy.get('[data-testid="reviewAnswer"]')
            .eq(3)
            .within(() => {
              cy.get('[data-testid="reviewQuestionLabel"]').contains('4');
              cy.get('[data-testid="reviewQuestionContent"]').should('have.text', 'Open-ended question');
              cy.get('i').should('have.class', 'playkit-icon-ivq-open-question');
            });
        });
      });
    });

    it('should display the button inside answer details menu', () => {
      mockKalturaBe('quiz_review/correct_answers_quiz.json', 'quiz_review/correct_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="reviewAnswer"]').eq(0).click({force: true});
          cy.get('[data-testid="backButton"]').should('have.text', 'Back');
          cy.get('[data-testid="backButton"]').within(() => {
            cy.get('i').should('have.class', 'playkit-icon-ivq-chevron-left');
          });
          cy.get('[data-testid="backButton"]').click({force: true});
          cy.get('[data-testid="quizReviewWrapper"]').should('be.visible');
        });
      });
    });

    it('should display the incorrect score result', () => {
      mockKalturaBe('quiz_review/incorrect_answers_quiz.json', 'quiz_review/incorrect_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="quizReviewWrapper"]').should('be.visible');
          cy.get('[data-testid="quizScoreTitle"]').should('have.text', 'Your score is 0/100');
          cy.get('[data-testid="reviewCloseButton"]').contains('Close').click({force: true});
        });
      });
    });

    it('should display question list review with incorrect answers', () => {
      mockKalturaBe('quiz_review/incorrect_answers_quiz.json', 'quiz_review/incorrect_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="reviewAnswer"]').should('have.length', 4);

          cy.get('[data-testid="reviewAnswer"]')
            .eq(0)
            .within(() => {
              cy.get('[data-testid="reviewQuestionLabel"]').contains('1');
              cy.get('[data-testid="reviewQuestionContent"]').should('have.text', 'True/false question');
              cy.get('i').should('have.class', 'playkit-icon-ivq-question-incorrect-answer');
            });

          cy.get('[data-testid="reviewAnswer"]')
            .eq(1)
            .within(() => {
              cy.get('[data-testid="reviewQuestionLabel"]').contains('2');
              cy.get('[data-testid="reviewQuestionContent"]').should('have.text', 'Multi-choice question');
              cy.get('i').should('have.class', 'playkit-icon-ivq-question-incorrect-answer');
            });
        });
      });
    });

    it('should display the correct first answer details', () => {
      mockKalturaBe('quiz_review/correct_answers_quiz.json', 'quiz_review/correct_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="reviewAnswer"]').eq(0).click({force: true});
          cy.get('[data-testid="quizReviewWrapper"]').should('not.exist');
          cy.get('[data-testid="questionReviewWrapper"]').should('be.visible');
          cy.get('[data-testid="reviewQuestionText"]').should('contain', 'True/false question');
          cy.get('[data-testid="reviewCorrectAnswerIs"]').should('have.text', 'The correct answer is: True');
          cy.get('[data-testid="reviewYourAnswer"]').should('contain', 'Your answer');
          cy.get('[data-testid="reviewTrueFalseAnswer"]').should('have.length', 2);
          cy.get('[data-testid="reviewTrueFalseAnswer"]').first().should('have.text', 'True');
          cy.get('[data-testid="reviewQuestionIcon"]').within(() => {
            cy.get('i').should('have.class', 'playkit-icon-ivq-question-correct-answer');
          });
          cy.get('[data-testid="reviewTrueFalseAnswer"]').last().should('have.text', 'False');
        });
      });
    });

    it('should display the correct second answer details', () => {
      mockKalturaBe('quiz_review/correct_answers_quiz.json', 'quiz_review/correct_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="reviewAnswer"]').eq(1).click({force: true});
          cy.get('[data-testid="reviewQuestionText"]').should('contain', 'Multi-choice question');
          cy.get('[data-testid="reviewCorrectMultiChoiceAnswer"]').should('have.text', 'The correct answer is: B');
          cy.get('[data-testid="reviewYourMultiChoiceAnswer"]').should('contain', 'Your answer');
          cy.get('[data-testid="multiSelectAnswer"]').should('have.length', 4);

          cy.get('[data-testid="multiSelectAnswer"]')
            .eq(0)
            .within(() => {
              cy.get('[data-testid="questionLabel"]').should('have.text', 'A');
              cy.get('[data-testid="questionContent"]').should('have.text', 'answer one');
            });

          cy.get('[data-testid="multiSelectAnswer"]')
            .eq(1)
            .within(() => {
              cy.get('[data-testid="questionLabel"]').should('have.text', 'B');
              cy.get('[data-testid="questionContent"]').should('have.text', 'answer two');
              cy.get('i').should('have.class', 'playkit-icon-ivq-question-correct-answer');
            });

          cy.get('[data-testid="multiSelectAnswer"]')
            .eq(2)
            .within(() => {
              cy.get('[data-testid="questionLabel"]').should('have.text', 'C');
              cy.get('[data-testid="questionContent"]').should('have.text', 'answer three');
            });

          cy.get('[data-testid="multiSelectAnswer"]')
            .eq(3)
            .within(() => {
              cy.get('[data-testid="questionLabel"]').should('have.text', 'D');
              cy.get('[data-testid="questionContent"]').should('have.text', 'answer four');
            });
        });
      });
    });

    it('should display the third answer details', () => {
      mockKalturaBe('quiz_review/correct_answers_quiz.json', 'quiz_review/correct_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="reviewAnswer"]').eq(2).click({force: true});
          cy.get('[data-testid="reviewQuestionText"]').should('contain', 'Reflection point');
        });
      });
    });

    it('should display the fourth answer details', () => {
      mockKalturaBe('quiz_review/correct_answers_quiz.json', 'quiz_review/correct_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="reviewAnswer"]').eq(3).click({force: true});
          cy.get('[data-testid="reviewQuestionText"]').should('contain', 'Open-ended question');
          cy.get('[data-testid="openQuestionAnswer"]').should('have.text', 'My answer');
          cy.get('[data-testid="showHintButton"]').should('have.text', 'Show why');
          cy.get('[data-testid="showHintButton"]').within(() => {
            cy.get('i').should('have.class', 'playkit-icon-ivq-down-icon');
          });
          cy.get('[data-testid="showHintButton"]').click({force: true});
          cy.get('[data-testid="showHintButton"]').should('have.text', 'Hide why');
          cy.get('[data-testid="questionAddonsContent"]').should('have.text', "It's explanations");
        });
      });
    });

    it('should display the incorrect first answer details', () => {
      mockKalturaBe('quiz_review/incorrect_answers_quiz.json', 'quiz_review/incorrect_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="reviewAnswer"]').eq(0).click({force: true});
          cy.get('[data-testid="reviewQuestionIcon"]').within(() => {
            cy.get('i').should('have.class', 'playkit-icon-ivq-question-incorrect-answer');
          });
        });
      });
    });

    it('should display the incorrect second answer details', () => {
      mockKalturaBe('quiz_review/incorrect_answers_quiz.json', 'quiz_review/incorrect_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
          cy.get('[data-testid="reviewAnswer"]').eq(1).click({force: true});

          cy.get('[data-testid="multiSelectAnswer"]')
            .eq(0)
            .within(() => {
              cy.get('i').should('have.class', 'playkit-icon-ivq-question-incorrect-answer');
            });
        });
      });
    });
  });
});
