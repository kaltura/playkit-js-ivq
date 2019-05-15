# IVQ plugin (player v2 & v7)

## Overview
TBD

## Project structure
TBD

## Commands

### Setup reporistory
> Run `setup` command to install packages dependencies.

This command is shared to both plugins (v2 & v7).

```
npm run setup
``` 

### Serve test pages
> Make sure you setup the repository using the `setup` command

This command will build and run test page for the requested plugin version. This command will watch for changes and build them automatically. 

Use one of the following:
```$xslt
npm run serve:v2  // for plugin v2 to be served on http://localhost:8002
npm run serve:v7  // for plugin v7 to be served on http://localhost:8007
``` 

#### Serve command pre-requisite
Until the cli library will be ready, you will need to manually create the test page, using the following guide:
1. open folder `packages/plugin-v7/test` and copy file `index.template.ejs` as  `package/plugin-v7/test/index.ejs`
2. open `index.ejs` file and fill all places marked with `TODO` comment.
3. if you are creating plugin for v2 as well, repeat steps 1 and 2 in folder `packages/plugin-v2`.

### Build packages 
> Make sure you setup the repository using the `setup` command

This command will build the requested plugin folder and create dist folder with relevant assets 

Use one of the following:
```$xslt
npm run build:v2  // dist folder will be created under `packages/plugin-v2/dist`
npm run build:v7  // dist folder will be created under `packages/plugin-v7/dist`
``` 

### Analyze packages bundle
> Make sure you setup the repository using the `setup` command

This command will build and create a static page visualizing the bundle content.

Use one of the following:
```$xslt
npm run analyze:v2  // for plugin v2 bundle analyze to be shown automatically in the browser
npm run analyze:v7  // for plugin v7 bundle analyze to be shown automatically in the browser
``` 


### Reset repository
> You must run the setup command after this command.

This command will delete the `dist` and `node_modules` folders in all packages and in root folder.


This command is shared to both plugins (v2 & v7):
```$xslt
npm run reset
``` 


### Update OVP infrastructure dependencies
> Make sure you setup the repository using the `setup` command

This command will update packages to use `latest` or `next` version of the shared ovp infrastructure.

To update to `latest` version use one of the following:
```$xslt
npm run update:latest // upgrade both v2 and v7 to latest vesrion
npm run update:v2:latest // upgrade v2 to latest version
npm run update:v7:latest // upgrade v7 to latest version
```

To update to `next` version use one of the following:
```$xslt
npm run update:next // upgrade both v2 and v7 to next vesrion
npm run update:v2:next // upgrade v2 to next version
npm run update:v7:next // upgrade v7 to next version
```
