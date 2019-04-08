# IVQ plugin - Kaltura Player V2

### Test locally
1. copy file `src/test.template.ejs` to `src/test.ejs`
2. optional, update the entry id, partner id and ks. You can keep the existing values to see an entry with ivq defined.
3. run `npm run start`

### Deploy plugin to production
IVQ plugin is deployed to production as part of [mwEmbed repo](https://github.com/kaltura/mwEmbed). To deploy it do the following:
1. run `npm run build`
2. copy `dist/bundle.min.js` into `modules/ivq/resources/ivq.js` in [mwEmbed repo](https://github.com/kaltura/mwEmbed).
3. test it with the test page `modules/ivq/tests/ivq.test.html` (using xamp or mamp). for example `http://localhost:8888/html5.kaltura/mwEmbed/modules/ivq/tests/ivq.test.html` 

	* if needed you can enable debug logs in console by using a query string `?debugKalturaPlayer` and filtering messages with `[ivq]` in the console.
4. once satisfied commit and push changes **in this branch**.
5. update library version in `package.json` and modify `CHANGELOG.md` file. commit your changes and create a release in github.
6. update `modules/ivq/readme.md` in [mwEmbed repo](https://github.com/kaltura/mwEmbed).
7. commit and push changes in [mwEmbed repo](https://github.com/kaltura/mwEmbed).
8. go grab a coffee.

### Deploy side branch to QA environment

Do the following in [mwEmbed repo](https://github.com/kaltura/mwEmbed):
1. create a **side branch** from the relevant mwEmbed version branch, ie `2.73-ivq-0.2.0`
	* You should not create a Pullrequest for this branch, as the value you are changing is handled automatically by the player. 
1. create a temp version name in `includes/DefaultSettings.php`, ie:
```
// The version of the library:
$wgMwEmbedVersion = '2.73_ivq_0.2.0';
```
1. commit your changes in the side branch
2. create a tag using the following command (replace `X.X` with target player version and `Z.Z.Z` with ivq plugin version)
```
git tag -a vX.X_ivq_vZ.Z.Z -m "vX.X_ivq_vZ.Z.Z"
git push origin vX.X_ivq_vZ.Z.Z
```

