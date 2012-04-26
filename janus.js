
/*

  Janus StateManager — Copyright (c) 2012 Joschka Kintscher
*/

(function() {
  var State;

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
        if (!this.mediaList.hasOwnProperty(mediaQuery)) {
          _results.push(this._register_query(mediaQuery));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Janus.prototype.stop = function() {
      return this.started = false;
    };

    Janus.prototype._register_query = function(mediaQuery) {
      var _this = this;
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
    
        * Using a coffeescript port of Paul Irish's matchMedia.js polyfill
    */

    /*
        FIX for Firefox/Gecko browsers that lose reference to the
        MediaQueryList object unless it's being stored for runtime
    */

    Janus.prototype.mediaList = {};

    Janus.prototype._window_matchmedia = function(mediaQuery) {
      return this.mediaList[mediaQuery] = window.matchMedia(mediaQuery);
    };

    /*
        FIX for Webkit engines that only trigger MediaQueryListListener when
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

}).call(this);
