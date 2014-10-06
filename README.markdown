# simple-postMessage: Cross-Domain Messaging #

Version: 0.0.1, Last updated: 06d/10m/2014y

Based on [Ben Alman's jQuery-postMessage](http://benalman.com/projects/jquery-postmessage-plugin/)
and [Thomas Sturm's ender-postMessage](https://github.com/thomassturm/ender-postmessage)

simple-postMessage enables simple and easy window.postMessage communication in browsers that support it (FF3+, Safari 4+, IE8+), while falling back to a document.location.hash communication method for all other browsers (IE6, IE7).

*simple-postMessage uses `JSON.parse/stringify()` to post/receive JavaScript objects as message on IE9 and IE8 (although, IE8 compat. mode has no JSON and you'll need Crockford's json.js to support it).*

*simple-postMessage uses `encode/decodeURIComponent()` to send safe messages on older browsers (and fixes Mozilla's "+" problem).*

** IE8 doesn’t allow to postMessage to other windows, only to iframes. **

## Release History ##

none yet


## License ##

Dual licensed under the MIT and GPL licenses.  

original jQuery-postMessage code:
Copyright (c) 2009 "Cowboy" Ben Alman  
Dual licensed under the MIT and GPL licenses.  
[http://benalman.com/about/license/](http://benalman.com/about/license/)

many thanks to [Thomas Sturm](https://github.com/thomassturm/) for the [ender-postMessage version](https://github.com/thomassturm/ender-postmessage).
