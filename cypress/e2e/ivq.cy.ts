const MANIFEST = `#EXTM3U
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="en",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="${location.origin}/media/index_1.m3u8",SUBTITLES="subs"

#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=509496,RESOLUTION=480x272,AUDIO="audio",SUBTITLES="subs"
${location.origin}/media/index.m3u8`;

const preparePage = (ivqConf = {}, playerConf = {}) => {
  cy.visit('index.html');
  cy.window().then(win => {
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

const mockQuiz = (quizFixture = 'quiz.json', cuesFixture = 'cues.json') => {
  cy.intercept('http://mock-api/service/multirequest', req => {
    if (checkRequest(req.body[2], 'baseEntry', 'list')) {
      return req.reply({fixture: 'base_entry.json'});
    }
    if (checkRequest(req.body[3], 'quiz_quiz', 'get')) {
      return req.reply({fixture: quizFixture});
    }
    if (checkRequest(req.body[2], 'cuepoint_cuepoint', 'list')) {
      return req.reply({fixture: cuesFixture});
    }
    if (checkRequest(req.body[2], 'userEntry', 'add')) {
      return req.reply({fixture: 'quiz_entry.json'});
    }
    if (checkRequest(req.body[2], 'quiz_quiz', 'getUrl')) {
      req.alias = 'download';
      return req.reply({fixture: 'quiz_download'});
    }
    if (checkRequest(req.body[2], 'userEntry', 'submitQuiz')) {
      req.alias = 'submit';
      return req.reply({fixture: 'submit.json'});
    }
  });
};

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

  describe('welcome screen', () => {
    it('should show welcome screen with content', () => {
      mockQuiz();
      preparePage();
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
    it('should show welcome screen if no-one attempts left', () => {
      mockQuiz('quiz_welcome_page_enabled_no_attempts.json', 'cues_4_question.json');
      preparePage();
      cy.get('[data-testid="welcomeScreenRoot"]').should('exist');
      cy.get('[data-testid="welcomeScreenAttempts"]').should('not.exist');
    });
    it('should show welcome screen if auto-play enabled', () => {
      mockQuiz();
      preparePage({}, {playback: {autoplay: true}});
      cy.get('.playkit-pre-playback-play-button').should('not.exist');
      cy.get('[data-testid="welcomeScreenRoot"]').should('exist');
      cy.get('[data-testid="startQuiz"]').should($div => {
        expect($div.text()).to.eq('Start Quiz');
      });
      cy.get('[data-testid="startQuiz"]').click({force: true});
      cy.get('[data-testid="welcomeScreenRoot"]').should('not.exist');
    });
    it('should not show welcome screen', () => {
      mockQuiz('quiz_welcome_page_disabled.json');
      preparePage();
      cy.get('.playkit-pre-playback-play-button').should('exist');
      cy.get('[data-testid="welcomeScreenRoot"]').should('not.exist');
    });
    it('should render and test download quiz button', () => {
      mockQuiz();
      preparePage();
      cy.get('[data-testid="downloadPreTestContainer"]').should($div => {
        expect($div.text()).to.eq('Download Pre-Test');
      });
      cy.get('[data-testid="downloadPreTestContainer"]').click({force: true});
      cy.wait('@download');
    });
    it('should not render download quiz button', () => {
      mockQuiz('quiz_download_disabled.json');
      preparePage();
      cy.get('[data-testid="welcomeScreenRoot"]').should('exist');
      cy.get('[data-testid="downloadPreTestContainer"]').should('not.exist');
    });
  });

  describe('quiz popup', () => {
    it('should check close popup button', () => {
      mockQuiz('quiz_welcome_page_disabled_no_attempts.json', 'cues_4_question.json');
      preparePage({}, {playback: {autoplay: true}});
      cy.get('[data-testid="ivqPopupRoot"]').should('exist');
      cy.get('[data-testid="ivqPopupCloseButton"]').click({force: true});
      cy.get('[data-testid="ivqPopupRoot"]').should('not.exist');
    });
    it('should not display popup if welcome screen disabled and quiz has attempts', () => {
      mockQuiz('quiz_welcome_page_disabled.json');
      preparePage();
      cy.get('.playkit-pre-playback-play-button').click({force: true});
      cy.get('[data-testid="cuePointContainer"]').first().should('exist');
      cy.get('[data-testid="ivqPopupRoot"]').should('not.exist');
    });
    it('should check popup if welcome screen disabled and no-more quiz attempt left', () => {
      mockQuiz('quiz_welcome_page_disabled_no_attempts.json', 'cues_4_question.json');
      preparePage({}, {playback: {autoplay: true}});
      cy.get('[data-testid="cuePointContainer"]').first().should('exist');
      cy.get('[data-testid="ivqPopupTitle"]').should($div => {
        expect($div.text()).to.eq('Quiz submitted');
      });
      cy.get('[data-testid="ivqPopupDescription"]').should($div => {
        expect($div.text()).to.eq('Your score is 67/100');
      });
    });
    it('should not display popup if welcome screen enabled and no-more quiz attempt left', () => {
      mockQuiz('quiz_welcome_page_enabled_no_attempts.json', 'cues_4_question.json');
      preparePage();
      cy.get('.playkit-pre-playback-play-button').click({force: true});
      cy.get('[data-testid="cuePointContainer"]').first().should('exist');
      cy.get('[data-testid="ivqPopupRoot"]').should('not.exist');
    });
    it('should not display popup if welcome screen enabled and quiz has attempts', () => {
      mockQuiz();
      preparePage();
      cy.get('.playkit-pre-playback-play-button').click({force: true});
      cy.get('[data-testid="cuePointContainer"]').first().should('exist');
      cy.get('[data-testid="ivqPopupRoot"]').should('not.exist');
    });
    it('should check popup with submit and review quiz', () => {
      mockQuiz('quiz_welcome_page_disabled_with_attempt.json', 'cues_4_question.json');
      preparePage({}, {playback: {autoplay: true}});
      cy.get('[data-testid="ivqPopupTitle"]').should($div => {
        expect($div.text()).to.eq('Quiz completed');
      });
      cy.get('[data-testid="ivqPopupDescription"]').should($div => {
        expect($div.text()).to.eq('Take a moment to review your answers or go ahead to submit your answers.');
      });
      cy.get('[data-testid="ivqPopupReviewButton"]').should('exist');
      cy.get('[data-testid="ivqPopupSubmitButton"]').should('exist');
    });
    it('should check reveiw quiz button', () => {
      mockQuiz('quiz_welcome_page_disabled_with_attempt.json', 'cues_4_question.json');
      preparePage({}, {playback: {autoplay: true}});
      cy.get('[data-testid="ivqPopupReviewButton"]').click({force: true});
      cy.get('[data-testid="ivqQuestionContainer"]').should('exist');
    });
    it('should check submit quiz button', () => {
      mockQuiz('quiz_welcome_page_disabled_with_attempt.json', 'cues_4_question.json');
      preparePage({}, {playback: {autoplay: true}});
      cy.get('[data-testid="ivqPopupSubmitButton"]').click({force: true});
      cy.wait('@submit');
      cy.get('[data-testid="quizScoreTitle"]').should('exist');
    });
  });
});
