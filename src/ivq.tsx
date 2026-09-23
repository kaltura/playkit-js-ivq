import {h} from 'preact';
// @ts-ignore
import {core, ui} from '@playkit-js/kaltura-player-js';
// @ts-ignore
import {Env} from '@playkit-js/playkit-js';
import {FloatingItem, FloatingManager, ToastManager} from '@playkit-js/ui-managers';
import {QuizLoader} from './providers';

import {
  IvqConfig,
  IvqEventTypes,
  KalturaPlayerBottomBarSelector,
  KalturaPlayerSeekBarSelector,
  KalturaQuizQuestion,
  PresetAreas,
  QuizQuestion,
  QuizQuestionMap,
  UiComponentArea
} from './types';
import {DataSyncManager} from './data-sync-manager';
import {QuestionsVisualManager} from './questions-visual-manager';
import {KalturaUserEntry} from './providers/response-types';
import {WelcomeScreen, WelcomeScreenProps} from './components/welcome-screen';
import {QuizSubmit, QuizSubmitProps} from './components/quiz-submit';
import {QuizReview, QuizReviewProps} from './components/quiz-review';
import {IvqPopup, IvqPopupProps, IvqPopupTypes} from './components/ivq-popup';
import {QuizDownloadLoader} from './providers/quiz-download-loader';
import {KalturaIvqMiddleware} from './quiz-middleware';

const {EventType, FakeEvent} = core;
const {PLAYER_HOVERED} = KalturaPlayer.ui.EventType;

const HAS_IVQ_OVERLAY_CLASSNAME = 'has-ivq-plugin-overlay';
const {Text} = KalturaPlayer.ui.preacti18n;

