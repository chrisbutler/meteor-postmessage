/* simple postMessage - v0.1.0
 * by Leonardo Dutra (https://github.com/LeoDutra/simple-postmessage)
 * Dual licensed under the MIT and GPL licenses.
 *
 * based on
 *
 * ender postMessage - v0.1.3 - 5/1/2012
 * by Thomas Sturm http://www.sturm.to
 * Dual licensed under the MIT and GPL licenses.
 *
 * based on 
 *
 * jQuery postMessage - v0.5 - 9/11/2009
 * http://benalman.com/projects/jquery-postmessage-plugin/
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Release History
// visit https://github.com/LeoDutra/simple-postmessage/releases
//
//
// ender postMessage
// 0.1.3 - (5/1/2012) compatible with browserify
// 0.1.2 - (5/26/2011) Initial Fork and Release
//
// jQuery postMessage
// 0.5 - (9/11/2009) Improved cache-busting
// 0.4 - (8/25/2009) Initial release

!function (window) {
     // A few vars used in non-awesome browsers
     var interval_id,
	  last_hash,
	  original_hash,
	  cache_bust = 0,
		
	  // A var used in awesome browsers.
	  rm_callback,
		
	  // A few convenient shortcuts.
	  FALSE = !1,
		
	  // Reused internal strings.
	  postMessage = 'postMessage',
	  addEventListener = 'addEventListener',

	  // feature detection  
      has_postMessage = window[postMessage],
      JSON = window.JSON, // IE8+ has JSON. IE8 compatibility mode has no JSON. Crockford's json.js can be used

      // ie 10- version detection. Useful to fix IE9 and IE8 problem when passing objects as message
      //   http://stackoverflow.com/a/15983064/1260526
      ua = navigator.userAgent.toLowerCase(),
      IE_VERSION = ~ua.indexOf('msie') && parseInt(ua.split('msie')[1], 10); // "~"" -> "x !== -1"

      var serialize = function(any) {
      	return JSON ? JSON.stringify(any) : any;
      };

      var deserialize = function(any) {
        return JSON ? JSON.parse(any) : any;
      };
	
	  // Method: window.postMessage
	  // 
	  // This method will call window.postMessage if available, setting the
	  // targetOrigin parameter to the base of the target_url parameter for maximum
	  // security in browsers that support it. If window.postMessage is not available,
	  // the target window's location.hash will be used to pass the message. 
	  //
	  // Please Note: This version does not support the jQuery object serialization 
	  // for postMessage
	  // 
	  // Usage:
	  // 
	  // > window.postMessage( message, target_url [, target ] );
	  // 
	  // Arguments:
	  // 
	  //  message - (String) A message to be passed to the other frame.
	  //  target_url - (String) The URL of the other frame this window is
	  //    attempting to communicate with. This must be the exact URL (including
	  //    any query string) of the other window for this script to work in
	  //    browsers that don't support window.postMessage.
	  //  target - (Object) A reference to the other frame this window is
	  //    attempting to communicate with. If omitted, defaults to `parent`.
	  // 
	  // Returns:
	  // 
	  //  Nothing.
	  
	  window.simplePostMessage = function( message, target_url, target ) {
		if (!target_url) return;
		
		// Try to default to opener, parent if unspecified or cross-domain
		//   https://developer.mozilla.org/en-US/docs/Web/API/Window.opener
		//   https://developer.mozilla.org/en-US/docs/Web/API/Window.parent
		target = target || opener || parent;
		
		// The browser supports window.postMessage, so call it with a targetOrigin
		// set appropriately, based on the target_url parameter.
		if ( has_postMessage ) {

		  // IE9 and IE8 postMessage cannot send JS objects as message. Stringify is applied
		  // works for IE7, IE6 if Crockford's json.js is present
		  if ( IE_VERSION < 10 ) { 
		    message = serialize(message);
		  }

		  target[postMessage]( message, target_url.replace( /([^:]+:\/\/[^\/]+).*/, '$1' ) );
		}

		  // The browser does not support window.postMessage, so set the location
		  // of the target to target_url#message. A bit ugly, but it works! A cache
		  // bust parameter is added to ensure that repeat messages trigger the
		  // callback.
		else {	

		  // encodeURIComponent prevents errors when sending URLs and invalid URI characters
		  target.location = target_url.replace( /#.*$/, '' ) + '#' + (+new Date) + (++cache_bust) + '&' + encodeURIComponent(serialize(message));
		}
	  };
	  
	  // Method: window.receiveMessage
	  // 
	  // Register a single callback for either a window.postMessage call, if
	  // supported, or if unsupported, for any change in the current window
	  // location.hash. If window.postMessage is supported and source_origin is
	  // specified, the source window will be checked against this for maximum
	  // security. If window.postMessage is unsupported, a polling loop will be
	  // started to watch for changes to the location.hash.
	  // 
	  // Note that for simplicity's sake, only a single callback can be registered
	  // at one time. Passing no params will unbind this event (or stop the polling
	  // loop), and calling this method a second time with another callback will
	  // unbind the event (or stop the polling loop) first, before binding the new
	  // callback.
	  // 
	  // Also note that if window.postMessage is available, the optional
	  // source_origin param will be used to test the event.origin property. From
	  // the MDC window.postMessage docs: This string is the concatenation of the
	  // protocol and "://", the host name if one exists, and ":" followed by a port
	  // number if a port is present and differs from the default port for the given
	  // protocol. Examples of typical origins are https://example.org (implying
	  // port 443), http://example.net (implying port 80), and http://example.com:8080.
	  // 
	  // Usage:
	  // 
	  // > window.receiveMessage( callback [, source_origin ] [, hashModeDelay ] );
	  // 
	  // Arguments:
	  // 
	  //  callback - (Function) This callback will execute whenever a <window.postMessage>
	  //    message is received, provided the source_origin matches. If callback is
	  //    omitted, any existing receiveMessage event bind or polling loop will be
	  //    canceled.
	  //  source_origin - (String) If window.postMessage is available and this value
	  //    is not equal to the event.origin property, the callback will not be
	  //    called.
	  //  source_origin - (Function) If window.postMessage is available and this
	  //    function returns false when passed the event.origin property, the
	  //    callback will not be called.
	  //  hashModeDelay - (Number) An optional zero-or-greater delay in milliseconds at
	  //    which the polling loop will execute (for browser that don't support
	  //    window.postMessage). If omitted, defaults to 100.
	  // 
	  // Returns:
	  // 
	  //  Nothing!
	  
	  window.simpleReceiveMessage = function( callback, source_origin, hashModeDelay ) {
	  	var source_origin_type = typeof source_origin;
		if ( has_postMessage ) {
		  // Since the browser supports window.postMessage, the callback will be
		  // bound to the actual event associated with window.postMessage.
		  
		  if ( callback ) {
			// Unbind an existing callback if it exists.
			rm_callback && window.simpleReceiveMessage();
			
			// Bind the callback. A reference to the callback is stored for ease of
			// unbinding.
			rm_callback = function(e) {
			  if ( ( source_origin_type === 'string' && e.origin !== source_origin )
				|| ( source_origin_type === 'function' && source_origin( e.origin ) === FALSE ) ) {
				return FALSE;
			  }
			  // IE9 and IE8 postMessage cannot send JS objects as message. Stringify is applied
			  // works for IE7, IE6 if Crockford's json.js is present
			  if ( IE_VERSION < 10 ) { 
			    e.data = deserialize(e.data);
			  }
			  callback( e );
			};
		  }
		  
		  if ( window[addEventListener] ) {
			window[ callback ? addEventListener : 'removeEventListener' ]( 'message', rm_callback, FALSE );
		  } else {
			window[ callback ? 'attachEvent' : 'detachEvent' ]( 'onmessage', rm_callback );
		  }
		  
		} else {
		  // Since the browser sucks, a polling loop will be started, and the
		  // callback will be called whenever the location.hash changes.
		  
		  if ( interval_id ) {
		    interval_id = clearInterval( interval_id );
		  }
		  
		  if ( callback ) {
			hashModeDelay = source_origin_type === 'number'
			  ? source_origin
			  : typeof hashModeDelay === 'number'
				? hashModeDelay
				: 100;
			
			original_hash = document.location.hash;
			
			interval_id = setInterval(function(){
			  var hash = document.location.hash,
				re = /^#?\d+&/;
			  if ( hash !== last_hash && hash !== original_hash && re.test( hash ) ) {
				last_hash = hash;
				document.location.hash = original_hash ? original_hash : '';
				callback({ 

					// replace(/\+/gim, ' ') fixes a Mozilla bug
					//   http://stackoverflow.com/questions/75980/best-practice-escape-or-encodeuri-encodeuricomponent/12796866#comment30658935_12796866
					data: deserialize(decodeURIComponent(hash.replace( re, '' ).replace(/\+/gim, ' ')))
				}); 
			  }
			}, hashModeDelay );
		  }
		}
	  };

}(window);
