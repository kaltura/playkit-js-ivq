# PlayKit JS IVQ - Quiz plugin for the [PlayKit JS Player]

[![Build Status](https://github.com/kaltura/playkit-js-ivq/actions/workflows/run_canary_full_flow.yaml/badge.svg)](https://github.com/kaltura/playkit-js-ivq/actions/workflows/run_canary_full_flow.yaml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://img.shields.io/npm/v/@playkit-js/playkit-js-ivq/latest.svg)](https://www.npmjs.com/package/@playkit-js/playkit-js-ivq)
[![](https://img.shields.io/npm/v/@playkit-js/playkit-js-ivq/canary.svg)](https://www.npmjs.com/package/@playkit-js/playkit-js-ivq/v/canary)

PlayKit JS IVQ is written in [ECMAScript6], statically analysed using [Typescript] and transpiled in ECMAScript5 using [Babel].

[typescript]: https://www.typescriptlang.org/
[ecmascript6]: https://github.com/ericdouglas/ES6-Learning#articles--tutorials
[babel]: https://babeljs.io

## Getting Started

### Prerequisites

The plugin requires [Kaltura Player] to be loaded first.

[kaltura player]: https://github.com/kaltura/kaltura-player-js

### Installing

First, clone and run [yarn] to install dependencies:

[yarn]: https://yarnpkg.com/lang/en/

```
git clone https://github.com/kaltura/playkit-js-ivq.git
cd playkit-js-ivq
yarn install
```

### Building

Then, build the plugin

```javascript
yarn run build
```

### Testing

The plugin uses `cypress` tool for e2e tests

```javascript
yarn run test
```

UI conf file (`cypress/public/ui-conf.js`) contains Kaltura player and plugin dependencies.
Keep Kaltura player and dependency versinos aligned to currently released versions.

### Embed the library in your test page

Finally, add the bundle as a script tag in your page, and initialize the player

```html
<script type="text/javascript" src="/PATH/TO/FILE/kaltura-player.js"></script>
<!--Kaltura player-->
<script type="text/javascript" src="/PATH/TO/FILE/playkit-js-timeline.js"></script>
<!--PlayKit timeline plugin-->
<script type="text/javascript" src="/PATH/TO/FILE/playkit-kaltura-cuepoints.js"></script>
<!--PlayKit cuepoints plugin-->
<script type="text/javascript" src="/PATH/TO/FILE/playkit-ivq.js"></script>
<!--PlayKit ivq plugin-->
<div id="player-placeholder" style="height:360px; width:640px">
  <script type="text/javascript">
    var playerContainer = document.querySelector("#player-placeholder");
    var config = {
     ...
     targetId: 'player-placeholder',
     plugins: {
      ivq: { ... },
      timeline: { ... },
      kalturaCuepoints: { ... },
     }
     ...
    };
    var player = KalturaPlayer.setup(config);
    player.loadMedia(...);
  </script>
</div>
```

## Documentation

IVQ plugin dependencies can been found here:

- **[Dependencies](#dependencies)**

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/kaltura/playkit-js-ivq/tags).

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details

## Theming

The plugin root element carries the stable class `playkit-ivq`. Default values
are declared on that class; override any property at the player-container level.

**Question text**

| Property | Default | Description |
|---|---|---|
| `--ivq-question-font-size` | `18px` | Question text font size |
| `--ivq-question-line-height` | `normal` | Question text line height |
| `--ivq-question-max-width` | `100%` | Max width of question text block |

**Answer options**

| Property | Default | Description |
|---|---|---|
| `--ivq-answer-font-size` | `16px` | Answer choice font size |
| `--ivq-answer-line-height` | `normal` | Answer choice line height |
| `--ivq-answer-border-radius` | `4px` | Answer choice corner radius |

**Open question textarea**

| Property | Default | Description |
|---|---|---|
| `--ivq-textarea-font-size` | `14px` | Textarea font size |
| `--ivq-textarea-min-height` | `80px` | Textarea minimum height |
| `--ivq-textarea-max-height` | `120px` | Textarea maximum height |

**Buttons**

| Property | Default | Description |
|---|---|---|
| `--ivq-button-font-size` | `14px` | Button label font size |
| `--ivq-button-padding` | `4px 8px` | Button inner padding |
| `--ivq-button-border-radius` | `4px` | Button corner radius |

**Welcome and submit screens**

| Property | Default | Description |
|---|---|---|
| `--ivq-title-font-size` | `32px` | Title font size |
| `--ivq-description-font-size` | `14px` | Description font size |

**Popup**

| Property | Default | Description |
|---|---|---|
| `--ivq-popup-background` | `rgba(0, 0, 0, 0.7)` | Popup background color |
| `--ivq-popup-blur` | `8px` | Popup backdrop blur radius |

**Example** — override from the player container:
```css
.playkit-ivq {
  --ivq-button-font-size: 16px;
  --ivq-panel-max-width: 800px;
}
```

<a name="dependencies"></a>
## Dependencies

Plugin dependencies:<br/>
<a href="https://github.com/kaltura/playkit-js-kaltura-cuepoints">Cue Points</a><br/>
<a href="https://github.com/kaltura/playkit-js-timeline">Timeline</a>
