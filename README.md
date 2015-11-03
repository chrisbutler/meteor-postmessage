# meteor-postMessage: <br>Cross-domain messaging helper #

Use meteor-postMessage if you want to securely communicate IFrame content script with it's parent document/window, even on cross-domain interactions.

## Usage ##

Install by running `meteor add chrisbutler:postmessage` and use `simplePostMessage(message, target_url, target)` to send messages and `simpleReceiveMessage(callback, source_origin)` to receive them.

## About ##

meteor-postMessage enables simple and easy `postMessage` communication in browsers that support the HTML5 API (FF3+, Safari 4+, IE8+), while falling back to a `document.location.hash` communication method for all other browsers (IE6 and IE7 mainly).

*meteor-postMessage uses `JSON.parse/stringify()` to post/receive JavaScript objects as message on IE9 and IE8 (although IE8 compat. mode has no JSON and you'll need [Crockford's json2.js](https://github.com/douglascrockford/JSON-js) to optionally support it).*

*meteor-postMessage uses `encodeURIComponent/decodeURIComponent()` to send safe messages on older browsers (and fixes Mozilla's "+" problem).*



## Compatibility ##

**IE8 (and lower) doesn’t allow to postMessage to other windows, only to iframes.**

**[Crockford's json2.js or json.js](https://github.com/douglascrockford/JSON-js) allows IE7 and IE6 to send object as message and is required if you want total compatibility between modern browsers + IE7/IE6.**
Just import meteor-postMessage.js (json2.js is an optional to support object serialization on IE8 compat., IE7 and IE6),

## History ##

Based on [Ben Alman's jQuery-postMessage](http://benalman.com/projects/jquery-postmessage-plugin/)
and [Thomas Sturm's ender-postMessage](https://github.com/thomassturm/ender-postmessage)
and improvements from [Leonardo Dutra's simple-postMessage](https://github.com/LeoDutra/simple-postmessage/)
