
/*

  Janus StateManager — Copyright (c) 2012 Joschka Kintscher
*/

(function() {
  var State;

  State = (function() {

    State.prototype.active = false;

    function State(condition, setup, on, off) {
      this.condition = condition;
      this.setup = setup;
      this.on = on;
      this.off = off;
      this.is_setup = false;
    }

    State.prototype.on = function() {
      if (!this.is_setup) this.setup();
      return this.on();
    };

    State.prototype.off = function() {
      return this.off();
    };

    return State;

  })();

  this.Janus = (function() {

    function Janus() {}

    Janus.prototype.mediaList = [];

    Janus.prototype.states = {};

    Janus.prototype.started = false;

    Janus.prototype.attach = function(mediaQuery, callback_setup, callback_on, callback_off) {
      if (!this.states.hasOwnProperty(mediaQuery)) {
        this.states[mediaQuery] = [];
        this._add_css_for(mediaQuery);
      }
      return this.states[mediaQuery].push(new State(mediaQuery, callback_setup, callback_on, callback_off));
    };

    Janus.prototype.detach = function() {};

    Janus.prototype.start = function() {
      var list, mediaQuery, _ref, _results,
        _this = this;
      if (this.started) return;
      this.started = true;
      _ref = this.states;
      _results = [];
      for (mediaQuery in _ref) {
        list = _ref[mediaQuery];
        this.mediaList[mediaQuery] = window.matchMedia(mediaQuery);
        _results.push(this.mediaList[mediaQuery].addListener(function(mql) {
          if (!_this.started) {}
        }));
      }
      return _results;
    };

    Janus.prototype.stop = function() {
      return this.started = false;
    };

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
