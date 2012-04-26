###

  Janus StateManager — Copyright (c) 2012 Joschka Kintscher

###

class State

  active  : no
  is_setup: no


  constructor: (@condition, @setup, @on, @off) ->


  activate: () ->
    return if @active

    unless @is_setup
      @setup()
      @is_setup = yes

    @on()
    @active = yes

  deactivate: () ->
    return unless @active

    @off()
    @active = no




class this.Janus

  states   : {}
  started  : no


  attach: (mediaQuery, callback_setup, callback_on, callback_off) ->

    unless @states.hasOwnProperty mediaQuery
      @states[mediaQuery] = []
      @_add_css_for(mediaQuery) # if userAgent is webkit

    state = new State(mediaQuery, callback_setup, callback_on, callback_off)
    @states[mediaQuery].push(state)

    state


  detach: (state) ->
    for t, i in @states[state.condition]
      @states[t.condition][i] = undefined if state is t



  start: () ->

    return if @started
    @started = yes

    for mediaQuery of @states
      @_register_query(mediaQuery) unless @mediaList.hasOwnProperty mediaQuery


  stop: () ->
    @started = no


  _register_query: (mediaQuery) ->

    @_window_matchmedia(mediaQuery).addListener( (mql) =>
      return unless @started

      change = if mql.matches then 'activate' else 'deactivate'

      state[change]() for state in @states[mediaQuery]
    )



  ###

    Private methods to fix and polyfill the matchMedia interface for several engines

    * Inspired by Nicholas C. Zakas' article on the different problems with matchMedia
      http://www.nczonline.net/blog/2012/01/19/css-media-queries-in-javascript-part-2/

    * Using a coffeescript port of Paul Irish's matchMedia.js polyfill

  ###


  ###
    FIX for Firefox/Gecko browsers that lose reference to the
    MediaQueryList object unless it's being stored for runtime
  ###
  mediaList: {}

  _window_matchmedia: (mediaQuery) ->
    @mediaList[mediaQuery] = window.matchMedia(mediaQuery)


  ###
    FIX for Webkit engines that only trigger MediaQueryListListener when
    there is at least one CSS selector for the respective media query
  ###
  _add_css_for: (mediaQuery) ->

    unless @style
      @style = document.createElement('style')
      document.getElementsByTagName('head')[0].appendChild(@style)

    @style.appendChild(document.createTextNode("@media #{mediaQuery} {.janus-test{}}"))


