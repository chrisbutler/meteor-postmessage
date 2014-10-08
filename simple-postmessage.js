/* simple postMessage - v0.2.1
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
//   visit https://github.com/LeoDutra/simple-postmessage/releases
//
// Fork history
//   ender postMessage
//   0.1.3 - (5/1/2012) compatible with browserify
//   0.1.2 - (5/26/2011) Initial Fork and Release
//
//   jQuery postMessage
//   0.5 - (9/11/2009) Improved cache-busting
//   0.4 - (8/25/2009) Initial release

(function(window) {
    "use strict";

    var queueInterval = 0,
        receiveInterval = 0,
        hashQueue = [],
        last_hash, 
        original_hash, 
        receiveCallback, 
        cache_bust = 0,
        INTERNAL_HASH_DELAY = 100,
        INTERNAL_QUEUE_DELAY = INTERNAL_HASH_DELAY + 20, // FIXME: using "+ms" against collisions / bad CPU times 
        FALSE = !1, // BETTER MINIFICATION
        POST_MESSAGE = "postMessage",
        ADD_EVENT_LISTENER = "addEventListener",
        HAS_POSTMESSAGE = window[POST_MESSAGE],
        JSON = window.JSON;

        // ie 10- version detection. Useful to fix IE9 and IE8 problem when passing objects as message
        //   http://stackoverflow.com/a/15983064/1260526
        var USER_AGENT = navigator.userAgent.toLowerCase(),
        IE_FIX = ~USER_AGENT.indexOf("msie") ? parseInt(USER_AGENT.split("msie")[1], 10) < 10 : FALSE;


    function serialize(any) {
        return JSON ? JSON.stringify(any) : any;
    }
    
    function deserialize(any) {
        return JSON ? JSON.parse(any) : any;
    }

    // function locationOrigin(target) { 
    //     var loc = target.location;
    //     return loc.origin || loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '');
    // }
    
    function locationWithoutHash(target) {
        return target.location.href.replace(target.location.hash, '');
    }

    function sendHash(target, hash) {
        target.location = hash;
    }

    function queueToSend(target, hash) {
        if (queueInterval) {
            hashQueue.push({target: target, hash: hash}); // queue our baby
        }
        else {
            sendHash(target, hash); // first is always sent and starts queue verification
            
            if (!queueInterval) queueInterval = setInterval(function() {
                if (hashQueue.length) {
                    var current = hashQueue.shift();
                    var ex;
                    try { // FIXME: try/catch reason: maybe target window was closed! Better be safe
                        sendHash(current.target, current.hash);
                    }
                    catch(ex) {}
                }
                else if (queueInterval) { // SHALL require this additional cycle before clear 
                    clearInterval(queueInterval);
                    queueInterval = 0;
                }
            }, INTERNAL_QUEUE_DELAY); 
        }
    }

    function copyProperties(obj) {
        // the damn Message Event is immutable... so we copy it for set deserialization to data
        var copy = {};
        for (var prop in obj) {
            if (typeof prop !== "function") { // hasOwnProperty = no property :(
                copy[prop] = obj[prop];
            }
        }
        return copy;
    }

    // Method: window.postMessage
    // 
    // This method will call native window.postMessage if available, setting the
    // targetOrigin parameter to the base of the target_url parameter for maximum
    // security in browsers that support it. If window.postMessage is not available,
    // the target window's location.hash will be used to pass the message, and an internal queue
    // will handle message multiplicity.
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
    //    attempting to communicate with. If omitted, defaults to `opener`, then `parent`
    //    and then `window`
    // 
    // Returns:
    //    (Nothing)
    //
    // Throws:
    //    Error - when no target_url (nor "*") is defined
    //
    window.simplePostMessage = function(message, target_url, target) {

        if (!target_url) throw 'simplePostMessage:: "target_url" expects at least a "*" (any target).';
        
        // opener is not null when this came from window.open(), parent is not null when this is inside of an iframe
        target = target || opener || parent || window; 
        
        // The browser supports window.postMessage, so call it with a targetOrigin
        // set appropriately, based on the target_url parameter.
        if (HAS_POSTMESSAGE) { // USE NATIVE POST MESSAGE -------------
        
            if (IE_FIX) { 
                // IE9- can't pass objects as message. Serialize using JSON.stringify (need Crockford's json2.js for IE8Compat, IE7 & IE6)
                message = serialize(message);
            }
            // only "schema://host:port" is needed
            // defaults to "*" (any), which is bad for security but is an option of the spec
            target[POST_MESSAGE](message, target_url === '*' ? target_url : target_url.replace(/([^:]+:\/\/[^\/]+).*/, "$1")); 
        } 
        else { // USE HASH ALTERNATIVE POST MESSAGE -------------
            // The browser does not support window.postMessage, so set the location
            // of the target to target_url#message. A bit ugly, but it works! A cache
            // bust parameter is added to ensure that repeat messages trigger the
            // callback.

            // target_url === '*', get the location of the target without hash (prevent bugs)
            target_url = target_url === '*' ? locationWithoutHash(target) : target_url.replace(/#.*$/, "");
            
            // encodeURIComponent avoids problem with invalid URL chars
            queueToSend(target, target_url + "#--HASH--" + (+new Date) + (++cache_bust) + "&" + encodeURIComponent(serialize(message)))
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
    //  source_origin - if source_origin is not defined, or is "*", the callback IS ALWAYS called
    //  source_origin - (String) If window.postMessage is available and this value
    //    is not equal to the event.origin property, the callback WILL NOT be
    //    called.
    //  source_origin - (Function) If window.postMessage is available and this
    //    function returns false when passed the event.origin property, the
    //    callback WILL NOT be called.
    //  source_origin - (Array) If window.postMessage is available and this
    //    array does not contain the event.origin property value, the
    //    callback WILL NOT be called.
    //  hashModeDelay - (Number) An optional zero-or-greater delay in milliseconds at
    //    which the polling loop will execute (for browser that don't support
    //    window.postMessage). If omitted, defaults to 100.
    // 
    // Returns:
    //   (Nothing)
    //
    window.simpleReceiveMessage = function(callback, source_origin/*="*"*/) {

        var source_origin_type = typeof source_origin;
        
        // isArray?
        if (source_origin_type === 'object' && Object.prototype.toString.call(source_origin) === '[object Array]') {
            source_origin_type = 'array';
        }

        if (HAS_POSTMESSAGE) {  // USE NATIVE RECEIVER -------------
            // Since the browser supports window.postMessage, the callback will be
            // bound to the actual event associated with window.postMessage.

            if (callback) {
                // Unbind an existing callback if it exists (yes, recursive call without args)
                if (receiveCallback) window.simpleReceiveMessage();

                // Bind the callback. A reference to the callback is stored for ease of unbinding.
                receiveCallback = function(messageEvent) {
                    if (!source_origin || source_origin === '*' || // listens to all
                        /*STRING*/  source_origin_type === "string" && messageEvent.origin === source_origin ||
                        /*FUNCTION*/source_origin_type === "function" && source_origin(messageEvent.origin) ||
                        /*ARRAY*/   source_origin_type === "array" && ~source_origin.indexOf(messageEvent.origin)) {

                        if (IE_FIX) {
                            messageEvent = copyProperties(messageEvent); // the damn Message Event is immutable... so we copy it for set deserialization to data

                            // IE9- can't pass objects as message. Deserialize  using JSON.parse (need Crockford's json2.js for IE8Compat, IE7 & IE6)
                            messageEvent.data = deserialize(messageEvent.data); 
                        }

                        callback(messageEvent);
                    }
                };
            }

            if (window[ADD_EVENT_LISTENER]) { // good browser / horrible browser ?
                window[callback ? ADD_EVENT_LISTENER : "removeEventListener"]("message", receiveCallback, FALSE);
            } else {
                window[callback ? "attachEvent" : "detachEvent"]("onmessage", receiveCallback);
            }

        } 
        else { // USE ARTIFICIAL RECEIVER FOR HASH ALTERNATIVE -------------
            // Since the browser sucks, a polling loop will be started, and the
            // callback will be called whenever the location.hash changes.

            if (receiveInterval) {
                receiveInterval = clearInterval(receiveInterval);
            }
            if (callback) {
                //hashModeDelay = source_origin_type === "number" ? source_origin : typeof hashModeDelay === "number" ? hashModeDelay : INTERNAL_HASH_DELAY;
                original_hash = document.location.hash;
                receiveInterval = setInterval(function() {
                    var hash = document.location.hash;
                    var re = /^#?--HASH--\d+&/;
                    if (hash !== last_hash && hash !== original_hash && re.test(hash)) {
                        last_hash = hash;
                        document.location.hash = original_hash ? original_hash : "";
                        callback({
                            // replace(/\+/gim, ' ') fixes a Mozilla bug
                            //   http://stackoverflow.com/questions/75980/best-practice-escape-or-encodeuri-encodeuricomponent/12796866#comment30658935_12796866
                            data: deserialize(decodeURIComponent(hash.replace(re, "").replace(/\+/gim, " ")))
                        });
                    }
                }, INTERNAL_HASH_DELAY);
            }
        }
    };
})(window);
