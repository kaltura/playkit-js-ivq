// @ts-ignore
import {core, KalturaPlayer} from 'kaltura-player-js';

const {EventManager} = core;
const MANIFEST = `#EXTM3U
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="en",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="${location.origin}/media/index_1.m3u8",SUBTITLES="subs"

#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=509496,RESOLUTION=480x272,AUDIO="audio",SUBTITLES="subs"
${location.origin}/media/index.m3u8`;

const preparePage = (ivqConf = {}, playerConf = {}) => {
  cy.visit('index.html');
  return cy.window().then(win => {
    try {
      // @ts-ignore
      var kalturaPlayer = win.KalturaPlayer.setup({
        targetId: 'player-placeholder',
        provider: {
          partnerId: -1,
          env: {
            cdnUrl: 'http://mock-cdn',
            serviceUrl: 'http://mock-api'
          }
        },
        ...playerConf,
        plugins: {
          ivq: ivqConf
        }
      });
      kalturaPlayer.loadMedia({entryId: '0_wifqaipd'});
    } catch (e: any) {
      console.error(e.message);
    }
  });
};

const checkRequest = (reqBody: any, service: string, action: string) => {
  return reqBody?.service === service && reqBody?.action === action;
};

const mockQuiz = (quizFixture = 'quiz_welcome_page_disabled_with_attempt.json', cuesFixture = 'ivq_QuizQuestionChanged_event/cues_1_question.json') => {
  cy.intercept('http://mock-api/service/multirequest', req => {
    if (checkRequest(req.body[2], 'baseEntry', 'list')) {
      return req.reply({fixture: 'base_entry.json'});
    }
    if (checkRequest(req.body[3], 'quiz_quiz', 'get')) {
      return req.reply({fixture: quizFixture});
    }
    if (checkRequest(req.body[2], 'cuepoint_cuepoint', 'list')) {
      if (req.body[2].filter.objectType === 'KalturaAnswerCuePointFilter') {
        return req.reply({fixture: 'ivq_QuizQuestionChanged_event/quiz_answers.json'});
      }
      return req.reply({fixture: cuesFixture});
    }
    if (checkRequest(req.body[2], 'userEntry', 'add')) {
      return req.reply({fixture: 'quiz_entry.json'});
    }
    if (checkRequest(req.body[2], 'userEntry', 'submitQuiz')) {
      return req.reply({fixture: 'submit.json'});
    }
    if (checkRequest(req.body[2], 'cuepoint_cuepoint', 'add')) {
      return req.reply({fixture: 'ivq_QuizQuestionChanged_event/add_cuepoint_response.json'});
    }
  });
};

const getPlayer = () => {
  // @ts-ignore
  return cy.window().then($win => $win.KalturaPlayer.getPlayers()['player-placeholder']);
};

const eventManager: any = new EventManager();

describe('IVQ plugin', () => {
  beforeEach(() => {
    // manifest
    cy.intercept('GET', '**/a.m3u8*', MANIFEST);
    // thumbnails
    cy.intercept('GET', '**/width/164/vid_slices/100', {fixture: '100.jpeg'});
    cy.intercept('GET', '**/height/360/width/640', {fixture: '640.jpeg'});
    // kava
    cy.intercept('GET', '**/index.php?service=analytics*', {});
  });

  afterEach(() => {
    eventManager.removeAll();
  });

  describe('QuizQuestionChanged event', () => {
    it('should dispatch QuizQuestionChanged event with Answered state after clicking on continue', done => {
      mockQuiz();
      preparePage({}, {playback: {autoplay: true}});
      getPlayer().then(player => {
        player.addEventListener('QuizQuestionChanged', (event: any) => {
          expect(event.payload.qqa[0].state).to.equal(2);
          done();
        });
        cy.get('[data-testid="continueButton"]', {timeout: 5000}).click({force: true});
      });
    });
    it('should dispatch QuizQuestionChanged event with Correct state after submitting the quiz', done => {
      mockQuiz();
      preparePage({}, {playback: {autoplay: true}});
      getPlayer().then(player => {
        player.addEventListener('QuizQuestionChanged', (event: any) => {
          expect(event.payload.qqa[0].state).to.equal(4);
          done();
        });
        cy.get('[data-testid="continueButton"]').should('exist').click({force: true});
        cy.get('[data-testid="ivqPopupSubmitButton"]', {timeout: 1000}).click({force: true});
      });
    });
    it('should dispatch QuizQuestionChanged event with empty array', done => {
      mockQuiz('ivq_QuizQuestionChanged_event/quiz_ban_seek_enabled.json');
      preparePage({}, {playback: {autoplay: true}});
      getPlayer().then(player => {
        eventManager.listenOnce(player, 'QuizQuestionChanged', (event: any) => {
          expect(event.payload.qqa.length).to.equal(0);
          done();
        });
      });
    });
    it('should dispatch QuizQuestionChanged event with a non empty array, after clicking on continue', done => {
      mockQuiz('ivq_QuizQuestionChanged_event/quiz_ban_seek_enabled.json');
      preparePage({}, {playback: {autoplay: true}});
      getPlayer().then(player => {
        eventManager.listen(player, 'QuizQuestionChanged', (event: any) => {
          expect(event.payload.qqa.length).to.equal(1);
          done();
        });
        cy.get('[data-testid="continueButton"]').should('exist').click({force: true});
      });
    });
    it('should dispatch QuizQuestionChanged event with Answered state after submission', done => {
      mockQuiz('quiz_welcome_page_disabled.json');
      preparePage({}, {playback: {autoplay: true}});
      getPlayer().then(player => {
        let counter = 0;
        eventManager.listen(player, 'QuizQuestionChanged', (event: any) => {
          expect(event.payload.qqa[0].state).to.equal(2);
          counter++;
          // the first time will come from onContinue- we want to make sure the state Answered (2) stays also after submission
          if (counter === 2) {
            done();
          }
        });
        cy.get('[data-testid="continueButton"]').should('exist').click({force: true});
        cy.get('[data-testid="ivqPopupSubmitButton"]').should('exist').click({force: true});
      });
    });
    it('should dispatch QuizQuestionChanged event with Unanswered state after retake', done => {
      mockQuiz('ivq_QuizQuestionChanged_event/quiz_multiple_attempts.json');
      preparePage({}, {playback: {autoplay: true}});
      getPlayer().then(player => {
        let counter = 0;
        eventManager.listen(player, 'QuizQuestionChanged', (event: any) => {
          console.log(event.payload);
          expect(event.payload.qqa[0].state).to.equal(1);
          counter++;
          // the first time will come from initializing the quiz- we want to make sure the state Unanswered (1) comes after retake
          if (counter === 2) {
            done();
          }
        });
        cy.get('[data-testid="continueButton"]').should('exist').click({force: true});
        cy.get('[data-testid="ivqPopupSubmitButton"]').should('exist').click({force: true});
        cy.get('[data-testid="reviewRetakeButton"]').should('exist').click({force: true});
      });
    });
  });
});
