import {h} from 'preact';
// @ts-ignore
import {core} from 'kaltura-player-js';
import {QuizLoader} from './providers';
import {IvqConfig, QuizQuestion, QuizQuestionMap, KalturaQuizQuestion, PreviewProps, MarkerProps, PresetAreas} from './types';
import {DataSyncManager} from './data-sync-manager';
import {QuestionsVisualManager} from './questions-visual-manager';
import {KalturaUserEntry} from './providers/response-types';
import {WelcomeScreen} from './components/welcome-screen';
import {QuizSubmit, QuizSubmitProps} from './components/quiz-submit';
import {QuizReview, QuizReviewProps} from './components/quiz-review';
import {TimelinePreview, TimelineMarker} from './components/timeline-preview/timeline-preview';
import {QuizDownloadLoader} from './providers/quiz-download-loader';
import {KalturaIvqMiddleware} from './quiz-middleware';

const {EventType} = core;

export class Ivq extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;
  private _resolveQuizDataPromise = () => {};
  private _resolveQuizQuestionsPromise = (qqm: QuizQuestionMap) => {};
  private _quizDataPromise: Promise<void>;
  private _quizQuestionsPromise: Promise<QuizQuestionMap>;
  private _dataManager: DataSyncManager;
  private _questionsVisualManager: QuestionsVisualManager;
  private _maxCurrentTime = 0;
  private _seekControlEnabled = false;

  static defaultConfig: IvqConfig = {};

  constructor(name: string, player: KalturaPlayerTypes.Player, config: IvqConfig) {
    super(name, player, config);
    this._player = player;
    this._quizDataPromise = this._makeQuizDataPromise();
    this._quizQuestionsPromise = this._makeQuizQuestionsPromise();
    this._dataManager = new DataSyncManager(
      this._resolveQuizQuestionsPromise,
      (qq: KalturaQuizQuestion) => this._questionsVisualManager.onQuestionCuepointActive(qq),
      this._seekControl,
      this.eventManager,
      this.player,
      this.logger
    );
    this._questionsVisualManager = new QuestionsVisualManager(() => this._dataManager.quizQuestionsMap, this._player, this.eventManager);
  }

  get ready() {
    return this._quizDataPromise;
  }

  getMiddlewareImpl(): KalturaIvqMiddleware {
    return new KalturaIvqMiddleware(this._shouldPreventSeek);
  }

  loadMedia(): void {
    const kalturaCuePointService: any = this._player.getService('kalturaCuepoints');
    if (kalturaCuePointService) {
      this._getQuestions(kalturaCuePointService);
      this._getQuiz();
      this._quizQuestionsPromise.then((qqm: QuizQuestionMap) => {
        this._handleTimeline(qqm);
        this.eventManager.listen(this._player, this._player.Event.ENDED, this._handleEndEvent);
      });
    } else {
      this.logger.warn('kalturaCuepoints service is not registered');
      this._resolveQuizDataPromise();
    }
  }

  private _handleTimeline(qqm: QuizQuestionMap) {
    const timelineService: any = this._player.getService('timeline');
    if (!timelineService) {
      this.logger.warn('No timeline service available');
    } else {
      const questionBunchMap = new Map<string, Array<number>>();
      let questionBunch: Array<number> = [];
      qqm.forEach((qq: QuizQuestion) => {
        questionBunch.push(qq.index);
        if (qq.startTime === qq.next?.startTime) {
          return;
        }
        questionBunchMap.set(qq.id, questionBunch);
        timelineService.addCuePoint({
          time: qq.startTime,
          preview: {
            get: ({defaultPreviewProps}: PreviewProps) => {
              return (
                <TimelinePreview
                  onQuestionLinkClick={() => {
                    this._player.currentTime = qq.startTime;
                  }}
                  thumbnailInfo={this.player.getThumbnail(defaultPreviewProps.virtualTime)}
                  questionBunch={questionBunchMap.get(qq.id)!}
                  questionType={qq.q.questionType}
                />
              );
            },
            props: {
              style: {paddingTop: '33%'}
            },
            className: 'preview',
            width: this._player.getThumbnail(0).width,
            hideTime: false,
            sticky: true
          },
          marker: {
            get: (props: MarkerProps) => {
              return <TimelineMarker {...props} />;
            }
          }
        });
        questionBunch = [];
      });
    }
  }
  static isValid(): boolean {
    return true;
  }

  private _makeQuizDataPromise = () => {
    return new Promise<void>(res => {
      this._resolveQuizDataPromise = res;
    });
  };

  private _makeQuizQuestionsPromise = () => {
    return new Promise<QuizQuestionMap>(res => {
      this._resolveQuizQuestionsPromise = res;
    });
  };

  private _getQuestions(kalturaCuePointService: any) {
    kalturaCuePointService?.registerTypes([kalturaCuePointService.CuepointType.QUIZ]);
  }

  private _handleEndEvent = () => {
    if (this._dataManager.isSubmitAllowed()) {
      this._displayQuizSubmit();
    } else {
      this._displayQuizReview();
    }
  };

  private _showWelcomeScreen = () => {
    const handleDownload = () => {
      return this._player.provider
        .doRequest([{loader: QuizDownloadLoader, params: {entryId: this._player.sources.id}}])
        .then((data: Map<string, any>) => {
          if (data && data.has(QuizDownloadLoader.id)) {
            window.location.assign(data.get(QuizDownloadLoader.id).response);
          }
        });
    };
    const removeWelcomeScreen = this._player.ui.addComponent({
      label: 'kaltura-ivq-welcome-screen',
      presets: PresetAreas,
      container: 'GuiArea',
      get: () => (
        <WelcomeScreen
          onClose={() => {
            this._player.play();
            removeWelcomeScreen();
          }}
          welcomeMessage={this._dataManager.quizData?.welcomeMessage}
          allowDownload={this._dataManager.quizData?.allowDownload}
          onDownload={handleDownload}
        />
      )
    });
    this.eventManager.listenOnce(this._player, EventType.PLAY, () => {
      removeWelcomeScreen && removeWelcomeScreen();
    });
  };

  private _displayQuizReview = () => {
    const reviewDetails = this._questionsVisualManager.getReviewDetails();
    if (reviewDetails) {
      const {showGradeAfterSubmission, showCorrectAfterSubmission} = this._dataManager.quizData!;
      const removeSubmitScreen = this._player.ui.addComponent({
        label: 'kaltura-ivq-review-screen',
        presets: PresetAreas,
        container: 'GuiArea',
        replaceComponent: 'PrePlaybackPlayOverlay',
        get: () => {
          const params: QuizReviewProps = {
            score: this._dataManager.quizUserEntry?.score || 0,
            onClose: () => {
              removeSubmitScreen();
            },
            reviewDetails,
            showAnswers: showCorrectAfterSubmission,
            showScores: showGradeAfterSubmission,
            preparePlayer: this._questionsVisualManager.preparePlayer
          };
          if (this._dataManager.isRetakeAllowed()) {
            params.onRetake = () => {
              return this._onQuizRetake().then(() => {
                removeSubmitScreen();
              });
            };
          }
          return <QuizReview {...params} />;
        }
      });
    }
  };

  private _displayQuizSubmit = () => {
    const submissionDetails = this._questionsVisualManager.getSubmissionDetails();
    if (submissionDetails) {
      const removeSubmitScreen = this._player.ui.addComponent({
        label: 'kaltura-ivq-submit-screen',
        presets: PresetAreas,
        container: 'GuiArea',
        replaceComponent: 'PrePlaybackPlayOverlay',
        get: () => {
          const params: QuizSubmitProps = {
            onReview: () => {
              removeSubmitScreen();
              submissionDetails.onReview();
            }
          };
          if (submissionDetails.showSubmitButton) {
            params.onSubmit = () => {
              return this._dataManager.submitQuiz().then(() => {
                removeSubmitScreen();
                if (this._dataManager.quizData?.showCorrectAfterSubmission) {
                  this._displayQuizReview();
                }
              });
            };
          }
          return <QuizSubmit {...params} />;
        }
      });
    }
  };

  private _seekControl = () => {
    this._seekControlEnabled = true;
    this.eventManager.listen(this._player, this._player.Event.TIME_UPDATE, () => {
      if (this._maxCurrentTime < this._player.currentTime) {
        this._maxCurrentTime = this._player.currentTime; // Keep max current time
      }
    });
  };
  private _shouldPreventSeek = (to: number) => {
    return this._seekControlEnabled && !this._questionsVisualManager.quizQuestionJumping && to > this._maxCurrentTime;
  };

  private _onQuizRetake = (): Promise<void> => {
    return this._dataManager.createNewQuizUserEntry().then((quizNewUserEntry: KalturaUserEntry) => {
      if (!quizNewUserEntry) {
        this.logger.warn('quizUserEntryId absent');
      } else {
        this._dataManager.retakeQuiz(quizNewUserEntry);
        this._player.currentTime = 0;
        this._player.play();
      }
    });
  };

  private _getQuiz() {
    this._player.provider
      .doRequest([{loader: QuizLoader, params: {entryId: this._player.sources.id}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(QuizLoader.id)) {
          // get general quiz data, userEntryId and answers
          const quizLoader = data.get(QuizLoader.id);
          const lastQuizUserEntry = quizLoader?.response?.userEntries[0];
          const quizData = quizLoader?.response?.quiz;
          const quizAnswers = quizLoader?.response?.quizAnswers;
          if (!quizData) {
            this.logger.warn('quiz data absent');
          } else {
            if (!lastQuizUserEntry) {
              // in case if quizUserEntryId doesn't exist - create new one
              return this._dataManager.createNewQuizUserEntry().then((quizNewUserEntry: KalturaUserEntry) => {
                if (!quizNewUserEntry) {
                  this.logger.warn('quizUserEntryId absent');
                } else {
                  this._dataManager.initDataManager(quizData, quizNewUserEntry, quizAnswers);
                }
              });
            } else {
              this._dataManager.initDataManager(quizData, lastQuizUserEntry, quizAnswers);
            }
          }
        }
      })
      .catch((e: any) => {
        this.logger.warn(e);
      })
      .finally(() => {
        this._resolveQuizDataPromise();
        if (this._dataManager.quizData?.showWelcomePage && !this._player.config.playback.autoplay) {
          this._player.pause();
          this._showWelcomeScreen();
        }
      });
  }

  reset(): void {
    this._quizDataPromise = this._makeQuizDataPromise();
    this._quizQuestionsPromise = this._makeQuizQuestionsPromise();
  }

  destroy(): void {
    this.eventManager.destroy();
  }
}
