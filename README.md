# chisv-helper
Adds some useful features to the chisv tool

## Installation instructions
### Firefox 🦊
1. Drag and Drop .xpi file (from the [latest release](https://github.com/deichcode/chisv-helper/releases/latest)) into browser or maybe also double click could work

### Chrome 🐙
#### Via Chrome Web Store
Download it from the [Chrome Web Store](https://chrome.google.com/webstore/detail/chisv-helper/ihbafjoepnjdodohjcajljollcpmdabd?hl=en-US)

#### Install Manually
1. Extract chrome-vX.X.X.zip file (from the [latest release](https://github.com/deichcode/chisv-helper/releases/latest))
2. Open Extensions page in Chrome (Click the puzzle icon in the top right and then select **Manage Extensions** in the drop-down)
![extensions-chrome](https://user-images.githubusercontent.com/5639787/117260391-08366800-ae1d-11eb-9b9f-0b5602a2edc3.png)
3. Enable Developer Mode in the upper right
  * ![grafik](https://user-images.githubusercontent.com/5639787/117260720-5d727980-ae1d-11eb-95ba-7f417ee33a45.png)
4. Click ‘Load unpacked’
5. Select the previously extracted folder (not one of the files inside the folder but the whole folder)


## Release instructions
### Preperations
1. Update the version in the **manifest.json** according to [semantic versioning](https://semver.org).

### Firefox 🦊
1. If not already done install the [web-ext](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign) command line tool.
2. Set the value of "manifest_version" in **manifest.json** to 2, to maintain be compatible to Firefox (discard the change before checking in the code.
3. Make a test run by execute `web-ext run` at the project's root level.
4. Run `web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET id=$WEB_EXT_ID` at the project's root level to create a signed package. Replace `$AMO_JWT_ISSUER` and `$AMO_JWT_SECRET` with the [Mozilla Api-Key](https://addons.mozilla.org/en-US/developers/addon/api/key/) values. Furthermore, replace `$WEB_EXT_ID` by the [plugins UUID](https://addons.mozilla.org/en-US/developers/addons) (with curly-brackets).
5. Upload the resulting file to a new release in GitHub
6. Enter the location of the new version into the `update.json` file
7. Commit and push the `update.json` file

### Chrome 🐙
1. Create a zip file that contains all repositories content. The root level of the zip file must mirror the root level of the repository.
2. Upload the zip to the [Chrome Web Store Developer Console](https://chrome.google.com/u/1/webstore/devconsole)

