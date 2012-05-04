###

  Janus StateManager — Copyright (c) 2012 Joschka Kintscher

###
class this.Janus

  @states   : {}
  @queries  : []


  @attach: (mediaQuery, callbacks) ->

    unless @states.hasOwnProperty mediaQuery
      @states[mediaQuery] = []
      @_add_css_for(mediaQuery) # if userAgent is webkit to avoid extra DOM manipulation

    state = new State(mediaQuery, callbacks.setup, callbacks.on, callbacks.off)
    @states[mediaQuery].push(state)

    @_watch_query(mediaQuery) unless mediaQuery in @queries
    @_update_states([states], yes) if @_window_matchmedia(mediaQuery).matches

    state


  @detach: (state) ->

    for t, i in @states[state.condition]
      @states[t.condition][i] = undefined if state is t


  @_watch_query: (mediaQuery) ->

    @queries.push(mediaQuery)

    @_window_matchmedia(mediaQuery).addListener((mql) =>
      @_update_states(@states[mediaQuery], mql.matches)
    )


  @_update_states: (states, active) ->

    for state in states      
      if active then state.activate() else state.deactivate()


  ###

    BEWARE: You're at the edge of the map, mate. Here there be monsters!

    ------------------------------------------------------------------------------------

    Private methods to fix and polyfill the matchMedia interface for several engines

    * Inspired by Nicholas C. Zakas' article on the different problems with matchMedia
      http://www.nczonline.net/blog/2012/01/19/css-media-queries-in-javascript-part-2/

    * Implementing a modified coffeescript version of Paul Irish's matchMedia.js polyfill
      https://github.com/paulirish/matchMedia.js

  ###


  ###
    [FIX] for Firefox/Gecko browsers that lose reference to the
    MediaQueryList object unless it's being stored for runtime
  ###
  @_mediaList : {}

  @_window_matchmedia: (mediaQuery) ->

    if window.matchMedia
      @_mediaList[mediaQuery] = window.matchMedia(mediaQuery) if mediaQuery not of @_mediaList
      return @_mediaList[mediaQuery]


    ###
      [POLYFILL] for all browsers that don't support matchMedia() at all (CSS media query support is mandatory though)
    ###

    # use native window events to wait and listen for changes
    @_listen() unless @_listening

    @_mediaList[mediaQuery] = new _mediaQueryList(mediaQuery) if mediaQuery not of @_mediaList

    # return the corresponding _mediaQueryList object
    @_mediaList[mediaQuery]



  @_listen: () ->

    evt = window.attachEvent || window.addEventListener

    evt 'resize', () =>
      mediaList._process() for mediaQuery, mediaList of @_mediaList

    evt 'orientationChange', () =>
      mediaList._process() for mediaQuery, mediaList of @_mediaList

    @_listening = yes



  ###
    [FIX] for Webkit engines that only trigger MediaQueryListListener when
    there is at least one CSS selector for the respective media query
  ###
  @_add_css_for: (mediaQuery) ->

    unless @style
      @style = document.createElement('style')
      document.getElementsByTagName('head')[0].appendChild(@style)

    @style.appendChild(document.createTextNode("@media #{mediaQuery} {.janus-test{}}"))



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



###
  [FIX]/implementation of the matchMedia interface modified to work as a drop-in replacement for Janus
###
class _mediaQueryList

  constructor: (@media) ->

    @_callbacks = []
    @matches    = @_matches()


  addListener: (listener) ->

    @_callbacks.push(listener)

    # same return value as native addListener method
    undefined


  _process: () ->

    current = @_matches()
    return if @matches is current

    @matches = current
    callback(this) for callback in @_callbacks


  _matches: () ->

    @_test = document.getElementById('janus-mq-test') unless @_test

    unless @_test
      @_test = document.createElement('div')
      @_test.id = 'janus-mq-test'
      @_test.style.cssText = 'position:absolute;top:-100em'
      document.body.insertBefore(@_test, document.body.firstChild)

    @_test.innerHTML = '&shy;<style media="' + @media + '">#janus-mq-test{width:42px;}</style>'
    @_test.removeChild(@_test.firstChild)

    @_test.offsetWidth is 42
