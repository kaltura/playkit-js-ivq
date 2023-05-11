import {mockKalturaBe, loadPlayer, getPlayer, preparePage, MANIFEST, MANIFEST_SAFARI} from './env';

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

  describe('QuizQuestionChanged event', () => {
    it('should dispatch QuizQuestionChanged event with Answered state after clicking on continue', done => {
      mockKalturaBe('quiz_welcome_page_disabled_with_attempt.json', 'ivq_QuizQuestionChanged_event/cues_1_question.json');
      loadPlayer({}, {autoplay: true}).then(player => {
        player.addEventListener('QuizQuestionChanged', ({payload}: any) => {
          expect(payload.qqa[0].state).to.equal(2);
          done();
        });
        player.pause();
        cy.get('[data-testid="cuePointContainer"]').click({force: true});
        cy.get('[data-testid="continueButton"]').click({force: true});
      });
    });
    it('should dispatch QuizQuestionChanged event with Correct state after submitting the quiz', done => {
      mockKalturaBe('quiz_welcome_page_disabled_with_attempt.json', 'ivq_QuizQuestionChanged_event/cues_1_question.json');
      loadPlayer({}, {autoplay: true}).then(player => {
        player.addEventListener('QuizQuestionChanged', (event: any) => {
          expect(event.payload.qqa[0].state).to.equal(4);
          done();
        });
        player.pause();
        cy.get('[data-testid="cuePointContainer"]').click({force: true});
        cy.get('[data-testid="continueButton"]').should('exist').click({force: true});
        cy.get('[data-testid="ivqPopupSubmitButton"]').click({force: true});
      });
    });
    it('should dispatch QuizQuestionChanged event with empty array', done => {
      mockKalturaBe('ivq_QuizQuestionChanged_event/quiz_ban_seek_enabled.json', 'ivq_QuizQuestionChanged_event/cues_1_question.json');
      preparePage({}, {autoplay: true}).then(() =>
        getPlayer().then(kalturaPlayer => {
          kalturaPlayer.addEventListener('QuizQuestionChanged', ({payload}: any) => {
            expect(payload.qqa.length).to.equal(0);
            done();
          });
        })
      );
    });
    it('should dispatch QuizQuestionChanged event with a non empty array, after clicking on continue', done => {
      mockKalturaBe('ivq_QuizQuestionChanged_event/quiz_ban_seek_enabled.json', 'ivq_QuizQuestionChanged_event/cues_1_question.json');
      preparePage({}, {autoplay: true}).then(() =>
        getPlayer().then(kalturaPlayer => {
          kalturaPlayer.addEventListener('QuizQuestionChanged', ({payload}: any) => {
            expect(payload.qqa.length).to.equal(1);
            done();
          });
          kalturaPlayer.pause();
          cy.get('[data-testid="cuePointContainer"]').click({force: true});
          cy.get('[data-testid="continueButton"]').should('exist').click({force: true});
        })
      );
    });
    it('should dispatch QuizQuestionChanged event with Answered state after submission', done => {
      let counter = 0;
      mockKalturaBe('quiz_welcome_page_disabled.json', 'ivq_QuizQuestionChanged_event/cues_1_question.json');
      loadPlayer({}, {autoplay: true}).then(player => {
        player.addEventListener('QuizQuestionChanged', ({payload}: any) => {
          expect(payload.qqa[0].state).to.equal(2);
          counter++;
          // the first time will come from onContinue- we want to make sure the state Answered (2) stays also after submission
          if (counter === 2) {
            done();
          }
        });
        player.pause();
        cy.get('[data-testid="cuePointContainer"]').click({force: true});
        cy.get('[data-testid="continueButton"]').should('exist').click({force: true});
        cy.get('[data-testid="ivqPopupSubmitButton"]').should('exist').click({force: true});
      });
    });
    it('should dispatch QuizQuestionChanged event with Unanswered state after retake', done => {
      let counter = 0;
      mockKalturaBe('ivq_QuizQuestionChanged_event/quiz_multiple_attempts.json', 'ivq_QuizQuestionChanged_event/cues_1_question.json');
      loadPlayer({}, {autoplay: true}).then(player => {
        player.addEventListener('QuizQuestionChanged', ({payload}: any) => {
          // the first time will come from initializing the quiz- we want to make sure the state Unanswered (1) comes after retake
          if (counter === 2) {
            expect(payload.qqa[0].state).to.equal(1);
            done();
          }
          counter++;
        });
        player.pause();
        cy.get('[data-testid="cuePointContainer"]').click({force: true});
        cy.get('[data-testid="continueButton"]').should('exist').click({force: true});
        cy.get('[data-testid="ivqPopupSubmitButton"]').should('exist').click({force: true});
        cy.get('[data-testid="reviewRetakeButton"]').should('exist').click({force: true});
      });
    });
  });
});
