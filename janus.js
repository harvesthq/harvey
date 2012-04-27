
/*

  Janus StateManager — Copyright (c) 2012 Joschka Kintscher
*/

(function() {
  var State, _matchMedia,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  State = (function() {

    State.prototype.active = false;

    State.prototype.is_setup = false;

    function State(condition, setup, on, off) {
      this.condition = condition;
      this.setup = setup;
      this.on = on;
      this.off = off;
    }

    State.prototype.activate = function() {
      if (this.active) return;
      if (!this.is_setup) {
        this.setup();
        this.is_setup = true;
      }
      this.on();
      return this.active = true;
    };

    State.prototype.deactivate = function() {
      if (!this.active) return;
      this.off();
      return this.active = false;
    };

    return State;

  })();

  this.Janus = (function() {

    function Janus() {}

    Janus.prototype.states = {};

    Janus.prototype.queries = [];

    Janus.prototype.started = false;

    Janus.prototype.attach = function(mediaQuery, callback_setup, callback_on, callback_off) {
      var state;
      if (!this.states.hasOwnProperty(mediaQuery)) {
        this.states[mediaQuery] = [];
        this._add_css_for(mediaQuery);
      }
      state = new State(mediaQuery, callback_setup, callback_on, callback_off);
      this.states[mediaQuery].push(state);
      return state;
    };

    Janus.prototype.detach = function(state) {
      var i, t, _len, _ref, _results;
      _ref = this.states[state.condition];
      _results = [];
      for (i = 0, _len = _ref.length; i < _len; i++) {
        t = _ref[i];
        if (state === t) {
          _results.push(this.states[t.condition][i] = void 0);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Janus.prototype.start = function() {
      var mediaQuery, _results;
      if (this.started) return;
      this.started = true;
      _results = [];
      for (mediaQuery in this.states) {
        if (__indexOf.call(this.queries, mediaQuery) < 0) {
          _results.push(this._watch_query(mediaQuery));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Janus.prototype.stop = function() {
      return this.started = false;
    };

    Janus.prototype._watch_query = function(mediaQuery) {
      var _this = this;
      this.queries.push(mediaQuery);
      return this._window_matchmedia(mediaQuery).addListener(function(mql) {
        if (_this.started) {
          return _this._update_state(_this.states[mediaQuery], mql.matches);
        }
      });
    };

    Janus.prototype._update_state = function(states, active) {
      var state, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = states.length; _i < _len; _i++) {
        state = states[_i];
        if (active) {
          _results.push(state.activate());
        } else {
          _results.push(state.deactivate());
        }
      }
      return _results;
    };

    /*
    
        BEWARE: Here there be monsters! Don't dig too deep below this line…
    
        ------------------------------------------------------------------------------------
    
        Private methods to fix and polyfill the matchMedia interface for several engines
    
        * Inspired by Nicholas C. Zakas' article on the different problems with matchMedia
          http://www.nczonline.net/blog/2012/01/19/css-media-queries-in-javascript-part-2/
    
        * Implementing a modified coffeescript version of Paul Irish's matchMedia.js polyfill
          https://github.com/paulirish/matchMedia.js
    */

    /*
        [FIX] for Firefox/Gecko browsers that lose reference to the
        MediaQueryList object unless it's being stored for runtime
    */

    Janus.prototype._mediaList = {};

    Janus.prototype._window_matchmedia = function(mediaQuery) {
      if (window.matchMedia) {
        return this._mediaList[mediaQuery] = window.matchMedia(mediaQuery);
      }
      /*
            [POLYFILL] for all browsers that don't support matchMedia() at all (CSS media query support is mandatory though)
      */
      if (!this._listening) this._listen();
      if (!this._mediaList[mediaQuery]) {
        this._mediaList[mediaQuery] = new _matchMedia(mediaQuery);
      }
      return this._mediaList[mediaQuery];
    };

    Janus.prototype._listen = function() {
      var evt,
        _this = this;
      evt = window.attachEvent || window.addEventListener;
      evt('resize', function() {
        var mediaList, mediaQuery, _ref, _results;
        _ref = _this._mediaList;
        _results = [];
        for (mediaQuery in _ref) {
          mediaList = _ref[mediaQuery];
          _results.push(mediaList._process());
        }
        return _results;
      });
      evt('orientationChange', function() {
        var mediaList, mediaQuery, _ref, _results;
        _ref = _this._mediaList;
        _results = [];
        for (mediaQuery in _ref) {
          mediaList = _ref[mediaQuery];
          _results.push(mediaList._process());
        }
        return _results;
      });
      return this._listening = true;
    };

    /*
        [FIX] for Webkit engines that only trigger MediaQueryListListener when
        there is at least one CSS selector for the respective media query
    */

    Janus.prototype._add_css_for = function(mediaQuery) {
      if (!this.style) {
        this.style = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(this.style);
      }
      return this.style.appendChild(document.createTextNode("@media " + mediaQuery + " {.janus-test{}}"));
    };

    return Janus;

  })();

  /*
    [FIX]/implementation of the matchMedia interface modified to work as a drop-in replacement for Janus
  */

  _matchMedia = (function() {

    _matchMedia.prototype._callbacks = [];

    _matchMedia.prototype.media = '';

    _matchMedia.prototype.matches = false;

    function _matchMedia(media) {
      this.media = media;
      this.matches = this._matches();
    }

    _matchMedia.prototype.addListener = function(listener) {
      return this._callbacks.push(listener);
    };

    _matchMedia.prototype._process = function() {
      var callback, current, _i, _len, _ref, _results;
      current = this._matches();
      if (this.matches === current) return;
      this.matches = current;
      _ref = this._callbacks;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback(this));
      }
      return _results;
    };

    _matchMedia.prototype._matches = function() {
      if (!this._test) {
        this._test = document.createElement('div');
        this._test.id = 'janus-mq-test';
        this._test.style.cssText = 'position:absolute;top:-100em';
        document.body.insertBefore(this._test, document.body.firstChild);
      }
      this._test.innerHTML = '&shy;<style media="' + this.media + '">#janus-mq-test{width:42px;}</style>';
      this._test.removeChild(this._test.firstChild);
      return this._test.offsetWidth === 42;
    };

    return _matchMedia;

  })();

}).call(this);
