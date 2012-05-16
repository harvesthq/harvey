
/*

  Harvey StateManager — Copyright (c) 2012 Joschka Kintscher
*/

(function() {
  var State, _mediaQueryList,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  this.Harvey = (function() {

    function Harvey() {}

    Harvey.states = {};

    Harvey.queries = [];

    Harvey.attach = function(mediaQuery, callbacks) {
      var state;
      if (!this.states.hasOwnProperty(mediaQuery)) {
        this.states[mediaQuery] = [];
        this._add_css_for(mediaQuery);
      }
      state = new State(mediaQuery, callbacks != null ? callbacks.setup : void 0, callbacks != null ? callbacks.on : void 0, callbacks != null ? callbacks.off : void 0);
      this.states[mediaQuery].push(state);
      if (__indexOf.call(this.queries, mediaQuery) < 0) {
        this._watch_query(mediaQuery);
      }
      if (this._window_matchmedia(mediaQuery).matches) {
        this._update_states([states], true);
      }
      return state;
    };

    Harvey.detach = function(state) {
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

    Harvey._watch_query = function(mediaQuery) {
      var _this = this;
      this.queries.push(mediaQuery);
      return this._window_matchmedia(mediaQuery).addListener(function(mql) {
        return _this._update_states(_this.states[mediaQuery], mql.matches);
      });
    };

    Harvey._update_states = function(states, active) {
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
    
        BEWARE: You're at the edge of the map, mate. Here there be monsters!
    
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

    Harvey._mediaList = {};

    Harvey._window_matchmedia = function(mediaQuery) {
      if (window.matchMedia) {
        if (!(mediaQuery in this._mediaList)) {
          this._mediaList[mediaQuery] = window.matchMedia(mediaQuery);
        }
        return this._mediaList[mediaQuery];
      }
      /*
            [POLYFILL] for all browsers that don't support matchMedia() at all (CSS media query support is mandatory though)
      */
      if (!this._listening) this._listen();
      if (!(mediaQuery in this._mediaList)) {
        this._mediaList[mediaQuery] = new _mediaQueryList(mediaQuery);
      }
      return this._mediaList[mediaQuery];
    };

    Harvey._listen = function() {
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
        [FIX] for Webkit engines that only trigger the MediaQueryListListener
        when there is at least one CSS selector for the respective media query
    */

    Harvey._add_css_for = function(mediaQuery) {
      if (!this.style) {
        this.style = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(this.style);
      }
      return this.style.appendChild(document.createTextNode("@media " + mediaQuery + " {.harvey-test{}}"));
    };

    return Harvey;

  })();

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
        if (typeof this.setup === "function") this.setup();
        this.is_setup = true;
      }
      if (typeof this.on === "function") this.on();
      return this.active = true;
    };

    State.prototype.deactivate = function() {
      if (!this.active) return;
      if (typeof this.off === "function") this.off();
      return this.active = false;
    };

    return State;

  })();

  /*
    [FIX]/mimic of the matchMedia interface modified to work as a drop-in replacement for Harvey
  */

  _mediaQueryList = (function() {

    function _mediaQueryList(media) {
      this.media = media;
      this._callbacks = [];
      this.matches = this._matches();
    }

    _mediaQueryList.prototype.addListener = function(listener) {
      this._callbacks.push(listener);
      return;
    };

    _mediaQueryList.prototype._process = function() {
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

    _mediaQueryList.prototype._matches = function() {
      if (!this._test) this._test = document.getElementById('harvey-mq-test');
      if (!this._test) {
        this._test = document.createElement('div');
        this._test.id = 'harvey-mq-test';
        this._test.style.cssText = 'position:absolute;top:-100em';
        document.body.insertBefore(this._test, document.body.firstChild);
      }
      this._test.innerHTML = '&shy;<style media="' + this.media + '">#harvey-mq-test{width:42px;}</style>';
      this._test.removeChild(this._test.firstChild);
      return this._test.offsetWidth === 42;
    };

    return _mediaQueryList;

  })();

}).call(this);