export const PLUGIN_NAME = 'ivq';

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
  private _ivqPopup: null | FloatingItem = null;
  private _playlistOptions: null | KalturaPlayerTypes.Playlist['options'] = null;
  private isNoSeekAlertShown = false;
  private defaultToastDuration = 5 * 1000;
  private componentRemover: (() => void) | undefined;

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
      (event: string, payload: unknown) => this.dispatchEvent(event, payload),
      () => this._manageIvqPopup(false),
      (qqm: Map<string, QuizQuestion>) => this._filterQuestionChanged(qqm),
      this._makeOnClickHandler
    );
    this._questionsVisualManager = new QuestionsVisualManager(
      () => this._dataManager.quizQuestionsMap,
      this._dataManager.getUnansweredQuestions,
      this._player,
      this.eventManager,
      this._setOverlay,
      this._removeOverlay,
      () => Boolean(this._removeActiveOverlay),
      this._getSeekBarNode,
      this._dataManager.dispatchQuestionChanged,
      this._updatePlayerHover
    );
    this._registerQuizApi();
  }

  get ready() {
    return this._quizDataPromise;
  }

  private get floatingManager(): FloatingManager {
    return (this._player.getService('floatingManager') as FloatingManager) || {};
  }

  private get toastManager(): ToastManager {
    return (this.player.getService('toastManager') as ToastManager) || {};
  }

  getMiddlewareImpl(): KalturaIvqMiddleware {
    return new KalturaIvqMiddleware(this._shouldPreventSeek, this._showNoSeekAlertPopUp);
  }

  loadMedia(): void {
    this.componentRemover = this.player.ui.addComponent({
      label: 'remove-media-info-display-component',
      presets: [ui.ReservedPresetNames.Playback, ui.ReservedPresetNames.Live],
      area: 'GuiArea',
      replaceComponent: 'MediaInfoDisplay',
      get: () => {
        return null;
      }
    });
    const kalturaCuePointService: any = this._player.getService('kalturaCuepoints');
    if (kalturaCuePointService && !this._player.isLive()) {
      this._getQuestions(kalturaCuePointService);
      this._getQuiz();
      this._quizQuestionsPromise.then((qqm: QuizQuestionMap) => {
        this._handleTimeline(qqm);
        this._handlePlaylistConfiguration();
        this.eventManager.listen(this._player, this._player.Event.ENDED, this._handleEndEvent);
        this._disableNativePip();
        this.eventManager.listen(this._player, this._player.Event.AD_SKIPPED, () => this._handleAdsCompletedEvent(qqm))
        this.eventManager.listen(this._player, this._player.Event.AD_COMPLETED, () => this._handleAdsCompletedEvent(qqm))
      });
    } else {
        this.logger.warn('kalturaCuepoints service is not registered or entry Live');
        if (this.componentRemover) {
            this.componentRemover();
            this.componentRemover = undefined;
        }
        this._resolveQuizDataPromise();
    }
  }

  private _registerQuizApi = () => {
    const {setQuizData, setQuizUserEntry, setQuizAnswers} = this._dataManager;
    this._player.registerService(PLUGIN_NAME, {
      setQuizAttributes: (quizData: any = {}, quizUserEntry: any = {}) => {
        const rawQuizData = DataSyncManager.generateRawQuizData(quizData);
        setQuizData(rawQuizData, true);
        this._manageWelcomeScreen();
        setQuizAnswers([]);
        const quizNewUserEntry = DataSyncManager.generateQuizUserEntry(quizUserEntry);
        setQuizUserEntry(quizNewUserEntry);
        this._dataManager.initDataManager(true);
      }
    });
  };

  private _getBottomBarNode = () => {
    return this._player.getView().parentNode?.parentNode?.querySelector(KalturaPlayerBottomBarSelector) || null;
  };

  private _getSeekBarNode = () => {
    return this._player.getView().parentNode?.parentNode?.querySelector(KalturaPlayerSeekBarSelector) || null;
  };

  private _updatePlayerHover = () => {
    this._player.dispatchEvent(new FakeEvent(PLAYER_HOVERED));
  };

  private _restoreSeekBar = () => {
    const seekBarParentNode = this._getBottomBarNode();
    if (seekBarParentNode && !seekBarParentNode?.querySelector(KalturaPlayerSeekBarSelector)) {
      const seekBarNode = this._getSeekBarNode();
      if (seekBarNode) {
        // move player seek bar from IvqBottomBar to Kaltura player bottom bar
        seekBarParentNode.append(seekBarNode);
        seekBarNode.setAttribute('role', 'slider');
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

  private _makeOnClickHandler = (id: string) => () => {
    this.dispatchEvent(IvqEventTypes.QUIZ_SEEK, {id});
    const quizQuestion = this._dataManager.quizQuestionsMap.get(id);
    if (quizQuestion) {
      const {startTime} = quizQuestion;
      if (!this._shouldPreventSeek(startTime)) {
        this._questionsVisualManager.preparePlayer(quizQuestion, true);
      }
    }
  };

  private _handleTimeline(qqm: QuizQuestionMap) {
    const timelineService: any = this._player.getService('timeline');
    if (!timelineService) {
      this.logger.warn('No timeline service available');
    } else {
      const isMarkerDisabled = () => Boolean(this._removeActiveOverlay);
      qqm.forEach((qq: QuizQuestion) => {
        if (qq.startTime === qq.prev?.startTime) {
          return;
        }
        const handleOnQuestionClick = this._makeOnClickHandler(qq.id);
        const qqData = {
          onClick: handleOnQuestionClick,
          isMarkerDisabled: isMarkerDisabled,
          index: qq.index,
          type: qq.q.questionType
        };
        timelineService.addKalturaCuePoint(qq.startTime, 'QuizQuestion', qq.id, '', qqData);
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
    if (this._dataManager.quizData?.previewMode) {
      this.logger.debug("In preview mode, quiz won't be submitted");
      return;
    }
    if (this._dataManager.isQuizSubmitted()) {
      this._displayQuizReview();
    } else {
      this._displayQuizSubmit();
    }
  };

  private _handleAdsCompletedEvent = (qqm: QuizQuestionMap) => {
    const timelineService: any = this._player.getService('timeline');
    qqm.forEach((qq: QuizQuestion) => {
      if (qq.id) {
        timelineService.removeCueFromTimeline({ id: qq.id , startTime: qq.startTime});
      }
    })
    this._handleTimeline(qqm);
  }

  private _manageIvqPopup = (onInit = true) => {
    this.logger.debug("show 'IVQ Banner'");
    this._removeIvqBanner();
    const submissionDetails = this._questionsVisualManager.getSubmissionDetails();
    const targetId = this._player.config.targetId;
    let type: IvqPopupTypes = IvqPopupTypes.none;

    if (onInit && this._dataManager.isQuizSubmitted() && !this._dataManager.isRetakeAllowed()) {
      type = IvqPopupTypes.submitted;
    } else if (!onInit && !submissionDetails.submitAllowed) {
      type = IvqPopupTypes.almostDone;
    } else if (submissionDetails.submitAllowed && this._dataManager.quizData?.preventSeek) {
      type = IvqPopupTypes.completed;
    } else if (submissionDetails.submitAllowed && !this._dataManager.quizData?.preventSeek) {
      type = IvqPopupTypes.submit;
    }

    if (type === IvqPopupTypes.none) {
      return;
    }
    if (!targetId) {
      return;
    }
    const popupProps: IvqPopupProps = {
      score: this._dataManager.getQuizScore(),
      type,
      onClose: this._removeIvqBanner,
      onReview: submissionDetails.onReview,
      onSubmit: () => {
        this._player.pause();
        return this._submitQuiz();
      },
      targetId,
    };
    this._ivqPopup = this.floatingManager.add({
      label: 'IVQ popup',
      mode: 'Immediate',
      position: 'InteractiveArea',
      renderContent: () => <IvqPopup {...popupProps} />
    });
  };

  private _removeIvqBanner = () => {
    if (this._ivqPopup) {
      this.floatingManager.remove(this._ivqPopup);
    }
  };

  private _setOverlay = (fn: Function) => {
    this._player.pause();
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
      if (this._dataManager.quizData?.previewMode) {
        this.logger.debug("Preview mode doesn't allow download pre-test");
        return Promise.resolve();
      }
      return this._player.provider
        .doRequest([{loader: QuizDownloadLoader, params: {entryId: this._player.sources.id}}])
        .then((data: Map<string, any>) => {
          if (data && data.has(QuizDownloadLoader.id)) {
            window.location.assign(data.get(QuizDownloadLoader.id).response);
          }
        });
    };
    const welcomeScreenProps: WelcomeScreenProps = {
      welcomeMessage: this._dataManager.quizData?.welcomeMessage,
      inVideoTip: this._dataManager.quizData?.inVideoTip
    };
    welcomeScreenProps['availableAttempts'] = this._dataManager.getAvailableAttempts();
    if (this._dataManager.quizData?.allowDownload) {
      welcomeScreenProps['onDownload'] = handleDownload;
    }
    if (prePlaybackState) {
      this.eventManager.listenOnce(this._player, EventType.PLAY, () => {
        this._removeOverlay();
        this._manageIvqPopup();
      });
    } else {
      welcomeScreenProps['poster'] = this._player.poster || '';
      welcomeScreenProps['onClose'] = () => {
        this._player.play();
        this._removeOverlay();
        this._manageIvqPopup();
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
              score: this._dataManager.getQuizScore(),
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
              restoreSeekBar: this._restoreSeekBar,
              updatePlayerHover: this._updatePlayerHover
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

  private _submitQuiz = (): Promise<void> => {
    return this._dataManager
      .submitQuiz()
      .then(() => {
        this._removeIvqBanner();
        this._removeOverlay();
        if (this._dataManager.quizData?.showGradeAfterSubmission) {
          this._displayQuizReview();
        }
      })
      .catch((e: any) => {
        this.logger.warn(e);
      });
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
            if (submissionDetails.submitAllowed) {
              params.onSubmit = this._submitQuiz;
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

  private _showNoSeekAlertPopUp = () => {
    if (!this.isNoSeekAlertShown) {
      this.toastManager.add({
        icon: null,
        onClick(): void {},
        severity: 'Error',
        title: (<Text id="ivq.seeking_is_disable_popup_title">Seeking was disabled on this video</Text>) as any,
        text: '',
        duration: this.defaultToastDuration
      });
    }
    this.isNoSeekAlertShown = true;
    setTimeout(() => {
      this.isNoSeekAlertShown = false;
    }, this.defaultToastDuration);
  };

  private _onQuizRetake = (): Promise<void> => {
    return this._dataManager.createNewQuizUserEntry().then((quizNewUserEntry: KalturaUserEntry) => {
      if (!quizNewUserEntry) {
        throw 'QuizRetake: quizNewUserEntry absent';
      } else {
        this.dispatchEvent(IvqEventTypes.QUIZ_RETAKE);
        this._maxCurrentTime = 0;
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
            if (this.componentRemover) {
                this.componentRemover();
                this.componentRemover = undefined;
            }
            return;
          }
          const {setQuizUserEntry, setQuizAnswers, setQuizData, isQuizSubmitted, isRetakeAllowed} = this._dataManager;
          // set main quiz data
          setQuizData(quizData);
          if (!this._dataManager.quizData?.showWelcomePage) {
            if (this.componentRemover) {
              this.componentRemover();
              this.componentRemover = undefined;
            }
          }
          if (lastQuizUserEntry) {
            // set lastQuizUserEntry to define if submit and retake allowed
            setQuizUserEntry(lastQuizUserEntry);
          }
          this._manageWelcomeScreen();
          let allowSeek = false;
          if (!lastQuizUserEntry || (isQuizSubmitted() && isRetakeAllowed())) {
            // in case if quiz attempt doesn't exist
            // OR user has more attempts and latest attempt submitted - create new quiz attempt.
            return this._dataManager.createNewQuizUserEntry().then((quizNewUserEntry: KalturaUserEntry) => {
              if (!quizNewUserEntry) {
                throw 'quizUserEntryId absent';
              } else {
                // for new quiz attempt answers should be empty;
                setQuizAnswers([]);
                setQuizUserEntry(quizNewUserEntry);
                this._dataManager.initDataManager(allowSeek);
              }
            });
          } else if (lastQuizUserEntry && isQuizSubmitted() && !isRetakeAllowed()) {
            // in case the quiz was already submitted by the same user and retake is not allowed,
            // set allowSeek to true, so the data manager will not disable the seek functionality.
            allowSeek = true;
          }
          // set answers for last quiz attempt
          if (quizAnswers) {
            setQuizAnswers(quizAnswers);
          }
          this._dataManager.initDataManager(allowSeek);
        } else {
            if (this.componentRemover) {
                this.componentRemover();
                this.componentRemover = undefined;
            }
        }
      })
      .catch((e: any) => {
        this.logger.warn("can't process quiz data", e);
          if (this.componentRemover) {
              this.componentRemover();
              this.componentRemover = undefined;
          }
      })
      .finally(() => {
        this._resolveQuizDataPromise();
      });
  }

  private _manageWelcomeScreen = (retake = false) => {
    if (this._dataManager.quizData?.showWelcomePage) {
      if (this._player.config.playback.autoplay || retake) {
        this.eventManager.listenOnce(this.player, this.player.Event.PLAY, () => {
          this._showWelcomeScreen();
        });
      } else {
        this._showWelcomeScreen(this._isFirstPlay());
      }
    } else {
      this.eventManager.listenOnce(this.player, this.player.Event.PLAY, () => {
        this._manageIvqPopup();
      });
    }
  };

  private _isFirstPlay = () => {
    // before first play event happened the player duration eq: NaN
    return Number.isNaN(this._player.duration);
  };

  private _filterQuestionChanged = (quizQuestionsMap: Map<string, QuizQuestion>): Array<QuizQuestion> => {
    if (this._seekControlEnabled) {
      // preventSeek configuration is enabled - need to filter only the relevant cuepoints
      const quizQuestions: Array<QuizQuestion> = [];
      quizQuestionsMap.forEach(qq => {
        if (qq.startTime <= this._maxCurrentTime) {
          quizQuestions.push(qq);
        }
      });
      return quizQuestions;
    }
    return Array.from(quizQuestionsMap.values());
  };

  private _disableNativePip = () => {
    if (this._seekControlEnabled && Env.browser.name === 'Firefox') {
      this._player.getVideoElement().setAttribute('disablePictureInPicture', 'true');
    }
  };

  reset(): void {
    this._removeOverlay();
    if (this.componentRemover) {
      this.componentRemover();
      this.componentRemover = undefined;
    }
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
    this._removeIvqBanner();
  }

  destroy(): void {
    this.eventManager.destroy();
  }
}
