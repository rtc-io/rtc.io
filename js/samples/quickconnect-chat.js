(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var quickconnect = require('rtc-quickconnect');

quickconnect('http://rtc.io/switchboard/', { room: 'chat-tutorial' })
  .createDataChannel('chat')
  .on('chat:open', function(dc, id) {
    console.log('a data channel has been opened to peer: ' + id);
  });
},{"rtc-quickconnect":11}],2:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
## cog/defaults

```js
var defaults = require('cog/defaults');
```

### defaults(target, *)

Shallow copy object properties from the supplied source objects (*) into
the target object, returning the target object once completed.  Do not,
however, overwrite existing keys with new values:

```js
defaults({ a: 1, b: 2 }, { c: 3 }, { d: 4 }, { b: 5 }));
```

See an example on [requirebin](http://requirebin.com/?gist=6079475).
**/
module.exports = function(target) {
  // ensure we have a target
  target = target || {};

  // iterate through the sources and copy to the target
  [].slice.call(arguments, 1).forEach(function(source) {
    if (! source) {
      return;
    }

    for (var prop in source) {
      if (target[prop] === void 0) {
        target[prop] = source[prop];
      }
    }
  });

  return target;
};
},{}],3:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
## cog/extend

```js
var extend = require('cog/extend');
```

### extend(target, *)

Shallow copy object properties from the supplied source objects (*) into
the target object, returning the target object once completed:

```js
extend({ a: 1, b: 2 }, { c: 3 }, { d: 4 }, { b: 5 }));
```

See an example on [requirebin](http://requirebin.com/?gist=6079475).
**/
module.exports = function(target) {
  [].slice.call(arguments, 1).forEach(function(source) {
    if (! source) {
      return;
    }

    for (var prop in source) {
      target[prop] = source[prop];
    }
  });

  return target;
};
},{}],4:[function(require,module,exports){
/**
  ## cog/getable

  Take an object and provide a wrapper that allows you to `get` and
  `set` values on that object.

**/
module.exports = function(target) {
  function get(key) {
    return target[key];
  }

  function set(key, value) {
    target[key] = value;
  }

  function remove(key) {
    return delete target[key];
  }

  function keys() {
    return Object.keys(target);
  };

  function values() {
    return Object.keys(target).map(function(key) {
      return target[key];
    });
  };

  if (typeof target != 'object') {
    return target;
  }

  return {
    get: get,
    set: set,
    remove: remove,
    delete: remove,
    keys: keys,
    values: values
  };
};

},{}],5:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ## cog/jsonparse

  ```js
  var jsonparse = require('cog/jsonparse');
  ```

  ### jsonparse(input)

  This function will attempt to automatically detect stringified JSON, and
  when detected will parse into JSON objects.  The function looks for strings
  that look and smell like stringified JSON, and if found attempts to
  `JSON.parse` the input into a valid object.

**/
module.exports = function(input) {
  var isString = typeof input == 'string' || (input instanceof String);
  var reNumeric = /^\-?\d+\.?\d*$/;
  var shouldParse ;
  var firstChar;
  var lastChar;

  if ((! isString) || input.length < 2) {
    if (isString && reNumeric.test(input)) {
      return parseFloat(input);
    }

    return input;
  }

  // check for true or false
  if (input === 'true' || input === 'false') {
    return input === 'true';
  }

  // check for null
  if (input === 'null') {
    return null;
  }

  // get the first and last characters
  firstChar = input.charAt(0);
  lastChar = input.charAt(input.length - 1);

  // determine whether we should JSON.parse the input
  shouldParse =
    (firstChar == '{' && lastChar == '}') ||
    (firstChar == '[' && lastChar == ']') ||
    (firstChar == '"' && lastChar == '"');

  if (shouldParse) {
    try {
      return JSON.parse(input);
    }
    catch (e) {
      // apparently it wasn't valid json, carry on with regular processing
    }
  }


  return reNumeric.test(input) ? parseFloat(input) : input;
};
},{}],6:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ## cog/logger

  ```js
  var logger = require('cog/logger');
  ```

  Simple browser logging offering similar functionality to the
  [debug](https://github.com/visionmedia/debug) module.

  ### Usage

  Create your self a new logging instance and give it a name:

  ```js
  var debug = logger('phil');
  ```

  Now do some debugging:

  ```js
  debug('hello');
  ```

  At this stage, no log output will be generated because your logger is
  currently disabled.  Enable it:

  ```js
  logger.enable('phil');
  ```

  Now do some more logger:

  ```js
  debug('Oh this is so much nicer :)');
  // --> phil: Oh this is some much nicer :)
  ```

  ### Reference
**/

var active = [];
var unleashListeners = [];
var targets = [ console ];

/**
  #### logger(name)

  Create a new logging instance.
**/
var logger = module.exports = function(name) {
  // initial enabled check
  var enabled = checkActive();

  function checkActive() {
    return enabled = active.indexOf('*') >= 0 || active.indexOf(name) >= 0;
  }

  // register the check active with the listeners array
  unleashListeners[unleashListeners.length] = checkActive;

  // return the actual logging function
  return function() {
    var args = [].slice.call(arguments);

    // if we have a string message
    if (typeof args[0] == 'string' || (args[0] instanceof String)) {
      args[0] = name + ': ' + args[0];
    }

    // if not enabled, bail
    if (! enabled) {
      return;
    }

    // log
    targets.forEach(function(target) {
      target.log.apply(target, args);
    });
  };
};

/**
  #### logger.reset()

  Reset logging (remove the default console logger, flag all loggers as
  inactive, etc, etc.
**/
logger.reset = function() {
  // reset targets and active states
  targets = [];
  active = [];

  return logger.enable();
};

/**
  #### logger.to(target)

  Add a logging target.  The logger must have a `log` method attached.

**/
logger.to = function(target) {
  targets = targets.concat(target || []);

  return logger;
};

/**
  #### logger.enable(names*)

  Enable logging via the named logging instances.  To enable logging via all
  instances, you can pass a wildcard:

  ```js
  logger.enable('*');
  ```

  __TODO:__ wildcard enablers
**/
logger.enable = function() {
  // update the active
  active = active.concat([].slice.call(arguments));

  // trigger the unleash listeners
  unleashListeners.forEach(function(listener) {
    listener();
  });

  return logger;
};
},{}],7:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ## cog/throttle

  ```js
  var throttle = require('cog/throttle');
  ```

  ### throttle(fn, delay, opts)

  A cherry-pickable throttle function.  Used to throttle `fn` to ensure
  that it can be called at most once every `delay` milliseconds.  Will
  fire first event immediately, ensuring the next event fired will occur
  at least `delay` milliseconds after the first, and so on.

**/
module.exports = function(fn, delay, opts) {
  var lastExec = (opts || {}).leading !== false ? 0 : Date.now();
  var trailing = (opts || {}).trailing;
  var timer;
  var queuedArgs;
  var queuedScope;

  // trailing defaults to true
  trailing = trailing || trailing === undefined;
  
  function invokeDefered() {
    fn.apply(queuedScope, queuedArgs || []);
    lastExec = Date.now();
  }

  return function() {
    var tick = Date.now();
    var elapsed = tick - lastExec;

    // always clear the defered timer
    clearTimeout(timer);

    if (elapsed < delay) {
      queuedArgs = [].slice.call(arguments, 0);
      queuedScope = this;

      return trailing && (timer = setTimeout(invokeDefered, delay - elapsed));
    }

    // call the function
    lastExec = tick;
    fn.apply(this, arguments);
  };
};
},{}],8:[function(require,module,exports){
/* jshint node: true */
/* global window: false */
/* global navigator: false */

'use strict';

var browser = require('detect-browser');

/**
  ## rtc-core/detect

  A browser detection helper for accessing prefix-free versions of the various
  WebRTC types.

  ### Example Usage

  If you wanted to get the native `RTCPeerConnection` prototype in any browser
  you could do the following:

  ```js
  var detect = require('rtc-core/detect'); // also available in rtc/detect
  var RTCPeerConnection = detect('RTCPeerConnection');
  ```

  This would provide whatever the browser prefixed version of the
  RTCPeerConnection is available (`webkitRTCPeerConnection`,
  `mozRTCPeerConnection`, etc).
**/
var detect = module.exports = function(target, prefixes) {
  var prefixIdx;
  var prefix;
  var testName;
  var hostObject = this || (typeof window != 'undefined' ? window : undefined);

  // if we have no host object, then abort
  if (! hostObject) {
    return;
  }

  // initialise to default prefixes
  // (reverse order as we use a decrementing for loop)
  prefixes = (prefixes || ['ms', 'o', 'moz', 'webkit']).concat('');

  // iterate through the prefixes and return the class if found in global
  for (prefixIdx = prefixes.length; prefixIdx--; ) {
    prefix = prefixes[prefixIdx];

    // construct the test class name
    // if we have a prefix ensure the target has an uppercase first character
    // such that a test for getUserMedia would result in a
    // search for webkitGetUserMedia
    testName = prefix + (prefix ?
                            target.charAt(0).toUpperCase() + target.slice(1) :
                            target);

    if (typeof hostObject[testName] != 'undefined') {
      // update the last used prefix
      detect.browser = detect.browser || prefix.toLowerCase();

      // return the host object member
      return hostObject[target] = hostObject[testName];
    }
  }
};

// detect mozilla (yes, this feels dirty)
detect.moz = typeof navigator != 'undefined' && !!navigator.mozGetUserMedia;

// set the browser and browser version
detect.browser = browser.name;
detect.browserVersion = detect.version = browser.version;

},{"detect-browser":9}],9:[function(require,module,exports){
var browsers = [
  [ 'chrome', /Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/ ],
  [ 'firefox', /Firefox\/([0-9\.]+)(?:\s|$)/ ],
  [ 'opera', /Opera\/([0-9\.]+)(?:\s|$)/ ],
  [ 'ie', /Trident\/7\.0.*rv\:([0-9\.]+)\).*Gecko$/ ],
  [ 'ie', /MSIE\s([0-9\.]+);.*Trident\/[4-6].0/ ],
  [ 'ie', /MSIE\s(7\.0)/ ],
  [ 'bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/ ],
  [ 'android', /Android\s([0-9\.]+)/ ],
  [ 'ios', /iPad\;\sCPU\sOS\s([0-9\._]+)/ ],
  [ 'ios', /iPhone\;\sCPU\siPhone\sOS\s([0-9\._]+)/ ]
];

var match = browsers.map(match).filter(isMatch)[0];
var parts = match && match[3].split(/[._]/).slice(0,3);

while (parts && parts.length < 3) {
  parts.push('0');
}

// set the name and version
exports.name = match && match[0];
exports.version = parts && parts.join('.');

function match(pair) {
  return pair.concat(pair[1].exec(navigator.userAgent));
}

function isMatch(pair) {
  return !!pair[2];
}

},{}],10:[function(require,module,exports){
var detect = require('./detect');
var requiredFunctions = [
  'init'
];

function isSupported(plugin) {
  return plugin && typeof plugin.supported == 'function' && plugin.supported(detect);
}

function isValid(plugin) {
  var supportedFunctions = requiredFunctions.filter(function(fn) {
    return typeof plugin[fn] == 'function';
  });

  return supportedFunctions.length === requiredFunctions.length;
}

module.exports = function(plugins) {
  return [].concat(plugins || []).filter(isSupported).filter(isValid)[0];
}

},{"./detect":8}],11:[function(require,module,exports){
(function (process){
/* jshint node: true */
'use strict';

var rtc = require('rtc-tools');
var cleanup = require('rtc-tools/cleanup');
var debug = rtc.logger('rtc-quickconnect');
var signaller = require('rtc-signaller');
var defaults = require('cog/defaults');
var extend = require('cog/extend');
var getable = require('cog/getable');
var reTrailingSlash = /\/$/;

/**
  # rtc-quickconnect

  This is a high level helper module designed to help you get up
  an running with WebRTC really, really quickly.  By using this module you
  are trading off some flexibility, so if you need a more flexible
  configuration you should drill down into lower level components of the
  [rtc.io](http://www.rtc.io) suite.  In particular you should check out
  [rtc](https://github.com/rtc-io/rtc).

  ## Example Usage

  In the simplest case you simply call quickconnect with a single string
  argument which tells quickconnect which server to use for signaling:

  <<< examples/simple.js

  <<< docs/events.md

  <<< docs/examples.md

  ## Regarding Signalling and a Signalling Server

  Signaling is an important part of setting up a WebRTC connection and for
  our examples we use our own test instance of the
  [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard). For your
  testing and development you are more than welcome to use this also, but
  just be aware that we use this for our testing so it may go up and down
  a little.  If you need something more stable, why not consider deploying
  an instance of the switchboard yourself - it's pretty easy :)

  ## Reference

  ```
  quickconnect(signalhost, opts?) => rtc-sigaller instance (+ helpers)
  ```

  ### Valid Quick Connect Options

  The options provided to the `rtc-quickconnect` module function influence the
  behaviour of some of the underlying components used from the rtc.io suite.

  Listed below are some of the commonly used options:

  - `ns` (default: '')

    An optional namespace for your signalling room.  While quickconnect
    will generate a unique hash for the room, this can be made to be more
    unique by providing a namespace.  Using a namespace means two demos
    that have generated the same hash but use a different namespace will be
    in different rooms.

  - `room` (default: null) _added 0.6_

    Rather than use the internal hash generation
    (plus optional namespace) for room name generation, simply use this room
    name instead.  __NOTE:__ Use of the `room` option takes precendence over
    `ns`.

  - `debug` (default: false)

  Write rtc.io suite debug output to the browser console.

  #### Options for Peer Connection Creation

  Options that are passed onto the
  [rtc.createConnection](https://github.com/rtc-io/rtc#createconnectionopts-constraints)
  function:

  - `iceServers`

  This provides a list of ice servers that can be used to help negotiate a
  connection between peers.

  #### Options for P2P negotiation

  Under the hood, quickconnect uses the
  [rtc/couple](https://github.com/rtc-io/rtc#rtccouple) logic, and the options
  passed to quickconnect are also passed onto this function.

**/
module.exports = function(signalhost, opts) {
  var hash = typeof location != 'undefined' && location.hash.slice(1);
  var signaller = require('rtc-signaller')(signalhost, opts);

  // init configurable vars
  var ns = (opts || {}).ns || '';
  var room = (opts || {}).room;
  var debugging = (opts || {}).debug;
  var profile = {};
  var announced = false;

  // collect the local streams
  var localStreams = [];

  // create the calls map
  var calls = signaller.calls = getable({});

  // create the known data channels registry
  var channels = {};

  // save the plugins passed to the signaller
  var plugins = signaller.plugins = (opts || {}).plugins || [];

  function callCreate(id, pc, data) {
    calls.set(id, {
      active: false,
      pc: pc,
      channels: getable({}),
      data: data,
      streams: []
    });
  }

  function callEnd(id) {
    var call = calls.get(id);

    // if we have no data, then do nothing
    if (! call) {
      return;
    }

    debug('ending call to: ' + id);

    // if we have no data, then return
    call.channels.keys().forEach(function(label) {
      var channel = call.channels.get(label);
      var args = [id, channel, label];

      // emit the plain channel:closed event
      signaller.emit.apply(signaller, ['channel:closed'].concat(args));

      // emit the labelled version of the event
      signaller.emit.apply(signaller, ['channel:closed:' + label].concat(args));

      // decouple the events
      channel.onopen = null;
    });

    // trigger stream:removed events for each of the remotestreams in the pc
    call.streams.forEach(function(stream) {
      signaller.emit('stream:removed', id, stream);
    });

    // delete the call data
    calls.delete(id);

    // trigger the call:ended event
    signaller.emit('call:ended', id, call.pc);

    // ensure the peer connection is properly cleaned up
    cleanup(call.pc);
  }

  function callStart(id, pc, data) {
    var call = calls.get(id);
    var streams = [].concat(pc.getRemoteStreams());

    // flag the call as active
    call.active = true;
    call.streams = [].concat(pc.getRemoteStreams());

    pc.onaddstream = createStreamAddHandler(id);
    pc.onremovestream = createStreamRemoveHandler(id);

    debug(signaller.id + ' - ' + id + ' call start: ' + streams.length + ' streams');
    signaller.emit('call:started', id, pc, data);

    // examine the existing remote streams after a short delay
    process.nextTick(function() {
      // iterate through any remote streams
      streams.forEach(receiveRemoteStream(id));
    });
  }

  function createStreamAddHandler(id) {
    return function(evt) {
      debug('peer ' + id + ' added stream');
      updateRemoteStreams(id);
      receiveRemoteStream(id)(evt.stream);
    }
  }

  function createStreamRemoveHandler(id) {
    return function(evt) {
      debug('peer ' + id + ' removed stream');
      updateRemoteStreams(id);
      signaller.emit('stream:removed', id, evt.stream);
    };
  }

  function getActiveCall(peerId) {
    var call = calls.get(peerId);

    if (! call) {
      throw new Error('No active call for peer: ' + peerId);
    }

    return call;
  }

  function gotPeerChannel(channel, pc, data) {
    var channelMonitor;

    function channelReady() {
      var call = calls.get(data.id);
      var args = [ data.id, channel, data, pc ];

      // decouple the channel.onopen listener
      debug('reporting channel "' + channel.label + '" ready, have call: ' + (!!call));
      clearInterval(channelMonitor);
      channel.onopen = null;

      // save the channel
      if (call) {
        call.channels.set(channel.label, channel);
      }

      // trigger the %channel.label%:open event
      debug('triggering channel:opened events for channel: ' + channel.label);

      // emit the plain channel:opened event
      signaller.emit.apply(signaller, ['channel:opened'].concat(args));

      // emit the channel:opened:%label% eve
      signaller.emit.apply(
        signaller,
        ['channel:opened:' + channel.label].concat(args)
      );
    }

    debug('channel ' + channel.label + ' discovered for peer: ' + data.id);
    if (channel.readyState === 'open') {
      return channelReady();
    }

    debug('channel not ready, current state = ' + channel.readyState);
    channel.onopen = channelReady;

    // monitor the channel open (don't trust the channel open event just yet)
    channelMonitor = setInterval(function() {
      debug('checking channel state, current state = ' + channel.readyState);
      if (channel.readyState === 'open') {
        channelReady();
      }
    }, 500);
  }

  function handleLocalAnnounce(data) {
    // if we send an announce with an updated room then update our local room name
    if (data && typeof data.room != 'undefined') {
      room = data.room;
    }
  }

  function handlePeerAnnounce(data) {
    var pc;
    var monitor;

    // if the room is not a match, abort
    if (data.room !== room) {
      return;
    }

    // create a peer connection
    pc = rtc.createConnection(opts, (opts || {}).constraints);
    signaller.emit('peer:connect', data.id, pc, data);

    // add this connection to the calls list
    callCreate(data.id, pc, data);

    // add the local streams
    localStreams.forEach(function(stream, idx) {
      pc.addStream(stream);
    });

    // add the data channels
    // do this differently based on whether the connection is a
    // master or a slave connection
    if (signaller.isMaster(data.id)) {
      debug('is master, creating data channels: ', Object.keys(channels));

      // create the channels
      Object.keys(channels).forEach(function(label) {
       gotPeerChannel(pc.createDataChannel(label, channels[label]), pc, data);
      });
    }
    else {
      pc.ondatachannel = function(evt) {
        var channel = evt && evt.channel;

        // if we have no channel, abort
        if (! channel) {
          return;
        }

        if (channels[channel.label] !== undefined) {
          gotPeerChannel(channel, pc, data);
        }
      };
    }

    // couple the connections
    debug('coupling ' + signaller.id + ' to ' + data.id);
    monitor = rtc.couple(pc, data.id, signaller, opts);
    signaller.emit('peer:couple', data.id, pc, data, monitor);

    // once active, trigger the peer connect event
    monitor.once('connected', callStart.bind(null, data.id, pc, data))
    monitor.once('closed', callEnd.bind(null, data.id));

    // if we are the master connnection, create the offer
    // NOTE: this only really for the sake of politeness, as rtc couple
    // implementation handles the slave attempting to create an offer
    if (signaller.isMaster(data.id)) {
      monitor.createOffer();
    }
  }

  function handlePeerUpdate(data) {
    var id = data && data.id;
    var activeCall = id && calls.get(id);

    // if we have received an update for a peer that has no active calls,
    // then pass this onto the announce handler
    if (id && (! activeCall)) {
      debug('received peer update from peer ' + id + ', no active calls');
      return handlePeerAnnounce(data);
    }
  }

  function receiveRemoteStream(id) {
    var call = calls.get(id);

    return function(stream) {
      signaller.emit('stream:added', id, stream, call && call.data);
    };
  }

  function updateRemoteStreams(id) {
    var call = calls.get(id);

    if (call && call.pc) {
      call.streams = [].concat(call.pc.getRemoteStreams());
    }
  }

  // if the room is not defined, then generate the room name
  if (! room) {
    // if the hash is not assigned, then create a random hash value
    if (! hash) {
      hash = location.hash = '' + (Math.pow(2, 53) * Math.random());
    }

    room = ns + '#' + hash;
  }

  if (debugging) {
    rtc.logger.enable.apply(rtc.logger, Array.isArray(debug) ? debugging : ['*']);
  }

  signaller.on('peer:announce', handlePeerAnnounce);
  signaller.on('peer:update', handlePeerUpdate);
  signaller.on('peer:leave', callEnd);

  // announce ourselves to our new friend
  setTimeout(function() {
    var data = extend({}, profile, { room: room });

    // announce and emit the local announce event
    signaller.announce(data);
    announced = true;
  }, 0);

  /**
    ### Quickconnect Broadcast and Data Channel Helper Functions

    The following are functions that are patched into the `rtc-signaller`
    instance that make working with and creating functional WebRTC applications
    a lot simpler.

  **/

  /**
    #### addStream

    ```
    addStream(stream:MediaStream) => qc
    ```

    Add the stream to active calls and also save the stream so that it
    can be added to future calls.

  **/
  signaller.broadcast = signaller.addStream = function(stream) {
    localStreams.push(stream);

    // if we have any active calls, then add the stream
    calls.values().forEach(function(data) {
      data.pc.addStream(stream);
    });

    return signaller;
  };

  /**
    #### endCalls()

    The `endCalls` function terminates all the active calls that have been
    created in this quickconnect instance.  Calling `endCalls` does not
    kill the connection with the signalling server.

  **/
  signaller.endCalls = function() {
    calls.keys().forEach(callEnd);
  };

  /**
    #### close()

    The `close` function provides a convenient way of closing all associated
    peer connections.  This function simply uses the `endCalls` function and
    the underlying `leave` function of the signaller to do a "full cleanup"
    of all connections.
  **/
  signaller.close = function() {
    signaller.endCalls();
    signaller.leave();
  };

  /**
    #### createDataChannel(label, config)

    Request that a data channel with the specified `label` is created on
    the peer connection.  When the data channel is open and available, an
    event will be triggered using the label of the data channel.

    For example, if a new data channel was requested using the following
    call:

    ```js
    var qc = quickconnect('http://rtc.io/switchboard').createDataChannel('test');
    ```

    Then when the data channel is ready for use, a `test:open` event would
    be emitted by `qc`.

  **/
  signaller.createDataChannel = function(label, opts) {
    // create a channel on all existing calls
    calls.keys().forEach(function(peerId) {
      var call = calls.get(peerId);
      var dc;

      // if we are the master connection, create the data channel
      if (call && call.pc && signaller.isMaster(peerId)) {
        dc = call.pc.createDataChannel(label, opts);
        gotPeerChannel(dc, call.pc, call.data);
      }
    });

    // save the data channel opts in the local channels dictionary
    channels[label] = opts || null;

    return signaller;
  };

  /**
    #### reactive()

    Flag that this session will be a reactive connection.

  **/
  signaller.reactive = function() {
    // add the reactive flag
    opts = opts || {};
    opts.reactive = true;

    // chain
    return signaller;
  };

  /**
    #### removeStream

    ```
    removeStream(stream:MediaStream)
    ```

    Remove the specified stream from both the local streams that are to
    be connected to new peers, and also from any active calls.

  **/
  signaller.removeStream = function(stream) {
    var localIndex = localStreams.indexOf(stream);

    // remove the stream from any active calls
    calls.values().forEach(function(call) {
      call.pc.removeStream(stream);
    });

    // remove the stream from the localStreams array
    if (localIndex >= 0) {
      localStreams.splice(localIndex, 1);
    }

    return signaller;
  };

  /**
    #### requestChannel

    ```
    requestChannel(targetId, label, callback)
    ```

    This is a function that can be used to respond to remote peers supplying
    a data channel as part of their configuration.  As per the `receiveStream`
    function this function will either fire the callback immediately if the
    channel is already available, or once the channel has been discovered on
    the call.

  **/
  signaller.requestChannel = function(targetId, label, callback) {
    var call = getActiveCall(targetId);
    var channel = call && call.channels.get(label);

    // if we have then channel trigger the callback immediately
    if (channel) {
      callback(null, channel);
      return signaller;
    }

    // if not, wait for it
    signaller.once('channel:opened:' + label, function(id, dc) {
      callback(null, dc);
    });

    return signaller;
  };

  /**
    #### requestStream

    ```
    requestStream(targetId, idx, callback)
    ```

    Used to request a remote stream from a quickconnect instance. If the
    stream is already available in the calls remote streams, then the callback
    will be triggered immediately, otherwise this function will monitor
    `stream:added` events and wait for a match.

    In the case that an unknown target is requested, then an exception will
    be thrown.
  **/
  signaller.requestStream = function(targetId, idx, callback) {
    var call = getActiveCall(targetId);
    var stream;

    function waitForStream(peerId) {
      if (peerId !== targetId) {
        return;
      }

      // get the stream
      stream = call.pc.getRemoteStreams()[idx];

      // if we have the stream, then remove the listener and trigger the cb
      if (stream) {
        signaller.removeListener('stream:added', waitForStream);
        callback(null, stream);
      }
    }

    // look for the stream in the remote streams of the call
    stream = call.pc.getRemoteStreams()[idx];

    // if we found the stream then trigger the callback
    if (stream) {
      callback(null, stream);
      return signaller;
    }

    // otherwise wait for the stream
    signaller.on('stream:added', waitForStream);
    return signaller;
  };

  /**
    #### profile(data)

    Update the profile data with the attached information, so when
    the signaller announces it includes this data in addition to any
    room and id information.

  **/
  signaller.profile = function(data) {
    extend(profile, data);

    // if we have already announced, then reannounce our profile to provide
    // others a `peer:update` event
    if (announced) {
      signaller.announce(profile);
    }

    return signaller;
  };

  /**
    #### waitForCall

    ```
    waitForCall(targetId, callback)
    ```

    Wait for a call from the specified targetId.  If the call is already
    active the callback will be fired immediately, otherwise we will wait
    for a `call:started` event that matches the requested `targetId`

  **/
  signaller.waitForCall = function(targetId, callback) {
    var call = calls.get(targetId);

    if (call && call.active) {
      callback(null, call.pc);
      return signaller;
    }

    signaller.on('call:started', function handleNewCall(id) {
      if (id === targetId) {
        signaller.removeListener('call:started', handleNewCall);
        callback(null, calls.get(id).pc);
      }
    });
  };

  // respond to local announce messages
  signaller.on('local:announce', handleLocalAnnounce);

  // pass the signaller on
  return signaller;
};

}).call(this,require('_process'))
},{"_process":30,"cog/defaults":2,"cog/extend":3,"cog/getable":4,"rtc-signaller":20,"rtc-tools":16,"rtc-tools/cleanup":12}],12:[function(require,module,exports){
/* jshint node: true */
'use strict';

var debug = require('cog/logger')('rtc/cleanup');

var CANNOT_CLOSE_STATES = [
  'closed'
];

var EVENTS_DECOUPLE_BC = [
  'addstream',
  'datachannel',
  'icecandidate',
  'negotiationneeded',
  'removestream',
  'signalingstatechange'
];

var EVENTS_DECOUPLE_AC = [
  'iceconnectionstatechange'
];

/**
  ### rtc-tools/cleanup

  ```
  cleanup(pc)
  ```

  The `cleanup` function is used to ensure that a peer connection is properly
  closed and ready to be cleaned up by the browser.

**/
module.exports = function(pc) {
  // see if we can close the connection
  var currentState = pc.iceConnectionState;
  var canClose = CANNOT_CLOSE_STATES.indexOf(currentState) < 0;

  function decouple(events) {
    events.forEach(function(evtName) {
      if (pc['on' + evtName]) {
        pc['on' + evtName] = null;
      }
    });
  }

  // decouple "before close" events
  decouple(EVENTS_DECOUPLE_BC);

  if (canClose) {
    debug('attempting connection close, current state: '+ pc.iceConnectionState);
    pc.close();
  }

  // remove the event listeners
  // after a short delay giving the connection time to trigger
  // close and iceconnectionstatechange events
  setTimeout(function() {
    decouple(EVENTS_DECOUPLE_AC);
  }, 100);
};

},{"cog/logger":6}],13:[function(require,module,exports){
/* jshint node: true */
'use strict';

var async = require('async');
var cleanup = require('./cleanup');
var monitor = require('./monitor');
var detect = require('./detect');
var findPlugin = require('rtc-core/plugin');
var CLOSED_STATES = [ 'closed', 'failed' ];

// track the various supported CreateOffer / CreateAnswer contraints
// that we recognize and allow
var OFFER_ANSWER_CONSTRAINTS = [
  'offerToReceiveVideo',
  'offerToReceiveAudio',
  'voiceActivityDetection',
  'iceRestart'
];

/**
  ### rtc-tools/couple

  #### couple(pc, targetId, signaller, opts?)

  Couple a WebRTC connection with another webrtc connection identified by
  `targetId` via the signaller.

  The following options can be provided in the `opts` argument:

  - `sdpfilter` (default: null)

    A simple function for filtering SDP as part of the peer
    connection handshake (see the Using Filters details below).

  ##### Example Usage

  ```js
  var couple = require('rtc/couple');

  couple(pc, '54879965-ce43-426e-a8ef-09ac1e39a16d', signaller);
  ```

  ##### Using Filters

  In certain instances you may wish to modify the raw SDP that is provided
  by the `createOffer` and `createAnswer` calls.  This can be done by passing
  a `sdpfilter` function (or array) in the options.  For example:

  ```js
  // run the sdp from through a local tweakSdp function.
  couple(pc, '54879965-ce43-426e-a8ef-09ac1e39a16d', signaller, {
    sdpfilter: tweakSdp
  });
  ```

**/
function couple(pc, targetId, signaller, opts) {
  var debugLabel = (opts || {}).debugLabel || 'rtc';
  var debug = require('cog/logger')(debugLabel + '/couple');

  // create a monitor for the connection
  var mon = monitor(pc, targetId, signaller, opts);
  var queuedCandidates = [];
  var sdpFilter = (opts || {}).sdpfilter;
  var reactive = (opts || {}).reactive;
  var offerTimeout;
  var endOfCandidates = true;
  var plugin = findPlugin((opts || {}).plugins);

  // configure the time to wait between receiving a 'disconnect'
  // iceConnectionState and determining that we are closed
  var disconnectTimeout = (opts || {}).disconnectTimeout || 10000;
  var disconnectTimer;

  // if the signaller does not support this isMaster function throw an
  // exception
  if (typeof signaller.isMaster != 'function') {
    throw new Error('rtc-signaller instance >= 0.14.0 required');
  }

  // initilaise the negotiation helpers
  var isMaster = signaller.isMaster(targetId);

  var createOffer = prepNegotiate(
    'createOffer',
    isMaster,
    [ checkStable ]
  );

  var createAnswer = prepNegotiate(
    'createAnswer',
    true,
    []
  );

  // initialise the processing queue (one at a time please)
  var q = async.queue(function(task, cb) {
    // if the task has no operation, then trigger the callback immediately
    if (typeof task.op != 'function') {
      return cb();
    }

    // process the task operation
    task.op(task, cb);
  }, 1);

  // initialise session description and icecandidate objects
  var RTCSessionDescription = (opts || {}).RTCSessionDescription ||
    detect('RTCSessionDescription');

  var RTCIceCandidate = (opts || {}).RTCIceCandidate ||
    detect('RTCIceCandidate');

  function abort(stage, sdp, cb) {
    return function(err) {
      // log the error
      console.error('rtc/couple error (' + stage + '): ', err);

      if (typeof cb == 'function') {
        cb(err);
      }
    };
  }

  function applyCandidatesWhenStable() {
    if (pc.signalingState == 'stable' && pc.remoteDescription) {
      debug('signaling state = stable, applying queued candidates');
      mon.removeListener('change', applyCandidatesWhenStable);

      // apply any queued candidates
      queuedCandidates.splice(0).forEach(function(data) {
        debug('applying queued candidate', data);

        try {
          pc.addIceCandidate(createIceCandidate(data));
        }
        catch (e) {
          debug('invalidate candidate specified: ', data);
        }
      });
    }
  }

  function checkNotConnecting(negotiate) {
    if (pc.iceConnectionState != 'checking') {
      return true;
    }

    debug('connection state is checking, will wait to create a new offer');
    mon.once('connected', function() {
      q.push({ op: negotiate });
    });

    return false;
  }

  function checkStable(negotiate) {
    if (pc.signalingState === 'stable') {
      return true;
    }

    debug('cannot create offer, signaling state != stable, will retry');
    mon.on('change', function waitForStable() {
      if (pc.signalingState === 'stable') {
        q.push({ op: negotiate });
      }

      mon.removeListener('change', waitForStable);
    });

    return false;
  }

  function createIceCandidate(data) {
    if (plugin && typeof plugin.createIceCandidate == 'function') {
      return plugin.createIceCandidate(data);
    }

    return new RTCIceCandidate(data);
  }

  function createSessionDescription(data) {
    if (plugin && typeof plugin.createSessionDescription == 'function') {
      return plugin.createSessionDescription(data);
    }

    return new RTCSessionDescription(data);
  }

  function decouple() {
    debug('decoupling ' + signaller.id + ' from ' + targetId);

    // stop the monitor
    mon.removeAllListeners();
    mon.stop();

    // cleanup the peerconnection
    cleanup(pc);

    // remove listeners
    signaller.removeListener('sdp', handleSdp);
    signaller.removeListener('candidate', handleRemoteCandidate);
    signaller.removeListener('negotiate', handleNegotiateRequest);
  }

  function generateConstraints(methodName) {
    var constraints = {};

    function reformatConstraints() {
      var tweaked = {};

      Object.keys(constraints).forEach(function(param) {
        var sentencedCased = param.charAt(0).toUpperCase() + param.substr(1);
        tweaked[sentencedCased] = constraints[param];
      });

      // update the constraints to match the expected format
      constraints = {
        mandatory: tweaked
      };
    }

    // TODO: customize behaviour based on offer vs answer

    // pull out any valid
    OFFER_ANSWER_CONSTRAINTS.forEach(function(param) {
      var sentencedCased = param.charAt(0).toUpperCase() + param.substr(1);

      // if we have no opts, do nothing
      if (! opts) {
        return;
      }
      // if the parameter has been defined, then add it to the constraints
      else if (opts[param] !== undefined) {
        constraints[param] = opts[param];
      }
      // if the sentenced cased version has been added, then use that
      else if (opts[sentencedCased] !== undefined) {
        constraints[param] = opts[sentencedCased];
      }
    });

    // TODO: only do this for the older browsers that require it
    reformatConstraints();

    return constraints;
  }

  function prepNegotiate(methodName, allowed, preflightChecks) {
    var constraints = generateConstraints(methodName);

    // ensure we have a valid preflightChecks array
    preflightChecks = [].concat(preflightChecks || []);

    return function negotiate(task, cb) {
      var checksOK = true;

      // if the task is not allowed, then send a negotiate request to our
      // peer
      if (! allowed) {
        signaller.to(targetId).send('/negotiate');
        return cb();
      }

      // if the connection is closed, then abort
      if (isClosed()) {
        return cb(new Error('connection closed, cannot negotiate'));
      }

      // run the preflight checks
      preflightChecks.forEach(function(check) {
        checksOK = checksOK && check(negotiate);
      });

      // if the checks have not passed, then abort for the moment
      if (! checksOK) {
        debug('preflight checks did not pass, aborting ' + methodName);
        return cb();
      }

      // create the offer
      debug('calling ' + methodName);
      // debug('gathering state = ' + pc.iceGatheringState);
      // debug('connection state = ' + pc.iceConnectionState);
      // debug('signaling state = ' + pc.signalingState);

      pc[methodName](
        function(desc) {

          // if a filter has been specified, then apply the filter
          if (typeof sdpFilter == 'function') {
            desc.sdp = sdpFilter(desc.sdp, pc, methodName);
          }

          q.push({ op: queueLocalDesc(desc) });
          cb();
        },

        // on error, abort
        abort(methodName, '', cb),

        // include the appropriate constraints
        constraints
      );
    };
  }

  function handleConnectionClose() {
    debug('captured pc close, iceConnectionState = ' + pc.iceConnectionState);
    decouple();
  }

  function handleDisconnect() {
    debug('captured pc disconnect, monitoring connection status');

    // start the disconnect timer
    disconnectTimer = setTimeout(function() {
      debug('manually closing connection after disconnect timeout');
      pc.close();
    }, disconnectTimeout);

    mon.on('change', handleDisconnectAbort);
  }

  function handleDisconnectAbort() {
    debug('connection state changed to: ' + pc.iceConnectionState);
    resetDisconnectTimer();

    // if we have a closed or failed status, then close the connection
    if (CLOSED_STATES.indexOf(pc.iceConnectionState) >= 0) {
      return mon.emit('closed');
    }

    mon.once('disconnect', handleDisconnect);
  };

  function handleLocalCandidate(evt) {
    if (evt.candidate) {
      resetDisconnectTimer();

      signaller.to(targetId).send('/candidate', evt.candidate);
      endOfCandidates = false;
    }
    else if (! endOfCandidates) {
      endOfCandidates = true;
      debug('ice gathering state complete');
      signaller.to(targetId).send('/endofcandidates', {});
    }
  }

  function handleNegotiateRequest(src) {
    if (src.id === targetId) {
      debug('got negotiate request from ' + targetId + ', creating offer');
      q.push({ op: createOffer });
    }
  }

  function handleRemoteCandidate(data, src) {
    if ((! src) || (src.id !== targetId)) {
      return;
    }

    // queue candidates while the signaling state is not stable
    if (pc.signalingState != 'stable' || (! pc.remoteDescription)) {
      debug('queuing candidate');
      queuedCandidates.push(data);

      mon.removeListener('change', applyCandidatesWhenStable);
      mon.on('change', applyCandidatesWhenStable);
      return;
    }

    try {
      pc.addIceCandidate(createIceCandidate(data));
    }
    catch (e) {
      debug('invalidate candidate specified: ', data);
    }
  }

  function handleSdp(data, src) {
    var abortType = data.type === 'offer' ? 'createAnswer' : 'createOffer';

    // if the source is unknown or not a match, then abort
    if ((! src) || (src.id !== targetId)) {
      return debug('received sdp but dropping due to unmatched src');
    }

    // prioritize setting the remote description operation
    q.push({ op: function(task, cb) {
      if (isClosed()) {
        return cb(new Error('pc closed: cannot set remote description'));
      }

      // update the remote description
      // once successful, send the answer
      debug('setting remote description');
      pc.setRemoteDescription(
        createSessionDescription(data),
        function() {
          // create the answer
          if (data.type === 'offer') {
            queue(createAnswer)();
          }

          // trigger the callback
          cb();
        },

        abort(abortType, data.sdp, cb)
      );
    }});
  }

  function isClosed() {
    return CLOSED_STATES.indexOf(pc.iceConnectionState) >= 0;
  }

  function queue(negotiateTask) {
    return function() {
      q.push([
        { op: negotiateTask }
      ]);
    };
  }

  function queueLocalDesc(desc) {
    return function setLocalDesc(task, cb) {
      if (isClosed()) {
        return cb(new Error('connection closed, aborting'));
      }

      // initialise the local description
      debug('setting local description');
      pc.setLocalDescription(
        desc,

        // if successful, then send the sdp over the wire
        function() {
          // send the sdp
          signaller.to(targetId).send('/sdp', desc);

          // callback
          cb();
        },

        // abort('setLocalDesc', desc.sdp, cb)
        // on error, abort
        function(err) {
          debug('error setting local description', err);
          debug(desc.sdp);
          // setTimeout(function() {
          //   setLocalDesc(task, cb, (retryCount || 0) + 1);
          // }, 500);

          cb(err);
        }
      );
    };
  }

  function resetDisconnectTimer() {
    mon.removeListener('change', handleDisconnectAbort);

    // clear the disconnect timer
    debug('reset disconnect timer, state: ' + pc.iceConnectionState);
    clearTimeout(disconnectTimer);
  }

  // when regotiation is needed look for the peer
  if (reactive) {
    pc.onnegotiationneeded = function() {
      debug('renegotiation required, will create offer in 50ms');
      clearTimeout(offerTimeout);
      offerTimeout = setTimeout(queue(createOffer), 50);
    };
  }

  pc.onicecandidate = handleLocalCandidate;

  // when we receive sdp, then
  signaller.on('sdp', handleSdp);
  signaller.on('candidate', handleRemoteCandidate);

  // if this is a master connection, listen for negotiate events
  if (isMaster) {
    signaller.on('negotiate', handleNegotiateRequest);
  }

  // when the connection closes, remove event handlers
  mon.once('closed', handleConnectionClose);
  mon.once('disconnected', handleDisconnect);

  // patch in the create offer functions
  mon.createOffer = queue(createOffer);

  return mon;
}

module.exports = couple;

},{"./cleanup":12,"./detect":14,"./monitor":17,"async":18,"cog/logger":6,"rtc-core/plugin":10}],14:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ### rtc-tools/detect

  Provide the [rtc-core/detect](https://github.com/rtc-io/rtc-core#detect)
  functionality.
**/
module.exports = require('rtc-core/detect');

},{"rtc-core/detect":8}],15:[function(require,module,exports){
/* jshint node: true */
'use strict';

var debug = require('cog/logger')('generators');
var detect = require('./detect');
var defaults = require('cog/defaults');

var mappings = {
  create: {
    dtls: function(c) {
      if (! detect.moz) {
        c.optional = (c.optional || []).concat({ DtlsSrtpKeyAgreement: true });
      }
    }
  }
};

/**
  ### rtc-tools/generators

  The generators package provides some utility methods for generating
  constraint objects and similar constructs.

  ```js
  var generators = require('rtc/generators');
  ```

**/

/**
  #### generators.config(config)

  Generate a configuration object suitable for passing into an W3C
  RTCPeerConnection constructor first argument, based on our custom config.
**/
exports.config = function(config) {
  return defaults(config, {
    iceServers: []
  });
};

/**
  #### generators.connectionConstraints(flags, constraints)

  This is a helper function that will generate appropriate connection
  constraints for a new `RTCPeerConnection` object which is constructed
  in the following way:

  ```js
  var conn = new RTCPeerConnection(flags, constraints);
  ```

  In most cases the constraints object can be left empty, but when creating
  data channels some additional options are required.  This function
  can generate those additional options and intelligently combine any
  user defined constraints (in `constraints`) with shorthand flags that
  might be passed while using the `rtc.createConnection` helper.
**/
exports.connectionConstraints = function(flags, constraints) {
  var generated = {};
  var m = mappings.create;
  var out;

  // iterate through the flags and apply the create mappings
  Object.keys(flags || {}).forEach(function(key) {
    if (m[key]) {
      m[key](generated);
    }
  });

  // generate the connection constraints
  out = defaults({}, constraints, generated);
  debug('generated connection constraints: ', out);

  return out;
};

},{"./detect":14,"cog/defaults":2,"cog/logger":6}],16:[function(require,module,exports){
/* jshint node: true */

'use strict';

/**
  # rtc-tools

  The `rtc-tools` module does most of the heavy lifting within the
  [rtc.io](http://rtc.io) suite.  Primarily it handles the logic of coupling
  a local `RTCPeerConnection` with it's remote counterpart via an
  [rtc-signaller](https://github.com/rtc-io/rtc-signaller) signalling
  channel.

  ## Getting Started

  If you decide that the `rtc-tools` module is a better fit for you than either
  [rtc-quickconnect](https://github.com/rtc-io/rtc-quickconnect) or
  [rtc-glue](https://github.com/rtc-io/rtc-glue) then the code snippet below
  will provide you a guide on how to get started using it in conjunction with
  the [rtc-signaller](https://github.com/rtc-io/rtc-signaller) and
  [rtc-media](https://github.com/rtc-io/rtc-media) modules:

  <<< examples/getting-started.js

  This code definitely doesn't cover all the cases that you need to consider
  (i.e. peers leaving, etc) but it should demonstrate how to:

  1. Capture video and add it to a peer connection
  2. Couple a local peer connection with a remote peer connection
  3. Deal with the remote steam being discovered and how to render
     that to the local interface.

  ## Reference

**/

var gen = require('./generators');

// export detect
var detect = exports.detect = require('./detect');
var findPlugin = require('rtc-core/plugin');

// export cog logger for convenience
exports.logger = require('cog/logger');

// export peer connection
var RTCPeerConnection =
exports.RTCPeerConnection = detect('RTCPeerConnection');

// add the couple utility
exports.couple = require('./couple');

/**
  ### createConnection

  ```
  createConnection(opts?, constraints?) => RTCPeerConnection
  ```

  Create a new `RTCPeerConnection` auto generating default opts as required.

  ```js
  var conn;

  // this is ok
  conn = rtc.createConnection();

  // and so is this
  conn = rtc.createConnection({
    iceServers: []
  });
  ```
**/
exports.createConnection = function(opts, constraints) {
  var plugin = findPlugin((opts || {}).plugins);

  // generate the config based on options provided
  var config = gen.config(opts);

  // generate appropriate connection constraints
  var constraints = gen.connectionConstraints(opts, constraints);

  if (plugin && typeof plugin.createConnection == 'function') {
    return plugin.createConnection(config, constraints);
  }
  else {
    return new ((opts || {}).RTCPeerConnection || RTCPeerConnection)(
      config, constraints
    );
  }
};

},{"./couple":13,"./detect":14,"./generators":15,"cog/logger":6,"rtc-core/plugin":10}],17:[function(require,module,exports){
/* jshint node: true */
'use strict';

var EventEmitter = require('eventemitter3');

// define some state mappings to simplify the events we generate
var stateMappings = {
  completed: 'connected'
};

// define the events that we need to watch for peer connection
// state changes
var peerStateEvents = [
  'signalingstatechange',
  'iceconnectionstatechange',
];

/**
  ### rtc-tools/monitor

  ```
  monitor(pc, targetId, signaller, opts?) => EventEmitter
  ```

  The monitor is a useful tool for determining the state of `pc` (an
  `RTCPeerConnection`) instance in the context of your application. The
  monitor uses both the `iceConnectionState` information of the peer
  connection and also the various
  [signaller events](https://github.com/rtc-io/rtc-signaller#signaller-events)
  to determine when the connection has been `connected` and when it has
  been `disconnected`.

  A monitor created `EventEmitter` is returned as the result of a
  [couple](https://github.com/rtc-io/rtc#rtccouple) between a local peer
  connection and it's remote counterpart.

**/
module.exports = function(pc, targetId, signaller, opts) {
  var debugLabel = (opts || {}).debugLabel || 'rtc';
  var debug = require('cog/logger')(debugLabel + '/monitor');
  var monitor = new EventEmitter();
  var state;

  function checkState() {
    var newState = getMappedState(pc.iceConnectionState);
    debug('state changed: ' + pc.iceConnectionState + ', mapped: ' + newState);

    // flag the we had a state change
    monitor.emit('change', pc);

    // if the active state has changed, then send the appopriate message
    if (state !== newState) {
      monitor.emit(newState);
      state = newState;
    }
  }

  function handlePeerLeave(peerId) {
    debug('captured peer leave for peer: ' + peerId);

    // if the peer leaving is not the peer we are connected to
    // then we aren't interested
    if (peerId !== targetId) {
      return;
    }

    // trigger a closed event
    monitor.emit('closed');
  }

  pc.onclose = monitor.emit.bind(monitor, 'closed');
  peerStateEvents.forEach(function(evtName) {
    pc['on' + evtName] = checkState;
  });

  monitor.stop = function() {
    pc.onclose = null;
    peerStateEvents.forEach(function(evtName) {
      pc['on' + evtName] = null;
    });

    // remove the peer:leave listener
    if (signaller && typeof signaller.removeListener == 'function') {
      signaller.removeListener('peer:leave', handlePeerLeave);
    }
  };

  monitor.checkState = checkState;

  // if we haven't been provided a valid peer connection, abort
  if (! pc) {
    return monitor;
  }

  // determine the initial is active state
  state = getMappedState(pc.iceConnectionState);

  // if we've been provided a signaller, then watch for peer:leave events
  if (signaller && typeof signaller.on == 'function') {
    signaller.on('peer:leave', handlePeerLeave);
  }

  // if we are active, trigger the connected state
  // setTimeout(monitor.emit.bind(monitor, state), 0);

  return monitor;
};

/* internal helpers */

function getMappedState(state) {
  return stateMappings[state] || state;
}

},{"cog/logger":6,"eventemitter3":19}],18:[function(require,module,exports){
(function (process){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(done) );
        });
        function done(err) {
          if (err) {
              callback(err);
              callback = function () {};
          }
          else {
              completed += 1;
              if (completed >= arr.length) {
                  callback();
              }
          }
        }
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        if (!callback) {
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err) {
                    callback(err);
                });
            });
        } else {
            var results = [];
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err, v) {
                    results[x.index] = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        var remainingTasks = keys.length
        if (!remainingTasks) {
            return callback();
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            remainingTasks--
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (!remainingTasks) {
                var theCallback = callback;
                // prevent final callback from calling itself if it errors
                callback = function () {};

                theCallback(null, results);
            }
        });

        _each(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;
        var wrappedTask = function(wrappedCallback, wrappedResults) {
            var retryAttempt = function(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            };
            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }
        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            started: false,
            paused: false,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            kill: function () {
              q.drain = null;
              q.tasks = [];
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                if (q.paused === true) { return; }
                q.paused = true;
                q.process();
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                q.process();
            }
        };
        return q;
    };
    
    async.priorityQueue = function (worker, concurrency) {
        
        function _compareTasks(a, b){
          return a.priority - b.priority;
        };
        
        function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
            var mid = beg + ((end - beg + 1) >>> 1);
            if (compare(item, sequence[mid]) >= 0) {
              beg = mid;
            } else {
              end = mid - 1;
            }
          }
          return beg;
        }
        
        function _insert(q, data, priority, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  priority: priority,
                  callback: typeof callback === 'function' ? callback : null
              };
              
              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }
        
        // Start with a normal queue
        var q = async.queue(worker, concurrency);
        
        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
          _insert(q, data, priority, callback);
        };
        
        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            drained: true,
            push: function (data, callback) {
                if (!_isArray(data)) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain && !cargo.drained) cargo.drain();
                    cargo.drained = true;
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0, tasks.length);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'))
},{"_process":30}],19:[function(require,module,exports){
'use strict';

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {
  this._events = {};
}

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  return Array.apply(this, this._events[event] || []);
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , length = listeners.length
    , len = arguments.length
    , fn = listeners[0]
    , args
    , i;

  if (1 === length) {
    if (fn.__EE3_once) this.removeListener(event, fn);

    switch (len) {
      case 1:
        fn.call(fn.__EE3_context || this);
      break;
      case 2:
        fn.call(fn.__EE3_context || this, a1);
      break;
      case 3:
        fn.call(fn.__EE3_context || this, a1, a2);
      break;
      case 4:
        fn.call(fn.__EE3_context || this, a1, a2, a3);
      break;
      case 5:
        fn.call(fn.__EE3_context || this, a1, a2, a3, a4);
      break;
      case 6:
        fn.call(fn.__EE3_context || this, a1, a2, a3, a4, a5);
      break;

      default:
        for (i = 1, args = new Array(len -1); i < len; i++) {
          args[i - 1] = arguments[i];
        }

        fn.apply(fn.__EE3_context || this, args);
    }
  } else {
    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    for (i = 0; i < length; fn = listeners[++i]) {
      if (fn.__EE3_once) this.removeListener(event, fn);
      fn.apply(fn.__EE3_context || this, args);
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = [];

  fn.__EE3_context = context;
  this._events[event].push(fn);

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  fn.__EE3_once = true;
  return this.on(event, fn, context);
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  for (var i = 0, length = listeners.length; i < length; i++) {
    if (fn && listeners[i] !== fn) {
      events.push(listeners[i]);
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) this._events[event] = events;
  else this._events[event] = null;

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) this._events[event] = null;
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

try { module.exports = EventEmitter; }
catch (e) {}

},{}],20:[function(require,module,exports){
var extend = require('cog/extend');

module.exports = function(messenger, opts) {
  return require('./index.js')(messenger, extend({
    connect: require('./primus-loader')
  }, opts));
};

},{"./index.js":25,"./primus-loader":27,"cog/extend":3}],21:[function(require,module,exports){
module.exports = {
  // messenger events
  dataEvent: 'data',
  openEvent: 'open',
  closeEvent: 'close',

  // messenger functions
  writeMethod: 'write',
  closeMethod: 'close',

  // leave timeout (ms)
  leaveTimeout: 3000
};
},{}],22:[function(require,module,exports){
/* jshint node: true */
'use strict';

var debug = require('cog/logger')('rtc-signaller');
var extend = require('cog/extend');
var roles = ['a', 'b'];

/**
  #### announce

  ```
  /announce|%metadata%|{"id": "...", ... }
  ```

  When an announce message is received by the signaller, the attached
  object data is decoded and the signaller emits an `announce` message.

**/
module.exports = function(signaller) {

  function copyData(target, source) {
    if (target && source) {
      for (var key in source) {
        target[key] = source[key];
      }
    }

    return target;
  }

  function dataAllowed(data) {
    var evt = {
      data: data,
      allow: true
    };

    signaller.emit('peer:filter', evt);

    return evt.allow;
  }

  return function(args, messageType, srcData, srcState, isDM) {
    var data = args[0];
    var peer;

    debug('announce handler invoked, received data: ', data);

    // if we have valid data then process
    if (data && data.id && data.id !== signaller.id) {
      if (! dataAllowed(data)) {
        return;
      }
      // check to see if this is a known peer
      peer = signaller.peers.get(data.id);

      // trigger the peer connected event to flag that we know about a
      // peer connection. The peer has passed the "filter" check but may
      // be announced / updated depending on previous connection status
      signaller.emit('peer:connected', data.id, data);

      // if the peer is existing, then update the data
      if (peer && (! peer.inactive)) {
        debug('signaller: ' + signaller.id + ' received update, data: ', data);

        // update the data
        copyData(peer.data, data);

        // trigger the peer update event
        return signaller.emit('peer:update', data, srcData);
      }

      // create a new peer
      peer = {
        id: data.id,

        // initialise the local role index
        roleIdx: [data.id, signaller.id].sort().indexOf(data.id),

        // initialise the peer data
        data: {}
      };

      // initialise the peer data
      copyData(peer.data, data);

      // reset inactivity state
      clearTimeout(peer.leaveTimer);
      peer.inactive = false;

      // set the peer data
      signaller.peers.set(data.id, peer);

      // if this is an initial announce message (no vector clock attached)
      // then send a announce reply
      if (signaller.autoreply && (! isDM)) {
        signaller
          .to(data.id)
          .send('/announce', signaller.attributes);
      }

      // emit a new peer announce event
      return signaller.emit('peer:announce', data, peer);
    }
  };
};
},{"cog/extend":3,"cog/logger":6}],23:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ### signaller message handlers

**/

module.exports = function(signaller, opts) {
  return {
    announce: require('./announce')(signaller, opts),
    leave: require('./leave')(signaller, opts)
  };
};
},{"./announce":22,"./leave":24}],24:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  #### leave

  ```
  /leave|{"id":"..."}
  ```

  When a leave message is received from a peer, we check to see if that is
  a peer that we are managing state information for and if we are then the
  peer state is removed.

**/
module.exports = function(signaller, opts) {
  return function(args) {
    var data = args[0];
    var peer = signaller.peers.get(data && data.id);

    if (peer) {
      // start the inactivity timer
      peer.leaveTimer = setTimeout(function() {
        peer.inactive = true;
        signaller.emit('peer:leave', data.id, peer);
      }, opts.leaveTimeout);
    }

    // emit the event
    signaller.emit('peer:disconnected', data.id, peer);
  };
};
},{}],25:[function(require,module,exports){
/* jshint node: true */
'use strict';

var debug = require('cog/logger')('rtc-signaller');
var detect = require('rtc-core/detect');
var EventEmitter = require('eventemitter3');
var defaults = require('cog/defaults');
var extend = require('cog/extend');
var throttle = require('cog/throttle');
var getable = require('cog/getable');
var uuid = require('./uuid');

// initialise the list of valid "write" methods
var WRITE_METHODS = ['write', 'send'];
var CLOSE_METHODS = ['close', 'end'];

// initialise signaller metadata so we don't have to include the package.json
// TODO: make this checkable with some kind of prepublish script
var metadata = {
  version: '2.4.0'
};

/**
  # rtc-signaller

  The `rtc-signaller` module provides a transportless signalling
  mechanism for WebRTC.

  ## Purpose

  <<< docs/purpose.md

  ## Getting Started

  While the signaller is capable of communicating by a number of different
  messengers (i.e. anything that can send and receive messages over a wire)
  it comes with support for understanding how to connect to an
  [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard) out of the box.

  The following code sample demonstrates how:

  <<< examples/getting-started.js

  <<< docs/events.md

  <<< docs/signalflow-diagrams.md

  ## Reference

  The `rtc-signaller` module is designed to be used primarily in a functional
  way and when called it creates a new signaller that will enable
  you to communicate with other peers via your messaging network.

  ```js
  // create a signaller from something that knows how to send messages
  var signaller = require('rtc-signaller')(messenger);
  ```

  As demonstrated in the getting started guide, you can also pass through
  a string value instead of a messenger instance if you simply want to
  connect to an existing `rtc-switchboard` instance.

**/
module.exports = function(messenger, opts) {
  // get the autoreply setting
  var autoreply = (opts || {}).autoreply;
  var connect = (opts || {}).connect;

  // initialise the metadata
  var localMeta = {};

  // create the signaller
  var signaller = new EventEmitter();

  // initialise the id
  var id = signaller.id = (opts || {}).id || uuid();

  // initialise the attributes
  var attributes = signaller.attributes = {
    browser: detect.browser,
    browserVersion: detect.browserVersion,
    id: id,
    agent: 'signaller@' + metadata.version
  };

  // create the peers map
  var peers = signaller.peers = getable({});

  // initialise the data event name

  var connected = false;
  var write;
  var close;
  var processor;
  var announceTimer = 0;

  function announceOnReconnect() {
    signaller.announce();
  }

  function bindBrowserEvents() {
    messenger.addEventListener('message', function(evt) {
      processor(evt.data);
    });

    messenger.addEventListener('open', function(evt) {
      connected = true;
      signaller.emit('open');
      signaller.emit('connected');
    });

    messenger.addEventListener('close', function(evt) {
      connected = false;
      signaller.emit('disconnected');
    });
  }

  function bindEvents() {
    // if we don't have an on function for the messenger, then do nothing
    if (typeof messenger.on != 'function') {
      return;
    }

    // handle message data events
    messenger.on(opts.dataEvent, processor);

    // when the connection is open, then emit an open event and a connected event
    messenger.on(opts.openEvent, function() {
      connected = true;
      signaller.emit('open');
      signaller.emit('connected');
    });

    messenger.on(opts.closeEvent, function() {
      connected = false;
      signaller.emit('disconnected');
    });
  }

  function connectToHost(url) {
    if (typeof connect != 'function') {
      return signaller.emit('error', new Error('no connect function'));
    }

    // load primus
    connect(url, function(err, socket) {
      if (err) {
        return signaller.emit('error', err);
      }

      // create the actual messenger from a primus connection
      signaller._messenger = messenger = socket.connect(url);

      // now init
      init();
    });
  }

  function createDataLine(args) {
    return args.map(prepareArg).join('|');
  }

  function createMetadata() {
    return extend({}, localMeta, { id: signaller.id });
  }

  function extractProp(name) {
    return messenger[name];
  }

  // attempt to detect whether the underlying messenger is closing
  // this can be tough as we deal with both native (or simulated native)
  // sockets or an abstraction layer such as primus
  function isClosing() {
    var isAbstraction = messenger &&
        // a primus socket has a socket attribute
        typeof messenger.socket != 'undefined';

    return isAbstraction ? false : (
      messenger &&
      typeof messenger.readyState != 'undefined' &&
      messenger.readyState >= 2
    );
  }

  function isF(target) {
    return typeof target == 'function';
  }

  function init() {
    // extract the write and close function references
    write = [opts.writeMethod].concat(WRITE_METHODS).map(extractProp).filter(isF)[0];
    close = [opts.closeMethod].concat(CLOSE_METHODS).map(extractProp).filter(isF)[0];

    // create the processor
    signaller.process = processor = require('./processor')(signaller, opts);

    // if the messenger doesn't provide a valid write method, then complain
    if (typeof write != 'function') {
      throw new Error('provided messenger does not implement a "' +
        writeMethod + '" write method');
    }

    // handle core browser messenging apis
    if (typeof messenger.addEventListener == 'function') {
      bindBrowserEvents();
    }
    else {
      bindEvents();
    }

    // determine if we are connected or not
    connected = messenger.connected || false;
    if (! connected) {
      signaller.once('connected', function() {
        // always announce on reconnect
        signaller.on('connected', announceOnReconnect);
      });
    }

    // emit the initialized event
    setTimeout(signaller.emit.bind(signaller, 'init'), 0);
  }

  function prepareArg(arg) {
    if (typeof arg == 'object' && (! (arg instanceof String))) {
      return JSON.stringify(arg);
    }
    else if (typeof arg == 'function') {
      return null;
    }

    return arg;
  }

  /**
    ### signaller#send(message, data*)

    Use the send function to send a message to other peers in the current
    signalling scope (if announced in a room this will be a room, otherwise
    broadcast to all peers connected to the signalling server).

  **/
  var send = signaller.send = function() {
    // iterate over the arguments and stringify as required
    // var metadata = { id: signaller.id };
    var args = [].slice.call(arguments);
    var dataline;

    // inject the metadata
    args.splice(1, 0, createMetadata());
    dataline = createDataLine(args);

    // perform an isclosing check
    if (isClosing()) {
      return;
    }

    // if we are not initialized, then wait until we are
    if (! connected) {
      return signaller.once('connected', function() {
        write.call(messenger, dataline);
      });
    }

    // send the data over the messenger
    return write.call(messenger, dataline);
  };

  /**
    ### announce(data?)

    The `announce` function of the signaller will pass an `/announce` message
    through the messenger network.  When no additional data is supplied to
    this function then only the id of the signaller is sent to all active
    members of the messenging network.

    #### Joining Rooms

    To join a room using an announce call you simply provide the name of the
    room you wish to join as part of the data block that you annouce, for
    example:

    ```js
    signaller.announce({ room: 'testroom' });
    ```

    Signalling servers (such as
    [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard)) will then
    place your peer connection into a room with other peers that have also
    announced in this room.

    Once you have joined a room, the server will only deliver messages that
    you `send` to other peers within that room.

    #### Providing Additional Announce Data

    There may be instances where you wish to send additional data as part of
    your announce message in your application.  For instance, maybe you want
    to send an alias or nick as part of your announce message rather than just
    use the signaller's generated id.

    If for instance you were writing a simple chat application you could join
    the `webrtc` room and tell everyone your name with the following announce
    call:

    ```js
    signaller.announce({
      room: 'webrtc',
      nick: 'Damon'
    });
    ```

    #### Announcing Updates

    The signaller is written to distinguish between initial peer announcements
    and peer data updates (see the docs on the announce handler below). As
    such it is ok to provide any data updates using the announce method also.

    For instance, I could send a status update as an announce message to flag
    that I am going offline:

    ```js
    signaller.announce({ status: 'offline' });
    ```

  **/
  signaller.announce = function(data, sender) {

    function sendAnnounce() {
      (sender || send)('/announce', attributes);
      signaller.emit('local:announce', attributes);
    }

    clearTimeout(announceTimer);

    // update internal attributes
    extend(attributes, data, { id: signaller.id });

    // if we are already connected, then ensure we announce on
    // reconnect
    if (connected) {
      // always announce on reconnect
      signaller.removeListener('connected', announceOnReconnect);
      signaller.on('connected', announceOnReconnect);
    }

    // send the attributes over the network
    return announceTimer = setTimeout(function() {
      if (! connected) {
        return signaller.once('connected', sendAnnounce);
      }

      sendAnnounce();
    }, (opts || {}).announceDelay || 10);
  };

  /**
    ### isMaster(targetId)

    A simple function that indicates whether the local signaller is the master
    for it's relationship with peer signaller indicated by `targetId`.  Roles
    are determined at the point at which signalling peers discover each other,
    and are simply worked out by whichever peer has the lowest signaller id
    when lexigraphically sorted.

    For example, if we have two signaller peers that have discovered each
    others with the following ids:

    - `b11f4fd0-feb5-447c-80c8-c51d8c3cced2`
    - `8a07f82e-49a5-4b9b-a02e-43d911382be6`

    They would be assigned roles:

    - `b11f4fd0-feb5-447c-80c8-c51d8c3cced2`
    - `8a07f82e-49a5-4b9b-a02e-43d911382be6` (master)

  **/
  signaller.isMaster = function(targetId) {
    var peer = peers.get(targetId);

    return peer && peer.roleIdx !== 0;
  };

  /**
    ### leave()

    Tell the signalling server we are leaving.  Calling this function is
    usually not required though as the signalling server should issue correct
    `/leave` messages when it detects a disconnect event.

  **/
  signaller.leave = signaller.close = function() {
    // send the leave signal
    send('/leave', { id: id });

    // stop announcing on reconnect
    signaller.removeListener('connected', announceOnReconnect);

    // call the close method
    if (typeof close == 'function') {
      close.call(messenger);
    }
  };

  /**
    ### metadata(data?)

    Get (pass no data) or set the metadata that is passed through with each
    request sent by the signaller.

    __NOTE:__ Regardless of what is passed to this function, metadata
    generated by the signaller will **always** include the id of the signaller
    and this cannot be modified.
  **/
  signaller.metadata = function(data) {
    if (arguments.length === 0) {
      return extend({}, localMeta);
    }

    localMeta = extend({}, data);
  };

  /**
    ### to(targetId)

    Use the `to` function to send a message to the specified target peer.
    A large parge of negotiating a WebRTC peer connection involves direct
    communication between two parties which must be done by the signalling
    server.  The `to` function provides a simple way to provide a logical
    communication channel between the two parties:

    ```js
    var send = signaller.to('e95fa05b-9062-45c6-bfa2-5055bf6625f4').send;

    // create an offer on a local peer connection
    pc.createOffer(
      function(desc) {
        // set the local description using the offer sdp
        // if this occurs successfully send this to our peer
        pc.setLocalDescription(
          desc,
          function() {
            send('/sdp', desc);
          },
          handleFail
        );
      },
      handleFail
    );
    ```

  **/
  signaller.to = function(targetId) {
    // create a sender that will prepend messages with /to|targetId|
    var sender = function() {
      // get the peer (yes when send is called to make sure it hasn't left)
      var peer = signaller.peers.get(targetId);
      var args;

      if (! peer) {
        throw new Error('Unknown peer: ' + targetId);
      }

      // if the peer is inactive, then abort
      if (peer.inactive) {
        return;
      }

      args = [
        '/to',
        targetId
      ].concat([].slice.call(arguments));

      // inject metadata
      args.splice(3, 0, createMetadata());

      setTimeout(function() {
        var msg = createDataLine(args);
        debug('TX (' + targetId + '): ' + msg);

        write.call(messenger, msg);
      }, 0);
    };

    return {
      announce: function(data) {
        return signaller.announce(data, sender);
      },

      send: sender,
    }
  };

  // remove max listeners from the emitter
  signaller.setMaxListeners(0);

  // initialise opts defaults
  opts = defaults({}, opts, require('./defaults'));

  // set the autoreply flag
  signaller.autoreply = autoreply === undefined || autoreply;

  // if the messenger is a string, then we are going to attach to a
  // ws endpoint and automatically set up primus
  if (typeof messenger == 'string' || (messenger instanceof String)) {
    connectToHost(messenger);
  }
  // otherwise, initialise the connection
  else {
    init();
  }

  // connect an instance of the messenger to the signaller
  signaller._messenger = messenger;

  // expose the process as a process function
  signaller.process = processor;

  return signaller;
};

},{"./defaults":21,"./processor":28,"./uuid":29,"cog/defaults":2,"cog/extend":3,"cog/getable":4,"cog/logger":6,"cog/throttle":7,"eventemitter3":26,"rtc-core/detect":8}],26:[function(require,module,exports){
module.exports=require(19)
},{}],27:[function(require,module,exports){
/* jshint node: true */
/* global document, location, Primus: false */
'use strict';

var reTrailingSlash = /\/$/;

/**
  ### loadPrimus(signalhost, callback)

  This is a convenience function that is patched into the signaller to assist
  with loading the `primus.js` client library from an `rtc-switchboard`
  signaling server.

**/
module.exports = function(signalhost, callback) {
  var anchor = document.createElement('a');
  var script;
  var baseUrl;
  var scriptSrc;

  // if the signalhost is a function, we are in single arg calling mode
  if (typeof signalhost == 'function') {
    callback = signalhost;
    signalhost = location.origin;
  }

  // initialise the anchor with the signalhost
  anchor.href = signalhost;

  // read the base path
  baseUrl = signalhost.replace(reTrailingSlash, '');
  scriptSrc = baseUrl + '/rtc.io/primus.js';

  // look for the script first
  script = document.querySelector('script[src="' + scriptSrc + '"]');

  // if we found, the script trigger the callback immediately
  if (script && typeof Primus != 'undefined') {
    return callback(null, Primus);
  }
  // otherwise, if the script exists but Primus is not loaded,
  // then wait for the load
  else if (script) {
    script.addEventListener('load', function() {
      callback(null, Primus);
    });

    return;
  }

  // otherwise create the script and load primus
  script = document.createElement('script');
  script.src = scriptSrc;

  script.onerror = callback;
  script.addEventListener('load', function() {
    // if we have a signalhost that is not basepathed at /
    // then tweak the primus prototype
    if (anchor.pathname !== '/') {
      Primus.prototype.pathname = anchor.pathname.replace(reTrailingSlash, '') +
        Primus.prototype.pathname;
    }

    callback(null, Primus);
  });

  document.body.appendChild(script);
};

},{}],28:[function(require,module,exports){
/* jshint node: true */
'use strict';

var debug = require('cog/logger')('rtc-signaller');
var jsonparse = require('cog/jsonparse');

/**
  ### signaller process handling

  When a signaller's underling messenger emits a `data` event this is
  delegated to a simple message parser, which applies the following simple
  logic:

  - Is the message a `/to` message. If so, see if the message is for this
    signaller (checking the target id - 2nd arg).  If so pass the
    remainder of the message onto the standard processing chain.  If not,
    discard the message.

  - Is the message a command message (prefixed with a forward slash). If so,
    look for an appropriate message handler and pass the message payload on
    to it.

  - Finally, does the message match any patterns that we are listening for?
    If so, then pass the entire message contents onto the registered handler.
**/
module.exports = function(signaller, opts) {
  var handlers = require('./handlers')(signaller, opts);

  function sendEvent(parts, srcState, data) {
    // initialise the event name
    var evtName = parts[0].slice(1);

    // convert any valid json objects to json
    var args = parts.slice(2).map(jsonparse);

    signaller.emit.apply(
      signaller,
      [evtName].concat(args).concat([srcState, data])
    );
  }

  return function(originalData) {
    var data = originalData;
    var isMatch = true;
    var parts;
    var handler;
    var srcData;
    var srcState;
    var isDirectMessage = false;

    // force the id into string format so we can run length and comparison tests on it
    var id = signaller.id + '';
    debug('signaller ' + id + ' received data: ' + originalData);

    // process /to messages
    if (data.slice(0, 3) === '/to') {
      isMatch = data.slice(4, id.length + 4) === id;
      if (isMatch) {
        parts = data.slice(5 + id.length).split('|').map(jsonparse);

        // get the source data
        isDirectMessage = true;

        // extract the vector clock and update the parts
        parts = parts.map(jsonparse);
      }
    }

    // if this is not a match, then bail
    if (! isMatch) {
      return;
    }

    // chop the data into parts
    parts = parts || data.split('|').map(jsonparse);

    // if we have a specific handler for the action, then invoke
    if (typeof parts[0] == 'string') {
      // extract the metadata from the input data
      srcData = parts[1];

      // if we got data from ourself, then this is pretty dumb
      // but if we have then throw it away
      if (srcData && srcData.id === signaller.id) {
        return console.warn('got data from ourself, discarding');
      }

      // get the source state
      srcState = signaller.peers.get(srcData && srcData.id) || srcData;

      // handle commands
      if (parts[0].charAt(0) === '/') {
        // look for a handler for the message type
        handler = handlers[parts[0].slice(1)];

        if (typeof handler == 'function') {
          handler(
            parts.slice(2),
            parts[0].slice(1),
            srcData,
            srcState,
            isDirectMessage
          );
        }
        else {
          sendEvent(parts, srcState, originalData);
        }
      }
      // otherwise, emit data
      else {
        signaller.emit(
          'data',
          parts.slice(0, 1).concat(parts.slice(2)),
          srcData,
          srcState,
          isDirectMessage
        );
      }
    }
  };
};

},{"./handlers":23,"cog/jsonparse":5,"cog/logger":6}],29:[function(require,module,exports){
// LeverOne's awesome uuid generator
module.exports = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b};

},{}],30:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2xpbGwvU2VydmVyL3J0Yy5pby9ydGMuaW8td2Vic2l0ZS9jb2RlL3F1aWNrY29ubmVjdC1jaGF0LmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL2NvZy9kZWZhdWx0cy5qcyIsIi9Vc2Vycy9jbGlsbC9TZXJ2ZXIvcnRjLmlvL3J0Yy5pby13ZWJzaXRlL25vZGVfbW9kdWxlcy9jb2cvZXh0ZW5kLmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL2NvZy9nZXRhYmxlLmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL2NvZy9qc29ucGFyc2UuanMiLCIvVXNlcnMvY2xpbGwvU2VydmVyL3J0Yy5pby9ydGMuaW8td2Vic2l0ZS9ub2RlX21vZHVsZXMvY29nL2xvZ2dlci5qcyIsIi9Vc2Vycy9jbGlsbC9TZXJ2ZXIvcnRjLmlvL3J0Yy5pby13ZWJzaXRlL25vZGVfbW9kdWxlcy9jb2cvdGhyb3R0bGUuanMiLCIvVXNlcnMvY2xpbGwvU2VydmVyL3J0Yy5pby9ydGMuaW8td2Vic2l0ZS9ub2RlX21vZHVsZXMvcnRjLWNvcmUvZGV0ZWN0LmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL3J0Yy1jb3JlL25vZGVfbW9kdWxlcy9kZXRlY3QtYnJvd3Nlci9icm93c2VyLmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL3J0Yy1jb3JlL3BsdWdpbi5qcyIsIi9Vc2Vycy9jbGlsbC9TZXJ2ZXIvcnRjLmlvL3J0Yy5pby13ZWJzaXRlL25vZGVfbW9kdWxlcy9ydGMtcXVpY2tjb25uZWN0L2luZGV4LmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL3J0Yy1xdWlja2Nvbm5lY3Qvbm9kZV9tb2R1bGVzL3J0Yy10b29scy9jbGVhbnVwLmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL3J0Yy1xdWlja2Nvbm5lY3Qvbm9kZV9tb2R1bGVzL3J0Yy10b29scy9jb3VwbGUuanMiLCIvVXNlcnMvY2xpbGwvU2VydmVyL3J0Yy5pby9ydGMuaW8td2Vic2l0ZS9ub2RlX21vZHVsZXMvcnRjLXF1aWNrY29ubmVjdC9ub2RlX21vZHVsZXMvcnRjLXRvb2xzL2RldGVjdC5qcyIsIi9Vc2Vycy9jbGlsbC9TZXJ2ZXIvcnRjLmlvL3J0Yy5pby13ZWJzaXRlL25vZGVfbW9kdWxlcy9ydGMtcXVpY2tjb25uZWN0L25vZGVfbW9kdWxlcy9ydGMtdG9vbHMvZ2VuZXJhdG9ycy5qcyIsIi9Vc2Vycy9jbGlsbC9TZXJ2ZXIvcnRjLmlvL3J0Yy5pby13ZWJzaXRlL25vZGVfbW9kdWxlcy9ydGMtcXVpY2tjb25uZWN0L25vZGVfbW9kdWxlcy9ydGMtdG9vbHMvaW5kZXguanMiLCIvVXNlcnMvY2xpbGwvU2VydmVyL3J0Yy5pby9ydGMuaW8td2Vic2l0ZS9ub2RlX21vZHVsZXMvcnRjLXF1aWNrY29ubmVjdC9ub2RlX21vZHVsZXMvcnRjLXRvb2xzL21vbml0b3IuanMiLCIvVXNlcnMvY2xpbGwvU2VydmVyL3J0Yy5pby9ydGMuaW8td2Vic2l0ZS9ub2RlX21vZHVsZXMvcnRjLXF1aWNrY29ubmVjdC9ub2RlX21vZHVsZXMvcnRjLXRvb2xzL25vZGVfbW9kdWxlcy9hc3luYy9saWIvYXN5bmMuanMiLCIvVXNlcnMvY2xpbGwvU2VydmVyL3J0Yy5pby9ydGMuaW8td2Vic2l0ZS9ub2RlX21vZHVsZXMvcnRjLXF1aWNrY29ubmVjdC9ub2RlX21vZHVsZXMvcnRjLXRvb2xzL25vZGVfbW9kdWxlcy9ldmVudGVtaXR0ZXIzL2luZGV4LmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvYnJvd3Nlci5qcyIsIi9Vc2Vycy9jbGlsbC9TZXJ2ZXIvcnRjLmlvL3J0Yy5pby13ZWJzaXRlL25vZGVfbW9kdWxlcy9ydGMtc2lnbmFsbGVyL2RlZmF1bHRzLmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvaGFuZGxlcnMvYW5ub3VuY2UuanMiLCIvVXNlcnMvY2xpbGwvU2VydmVyL3J0Yy5pby9ydGMuaW8td2Vic2l0ZS9ub2RlX21vZHVsZXMvcnRjLXNpZ25hbGxlci9oYW5kbGVycy9pbmRleC5qcyIsIi9Vc2Vycy9jbGlsbC9TZXJ2ZXIvcnRjLmlvL3J0Yy5pby13ZWJzaXRlL25vZGVfbW9kdWxlcy9ydGMtc2lnbmFsbGVyL2hhbmRsZXJzL2xlYXZlLmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvaW5kZXguanMiLCIvVXNlcnMvY2xpbGwvU2VydmVyL3J0Yy5pby9ydGMuaW8td2Vic2l0ZS9ub2RlX21vZHVsZXMvcnRjLXNpZ25hbGxlci9wcmltdXMtbG9hZGVyLmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvcHJvY2Vzc29yLmpzIiwiL1VzZXJzL2NsaWxsL1NlcnZlci9ydGMuaW8vcnRjLmlvLXdlYnNpdGUvbm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvdXVpZC5qcyIsIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JtQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDemdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcXVpY2tjb25uZWN0ID0gcmVxdWlyZSgncnRjLXF1aWNrY29ubmVjdCcpO1xuXG5xdWlja2Nvbm5lY3QoJ2h0dHA6Ly9ydGMuaW8vc3dpdGNoYm9hcmQvJywgeyByb29tOiAnY2hhdC10dXRvcmlhbCcgfSlcbiAgLmNyZWF0ZURhdGFDaGFubmVsKCdjaGF0JylcbiAgLm9uKCdjaGF0Om9wZW4nLCBmdW5jdGlvbihkYywgaWQpIHtcbiAgICBjb25zb2xlLmxvZygnYSBkYXRhIGNoYW5uZWwgaGFzIGJlZW4gb3BlbmVkIHRvIHBlZXI6ICcgKyBpZCk7XG4gIH0pOyIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuIyMgY29nL2RlZmF1bHRzXG5cbmBgYGpzXG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdjb2cvZGVmYXVsdHMnKTtcbmBgYFxuXG4jIyMgZGVmYXVsdHModGFyZ2V0LCAqKVxuXG5TaGFsbG93IGNvcHkgb2JqZWN0IHByb3BlcnRpZXMgZnJvbSB0aGUgc3VwcGxpZWQgc291cmNlIG9iamVjdHMgKCopIGludG9cbnRoZSB0YXJnZXQgb2JqZWN0LCByZXR1cm5pbmcgdGhlIHRhcmdldCBvYmplY3Qgb25jZSBjb21wbGV0ZWQuICBEbyBub3QsXG5ob3dldmVyLCBvdmVyd3JpdGUgZXhpc3Rpbmcga2V5cyB3aXRoIG5ldyB2YWx1ZXM6XG5cbmBgYGpzXG5kZWZhdWx0cyh7IGE6IDEsIGI6IDIgfSwgeyBjOiAzIH0sIHsgZDogNCB9LCB7IGI6IDUgfSkpO1xuYGBgXG5cblNlZSBhbiBleGFtcGxlIG9uIFtyZXF1aXJlYmluXShodHRwOi8vcmVxdWlyZWJpbi5jb20vP2dpc3Q9NjA3OTQ3NSkuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gIC8vIGVuc3VyZSB3ZSBoYXZlIGEgdGFyZ2V0XG4gIHRhcmdldCA9IHRhcmdldCB8fCB7fTtcblxuICAvLyBpdGVyYXRlIHRocm91Z2ggdGhlIHNvdXJjZXMgYW5kIGNvcHkgdG8gdGhlIHRhcmdldFxuICBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkuZm9yRWFjaChmdW5jdGlvbihzb3VyY2UpIHtcbiAgICBpZiAoISBzb3VyY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgaWYgKHRhcmdldFtwcm9wXSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHRhcmdldFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB0YXJnZXQ7XG59OyIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuIyMgY29nL2V4dGVuZFxuXG5gYGBqc1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2NvZy9leHRlbmQnKTtcbmBgYFxuXG4jIyMgZXh0ZW5kKHRhcmdldCwgKilcblxuU2hhbGxvdyBjb3B5IG9iamVjdCBwcm9wZXJ0aWVzIGZyb20gdGhlIHN1cHBsaWVkIHNvdXJjZSBvYmplY3RzICgqKSBpbnRvXG50aGUgdGFyZ2V0IG9iamVjdCwgcmV0dXJuaW5nIHRoZSB0YXJnZXQgb2JqZWN0IG9uY2UgY29tcGxldGVkOlxuXG5gYGBqc1xuZXh0ZW5kKHsgYTogMSwgYjogMiB9LCB7IGM6IDMgfSwgeyBkOiA0IH0sIHsgYjogNSB9KSk7XG5gYGBcblxuU2VlIGFuIGV4YW1wbGUgb24gW3JlcXVpcmViaW5dKGh0dHA6Ly9yZXF1aXJlYmluLmNvbS8/Z2lzdD02MDc5NDc1KS5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLmZvckVhY2goZnVuY3Rpb24oc291cmNlKSB7XG4gICAgaWYgKCEgc291cmNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgIHRhcmdldFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB0YXJnZXQ7XG59OyIsIi8qKlxuICAjIyBjb2cvZ2V0YWJsZVxuXG4gIFRha2UgYW4gb2JqZWN0IGFuZCBwcm92aWRlIGEgd3JhcHBlciB0aGF0IGFsbG93cyB5b3UgdG8gYGdldGAgYW5kXG4gIGBzZXRgIHZhbHVlcyBvbiB0aGF0IG9iamVjdC5cblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICBmdW5jdGlvbiBnZXQoa2V5KSB7XG4gICAgcmV0dXJuIHRhcmdldFtrZXldO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpIHtcbiAgICB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlKGtleSkge1xuICAgIHJldHVybiBkZWxldGUgdGFyZ2V0W2tleV07XG4gIH1cblxuICBmdW5jdGlvbiBrZXlzKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0YXJnZXQpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGFyZ2V0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gdGFyZ2V0W2tleV07XG4gICAgfSk7XG4gIH07XG5cbiAgaWYgKHR5cGVvZiB0YXJnZXQgIT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQ6IGdldCxcbiAgICBzZXQ6IHNldCxcbiAgICByZW1vdmU6IHJlbW92ZSxcbiAgICBkZWxldGU6IHJlbW92ZSxcbiAgICBrZXlzOiBrZXlzLFxuICAgIHZhbHVlczogdmFsdWVzXG4gIH07XG59O1xuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gICMjIGNvZy9qc29ucGFyc2VcblxuICBgYGBqc1xuICB2YXIganNvbnBhcnNlID0gcmVxdWlyZSgnY29nL2pzb25wYXJzZScpO1xuICBgYGBcblxuICAjIyMganNvbnBhcnNlKGlucHV0KVxuXG4gIFRoaXMgZnVuY3Rpb24gd2lsbCBhdHRlbXB0IHRvIGF1dG9tYXRpY2FsbHkgZGV0ZWN0IHN0cmluZ2lmaWVkIEpTT04sIGFuZFxuICB3aGVuIGRldGVjdGVkIHdpbGwgcGFyc2UgaW50byBKU09OIG9iamVjdHMuICBUaGUgZnVuY3Rpb24gbG9va3MgZm9yIHN0cmluZ3NcbiAgdGhhdCBsb29rIGFuZCBzbWVsbCBsaWtlIHN0cmluZ2lmaWVkIEpTT04sIGFuZCBpZiBmb3VuZCBhdHRlbXB0cyB0b1xuICBgSlNPTi5wYXJzZWAgdGhlIGlucHV0IGludG8gYSB2YWxpZCBvYmplY3QuXG5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpbnB1dCkge1xuICB2YXIgaXNTdHJpbmcgPSB0eXBlb2YgaW5wdXQgPT0gJ3N0cmluZycgfHwgKGlucHV0IGluc3RhbmNlb2YgU3RyaW5nKTtcbiAgdmFyIHJlTnVtZXJpYyA9IC9eXFwtP1xcZCtcXC4/XFxkKiQvO1xuICB2YXIgc2hvdWxkUGFyc2UgO1xuICB2YXIgZmlyc3RDaGFyO1xuICB2YXIgbGFzdENoYXI7XG5cbiAgaWYgKCghIGlzU3RyaW5nKSB8fCBpbnB1dC5sZW5ndGggPCAyKSB7XG4gICAgaWYgKGlzU3RyaW5nICYmIHJlTnVtZXJpYy50ZXN0KGlucHV0KSkge1xuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaW5wdXQpO1xuICAgIH1cblxuICAgIHJldHVybiBpbnB1dDtcbiAgfVxuXG4gIC8vIGNoZWNrIGZvciB0cnVlIG9yIGZhbHNlXG4gIGlmIChpbnB1dCA9PT0gJ3RydWUnIHx8IGlucHV0ID09PSAnZmFsc2UnKSB7XG4gICAgcmV0dXJuIGlucHV0ID09PSAndHJ1ZSc7XG4gIH1cblxuICAvLyBjaGVjayBmb3IgbnVsbFxuICBpZiAoaW5wdXQgPT09ICdudWxsJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gZ2V0IHRoZSBmaXJzdCBhbmQgbGFzdCBjaGFyYWN0ZXJzXG4gIGZpcnN0Q2hhciA9IGlucHV0LmNoYXJBdCgwKTtcbiAgbGFzdENoYXIgPSBpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSk7XG5cbiAgLy8gZGV0ZXJtaW5lIHdoZXRoZXIgd2Ugc2hvdWxkIEpTT04ucGFyc2UgdGhlIGlucHV0XG4gIHNob3VsZFBhcnNlID1cbiAgICAoZmlyc3RDaGFyID09ICd7JyAmJiBsYXN0Q2hhciA9PSAnfScpIHx8XG4gICAgKGZpcnN0Q2hhciA9PSAnWycgJiYgbGFzdENoYXIgPT0gJ10nKSB8fFxuICAgIChmaXJzdENoYXIgPT0gJ1wiJyAmJiBsYXN0Q2hhciA9PSAnXCInKTtcblxuICBpZiAoc2hvdWxkUGFyc2UpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoaW5wdXQpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgLy8gYXBwYXJlbnRseSBpdCB3YXNuJ3QgdmFsaWQganNvbiwgY2Fycnkgb24gd2l0aCByZWd1bGFyIHByb2Nlc3NpbmdcbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiByZU51bWVyaWMudGVzdChpbnB1dCkgPyBwYXJzZUZsb2F0KGlucHV0KSA6IGlucHV0O1xufTsiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAgIyMgY29nL2xvZ2dlclxuXG4gIGBgYGpzXG4gIHZhciBsb2dnZXIgPSByZXF1aXJlKCdjb2cvbG9nZ2VyJyk7XG4gIGBgYFxuXG4gIFNpbXBsZSBicm93c2VyIGxvZ2dpbmcgb2ZmZXJpbmcgc2ltaWxhciBmdW5jdGlvbmFsaXR5IHRvIHRoZVxuICBbZGVidWddKGh0dHBzOi8vZ2l0aHViLmNvbS92aXNpb25tZWRpYS9kZWJ1ZykgbW9kdWxlLlxuXG4gICMjIyBVc2FnZVxuXG4gIENyZWF0ZSB5b3VyIHNlbGYgYSBuZXcgbG9nZ2luZyBpbnN0YW5jZSBhbmQgZ2l2ZSBpdCBhIG5hbWU6XG5cbiAgYGBganNcbiAgdmFyIGRlYnVnID0gbG9nZ2VyKCdwaGlsJyk7XG4gIGBgYFxuXG4gIE5vdyBkbyBzb21lIGRlYnVnZ2luZzpcblxuICBgYGBqc1xuICBkZWJ1ZygnaGVsbG8nKTtcbiAgYGBgXG5cbiAgQXQgdGhpcyBzdGFnZSwgbm8gbG9nIG91dHB1dCB3aWxsIGJlIGdlbmVyYXRlZCBiZWNhdXNlIHlvdXIgbG9nZ2VyIGlzXG4gIGN1cnJlbnRseSBkaXNhYmxlZC4gIEVuYWJsZSBpdDpcblxuICBgYGBqc1xuICBsb2dnZXIuZW5hYmxlKCdwaGlsJyk7XG4gIGBgYFxuXG4gIE5vdyBkbyBzb21lIG1vcmUgbG9nZ2VyOlxuXG4gIGBgYGpzXG4gIGRlYnVnKCdPaCB0aGlzIGlzIHNvIG11Y2ggbmljZXIgOiknKTtcbiAgLy8gLS0+IHBoaWw6IE9oIHRoaXMgaXMgc29tZSBtdWNoIG5pY2VyIDopXG4gIGBgYFxuXG4gICMjIyBSZWZlcmVuY2VcbioqL1xuXG52YXIgYWN0aXZlID0gW107XG52YXIgdW5sZWFzaExpc3RlbmVycyA9IFtdO1xudmFyIHRhcmdldHMgPSBbIGNvbnNvbGUgXTtcblxuLyoqXG4gICMjIyMgbG9nZ2VyKG5hbWUpXG5cbiAgQ3JlYXRlIGEgbmV3IGxvZ2dpbmcgaW5zdGFuY2UuXG4qKi9cbnZhciBsb2dnZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgLy8gaW5pdGlhbCBlbmFibGVkIGNoZWNrXG4gIHZhciBlbmFibGVkID0gY2hlY2tBY3RpdmUoKTtcblxuICBmdW5jdGlvbiBjaGVja0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gZW5hYmxlZCA9IGFjdGl2ZS5pbmRleE9mKCcqJykgPj0gMCB8fCBhY3RpdmUuaW5kZXhPZihuYW1lKSA+PSAwO1xuICB9XG5cbiAgLy8gcmVnaXN0ZXIgdGhlIGNoZWNrIGFjdGl2ZSB3aXRoIHRoZSBsaXN0ZW5lcnMgYXJyYXlcbiAgdW5sZWFzaExpc3RlbmVyc1t1bmxlYXNoTGlzdGVuZXJzLmxlbmd0aF0gPSBjaGVja0FjdGl2ZTtcblxuICAvLyByZXR1cm4gdGhlIGFjdHVhbCBsb2dnaW5nIGZ1bmN0aW9uXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICAgIC8vIGlmIHdlIGhhdmUgYSBzdHJpbmcgbWVzc2FnZVxuICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PSAnc3RyaW5nJyB8fCAoYXJnc1swXSBpbnN0YW5jZW9mIFN0cmluZykpIHtcbiAgICAgIGFyZ3NbMF0gPSBuYW1lICsgJzogJyArIGFyZ3NbMF07XG4gICAgfVxuXG4gICAgLy8gaWYgbm90IGVuYWJsZWQsIGJhaWxcbiAgICBpZiAoISBlbmFibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gbG9nXG4gICAgdGFyZ2V0cy5mb3JFYWNoKGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgdGFyZ2V0LmxvZy5hcHBseSh0YXJnZXQsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xufTtcblxuLyoqXG4gICMjIyMgbG9nZ2VyLnJlc2V0KClcblxuICBSZXNldCBsb2dnaW5nIChyZW1vdmUgdGhlIGRlZmF1bHQgY29uc29sZSBsb2dnZXIsIGZsYWcgYWxsIGxvZ2dlcnMgYXNcbiAgaW5hY3RpdmUsIGV0YywgZXRjLlxuKiovXG5sb2dnZXIucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgLy8gcmVzZXQgdGFyZ2V0cyBhbmQgYWN0aXZlIHN0YXRlc1xuICB0YXJnZXRzID0gW107XG4gIGFjdGl2ZSA9IFtdO1xuXG4gIHJldHVybiBsb2dnZXIuZW5hYmxlKCk7XG59O1xuXG4vKipcbiAgIyMjIyBsb2dnZXIudG8odGFyZ2V0KVxuXG4gIEFkZCBhIGxvZ2dpbmcgdGFyZ2V0LiAgVGhlIGxvZ2dlciBtdXN0IGhhdmUgYSBgbG9nYCBtZXRob2QgYXR0YWNoZWQuXG5cbioqL1xubG9nZ2VyLnRvID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gIHRhcmdldHMgPSB0YXJnZXRzLmNvbmNhdCh0YXJnZXQgfHwgW10pO1xuXG4gIHJldHVybiBsb2dnZXI7XG59O1xuXG4vKipcbiAgIyMjIyBsb2dnZXIuZW5hYmxlKG5hbWVzKilcblxuICBFbmFibGUgbG9nZ2luZyB2aWEgdGhlIG5hbWVkIGxvZ2dpbmcgaW5zdGFuY2VzLiAgVG8gZW5hYmxlIGxvZ2dpbmcgdmlhIGFsbFxuICBpbnN0YW5jZXMsIHlvdSBjYW4gcGFzcyBhIHdpbGRjYXJkOlxuXG4gIGBgYGpzXG4gIGxvZ2dlci5lbmFibGUoJyonKTtcbiAgYGBgXG5cbiAgX19UT0RPOl9fIHdpbGRjYXJkIGVuYWJsZXJzXG4qKi9cbmxvZ2dlci5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gdXBkYXRlIHRoZSBhY3RpdmVcbiAgYWN0aXZlID0gYWN0aXZlLmNvbmNhdChbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuXG4gIC8vIHRyaWdnZXIgdGhlIHVubGVhc2ggbGlzdGVuZXJzXG4gIHVubGVhc2hMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgIGxpc3RlbmVyKCk7XG4gIH0pO1xuXG4gIHJldHVybiBsb2dnZXI7XG59OyIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICAjIyBjb2cvdGhyb3R0bGVcblxuICBgYGBqc1xuICB2YXIgdGhyb3R0bGUgPSByZXF1aXJlKCdjb2cvdGhyb3R0bGUnKTtcbiAgYGBgXG5cbiAgIyMjIHRocm90dGxlKGZuLCBkZWxheSwgb3B0cylcblxuICBBIGNoZXJyeS1waWNrYWJsZSB0aHJvdHRsZSBmdW5jdGlvbi4gIFVzZWQgdG8gdGhyb3R0bGUgYGZuYCB0byBlbnN1cmVcbiAgdGhhdCBpdCBjYW4gYmUgY2FsbGVkIGF0IG1vc3Qgb25jZSBldmVyeSBgZGVsYXlgIG1pbGxpc2Vjb25kcy4gIFdpbGxcbiAgZmlyZSBmaXJzdCBldmVudCBpbW1lZGlhdGVseSwgZW5zdXJpbmcgdGhlIG5leHQgZXZlbnQgZmlyZWQgd2lsbCBvY2N1clxuICBhdCBsZWFzdCBgZGVsYXlgIG1pbGxpc2Vjb25kcyBhZnRlciB0aGUgZmlyc3QsIGFuZCBzbyBvbi5cblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCBkZWxheSwgb3B0cykge1xuICB2YXIgbGFzdEV4ZWMgPSAob3B0cyB8fCB7fSkubGVhZGluZyAhPT0gZmFsc2UgPyAwIDogRGF0ZS5ub3coKTtcbiAgdmFyIHRyYWlsaW5nID0gKG9wdHMgfHwge30pLnRyYWlsaW5nO1xuICB2YXIgdGltZXI7XG4gIHZhciBxdWV1ZWRBcmdzO1xuICB2YXIgcXVldWVkU2NvcGU7XG5cbiAgLy8gdHJhaWxpbmcgZGVmYXVsdHMgdG8gdHJ1ZVxuICB0cmFpbGluZyA9IHRyYWlsaW5nIHx8IHRyYWlsaW5nID09PSB1bmRlZmluZWQ7XG4gIFxuICBmdW5jdGlvbiBpbnZva2VEZWZlcmVkKCkge1xuICAgIGZuLmFwcGx5KHF1ZXVlZFNjb3BlLCBxdWV1ZWRBcmdzIHx8IFtdKTtcbiAgICBsYXN0RXhlYyA9IERhdGUubm93KCk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRpY2sgPSBEYXRlLm5vdygpO1xuICAgIHZhciBlbGFwc2VkID0gdGljayAtIGxhc3RFeGVjO1xuXG4gICAgLy8gYWx3YXlzIGNsZWFyIHRoZSBkZWZlcmVkIHRpbWVyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICAgIGlmIChlbGFwc2VkIDwgZGVsYXkpIHtcbiAgICAgIHF1ZXVlZEFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICBxdWV1ZWRTY29wZSA9IHRoaXM7XG5cbiAgICAgIHJldHVybiB0cmFpbGluZyAmJiAodGltZXIgPSBzZXRUaW1lb3V0KGludm9rZURlZmVyZWQsIGRlbGF5IC0gZWxhcHNlZCkpO1xuICAgIH1cblxuICAgIC8vIGNhbGwgdGhlIGZ1bmN0aW9uXG4gICAgbGFzdEV4ZWMgPSB0aWNrO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59OyIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4vKiBnbG9iYWwgd2luZG93OiBmYWxzZSAqL1xuLyogZ2xvYmFsIG5hdmlnYXRvcjogZmFsc2UgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYnJvd3NlciA9IHJlcXVpcmUoJ2RldGVjdC1icm93c2VyJyk7XG5cbi8qKlxuICAjIyBydGMtY29yZS9kZXRlY3RcblxuICBBIGJyb3dzZXIgZGV0ZWN0aW9uIGhlbHBlciBmb3IgYWNjZXNzaW5nIHByZWZpeC1mcmVlIHZlcnNpb25zIG9mIHRoZSB2YXJpb3VzXG4gIFdlYlJUQyB0eXBlcy5cblxuICAjIyMgRXhhbXBsZSBVc2FnZVxuXG4gIElmIHlvdSB3YW50ZWQgdG8gZ2V0IHRoZSBuYXRpdmUgYFJUQ1BlZXJDb25uZWN0aW9uYCBwcm90b3R5cGUgaW4gYW55IGJyb3dzZXJcbiAgeW91IGNvdWxkIGRvIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBganNcbiAgdmFyIGRldGVjdCA9IHJlcXVpcmUoJ3J0Yy1jb3JlL2RldGVjdCcpOyAvLyBhbHNvIGF2YWlsYWJsZSBpbiBydGMvZGV0ZWN0XG4gIHZhciBSVENQZWVyQ29ubmVjdGlvbiA9IGRldGVjdCgnUlRDUGVlckNvbm5lY3Rpb24nKTtcbiAgYGBgXG5cbiAgVGhpcyB3b3VsZCBwcm92aWRlIHdoYXRldmVyIHRoZSBicm93c2VyIHByZWZpeGVkIHZlcnNpb24gb2YgdGhlXG4gIFJUQ1BlZXJDb25uZWN0aW9uIGlzIGF2YWlsYWJsZSAoYHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uYCxcbiAgYG1velJUQ1BlZXJDb25uZWN0aW9uYCwgZXRjKS5cbioqL1xudmFyIGRldGVjdCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0LCBwcmVmaXhlcykge1xuICB2YXIgcHJlZml4SWR4O1xuICB2YXIgcHJlZml4O1xuICB2YXIgdGVzdE5hbWU7XG4gIHZhciBob3N0T2JqZWN0ID0gdGhpcyB8fCAodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHVuZGVmaW5lZCk7XG5cbiAgLy8gaWYgd2UgaGF2ZSBubyBob3N0IG9iamVjdCwgdGhlbiBhYm9ydFxuICBpZiAoISBob3N0T2JqZWN0KSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gaW5pdGlhbGlzZSB0byBkZWZhdWx0IHByZWZpeGVzXG4gIC8vIChyZXZlcnNlIG9yZGVyIGFzIHdlIHVzZSBhIGRlY3JlbWVudGluZyBmb3IgbG9vcClcbiAgcHJlZml4ZXMgPSAocHJlZml4ZXMgfHwgWydtcycsICdvJywgJ21veicsICd3ZWJraXQnXSkuY29uY2F0KCcnKTtcblxuICAvLyBpdGVyYXRlIHRocm91Z2ggdGhlIHByZWZpeGVzIGFuZCByZXR1cm4gdGhlIGNsYXNzIGlmIGZvdW5kIGluIGdsb2JhbFxuICBmb3IgKHByZWZpeElkeCA9IHByZWZpeGVzLmxlbmd0aDsgcHJlZml4SWR4LS07ICkge1xuICAgIHByZWZpeCA9IHByZWZpeGVzW3ByZWZpeElkeF07XG5cbiAgICAvLyBjb25zdHJ1Y3QgdGhlIHRlc3QgY2xhc3MgbmFtZVxuICAgIC8vIGlmIHdlIGhhdmUgYSBwcmVmaXggZW5zdXJlIHRoZSB0YXJnZXQgaGFzIGFuIHVwcGVyY2FzZSBmaXJzdCBjaGFyYWN0ZXJcbiAgICAvLyBzdWNoIHRoYXQgYSB0ZXN0IGZvciBnZXRVc2VyTWVkaWEgd291bGQgcmVzdWx0IGluIGFcbiAgICAvLyBzZWFyY2ggZm9yIHdlYmtpdEdldFVzZXJNZWRpYVxuICAgIHRlc3ROYW1lID0gcHJlZml4ICsgKHByZWZpeCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGFyZ2V0LnNsaWNlKDEpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQpO1xuXG4gICAgaWYgKHR5cGVvZiBob3N0T2JqZWN0W3Rlc3ROYW1lXSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gdXBkYXRlIHRoZSBsYXN0IHVzZWQgcHJlZml4XG4gICAgICBkZXRlY3QuYnJvd3NlciA9IGRldGVjdC5icm93c2VyIHx8IHByZWZpeC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAvLyByZXR1cm4gdGhlIGhvc3Qgb2JqZWN0IG1lbWJlclxuICAgICAgcmV0dXJuIGhvc3RPYmplY3RbdGFyZ2V0XSA9IGhvc3RPYmplY3RbdGVzdE5hbWVdO1xuICAgIH1cbiAgfVxufTtcblxuLy8gZGV0ZWN0IG1vemlsbGEgKHllcywgdGhpcyBmZWVscyBkaXJ0eSlcbmRldGVjdC5tb3ogPSB0eXBlb2YgbmF2aWdhdG9yICE9ICd1bmRlZmluZWQnICYmICEhbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYTtcblxuLy8gc2V0IHRoZSBicm93c2VyIGFuZCBicm93c2VyIHZlcnNpb25cbmRldGVjdC5icm93c2VyID0gYnJvd3Nlci5uYW1lO1xuZGV0ZWN0LmJyb3dzZXJWZXJzaW9uID0gZGV0ZWN0LnZlcnNpb24gPSBicm93c2VyLnZlcnNpb247XG4iLCJ2YXIgYnJvd3NlcnMgPSBbXG4gIFsgJ2Nocm9tZScsIC9DaHJvbSg/OmV8aXVtKVxcLyhbMC05XFwuXSspKDo/XFxzfCQpLyBdLFxuICBbICdmaXJlZm94JywgL0ZpcmVmb3hcXC8oWzAtOVxcLl0rKSg/Olxcc3wkKS8gXSxcbiAgWyAnb3BlcmEnLCAvT3BlcmFcXC8oWzAtOVxcLl0rKSg/Olxcc3wkKS8gXSxcbiAgWyAnaWUnLCAvVHJpZGVudFxcLzdcXC4wLipydlxcOihbMC05XFwuXSspXFwpLipHZWNrbyQvIF0sXG4gIFsgJ2llJywgL01TSUVcXHMoWzAtOVxcLl0rKTsuKlRyaWRlbnRcXC9bNC02XS4wLyBdLFxuICBbICdpZScsIC9NU0lFXFxzKDdcXC4wKS8gXSxcbiAgWyAnYmIxMCcsIC9CQjEwO1xcc1RvdWNoLipWZXJzaW9uXFwvKFswLTlcXC5dKykvIF0sXG4gIFsgJ2FuZHJvaWQnLCAvQW5kcm9pZFxccyhbMC05XFwuXSspLyBdLFxuICBbICdpb3MnLCAvaVBhZFxcO1xcc0NQVVxcc09TXFxzKFswLTlcXC5fXSspLyBdLFxuICBbICdpb3MnLCAvaVBob25lXFw7XFxzQ1BVXFxzaVBob25lXFxzT1NcXHMoWzAtOVxcLl9dKykvIF1cbl07XG5cbnZhciBtYXRjaCA9IGJyb3dzZXJzLm1hcChtYXRjaCkuZmlsdGVyKGlzTWF0Y2gpWzBdO1xudmFyIHBhcnRzID0gbWF0Y2ggJiYgbWF0Y2hbM10uc3BsaXQoL1suX10vKS5zbGljZSgwLDMpO1xuXG53aGlsZSAocGFydHMgJiYgcGFydHMubGVuZ3RoIDwgMykge1xuICBwYXJ0cy5wdXNoKCcwJyk7XG59XG5cbi8vIHNldCB0aGUgbmFtZSBhbmQgdmVyc2lvblxuZXhwb3J0cy5uYW1lID0gbWF0Y2ggJiYgbWF0Y2hbMF07XG5leHBvcnRzLnZlcnNpb24gPSBwYXJ0cyAmJiBwYXJ0cy5qb2luKCcuJyk7XG5cbmZ1bmN0aW9uIG1hdGNoKHBhaXIpIHtcbiAgcmV0dXJuIHBhaXIuY29uY2F0KHBhaXJbMV0uZXhlYyhuYXZpZ2F0b3IudXNlckFnZW50KSk7XG59XG5cbmZ1bmN0aW9uIGlzTWF0Y2gocGFpcikge1xuICByZXR1cm4gISFwYWlyWzJdO1xufVxuIiwidmFyIGRldGVjdCA9IHJlcXVpcmUoJy4vZGV0ZWN0Jyk7XG52YXIgcmVxdWlyZWRGdW5jdGlvbnMgPSBbXG4gICdpbml0J1xuXTtcblxuZnVuY3Rpb24gaXNTdXBwb3J0ZWQocGx1Z2luKSB7XG4gIHJldHVybiBwbHVnaW4gJiYgdHlwZW9mIHBsdWdpbi5zdXBwb3J0ZWQgPT0gJ2Z1bmN0aW9uJyAmJiBwbHVnaW4uc3VwcG9ydGVkKGRldGVjdCk7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWQocGx1Z2luKSB7XG4gIHZhciBzdXBwb3J0ZWRGdW5jdGlvbnMgPSByZXF1aXJlZEZ1bmN0aW9ucy5maWx0ZXIoZnVuY3Rpb24oZm4pIHtcbiAgICByZXR1cm4gdHlwZW9mIHBsdWdpbltmbl0gPT0gJ2Z1bmN0aW9uJztcbiAgfSk7XG5cbiAgcmV0dXJuIHN1cHBvcnRlZEZ1bmN0aW9ucy5sZW5ndGggPT09IHJlcXVpcmVkRnVuY3Rpb25zLmxlbmd0aDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwbHVnaW5zKSB7XG4gIHJldHVybiBbXS5jb25jYXQocGx1Z2lucyB8fCBbXSkuZmlsdGVyKGlzU3VwcG9ydGVkKS5maWx0ZXIoaXNWYWxpZClbMF07XG59XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHJ0YyA9IHJlcXVpcmUoJ3J0Yy10b29scycpO1xudmFyIGNsZWFudXAgPSByZXF1aXJlKCdydGMtdG9vbHMvY2xlYW51cCcpO1xudmFyIGRlYnVnID0gcnRjLmxvZ2dlcigncnRjLXF1aWNrY29ubmVjdCcpO1xudmFyIHNpZ25hbGxlciA9IHJlcXVpcmUoJ3J0Yy1zaWduYWxsZXInKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJ2NvZy9kZWZhdWx0cycpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2NvZy9leHRlbmQnKTtcbnZhciBnZXRhYmxlID0gcmVxdWlyZSgnY29nL2dldGFibGUnKTtcbnZhciByZVRyYWlsaW5nU2xhc2ggPSAvXFwvJC87XG5cbi8qKlxuICAjIHJ0Yy1xdWlja2Nvbm5lY3RcblxuICBUaGlzIGlzIGEgaGlnaCBsZXZlbCBoZWxwZXIgbW9kdWxlIGRlc2lnbmVkIHRvIGhlbHAgeW91IGdldCB1cFxuICBhbiBydW5uaW5nIHdpdGggV2ViUlRDIHJlYWxseSwgcmVhbGx5IHF1aWNrbHkuICBCeSB1c2luZyB0aGlzIG1vZHVsZSB5b3VcbiAgYXJlIHRyYWRpbmcgb2ZmIHNvbWUgZmxleGliaWxpdHksIHNvIGlmIHlvdSBuZWVkIGEgbW9yZSBmbGV4aWJsZVxuICBjb25maWd1cmF0aW9uIHlvdSBzaG91bGQgZHJpbGwgZG93biBpbnRvIGxvd2VyIGxldmVsIGNvbXBvbmVudHMgb2YgdGhlXG4gIFtydGMuaW9dKGh0dHA6Ly93d3cucnRjLmlvKSBzdWl0ZS4gIEluIHBhcnRpY3VsYXIgeW91IHNob3VsZCBjaGVjayBvdXRcbiAgW3J0Y10oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMpLlxuXG4gICMjIEV4YW1wbGUgVXNhZ2VcblxuICBJbiB0aGUgc2ltcGxlc3QgY2FzZSB5b3Ugc2ltcGx5IGNhbGwgcXVpY2tjb25uZWN0IHdpdGggYSBzaW5nbGUgc3RyaW5nXG4gIGFyZ3VtZW50IHdoaWNoIHRlbGxzIHF1aWNrY29ubmVjdCB3aGljaCBzZXJ2ZXIgdG8gdXNlIGZvciBzaWduYWxpbmc6XG5cbiAgPDw8IGV4YW1wbGVzL3NpbXBsZS5qc1xuXG4gIDw8PCBkb2NzL2V2ZW50cy5tZFxuXG4gIDw8PCBkb2NzL2V4YW1wbGVzLm1kXG5cbiAgIyMgUmVnYXJkaW5nIFNpZ25hbGxpbmcgYW5kIGEgU2lnbmFsbGluZyBTZXJ2ZXJcblxuICBTaWduYWxpbmcgaXMgYW4gaW1wb3J0YW50IHBhcnQgb2Ygc2V0dGluZyB1cCBhIFdlYlJUQyBjb25uZWN0aW9uIGFuZCBmb3JcbiAgb3VyIGV4YW1wbGVzIHdlIHVzZSBvdXIgb3duIHRlc3QgaW5zdGFuY2Ugb2YgdGhlXG4gIFtydGMtc3dpdGNoYm9hcmRdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjLXN3aXRjaGJvYXJkKS4gRm9yIHlvdXJcbiAgdGVzdGluZyBhbmQgZGV2ZWxvcG1lbnQgeW91IGFyZSBtb3JlIHRoYW4gd2VsY29tZSB0byB1c2UgdGhpcyBhbHNvLCBidXRcbiAganVzdCBiZSBhd2FyZSB0aGF0IHdlIHVzZSB0aGlzIGZvciBvdXIgdGVzdGluZyBzbyBpdCBtYXkgZ28gdXAgYW5kIGRvd25cbiAgYSBsaXR0bGUuICBJZiB5b3UgbmVlZCBzb21ldGhpbmcgbW9yZSBzdGFibGUsIHdoeSBub3QgY29uc2lkZXIgZGVwbG95aW5nXG4gIGFuIGluc3RhbmNlIG9mIHRoZSBzd2l0Y2hib2FyZCB5b3Vyc2VsZiAtIGl0J3MgcHJldHR5IGVhc3kgOilcblxuICAjIyBSZWZlcmVuY2VcblxuICBgYGBcbiAgcXVpY2tjb25uZWN0KHNpZ25hbGhvc3QsIG9wdHM/KSA9PiBydGMtc2lnYWxsZXIgaW5zdGFuY2UgKCsgaGVscGVycylcbiAgYGBgXG5cbiAgIyMjIFZhbGlkIFF1aWNrIENvbm5lY3QgT3B0aW9uc1xuXG4gIFRoZSBvcHRpb25zIHByb3ZpZGVkIHRvIHRoZSBgcnRjLXF1aWNrY29ubmVjdGAgbW9kdWxlIGZ1bmN0aW9uIGluZmx1ZW5jZSB0aGVcbiAgYmVoYXZpb3VyIG9mIHNvbWUgb2YgdGhlIHVuZGVybHlpbmcgY29tcG9uZW50cyB1c2VkIGZyb20gdGhlIHJ0Yy5pbyBzdWl0ZS5cblxuICBMaXN0ZWQgYmVsb3cgYXJlIHNvbWUgb2YgdGhlIGNvbW1vbmx5IHVzZWQgb3B0aW9uczpcblxuICAtIGBuc2AgKGRlZmF1bHQ6ICcnKVxuXG4gICAgQW4gb3B0aW9uYWwgbmFtZXNwYWNlIGZvciB5b3VyIHNpZ25hbGxpbmcgcm9vbS4gIFdoaWxlIHF1aWNrY29ubmVjdFxuICAgIHdpbGwgZ2VuZXJhdGUgYSB1bmlxdWUgaGFzaCBmb3IgdGhlIHJvb20sIHRoaXMgY2FuIGJlIG1hZGUgdG8gYmUgbW9yZVxuICAgIHVuaXF1ZSBieSBwcm92aWRpbmcgYSBuYW1lc3BhY2UuICBVc2luZyBhIG5hbWVzcGFjZSBtZWFucyB0d28gZGVtb3NcbiAgICB0aGF0IGhhdmUgZ2VuZXJhdGVkIHRoZSBzYW1lIGhhc2ggYnV0IHVzZSBhIGRpZmZlcmVudCBuYW1lc3BhY2Ugd2lsbCBiZVxuICAgIGluIGRpZmZlcmVudCByb29tcy5cblxuICAtIGByb29tYCAoZGVmYXVsdDogbnVsbCkgX2FkZGVkIDAuNl9cblxuICAgIFJhdGhlciB0aGFuIHVzZSB0aGUgaW50ZXJuYWwgaGFzaCBnZW5lcmF0aW9uXG4gICAgKHBsdXMgb3B0aW9uYWwgbmFtZXNwYWNlKSBmb3Igcm9vbSBuYW1lIGdlbmVyYXRpb24sIHNpbXBseSB1c2UgdGhpcyByb29tXG4gICAgbmFtZSBpbnN0ZWFkLiAgX19OT1RFOl9fIFVzZSBvZiB0aGUgYHJvb21gIG9wdGlvbiB0YWtlcyBwcmVjZW5kZW5jZSBvdmVyXG4gICAgYG5zYC5cblxuICAtIGBkZWJ1Z2AgKGRlZmF1bHQ6IGZhbHNlKVxuXG4gIFdyaXRlIHJ0Yy5pbyBzdWl0ZSBkZWJ1ZyBvdXRwdXQgdG8gdGhlIGJyb3dzZXIgY29uc29sZS5cblxuICAjIyMjIE9wdGlvbnMgZm9yIFBlZXIgQ29ubmVjdGlvbiBDcmVhdGlvblxuXG4gIE9wdGlvbnMgdGhhdCBhcmUgcGFzc2VkIG9udG8gdGhlXG4gIFtydGMuY3JlYXRlQ29ubmVjdGlvbl0oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMjY3JlYXRlY29ubmVjdGlvbm9wdHMtY29uc3RyYWludHMpXG4gIGZ1bmN0aW9uOlxuXG4gIC0gYGljZVNlcnZlcnNgXG5cbiAgVGhpcyBwcm92aWRlcyBhIGxpc3Qgb2YgaWNlIHNlcnZlcnMgdGhhdCBjYW4gYmUgdXNlZCB0byBoZWxwIG5lZ290aWF0ZSBhXG4gIGNvbm5lY3Rpb24gYmV0d2VlbiBwZWVycy5cblxuICAjIyMjIE9wdGlvbnMgZm9yIFAyUCBuZWdvdGlhdGlvblxuXG4gIFVuZGVyIHRoZSBob29kLCBxdWlja2Nvbm5lY3QgdXNlcyB0aGVcbiAgW3J0Yy9jb3VwbGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjI3J0Y2NvdXBsZSkgbG9naWMsIGFuZCB0aGUgb3B0aW9uc1xuICBwYXNzZWQgdG8gcXVpY2tjb25uZWN0IGFyZSBhbHNvIHBhc3NlZCBvbnRvIHRoaXMgZnVuY3Rpb24uXG5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaWduYWxob3N0LCBvcHRzKSB7XG4gIHZhciBoYXNoID0gdHlwZW9mIGxvY2F0aW9uICE9ICd1bmRlZmluZWQnICYmIGxvY2F0aW9uLmhhc2guc2xpY2UoMSk7XG4gIHZhciBzaWduYWxsZXIgPSByZXF1aXJlKCdydGMtc2lnbmFsbGVyJykoc2lnbmFsaG9zdCwgb3B0cyk7XG5cbiAgLy8gaW5pdCBjb25maWd1cmFibGUgdmFyc1xuICB2YXIgbnMgPSAob3B0cyB8fCB7fSkubnMgfHwgJyc7XG4gIHZhciByb29tID0gKG9wdHMgfHwge30pLnJvb207XG4gIHZhciBkZWJ1Z2dpbmcgPSAob3B0cyB8fCB7fSkuZGVidWc7XG4gIHZhciBwcm9maWxlID0ge307XG4gIHZhciBhbm5vdW5jZWQgPSBmYWxzZTtcblxuICAvLyBjb2xsZWN0IHRoZSBsb2NhbCBzdHJlYW1zXG4gIHZhciBsb2NhbFN0cmVhbXMgPSBbXTtcblxuICAvLyBjcmVhdGUgdGhlIGNhbGxzIG1hcFxuICB2YXIgY2FsbHMgPSBzaWduYWxsZXIuY2FsbHMgPSBnZXRhYmxlKHt9KTtcblxuICAvLyBjcmVhdGUgdGhlIGtub3duIGRhdGEgY2hhbm5lbHMgcmVnaXN0cnlcbiAgdmFyIGNoYW5uZWxzID0ge307XG5cbiAgLy8gc2F2ZSB0aGUgcGx1Z2lucyBwYXNzZWQgdG8gdGhlIHNpZ25hbGxlclxuICB2YXIgcGx1Z2lucyA9IHNpZ25hbGxlci5wbHVnaW5zID0gKG9wdHMgfHwge30pLnBsdWdpbnMgfHwgW107XG5cbiAgZnVuY3Rpb24gY2FsbENyZWF0ZShpZCwgcGMsIGRhdGEpIHtcbiAgICBjYWxscy5zZXQoaWQsIHtcbiAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICBwYzogcGMsXG4gICAgICBjaGFubmVsczogZ2V0YWJsZSh7fSksXG4gICAgICBkYXRhOiBkYXRhLFxuICAgICAgc3RyZWFtczogW11cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGxFbmQoaWQpIHtcbiAgICB2YXIgY2FsbCA9IGNhbGxzLmdldChpZCk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIG5vIGRhdGEsIHRoZW4gZG8gbm90aGluZ1xuICAgIGlmICghIGNhbGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkZWJ1ZygnZW5kaW5nIGNhbGwgdG86ICcgKyBpZCk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIG5vIGRhdGEsIHRoZW4gcmV0dXJuXG4gICAgY2FsbC5jaGFubmVscy5rZXlzKCkuZm9yRWFjaChmdW5jdGlvbihsYWJlbCkge1xuICAgICAgdmFyIGNoYW5uZWwgPSBjYWxsLmNoYW5uZWxzLmdldChsYWJlbCk7XG4gICAgICB2YXIgYXJncyA9IFtpZCwgY2hhbm5lbCwgbGFiZWxdO1xuXG4gICAgICAvLyBlbWl0IHRoZSBwbGFpbiBjaGFubmVsOmNsb3NlZCBldmVudFxuICAgICAgc2lnbmFsbGVyLmVtaXQuYXBwbHkoc2lnbmFsbGVyLCBbJ2NoYW5uZWw6Y2xvc2VkJ10uY29uY2F0KGFyZ3MpKTtcblxuICAgICAgLy8gZW1pdCB0aGUgbGFiZWxsZWQgdmVyc2lvbiBvZiB0aGUgZXZlbnRcbiAgICAgIHNpZ25hbGxlci5lbWl0LmFwcGx5KHNpZ25hbGxlciwgWydjaGFubmVsOmNsb3NlZDonICsgbGFiZWxdLmNvbmNhdChhcmdzKSk7XG5cbiAgICAgIC8vIGRlY291cGxlIHRoZSBldmVudHNcbiAgICAgIGNoYW5uZWwub25vcGVuID0gbnVsbDtcbiAgICB9KTtcblxuICAgIC8vIHRyaWdnZXIgc3RyZWFtOnJlbW92ZWQgZXZlbnRzIGZvciBlYWNoIG9mIHRoZSByZW1vdGVzdHJlYW1zIGluIHRoZSBwY1xuICAgIGNhbGwuc3RyZWFtcy5mb3JFYWNoKGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgc2lnbmFsbGVyLmVtaXQoJ3N0cmVhbTpyZW1vdmVkJywgaWQsIHN0cmVhbSk7XG4gICAgfSk7XG5cbiAgICAvLyBkZWxldGUgdGhlIGNhbGwgZGF0YVxuICAgIGNhbGxzLmRlbGV0ZShpZCk7XG5cbiAgICAvLyB0cmlnZ2VyIHRoZSBjYWxsOmVuZGVkIGV2ZW50XG4gICAgc2lnbmFsbGVyLmVtaXQoJ2NhbGw6ZW5kZWQnLCBpZCwgY2FsbC5wYyk7XG5cbiAgICAvLyBlbnN1cmUgdGhlIHBlZXIgY29ubmVjdGlvbiBpcyBwcm9wZXJseSBjbGVhbmVkIHVwXG4gICAgY2xlYW51cChjYWxsLnBjKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGxTdGFydChpZCwgcGMsIGRhdGEpIHtcbiAgICB2YXIgY2FsbCA9IGNhbGxzLmdldChpZCk7XG4gICAgdmFyIHN0cmVhbXMgPSBbXS5jb25jYXQocGMuZ2V0UmVtb3RlU3RyZWFtcygpKTtcblxuICAgIC8vIGZsYWcgdGhlIGNhbGwgYXMgYWN0aXZlXG4gICAgY2FsbC5hY3RpdmUgPSB0cnVlO1xuICAgIGNhbGwuc3RyZWFtcyA9IFtdLmNvbmNhdChwYy5nZXRSZW1vdGVTdHJlYW1zKCkpO1xuXG4gICAgcGMub25hZGRzdHJlYW0gPSBjcmVhdGVTdHJlYW1BZGRIYW5kbGVyKGlkKTtcbiAgICBwYy5vbnJlbW92ZXN0cmVhbSA9IGNyZWF0ZVN0cmVhbVJlbW92ZUhhbmRsZXIoaWQpO1xuXG4gICAgZGVidWcoc2lnbmFsbGVyLmlkICsgJyAtICcgKyBpZCArICcgY2FsbCBzdGFydDogJyArIHN0cmVhbXMubGVuZ3RoICsgJyBzdHJlYW1zJyk7XG4gICAgc2lnbmFsbGVyLmVtaXQoJ2NhbGw6c3RhcnRlZCcsIGlkLCBwYywgZGF0YSk7XG5cbiAgICAvLyBleGFtaW5lIHRoZSBleGlzdGluZyByZW1vdGUgc3RyZWFtcyBhZnRlciBhIHNob3J0IGRlbGF5XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIC8vIGl0ZXJhdGUgdGhyb3VnaCBhbnkgcmVtb3RlIHN0cmVhbXNcbiAgICAgIHN0cmVhbXMuZm9yRWFjaChyZWNlaXZlUmVtb3RlU3RyZWFtKGlkKSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVTdHJlYW1BZGRIYW5kbGVyKGlkKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgZGVidWcoJ3BlZXIgJyArIGlkICsgJyBhZGRlZCBzdHJlYW0nKTtcbiAgICAgIHVwZGF0ZVJlbW90ZVN0cmVhbXMoaWQpO1xuICAgICAgcmVjZWl2ZVJlbW90ZVN0cmVhbShpZCkoZXZ0LnN0cmVhbSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlU3RyZWFtUmVtb3ZlSGFuZGxlcihpZCkge1xuICAgIHJldHVybiBmdW5jdGlvbihldnQpIHtcbiAgICAgIGRlYnVnKCdwZWVyICcgKyBpZCArICcgcmVtb3ZlZCBzdHJlYW0nKTtcbiAgICAgIHVwZGF0ZVJlbW90ZVN0cmVhbXMoaWQpO1xuICAgICAgc2lnbmFsbGVyLmVtaXQoJ3N0cmVhbTpyZW1vdmVkJywgaWQsIGV2dC5zdHJlYW0pO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBnZXRBY3RpdmVDYWxsKHBlZXJJZCkge1xuICAgIHZhciBjYWxsID0gY2FsbHMuZ2V0KHBlZXJJZCk7XG5cbiAgICBpZiAoISBjYWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGFjdGl2ZSBjYWxsIGZvciBwZWVyOiAnICsgcGVlcklkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdvdFBlZXJDaGFubmVsKGNoYW5uZWwsIHBjLCBkYXRhKSB7XG4gICAgdmFyIGNoYW5uZWxNb25pdG9yO1xuXG4gICAgZnVuY3Rpb24gY2hhbm5lbFJlYWR5KCkge1xuICAgICAgdmFyIGNhbGwgPSBjYWxscy5nZXQoZGF0YS5pZCk7XG4gICAgICB2YXIgYXJncyA9IFsgZGF0YS5pZCwgY2hhbm5lbCwgZGF0YSwgcGMgXTtcblxuICAgICAgLy8gZGVjb3VwbGUgdGhlIGNoYW5uZWwub25vcGVuIGxpc3RlbmVyXG4gICAgICBkZWJ1ZygncmVwb3J0aW5nIGNoYW5uZWwgXCInICsgY2hhbm5lbC5sYWJlbCArICdcIiByZWFkeSwgaGF2ZSBjYWxsOiAnICsgKCEhY2FsbCkpO1xuICAgICAgY2xlYXJJbnRlcnZhbChjaGFubmVsTW9uaXRvcik7XG4gICAgICBjaGFubmVsLm9ub3BlbiA9IG51bGw7XG5cbiAgICAgIC8vIHNhdmUgdGhlIGNoYW5uZWxcbiAgICAgIGlmIChjYWxsKSB7XG4gICAgICAgIGNhbGwuY2hhbm5lbHMuc2V0KGNoYW5uZWwubGFiZWwsIGNoYW5uZWwpO1xuICAgICAgfVxuXG4gICAgICAvLyB0cmlnZ2VyIHRoZSAlY2hhbm5lbC5sYWJlbCU6b3BlbiBldmVudFxuICAgICAgZGVidWcoJ3RyaWdnZXJpbmcgY2hhbm5lbDpvcGVuZWQgZXZlbnRzIGZvciBjaGFubmVsOiAnICsgY2hhbm5lbC5sYWJlbCk7XG5cbiAgICAgIC8vIGVtaXQgdGhlIHBsYWluIGNoYW5uZWw6b3BlbmVkIGV2ZW50XG4gICAgICBzaWduYWxsZXIuZW1pdC5hcHBseShzaWduYWxsZXIsIFsnY2hhbm5lbDpvcGVuZWQnXS5jb25jYXQoYXJncykpO1xuXG4gICAgICAvLyBlbWl0IHRoZSBjaGFubmVsOm9wZW5lZDolbGFiZWwlIGV2ZVxuICAgICAgc2lnbmFsbGVyLmVtaXQuYXBwbHkoXG4gICAgICAgIHNpZ25hbGxlcixcbiAgICAgICAgWydjaGFubmVsOm9wZW5lZDonICsgY2hhbm5lbC5sYWJlbF0uY29uY2F0KGFyZ3MpXG4gICAgICApO1xuICAgIH1cblxuICAgIGRlYnVnKCdjaGFubmVsICcgKyBjaGFubmVsLmxhYmVsICsgJyBkaXNjb3ZlcmVkIGZvciBwZWVyOiAnICsgZGF0YS5pZCk7XG4gICAgaWYgKGNoYW5uZWwucmVhZHlTdGF0ZSA9PT0gJ29wZW4nKSB7XG4gICAgICByZXR1cm4gY2hhbm5lbFJlYWR5KCk7XG4gICAgfVxuXG4gICAgZGVidWcoJ2NoYW5uZWwgbm90IHJlYWR5LCBjdXJyZW50IHN0YXRlID0gJyArIGNoYW5uZWwucmVhZHlTdGF0ZSk7XG4gICAgY2hhbm5lbC5vbm9wZW4gPSBjaGFubmVsUmVhZHk7XG5cbiAgICAvLyBtb25pdG9yIHRoZSBjaGFubmVsIG9wZW4gKGRvbid0IHRydXN0IHRoZSBjaGFubmVsIG9wZW4gZXZlbnQganVzdCB5ZXQpXG4gICAgY2hhbm5lbE1vbml0b3IgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdjaGVja2luZyBjaGFubmVsIHN0YXRlLCBjdXJyZW50IHN0YXRlID0gJyArIGNoYW5uZWwucmVhZHlTdGF0ZSk7XG4gICAgICBpZiAoY2hhbm5lbC5yZWFkeVN0YXRlID09PSAnb3BlbicpIHtcbiAgICAgICAgY2hhbm5lbFJlYWR5KCk7XG4gICAgICB9XG4gICAgfSwgNTAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUxvY2FsQW5ub3VuY2UoZGF0YSkge1xuICAgIC8vIGlmIHdlIHNlbmQgYW4gYW5ub3VuY2Ugd2l0aCBhbiB1cGRhdGVkIHJvb20gdGhlbiB1cGRhdGUgb3VyIGxvY2FsIHJvb20gbmFtZVxuICAgIGlmIChkYXRhICYmIHR5cGVvZiBkYXRhLnJvb20gIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJvb20gPSBkYXRhLnJvb207XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlUGVlckFubm91bmNlKGRhdGEpIHtcbiAgICB2YXIgcGM7XG4gICAgdmFyIG1vbml0b3I7XG5cbiAgICAvLyBpZiB0aGUgcm9vbSBpcyBub3QgYSBtYXRjaCwgYWJvcnRcbiAgICBpZiAoZGF0YS5yb29tICE9PSByb29tKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIGEgcGVlciBjb25uZWN0aW9uXG4gICAgcGMgPSBydGMuY3JlYXRlQ29ubmVjdGlvbihvcHRzLCAob3B0cyB8fCB7fSkuY29uc3RyYWludHMpO1xuICAgIHNpZ25hbGxlci5lbWl0KCdwZWVyOmNvbm5lY3QnLCBkYXRhLmlkLCBwYywgZGF0YSk7XG5cbiAgICAvLyBhZGQgdGhpcyBjb25uZWN0aW9uIHRvIHRoZSBjYWxscyBsaXN0XG4gICAgY2FsbENyZWF0ZShkYXRhLmlkLCBwYywgZGF0YSk7XG5cbiAgICAvLyBhZGQgdGhlIGxvY2FsIHN0cmVhbXNcbiAgICBsb2NhbFN0cmVhbXMuZm9yRWFjaChmdW5jdGlvbihzdHJlYW0sIGlkeCkge1xuICAgICAgcGMuYWRkU3RyZWFtKHN0cmVhbSk7XG4gICAgfSk7XG5cbiAgICAvLyBhZGQgdGhlIGRhdGEgY2hhbm5lbHNcbiAgICAvLyBkbyB0aGlzIGRpZmZlcmVudGx5IGJhc2VkIG9uIHdoZXRoZXIgdGhlIGNvbm5lY3Rpb24gaXMgYVxuICAgIC8vIG1hc3RlciBvciBhIHNsYXZlIGNvbm5lY3Rpb25cbiAgICBpZiAoc2lnbmFsbGVyLmlzTWFzdGVyKGRhdGEuaWQpKSB7XG4gICAgICBkZWJ1ZygnaXMgbWFzdGVyLCBjcmVhdGluZyBkYXRhIGNoYW5uZWxzOiAnLCBPYmplY3Qua2V5cyhjaGFubmVscykpO1xuXG4gICAgICAvLyBjcmVhdGUgdGhlIGNoYW5uZWxzXG4gICAgICBPYmplY3Qua2V5cyhjaGFubmVscykuZm9yRWFjaChmdW5jdGlvbihsYWJlbCkge1xuICAgICAgIGdvdFBlZXJDaGFubmVsKHBjLmNyZWF0ZURhdGFDaGFubmVsKGxhYmVsLCBjaGFubmVsc1tsYWJlbF0pLCBwYywgZGF0YSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwYy5vbmRhdGFjaGFubmVsID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIHZhciBjaGFubmVsID0gZXZ0ICYmIGV2dC5jaGFubmVsO1xuXG4gICAgICAgIC8vIGlmIHdlIGhhdmUgbm8gY2hhbm5lbCwgYWJvcnRcbiAgICAgICAgaWYgKCEgY2hhbm5lbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFubmVsc1tjaGFubmVsLmxhYmVsXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZ290UGVlckNoYW5uZWwoY2hhbm5lbCwgcGMsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIGNvdXBsZSB0aGUgY29ubmVjdGlvbnNcbiAgICBkZWJ1ZygnY291cGxpbmcgJyArIHNpZ25hbGxlci5pZCArICcgdG8gJyArIGRhdGEuaWQpO1xuICAgIG1vbml0b3IgPSBydGMuY291cGxlKHBjLCBkYXRhLmlkLCBzaWduYWxsZXIsIG9wdHMpO1xuICAgIHNpZ25hbGxlci5lbWl0KCdwZWVyOmNvdXBsZScsIGRhdGEuaWQsIHBjLCBkYXRhLCBtb25pdG9yKTtcblxuICAgIC8vIG9uY2UgYWN0aXZlLCB0cmlnZ2VyIHRoZSBwZWVyIGNvbm5lY3QgZXZlbnRcbiAgICBtb25pdG9yLm9uY2UoJ2Nvbm5lY3RlZCcsIGNhbGxTdGFydC5iaW5kKG51bGwsIGRhdGEuaWQsIHBjLCBkYXRhKSlcbiAgICBtb25pdG9yLm9uY2UoJ2Nsb3NlZCcsIGNhbGxFbmQuYmluZChudWxsLCBkYXRhLmlkKSk7XG5cbiAgICAvLyBpZiB3ZSBhcmUgdGhlIG1hc3RlciBjb25ubmVjdGlvbiwgY3JlYXRlIHRoZSBvZmZlclxuICAgIC8vIE5PVEU6IHRoaXMgb25seSByZWFsbHkgZm9yIHRoZSBzYWtlIG9mIHBvbGl0ZW5lc3MsIGFzIHJ0YyBjb3VwbGVcbiAgICAvLyBpbXBsZW1lbnRhdGlvbiBoYW5kbGVzIHRoZSBzbGF2ZSBhdHRlbXB0aW5nIHRvIGNyZWF0ZSBhbiBvZmZlclxuICAgIGlmIChzaWduYWxsZXIuaXNNYXN0ZXIoZGF0YS5pZCkpIHtcbiAgICAgIG1vbml0b3IuY3JlYXRlT2ZmZXIoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVQZWVyVXBkYXRlKGRhdGEpIHtcbiAgICB2YXIgaWQgPSBkYXRhICYmIGRhdGEuaWQ7XG4gICAgdmFyIGFjdGl2ZUNhbGwgPSBpZCAmJiBjYWxscy5nZXQoaWQpO1xuXG4gICAgLy8gaWYgd2UgaGF2ZSByZWNlaXZlZCBhbiB1cGRhdGUgZm9yIGEgcGVlciB0aGF0IGhhcyBubyBhY3RpdmUgY2FsbHMsXG4gICAgLy8gdGhlbiBwYXNzIHRoaXMgb250byB0aGUgYW5ub3VuY2UgaGFuZGxlclxuICAgIGlmIChpZCAmJiAoISBhY3RpdmVDYWxsKSkge1xuICAgICAgZGVidWcoJ3JlY2VpdmVkIHBlZXIgdXBkYXRlIGZyb20gcGVlciAnICsgaWQgKyAnLCBubyBhY3RpdmUgY2FsbHMnKTtcbiAgICAgIHJldHVybiBoYW5kbGVQZWVyQW5ub3VuY2UoZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVjZWl2ZVJlbW90ZVN0cmVhbShpZCkge1xuICAgIHZhciBjYWxsID0gY2FsbHMuZ2V0KGlkKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIHNpZ25hbGxlci5lbWl0KCdzdHJlYW06YWRkZWQnLCBpZCwgc3RyZWFtLCBjYWxsICYmIGNhbGwuZGF0YSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVJlbW90ZVN0cmVhbXMoaWQpIHtcbiAgICB2YXIgY2FsbCA9IGNhbGxzLmdldChpZCk7XG5cbiAgICBpZiAoY2FsbCAmJiBjYWxsLnBjKSB7XG4gICAgICBjYWxsLnN0cmVhbXMgPSBbXS5jb25jYXQoY2FsbC5wYy5nZXRSZW1vdGVTdHJlYW1zKCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSByb29tIGlzIG5vdCBkZWZpbmVkLCB0aGVuIGdlbmVyYXRlIHRoZSByb29tIG5hbWVcbiAgaWYgKCEgcm9vbSkge1xuICAgIC8vIGlmIHRoZSBoYXNoIGlzIG5vdCBhc3NpZ25lZCwgdGhlbiBjcmVhdGUgYSByYW5kb20gaGFzaCB2YWx1ZVxuICAgIGlmICghIGhhc2gpIHtcbiAgICAgIGhhc2ggPSBsb2NhdGlvbi5oYXNoID0gJycgKyAoTWF0aC5wb3coMiwgNTMpICogTWF0aC5yYW5kb20oKSk7XG4gICAgfVxuXG4gICAgcm9vbSA9IG5zICsgJyMnICsgaGFzaDtcbiAgfVxuXG4gIGlmIChkZWJ1Z2dpbmcpIHtcbiAgICBydGMubG9nZ2VyLmVuYWJsZS5hcHBseShydGMubG9nZ2VyLCBBcnJheS5pc0FycmF5KGRlYnVnKSA/IGRlYnVnZ2luZyA6IFsnKiddKTtcbiAgfVxuXG4gIHNpZ25hbGxlci5vbigncGVlcjphbm5vdW5jZScsIGhhbmRsZVBlZXJBbm5vdW5jZSk7XG4gIHNpZ25hbGxlci5vbigncGVlcjp1cGRhdGUnLCBoYW5kbGVQZWVyVXBkYXRlKTtcbiAgc2lnbmFsbGVyLm9uKCdwZWVyOmxlYXZlJywgY2FsbEVuZCk7XG5cbiAgLy8gYW5ub3VuY2Ugb3Vyc2VsdmVzIHRvIG91ciBuZXcgZnJpZW5kXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRhdGEgPSBleHRlbmQoe30sIHByb2ZpbGUsIHsgcm9vbTogcm9vbSB9KTtcblxuICAgIC8vIGFubm91bmNlIGFuZCBlbWl0IHRoZSBsb2NhbCBhbm5vdW5jZSBldmVudFxuICAgIHNpZ25hbGxlci5hbm5vdW5jZShkYXRhKTtcbiAgICBhbm5vdW5jZWQgPSB0cnVlO1xuICB9LCAwKTtcblxuICAvKipcbiAgICAjIyMgUXVpY2tjb25uZWN0IEJyb2FkY2FzdCBhbmQgRGF0YSBDaGFubmVsIEhlbHBlciBGdW5jdGlvbnNcblxuICAgIFRoZSBmb2xsb3dpbmcgYXJlIGZ1bmN0aW9ucyB0aGF0IGFyZSBwYXRjaGVkIGludG8gdGhlIGBydGMtc2lnbmFsbGVyYFxuICAgIGluc3RhbmNlIHRoYXQgbWFrZSB3b3JraW5nIHdpdGggYW5kIGNyZWF0aW5nIGZ1bmN0aW9uYWwgV2ViUlRDIGFwcGxpY2F0aW9uc1xuICAgIGEgbG90IHNpbXBsZXIuXG5cbiAgKiovXG5cbiAgLyoqXG4gICAgIyMjIyBhZGRTdHJlYW1cblxuICAgIGBgYFxuICAgIGFkZFN0cmVhbShzdHJlYW06TWVkaWFTdHJlYW0pID0+IHFjXG4gICAgYGBgXG5cbiAgICBBZGQgdGhlIHN0cmVhbSB0byBhY3RpdmUgY2FsbHMgYW5kIGFsc28gc2F2ZSB0aGUgc3RyZWFtIHNvIHRoYXQgaXRcbiAgICBjYW4gYmUgYWRkZWQgdG8gZnV0dXJlIGNhbGxzLlxuXG4gICoqL1xuICBzaWduYWxsZXIuYnJvYWRjYXN0ID0gc2lnbmFsbGVyLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIGxvY2FsU3RyZWFtcy5wdXNoKHN0cmVhbSk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIGFueSBhY3RpdmUgY2FsbHMsIHRoZW4gYWRkIHRoZSBzdHJlYW1cbiAgICBjYWxscy52YWx1ZXMoKS5mb3JFYWNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRhdGEucGMuYWRkU3RyZWFtKHN0cmVhbSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2lnbmFsbGVyO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyMgZW5kQ2FsbHMoKVxuXG4gICAgVGhlIGBlbmRDYWxsc2AgZnVuY3Rpb24gdGVybWluYXRlcyBhbGwgdGhlIGFjdGl2ZSBjYWxscyB0aGF0IGhhdmUgYmVlblxuICAgIGNyZWF0ZWQgaW4gdGhpcyBxdWlja2Nvbm5lY3QgaW5zdGFuY2UuICBDYWxsaW5nIGBlbmRDYWxsc2AgZG9lcyBub3RcbiAgICBraWxsIHRoZSBjb25uZWN0aW9uIHdpdGggdGhlIHNpZ25hbGxpbmcgc2VydmVyLlxuXG4gICoqL1xuICBzaWduYWxsZXIuZW5kQ2FsbHMgPSBmdW5jdGlvbigpIHtcbiAgICBjYWxscy5rZXlzKCkuZm9yRWFjaChjYWxsRW5kKTtcbiAgfTtcblxuICAvKipcbiAgICAjIyMjIGNsb3NlKClcblxuICAgIFRoZSBgY2xvc2VgIGZ1bmN0aW9uIHByb3ZpZGVzIGEgY29udmVuaWVudCB3YXkgb2YgY2xvc2luZyBhbGwgYXNzb2NpYXRlZFxuICAgIHBlZXIgY29ubmVjdGlvbnMuICBUaGlzIGZ1bmN0aW9uIHNpbXBseSB1c2VzIHRoZSBgZW5kQ2FsbHNgIGZ1bmN0aW9uIGFuZFxuICAgIHRoZSB1bmRlcmx5aW5nIGBsZWF2ZWAgZnVuY3Rpb24gb2YgdGhlIHNpZ25hbGxlciB0byBkbyBhIFwiZnVsbCBjbGVhbnVwXCJcbiAgICBvZiBhbGwgY29ubmVjdGlvbnMuXG4gICoqL1xuICBzaWduYWxsZXIuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICBzaWduYWxsZXIuZW5kQ2FsbHMoKTtcbiAgICBzaWduYWxsZXIubGVhdmUoKTtcbiAgfTtcblxuICAvKipcbiAgICAjIyMjIGNyZWF0ZURhdGFDaGFubmVsKGxhYmVsLCBjb25maWcpXG5cbiAgICBSZXF1ZXN0IHRoYXQgYSBkYXRhIGNoYW5uZWwgd2l0aCB0aGUgc3BlY2lmaWVkIGBsYWJlbGAgaXMgY3JlYXRlZCBvblxuICAgIHRoZSBwZWVyIGNvbm5lY3Rpb24uICBXaGVuIHRoZSBkYXRhIGNoYW5uZWwgaXMgb3BlbiBhbmQgYXZhaWxhYmxlLCBhblxuICAgIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHVzaW5nIHRoZSBsYWJlbCBvZiB0aGUgZGF0YSBjaGFubmVsLlxuXG4gICAgRm9yIGV4YW1wbGUsIGlmIGEgbmV3IGRhdGEgY2hhbm5lbCB3YXMgcmVxdWVzdGVkIHVzaW5nIHRoZSBmb2xsb3dpbmdcbiAgICBjYWxsOlxuXG4gICAgYGBganNcbiAgICB2YXIgcWMgPSBxdWlja2Nvbm5lY3QoJ2h0dHA6Ly9ydGMuaW8vc3dpdGNoYm9hcmQnKS5jcmVhdGVEYXRhQ2hhbm5lbCgndGVzdCcpO1xuICAgIGBgYFxuXG4gICAgVGhlbiB3aGVuIHRoZSBkYXRhIGNoYW5uZWwgaXMgcmVhZHkgZm9yIHVzZSwgYSBgdGVzdDpvcGVuYCBldmVudCB3b3VsZFxuICAgIGJlIGVtaXR0ZWQgYnkgYHFjYC5cblxuICAqKi9cbiAgc2lnbmFsbGVyLmNyZWF0ZURhdGFDaGFubmVsID0gZnVuY3Rpb24obGFiZWwsIG9wdHMpIHtcbiAgICAvLyBjcmVhdGUgYSBjaGFubmVsIG9uIGFsbCBleGlzdGluZyBjYWxsc1xuICAgIGNhbGxzLmtleXMoKS5mb3JFYWNoKGZ1bmN0aW9uKHBlZXJJZCkge1xuICAgICAgdmFyIGNhbGwgPSBjYWxscy5nZXQocGVlcklkKTtcbiAgICAgIHZhciBkYztcblxuICAgICAgLy8gaWYgd2UgYXJlIHRoZSBtYXN0ZXIgY29ubmVjdGlvbiwgY3JlYXRlIHRoZSBkYXRhIGNoYW5uZWxcbiAgICAgIGlmIChjYWxsICYmIGNhbGwucGMgJiYgc2lnbmFsbGVyLmlzTWFzdGVyKHBlZXJJZCkpIHtcbiAgICAgICAgZGMgPSBjYWxsLnBjLmNyZWF0ZURhdGFDaGFubmVsKGxhYmVsLCBvcHRzKTtcbiAgICAgICAgZ290UGVlckNoYW5uZWwoZGMsIGNhbGwucGMsIGNhbGwuZGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBzYXZlIHRoZSBkYXRhIGNoYW5uZWwgb3B0cyBpbiB0aGUgbG9jYWwgY2hhbm5lbHMgZGljdGlvbmFyeVxuICAgIGNoYW5uZWxzW2xhYmVsXSA9IG9wdHMgfHwgbnVsbDtcblxuICAgIHJldHVybiBzaWduYWxsZXI7XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIyByZWFjdGl2ZSgpXG5cbiAgICBGbGFnIHRoYXQgdGhpcyBzZXNzaW9uIHdpbGwgYmUgYSByZWFjdGl2ZSBjb25uZWN0aW9uLlxuXG4gICoqL1xuICBzaWduYWxsZXIucmVhY3RpdmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBhZGQgdGhlIHJlYWN0aXZlIGZsYWdcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICBvcHRzLnJlYWN0aXZlID0gdHJ1ZTtcblxuICAgIC8vIGNoYWluXG4gICAgcmV0dXJuIHNpZ25hbGxlcjtcbiAgfTtcblxuICAvKipcbiAgICAjIyMjIHJlbW92ZVN0cmVhbVxuXG4gICAgYGBgXG4gICAgcmVtb3ZlU3RyZWFtKHN0cmVhbTpNZWRpYVN0cmVhbSlcbiAgICBgYGBcblxuICAgIFJlbW92ZSB0aGUgc3BlY2lmaWVkIHN0cmVhbSBmcm9tIGJvdGggdGhlIGxvY2FsIHN0cmVhbXMgdGhhdCBhcmUgdG9cbiAgICBiZSBjb25uZWN0ZWQgdG8gbmV3IHBlZXJzLCBhbmQgYWxzbyBmcm9tIGFueSBhY3RpdmUgY2FsbHMuXG5cbiAgKiovXG4gIHNpZ25hbGxlci5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICB2YXIgbG9jYWxJbmRleCA9IGxvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSk7XG5cbiAgICAvLyByZW1vdmUgdGhlIHN0cmVhbSBmcm9tIGFueSBhY3RpdmUgY2FsbHNcbiAgICBjYWxscy52YWx1ZXMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNhbGwpIHtcbiAgICAgIGNhbGwucGMucmVtb3ZlU3RyZWFtKHN0cmVhbSk7XG4gICAgfSk7XG5cbiAgICAvLyByZW1vdmUgdGhlIHN0cmVhbSBmcm9tIHRoZSBsb2NhbFN0cmVhbXMgYXJyYXlcbiAgICBpZiAobG9jYWxJbmRleCA+PSAwKSB7XG4gICAgICBsb2NhbFN0cmVhbXMuc3BsaWNlKGxvY2FsSW5kZXgsIDEpO1xuICAgIH1cblxuICAgIHJldHVybiBzaWduYWxsZXI7XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIyByZXF1ZXN0Q2hhbm5lbFxuXG4gICAgYGBgXG4gICAgcmVxdWVzdENoYW5uZWwodGFyZ2V0SWQsIGxhYmVsLCBjYWxsYmFjaylcbiAgICBgYGBcblxuICAgIFRoaXMgaXMgYSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlc3BvbmQgdG8gcmVtb3RlIHBlZXJzIHN1cHBseWluZ1xuICAgIGEgZGF0YSBjaGFubmVsIGFzIHBhcnQgb2YgdGhlaXIgY29uZmlndXJhdGlvbi4gIEFzIHBlciB0aGUgYHJlY2VpdmVTdHJlYW1gXG4gICAgZnVuY3Rpb24gdGhpcyBmdW5jdGlvbiB3aWxsIGVpdGhlciBmaXJlIHRoZSBjYWxsYmFjayBpbW1lZGlhdGVseSBpZiB0aGVcbiAgICBjaGFubmVsIGlzIGFscmVhZHkgYXZhaWxhYmxlLCBvciBvbmNlIHRoZSBjaGFubmVsIGhhcyBiZWVuIGRpc2NvdmVyZWQgb25cbiAgICB0aGUgY2FsbC5cblxuICAqKi9cbiAgc2lnbmFsbGVyLnJlcXVlc3RDaGFubmVsID0gZnVuY3Rpb24odGFyZ2V0SWQsIGxhYmVsLCBjYWxsYmFjaykge1xuICAgIHZhciBjYWxsID0gZ2V0QWN0aXZlQ2FsbCh0YXJnZXRJZCk7XG4gICAgdmFyIGNoYW5uZWwgPSBjYWxsICYmIGNhbGwuY2hhbm5lbHMuZ2V0KGxhYmVsKTtcblxuICAgIC8vIGlmIHdlIGhhdmUgdGhlbiBjaGFubmVsIHRyaWdnZXIgdGhlIGNhbGxiYWNrIGltbWVkaWF0ZWx5XG4gICAgaWYgKGNoYW5uZWwpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGNoYW5uZWwpO1xuICAgICAgcmV0dXJuIHNpZ25hbGxlcjtcbiAgICB9XG5cbiAgICAvLyBpZiBub3QsIHdhaXQgZm9yIGl0XG4gICAgc2lnbmFsbGVyLm9uY2UoJ2NoYW5uZWw6b3BlbmVkOicgKyBsYWJlbCwgZnVuY3Rpb24oaWQsIGRjKSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBkYyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2lnbmFsbGVyO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyMgcmVxdWVzdFN0cmVhbVxuXG4gICAgYGBgXG4gICAgcmVxdWVzdFN0cmVhbSh0YXJnZXRJZCwgaWR4LCBjYWxsYmFjaylcbiAgICBgYGBcblxuICAgIFVzZWQgdG8gcmVxdWVzdCBhIHJlbW90ZSBzdHJlYW0gZnJvbSBhIHF1aWNrY29ubmVjdCBpbnN0YW5jZS4gSWYgdGhlXG4gICAgc3RyZWFtIGlzIGFscmVhZHkgYXZhaWxhYmxlIGluIHRoZSBjYWxscyByZW1vdGUgc3RyZWFtcywgdGhlbiB0aGUgY2FsbGJhY2tcbiAgICB3aWxsIGJlIHRyaWdnZXJlZCBpbW1lZGlhdGVseSwgb3RoZXJ3aXNlIHRoaXMgZnVuY3Rpb24gd2lsbCBtb25pdG9yXG4gICAgYHN0cmVhbTphZGRlZGAgZXZlbnRzIGFuZCB3YWl0IGZvciBhIG1hdGNoLlxuXG4gICAgSW4gdGhlIGNhc2UgdGhhdCBhbiB1bmtub3duIHRhcmdldCBpcyByZXF1ZXN0ZWQsIHRoZW4gYW4gZXhjZXB0aW9uIHdpbGxcbiAgICBiZSB0aHJvd24uXG4gICoqL1xuICBzaWduYWxsZXIucmVxdWVzdFN0cmVhbSA9IGZ1bmN0aW9uKHRhcmdldElkLCBpZHgsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGNhbGwgPSBnZXRBY3RpdmVDYWxsKHRhcmdldElkKTtcbiAgICB2YXIgc3RyZWFtO1xuXG4gICAgZnVuY3Rpb24gd2FpdEZvclN0cmVhbShwZWVySWQpIHtcbiAgICAgIGlmIChwZWVySWQgIT09IHRhcmdldElkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gZ2V0IHRoZSBzdHJlYW1cbiAgICAgIHN0cmVhbSA9IGNhbGwucGMuZ2V0UmVtb3RlU3RyZWFtcygpW2lkeF07XG5cbiAgICAgIC8vIGlmIHdlIGhhdmUgdGhlIHN0cmVhbSwgdGhlbiByZW1vdmUgdGhlIGxpc3RlbmVyIGFuZCB0cmlnZ2VyIHRoZSBjYlxuICAgICAgaWYgKHN0cmVhbSkge1xuICAgICAgICBzaWduYWxsZXIucmVtb3ZlTGlzdGVuZXIoJ3N0cmVhbTphZGRlZCcsIHdhaXRGb3JTdHJlYW0pO1xuICAgICAgICBjYWxsYmFjayhudWxsLCBzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGxvb2sgZm9yIHRoZSBzdHJlYW0gaW4gdGhlIHJlbW90ZSBzdHJlYW1zIG9mIHRoZSBjYWxsXG4gICAgc3RyZWFtID0gY2FsbC5wYy5nZXRSZW1vdGVTdHJlYW1zKClbaWR4XTtcblxuICAgIC8vIGlmIHdlIGZvdW5kIHRoZSBzdHJlYW0gdGhlbiB0cmlnZ2VyIHRoZSBjYWxsYmFja1xuICAgIGlmIChzdHJlYW0pIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIHN0cmVhbSk7XG4gICAgICByZXR1cm4gc2lnbmFsbGVyO1xuICAgIH1cblxuICAgIC8vIG90aGVyd2lzZSB3YWl0IGZvciB0aGUgc3RyZWFtXG4gICAgc2lnbmFsbGVyLm9uKCdzdHJlYW06YWRkZWQnLCB3YWl0Rm9yU3RyZWFtKTtcbiAgICByZXR1cm4gc2lnbmFsbGVyO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyMgcHJvZmlsZShkYXRhKVxuXG4gICAgVXBkYXRlIHRoZSBwcm9maWxlIGRhdGEgd2l0aCB0aGUgYXR0YWNoZWQgaW5mb3JtYXRpb24sIHNvIHdoZW5cbiAgICB0aGUgc2lnbmFsbGVyIGFubm91bmNlcyBpdCBpbmNsdWRlcyB0aGlzIGRhdGEgaW4gYWRkaXRpb24gdG8gYW55XG4gICAgcm9vbSBhbmQgaWQgaW5mb3JtYXRpb24uXG5cbiAgKiovXG4gIHNpZ25hbGxlci5wcm9maWxlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGV4dGVuZChwcm9maWxlLCBkYXRhKTtcblxuICAgIC8vIGlmIHdlIGhhdmUgYWxyZWFkeSBhbm5vdW5jZWQsIHRoZW4gcmVhbm5vdW5jZSBvdXIgcHJvZmlsZSB0byBwcm92aWRlXG4gICAgLy8gb3RoZXJzIGEgYHBlZXI6dXBkYXRlYCBldmVudFxuICAgIGlmIChhbm5vdW5jZWQpIHtcbiAgICAgIHNpZ25hbGxlci5hbm5vdW5jZShwcm9maWxlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2lnbmFsbGVyO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyMgd2FpdEZvckNhbGxcblxuICAgIGBgYFxuICAgIHdhaXRGb3JDYWxsKHRhcmdldElkLCBjYWxsYmFjaylcbiAgICBgYGBcblxuICAgIFdhaXQgZm9yIGEgY2FsbCBmcm9tIHRoZSBzcGVjaWZpZWQgdGFyZ2V0SWQuICBJZiB0aGUgY2FsbCBpcyBhbHJlYWR5XG4gICAgYWN0aXZlIHRoZSBjYWxsYmFjayB3aWxsIGJlIGZpcmVkIGltbWVkaWF0ZWx5LCBvdGhlcndpc2Ugd2Ugd2lsbCB3YWl0XG4gICAgZm9yIGEgYGNhbGw6c3RhcnRlZGAgZXZlbnQgdGhhdCBtYXRjaGVzIHRoZSByZXF1ZXN0ZWQgYHRhcmdldElkYFxuXG4gICoqL1xuICBzaWduYWxsZXIud2FpdEZvckNhbGwgPSBmdW5jdGlvbih0YXJnZXRJZCwgY2FsbGJhY2spIHtcbiAgICB2YXIgY2FsbCA9IGNhbGxzLmdldCh0YXJnZXRJZCk7XG5cbiAgICBpZiAoY2FsbCAmJiBjYWxsLmFjdGl2ZSkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgY2FsbC5wYyk7XG4gICAgICByZXR1cm4gc2lnbmFsbGVyO1xuICAgIH1cblxuICAgIHNpZ25hbGxlci5vbignY2FsbDpzdGFydGVkJywgZnVuY3Rpb24gaGFuZGxlTmV3Q2FsbChpZCkge1xuICAgICAgaWYgKGlkID09PSB0YXJnZXRJZCkge1xuICAgICAgICBzaWduYWxsZXIucmVtb3ZlTGlzdGVuZXIoJ2NhbGw6c3RhcnRlZCcsIGhhbmRsZU5ld0NhbGwpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCBjYWxscy5nZXQoaWQpLnBjKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvLyByZXNwb25kIHRvIGxvY2FsIGFubm91bmNlIG1lc3NhZ2VzXG4gIHNpZ25hbGxlci5vbignbG9jYWw6YW5ub3VuY2UnLCBoYW5kbGVMb2NhbEFubm91bmNlKTtcblxuICAvLyBwYXNzIHRoZSBzaWduYWxsZXIgb25cbiAgcmV0dXJuIHNpZ25hbGxlcjtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpKSIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2NvZy9sb2dnZXInKSgncnRjL2NsZWFudXAnKTtcblxudmFyIENBTk5PVF9DTE9TRV9TVEFURVMgPSBbXG4gICdjbG9zZWQnXG5dO1xuXG52YXIgRVZFTlRTX0RFQ09VUExFX0JDID0gW1xuICAnYWRkc3RyZWFtJyxcbiAgJ2RhdGFjaGFubmVsJyxcbiAgJ2ljZWNhbmRpZGF0ZScsXG4gICduZWdvdGlhdGlvbm5lZWRlZCcsXG4gICdyZW1vdmVzdHJlYW0nLFxuICAnc2lnbmFsaW5nc3RhdGVjaGFuZ2UnXG5dO1xuXG52YXIgRVZFTlRTX0RFQ09VUExFX0FDID0gW1xuICAnaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlJ1xuXTtcblxuLyoqXG4gICMjIyBydGMtdG9vbHMvY2xlYW51cFxuXG4gIGBgYFxuICBjbGVhbnVwKHBjKVxuICBgYGBcblxuICBUaGUgYGNsZWFudXBgIGZ1bmN0aW9uIGlzIHVzZWQgdG8gZW5zdXJlIHRoYXQgYSBwZWVyIGNvbm5lY3Rpb24gaXMgcHJvcGVybHlcbiAgY2xvc2VkIGFuZCByZWFkeSB0byBiZSBjbGVhbmVkIHVwIGJ5IHRoZSBicm93c2VyLlxuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocGMpIHtcbiAgLy8gc2VlIGlmIHdlIGNhbiBjbG9zZSB0aGUgY29ubmVjdGlvblxuICB2YXIgY3VycmVudFN0YXRlID0gcGMuaWNlQ29ubmVjdGlvblN0YXRlO1xuICB2YXIgY2FuQ2xvc2UgPSBDQU5OT1RfQ0xPU0VfU1RBVEVTLmluZGV4T2YoY3VycmVudFN0YXRlKSA8IDA7XG5cbiAgZnVuY3Rpb24gZGVjb3VwbGUoZXZlbnRzKSB7XG4gICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZ0TmFtZSkge1xuICAgICAgaWYgKHBjWydvbicgKyBldnROYW1lXSkge1xuICAgICAgICBwY1snb24nICsgZXZ0TmFtZV0gPSBudWxsO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gZGVjb3VwbGUgXCJiZWZvcmUgY2xvc2VcIiBldmVudHNcbiAgZGVjb3VwbGUoRVZFTlRTX0RFQ09VUExFX0JDKTtcblxuICBpZiAoY2FuQ2xvc2UpIHtcbiAgICBkZWJ1ZygnYXR0ZW1wdGluZyBjb25uZWN0aW9uIGNsb3NlLCBjdXJyZW50IHN0YXRlOiAnKyBwYy5pY2VDb25uZWN0aW9uU3RhdGUpO1xuICAgIHBjLmNsb3NlKCk7XG4gIH1cblxuICAvLyByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyc1xuICAvLyBhZnRlciBhIHNob3J0IGRlbGF5IGdpdmluZyB0aGUgY29ubmVjdGlvbiB0aW1lIHRvIHRyaWdnZXJcbiAgLy8gY2xvc2UgYW5kIGljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSBldmVudHNcbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBkZWNvdXBsZShFVkVOVFNfREVDT1VQTEVfQUMpO1xuICB9LCAxMDApO1xufTtcbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jJyk7XG52YXIgY2xlYW51cCA9IHJlcXVpcmUoJy4vY2xlYW51cCcpO1xudmFyIG1vbml0b3IgPSByZXF1aXJlKCcuL21vbml0b3InKTtcbnZhciBkZXRlY3QgPSByZXF1aXJlKCcuL2RldGVjdCcpO1xudmFyIGZpbmRQbHVnaW4gPSByZXF1aXJlKCdydGMtY29yZS9wbHVnaW4nKTtcbnZhciBDTE9TRURfU1RBVEVTID0gWyAnY2xvc2VkJywgJ2ZhaWxlZCcgXTtcblxuLy8gdHJhY2sgdGhlIHZhcmlvdXMgc3VwcG9ydGVkIENyZWF0ZU9mZmVyIC8gQ3JlYXRlQW5zd2VyIGNvbnRyYWludHNcbi8vIHRoYXQgd2UgcmVjb2duaXplIGFuZCBhbGxvd1xudmFyIE9GRkVSX0FOU1dFUl9DT05TVFJBSU5UUyA9IFtcbiAgJ29mZmVyVG9SZWNlaXZlVmlkZW8nLFxuICAnb2ZmZXJUb1JlY2VpdmVBdWRpbycsXG4gICd2b2ljZUFjdGl2aXR5RGV0ZWN0aW9uJyxcbiAgJ2ljZVJlc3RhcnQnXG5dO1xuXG4vKipcbiAgIyMjIHJ0Yy10b29scy9jb3VwbGVcblxuICAjIyMjIGNvdXBsZShwYywgdGFyZ2V0SWQsIHNpZ25hbGxlciwgb3B0cz8pXG5cbiAgQ291cGxlIGEgV2ViUlRDIGNvbm5lY3Rpb24gd2l0aCBhbm90aGVyIHdlYnJ0YyBjb25uZWN0aW9uIGlkZW50aWZpZWQgYnlcbiAgYHRhcmdldElkYCB2aWEgdGhlIHNpZ25hbGxlci5cblxuICBUaGUgZm9sbG93aW5nIG9wdGlvbnMgY2FuIGJlIHByb3ZpZGVkIGluIHRoZSBgb3B0c2AgYXJndW1lbnQ6XG5cbiAgLSBgc2RwZmlsdGVyYCAoZGVmYXVsdDogbnVsbClcblxuICAgIEEgc2ltcGxlIGZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgU0RQIGFzIHBhcnQgb2YgdGhlIHBlZXJcbiAgICBjb25uZWN0aW9uIGhhbmRzaGFrZSAoc2VlIHRoZSBVc2luZyBGaWx0ZXJzIGRldGFpbHMgYmVsb3cpLlxuXG4gICMjIyMjIEV4YW1wbGUgVXNhZ2VcblxuICBgYGBqc1xuICB2YXIgY291cGxlID0gcmVxdWlyZSgncnRjL2NvdXBsZScpO1xuXG4gIGNvdXBsZShwYywgJzU0ODc5OTY1LWNlNDMtNDI2ZS1hOGVmLTA5YWMxZTM5YTE2ZCcsIHNpZ25hbGxlcik7XG4gIGBgYFxuXG4gICMjIyMjIFVzaW5nIEZpbHRlcnNcblxuICBJbiBjZXJ0YWluIGluc3RhbmNlcyB5b3UgbWF5IHdpc2ggdG8gbW9kaWZ5IHRoZSByYXcgU0RQIHRoYXQgaXMgcHJvdmlkZWRcbiAgYnkgdGhlIGBjcmVhdGVPZmZlcmAgYW5kIGBjcmVhdGVBbnN3ZXJgIGNhbGxzLiAgVGhpcyBjYW4gYmUgZG9uZSBieSBwYXNzaW5nXG4gIGEgYHNkcGZpbHRlcmAgZnVuY3Rpb24gKG9yIGFycmF5KSBpbiB0aGUgb3B0aW9ucy4gIEZvciBleGFtcGxlOlxuXG4gIGBgYGpzXG4gIC8vIHJ1biB0aGUgc2RwIGZyb20gdGhyb3VnaCBhIGxvY2FsIHR3ZWFrU2RwIGZ1bmN0aW9uLlxuICBjb3VwbGUocGMsICc1NDg3OTk2NS1jZTQzLTQyNmUtYThlZi0wOWFjMWUzOWExNmQnLCBzaWduYWxsZXIsIHtcbiAgICBzZHBmaWx0ZXI6IHR3ZWFrU2RwXG4gIH0pO1xuICBgYGBcblxuKiovXG5mdW5jdGlvbiBjb3VwbGUocGMsIHRhcmdldElkLCBzaWduYWxsZXIsIG9wdHMpIHtcbiAgdmFyIGRlYnVnTGFiZWwgPSAob3B0cyB8fCB7fSkuZGVidWdMYWJlbCB8fCAncnRjJztcbiAgdmFyIGRlYnVnID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpKGRlYnVnTGFiZWwgKyAnL2NvdXBsZScpO1xuXG4gIC8vIGNyZWF0ZSBhIG1vbml0b3IgZm9yIHRoZSBjb25uZWN0aW9uXG4gIHZhciBtb24gPSBtb25pdG9yKHBjLCB0YXJnZXRJZCwgc2lnbmFsbGVyLCBvcHRzKTtcbiAgdmFyIHF1ZXVlZENhbmRpZGF0ZXMgPSBbXTtcbiAgdmFyIHNkcEZpbHRlciA9IChvcHRzIHx8IHt9KS5zZHBmaWx0ZXI7XG4gIHZhciByZWFjdGl2ZSA9IChvcHRzIHx8IHt9KS5yZWFjdGl2ZTtcbiAgdmFyIG9mZmVyVGltZW91dDtcbiAgdmFyIGVuZE9mQ2FuZGlkYXRlcyA9IHRydWU7XG4gIHZhciBwbHVnaW4gPSBmaW5kUGx1Z2luKChvcHRzIHx8IHt9KS5wbHVnaW5zKTtcblxuICAvLyBjb25maWd1cmUgdGhlIHRpbWUgdG8gd2FpdCBiZXR3ZWVuIHJlY2VpdmluZyBhICdkaXNjb25uZWN0J1xuICAvLyBpY2VDb25uZWN0aW9uU3RhdGUgYW5kIGRldGVybWluaW5nIHRoYXQgd2UgYXJlIGNsb3NlZFxuICB2YXIgZGlzY29ubmVjdFRpbWVvdXQgPSAob3B0cyB8fCB7fSkuZGlzY29ubmVjdFRpbWVvdXQgfHwgMTAwMDA7XG4gIHZhciBkaXNjb25uZWN0VGltZXI7XG5cbiAgLy8gaWYgdGhlIHNpZ25hbGxlciBkb2VzIG5vdCBzdXBwb3J0IHRoaXMgaXNNYXN0ZXIgZnVuY3Rpb24gdGhyb3cgYW5cbiAgLy8gZXhjZXB0aW9uXG4gIGlmICh0eXBlb2Ygc2lnbmFsbGVyLmlzTWFzdGVyICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3J0Yy1zaWduYWxsZXIgaW5zdGFuY2UgPj0gMC4xNC4wIHJlcXVpcmVkJyk7XG4gIH1cblxuICAvLyBpbml0aWxhaXNlIHRoZSBuZWdvdGlhdGlvbiBoZWxwZXJzXG4gIHZhciBpc01hc3RlciA9IHNpZ25hbGxlci5pc01hc3Rlcih0YXJnZXRJZCk7XG5cbiAgdmFyIGNyZWF0ZU9mZmVyID0gcHJlcE5lZ290aWF0ZShcbiAgICAnY3JlYXRlT2ZmZXInLFxuICAgIGlzTWFzdGVyLFxuICAgIFsgY2hlY2tTdGFibGUgXVxuICApO1xuXG4gIHZhciBjcmVhdGVBbnN3ZXIgPSBwcmVwTmVnb3RpYXRlKFxuICAgICdjcmVhdGVBbnN3ZXInLFxuICAgIHRydWUsXG4gICAgW11cbiAgKTtcblxuICAvLyBpbml0aWFsaXNlIHRoZSBwcm9jZXNzaW5nIHF1ZXVlIChvbmUgYXQgYSB0aW1lIHBsZWFzZSlcbiAgdmFyIHEgPSBhc3luYy5xdWV1ZShmdW5jdGlvbih0YXNrLCBjYikge1xuICAgIC8vIGlmIHRoZSB0YXNrIGhhcyBubyBvcGVyYXRpb24sIHRoZW4gdHJpZ2dlciB0aGUgY2FsbGJhY2sgaW1tZWRpYXRlbHlcbiAgICBpZiAodHlwZW9mIHRhc2sub3AgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGNiKCk7XG4gICAgfVxuXG4gICAgLy8gcHJvY2VzcyB0aGUgdGFzayBvcGVyYXRpb25cbiAgICB0YXNrLm9wKHRhc2ssIGNiKTtcbiAgfSwgMSk7XG5cbiAgLy8gaW5pdGlhbGlzZSBzZXNzaW9uIGRlc2NyaXB0aW9uIGFuZCBpY2VjYW5kaWRhdGUgb2JqZWN0c1xuICB2YXIgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gKG9wdHMgfHwge30pLlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fFxuICAgIGRldGVjdCgnUlRDU2Vzc2lvbkRlc2NyaXB0aW9uJyk7XG5cbiAgdmFyIFJUQ0ljZUNhbmRpZGF0ZSA9IChvcHRzIHx8IHt9KS5SVENJY2VDYW5kaWRhdGUgfHxcbiAgICBkZXRlY3QoJ1JUQ0ljZUNhbmRpZGF0ZScpO1xuXG4gIGZ1bmN0aW9uIGFib3J0KHN0YWdlLCBzZHAsIGNiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVycikge1xuICAgICAgLy8gbG9nIHRoZSBlcnJvclxuICAgICAgY29uc29sZS5lcnJvcigncnRjL2NvdXBsZSBlcnJvciAoJyArIHN0YWdlICsgJyk6ICcsIGVycik7XG5cbiAgICAgIGlmICh0eXBlb2YgY2IgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYihlcnIpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseUNhbmRpZGF0ZXNXaGVuU3RhYmxlKCkge1xuICAgIGlmIChwYy5zaWduYWxpbmdTdGF0ZSA9PSAnc3RhYmxlJyAmJiBwYy5yZW1vdGVEZXNjcmlwdGlvbikge1xuICAgICAgZGVidWcoJ3NpZ25hbGluZyBzdGF0ZSA9IHN0YWJsZSwgYXBwbHlpbmcgcXVldWVkIGNhbmRpZGF0ZXMnKTtcbiAgICAgIG1vbi5yZW1vdmVMaXN0ZW5lcignY2hhbmdlJywgYXBwbHlDYW5kaWRhdGVzV2hlblN0YWJsZSk7XG5cbiAgICAgIC8vIGFwcGx5IGFueSBxdWV1ZWQgY2FuZGlkYXRlc1xuICAgICAgcXVldWVkQ2FuZGlkYXRlcy5zcGxpY2UoMCkuZm9yRWFjaChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGRlYnVnKCdhcHBseWluZyBxdWV1ZWQgY2FuZGlkYXRlJywgZGF0YSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwYy5hZGRJY2VDYW5kaWRhdGUoY3JlYXRlSWNlQ2FuZGlkYXRlKGRhdGEpKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgIGRlYnVnKCdpbnZhbGlkYXRlIGNhbmRpZGF0ZSBzcGVjaWZpZWQ6ICcsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja05vdENvbm5lY3RpbmcobmVnb3RpYXRlKSB7XG4gICAgaWYgKHBjLmljZUNvbm5lY3Rpb25TdGF0ZSAhPSAnY2hlY2tpbmcnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZWJ1ZygnY29ubmVjdGlvbiBzdGF0ZSBpcyBjaGVja2luZywgd2lsbCB3YWl0IHRvIGNyZWF0ZSBhIG5ldyBvZmZlcicpO1xuICAgIG1vbi5vbmNlKCdjb25uZWN0ZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHEucHVzaCh7IG9wOiBuZWdvdGlhdGUgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja1N0YWJsZShuZWdvdGlhdGUpIHtcbiAgICBpZiAocGMuc2lnbmFsaW5nU3RhdGUgPT09ICdzdGFibGUnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZWJ1ZygnY2Fubm90IGNyZWF0ZSBvZmZlciwgc2lnbmFsaW5nIHN0YXRlICE9IHN0YWJsZSwgd2lsbCByZXRyeScpO1xuICAgIG1vbi5vbignY2hhbmdlJywgZnVuY3Rpb24gd2FpdEZvclN0YWJsZSgpIHtcbiAgICAgIGlmIChwYy5zaWduYWxpbmdTdGF0ZSA9PT0gJ3N0YWJsZScpIHtcbiAgICAgICAgcS5wdXNoKHsgb3A6IG5lZ290aWF0ZSB9KTtcbiAgICAgIH1cblxuICAgICAgbW9uLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2UnLCB3YWl0Rm9yU3RhYmxlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUljZUNhbmRpZGF0ZShkYXRhKSB7XG4gICAgaWYgKHBsdWdpbiAmJiB0eXBlb2YgcGx1Z2luLmNyZWF0ZUljZUNhbmRpZGF0ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcGx1Z2luLmNyZWF0ZUljZUNhbmRpZGF0ZShkYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJUQ0ljZUNhbmRpZGF0ZShkYXRhKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNlc3Npb25EZXNjcmlwdGlvbihkYXRhKSB7XG4gICAgaWYgKHBsdWdpbiAmJiB0eXBlb2YgcGx1Z2luLmNyZWF0ZVNlc3Npb25EZXNjcmlwdGlvbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcGx1Z2luLmNyZWF0ZVNlc3Npb25EZXNjcmlwdGlvbihkYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbihkYXRhKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY291cGxlKCkge1xuICAgIGRlYnVnKCdkZWNvdXBsaW5nICcgKyBzaWduYWxsZXIuaWQgKyAnIGZyb20gJyArIHRhcmdldElkKTtcblxuICAgIC8vIHN0b3AgdGhlIG1vbml0b3JcbiAgICBtb24ucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgbW9uLnN0b3AoKTtcblxuICAgIC8vIGNsZWFudXAgdGhlIHBlZXJjb25uZWN0aW9uXG4gICAgY2xlYW51cChwYyk7XG5cbiAgICAvLyByZW1vdmUgbGlzdGVuZXJzXG4gICAgc2lnbmFsbGVyLnJlbW92ZUxpc3RlbmVyKCdzZHAnLCBoYW5kbGVTZHApO1xuICAgIHNpZ25hbGxlci5yZW1vdmVMaXN0ZW5lcignY2FuZGlkYXRlJywgaGFuZGxlUmVtb3RlQ2FuZGlkYXRlKTtcbiAgICBzaWduYWxsZXIucmVtb3ZlTGlzdGVuZXIoJ25lZ290aWF0ZScsIGhhbmRsZU5lZ290aWF0ZVJlcXVlc3QpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVDb25zdHJhaW50cyhtZXRob2ROYW1lKSB7XG4gICAgdmFyIGNvbnN0cmFpbnRzID0ge307XG5cbiAgICBmdW5jdGlvbiByZWZvcm1hdENvbnN0cmFpbnRzKCkge1xuICAgICAgdmFyIHR3ZWFrZWQgPSB7fTtcblxuICAgICAgT2JqZWN0LmtleXMoY29uc3RyYWludHMpLmZvckVhY2goZnVuY3Rpb24ocGFyYW0pIHtcbiAgICAgICAgdmFyIHNlbnRlbmNlZENhc2VkID0gcGFyYW0uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwYXJhbS5zdWJzdHIoMSk7XG4gICAgICAgIHR3ZWFrZWRbc2VudGVuY2VkQ2FzZWRdID0gY29uc3RyYWludHNbcGFyYW1dO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgY29uc3RyYWludHMgdG8gbWF0Y2ggdGhlIGV4cGVjdGVkIGZvcm1hdFxuICAgICAgY29uc3RyYWludHMgPSB7XG4gICAgICAgIG1hbmRhdG9yeTogdHdlYWtlZFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBjdXN0b21pemUgYmVoYXZpb3VyIGJhc2VkIG9uIG9mZmVyIHZzIGFuc3dlclxuXG4gICAgLy8gcHVsbCBvdXQgYW55IHZhbGlkXG4gICAgT0ZGRVJfQU5TV0VSX0NPTlNUUkFJTlRTLmZvckVhY2goZnVuY3Rpb24ocGFyYW0pIHtcbiAgICAgIHZhciBzZW50ZW5jZWRDYXNlZCA9IHBhcmFtLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGFyYW0uc3Vic3RyKDEpO1xuXG4gICAgICAvLyBpZiB3ZSBoYXZlIG5vIG9wdHMsIGRvIG5vdGhpbmdcbiAgICAgIGlmICghIG9wdHMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gaWYgdGhlIHBhcmFtZXRlciBoYXMgYmVlbiBkZWZpbmVkLCB0aGVuIGFkZCBpdCB0byB0aGUgY29uc3RyYWludHNcbiAgICAgIGVsc2UgaWYgKG9wdHNbcGFyYW1dICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3RyYWludHNbcGFyYW1dID0gb3B0c1twYXJhbV07XG4gICAgICB9XG4gICAgICAvLyBpZiB0aGUgc2VudGVuY2VkIGNhc2VkIHZlcnNpb24gaGFzIGJlZW4gYWRkZWQsIHRoZW4gdXNlIHRoYXRcbiAgICAgIGVsc2UgaWYgKG9wdHNbc2VudGVuY2VkQ2FzZWRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3RyYWludHNbcGFyYW1dID0gb3B0c1tzZW50ZW5jZWRDYXNlZF07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUT0RPOiBvbmx5IGRvIHRoaXMgZm9yIHRoZSBvbGRlciBicm93c2VycyB0aGF0IHJlcXVpcmUgaXRcbiAgICByZWZvcm1hdENvbnN0cmFpbnRzKCk7XG5cbiAgICByZXR1cm4gY29uc3RyYWludHM7XG4gIH1cblxuICBmdW5jdGlvbiBwcmVwTmVnb3RpYXRlKG1ldGhvZE5hbWUsIGFsbG93ZWQsIHByZWZsaWdodENoZWNrcykge1xuICAgIHZhciBjb25zdHJhaW50cyA9IGdlbmVyYXRlQ29uc3RyYWludHMobWV0aG9kTmFtZSk7XG5cbiAgICAvLyBlbnN1cmUgd2UgaGF2ZSBhIHZhbGlkIHByZWZsaWdodENoZWNrcyBhcnJheVxuICAgIHByZWZsaWdodENoZWNrcyA9IFtdLmNvbmNhdChwcmVmbGlnaHRDaGVja3MgfHwgW10pO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5lZ290aWF0ZSh0YXNrLCBjYikge1xuICAgICAgdmFyIGNoZWNrc09LID0gdHJ1ZTtcblxuICAgICAgLy8gaWYgdGhlIHRhc2sgaXMgbm90IGFsbG93ZWQsIHRoZW4gc2VuZCBhIG5lZ290aWF0ZSByZXF1ZXN0IHRvIG91clxuICAgICAgLy8gcGVlclxuICAgICAgaWYgKCEgYWxsb3dlZCkge1xuICAgICAgICBzaWduYWxsZXIudG8odGFyZ2V0SWQpLnNlbmQoJy9uZWdvdGlhdGUnKTtcbiAgICAgICAgcmV0dXJuIGNiKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHRoZSBjb25uZWN0aW9uIGlzIGNsb3NlZCwgdGhlbiBhYm9ydFxuICAgICAgaWYgKGlzQ2xvc2VkKCkpIHtcbiAgICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignY29ubmVjdGlvbiBjbG9zZWQsIGNhbm5vdCBuZWdvdGlhdGUnKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJ1biB0aGUgcHJlZmxpZ2h0IGNoZWNrc1xuICAgICAgcHJlZmxpZ2h0Q2hlY2tzLmZvckVhY2goZnVuY3Rpb24oY2hlY2spIHtcbiAgICAgICAgY2hlY2tzT0sgPSBjaGVja3NPSyAmJiBjaGVjayhuZWdvdGlhdGUpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIGlmIHRoZSBjaGVja3MgaGF2ZSBub3QgcGFzc2VkLCB0aGVuIGFib3J0IGZvciB0aGUgbW9tZW50XG4gICAgICBpZiAoISBjaGVja3NPSykge1xuICAgICAgICBkZWJ1ZygncHJlZmxpZ2h0IGNoZWNrcyBkaWQgbm90IHBhc3MsIGFib3J0aW5nICcgKyBtZXRob2ROYW1lKTtcbiAgICAgICAgcmV0dXJuIGNiKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNyZWF0ZSB0aGUgb2ZmZXJcbiAgICAgIGRlYnVnKCdjYWxsaW5nICcgKyBtZXRob2ROYW1lKTtcbiAgICAgIC8vIGRlYnVnKCdnYXRoZXJpbmcgc3RhdGUgPSAnICsgcGMuaWNlR2F0aGVyaW5nU3RhdGUpO1xuICAgICAgLy8gZGVidWcoJ2Nvbm5lY3Rpb24gc3RhdGUgPSAnICsgcGMuaWNlQ29ubmVjdGlvblN0YXRlKTtcbiAgICAgIC8vIGRlYnVnKCdzaWduYWxpbmcgc3RhdGUgPSAnICsgcGMuc2lnbmFsaW5nU3RhdGUpO1xuXG4gICAgICBwY1ttZXRob2ROYW1lXShcbiAgICAgICAgZnVuY3Rpb24oZGVzYykge1xuXG4gICAgICAgICAgLy8gaWYgYSBmaWx0ZXIgaGFzIGJlZW4gc3BlY2lmaWVkLCB0aGVuIGFwcGx5IHRoZSBmaWx0ZXJcbiAgICAgICAgICBpZiAodHlwZW9mIHNkcEZpbHRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBkZXNjLnNkcCA9IHNkcEZpbHRlcihkZXNjLnNkcCwgcGMsIG1ldGhvZE5hbWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHEucHVzaCh7IG9wOiBxdWV1ZUxvY2FsRGVzYyhkZXNjKSB9KTtcbiAgICAgICAgICBjYigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIG9uIGVycm9yLCBhYm9ydFxuICAgICAgICBhYm9ydChtZXRob2ROYW1lLCAnJywgY2IpLFxuXG4gICAgICAgIC8vIGluY2x1ZGUgdGhlIGFwcHJvcHJpYXRlIGNvbnN0cmFpbnRzXG4gICAgICAgIGNvbnN0cmFpbnRzXG4gICAgICApO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVDb25uZWN0aW9uQ2xvc2UoKSB7XG4gICAgZGVidWcoJ2NhcHR1cmVkIHBjIGNsb3NlLCBpY2VDb25uZWN0aW9uU3RhdGUgPSAnICsgcGMuaWNlQ29ubmVjdGlvblN0YXRlKTtcbiAgICBkZWNvdXBsZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRGlzY29ubmVjdCgpIHtcbiAgICBkZWJ1ZygnY2FwdHVyZWQgcGMgZGlzY29ubmVjdCwgbW9uaXRvcmluZyBjb25uZWN0aW9uIHN0YXR1cycpO1xuXG4gICAgLy8gc3RhcnQgdGhlIGRpc2Nvbm5lY3QgdGltZXJcbiAgICBkaXNjb25uZWN0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ21hbnVhbGx5IGNsb3NpbmcgY29ubmVjdGlvbiBhZnRlciBkaXNjb25uZWN0IHRpbWVvdXQnKTtcbiAgICAgIHBjLmNsb3NlKCk7XG4gICAgfSwgZGlzY29ubmVjdFRpbWVvdXQpO1xuXG4gICAgbW9uLm9uKCdjaGFuZ2UnLCBoYW5kbGVEaXNjb25uZWN0QWJvcnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRGlzY29ubmVjdEFib3J0KCkge1xuICAgIGRlYnVnKCdjb25uZWN0aW9uIHN0YXRlIGNoYW5nZWQgdG86ICcgKyBwYy5pY2VDb25uZWN0aW9uU3RhdGUpO1xuICAgIHJlc2V0RGlzY29ubmVjdFRpbWVyKCk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIGEgY2xvc2VkIG9yIGZhaWxlZCBzdGF0dXMsIHRoZW4gY2xvc2UgdGhlIGNvbm5lY3Rpb25cbiAgICBpZiAoQ0xPU0VEX1NUQVRFUy5pbmRleE9mKHBjLmljZUNvbm5lY3Rpb25TdGF0ZSkgPj0gMCkge1xuICAgICAgcmV0dXJuIG1vbi5lbWl0KCdjbG9zZWQnKTtcbiAgICB9XG5cbiAgICBtb24ub25jZSgnZGlzY29ubmVjdCcsIGhhbmRsZURpc2Nvbm5lY3QpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGhhbmRsZUxvY2FsQ2FuZGlkYXRlKGV2dCkge1xuICAgIGlmIChldnQuY2FuZGlkYXRlKSB7XG4gICAgICByZXNldERpc2Nvbm5lY3RUaW1lcigpO1xuXG4gICAgICBzaWduYWxsZXIudG8odGFyZ2V0SWQpLnNlbmQoJy9jYW5kaWRhdGUnLCBldnQuY2FuZGlkYXRlKTtcbiAgICAgIGVuZE9mQ2FuZGlkYXRlcyA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmICghIGVuZE9mQ2FuZGlkYXRlcykge1xuICAgICAgZW5kT2ZDYW5kaWRhdGVzID0gdHJ1ZTtcbiAgICAgIGRlYnVnKCdpY2UgZ2F0aGVyaW5nIHN0YXRlIGNvbXBsZXRlJyk7XG4gICAgICBzaWduYWxsZXIudG8odGFyZ2V0SWQpLnNlbmQoJy9lbmRvZmNhbmRpZGF0ZXMnLCB7fSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTmVnb3RpYXRlUmVxdWVzdChzcmMpIHtcbiAgICBpZiAoc3JjLmlkID09PSB0YXJnZXRJZCkge1xuICAgICAgZGVidWcoJ2dvdCBuZWdvdGlhdGUgcmVxdWVzdCBmcm9tICcgKyB0YXJnZXRJZCArICcsIGNyZWF0aW5nIG9mZmVyJyk7XG4gICAgICBxLnB1c2goeyBvcDogY3JlYXRlT2ZmZXIgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlUmVtb3RlQ2FuZGlkYXRlKGRhdGEsIHNyYykge1xuICAgIGlmICgoISBzcmMpIHx8IChzcmMuaWQgIT09IHRhcmdldElkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHF1ZXVlIGNhbmRpZGF0ZXMgd2hpbGUgdGhlIHNpZ25hbGluZyBzdGF0ZSBpcyBub3Qgc3RhYmxlXG4gICAgaWYgKHBjLnNpZ25hbGluZ1N0YXRlICE9ICdzdGFibGUnIHx8ICghIHBjLnJlbW90ZURlc2NyaXB0aW9uKSkge1xuICAgICAgZGVidWcoJ3F1ZXVpbmcgY2FuZGlkYXRlJyk7XG4gICAgICBxdWV1ZWRDYW5kaWRhdGVzLnB1c2goZGF0YSk7XG5cbiAgICAgIG1vbi5yZW1vdmVMaXN0ZW5lcignY2hhbmdlJywgYXBwbHlDYW5kaWRhdGVzV2hlblN0YWJsZSk7XG4gICAgICBtb24ub24oJ2NoYW5nZScsIGFwcGx5Q2FuZGlkYXRlc1doZW5TdGFibGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBwYy5hZGRJY2VDYW5kaWRhdGUoY3JlYXRlSWNlQ2FuZGlkYXRlKGRhdGEpKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgIGRlYnVnKCdpbnZhbGlkYXRlIGNhbmRpZGF0ZSBzcGVjaWZpZWQ6ICcsIGRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVNkcChkYXRhLCBzcmMpIHtcbiAgICB2YXIgYWJvcnRUeXBlID0gZGF0YS50eXBlID09PSAnb2ZmZXInID8gJ2NyZWF0ZUFuc3dlcicgOiAnY3JlYXRlT2ZmZXInO1xuXG4gICAgLy8gaWYgdGhlIHNvdXJjZSBpcyB1bmtub3duIG9yIG5vdCBhIG1hdGNoLCB0aGVuIGFib3J0XG4gICAgaWYgKCghIHNyYykgfHwgKHNyYy5pZCAhPT0gdGFyZ2V0SWQpKSB7XG4gICAgICByZXR1cm4gZGVidWcoJ3JlY2VpdmVkIHNkcCBidXQgZHJvcHBpbmcgZHVlIHRvIHVubWF0Y2hlZCBzcmMnKTtcbiAgICB9XG5cbiAgICAvLyBwcmlvcml0aXplIHNldHRpbmcgdGhlIHJlbW90ZSBkZXNjcmlwdGlvbiBvcGVyYXRpb25cbiAgICBxLnB1c2goeyBvcDogZnVuY3Rpb24odGFzaywgY2IpIHtcbiAgICAgIGlmIChpc0Nsb3NlZCgpKSB7XG4gICAgICAgIHJldHVybiBjYihuZXcgRXJyb3IoJ3BjIGNsb3NlZDogY2Fubm90IHNldCByZW1vdGUgZGVzY3JpcHRpb24nKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgcmVtb3RlIGRlc2NyaXB0aW9uXG4gICAgICAvLyBvbmNlIHN1Y2Nlc3NmdWwsIHNlbmQgdGhlIGFuc3dlclxuICAgICAgZGVidWcoJ3NldHRpbmcgcmVtb3RlIGRlc2NyaXB0aW9uJyk7XG4gICAgICBwYy5zZXRSZW1vdGVEZXNjcmlwdGlvbihcbiAgICAgICAgY3JlYXRlU2Vzc2lvbkRlc2NyaXB0aW9uKGRhdGEpLFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBjcmVhdGUgdGhlIGFuc3dlclxuICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICdvZmZlcicpIHtcbiAgICAgICAgICAgIHF1ZXVlKGNyZWF0ZUFuc3dlcikoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBjYWxsYmFja1xuICAgICAgICAgIGNiKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWJvcnQoYWJvcnRUeXBlLCBkYXRhLnNkcCwgY2IpXG4gICAgICApO1xuICAgIH19KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQ2xvc2VkKCkge1xuICAgIHJldHVybiBDTE9TRURfU1RBVEVTLmluZGV4T2YocGMuaWNlQ29ubmVjdGlvblN0YXRlKSA+PSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gcXVldWUobmVnb3RpYXRlVGFzaykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHEucHVzaChbXG4gICAgICAgIHsgb3A6IG5lZ290aWF0ZVRhc2sgfVxuICAgICAgXSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHF1ZXVlTG9jYWxEZXNjKGRlc2MpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gc2V0TG9jYWxEZXNjKHRhc2ssIGNiKSB7XG4gICAgICBpZiAoaXNDbG9zZWQoKSkge1xuICAgICAgICByZXR1cm4gY2IobmV3IEVycm9yKCdjb25uZWN0aW9uIGNsb3NlZCwgYWJvcnRpbmcnKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGluaXRpYWxpc2UgdGhlIGxvY2FsIGRlc2NyaXB0aW9uXG4gICAgICBkZWJ1Zygnc2V0dGluZyBsb2NhbCBkZXNjcmlwdGlvbicpO1xuICAgICAgcGMuc2V0TG9jYWxEZXNjcmlwdGlvbihcbiAgICAgICAgZGVzYyxcblxuICAgICAgICAvLyBpZiBzdWNjZXNzZnVsLCB0aGVuIHNlbmQgdGhlIHNkcCBvdmVyIHRoZSB3aXJlXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIHNlbmQgdGhlIHNkcFxuICAgICAgICAgIHNpZ25hbGxlci50byh0YXJnZXRJZCkuc2VuZCgnL3NkcCcsIGRlc2MpO1xuXG4gICAgICAgICAgLy8gY2FsbGJhY2tcbiAgICAgICAgICBjYigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGFib3J0KCdzZXRMb2NhbERlc2MnLCBkZXNjLnNkcCwgY2IpXG4gICAgICAgIC8vIG9uIGVycm9yLCBhYm9ydFxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBkZWJ1ZygnZXJyb3Igc2V0dGluZyBsb2NhbCBkZXNjcmlwdGlvbicsIGVycik7XG4gICAgICAgICAgZGVidWcoZGVzYy5zZHApO1xuICAgICAgICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gICBzZXRMb2NhbERlc2ModGFzaywgY2IsIChyZXRyeUNvdW50IHx8IDApICsgMSk7XG4gICAgICAgICAgLy8gfSwgNTAwKTtcblxuICAgICAgICAgIGNiKGVycik7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0RGlzY29ubmVjdFRpbWVyKCkge1xuICAgIG1vbi5yZW1vdmVMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlRGlzY29ubmVjdEFib3J0KTtcblxuICAgIC8vIGNsZWFyIHRoZSBkaXNjb25uZWN0IHRpbWVyXG4gICAgZGVidWcoJ3Jlc2V0IGRpc2Nvbm5lY3QgdGltZXIsIHN0YXRlOiAnICsgcGMuaWNlQ29ubmVjdGlvblN0YXRlKTtcbiAgICBjbGVhclRpbWVvdXQoZGlzY29ubmVjdFRpbWVyKTtcbiAgfVxuXG4gIC8vIHdoZW4gcmVnb3RpYXRpb24gaXMgbmVlZGVkIGxvb2sgZm9yIHRoZSBwZWVyXG4gIGlmIChyZWFjdGl2ZSkge1xuICAgIHBjLm9ubmVnb3RpYXRpb25uZWVkZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdyZW5lZ290aWF0aW9uIHJlcXVpcmVkLCB3aWxsIGNyZWF0ZSBvZmZlciBpbiA1MG1zJyk7XG4gICAgICBjbGVhclRpbWVvdXQob2ZmZXJUaW1lb3V0KTtcbiAgICAgIG9mZmVyVGltZW91dCA9IHNldFRpbWVvdXQocXVldWUoY3JlYXRlT2ZmZXIpLCA1MCk7XG4gICAgfTtcbiAgfVxuXG4gIHBjLm9uaWNlY2FuZGlkYXRlID0gaGFuZGxlTG9jYWxDYW5kaWRhdGU7XG5cbiAgLy8gd2hlbiB3ZSByZWNlaXZlIHNkcCwgdGhlblxuICBzaWduYWxsZXIub24oJ3NkcCcsIGhhbmRsZVNkcCk7XG4gIHNpZ25hbGxlci5vbignY2FuZGlkYXRlJywgaGFuZGxlUmVtb3RlQ2FuZGlkYXRlKTtcblxuICAvLyBpZiB0aGlzIGlzIGEgbWFzdGVyIGNvbm5lY3Rpb24sIGxpc3RlbiBmb3IgbmVnb3RpYXRlIGV2ZW50c1xuICBpZiAoaXNNYXN0ZXIpIHtcbiAgICBzaWduYWxsZXIub24oJ25lZ290aWF0ZScsIGhhbmRsZU5lZ290aWF0ZVJlcXVlc3QpO1xuICB9XG5cbiAgLy8gd2hlbiB0aGUgY29ubmVjdGlvbiBjbG9zZXMsIHJlbW92ZSBldmVudCBoYW5kbGVyc1xuICBtb24ub25jZSgnY2xvc2VkJywgaGFuZGxlQ29ubmVjdGlvbkNsb3NlKTtcbiAgbW9uLm9uY2UoJ2Rpc2Nvbm5lY3RlZCcsIGhhbmRsZURpc2Nvbm5lY3QpO1xuXG4gIC8vIHBhdGNoIGluIHRoZSBjcmVhdGUgb2ZmZXIgZnVuY3Rpb25zXG4gIG1vbi5jcmVhdGVPZmZlciA9IHF1ZXVlKGNyZWF0ZU9mZmVyKTtcblxuICByZXR1cm4gbW9uO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvdXBsZTtcbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICAjIyMgcnRjLXRvb2xzL2RldGVjdFxuXG4gIFByb3ZpZGUgdGhlIFtydGMtY29yZS9kZXRlY3RdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjLWNvcmUjZGV0ZWN0KVxuICBmdW5jdGlvbmFsaXR5LlxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3J0Yy1jb3JlL2RldGVjdCcpO1xuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGRlYnVnID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpKCdnZW5lcmF0b3JzJyk7XG52YXIgZGV0ZWN0ID0gcmVxdWlyZSgnLi9kZXRlY3QnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJ2NvZy9kZWZhdWx0cycpO1xuXG52YXIgbWFwcGluZ3MgPSB7XG4gIGNyZWF0ZToge1xuICAgIGR0bHM6IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICghIGRldGVjdC5tb3opIHtcbiAgICAgICAgYy5vcHRpb25hbCA9IChjLm9wdGlvbmFsIHx8IFtdKS5jb25jYXQoeyBEdGxzU3J0cEtleUFncmVlbWVudDogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICAjIyMgcnRjLXRvb2xzL2dlbmVyYXRvcnNcblxuICBUaGUgZ2VuZXJhdG9ycyBwYWNrYWdlIHByb3ZpZGVzIHNvbWUgdXRpbGl0eSBtZXRob2RzIGZvciBnZW5lcmF0aW5nXG4gIGNvbnN0cmFpbnQgb2JqZWN0cyBhbmQgc2ltaWxhciBjb25zdHJ1Y3RzLlxuXG4gIGBgYGpzXG4gIHZhciBnZW5lcmF0b3JzID0gcmVxdWlyZSgncnRjL2dlbmVyYXRvcnMnKTtcbiAgYGBgXG5cbioqL1xuXG4vKipcbiAgIyMjIyBnZW5lcmF0b3JzLmNvbmZpZyhjb25maWcpXG5cbiAgR2VuZXJhdGUgYSBjb25maWd1cmF0aW9uIG9iamVjdCBzdWl0YWJsZSBmb3IgcGFzc2luZyBpbnRvIGFuIFczQ1xuICBSVENQZWVyQ29ubmVjdGlvbiBjb25zdHJ1Y3RvciBmaXJzdCBhcmd1bWVudCwgYmFzZWQgb24gb3VyIGN1c3RvbSBjb25maWcuXG4qKi9cbmV4cG9ydHMuY29uZmlnID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHJldHVybiBkZWZhdWx0cyhjb25maWcsIHtcbiAgICBpY2VTZXJ2ZXJzOiBbXVxuICB9KTtcbn07XG5cbi8qKlxuICAjIyMjIGdlbmVyYXRvcnMuY29ubmVjdGlvbkNvbnN0cmFpbnRzKGZsYWdzLCBjb25zdHJhaW50cylcblxuICBUaGlzIGlzIGEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgd2lsbCBnZW5lcmF0ZSBhcHByb3ByaWF0ZSBjb25uZWN0aW9uXG4gIGNvbnN0cmFpbnRzIGZvciBhIG5ldyBgUlRDUGVlckNvbm5lY3Rpb25gIG9iamVjdCB3aGljaCBpcyBjb25zdHJ1Y3RlZFxuICBpbiB0aGUgZm9sbG93aW5nIHdheTpcblxuICBgYGBqc1xuICB2YXIgY29ubiA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbihmbGFncywgY29uc3RyYWludHMpO1xuICBgYGBcblxuICBJbiBtb3N0IGNhc2VzIHRoZSBjb25zdHJhaW50cyBvYmplY3QgY2FuIGJlIGxlZnQgZW1wdHksIGJ1dCB3aGVuIGNyZWF0aW5nXG4gIGRhdGEgY2hhbm5lbHMgc29tZSBhZGRpdGlvbmFsIG9wdGlvbnMgYXJlIHJlcXVpcmVkLiAgVGhpcyBmdW5jdGlvblxuICBjYW4gZ2VuZXJhdGUgdGhvc2UgYWRkaXRpb25hbCBvcHRpb25zIGFuZCBpbnRlbGxpZ2VudGx5IGNvbWJpbmUgYW55XG4gIHVzZXIgZGVmaW5lZCBjb25zdHJhaW50cyAoaW4gYGNvbnN0cmFpbnRzYCkgd2l0aCBzaG9ydGhhbmQgZmxhZ3MgdGhhdFxuICBtaWdodCBiZSBwYXNzZWQgd2hpbGUgdXNpbmcgdGhlIGBydGMuY3JlYXRlQ29ubmVjdGlvbmAgaGVscGVyLlxuKiovXG5leHBvcnRzLmNvbm5lY3Rpb25Db25zdHJhaW50cyA9IGZ1bmN0aW9uKGZsYWdzLCBjb25zdHJhaW50cykge1xuICB2YXIgZ2VuZXJhdGVkID0ge307XG4gIHZhciBtID0gbWFwcGluZ3MuY3JlYXRlO1xuICB2YXIgb3V0O1xuXG4gIC8vIGl0ZXJhdGUgdGhyb3VnaCB0aGUgZmxhZ3MgYW5kIGFwcGx5IHRoZSBjcmVhdGUgbWFwcGluZ3NcbiAgT2JqZWN0LmtleXMoZmxhZ3MgfHwge30pLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKG1ba2V5XSkge1xuICAgICAgbVtrZXldKGdlbmVyYXRlZCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBnZW5lcmF0ZSB0aGUgY29ubmVjdGlvbiBjb25zdHJhaW50c1xuICBvdXQgPSBkZWZhdWx0cyh7fSwgY29uc3RyYWludHMsIGdlbmVyYXRlZCk7XG4gIGRlYnVnKCdnZW5lcmF0ZWQgY29ubmVjdGlvbiBjb25zdHJhaW50czogJywgb3V0KTtcblxuICByZXR1cm4gb3V0O1xufTtcbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gICMgcnRjLXRvb2xzXG5cbiAgVGhlIGBydGMtdG9vbHNgIG1vZHVsZSBkb2VzIG1vc3Qgb2YgdGhlIGhlYXZ5IGxpZnRpbmcgd2l0aGluIHRoZVxuICBbcnRjLmlvXShodHRwOi8vcnRjLmlvKSBzdWl0ZS4gIFByaW1hcmlseSBpdCBoYW5kbGVzIHRoZSBsb2dpYyBvZiBjb3VwbGluZ1xuICBhIGxvY2FsIGBSVENQZWVyQ29ubmVjdGlvbmAgd2l0aCBpdCdzIHJlbW90ZSBjb3VudGVycGFydCB2aWEgYW5cbiAgW3J0Yy1zaWduYWxsZXJdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjLXNpZ25hbGxlcikgc2lnbmFsbGluZ1xuICBjaGFubmVsLlxuXG4gICMjIEdldHRpbmcgU3RhcnRlZFxuXG4gIElmIHlvdSBkZWNpZGUgdGhhdCB0aGUgYHJ0Yy10b29sc2AgbW9kdWxlIGlzIGEgYmV0dGVyIGZpdCBmb3IgeW91IHRoYW4gZWl0aGVyXG4gIFtydGMtcXVpY2tjb25uZWN0XShodHRwczovL2dpdGh1Yi5jb20vcnRjLWlvL3J0Yy1xdWlja2Nvbm5lY3QpIG9yXG4gIFtydGMtZ2x1ZV0oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMtZ2x1ZSkgdGhlbiB0aGUgY29kZSBzbmlwcGV0IGJlbG93XG4gIHdpbGwgcHJvdmlkZSB5b3UgYSBndWlkZSBvbiBob3cgdG8gZ2V0IHN0YXJ0ZWQgdXNpbmcgaXQgaW4gY29uanVuY3Rpb24gd2l0aFxuICB0aGUgW3J0Yy1zaWduYWxsZXJdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjLXNpZ25hbGxlcikgYW5kXG4gIFtydGMtbWVkaWFdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjLW1lZGlhKSBtb2R1bGVzOlxuXG4gIDw8PCBleGFtcGxlcy9nZXR0aW5nLXN0YXJ0ZWQuanNcblxuICBUaGlzIGNvZGUgZGVmaW5pdGVseSBkb2Vzbid0IGNvdmVyIGFsbCB0aGUgY2FzZXMgdGhhdCB5b3UgbmVlZCB0byBjb25zaWRlclxuICAoaS5lLiBwZWVycyBsZWF2aW5nLCBldGMpIGJ1dCBpdCBzaG91bGQgZGVtb25zdHJhdGUgaG93IHRvOlxuXG4gIDEuIENhcHR1cmUgdmlkZW8gYW5kIGFkZCBpdCB0byBhIHBlZXIgY29ubmVjdGlvblxuICAyLiBDb3VwbGUgYSBsb2NhbCBwZWVyIGNvbm5lY3Rpb24gd2l0aCBhIHJlbW90ZSBwZWVyIGNvbm5lY3Rpb25cbiAgMy4gRGVhbCB3aXRoIHRoZSByZW1vdGUgc3RlYW0gYmVpbmcgZGlzY292ZXJlZCBhbmQgaG93IHRvIHJlbmRlclxuICAgICB0aGF0IHRvIHRoZSBsb2NhbCBpbnRlcmZhY2UuXG5cbiAgIyMgUmVmZXJlbmNlXG5cbioqL1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW5lcmF0b3JzJyk7XG5cbi8vIGV4cG9ydCBkZXRlY3RcbnZhciBkZXRlY3QgPSBleHBvcnRzLmRldGVjdCA9IHJlcXVpcmUoJy4vZGV0ZWN0Jyk7XG52YXIgZmluZFBsdWdpbiA9IHJlcXVpcmUoJ3J0Yy1jb3JlL3BsdWdpbicpO1xuXG4vLyBleHBvcnQgY29nIGxvZ2dlciBmb3IgY29udmVuaWVuY2VcbmV4cG9ydHMubG9nZ2VyID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpO1xuXG4vLyBleHBvcnQgcGVlciBjb25uZWN0aW9uXG52YXIgUlRDUGVlckNvbm5lY3Rpb24gPVxuZXhwb3J0cy5SVENQZWVyQ29ubmVjdGlvbiA9IGRldGVjdCgnUlRDUGVlckNvbm5lY3Rpb24nKTtcblxuLy8gYWRkIHRoZSBjb3VwbGUgdXRpbGl0eVxuZXhwb3J0cy5jb3VwbGUgPSByZXF1aXJlKCcuL2NvdXBsZScpO1xuXG4vKipcbiAgIyMjIGNyZWF0ZUNvbm5lY3Rpb25cblxuICBgYGBcbiAgY3JlYXRlQ29ubmVjdGlvbihvcHRzPywgY29uc3RyYWludHM/KSA9PiBSVENQZWVyQ29ubmVjdGlvblxuICBgYGBcblxuICBDcmVhdGUgYSBuZXcgYFJUQ1BlZXJDb25uZWN0aW9uYCBhdXRvIGdlbmVyYXRpbmcgZGVmYXVsdCBvcHRzIGFzIHJlcXVpcmVkLlxuXG4gIGBgYGpzXG4gIHZhciBjb25uO1xuXG4gIC8vIHRoaXMgaXMgb2tcbiAgY29ubiA9IHJ0Yy5jcmVhdGVDb25uZWN0aW9uKCk7XG5cbiAgLy8gYW5kIHNvIGlzIHRoaXNcbiAgY29ubiA9IHJ0Yy5jcmVhdGVDb25uZWN0aW9uKHtcbiAgICBpY2VTZXJ2ZXJzOiBbXVxuICB9KTtcbiAgYGBgXG4qKi9cbmV4cG9ydHMuY3JlYXRlQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKG9wdHMsIGNvbnN0cmFpbnRzKSB7XG4gIHZhciBwbHVnaW4gPSBmaW5kUGx1Z2luKChvcHRzIHx8IHt9KS5wbHVnaW5zKTtcblxuICAvLyBnZW5lcmF0ZSB0aGUgY29uZmlnIGJhc2VkIG9uIG9wdGlvbnMgcHJvdmlkZWRcbiAgdmFyIGNvbmZpZyA9IGdlbi5jb25maWcob3B0cyk7XG5cbiAgLy8gZ2VuZXJhdGUgYXBwcm9wcmlhdGUgY29ubmVjdGlvbiBjb25zdHJhaW50c1xuICB2YXIgY29uc3RyYWludHMgPSBnZW4uY29ubmVjdGlvbkNvbnN0cmFpbnRzKG9wdHMsIGNvbnN0cmFpbnRzKTtcblxuICBpZiAocGx1Z2luICYmIHR5cGVvZiBwbHVnaW4uY3JlYXRlQ29ubmVjdGlvbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHBsdWdpbi5jcmVhdGVDb25uZWN0aW9uKGNvbmZpZywgY29uc3RyYWludHMpO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBuZXcgKChvcHRzIHx8IHt9KS5SVENQZWVyQ29ubmVjdGlvbiB8fCBSVENQZWVyQ29ubmVjdGlvbikoXG4gICAgICBjb25maWcsIGNvbnN0cmFpbnRzXG4gICAgKTtcbiAgfVxufTtcbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJyk7XG5cbi8vIGRlZmluZSBzb21lIHN0YXRlIG1hcHBpbmdzIHRvIHNpbXBsaWZ5IHRoZSBldmVudHMgd2UgZ2VuZXJhdGVcbnZhciBzdGF0ZU1hcHBpbmdzID0ge1xuICBjb21wbGV0ZWQ6ICdjb25uZWN0ZWQnXG59O1xuXG4vLyBkZWZpbmUgdGhlIGV2ZW50cyB0aGF0IHdlIG5lZWQgdG8gd2F0Y2ggZm9yIHBlZXIgY29ubmVjdGlvblxuLy8gc3RhdGUgY2hhbmdlc1xudmFyIHBlZXJTdGF0ZUV2ZW50cyA9IFtcbiAgJ3NpZ25hbGluZ3N0YXRlY2hhbmdlJyxcbiAgJ2ljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZScsXG5dO1xuXG4vKipcbiAgIyMjIHJ0Yy10b29scy9tb25pdG9yXG5cbiAgYGBgXG4gIG1vbml0b3IocGMsIHRhcmdldElkLCBzaWduYWxsZXIsIG9wdHM/KSA9PiBFdmVudEVtaXR0ZXJcbiAgYGBgXG5cbiAgVGhlIG1vbml0b3IgaXMgYSB1c2VmdWwgdG9vbCBmb3IgZGV0ZXJtaW5pbmcgdGhlIHN0YXRlIG9mIGBwY2AgKGFuXG4gIGBSVENQZWVyQ29ubmVjdGlvbmApIGluc3RhbmNlIGluIHRoZSBjb250ZXh0IG9mIHlvdXIgYXBwbGljYXRpb24uIFRoZVxuICBtb25pdG9yIHVzZXMgYm90aCB0aGUgYGljZUNvbm5lY3Rpb25TdGF0ZWAgaW5mb3JtYXRpb24gb2YgdGhlIHBlZXJcbiAgY29ubmVjdGlvbiBhbmQgYWxzbyB0aGUgdmFyaW91c1xuICBbc2lnbmFsbGVyIGV2ZW50c10oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMtc2lnbmFsbGVyI3NpZ25hbGxlci1ldmVudHMpXG4gIHRvIGRldGVybWluZSB3aGVuIHRoZSBjb25uZWN0aW9uIGhhcyBiZWVuIGBjb25uZWN0ZWRgIGFuZCB3aGVuIGl0IGhhc1xuICBiZWVuIGBkaXNjb25uZWN0ZWRgLlxuXG4gIEEgbW9uaXRvciBjcmVhdGVkIGBFdmVudEVtaXR0ZXJgIGlzIHJldHVybmVkIGFzIHRoZSByZXN1bHQgb2YgYVxuICBbY291cGxlXShodHRwczovL2dpdGh1Yi5jb20vcnRjLWlvL3J0YyNydGNjb3VwbGUpIGJldHdlZW4gYSBsb2NhbCBwZWVyXG4gIGNvbm5lY3Rpb24gYW5kIGl0J3MgcmVtb3RlIGNvdW50ZXJwYXJ0LlxuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocGMsIHRhcmdldElkLCBzaWduYWxsZXIsIG9wdHMpIHtcbiAgdmFyIGRlYnVnTGFiZWwgPSAob3B0cyB8fCB7fSkuZGVidWdMYWJlbCB8fCAncnRjJztcbiAgdmFyIGRlYnVnID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpKGRlYnVnTGFiZWwgKyAnL21vbml0b3InKTtcbiAgdmFyIG1vbml0b3IgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIHZhciBzdGF0ZTtcblxuICBmdW5jdGlvbiBjaGVja1N0YXRlKCkge1xuICAgIHZhciBuZXdTdGF0ZSA9IGdldE1hcHBlZFN0YXRlKHBjLmljZUNvbm5lY3Rpb25TdGF0ZSk7XG4gICAgZGVidWcoJ3N0YXRlIGNoYW5nZWQ6ICcgKyBwYy5pY2VDb25uZWN0aW9uU3RhdGUgKyAnLCBtYXBwZWQ6ICcgKyBuZXdTdGF0ZSk7XG5cbiAgICAvLyBmbGFnIHRoZSB3ZSBoYWQgYSBzdGF0ZSBjaGFuZ2VcbiAgICBtb25pdG9yLmVtaXQoJ2NoYW5nZScsIHBjKTtcblxuICAgIC8vIGlmIHRoZSBhY3RpdmUgc3RhdGUgaGFzIGNoYW5nZWQsIHRoZW4gc2VuZCB0aGUgYXBwb3ByaWF0ZSBtZXNzYWdlXG4gICAgaWYgKHN0YXRlICE9PSBuZXdTdGF0ZSkge1xuICAgICAgbW9uaXRvci5lbWl0KG5ld1N0YXRlKTtcbiAgICAgIHN0YXRlID0gbmV3U3RhdGU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlUGVlckxlYXZlKHBlZXJJZCkge1xuICAgIGRlYnVnKCdjYXB0dXJlZCBwZWVyIGxlYXZlIGZvciBwZWVyOiAnICsgcGVlcklkKTtcblxuICAgIC8vIGlmIHRoZSBwZWVyIGxlYXZpbmcgaXMgbm90IHRoZSBwZWVyIHdlIGFyZSBjb25uZWN0ZWQgdG9cbiAgICAvLyB0aGVuIHdlIGFyZW4ndCBpbnRlcmVzdGVkXG4gICAgaWYgKHBlZXJJZCAhPT0gdGFyZ2V0SWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB0cmlnZ2VyIGEgY2xvc2VkIGV2ZW50XG4gICAgbW9uaXRvci5lbWl0KCdjbG9zZWQnKTtcbiAgfVxuXG4gIHBjLm9uY2xvc2UgPSBtb25pdG9yLmVtaXQuYmluZChtb25pdG9yLCAnY2xvc2VkJyk7XG4gIHBlZXJTdGF0ZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2dE5hbWUpIHtcbiAgICBwY1snb24nICsgZXZ0TmFtZV0gPSBjaGVja1N0YXRlO1xuICB9KTtcblxuICBtb25pdG9yLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBwYy5vbmNsb3NlID0gbnVsbDtcbiAgICBwZWVyU3RhdGVFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldnROYW1lKSB7XG4gICAgICBwY1snb24nICsgZXZ0TmFtZV0gPSBudWxsO1xuICAgIH0pO1xuXG4gICAgLy8gcmVtb3ZlIHRoZSBwZWVyOmxlYXZlIGxpc3RlbmVyXG4gICAgaWYgKHNpZ25hbGxlciAmJiB0eXBlb2Ygc2lnbmFsbGVyLnJlbW92ZUxpc3RlbmVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgIHNpZ25hbGxlci5yZW1vdmVMaXN0ZW5lcigncGVlcjpsZWF2ZScsIGhhbmRsZVBlZXJMZWF2ZSk7XG4gICAgfVxuICB9O1xuXG4gIG1vbml0b3IuY2hlY2tTdGF0ZSA9IGNoZWNrU3RhdGU7XG5cbiAgLy8gaWYgd2UgaGF2ZW4ndCBiZWVuIHByb3ZpZGVkIGEgdmFsaWQgcGVlciBjb25uZWN0aW9uLCBhYm9ydFxuICBpZiAoISBwYykge1xuICAgIHJldHVybiBtb25pdG9yO1xuICB9XG5cbiAgLy8gZGV0ZXJtaW5lIHRoZSBpbml0aWFsIGlzIGFjdGl2ZSBzdGF0ZVxuICBzdGF0ZSA9IGdldE1hcHBlZFN0YXRlKHBjLmljZUNvbm5lY3Rpb25TdGF0ZSk7XG5cbiAgLy8gaWYgd2UndmUgYmVlbiBwcm92aWRlZCBhIHNpZ25hbGxlciwgdGhlbiB3YXRjaCBmb3IgcGVlcjpsZWF2ZSBldmVudHNcbiAgaWYgKHNpZ25hbGxlciAmJiB0eXBlb2Ygc2lnbmFsbGVyLm9uID09ICdmdW5jdGlvbicpIHtcbiAgICBzaWduYWxsZXIub24oJ3BlZXI6bGVhdmUnLCBoYW5kbGVQZWVyTGVhdmUpO1xuICB9XG5cbiAgLy8gaWYgd2UgYXJlIGFjdGl2ZSwgdHJpZ2dlciB0aGUgY29ubmVjdGVkIHN0YXRlXG4gIC8vIHNldFRpbWVvdXQobW9uaXRvci5lbWl0LmJpbmQobW9uaXRvciwgc3RhdGUpLCAwKTtcblxuICByZXR1cm4gbW9uaXRvcjtcbn07XG5cbi8qIGludGVybmFsIGhlbHBlcnMgKi9cblxuZnVuY3Rpb24gZ2V0TWFwcGVkU3RhdGUoc3RhdGUpIHtcbiAgcmV0dXJuIHN0YXRlTWFwcGluZ3Nbc3RhdGVdIHx8IHN0YXRlO1xufVxuIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbi8qIVxuICogYXN5bmNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jYW9sYW4vYXN5bmNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMC0yMDE0IENhb2xhbiBNY01haG9uXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuLypqc2hpbnQgb25ldmFyOiBmYWxzZSwgaW5kZW50OjQgKi9cbi8qZ2xvYmFsIHNldEltbWVkaWF0ZTogZmFsc2UsIHNldFRpbWVvdXQ6IGZhbHNlLCBjb25zb2xlOiBmYWxzZSAqL1xuKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBhc3luYyA9IHt9O1xuXG4gICAgLy8gZ2xvYmFsIG9uIHRoZSBzZXJ2ZXIsIHdpbmRvdyBpbiB0aGUgYnJvd3NlclxuICAgIHZhciByb290LCBwcmV2aW91c19hc3luYztcblxuICAgIHJvb3QgPSB0aGlzO1xuICAgIGlmIChyb290ICE9IG51bGwpIHtcbiAgICAgIHByZXZpb3VzX2FzeW5jID0gcm9vdC5hc3luYztcbiAgICB9XG5cbiAgICBhc3luYy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByb290LmFzeW5jID0gcHJldmlvdXNfYXN5bmM7XG4gICAgICAgIHJldHVybiBhc3luYztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb25seV9vbmNlKGZuKSB7XG4gICAgICAgIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGNhbGxlZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgd2FzIGFscmVhZHkgY2FsbGVkLlwiKTtcbiAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICBmbi5hcHBseShyb290LCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8vLyBjcm9zcy1icm93c2VyIGNvbXBhdGlibGl0eSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgdmFyIF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgICB2YXIgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIF90b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIHZhciBfZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIGlmIChhcnIuZm9yRWFjaCkge1xuICAgICAgICAgICAgcmV0dXJuIGFyci5mb3JFYWNoKGl0ZXJhdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgaXRlcmF0b3IoYXJyW2ldLCBpLCBhcnIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBfbWFwID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgaWYgKGFyci5tYXApIHtcbiAgICAgICAgICAgIHJldHVybiBhcnIubWFwKGl0ZXJhdG9yKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBfZWFjaChhcnIsIGZ1bmN0aW9uICh4LCBpLCBhKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goaXRlcmF0b3IoeCwgaSwgYSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIHZhciBfcmVkdWNlID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIG1lbW8pIHtcbiAgICAgICAgaWYgKGFyci5yZWR1Y2UpIHtcbiAgICAgICAgICAgIHJldHVybiBhcnIucmVkdWNlKGl0ZXJhdG9yLCBtZW1vKTtcbiAgICAgICAgfVxuICAgICAgICBfZWFjaChhcnIsIGZ1bmN0aW9uICh4LCBpLCBhKSB7XG4gICAgICAgICAgICBtZW1vID0gaXRlcmF0b3IobWVtbywgeCwgaSwgYSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuXG4gICAgdmFyIF9rZXlzID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBpZiAoT2JqZWN0LmtleXMpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopO1xuICAgICAgICB9XG4gICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgIH07XG5cbiAgICAvLy8vIGV4cG9ydGVkIGFzeW5jIG1vZHVsZSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgLy8vLyBuZXh0VGljayBpbXBsZW1lbnRhdGlvbiB3aXRoIGJyb3dzZXItY29tcGF0aWJsZSBmYWxsYmFjayAvLy8vXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAndW5kZWZpbmVkJyB8fCAhKHByb2Nlc3MubmV4dFRpY2spKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBhc3luYy5uZXh0VGljayA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIC8vIG5vdCBhIGRpcmVjdCBhbGlhcyBmb3IgSUUxMCBjb21wYXRpYmlsaXR5XG4gICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKGZuKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUgPSBhc3luYy5uZXh0VGljaztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFzeW5jLm5leHRUaWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlID0gYXN5bmMubmV4dFRpY2s7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgLy8gbm90IGEgZGlyZWN0IGFsaWFzIGZvciBJRTEwIGNvbXBhdGliaWxpdHlcbiAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKGZuKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUgPSBhc3luYy5uZXh0VGljaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jLmVhY2ggPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgaWYgKCFhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29tcGxldGVkID0gMDtcbiAgICAgICAgX2VhY2goYXJyLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgb25seV9vbmNlKGRvbmUpICk7XG4gICAgICAgIH0pO1xuICAgICAgICBmdW5jdGlvbiBkb25lKGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGNvbXBsZXRlZCArPSAxO1xuICAgICAgICAgICAgICBpZiAoY29tcGxldGVkID49IGFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGFzeW5jLmZvckVhY2ggPSBhc3luYy5lYWNoO1xuXG4gICAgYXN5bmMuZWFjaFNlcmllcyA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICBpZiAoIWFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb21wbGV0ZWQgPSAwO1xuICAgICAgICB2YXIgaXRlcmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKGFycltjb21wbGV0ZWRdLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWQgPj0gYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZXJhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBpdGVyYXRlKCk7XG4gICAgfTtcbiAgICBhc3luYy5mb3JFYWNoU2VyaWVzID0gYXN5bmMuZWFjaFNlcmllcztcblxuICAgIGFzeW5jLmVhY2hMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGZuID0gX2VhY2hMaW1pdChsaW1pdCk7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIFthcnIsIGl0ZXJhdG9yLCBjYWxsYmFja10pO1xuICAgIH07XG4gICAgYXN5bmMuZm9yRWFjaExpbWl0ID0gYXN5bmMuZWFjaExpbWl0O1xuXG4gICAgdmFyIF9lYWNoTGltaXQgPSBmdW5jdGlvbiAobGltaXQpIHtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICAgICAgaWYgKCFhcnIubGVuZ3RoIHx8IGxpbWl0IDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjb21wbGV0ZWQgPSAwO1xuICAgICAgICAgICAgdmFyIHN0YXJ0ZWQgPSAwO1xuICAgICAgICAgICAgdmFyIHJ1bm5pbmcgPSAwO1xuXG4gICAgICAgICAgICAoZnVuY3Rpb24gcmVwbGVuaXNoICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcGxldGVkID49IGFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKHJ1bm5pbmcgPCBsaW1pdCAmJiBzdGFydGVkIDwgYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IoYXJyW3N0YXJ0ZWQgLSAxXSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGxldGVkID49IGFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxlbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG5cbiAgICB2YXIgZG9QYXJhbGxlbCA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KG51bGwsIFthc3luYy5lYWNoXS5jb25jYXQoYXJncykpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgdmFyIGRvUGFyYWxsZWxMaW1pdCA9IGZ1bmN0aW9uKGxpbWl0LCBmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KG51bGwsIFtfZWFjaExpbWl0KGxpbWl0KV0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHZhciBkb1NlcmllcyA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KG51bGwsIFthc3luYy5lYWNoU2VyaWVzXS5jb25jYXQoYXJncykpO1xuICAgICAgICB9O1xuICAgIH07XG5cblxuICAgIHZhciBfYXN5bmNNYXAgPSBmdW5jdGlvbiAoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhcnIgPSBfbWFwKGFyciwgZnVuY3Rpb24gKHgsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiB7aW5kZXg6IGksIHZhbHVlOiB4fTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKHgudmFsdWUsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKHgudmFsdWUsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1t4LmluZGV4XSA9IHY7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBhc3luYy5tYXAgPSBkb1BhcmFsbGVsKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwU2VyaWVzID0gZG9TZXJpZXMoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9tYXBMaW1pdChsaW1pdCkoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICB2YXIgX21hcExpbWl0ID0gZnVuY3Rpb24obGltaXQpIHtcbiAgICAgICAgcmV0dXJuIGRvUGFyYWxsZWxMaW1pdChsaW1pdCwgX2FzeW5jTWFwKTtcbiAgICB9O1xuXG4gICAgLy8gcmVkdWNlIG9ubHkgaGFzIGEgc2VyaWVzIHZlcnNpb24sIGFzIGRvaW5nIHJlZHVjZSBpbiBwYXJhbGxlbCB3b24ndFxuICAgIC8vIHdvcmsgaW4gbWFueSBzaXR1YXRpb25zLlxuICAgIGFzeW5jLnJlZHVjZSA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5lYWNoU2VyaWVzKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihtZW1vLCB4LCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgbWVtbyA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8vIGluamVjdCBhbGlhc1xuICAgIGFzeW5jLmluamVjdCA9IGFzeW5jLnJlZHVjZTtcbiAgICAvLyBmb2xkbCBhbGlhc1xuICAgIGFzeW5jLmZvbGRsID0gYXN5bmMucmVkdWNlO1xuXG4gICAgYXN5bmMucmVkdWNlUmlnaHQgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJldmVyc2VkID0gX21hcChhcnIsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfSkucmV2ZXJzZSgpO1xuICAgICAgICBhc3luYy5yZWR1Y2UocmV2ZXJzZWQsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcbiAgICAvLyBmb2xkciBhbGlhc1xuICAgIGFzeW5jLmZvbGRyID0gYXN5bmMucmVkdWNlUmlnaHQ7XG5cbiAgICB2YXIgX2ZpbHRlciA9IGZ1bmN0aW9uIChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGFyciA9IF9tYXAoYXJyLCBmdW5jdGlvbiAoeCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIHtpbmRleDogaSwgdmFsdWU6IHh9O1xuICAgICAgICB9KTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LnZhbHVlLCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhfbWFwKHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICAgICAgICAgIH0pLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGFzeW5jLmZpbHRlciA9IGRvUGFyYWxsZWwoX2ZpbHRlcik7XG4gICAgYXN5bmMuZmlsdGVyU2VyaWVzID0gZG9TZXJpZXMoX2ZpbHRlcik7XG4gICAgLy8gc2VsZWN0IGFsaWFzXG4gICAgYXN5bmMuc2VsZWN0ID0gYXN5bmMuZmlsdGVyO1xuICAgIGFzeW5jLnNlbGVjdFNlcmllcyA9IGFzeW5jLmZpbHRlclNlcmllcztcblxuICAgIHZhciBfcmVqZWN0ID0gZnVuY3Rpb24gKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgYXJyID0gX21hcChhcnIsIGZ1bmN0aW9uICh4LCBpKSB7XG4gICAgICAgICAgICByZXR1cm4ge2luZGV4OiBpLCB2YWx1ZTogeH07XG4gICAgICAgIH0pO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgudmFsdWUsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhfbWFwKHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICAgICAgICAgIH0pLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGFzeW5jLnJlamVjdCA9IGRvUGFyYWxsZWwoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0U2VyaWVzID0gZG9TZXJpZXMoX3JlamVjdCk7XG5cbiAgICB2YXIgX2RldGVjdCA9IGZ1bmN0aW9uIChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIG1haW5fY2FsbGJhY2spIHtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBtYWluX2NhbGxiYWNrKHgpO1xuICAgICAgICAgICAgICAgICAgICBtYWluX2NhbGxiYWNrID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBtYWluX2NhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgYXN5bmMuZGV0ZWN0ID0gZG9QYXJhbGxlbChfZGV0ZWN0KTtcbiAgICBhc3luYy5kZXRlY3RTZXJpZXMgPSBkb1NlcmllcyhfZGV0ZWN0KTtcblxuICAgIGFzeW5jLnNvbWUgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgbWFpbl9jYWxsYmFjaykge1xuICAgICAgICBhc3luYy5lYWNoKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIG1haW5fY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG1haW5fY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBtYWluX2NhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvLyBhbnkgYWxpYXNcbiAgICBhc3luYy5hbnkgPSBhc3luYy5zb21lO1xuXG4gICAgYXN5bmMuZXZlcnkgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgbWFpbl9jYWxsYmFjaykge1xuICAgICAgICBhc3luYy5lYWNoKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGlmICghdikge1xuICAgICAgICAgICAgICAgICAgICBtYWluX2NhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbWFpbl9jYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIG1haW5fY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLy8gYWxsIGFsaWFzXG4gICAgYXN5bmMuYWxsID0gYXN5bmMuZXZlcnk7XG5cbiAgICBhc3luYy5zb3J0QnkgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMubWFwKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAoZXJyLCBjcml0ZXJpYSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHt2YWx1ZTogeCwgY3JpdGVyaWE6IGNyaXRlcmlhfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBmbiA9IGZ1bmN0aW9uIChsZWZ0LCByaWdodCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWEsIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiAwO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgX21hcChyZXN1bHRzLnNvcnQoZm4pLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5hdXRvID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICB2YXIga2V5cyA9IF9rZXlzKHRhc2tzKTtcbiAgICAgICAgdmFyIHJlbWFpbmluZ1Rhc2tzID0ga2V5cy5sZW5ndGhcbiAgICAgICAgaWYgKCFyZW1haW5pbmdUYXNrcykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgdmFyIGFkZExpc3RlbmVyID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMudW5zaGlmdChmbik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAobGlzdGVuZXJzW2ldID09PSBmbikge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgdGFza0NvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVGFza3MtLVxuICAgICAgICAgICAgX2VhY2gobGlzdGVuZXJzLnNsaWNlKDApLCBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFyZW1haW5pbmdUYXNrcykge1xuICAgICAgICAgICAgICAgIHZhciB0aGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICAgICAgICAgIC8vIHByZXZlbnQgZmluYWwgY2FsbGJhY2sgZnJvbSBjYWxsaW5nIGl0c2VsZiBpZiBpdCBlcnJvcnNcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgICAgICAgICAgICAgdGhlQ2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF9lYWNoKGtleXMsIGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICB2YXIgdGFzayA9IF9pc0FycmF5KHRhc2tzW2tdKSA/IHRhc2tzW2tdOiBbdGFza3Nba11dO1xuICAgICAgICAgICAgdmFyIHRhc2tDYWxsYmFjayA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNhZmVSZXN1bHRzID0ge307XG4gICAgICAgICAgICAgICAgICAgIF9lYWNoKF9rZXlzKHJlc3VsdHMpLCBmdW5jdGlvbihya2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1tya2V5XSA9IHJlc3VsdHNbcmtleV07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgc2FmZVJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAvLyBzdG9wIHN1YnNlcXVlbnQgZXJyb3JzIGhpdHRpbmcgY2FsbGJhY2sgbXVsdGlwbGUgdGltZXNcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUodGFza0NvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHJlcXVpcmVzID0gdGFzay5zbGljZSgwLCBNYXRoLmFicyh0YXNrLmxlbmd0aCAtIDEpKSB8fCBbXTtcbiAgICAgICAgICAgIHZhciByZWFkeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlZHVjZShyZXF1aXJlcywgZnVuY3Rpb24gKGEsIHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhICYmIHJlc3VsdHMuaGFzT3duUHJvcGVydHkoeCkpO1xuICAgICAgICAgICAgICAgIH0sIHRydWUpICYmICFyZXN1bHRzLmhhc093blByb3BlcnR5KGspO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYWRkTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMucmV0cnkgPSBmdW5jdGlvbih0aW1lcywgdGFzaywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIERFRkFVTFRfVElNRVMgPSA1O1xuICAgICAgICB2YXIgYXR0ZW1wdHMgPSBbXTtcbiAgICAgICAgLy8gVXNlIGRlZmF1bHRzIGlmIHRpbWVzIG5vdCBwYXNzZWRcbiAgICAgICAgaWYgKHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0YXNrO1xuICAgICAgICAgICAgdGFzayA9IHRpbWVzO1xuICAgICAgICAgICAgdGltZXMgPSBERUZBVUxUX1RJTUVTO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aW1lcyBpcyBhIG51bWJlclxuICAgICAgICB0aW1lcyA9IHBhcnNlSW50KHRpbWVzLCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgdmFyIHdyYXBwZWRUYXNrID0gZnVuY3Rpb24od3JhcHBlZENhbGxiYWNrLCB3cmFwcGVkUmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIHJldHJ5QXR0ZW1wdCA9IGZ1bmN0aW9uKHRhc2ssIGZpbmFsQXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrKGZ1bmN0aW9uKGVyciwgcmVzdWx0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKCFlcnIgfHwgZmluYWxBdHRlbXB0LCB7ZXJyOiBlcnIsIHJlc3VsdDogcmVzdWx0fSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHdyYXBwZWRSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdoaWxlICh0aW1lcykge1xuICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlBdHRlbXB0KHRhc2ssICEodGltZXMtPTEpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhc3luYy5zZXJpZXMoYXR0ZW1wdHMsIGZ1bmN0aW9uKGRvbmUsIGRhdGEpe1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgKHdyYXBwZWRDYWxsYmFjayB8fCBjYWxsYmFjaykoZGF0YS5lcnIsIGRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIGEgY2FsbGJhY2sgaXMgcGFzc2VkLCBydW4gdGhpcyBhcyBhIGNvbnRyb2xsIGZsb3dcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrID8gd3JhcHBlZFRhc2soKSA6IHdyYXBwZWRUYXNrXG4gICAgfTtcblxuICAgIGFzeW5jLndhdGVyZmFsbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgaWYgKCFfaXNBcnJheSh0YXNrcykpIHtcbiAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKTtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHdyYXBJdGVyYXRvciA9IGZ1bmN0aW9uIChpdGVyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKHdyYXBJdGVyYXRvcihuZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVyYXRvci5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgd3JhcEl0ZXJhdG9yKGFzeW5jLml0ZXJhdG9yKHRhc2tzKSkoKTtcbiAgICB9O1xuXG4gICAgdmFyIF9wYXJhbGxlbCA9IGZ1bmN0aW9uKGVhY2hmbiwgdGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge307XG4gICAgICAgIGlmIChfaXNBcnJheSh0YXNrcykpIHtcbiAgICAgICAgICAgIGVhY2hmbi5tYXAodGFza3MsIGZ1bmN0aW9uIChmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgZm4oZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwobnVsbCwgZXJyLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgIGVhY2hmbi5lYWNoKF9rZXlzKHRhc2tzKSwgZnVuY3Rpb24gKGssIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdGFza3Nba10oZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2tdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMucGFyYWxsZWwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbCh7IG1hcDogYXN5bmMubWFwLCBlYWNoOiBhc3luYy5lYWNoIH0sIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnBhcmFsbGVsTGltaXQgPSBmdW5jdGlvbih0YXNrcywgbGltaXQsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbCh7IG1hcDogX21hcExpbWl0KGxpbWl0KSwgZWFjaDogX2VhY2hMaW1pdChsaW1pdCkgfSwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VyaWVzID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICBpZiAoX2lzQXJyYXkodGFza3MpKSB7XG4gICAgICAgICAgICBhc3luYy5tYXBTZXJpZXModGFza3MsIGZ1bmN0aW9uIChmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgZm4oZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwobnVsbCwgZXJyLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgIGFzeW5jLmVhY2hTZXJpZXMoX2tleXModGFza3MpLCBmdW5jdGlvbiAoaywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0YXNrc1trXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5pdGVyYXRvciA9IGZ1bmN0aW9uICh0YXNrcykge1xuICAgICAgICB2YXIgbWFrZUNhbGxiYWNrID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgZm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXNrc1tpbmRleF0uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLm5leHQoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmbi5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoaW5kZXggPCB0YXNrcy5sZW5ndGggLSAxKSA/IG1ha2VDYWxsYmFjayhpbmRleCArIDEpOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBmbjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG1ha2VDYWxsYmFjaygwKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuYXBwbHkgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KFxuICAgICAgICAgICAgICAgIG51bGwsIGFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICB2YXIgX2NvbmNhdCA9IGZ1bmN0aW9uIChlYWNoZm4sIGFyciwgZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBjYikge1xuICAgICAgICAgICAgZm4oeCwgZnVuY3Rpb24gKGVyciwgeSkge1xuICAgICAgICAgICAgICAgIHIgPSByLmNvbmNhdCh5IHx8IFtdKTtcbiAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcik7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgYXN5bmMuY29uY2F0ID0gZG9QYXJhbGxlbChfY29uY2F0KTtcbiAgICBhc3luYy5jb25jYXRTZXJpZXMgPSBkb1NlcmllcyhfY29uY2F0KTtcblxuICAgIGFzeW5jLndoaWxzdCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRlc3QoKSkge1xuICAgICAgICAgICAgaXRlcmF0b3IoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFzeW5jLndoaWxzdCh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmRvV2hpbHN0ID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICBpdGVyYXRvcihmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICBpZiAodGVzdC5hcHBseShudWxsLCBhcmdzKSkge1xuICAgICAgICAgICAgICAgIGFzeW5jLmRvV2hpbHN0KGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMudW50aWwgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghdGVzdCgpKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN5bmMudW50aWwodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5kb1VudGlsID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICBpdGVyYXRvcihmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICBpZiAoIXRlc3QuYXBwbHkobnVsbCwgYXJncykpIHtcbiAgICAgICAgICAgICAgICBhc3luYy5kb1VudGlsKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMucXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuICAgICAgICBpZiAoY29uY3VycmVuY3kgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcG9zLCBjYWxsYmFjaykge1xuICAgICAgICAgIGlmICghcS5zdGFydGVkKXtcbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgaWYgKHEuZHJhaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfZWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6IG51bGxcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICBpZiAocG9zKSB7XG4gICAgICAgICAgICAgICAgcS50YXNrcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHEudGFza3MucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChxLnNhdHVyYXRlZCAmJiBxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JrZXJzID0gMDtcbiAgICAgICAgdmFyIHEgPSB7XG4gICAgICAgICAgICB0YXNrczogW10sXG4gICAgICAgICAgICBjb25jdXJyZW5jeTogY29uY3VycmVuY3ksXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IG51bGwsXG4gICAgICAgICAgICBlbXB0eTogbnVsbCxcbiAgICAgICAgICAgIGRyYWluOiBudWxsLFxuICAgICAgICAgICAgc3RhcnRlZDogZmFsc2UsXG4gICAgICAgICAgICBwYXVzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgZmFsc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBraWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHEuZHJhaW4gPSBudWxsO1xuICAgICAgICAgICAgICBxLnRhc2tzID0gW107XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgdHJ1ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXEucGF1c2VkICYmIHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXNrID0gcS50YXNrcy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocS5lbXB0eSAmJiBxLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFzay5jYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suY2FsbGJhY2suYXBwbHkodGFzaywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxLmRyYWluICYmIHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2IgPSBvbmx5X29uY2UobmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcih0YXNrLmRhdGEsIGNiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHEudGFza3MubGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5pbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VycztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpZGxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSB0cnVlKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAocS5wYXVzZWQgPT09IGZhbHNlKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcS5wcm9jZXNzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG4gICAgXG4gICAgYXN5bmMucHJpb3JpdHlRdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBfY29tcGFyZVRhc2tzKGEsIGIpe1xuICAgICAgICAgIHJldHVybiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIF9iaW5hcnlTZWFyY2goc2VxdWVuY2UsIGl0ZW0sIGNvbXBhcmUpIHtcbiAgICAgICAgICB2YXIgYmVnID0gLTEsXG4gICAgICAgICAgICAgIGVuZCA9IHNlcXVlbmNlLmxlbmd0aCAtIDE7XG4gICAgICAgICAgd2hpbGUgKGJlZyA8IGVuZCkge1xuICAgICAgICAgICAgdmFyIG1pZCA9IGJlZyArICgoZW5kIC0gYmVnICsgMSkgPj4+IDEpO1xuICAgICAgICAgICAgaWYgKGNvbXBhcmUoaXRlbSwgc2VxdWVuY2VbbWlkXSkgPj0gMCkge1xuICAgICAgICAgICAgICBiZWcgPSBtaWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlbmQgPSBtaWQgLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYmVnO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgIGlmICghcS5zdGFydGVkKXtcbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgaWYgKHEuZHJhaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfZWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6IG51bGxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKF9iaW5hcnlTZWFyY2gocS50YXNrcywgaXRlbSwgX2NvbXBhcmVUYXNrcykgKyAxLCAwLCBpdGVtKTtcblxuICAgICAgICAgICAgICBpZiAocS5zYXR1cmF0ZWQgJiYgcS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFN0YXJ0IHdpdGggYSBub3JtYWwgcXVldWVcbiAgICAgICAgdmFyIHEgPSBhc3luYy5xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5KTtcbiAgICAgICAgXG4gICAgICAgIC8vIE92ZXJyaWRlIHB1c2ggdG8gYWNjZXB0IHNlY29uZCBwYXJhbWV0ZXIgcmVwcmVzZW50aW5nIHByaW9yaXR5XG4gICAgICAgIHEucHVzaCA9IGZ1bmN0aW9uIChkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBSZW1vdmUgdW5zaGlmdCBmdW5jdGlvblxuICAgICAgICBkZWxldGUgcS51bnNoaWZ0O1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5jYXJnbyA9IGZ1bmN0aW9uICh3b3JrZXIsIHBheWxvYWQpIHtcbiAgICAgICAgdmFyIHdvcmtpbmcgICAgID0gZmFsc2UsXG4gICAgICAgICAgICB0YXNrcyAgICAgICA9IFtdO1xuXG4gICAgICAgIHZhciBjYXJnbyA9IHtcbiAgICAgICAgICAgIHRhc2tzOiB0YXNrcyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IG51bGwsXG4gICAgICAgICAgICBlbXB0eTogbnVsbCxcbiAgICAgICAgICAgIGRyYWluOiBudWxsLFxuICAgICAgICAgICAgZHJhaW5lZDogdHJ1ZSxcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX2VhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjYXJnby5kcmFpbmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXJnby5zYXR1cmF0ZWQgJiYgdGFza3MubGVuZ3RoID09PSBwYXlsb2FkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJnby5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShjYXJnby5wcm9jZXNzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiBwcm9jZXNzKCkge1xuICAgICAgICAgICAgICAgIGlmICh3b3JraW5nKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZihjYXJnby5kcmFpbiAmJiAhY2FyZ28uZHJhaW5lZCkgY2FyZ28uZHJhaW4oKTtcbiAgICAgICAgICAgICAgICAgICAgY2FyZ28uZHJhaW5lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgdHMgPSB0eXBlb2YgcGF5bG9hZCA9PT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRhc2tzLnNwbGljZSgwLCBwYXlsb2FkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGFza3Muc3BsaWNlKDAsIHRhc2tzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZHMgPSBfbWFwKHRzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5kYXRhO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYoY2FyZ28uZW1wdHkpIGNhcmdvLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgd29ya2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgd29ya2VyKGRzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgX2VhY2godHMsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY2FsbGJhY2suYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFza3MubGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5pbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2luZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGNhcmdvO1xuICAgIH07XG5cbiAgICB2YXIgX2NvbnNvbGVfZm4gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbnNvbGVbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lYWNoKGFyZ3MsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZVtuYW1lXSh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV0pKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIGFzeW5jLmxvZyA9IF9jb25zb2xlX2ZuKCdsb2cnKTtcbiAgICBhc3luYy5kaXIgPSBfY29uc29sZV9mbignZGlyJyk7XG4gICAgLyphc3luYy5pbmZvID0gX2NvbnNvbGVfZm4oJ2luZm8nKTtcbiAgICBhc3luYy53YXJuID0gX2NvbnNvbGVfZm4oJ3dhcm4nKTtcbiAgICBhc3luYy5lcnJvciA9IF9jb25zb2xlX2ZuKCdlcnJvcicpOyovXG5cbiAgICBhc3luYy5tZW1vaXplID0gZnVuY3Rpb24gKGZuLCBoYXNoZXIpIHtcbiAgICAgICAgdmFyIG1lbW8gPSB7fTtcbiAgICAgICAgdmFyIHF1ZXVlcyA9IHt9O1xuICAgICAgICBoYXNoZXIgPSBoYXNoZXIgfHwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICB9O1xuICAgICAgICB2YXIgbWVtb2l6ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgdmFyIGtleSA9IGhhc2hlci5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChrZXkgaW4gbWVtbykge1xuICAgICAgICAgICAgICAgIGFzeW5jLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgbWVtb1trZXldKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSBpbiBxdWV1ZXMpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldID0gW2NhbGxiYWNrXTtcbiAgICAgICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZW1vW2tleV0gPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxID0gcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgIHFbaV0uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1dKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIG1lbW9pemVkLm1lbW8gPSBtZW1vO1xuICAgICAgICBtZW1vaXplZC51bm1lbW9pemVkID0gZm47XG4gICAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICB9O1xuXG4gICAgYXN5bmMudW5tZW1vaXplID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gKGZuLnVubWVtb2l6ZWQgfHwgZm4pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBhc3luYy50aW1lcyA9IGZ1bmN0aW9uIChjb3VudCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjb3VudGVyID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY291bnRlci5wdXNoKGkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhc3luYy5tYXAoY291bnRlciwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudGltZXNTZXJpZXMgPSBmdW5jdGlvbiAoY291bnQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY291bnRlciA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvdW50ZXIucHVzaChpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXN5bmMubWFwU2VyaWVzKGNvdW50ZXIsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgdmFyIGZucyA9IGFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICBhc3luYy5yZWR1Y2UoZm5zLCBhcmdzLCBmdW5jdGlvbiAobmV3YXJncywgZm4sIGNiKSB7XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgbmV3YXJncy5jb25jYXQoW2Z1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVyciA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgY2IoZXJyLCBuZXh0YXJncyk7XG4gICAgICAgICAgICAgICAgfV0pKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGF0LCBbZXJyXS5jb25jYXQocmVzdWx0cykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGFzeW5jLmNvbXBvc2UgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICByZXR1cm4gYXN5bmMuc2VxLmFwcGx5KG51bGwsIEFycmF5LnByb3RvdHlwZS5yZXZlcnNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuICAgIHZhciBfYXBwbHlFYWNoID0gZnVuY3Rpb24gKGVhY2hmbiwgZm5zIC8qYXJncy4uLiovKSB7XG4gICAgICAgIHZhciBnbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICByZXR1cm4gZWFjaGZuKGZucywgZnVuY3Rpb24gKGZuLCBjYikge1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MuY29uY2F0KFtjYl0pKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgICAgICAgICAgcmV0dXJuIGdvLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGdvO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBhc3luYy5hcHBseUVhY2ggPSBkb1BhcmFsbGVsKF9hcHBseUVhY2gpO1xuICAgIGFzeW5jLmFwcGx5RWFjaFNlcmllcyA9IGRvU2VyaWVzKF9hcHBseUVhY2gpO1xuXG4gICAgYXN5bmMuZm9yZXZlciA9IGZ1bmN0aW9uIChmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgZnVuY3Rpb24gbmV4dChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuKG5leHQpO1xuICAgICAgICB9XG4gICAgICAgIG5leHQoKTtcbiAgICB9O1xuXG4gICAgLy8gTm9kZS5qc1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGFzeW5jO1xuICAgIH1cbiAgICAvLyBBTUQgLyBSZXF1aXJlSlNcbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lICE9PSAndW5kZWZpbmVkJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gaW5jbHVkZWQgZGlyZWN0bHkgdmlhIDxzY3JpcHQ+IHRhZ1xuICAgIGVsc2Uge1xuICAgICAgICByb290LmFzeW5jID0gYXN5bmM7XG4gICAgfVxuXG59KCkpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSkiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHt9O1xufVxuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50KSB7XG4gIHJldHVybiBBcnJheS5hcHBseSh0aGlzLCB0aGlzLl9ldmVudHNbZXZlbnRdIHx8IFtdKTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldmVudF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2ZW50XVxuICAgICwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgZm4gPSBsaXN0ZW5lcnNbMF1cbiAgICAsIGFyZ3NcbiAgICAsIGk7XG5cbiAgaWYgKDEgPT09IGxlbmd0aCkge1xuICAgIGlmIChmbi5fX0VFM19vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbik7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBmbi5jYWxsKGZuLl9fRUUzX2NvbnRleHQgfHwgdGhpcyk7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgZm4uY2FsbChmbi5fX0VFM19jb250ZXh0IHx8IHRoaXMsIGExKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBmbi5jYWxsKGZuLl9fRUUzX2NvbnRleHQgfHwgdGhpcywgYTEsIGEyKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICBmbi5jYWxsKGZuLl9fRUUzX2NvbnRleHQgfHwgdGhpcywgYTEsIGEyLCBhMyk7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgZm4uY2FsbChmbi5fX0VFM19jb250ZXh0IHx8IHRoaXMsIGExLCBhMiwgYTMsIGE0KTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2OlxuICAgICAgICBmbi5jYWxsKGZuLl9fRUUzX2NvbnRleHQgfHwgdGhpcywgYTEsIGEyLCBhMywgYTQsIGE1KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgZm4uYXBwbHkoZm4uX19FRTNfY29udGV4dCB8fCB0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGZuID0gbGlzdGVuZXJzWysraV0pIHtcbiAgICAgIGlmIChmbi5fX0VFM19vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbik7XG4gICAgICBmbi5hcHBseShmbi5fX0VFM19jb250ZXh0IHx8IHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IFtdO1xuXG4gIGZuLl9fRUUzX2NvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2goZm4pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgZm4uX19FRTNfb25jZSA9IHRydWU7XG4gIHJldHVybiB0aGlzLm9uKGV2ZW50LCBmbiwgY29udGV4dCk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4pIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldmVudF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZuICYmIGxpc3RlbmVyc1tpXSAhPT0gZm4pIHtcbiAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAvL1xuICBpZiAoZXZlbnRzLmxlbmd0aCkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IGV2ZW50cztcbiAgZWxzZSB0aGlzLl9ldmVudHNbZXZlbnRdID0gbnVsbDtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgaWYgKGV2ZW50KSB0aGlzLl9ldmVudHNbZXZlbnRdID0gbnVsbDtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSB7fTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyMiA9IEV2ZW50RW1pdHRlcjtcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIzID0gRXZlbnRFbWl0dGVyO1xuXG50cnkgeyBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjsgfVxuY2F0Y2ggKGUpIHt9XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgnY29nL2V4dGVuZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1lc3Nlbmdlciwgb3B0cykge1xuICByZXR1cm4gcmVxdWlyZSgnLi9pbmRleC5qcycpKG1lc3NlbmdlciwgZXh0ZW5kKHtcbiAgICBjb25uZWN0OiByZXF1aXJlKCcuL3ByaW11cy1sb2FkZXInKVxuICB9LCBvcHRzKSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIG1lc3NlbmdlciBldmVudHNcbiAgZGF0YUV2ZW50OiAnZGF0YScsXG4gIG9wZW5FdmVudDogJ29wZW4nLFxuICBjbG9zZUV2ZW50OiAnY2xvc2UnLFxuXG4gIC8vIG1lc3NlbmdlciBmdW5jdGlvbnNcbiAgd3JpdGVNZXRob2Q6ICd3cml0ZScsXG4gIGNsb3NlTWV0aG9kOiAnY2xvc2UnLFxuXG4gIC8vIGxlYXZlIHRpbWVvdXQgKG1zKVxuICBsZWF2ZVRpbWVvdXQ6IDMwMDBcbn07IiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGRlYnVnID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpKCdydGMtc2lnbmFsbGVyJyk7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnY29nL2V4dGVuZCcpO1xudmFyIHJvbGVzID0gWydhJywgJ2InXTtcblxuLyoqXG4gICMjIyMgYW5ub3VuY2VcblxuICBgYGBcbiAgL2Fubm91bmNlfCVtZXRhZGF0YSV8e1wiaWRcIjogXCIuLi5cIiwgLi4uIH1cbiAgYGBgXG5cbiAgV2hlbiBhbiBhbm5vdW5jZSBtZXNzYWdlIGlzIHJlY2VpdmVkIGJ5IHRoZSBzaWduYWxsZXIsIHRoZSBhdHRhY2hlZFxuICBvYmplY3QgZGF0YSBpcyBkZWNvZGVkIGFuZCB0aGUgc2lnbmFsbGVyIGVtaXRzIGFuIGBhbm5vdW5jZWAgbWVzc2FnZS5cblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNpZ25hbGxlcikge1xuXG4gIGZ1bmN0aW9uIGNvcHlEYXRhKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHRhcmdldCAmJiBzb3VyY2UpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgZnVuY3Rpb24gZGF0YUFsbG93ZWQoZGF0YSkge1xuICAgIHZhciBldnQgPSB7XG4gICAgICBkYXRhOiBkYXRhLFxuICAgICAgYWxsb3c6IHRydWVcbiAgICB9O1xuXG4gICAgc2lnbmFsbGVyLmVtaXQoJ3BlZXI6ZmlsdGVyJywgZXZ0KTtcblxuICAgIHJldHVybiBldnQuYWxsb3c7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oYXJncywgbWVzc2FnZVR5cGUsIHNyY0RhdGEsIHNyY1N0YXRlLCBpc0RNKSB7XG4gICAgdmFyIGRhdGEgPSBhcmdzWzBdO1xuICAgIHZhciBwZWVyO1xuXG4gICAgZGVidWcoJ2Fubm91bmNlIGhhbmRsZXIgaW52b2tlZCwgcmVjZWl2ZWQgZGF0YTogJywgZGF0YSk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIHZhbGlkIGRhdGEgdGhlbiBwcm9jZXNzXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5pZCAmJiBkYXRhLmlkICE9PSBzaWduYWxsZXIuaWQpIHtcbiAgICAgIGlmICghIGRhdGFBbGxvd2VkKGRhdGEpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIGEga25vd24gcGVlclxuICAgICAgcGVlciA9IHNpZ25hbGxlci5wZWVycy5nZXQoZGF0YS5pZCk7XG5cbiAgICAgIC8vIHRyaWdnZXIgdGhlIHBlZXIgY29ubmVjdGVkIGV2ZW50IHRvIGZsYWcgdGhhdCB3ZSBrbm93IGFib3V0IGFcbiAgICAgIC8vIHBlZXIgY29ubmVjdGlvbi4gVGhlIHBlZXIgaGFzIHBhc3NlZCB0aGUgXCJmaWx0ZXJcIiBjaGVjayBidXQgbWF5XG4gICAgICAvLyBiZSBhbm5vdW5jZWQgLyB1cGRhdGVkIGRlcGVuZGluZyBvbiBwcmV2aW91cyBjb25uZWN0aW9uIHN0YXR1c1xuICAgICAgc2lnbmFsbGVyLmVtaXQoJ3BlZXI6Y29ubmVjdGVkJywgZGF0YS5pZCwgZGF0YSk7XG5cbiAgICAgIC8vIGlmIHRoZSBwZWVyIGlzIGV4aXN0aW5nLCB0aGVuIHVwZGF0ZSB0aGUgZGF0YVxuICAgICAgaWYgKHBlZXIgJiYgKCEgcGVlci5pbmFjdGl2ZSkpIHtcbiAgICAgICAgZGVidWcoJ3NpZ25hbGxlcjogJyArIHNpZ25hbGxlci5pZCArICcgcmVjZWl2ZWQgdXBkYXRlLCBkYXRhOiAnLCBkYXRhKTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIGRhdGFcbiAgICAgICAgY29weURhdGEocGVlci5kYXRhLCBkYXRhKTtcblxuICAgICAgICAvLyB0cmlnZ2VyIHRoZSBwZWVyIHVwZGF0ZSBldmVudFxuICAgICAgICByZXR1cm4gc2lnbmFsbGVyLmVtaXQoJ3BlZXI6dXBkYXRlJywgZGF0YSwgc3JjRGF0YSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNyZWF0ZSBhIG5ldyBwZWVyXG4gICAgICBwZWVyID0ge1xuICAgICAgICBpZDogZGF0YS5pZCxcblxuICAgICAgICAvLyBpbml0aWFsaXNlIHRoZSBsb2NhbCByb2xlIGluZGV4XG4gICAgICAgIHJvbGVJZHg6IFtkYXRhLmlkLCBzaWduYWxsZXIuaWRdLnNvcnQoKS5pbmRleE9mKGRhdGEuaWQpLFxuXG4gICAgICAgIC8vIGluaXRpYWxpc2UgdGhlIHBlZXIgZGF0YVxuICAgICAgICBkYXRhOiB7fVxuICAgICAgfTtcblxuICAgICAgLy8gaW5pdGlhbGlzZSB0aGUgcGVlciBkYXRhXG4gICAgICBjb3B5RGF0YShwZWVyLmRhdGEsIGRhdGEpO1xuXG4gICAgICAvLyByZXNldCBpbmFjdGl2aXR5IHN0YXRlXG4gICAgICBjbGVhclRpbWVvdXQocGVlci5sZWF2ZVRpbWVyKTtcbiAgICAgIHBlZXIuaW5hY3RpdmUgPSBmYWxzZTtcblxuICAgICAgLy8gc2V0IHRoZSBwZWVyIGRhdGFcbiAgICAgIHNpZ25hbGxlci5wZWVycy5zZXQoZGF0YS5pZCwgcGVlcik7XG5cbiAgICAgIC8vIGlmIHRoaXMgaXMgYW4gaW5pdGlhbCBhbm5vdW5jZSBtZXNzYWdlIChubyB2ZWN0b3IgY2xvY2sgYXR0YWNoZWQpXG4gICAgICAvLyB0aGVuIHNlbmQgYSBhbm5vdW5jZSByZXBseVxuICAgICAgaWYgKHNpZ25hbGxlci5hdXRvcmVwbHkgJiYgKCEgaXNETSkpIHtcbiAgICAgICAgc2lnbmFsbGVyXG4gICAgICAgICAgLnRvKGRhdGEuaWQpXG4gICAgICAgICAgLnNlbmQoJy9hbm5vdW5jZScsIHNpZ25hbGxlci5hdHRyaWJ1dGVzKTtcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCBhIG5ldyBwZWVyIGFubm91bmNlIGV2ZW50XG4gICAgICByZXR1cm4gc2lnbmFsbGVyLmVtaXQoJ3BlZXI6YW5ub3VuY2UnLCBkYXRhLCBwZWVyKTtcbiAgICB9XG4gIH07XG59OyIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICAjIyMgc2lnbmFsbGVyIG1lc3NhZ2UgaGFuZGxlcnNcblxuKiovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2lnbmFsbGVyLCBvcHRzKSB7XG4gIHJldHVybiB7XG4gICAgYW5ub3VuY2U6IHJlcXVpcmUoJy4vYW5ub3VuY2UnKShzaWduYWxsZXIsIG9wdHMpLFxuICAgIGxlYXZlOiByZXF1aXJlKCcuL2xlYXZlJykoc2lnbmFsbGVyLCBvcHRzKVxuICB9O1xufTsiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAgIyMjIyBsZWF2ZVxuXG4gIGBgYFxuICAvbGVhdmV8e1wiaWRcIjpcIi4uLlwifVxuICBgYGBcblxuICBXaGVuIGEgbGVhdmUgbWVzc2FnZSBpcyByZWNlaXZlZCBmcm9tIGEgcGVlciwgd2UgY2hlY2sgdG8gc2VlIGlmIHRoYXQgaXNcbiAgYSBwZWVyIHRoYXQgd2UgYXJlIG1hbmFnaW5nIHN0YXRlIGluZm9ybWF0aW9uIGZvciBhbmQgaWYgd2UgYXJlIHRoZW4gdGhlXG4gIHBlZXIgc3RhdGUgaXMgcmVtb3ZlZC5cblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNpZ25hbGxlciwgb3B0cykge1xuICByZXR1cm4gZnVuY3Rpb24oYXJncykge1xuICAgIHZhciBkYXRhID0gYXJnc1swXTtcbiAgICB2YXIgcGVlciA9IHNpZ25hbGxlci5wZWVycy5nZXQoZGF0YSAmJiBkYXRhLmlkKTtcblxuICAgIGlmIChwZWVyKSB7XG4gICAgICAvLyBzdGFydCB0aGUgaW5hY3Rpdml0eSB0aW1lclxuICAgICAgcGVlci5sZWF2ZVRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcGVlci5pbmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHNpZ25hbGxlci5lbWl0KCdwZWVyOmxlYXZlJywgZGF0YS5pZCwgcGVlcik7XG4gICAgICB9LCBvcHRzLmxlYXZlVGltZW91dCk7XG4gICAgfVxuXG4gICAgLy8gZW1pdCB0aGUgZXZlbnRcbiAgICBzaWduYWxsZXIuZW1pdCgncGVlcjpkaXNjb25uZWN0ZWQnLCBkYXRhLmlkLCBwZWVyKTtcbiAgfTtcbn07IiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGRlYnVnID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpKCdydGMtc2lnbmFsbGVyJyk7XG52YXIgZGV0ZWN0ID0gcmVxdWlyZSgncnRjLWNvcmUvZGV0ZWN0Jyk7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnY29nL2RlZmF1bHRzJyk7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnY29nL2V4dGVuZCcpO1xudmFyIHRocm90dGxlID0gcmVxdWlyZSgnY29nL3Rocm90dGxlJyk7XG52YXIgZ2V0YWJsZSA9IHJlcXVpcmUoJ2NvZy9nZXRhYmxlJyk7XG52YXIgdXVpZCA9IHJlcXVpcmUoJy4vdXVpZCcpO1xuXG4vLyBpbml0aWFsaXNlIHRoZSBsaXN0IG9mIHZhbGlkIFwid3JpdGVcIiBtZXRob2RzXG52YXIgV1JJVEVfTUVUSE9EUyA9IFsnd3JpdGUnLCAnc2VuZCddO1xudmFyIENMT1NFX01FVEhPRFMgPSBbJ2Nsb3NlJywgJ2VuZCddO1xuXG4vLyBpbml0aWFsaXNlIHNpZ25hbGxlciBtZXRhZGF0YSBzbyB3ZSBkb24ndCBoYXZlIHRvIGluY2x1ZGUgdGhlIHBhY2thZ2UuanNvblxuLy8gVE9ETzogbWFrZSB0aGlzIGNoZWNrYWJsZSB3aXRoIHNvbWUga2luZCBvZiBwcmVwdWJsaXNoIHNjcmlwdFxudmFyIG1ldGFkYXRhID0ge1xuICB2ZXJzaW9uOiAnMi40LjAnXG59O1xuXG4vKipcbiAgIyBydGMtc2lnbmFsbGVyXG5cbiAgVGhlIGBydGMtc2lnbmFsbGVyYCBtb2R1bGUgcHJvdmlkZXMgYSB0cmFuc3BvcnRsZXNzIHNpZ25hbGxpbmdcbiAgbWVjaGFuaXNtIGZvciBXZWJSVEMuXG5cbiAgIyMgUHVycG9zZVxuXG4gIDw8PCBkb2NzL3B1cnBvc2UubWRcblxuICAjIyBHZXR0aW5nIFN0YXJ0ZWRcblxuICBXaGlsZSB0aGUgc2lnbmFsbGVyIGlzIGNhcGFibGUgb2YgY29tbXVuaWNhdGluZyBieSBhIG51bWJlciBvZiBkaWZmZXJlbnRcbiAgbWVzc2VuZ2VycyAoaS5lLiBhbnl0aGluZyB0aGF0IGNhbiBzZW5kIGFuZCByZWNlaXZlIG1lc3NhZ2VzIG92ZXIgYSB3aXJlKVxuICBpdCBjb21lcyB3aXRoIHN1cHBvcnQgZm9yIHVuZGVyc3RhbmRpbmcgaG93IHRvIGNvbm5lY3QgdG8gYW5cbiAgW3J0Yy1zd2l0Y2hib2FyZF0oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMtc3dpdGNoYm9hcmQpIG91dCBvZiB0aGUgYm94LlxuXG4gIFRoZSBmb2xsb3dpbmcgY29kZSBzYW1wbGUgZGVtb25zdHJhdGVzIGhvdzpcblxuICA8PDwgZXhhbXBsZXMvZ2V0dGluZy1zdGFydGVkLmpzXG5cbiAgPDw8IGRvY3MvZXZlbnRzLm1kXG5cbiAgPDw8IGRvY3Mvc2lnbmFsZmxvdy1kaWFncmFtcy5tZFxuXG4gICMjIFJlZmVyZW5jZVxuXG4gIFRoZSBgcnRjLXNpZ25hbGxlcmAgbW9kdWxlIGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgcHJpbWFyaWx5IGluIGEgZnVuY3Rpb25hbFxuICB3YXkgYW5kIHdoZW4gY2FsbGVkIGl0IGNyZWF0ZXMgYSBuZXcgc2lnbmFsbGVyIHRoYXQgd2lsbCBlbmFibGVcbiAgeW91IHRvIGNvbW11bmljYXRlIHdpdGggb3RoZXIgcGVlcnMgdmlhIHlvdXIgbWVzc2FnaW5nIG5ldHdvcmsuXG5cbiAgYGBganNcbiAgLy8gY3JlYXRlIGEgc2lnbmFsbGVyIGZyb20gc29tZXRoaW5nIHRoYXQga25vd3MgaG93IHRvIHNlbmQgbWVzc2FnZXNcbiAgdmFyIHNpZ25hbGxlciA9IHJlcXVpcmUoJ3J0Yy1zaWduYWxsZXInKShtZXNzZW5nZXIpO1xuICBgYGBcblxuICBBcyBkZW1vbnN0cmF0ZWQgaW4gdGhlIGdldHRpbmcgc3RhcnRlZCBndWlkZSwgeW91IGNhbiBhbHNvIHBhc3MgdGhyb3VnaFxuICBhIHN0cmluZyB2YWx1ZSBpbnN0ZWFkIG9mIGEgbWVzc2VuZ2VyIGluc3RhbmNlIGlmIHlvdSBzaW1wbHkgd2FudCB0b1xuICBjb25uZWN0IHRvIGFuIGV4aXN0aW5nIGBydGMtc3dpdGNoYm9hcmRgIGluc3RhbmNlLlxuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWVzc2VuZ2VyLCBvcHRzKSB7XG4gIC8vIGdldCB0aGUgYXV0b3JlcGx5IHNldHRpbmdcbiAgdmFyIGF1dG9yZXBseSA9IChvcHRzIHx8IHt9KS5hdXRvcmVwbHk7XG4gIHZhciBjb25uZWN0ID0gKG9wdHMgfHwge30pLmNvbm5lY3Q7XG5cbiAgLy8gaW5pdGlhbGlzZSB0aGUgbWV0YWRhdGFcbiAgdmFyIGxvY2FsTWV0YSA9IHt9O1xuXG4gIC8vIGNyZWF0ZSB0aGUgc2lnbmFsbGVyXG4gIHZhciBzaWduYWxsZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLy8gaW5pdGlhbGlzZSB0aGUgaWRcbiAgdmFyIGlkID0gc2lnbmFsbGVyLmlkID0gKG9wdHMgfHwge30pLmlkIHx8IHV1aWQoKTtcblxuICAvLyBpbml0aWFsaXNlIHRoZSBhdHRyaWJ1dGVzXG4gIHZhciBhdHRyaWJ1dGVzID0gc2lnbmFsbGVyLmF0dHJpYnV0ZXMgPSB7XG4gICAgYnJvd3NlcjogZGV0ZWN0LmJyb3dzZXIsXG4gICAgYnJvd3NlclZlcnNpb246IGRldGVjdC5icm93c2VyVmVyc2lvbixcbiAgICBpZDogaWQsXG4gICAgYWdlbnQ6ICdzaWduYWxsZXJAJyArIG1ldGFkYXRhLnZlcnNpb25cbiAgfTtcblxuICAvLyBjcmVhdGUgdGhlIHBlZXJzIG1hcFxuICB2YXIgcGVlcnMgPSBzaWduYWxsZXIucGVlcnMgPSBnZXRhYmxlKHt9KTtcblxuICAvLyBpbml0aWFsaXNlIHRoZSBkYXRhIGV2ZW50IG5hbWVcblxuICB2YXIgY29ubmVjdGVkID0gZmFsc2U7XG4gIHZhciB3cml0ZTtcbiAgdmFyIGNsb3NlO1xuICB2YXIgcHJvY2Vzc29yO1xuICB2YXIgYW5ub3VuY2VUaW1lciA9IDA7XG5cbiAgZnVuY3Rpb24gYW5ub3VuY2VPblJlY29ubmVjdCgpIHtcbiAgICBzaWduYWxsZXIuYW5ub3VuY2UoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmRCcm93c2VyRXZlbnRzKCkge1xuICAgIG1lc3Nlbmdlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICBwcm9jZXNzb3IoZXZ0LmRhdGEpO1xuICAgIH0pO1xuXG4gICAgbWVzc2VuZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCBmdW5jdGlvbihldnQpIHtcbiAgICAgIGNvbm5lY3RlZCA9IHRydWU7XG4gICAgICBzaWduYWxsZXIuZW1pdCgnb3BlbicpO1xuICAgICAgc2lnbmFsbGVyLmVtaXQoJ2Nvbm5lY3RlZCcpO1xuICAgIH0pO1xuXG4gICAgbWVzc2VuZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICBjb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHNpZ25hbGxlci5lbWl0KCdkaXNjb25uZWN0ZWQnKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgLy8gaWYgd2UgZG9uJ3QgaGF2ZSBhbiBvbiBmdW5jdGlvbiBmb3IgdGhlIG1lc3NlbmdlciwgdGhlbiBkbyBub3RoaW5nXG4gICAgaWYgKHR5cGVvZiBtZXNzZW5nZXIub24gIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBtZXNzYWdlIGRhdGEgZXZlbnRzXG4gICAgbWVzc2VuZ2VyLm9uKG9wdHMuZGF0YUV2ZW50LCBwcm9jZXNzb3IpO1xuXG4gICAgLy8gd2hlbiB0aGUgY29ubmVjdGlvbiBpcyBvcGVuLCB0aGVuIGVtaXQgYW4gb3BlbiBldmVudCBhbmQgYSBjb25uZWN0ZWQgZXZlbnRcbiAgICBtZXNzZW5nZXIub24ob3B0cy5vcGVuRXZlbnQsIGZ1bmN0aW9uKCkge1xuICAgICAgY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIHNpZ25hbGxlci5lbWl0KCdvcGVuJyk7XG4gICAgICBzaWduYWxsZXIuZW1pdCgnY29ubmVjdGVkJyk7XG4gICAgfSk7XG5cbiAgICBtZXNzZW5nZXIub24ob3B0cy5jbG9zZUV2ZW50LCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgc2lnbmFsbGVyLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY29ubmVjdFRvSG9zdCh1cmwpIHtcbiAgICBpZiAodHlwZW9mIGNvbm5lY3QgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHNpZ25hbGxlci5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignbm8gY29ubmVjdCBmdW5jdGlvbicpKTtcbiAgICB9XG5cbiAgICAvLyBsb2FkIHByaW11c1xuICAgIGNvbm5lY3QodXJsLCBmdW5jdGlvbihlcnIsIHNvY2tldCkge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gc2lnbmFsbGVyLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgIH1cblxuICAgICAgLy8gY3JlYXRlIHRoZSBhY3R1YWwgbWVzc2VuZ2VyIGZyb20gYSBwcmltdXMgY29ubmVjdGlvblxuICAgICAgc2lnbmFsbGVyLl9tZXNzZW5nZXIgPSBtZXNzZW5nZXIgPSBzb2NrZXQuY29ubmVjdCh1cmwpO1xuXG4gICAgICAvLyBub3cgaW5pdFxuICAgICAgaW5pdCgpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGF0YUxpbmUoYXJncykge1xuICAgIHJldHVybiBhcmdzLm1hcChwcmVwYXJlQXJnKS5qb2luKCd8Jyk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVNZXRhZGF0YSgpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHt9LCBsb2NhbE1ldGEsIHsgaWQ6IHNpZ25hbGxlci5pZCB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dHJhY3RQcm9wKG5hbWUpIHtcbiAgICByZXR1cm4gbWVzc2VuZ2VyW25hbWVdO1xuICB9XG5cbiAgLy8gYXR0ZW1wdCB0byBkZXRlY3Qgd2hldGhlciB0aGUgdW5kZXJseWluZyBtZXNzZW5nZXIgaXMgY2xvc2luZ1xuICAvLyB0aGlzIGNhbiBiZSB0b3VnaCBhcyB3ZSBkZWFsIHdpdGggYm90aCBuYXRpdmUgKG9yIHNpbXVsYXRlZCBuYXRpdmUpXG4gIC8vIHNvY2tldHMgb3IgYW4gYWJzdHJhY3Rpb24gbGF5ZXIgc3VjaCBhcyBwcmltdXNcbiAgZnVuY3Rpb24gaXNDbG9zaW5nKCkge1xuICAgIHZhciBpc0Fic3RyYWN0aW9uID0gbWVzc2VuZ2VyICYmXG4gICAgICAgIC8vIGEgcHJpbXVzIHNvY2tldCBoYXMgYSBzb2NrZXQgYXR0cmlidXRlXG4gICAgICAgIHR5cGVvZiBtZXNzZW5nZXIuc29ja2V0ICE9ICd1bmRlZmluZWQnO1xuXG4gICAgcmV0dXJuIGlzQWJzdHJhY3Rpb24gPyBmYWxzZSA6IChcbiAgICAgIG1lc3NlbmdlciAmJlxuICAgICAgdHlwZW9mIG1lc3Nlbmdlci5yZWFkeVN0YXRlICE9ICd1bmRlZmluZWQnICYmXG4gICAgICBtZXNzZW5nZXIucmVhZHlTdGF0ZSA+PSAyXG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRih0YXJnZXQpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRhcmdldCA9PSAnZnVuY3Rpb24nO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAvLyBleHRyYWN0IHRoZSB3cml0ZSBhbmQgY2xvc2UgZnVuY3Rpb24gcmVmZXJlbmNlc1xuICAgIHdyaXRlID0gW29wdHMud3JpdGVNZXRob2RdLmNvbmNhdChXUklURV9NRVRIT0RTKS5tYXAoZXh0cmFjdFByb3ApLmZpbHRlcihpc0YpWzBdO1xuICAgIGNsb3NlID0gW29wdHMuY2xvc2VNZXRob2RdLmNvbmNhdChDTE9TRV9NRVRIT0RTKS5tYXAoZXh0cmFjdFByb3ApLmZpbHRlcihpc0YpWzBdO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBwcm9jZXNzb3JcbiAgICBzaWduYWxsZXIucHJvY2VzcyA9IHByb2Nlc3NvciA9IHJlcXVpcmUoJy4vcHJvY2Vzc29yJykoc2lnbmFsbGVyLCBvcHRzKTtcblxuICAgIC8vIGlmIHRoZSBtZXNzZW5nZXIgZG9lc24ndCBwcm92aWRlIGEgdmFsaWQgd3JpdGUgbWV0aG9kLCB0aGVuIGNvbXBsYWluXG4gICAgaWYgKHR5cGVvZiB3cml0ZSAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb3ZpZGVkIG1lc3NlbmdlciBkb2VzIG5vdCBpbXBsZW1lbnQgYSBcIicgK1xuICAgICAgICB3cml0ZU1ldGhvZCArICdcIiB3cml0ZSBtZXRob2QnKTtcbiAgICB9XG5cbiAgICAvLyBoYW5kbGUgY29yZSBicm93c2VyIG1lc3NlbmdpbmcgYXBpc1xuICAgIGlmICh0eXBlb2YgbWVzc2VuZ2VyLmFkZEV2ZW50TGlzdGVuZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYmluZEJyb3dzZXJFdmVudHMoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBiaW5kRXZlbnRzKCk7XG4gICAgfVxuXG4gICAgLy8gZGV0ZXJtaW5lIGlmIHdlIGFyZSBjb25uZWN0ZWQgb3Igbm90XG4gICAgY29ubmVjdGVkID0gbWVzc2VuZ2VyLmNvbm5lY3RlZCB8fCBmYWxzZTtcbiAgICBpZiAoISBjb25uZWN0ZWQpIHtcbiAgICAgIHNpZ25hbGxlci5vbmNlKCdjb25uZWN0ZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gYWx3YXlzIGFubm91bmNlIG9uIHJlY29ubmVjdFxuICAgICAgICBzaWduYWxsZXIub24oJ2Nvbm5lY3RlZCcsIGFubm91bmNlT25SZWNvbm5lY3QpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gZW1pdCB0aGUgaW5pdGlhbGl6ZWQgZXZlbnRcbiAgICBzZXRUaW1lb3V0KHNpZ25hbGxlci5lbWl0LmJpbmQoc2lnbmFsbGVyLCAnaW5pdCcpLCAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByZXBhcmVBcmcoYXJnKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgPT0gJ29iamVjdCcgJiYgKCEgKGFyZyBpbnN0YW5jZW9mIFN0cmluZykpKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGFyZyA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJnO1xuICB9XG5cbiAgLyoqXG4gICAgIyMjIHNpZ25hbGxlciNzZW5kKG1lc3NhZ2UsIGRhdGEqKVxuXG4gICAgVXNlIHRoZSBzZW5kIGZ1bmN0aW9uIHRvIHNlbmQgYSBtZXNzYWdlIHRvIG90aGVyIHBlZXJzIGluIHRoZSBjdXJyZW50XG4gICAgc2lnbmFsbGluZyBzY29wZSAoaWYgYW5ub3VuY2VkIGluIGEgcm9vbSB0aGlzIHdpbGwgYmUgYSByb29tLCBvdGhlcndpc2VcbiAgICBicm9hZGNhc3QgdG8gYWxsIHBlZXJzIGNvbm5lY3RlZCB0byB0aGUgc2lnbmFsbGluZyBzZXJ2ZXIpLlxuXG4gICoqL1xuICB2YXIgc2VuZCA9IHNpZ25hbGxlci5zZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gaXRlcmF0ZSBvdmVyIHRoZSBhcmd1bWVudHMgYW5kIHN0cmluZ2lmeSBhcyByZXF1aXJlZFxuICAgIC8vIHZhciBtZXRhZGF0YSA9IHsgaWQ6IHNpZ25hbGxlci5pZCB9O1xuICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIHZhciBkYXRhbGluZTtcblxuICAgIC8vIGluamVjdCB0aGUgbWV0YWRhdGFcbiAgICBhcmdzLnNwbGljZSgxLCAwLCBjcmVhdGVNZXRhZGF0YSgpKTtcbiAgICBkYXRhbGluZSA9IGNyZWF0ZURhdGFMaW5lKGFyZ3MpO1xuXG4gICAgLy8gcGVyZm9ybSBhbiBpc2Nsb3NpbmcgY2hlY2tcbiAgICBpZiAoaXNDbG9zaW5nKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBpZiB3ZSBhcmUgbm90IGluaXRpYWxpemVkLCB0aGVuIHdhaXQgdW50aWwgd2UgYXJlXG4gICAgaWYgKCEgY29ubmVjdGVkKSB7XG4gICAgICByZXR1cm4gc2lnbmFsbGVyLm9uY2UoJ2Nvbm5lY3RlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3cml0ZS5jYWxsKG1lc3NlbmdlciwgZGF0YWxpbmUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gc2VuZCB0aGUgZGF0YSBvdmVyIHRoZSBtZXNzZW5nZXJcbiAgICByZXR1cm4gd3JpdGUuY2FsbChtZXNzZW5nZXIsIGRhdGFsaW5lKTtcbiAgfTtcblxuICAvKipcbiAgICAjIyMgYW5ub3VuY2UoZGF0YT8pXG5cbiAgICBUaGUgYGFubm91bmNlYCBmdW5jdGlvbiBvZiB0aGUgc2lnbmFsbGVyIHdpbGwgcGFzcyBhbiBgL2Fubm91bmNlYCBtZXNzYWdlXG4gICAgdGhyb3VnaCB0aGUgbWVzc2VuZ2VyIG5ldHdvcmsuICBXaGVuIG5vIGFkZGl0aW9uYWwgZGF0YSBpcyBzdXBwbGllZCB0b1xuICAgIHRoaXMgZnVuY3Rpb24gdGhlbiBvbmx5IHRoZSBpZCBvZiB0aGUgc2lnbmFsbGVyIGlzIHNlbnQgdG8gYWxsIGFjdGl2ZVxuICAgIG1lbWJlcnMgb2YgdGhlIG1lc3NlbmdpbmcgbmV0d29yay5cblxuICAgICMjIyMgSm9pbmluZyBSb29tc1xuXG4gICAgVG8gam9pbiBhIHJvb20gdXNpbmcgYW4gYW5ub3VuY2UgY2FsbCB5b3Ugc2ltcGx5IHByb3ZpZGUgdGhlIG5hbWUgb2YgdGhlXG4gICAgcm9vbSB5b3Ugd2lzaCB0byBqb2luIGFzIHBhcnQgb2YgdGhlIGRhdGEgYmxvY2sgdGhhdCB5b3UgYW5ub3VjZSwgZm9yXG4gICAgZXhhbXBsZTpcblxuICAgIGBgYGpzXG4gICAgc2lnbmFsbGVyLmFubm91bmNlKHsgcm9vbTogJ3Rlc3Ryb29tJyB9KTtcbiAgICBgYGBcblxuICAgIFNpZ25hbGxpbmcgc2VydmVycyAoc3VjaCBhc1xuICAgIFtydGMtc3dpdGNoYm9hcmRdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjLXN3aXRjaGJvYXJkKSkgd2lsbCB0aGVuXG4gICAgcGxhY2UgeW91ciBwZWVyIGNvbm5lY3Rpb24gaW50byBhIHJvb20gd2l0aCBvdGhlciBwZWVycyB0aGF0IGhhdmUgYWxzb1xuICAgIGFubm91bmNlZCBpbiB0aGlzIHJvb20uXG5cbiAgICBPbmNlIHlvdSBoYXZlIGpvaW5lZCBhIHJvb20sIHRoZSBzZXJ2ZXIgd2lsbCBvbmx5IGRlbGl2ZXIgbWVzc2FnZXMgdGhhdFxuICAgIHlvdSBgc2VuZGAgdG8gb3RoZXIgcGVlcnMgd2l0aGluIHRoYXQgcm9vbS5cblxuICAgICMjIyMgUHJvdmlkaW5nIEFkZGl0aW9uYWwgQW5ub3VuY2UgRGF0YVxuXG4gICAgVGhlcmUgbWF5IGJlIGluc3RhbmNlcyB3aGVyZSB5b3Ugd2lzaCB0byBzZW5kIGFkZGl0aW9uYWwgZGF0YSBhcyBwYXJ0IG9mXG4gICAgeW91ciBhbm5vdW5jZSBtZXNzYWdlIGluIHlvdXIgYXBwbGljYXRpb24uICBGb3IgaW5zdGFuY2UsIG1heWJlIHlvdSB3YW50XG4gICAgdG8gc2VuZCBhbiBhbGlhcyBvciBuaWNrIGFzIHBhcnQgb2YgeW91ciBhbm5vdW5jZSBtZXNzYWdlIHJhdGhlciB0aGFuIGp1c3RcbiAgICB1c2UgdGhlIHNpZ25hbGxlcidzIGdlbmVyYXRlZCBpZC5cblxuICAgIElmIGZvciBpbnN0YW5jZSB5b3Ugd2VyZSB3cml0aW5nIGEgc2ltcGxlIGNoYXQgYXBwbGljYXRpb24geW91IGNvdWxkIGpvaW5cbiAgICB0aGUgYHdlYnJ0Y2Agcm9vbSBhbmQgdGVsbCBldmVyeW9uZSB5b3VyIG5hbWUgd2l0aCB0aGUgZm9sbG93aW5nIGFubm91bmNlXG4gICAgY2FsbDpcblxuICAgIGBgYGpzXG4gICAgc2lnbmFsbGVyLmFubm91bmNlKHtcbiAgICAgIHJvb206ICd3ZWJydGMnLFxuICAgICAgbmljazogJ0RhbW9uJ1xuICAgIH0pO1xuICAgIGBgYFxuXG4gICAgIyMjIyBBbm5vdW5jaW5nIFVwZGF0ZXNcblxuICAgIFRoZSBzaWduYWxsZXIgaXMgd3JpdHRlbiB0byBkaXN0aW5ndWlzaCBiZXR3ZWVuIGluaXRpYWwgcGVlciBhbm5vdW5jZW1lbnRzXG4gICAgYW5kIHBlZXIgZGF0YSB1cGRhdGVzIChzZWUgdGhlIGRvY3Mgb24gdGhlIGFubm91bmNlIGhhbmRsZXIgYmVsb3cpLiBBc1xuICAgIHN1Y2ggaXQgaXMgb2sgdG8gcHJvdmlkZSBhbnkgZGF0YSB1cGRhdGVzIHVzaW5nIHRoZSBhbm5vdW5jZSBtZXRob2QgYWxzby5cblxuICAgIEZvciBpbnN0YW5jZSwgSSBjb3VsZCBzZW5kIGEgc3RhdHVzIHVwZGF0ZSBhcyBhbiBhbm5vdW5jZSBtZXNzYWdlIHRvIGZsYWdcbiAgICB0aGF0IEkgYW0gZ29pbmcgb2ZmbGluZTpcblxuICAgIGBgYGpzXG4gICAgc2lnbmFsbGVyLmFubm91bmNlKHsgc3RhdHVzOiAnb2ZmbGluZScgfSk7XG4gICAgYGBgXG5cbiAgKiovXG4gIHNpZ25hbGxlci5hbm5vdW5jZSA9IGZ1bmN0aW9uKGRhdGEsIHNlbmRlcikge1xuXG4gICAgZnVuY3Rpb24gc2VuZEFubm91bmNlKCkge1xuICAgICAgKHNlbmRlciB8fCBzZW5kKSgnL2Fubm91bmNlJywgYXR0cmlidXRlcyk7XG4gICAgICBzaWduYWxsZXIuZW1pdCgnbG9jYWw6YW5ub3VuY2UnLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG5cbiAgICBjbGVhclRpbWVvdXQoYW5ub3VuY2VUaW1lcik7XG5cbiAgICAvLyB1cGRhdGUgaW50ZXJuYWwgYXR0cmlidXRlc1xuICAgIGV4dGVuZChhdHRyaWJ1dGVzLCBkYXRhLCB7IGlkOiBzaWduYWxsZXIuaWQgfSk7XG5cbiAgICAvLyBpZiB3ZSBhcmUgYWxyZWFkeSBjb25uZWN0ZWQsIHRoZW4gZW5zdXJlIHdlIGFubm91bmNlIG9uXG4gICAgLy8gcmVjb25uZWN0XG4gICAgaWYgKGNvbm5lY3RlZCkge1xuICAgICAgLy8gYWx3YXlzIGFubm91bmNlIG9uIHJlY29ubmVjdFxuICAgICAgc2lnbmFsbGVyLnJlbW92ZUxpc3RlbmVyKCdjb25uZWN0ZWQnLCBhbm5vdW5jZU9uUmVjb25uZWN0KTtcbiAgICAgIHNpZ25hbGxlci5vbignY29ubmVjdGVkJywgYW5ub3VuY2VPblJlY29ubmVjdCk7XG4gICAgfVxuXG4gICAgLy8gc2VuZCB0aGUgYXR0cmlidXRlcyBvdmVyIHRoZSBuZXR3b3JrXG4gICAgcmV0dXJuIGFubm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEgY29ubmVjdGVkKSB7XG4gICAgICAgIHJldHVybiBzaWduYWxsZXIub25jZSgnY29ubmVjdGVkJywgc2VuZEFubm91bmNlKTtcbiAgICAgIH1cblxuICAgICAgc2VuZEFubm91bmNlKCk7XG4gICAgfSwgKG9wdHMgfHwge30pLmFubm91bmNlRGVsYXkgfHwgMTApO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyBpc01hc3Rlcih0YXJnZXRJZClcblxuICAgIEEgc2ltcGxlIGZ1bmN0aW9uIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgdGhlIGxvY2FsIHNpZ25hbGxlciBpcyB0aGUgbWFzdGVyXG4gICAgZm9yIGl0J3MgcmVsYXRpb25zaGlwIHdpdGggcGVlciBzaWduYWxsZXIgaW5kaWNhdGVkIGJ5IGB0YXJnZXRJZGAuICBSb2xlc1xuICAgIGFyZSBkZXRlcm1pbmVkIGF0IHRoZSBwb2ludCBhdCB3aGljaCBzaWduYWxsaW5nIHBlZXJzIGRpc2NvdmVyIGVhY2ggb3RoZXIsXG4gICAgYW5kIGFyZSBzaW1wbHkgd29ya2VkIG91dCBieSB3aGljaGV2ZXIgcGVlciBoYXMgdGhlIGxvd2VzdCBzaWduYWxsZXIgaWRcbiAgICB3aGVuIGxleGlncmFwaGljYWxseSBzb3J0ZWQuXG5cbiAgICBGb3IgZXhhbXBsZSwgaWYgd2UgaGF2ZSB0d28gc2lnbmFsbGVyIHBlZXJzIHRoYXQgaGF2ZSBkaXNjb3ZlcmVkIGVhY2hcbiAgICBvdGhlcnMgd2l0aCB0aGUgZm9sbG93aW5nIGlkczpcblxuICAgIC0gYGIxMWY0ZmQwLWZlYjUtNDQ3Yy04MGM4LWM1MWQ4YzNjY2VkMmBcbiAgICAtIGA4YTA3ZjgyZS00OWE1LTRiOWItYTAyZS00M2Q5MTEzODJiZTZgXG5cbiAgICBUaGV5IHdvdWxkIGJlIGFzc2lnbmVkIHJvbGVzOlxuXG4gICAgLSBgYjExZjRmZDAtZmViNS00NDdjLTgwYzgtYzUxZDhjM2NjZWQyYFxuICAgIC0gYDhhMDdmODJlLTQ5YTUtNGI5Yi1hMDJlLTQzZDkxMTM4MmJlNmAgKG1hc3RlcilcblxuICAqKi9cbiAgc2lnbmFsbGVyLmlzTWFzdGVyID0gZnVuY3Rpb24odGFyZ2V0SWQpIHtcbiAgICB2YXIgcGVlciA9IHBlZXJzLmdldCh0YXJnZXRJZCk7XG5cbiAgICByZXR1cm4gcGVlciAmJiBwZWVyLnJvbGVJZHggIT09IDA7XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIGxlYXZlKClcblxuICAgIFRlbGwgdGhlIHNpZ25hbGxpbmcgc2VydmVyIHdlIGFyZSBsZWF2aW5nLiAgQ2FsbGluZyB0aGlzIGZ1bmN0aW9uIGlzXG4gICAgdXN1YWxseSBub3QgcmVxdWlyZWQgdGhvdWdoIGFzIHRoZSBzaWduYWxsaW5nIHNlcnZlciBzaG91bGQgaXNzdWUgY29ycmVjdFxuICAgIGAvbGVhdmVgIG1lc3NhZ2VzIHdoZW4gaXQgZGV0ZWN0cyBhIGRpc2Nvbm5lY3QgZXZlbnQuXG5cbiAgKiovXG4gIHNpZ25hbGxlci5sZWF2ZSA9IHNpZ25hbGxlci5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIHNlbmQgdGhlIGxlYXZlIHNpZ25hbFxuICAgIHNlbmQoJy9sZWF2ZScsIHsgaWQ6IGlkIH0pO1xuXG4gICAgLy8gc3RvcCBhbm5vdW5jaW5nIG9uIHJlY29ubmVjdFxuICAgIHNpZ25hbGxlci5yZW1vdmVMaXN0ZW5lcignY29ubmVjdGVkJywgYW5ub3VuY2VPblJlY29ubmVjdCk7XG5cbiAgICAvLyBjYWxsIHRoZSBjbG9zZSBtZXRob2RcbiAgICBpZiAodHlwZW9mIGNsb3NlID09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNsb3NlLmNhbGwobWVzc2VuZ2VyKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIG1ldGFkYXRhKGRhdGE/KVxuXG4gICAgR2V0IChwYXNzIG5vIGRhdGEpIG9yIHNldCB0aGUgbWV0YWRhdGEgdGhhdCBpcyBwYXNzZWQgdGhyb3VnaCB3aXRoIGVhY2hcbiAgICByZXF1ZXN0IHNlbnQgYnkgdGhlIHNpZ25hbGxlci5cblxuICAgIF9fTk9URTpfXyBSZWdhcmRsZXNzIG9mIHdoYXQgaXMgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24sIG1ldGFkYXRhXG4gICAgZ2VuZXJhdGVkIGJ5IHRoZSBzaWduYWxsZXIgd2lsbCAqKmFsd2F5cyoqIGluY2x1ZGUgdGhlIGlkIG9mIHRoZSBzaWduYWxsZXJcbiAgICBhbmQgdGhpcyBjYW5ub3QgYmUgbW9kaWZpZWQuXG4gICoqL1xuICBzaWduYWxsZXIubWV0YWRhdGEgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBleHRlbmQoe30sIGxvY2FsTWV0YSk7XG4gICAgfVxuXG4gICAgbG9jYWxNZXRhID0gZXh0ZW5kKHt9LCBkYXRhKTtcbiAgfTtcblxuICAvKipcbiAgICAjIyMgdG8odGFyZ2V0SWQpXG5cbiAgICBVc2UgdGhlIGB0b2AgZnVuY3Rpb24gdG8gc2VuZCBhIG1lc3NhZ2UgdG8gdGhlIHNwZWNpZmllZCB0YXJnZXQgcGVlci5cbiAgICBBIGxhcmdlIHBhcmdlIG9mIG5lZ290aWF0aW5nIGEgV2ViUlRDIHBlZXIgY29ubmVjdGlvbiBpbnZvbHZlcyBkaXJlY3RcbiAgICBjb21tdW5pY2F0aW9uIGJldHdlZW4gdHdvIHBhcnRpZXMgd2hpY2ggbXVzdCBiZSBkb25lIGJ5IHRoZSBzaWduYWxsaW5nXG4gICAgc2VydmVyLiAgVGhlIGB0b2AgZnVuY3Rpb24gcHJvdmlkZXMgYSBzaW1wbGUgd2F5IHRvIHByb3ZpZGUgYSBsb2dpY2FsXG4gICAgY29tbXVuaWNhdGlvbiBjaGFubmVsIGJldHdlZW4gdGhlIHR3byBwYXJ0aWVzOlxuXG4gICAgYGBganNcbiAgICB2YXIgc2VuZCA9IHNpZ25hbGxlci50bygnZTk1ZmEwNWItOTA2Mi00NWM2LWJmYTItNTA1NWJmNjYyNWY0Jykuc2VuZDtcblxuICAgIC8vIGNyZWF0ZSBhbiBvZmZlciBvbiBhIGxvY2FsIHBlZXIgY29ubmVjdGlvblxuICAgIHBjLmNyZWF0ZU9mZmVyKFxuICAgICAgZnVuY3Rpb24oZGVzYykge1xuICAgICAgICAvLyBzZXQgdGhlIGxvY2FsIGRlc2NyaXB0aW9uIHVzaW5nIHRoZSBvZmZlciBzZHBcbiAgICAgICAgLy8gaWYgdGhpcyBvY2N1cnMgc3VjY2Vzc2Z1bGx5IHNlbmQgdGhpcyB0byBvdXIgcGVlclxuICAgICAgICBwYy5zZXRMb2NhbERlc2NyaXB0aW9uKFxuICAgICAgICAgIGRlc2MsXG4gICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZW5kKCcvc2RwJywgZGVzYyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBoYW5kbGVGYWlsXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgaGFuZGxlRmFpbFxuICAgICk7XG4gICAgYGBgXG5cbiAgKiovXG4gIHNpZ25hbGxlci50byA9IGZ1bmN0aW9uKHRhcmdldElkKSB7XG4gICAgLy8gY3JlYXRlIGEgc2VuZGVyIHRoYXQgd2lsbCBwcmVwZW5kIG1lc3NhZ2VzIHdpdGggL3RvfHRhcmdldElkfFxuICAgIHZhciBzZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGdldCB0aGUgcGVlciAoeWVzIHdoZW4gc2VuZCBpcyBjYWxsZWQgdG8gbWFrZSBzdXJlIGl0IGhhc24ndCBsZWZ0KVxuICAgICAgdmFyIHBlZXIgPSBzaWduYWxsZXIucGVlcnMuZ2V0KHRhcmdldElkKTtcbiAgICAgIHZhciBhcmdzO1xuXG4gICAgICBpZiAoISBwZWVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwZWVyOiAnICsgdGFyZ2V0SWQpO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB0aGUgcGVlciBpcyBpbmFjdGl2ZSwgdGhlbiBhYm9ydFxuICAgICAgaWYgKHBlZXIuaW5hY3RpdmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhcmdzID0gW1xuICAgICAgICAnL3RvJyxcbiAgICAgICAgdGFyZ2V0SWRcbiAgICAgIF0uY29uY2F0KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG5cbiAgICAgIC8vIGluamVjdCBtZXRhZGF0YVxuICAgICAgYXJncy5zcGxpY2UoMywgMCwgY3JlYXRlTWV0YWRhdGEoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBjcmVhdGVEYXRhTGluZShhcmdzKTtcbiAgICAgICAgZGVidWcoJ1RYICgnICsgdGFyZ2V0SWQgKyAnKTogJyArIG1zZyk7XG5cbiAgICAgICAgd3JpdGUuY2FsbChtZXNzZW5nZXIsIG1zZyk7XG4gICAgICB9LCAwKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFubm91bmNlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiBzaWduYWxsZXIuYW5ub3VuY2UoZGF0YSwgc2VuZGVyKTtcbiAgICAgIH0sXG5cbiAgICAgIHNlbmQ6IHNlbmRlcixcbiAgICB9XG4gIH07XG5cbiAgLy8gcmVtb3ZlIG1heCBsaXN0ZW5lcnMgZnJvbSB0aGUgZW1pdHRlclxuICBzaWduYWxsZXIuc2V0TWF4TGlzdGVuZXJzKDApO1xuXG4gIC8vIGluaXRpYWxpc2Ugb3B0cyBkZWZhdWx0c1xuICBvcHRzID0gZGVmYXVsdHMoe30sIG9wdHMsIHJlcXVpcmUoJy4vZGVmYXVsdHMnKSk7XG5cbiAgLy8gc2V0IHRoZSBhdXRvcmVwbHkgZmxhZ1xuICBzaWduYWxsZXIuYXV0b3JlcGx5ID0gYXV0b3JlcGx5ID09PSB1bmRlZmluZWQgfHwgYXV0b3JlcGx5O1xuXG4gIC8vIGlmIHRoZSBtZXNzZW5nZXIgaXMgYSBzdHJpbmcsIHRoZW4gd2UgYXJlIGdvaW5nIHRvIGF0dGFjaCB0byBhXG4gIC8vIHdzIGVuZHBvaW50IGFuZCBhdXRvbWF0aWNhbGx5IHNldCB1cCBwcmltdXNcbiAgaWYgKHR5cGVvZiBtZXNzZW5nZXIgPT0gJ3N0cmluZycgfHwgKG1lc3NlbmdlciBpbnN0YW5jZW9mIFN0cmluZykpIHtcbiAgICBjb25uZWN0VG9Ib3N0KG1lc3Nlbmdlcik7XG4gIH1cbiAgLy8gb3RoZXJ3aXNlLCBpbml0aWFsaXNlIHRoZSBjb25uZWN0aW9uXG4gIGVsc2Uge1xuICAgIGluaXQoKTtcbiAgfVxuXG4gIC8vIGNvbm5lY3QgYW4gaW5zdGFuY2Ugb2YgdGhlIG1lc3NlbmdlciB0byB0aGUgc2lnbmFsbGVyXG4gIHNpZ25hbGxlci5fbWVzc2VuZ2VyID0gbWVzc2VuZ2VyO1xuXG4gIC8vIGV4cG9zZSB0aGUgcHJvY2VzcyBhcyBhIHByb2Nlc3MgZnVuY3Rpb25cbiAgc2lnbmFsbGVyLnByb2Nlc3MgPSBwcm9jZXNzb3I7XG5cbiAgcmV0dXJuIHNpZ25hbGxlcjtcbn07XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuLyogZ2xvYmFsIGRvY3VtZW50LCBsb2NhdGlvbiwgUHJpbXVzOiBmYWxzZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVUcmFpbGluZ1NsYXNoID0gL1xcLyQvO1xuXG4vKipcbiAgIyMjIGxvYWRQcmltdXMoc2lnbmFsaG9zdCwgY2FsbGJhY2spXG5cbiAgVGhpcyBpcyBhIGNvbnZlbmllbmNlIGZ1bmN0aW9uIHRoYXQgaXMgcGF0Y2hlZCBpbnRvIHRoZSBzaWduYWxsZXIgdG8gYXNzaXN0XG4gIHdpdGggbG9hZGluZyB0aGUgYHByaW11cy5qc2AgY2xpZW50IGxpYnJhcnkgZnJvbSBhbiBgcnRjLXN3aXRjaGJvYXJkYFxuICBzaWduYWxpbmcgc2VydmVyLlxuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2lnbmFsaG9zdCwgY2FsbGJhY2spIHtcbiAgdmFyIGFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgdmFyIHNjcmlwdDtcbiAgdmFyIGJhc2VVcmw7XG4gIHZhciBzY3JpcHRTcmM7XG5cbiAgLy8gaWYgdGhlIHNpZ25hbGhvc3QgaXMgYSBmdW5jdGlvbiwgd2UgYXJlIGluIHNpbmdsZSBhcmcgY2FsbGluZyBtb2RlXG4gIGlmICh0eXBlb2Ygc2lnbmFsaG9zdCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBzaWduYWxob3N0O1xuICAgIHNpZ25hbGhvc3QgPSBsb2NhdGlvbi5vcmlnaW47XG4gIH1cblxuICAvLyBpbml0aWFsaXNlIHRoZSBhbmNob3Igd2l0aCB0aGUgc2lnbmFsaG9zdFxuICBhbmNob3IuaHJlZiA9IHNpZ25hbGhvc3Q7XG5cbiAgLy8gcmVhZCB0aGUgYmFzZSBwYXRoXG4gIGJhc2VVcmwgPSBzaWduYWxob3N0LnJlcGxhY2UocmVUcmFpbGluZ1NsYXNoLCAnJyk7XG4gIHNjcmlwdFNyYyA9IGJhc2VVcmwgKyAnL3J0Yy5pby9wcmltdXMuanMnO1xuXG4gIC8vIGxvb2sgZm9yIHRoZSBzY3JpcHQgZmlyc3RcbiAgc2NyaXB0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2NyaXB0W3NyYz1cIicgKyBzY3JpcHRTcmMgKyAnXCJdJyk7XG5cbiAgLy8gaWYgd2UgZm91bmQsIHRoZSBzY3JpcHQgdHJpZ2dlciB0aGUgY2FsbGJhY2sgaW1tZWRpYXRlbHlcbiAgaWYgKHNjcmlwdCAmJiB0eXBlb2YgUHJpbXVzICE9ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIFByaW11cyk7XG4gIH1cbiAgLy8gb3RoZXJ3aXNlLCBpZiB0aGUgc2NyaXB0IGV4aXN0cyBidXQgUHJpbXVzIGlzIG5vdCBsb2FkZWQsXG4gIC8vIHRoZW4gd2FpdCBmb3IgdGhlIGxvYWRcbiAgZWxzZSBpZiAoc2NyaXB0KSB7XG4gICAgc2NyaXB0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIFByaW11cyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBvdGhlcndpc2UgY3JlYXRlIHRoZSBzY3JpcHQgYW5kIGxvYWQgcHJpbXVzXG4gIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBzY3JpcHQuc3JjID0gc2NyaXB0U3JjO1xuXG4gIHNjcmlwdC5vbmVycm9yID0gY2FsbGJhY2s7XG4gIHNjcmlwdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gaWYgd2UgaGF2ZSBhIHNpZ25hbGhvc3QgdGhhdCBpcyBub3QgYmFzZXBhdGhlZCBhdCAvXG4gICAgLy8gdGhlbiB0d2VhayB0aGUgcHJpbXVzIHByb3RvdHlwZVxuICAgIGlmIChhbmNob3IucGF0aG5hbWUgIT09ICcvJykge1xuICAgICAgUHJpbXVzLnByb3RvdHlwZS5wYXRobmFtZSA9IGFuY2hvci5wYXRobmFtZS5yZXBsYWNlKHJlVHJhaWxpbmdTbGFzaCwgJycpICtcbiAgICAgICAgUHJpbXVzLnByb3RvdHlwZS5wYXRobmFtZTtcbiAgICB9XG5cbiAgICBjYWxsYmFjayhudWxsLCBQcmltdXMpO1xuICB9KTtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG59O1xuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGRlYnVnID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpKCdydGMtc2lnbmFsbGVyJyk7XG52YXIganNvbnBhcnNlID0gcmVxdWlyZSgnY29nL2pzb25wYXJzZScpO1xuXG4vKipcbiAgIyMjIHNpZ25hbGxlciBwcm9jZXNzIGhhbmRsaW5nXG5cbiAgV2hlbiBhIHNpZ25hbGxlcidzIHVuZGVybGluZyBtZXNzZW5nZXIgZW1pdHMgYSBgZGF0YWAgZXZlbnQgdGhpcyBpc1xuICBkZWxlZ2F0ZWQgdG8gYSBzaW1wbGUgbWVzc2FnZSBwYXJzZXIsIHdoaWNoIGFwcGxpZXMgdGhlIGZvbGxvd2luZyBzaW1wbGVcbiAgbG9naWM6XG5cbiAgLSBJcyB0aGUgbWVzc2FnZSBhIGAvdG9gIG1lc3NhZ2UuIElmIHNvLCBzZWUgaWYgdGhlIG1lc3NhZ2UgaXMgZm9yIHRoaXNcbiAgICBzaWduYWxsZXIgKGNoZWNraW5nIHRoZSB0YXJnZXQgaWQgLSAybmQgYXJnKS4gIElmIHNvIHBhc3MgdGhlXG4gICAgcmVtYWluZGVyIG9mIHRoZSBtZXNzYWdlIG9udG8gdGhlIHN0YW5kYXJkIHByb2Nlc3NpbmcgY2hhaW4uICBJZiBub3QsXG4gICAgZGlzY2FyZCB0aGUgbWVzc2FnZS5cblxuICAtIElzIHRoZSBtZXNzYWdlIGEgY29tbWFuZCBtZXNzYWdlIChwcmVmaXhlZCB3aXRoIGEgZm9yd2FyZCBzbGFzaCkuIElmIHNvLFxuICAgIGxvb2sgZm9yIGFuIGFwcHJvcHJpYXRlIG1lc3NhZ2UgaGFuZGxlciBhbmQgcGFzcyB0aGUgbWVzc2FnZSBwYXlsb2FkIG9uXG4gICAgdG8gaXQuXG5cbiAgLSBGaW5hbGx5LCBkb2VzIHRoZSBtZXNzYWdlIG1hdGNoIGFueSBwYXR0ZXJucyB0aGF0IHdlIGFyZSBsaXN0ZW5pbmcgZm9yP1xuICAgIElmIHNvLCB0aGVuIHBhc3MgdGhlIGVudGlyZSBtZXNzYWdlIGNvbnRlbnRzIG9udG8gdGhlIHJlZ2lzdGVyZWQgaGFuZGxlci5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaWduYWxsZXIsIG9wdHMpIHtcbiAgdmFyIGhhbmRsZXJzID0gcmVxdWlyZSgnLi9oYW5kbGVycycpKHNpZ25hbGxlciwgb3B0cyk7XG5cbiAgZnVuY3Rpb24gc2VuZEV2ZW50KHBhcnRzLCBzcmNTdGF0ZSwgZGF0YSkge1xuICAgIC8vIGluaXRpYWxpc2UgdGhlIGV2ZW50IG5hbWVcbiAgICB2YXIgZXZ0TmFtZSA9IHBhcnRzWzBdLnNsaWNlKDEpO1xuXG4gICAgLy8gY29udmVydCBhbnkgdmFsaWQganNvbiBvYmplY3RzIHRvIGpzb25cbiAgICB2YXIgYXJncyA9IHBhcnRzLnNsaWNlKDIpLm1hcChqc29ucGFyc2UpO1xuXG4gICAgc2lnbmFsbGVyLmVtaXQuYXBwbHkoXG4gICAgICBzaWduYWxsZXIsXG4gICAgICBbZXZ0TmFtZV0uY29uY2F0KGFyZ3MpLmNvbmNhdChbc3JjU3RhdGUsIGRhdGFdKVxuICAgICk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24ob3JpZ2luYWxEYXRhKSB7XG4gICAgdmFyIGRhdGEgPSBvcmlnaW5hbERhdGE7XG4gICAgdmFyIGlzTWF0Y2ggPSB0cnVlO1xuICAgIHZhciBwYXJ0cztcbiAgICB2YXIgaGFuZGxlcjtcbiAgICB2YXIgc3JjRGF0YTtcbiAgICB2YXIgc3JjU3RhdGU7XG4gICAgdmFyIGlzRGlyZWN0TWVzc2FnZSA9IGZhbHNlO1xuXG4gICAgLy8gZm9yY2UgdGhlIGlkIGludG8gc3RyaW5nIGZvcm1hdCBzbyB3ZSBjYW4gcnVuIGxlbmd0aCBhbmQgY29tcGFyaXNvbiB0ZXN0cyBvbiBpdFxuICAgIHZhciBpZCA9IHNpZ25hbGxlci5pZCArICcnO1xuICAgIGRlYnVnKCdzaWduYWxsZXIgJyArIGlkICsgJyByZWNlaXZlZCBkYXRhOiAnICsgb3JpZ2luYWxEYXRhKTtcblxuICAgIC8vIHByb2Nlc3MgL3RvIG1lc3NhZ2VzXG4gICAgaWYgKGRhdGEuc2xpY2UoMCwgMykgPT09ICcvdG8nKSB7XG4gICAgICBpc01hdGNoID0gZGF0YS5zbGljZSg0LCBpZC5sZW5ndGggKyA0KSA9PT0gaWQ7XG4gICAgICBpZiAoaXNNYXRjaCkge1xuICAgICAgICBwYXJ0cyA9IGRhdGEuc2xpY2UoNSArIGlkLmxlbmd0aCkuc3BsaXQoJ3wnKS5tYXAoanNvbnBhcnNlKTtcblxuICAgICAgICAvLyBnZXQgdGhlIHNvdXJjZSBkYXRhXG4gICAgICAgIGlzRGlyZWN0TWVzc2FnZSA9IHRydWU7XG5cbiAgICAgICAgLy8gZXh0cmFjdCB0aGUgdmVjdG9yIGNsb2NrIGFuZCB1cGRhdGUgdGhlIHBhcnRzXG4gICAgICAgIHBhcnRzID0gcGFydHMubWFwKGpzb25wYXJzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWYgdGhpcyBpcyBub3QgYSBtYXRjaCwgdGhlbiBiYWlsXG4gICAgaWYgKCEgaXNNYXRjaCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGNob3AgdGhlIGRhdGEgaW50byBwYXJ0c1xuICAgIHBhcnRzID0gcGFydHMgfHwgZGF0YS5zcGxpdCgnfCcpLm1hcChqc29ucGFyc2UpO1xuXG4gICAgLy8gaWYgd2UgaGF2ZSBhIHNwZWNpZmljIGhhbmRsZXIgZm9yIHRoZSBhY3Rpb24sIHRoZW4gaW52b2tlXG4gICAgaWYgKHR5cGVvZiBwYXJ0c1swXSA9PSAnc3RyaW5nJykge1xuICAgICAgLy8gZXh0cmFjdCB0aGUgbWV0YWRhdGEgZnJvbSB0aGUgaW5wdXQgZGF0YVxuICAgICAgc3JjRGF0YSA9IHBhcnRzWzFdO1xuXG4gICAgICAvLyBpZiB3ZSBnb3QgZGF0YSBmcm9tIG91cnNlbGYsIHRoZW4gdGhpcyBpcyBwcmV0dHkgZHVtYlxuICAgICAgLy8gYnV0IGlmIHdlIGhhdmUgdGhlbiB0aHJvdyBpdCBhd2F5XG4gICAgICBpZiAoc3JjRGF0YSAmJiBzcmNEYXRhLmlkID09PSBzaWduYWxsZXIuaWQpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignZ290IGRhdGEgZnJvbSBvdXJzZWxmLCBkaXNjYXJkaW5nJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCB0aGUgc291cmNlIHN0YXRlXG4gICAgICBzcmNTdGF0ZSA9IHNpZ25hbGxlci5wZWVycy5nZXQoc3JjRGF0YSAmJiBzcmNEYXRhLmlkKSB8fCBzcmNEYXRhO1xuXG4gICAgICAvLyBoYW5kbGUgY29tbWFuZHNcbiAgICAgIGlmIChwYXJ0c1swXS5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgICAgICAvLyBsb29rIGZvciBhIGhhbmRsZXIgZm9yIHRoZSBtZXNzYWdlIHR5cGVcbiAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW3BhcnRzWzBdLnNsaWNlKDEpXTtcblxuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGhhbmRsZXIoXG4gICAgICAgICAgICBwYXJ0cy5zbGljZSgyKSxcbiAgICAgICAgICAgIHBhcnRzWzBdLnNsaWNlKDEpLFxuICAgICAgICAgICAgc3JjRGF0YSxcbiAgICAgICAgICAgIHNyY1N0YXRlLFxuICAgICAgICAgICAgaXNEaXJlY3RNZXNzYWdlXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzZW5kRXZlbnQocGFydHMsIHNyY1N0YXRlLCBvcmlnaW5hbERhdGEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBvdGhlcndpc2UsIGVtaXQgZGF0YVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNpZ25hbGxlci5lbWl0KFxuICAgICAgICAgICdkYXRhJyxcbiAgICAgICAgICBwYXJ0cy5zbGljZSgwLCAxKS5jb25jYXQocGFydHMuc2xpY2UoMikpLFxuICAgICAgICAgIHNyY0RhdGEsXG4gICAgICAgICAgc3JjU3RhdGUsXG4gICAgICAgICAgaXNEaXJlY3RNZXNzYWdlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcbiIsIi8vIExldmVyT25lJ3MgYXdlc29tZSB1dWlkIGdlbmVyYXRvclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhLGIpe2ZvcihiPWE9Jyc7YSsrPDM2O2IrPWEqNTEmNTI/KGFeMTU/OF5NYXRoLnJhbmRvbSgpKihhXjIwPzE2OjQpOjQpLnRvU3RyaW5nKDE2KTonLScpO3JldHVybiBifTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIl19
