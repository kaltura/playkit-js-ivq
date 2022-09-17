import {h} from 'preact';
// @ts-ignore
import {core} from 'kaltura-player-js';
import {QuizLoader} from './providers';
import {
  IvqConfig,
  QuizQuestion,
  QuizQuestionMap,
  KalturaQuizQuestion,
  PresetAreas,
  IvqEventTypes,
  TimeLineMarker,
  UiComponentArea,
  KalturaPlayerSeekBarSelector,
  KalturaPlayerBottomBarSelector
} from './types';
import {DataSyncManager} from './data-sync-manager';
import {QuestionsVisualManager} from './questions-visual-manager';
import {KalturaUserEntry} from './providers/response-types';
import {WelcomeScreen, WelcomeScreenProps} from './components/welcome-screen';
import {QuizSubmit, QuizSubmitProps} from './components/quiz-submit';
import {QuizReview, QuizReviewProps} from './components/quiz-review';
import {TimelinePreview, TimelineMarker} from './components/timeline';
import {QuizDownloadLoader} from './providers/quiz-download-loader';
import {KalturaIvqMiddleware} from './quiz-middleware';

const {EventType} = core;

const HAS_IVQ_OVERLAY_CLASSNAME = 'has-ivq-plugin-overlay';

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
  private _removeActiveOverlay: null | Function = null;
  private _playlistOptions: null | KalturaPlayerTypes.Playlist['options'] = null;

  static defaultConfig: IvqConfig = {};

  constructor(name: string, player: KalturaPlayerTypes.Player, config: IvqConfig) {
    super(name, player, config);
    this._player = player;
    this._quizDataPromise = this._makeQuizDataPromise();
    this._quizQuestionsPromise = this._makeQuizQuestionsPromise();
    this._dataManager = new DataSyncManager(
      (qqm: QuizQuestionMap) => this._resolveQuizQuestionsPromise(qqm),
      (qq: KalturaQuizQuestion) => this._questionsVisualManager.onQuestionCuepointActive(qq),
      this._seekControl,
      this.eventManager,
      this.player,
      this.logger,
      (event: string, payload: unknown) => this.dispatchEvent(event, payload)
    );
    this._questionsVisualManager = new QuestionsVisualManager(
      () => this._dataManager.quizQuestionsMap,
      this._player,
      this.eventManager,
      this._setOverlay,
      this._removeOverlay,
      () => Boolean(this._removeActiveOverlay),
      this._getSeekBarNode
    );
  }

  get ready() {
    return this._quizDataPromise;
  }

  getMiddlewareImpl(): KalturaIvqMiddleware {
    return new KalturaIvqMiddleware(this._shouldPreventSeek);
  }

  loadMedia(): void {
    const kalturaCuePointService: any = this._player.getService('kalturaCuepoints');
    if (kalturaCuePointService && !this._player.isLive()) {
      this._getQuestions(kalturaCuePointService);
      this._getQuiz();
      this._quizQuestionsPromise.then((qqm: QuizQuestionMap) => {
        this._handleTimeline(qqm);
        this._handlePlaylistConfiguration();
        this.eventManager.listen(this._player, this._player.Event.ENDED, this._handleEndEvent);
      });
    } else {
      this.logger.warn('kalturaCuepoints service is not registered or entry Live');
      this._resolveQuizDataPromise();
    }
  }

  private _getBottomBarNode = () => {
    return this._player.getView().parentNode?.parentNode?.querySelector(KalturaPlayerBottomBarSelector) || null;
  };

  private _getSeekBarNode = () => {
    return this._player.getView().parentNode?.parentNode?.querySelector(KalturaPlayerSeekBarSelector) || null;
  };

  private _restoreSeekBar = () => {
    const seekBarParentNode = this._getBottomBarNode();
    if (seekBarParentNode && !seekBarParentNode?.querySelector(KalturaPlayerSeekBarSelector)) {
      const seekBarNode = this._getSeekBarNode();
      if (seekBarNode) {
        // move player seek bar from IvqBottomBar to Kaltura player bottom bar
        seekBarParentNode.append(seekBarNode);
      }
    }
  };

  private _handlePlaylistConfiguration() {
    const {items, options} = this._player.playlist;
    if (items?.length && (options?.autoContinue || options?.loop)) {
      // save playlist options
      this._playlistOptions = {...options};
      options.autoContinue = false;
      options.loop = false;
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
        if (qq.startTime === qq.prev?.startTime) {
          return;
        }
        const handleOnQuestionClick = () => {
          // get updated Quiz Question
          const quizQuestion = this._dataManager.quizQuestionsMap.get(qq.id);
          if (quizQuestion) {
            this._questionsVisualManager.preparePlayer(quizQuestion, true);
          }
        };
        questionBunch.push(qq.index);
        questionBunchMap.set(qq.id, questionBunch);
        const timeLineMarker: TimeLineMarker = {
          time: qq.startTime,
          marker: {
            width: 124,
            height: 32,
            get: props => {
              return (
                <TimelineMarker
                  {...props}
                  onClick={handleOnQuestionClick}
                  questionIndex={qq.index}
                  isDisabled={() => {
                    return Boolean(this._removeActiveOverlay);
                  }}
                />
              );
            }
          }
        };
        if (this._player.sources?.type !== core.MediaType.AUDIO) {
          timeLineMarker.preview = {
            get: ({defaultPreviewProps}) => {
              return (
                <TimelinePreview
                  onQuestionLinkClick={handleOnQuestionClick}
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
            width: this._player.getThumbnail(0)?.width,
            hideTime: false,
            sticky: true
          };
        }
        timelineService.addCuePoint(timeLineMarker);
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

  private _setOverlay = (fn: Function) => {
    this._removeOverlay();
    this._removeActiveOverlay = fn;
    this._player.ui.store?.dispatch(KalturaPlayer.ui.reducers.shell.actions.addPlayerClass(HAS_IVQ_OVERLAY_CLASSNAME));
  };

  private _removeOverlay = () => {
    this._restoreSeekBar();
    if (this._removeActiveOverlay) {
      this._removeActiveOverlay();
      this._removeActiveOverlay = null;
      this._player.ui.store?.dispatch(KalturaPlayer.ui.reducers.shell.actions.removePlayerClass(HAS_IVQ_OVERLAY_CLASSNAME));
    }
  };

  private _showWelcomeScreen = (prePlaybackState = false) => {
    this.logger.debug("show 'Welcome Screen'");
    const handleDownload = () => {
      return this._player.provider
        .doRequest([{loader: QuizDownloadLoader, params: {entryId: this._player.sources.id}}])
        .then((data: Map<string, any>) => {
          if (data && data.has(QuizDownloadLoader.id)) {
            window.location.assign(data.get(QuizDownloadLoader.id).response);
          }
        });
    };
    const welcomeScreenProps: WelcomeScreenProps = {
      welcomeMessage: this._dataManager.quizData?.welcomeMessage
    };
    if (this._dataManager.quizData?.allowDownload) {
      welcomeScreenProps['onDownload'] = handleDownload;
    }
    if (!prePlaybackState) {
      welcomeScreenProps['poster'] = this._player.poster || '';
      welcomeScreenProps['onClose'] = () => {
        this._player.play();
        this._removeOverlay();
      };
    }
    this._setOverlay(
      this._player.ui.addComponent({
        label: 'kaltura-ivq-welcome-screen',
        presets: PresetAreas,
        container: UiComponentArea,
        get: () => <WelcomeScreen {...welcomeScreenProps} />
      })
    );
    this.eventManager.listenOnce(this._player, EventType.PLAY, () => {
      this._removeOverlay();
    });
  };

  private _displayQuizReview = () => {
    const reviewDetails = this._questionsVisualManager.getReviewDetails();
    if (reviewDetails) {
      const {showGradeAfterSubmission, showCorrectAfterSubmission} = this._dataManager.quizData!;
      this._setOverlay(
        this._player.ui.addComponent({
          label: 'kaltura-ivq-review-screen',
          presets: PresetAreas,
          container: UiComponentArea,
          replaceComponent: 'PrePlaybackPlayOverlay',
          get: () => {
            const params: QuizReviewProps = {
              score: this._dataManager.quizUserEntry?.score || 0,
              onClose: () => {
                this._removeOverlay();
                const {playlist} = this._player;
                if (this._playlistOptions?.loop || (this._playlistOptions?.autoContinue && playlist.next)) {
                  playlist.playNext();
                }
              },
              reviewDetails,
              showAnswers: showCorrectAfterSubmission,
              showScores: showGradeAfterSubmission,
              preparePlayer: this._questionsVisualManager.preparePlayer,
              getSeekBarNode: this._getSeekBarNode,
              restoreSeekBar: this._restoreSeekBar
            };
            if (this._dataManager.isRetakeAllowed()) {
              params.onRetake = () => {
                return this._onQuizRetake()
                  .then(this._removeOverlay)
                  .catch((e: any) => {
                    this.logger.warn(e);
                  });
              };
            }
            return <QuizReview {...params} />;
          }
        })
      );
    }
  };

  private _displayQuizSubmit = () => {
    const submissionDetails = this._questionsVisualManager.getSubmissionDetails();
    if (submissionDetails) {
      this._setOverlay(
        this._player.ui.addComponent({
          label: 'kaltura-ivq-submit-screen',
          presets: PresetAreas,
          container: UiComponentArea,
          replaceComponent: 'PrePlaybackPlayOverlay',
          get: () => {
            const params: QuizSubmitProps = {
              onReview: () => {
                this._removeOverlay();
                submissionDetails.onReview();
              }
            };
            if (submissionDetails.showSubmitButton) {
              params.onSubmit = () => {
                return this._dataManager
                  .submitQuiz()
                  .then(() => {
                    this._removeOverlay();
                    if (this._dataManager.quizData?.showGradeAfterSubmission) {
                      this._displayQuizReview();
                    }
                  })
                  .catch((e: any) => {
                    this.logger.warn(e);
                  });
              };
            }
            return <QuizSubmit {...params} />;
          }
        })
      );
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
        throw 'QuizRetake: quizNewUserEntry absent';
      } else {
        this.dispatchEvent(IvqEventTypes.QUIZ_RETAKE);
        this._dataManager.retakeQuiz(quizNewUserEntry);
        this._player.currentTime = 0;
        this._manageWelcomeScreen(true);
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
            return;
          }
          const {setQuizUserEntry, setQuizAnswers, setQuizData, isSubmitAllowed, isRetakeAllowed} = this._dataManager;
          // set main quiz data
          setQuizData(quizData);
          this._manageWelcomeScreen();
          if (lastQuizUserEntry) {
            // set lastQuizUserEntry to define if submit and retake allowed
            setQuizUserEntry(lastQuizUserEntry);
          }
          if (!lastQuizUserEntry || (!isSubmitAllowed() && isRetakeAllowed())) {
            // in case if quiz attempt doesn't exist
            // OR user has more attempts and latest attempt submitted - create new quiz attempt.
            return this._dataManager.createNewQuizUserEntry().then((quizNewUserEntry: KalturaUserEntry) => {
              if (!quizNewUserEntry) {
                throw 'quizUserEntryId absent';
              } else {
                // for new quiz attempt answers should be empty;
                setQuizAnswers([]);
                setQuizUserEntry(quizNewUserEntry);
                this._dataManager.initDataManager();
              }
            });
          }
          // set answers for last quiz attempt
          if (quizAnswers) {
            setQuizAnswers(quizAnswers);
          }
          this._dataManager.initDataManager();
        }
      })
      .catch((e: any) => {
        this.logger.warn("can't process quiz data", e);
      })
      .finally(() => {
        this._resolveQuizDataPromise();
      });
  }

  private _manageWelcomeScreen = (retake = false) => {
    if (this._dataManager.quizData?.showWelcomePage) {
      if (this._player.config.playback.autoplay || retake) {
        this.eventManager.listenOnce(this.player, this.player.Event.PLAY, () => {
          this._player.pause();
          this._showWelcomeScreen();
        });
      } else {
        // before first play event duration is NaN
        this._showWelcomeScreen(Number.isNaN(this._player.duration));
      }
    }
  };

  reset(): void {
    this._removeOverlay();
    this._questionsVisualManager.reset();
    this._dataManager.reset();
    this._quizDataPromise = this._makeQuizDataPromise();
    this._quizQuestionsPromise = this._makeQuizQuestionsPromise();
    this.eventManager.removeAll();
    this._seekControlEnabled = false;
    this._maxCurrentTime = 0;
    if (this._playlistOptions) {
      // restore playlist options
      const {autoContinue, loop} = this._playlistOptions;
      this._player.playlist.options.autoContinue = autoContinue;
      this._player.playlist.options.loop = loop;
      this._playlistOptions = null;
    }
  }

  destroy(): void {
    this.eventManager.destroy();
  }
}
