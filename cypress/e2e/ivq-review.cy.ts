import {mockKalturaBe, loadPlayer, MANIFEST, MANIFEST_SAFARI} from './env';

describe('IVQ review', () => {
  beforeEach(() => {
    // manifest
    cy.intercept('GET', '**/a.m3u8*', Cypress.browser.name === 'webkit' ? MANIFEST_SAFARI : MANIFEST);
    // thumbnails
    cy.intercept('GET', '**/width/164/vid_slices/100', {fixture: '100.jpeg'});
    cy.intercept('GET', '**/height/360/width/640', {fixture: '640.jpeg'});
    // kava
    cy.intercept('GET', '**/index.php?service=analytics*', {});
  });

  describe('quiz review', () => {
    it('should', () => {
      mockKalturaBe('quiz_review/correct_answers_quiz.json', 'quiz_review/correct_answers_cues.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
        });
      });
    });

    it('should', () => {
      mockKalturaBe('quiz_review/incorrect_answers_quiz.json', 'quiz_review/incorrect_answers_cues.json');
      loadPlayer({}, {playback: {autoplay: true}}).then(kalturaPlayer => {
        kalturaPlayer.ready().then(() => {
          kalturaPlayer.currentTime = 61;
        });
      });
    });
  });
});
