# simple-postMessage: <br>The cross-domain messaging helper #

Version: 0.2.0, Last updated: 06d/10m/2014y

Use simple-postMessage if you want to securely communicate IFrame content script with it's parent document/window, even on cross-domain interactions.

simple-postMessage enables simple and easy `window.postMessage()` communication in browsers that support the HTML5 API
(FF3+, Safari 4+, IE8+), while falling back to a `document.location.hash` communication method for all other browsers (IE6 and IE7 mainly).

*simple-postMessage uses `JSON.parse/stringify()` to post/receive JavaScript objects as message on IE9 and IE8 (although, IE8 compat. mode has no JSON and you'll need [Crockford's json2.js](https://github.com/douglascrockford/JSON-js) to optionally support it).*

*simple-postMessage uses `encodeURIComponent/decodeURIComponent()` to send safe messages on older browsers (and fixes Mozilla's "+" problem).*

**IE8 (and lower) doesn’t allow to postMessage to other windows, only to iframes.**

**[Crockford's json2.js or json.js](https://github.com/douglascrockford/JSON-js) allows IE7 and IE6 to send object as message and is required if you want total compatibility between modern browsers + IE7/IE6.**

## Using it ##

Just import simple-postMessage.js (json2.js is an optional to support object serialization on IE8 compat., IE7 and IE6),
and use `simplePostMessage(message, target_url, target)` to send messages and `simpleReceiveMessage(callback, source_origin)` to receive them.


## Releases ##

Visit the [releases section](https://github.com/LeoDutra/simple-postmessage/releases)


## History ##

Based on [Ben Alman's jQuery-postMessage](http://benalman.com/projects/jquery-postmessage-plugin/)
and the clean [Thomas Sturm's ender-postMessage](https://github.com/thomassturm/ender-postmessage)

## License ##

Dual licensed under the MIT and GPL licenses.  

original jQuery-postMessage code:
Copyright (c) 2009 "Cowboy" Ben Alman  
Dual licensed under the MIT and GPL licenses.  
[http://benalman.com/about/license/](http://benalman.com/about/license/)
