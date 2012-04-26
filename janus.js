
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
        var change, state, _i, _len, _ref, _results;
        if (!_this.started) return;
        change = mql.matches ? 'activate' : 'deactivate';
        _ref = _this.states[mediaQuery];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          state = _ref[_i];
          _results.push(state[change]());
        }
        return _results;
      });
    };

    /*
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
      if (!this._matchMedia) this._matchMedia = new _matchMedia(this);
      return this._matchMedia.nextQuery(mediaQuery);
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

    _matchMedia.prototype.media_list = {};

    function _matchMedia(ref) {
      var _this = this;
      this.ref = ref;
      window.addEventListener('resize', function() {
        return _this._process();
      });
      window.addEventListener('orientationChange', function() {
        return _this._process();
      });
    }

    _matchMedia.prototype.addListener = function(listener) {
      if (!this.media_list[this.next_query]) {
        this.media_list[this.next_query] = {
          callbacks: [],
          result: false
        };
      }
      return this.media_list[this.next_query].callbacks.push(listener);
    };

    _matchMedia.prototype.nextQuery = function(next_query) {
      this.next_query = next_query;
      return this;
    };

    _matchMedia.prototype._process = function() {
      var callback, list, mediaQuery, result, _ref, _results;
      _ref = this.media_list;
      _results = [];
      for (mediaQuery in _ref) {
        list = _ref[mediaQuery];
        result = this._match_media(mediaQuery);
        if (result === list.result) continue;
        list.result = result;
        _results.push((function() {
          var _i, _len, _ref2, _results2;
          _ref2 = list.callbacks;
          _results2 = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            callback = _ref2[_i];
            _results2.push(callback({
              matches: result,
              media: mediaQuery
            }));
          }
          return _results2;
        })());
      }
      return _results;
    };

    _matchMedia.prototype._match_media = function(mediaQuery) {
      if (!this._test) {
        this._test = document.createElement('div');
        this._test.id = 'janus-mq-test';
        this._test.style.cssText = 'position:absolute;top:-100em';
        document.body.insertBefore(this._test, document.body.firstChild);
      }
      this._test.innerHTML = '&shy;<style media="' + mediaQuery + '">#janus-mq-test{width:42px;}</style>';
      this._test.removeChild(this._test.firstChild);
      return this._test.offsetWidth === 42;
    };

    return _matchMedia;

  })();

}).call(this);
