import {mockKalturaBe, loadPlayer, MANIFEST, MANIFEST_SAFARI} from './env';

Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('IVQ plugin', () => {
  beforeEach(() => {
    // manifest
    cy.intercept('GET', '**/a.m3u8*', Cypress.browser.name === 'webkit' ? MANIFEST_SAFARI : MANIFEST);
    // thumbnails
    cy.intercept('GET', '**/width/164/vid_slices/100', {fixture: '100.jpeg'});
    cy.intercept('GET', '**/height/360/width/640', {fixture: '640.jpeg'});
    // kava
    cy.intercept('GET', '**/index.php?service=analytics*', {});
  });

  describe('welcome screen', () => {
    it('should show welcome screen with content', () => {
      mockKalturaBe();
      loadPlayer().then(() => {
        cy.get('.playkit-pre-playback-play-button').should('exist');
        cy.get('[data-testid="welcomeScreenRoot"]').should('exist');
        cy.get('[data-testid="welcomeScreenTitle"]').should($div => {
          expect($div.text()).to.eq('Start your video quiz!');
        });
        cy.get('[data-testid="welcomeScreenDescription"]').should($div => {
          expect($div.text()).to.eq('In this video, you will be given a Quiz. Good Luck!');
        });
        cy.get('[data-testid="welcomeScreenTip"]').should($div => {
          expect($div.text()).to.eq('All questions must be answered. The quiz will be submitted at the end.');
        });
        cy.get('[data-testid="welcomeScreenAttempts"]').should($div => {
          expect($div.text()).to.eq('Total attempts available for this quiz: 88');
        });
        cy.get('.playkit-pre-playback-play-button').click({force: true});
        cy.get('[data-testid="welcomeScreenRoot"]').should('not.exist');
      });
    });
    it('should show welcome screen if no-one attempts left', () => {
      mockKalturaBe('quiz_welcome_page_enabled_no_attempts.json', 'cues_4_question.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="welcomeScreenRoot"]').should('exist');
        cy.get('[data-testid="welcomeScreenAttempts"]').should('not.exist');
      });
    });
    it('should show welcome screen if auto-play enabled', () => {
      mockKalturaBe();
      loadPlayer({}, {autoplay: true}).then(() => {
        cy.get('.playkit-pre-playback-play-button').should('not.exist');
        cy.get('[data-testid="welcomeScreenRoot"]').should('exist');
        cy.get('[data-testid="startQuiz"]').should($div => {
          expect($div.text()).to.eq('Start Quiz');
        });
        cy.get('[data-testid="startQuiz"]').click({force: true});
        cy.get('[data-testid="welcomeScreenRoot"]').should('not.exist');
      });
    });
    it('should not show welcome screen', () => {
      mockKalturaBe('quiz_welcome_page_disabled.json');
      loadPlayer().then(() => {
        cy.get('.playkit-pre-playback-play-button').should('exist');
        cy.get('[data-testid="welcomeScreenRoot"]').should('not.exist');
      });
    });
    it('should render and test download quiz button', () => {
      mockKalturaBe();
      loadPlayer().then(() => {
        cy.get('[data-testid="downloadPreTestContainer"]').should($div => {
          expect($div.text()).to.eq('Download Pre-Test');
        });
        cy.get('[data-testid="downloadPreTestContainer"]').click({force: true});
        cy.wait('@download');
      });
    });
    it('should not render download quiz button', () => {
      mockKalturaBe('quiz_download_disabled.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="welcomeScreenRoot"]').should('exist');
        cy.get('[data-testid="downloadPreTestContainer"]').should('not.exist');
      });
    });
  });

  describe('quiz popup', () => {
    it('should check close popup button', () => {
      mockKalturaBe('quiz_welcome_page_disabled_no_attempts.json', 'cues_4_question.json');
      loadPlayer({}, {autoplay: true}).then(() => {
        cy.get('[data-testid="ivqPopupRoot"]').should('exist');
        cy.get('[data-testid="ivqPopupCloseButton"]').click({force: true});
        cy.get('[data-testid="ivqPopupRoot"]').should('not.exist');
      });
    });
    it('should not display popup if welcome screen disabled and quiz has attempts', () => {
      mockKalturaBe('quiz_welcome_page_disabled.json');
      loadPlayer().then(() => {
        cy.get('.playkit-pre-playback-play-button').click({force: true});
        cy.get('[data-testid="cuePointContainer"]').first().should('exist');
        cy.get('[data-testid="ivqPopupRoot"]').should('not.exist');
      });
    });
    it('should check popup if welcome screen disabled and no-more quiz attempt left', () => {
      mockKalturaBe('quiz_welcome_page_disabled_no_attempts.json', 'cues_4_question.json');
      loadPlayer({}, {autoplay: true}).then(() => {
        cy.get('[data-testid="cuePointContainer"]').first().should('exist');
        cy.get('[data-testid="ivqPopupTitle"]').should($div => {
          expect($div.text()).to.eq('Quiz submitted');
        });
        cy.get('[data-testid="ivqPopupDescription"]').should($div => {
          expect($div.text()).to.eq('Your score is 67/100');
        });
      });
    });
    it('should not display popup if welcome screen enabled and no-more quiz attempt left', () => {
      mockKalturaBe('quiz_welcome_page_enabled_no_attempts.json', 'cues_4_question.json');
      loadPlayer().then(() => {
        cy.get('.playkit-pre-playback-play-button').click({force: true});
        cy.get('[data-testid="cuePointContainer"]').first().should('exist');
        cy.get('[data-testid="ivqPopupRoot"]').should('not.exist');
      });
    });
    it('should not display popup if welcome screen enabled and quiz has attempts', () => {
      mockKalturaBe();
      loadPlayer().then(() => {
        cy.get('.playkit-pre-playback-play-button').click({force: true});
        cy.get('[data-testid="cuePointContainer"]').first().should('exist');
        cy.get('[data-testid="ivqPopupRoot"]').should('not.exist');
      });
    });
    it('should check popup with submit and review quiz', () => {
      mockKalturaBe('quiz_welcome_page_disabled_with_attempt.json', 'cues_4_question.json');
      loadPlayer({}, {autoplay: true}).then(() => {
        cy.get('[data-testid="ivqPopupTitle"]').should($div => {
          expect($div.text()).to.eq('Quiz completed');
        });
        cy.get('[data-testid="ivqPopupDescription"]').should($div => {
          expect($div.text()).to.eq('Take a moment to review your answers or go ahead to submit your answers.');
        });
        cy.get('[data-testid="ivqPopupReviewButton"]').should('exist');
        cy.get('[data-testid="ivqPopupSubmitButton"]').should('exist');
      });
    });
    it('should check review quiz button', () => {
      mockKalturaBe('quiz_welcome_page_disabled_with_attempt.json', 'cues_4_question.json');
      loadPlayer({}, {autoplay: true}).then(() => {
        cy.get('[data-testid="ivqPopupReviewButton"]').click({force: true});
        cy.get('[data-testid="ivqQuestionContainer"]').should('exist');
      });
    });
  });

  describe('quiz submission', () => {
    it('should check popup submit quiz button', () => {
      mockKalturaBe('quiz_welcome_page_disabled_with_attempt.json', 'cues_4_question.json');
      loadPlayer({}, {autoplay: true}).then(() => {
        cy.get('[data-testid="ivqPopupSubmitButton"]').click({force: true});
        cy.get('[data-testid="ivqPopupSubmitButton"] [data-testid="ivqSpinner"]').should('exist');
        cy.wait('@submit');
      });
    });

    it('should close submit screen', () => {
      mockKalturaBe('quiz_welcome_page_disabled_with_attempt.json', 'cues_4_question.json');
      loadPlayer({}, {autoplay: true}).then(() => {
        cy.get('[data-testid="ivqPopupSubmitButton"]').click({force: true});
        cy.get('[data-testid="quizReviewWrapper"]').should('exist');
        cy.get('[data-testid="reviewCloseButton"]').should('exist');
        cy.get('[data-testid="reviewCloseButton"]').click({force: true});
        cy.get('[data-testid="quizReviewWrapper"]').should('not.exist');
      });
    });
  });

  describe('quiz seek functionality', () => {
    it('should prevent seek', () => {
      mockKalturaBe('ivq_QuizQuestionChanged_event/quiz_ban_seek_enabled.json');
      loadPlayer({}, {autoplay: true}).then(player => {
        player.pause();
        player.currentTime = 15;
        cy.get('.playkit-time-display > span').should($div => {
          expect($div.text()).to.not.contain('00:15');
        });
      });
    });

    it('should allow seek to submitted quiz', () => {
      mockKalturaBe('quiz_ban_seek_no_retake.json');
      loadPlayer({}, {autoplay: true}).then(player => {
        player.pause();
        cy.get('[data-testid="ivqPopupRoot"]').should('exist');
        player.currentTime = 15;
        cy.get('.playkit-time-display > span').should($div => {
          expect($div.text()).to.contain('00:15');
        });
      });
    });
  });
});
