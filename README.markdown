# simple-postMessage: <br>The cross-domain messaging helper #

Version: 0.0.1, Last updated: 06d/10m/2014y

simple-postMessage enables simple and easy `window.postMessage()` communication in browsers that support the HTML5 API
(FF3+, Safari 4+, IE8+), while falling back to a `document.location.hash` communication method for all other browsers (IE6 and IE7 mainly).

*simple-postMessage uses `JSON.parse/stringify()` to post/receive JavaScript objects as message on IE9 and IE8 (although, IE8 compat. mode has no JSON and you'll need [Crockford's json.js](https://github.com/douglascrockford/JSON-js) to support it).*

*simple-postMessage uses `encode/decodeURIComponent()` to send safe messages on older browsers (and fixes Mozilla's "+" problem).*

**IE8 (and lower) doesn’t allow to postMessage to other windows, only to iframes.**

**[Crockford's json.js](https://github.com/douglascrockford/JSON-js) allows IE7 and IE6 to send object as message.**

## Releases ##

none yet


## History ##

Based on [Ben Alman's jQuery-postMessage](http://benalman.com/projects/jquery-postmessage-plugin/)
and the clean [Thomas Sturm's ender-postMessage](https://github.com/thomassturm/ender-postmessage)

## License ##

Dual licensed under the MIT and GPL licenses.  

original jQuery-postMessage code:
Copyright (c) 2009 "Cowboy" Ben Alman  
Dual licensed under the MIT and GPL licenses.  
[http://benalman.com/about/license/](http://benalman.com/about/license/)
