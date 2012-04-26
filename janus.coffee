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
  queries  : []
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
      @_watch_query(mediaQuery) unless mediaQuery in @queries


  stop: () ->

    @started = no



  _watch_query: (mediaQuery) ->

    @queries.push(mediaQuery)

    @_window_matchmedia(mediaQuery).addListener( (mql) =>
      return unless @started

      change = if mql.matches then 'activate' else 'deactivate'

      state[change]() for state in @states[mediaQuery]
    )



  ###
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
  _mediaList : {}

  _window_matchmedia: (mediaQuery) ->

    return @_mediaList[mediaQuery] = window.matchMedia(mediaQuery) if window.matchMedia

    # [POLYFILL] for all browsers that don't support matchMedia()
    @_matchMedia = new _matchMedia(this) unless @_matchMedia
    @_matchMedia.nextQuery(mediaQuery)


  ###
    [FIX] for Webkit engines that only trigger MediaQueryListListener when
    there is at least one CSS selector for the respective media query
  ###
  _add_css_for: (mediaQuery) ->

    unless @style
      @style = document.createElement('style')
      document.getElementsByTagName('head')[0].appendChild(@style)

    @style.appendChild(document.createTextNode("@media #{mediaQuery} {.janus-test{}}"))



###
  [FIX]/implementation of the matchMedia interface modified to work as a drop-in replacement for Janus
###
class _matchMedia

  media_list: {}


  constructor: (@ref) ->

    evt = window.attachEvent || window.addEventListener

    evt('resize',            () => @_process())
    evt('orientationChange', () => @_process())


  # Mimic the native MediaQueryList.addListener() behaviour for @next_query
  addListener: (listener) ->

    @media_list[@next_query] = {callbacks: [], result: no} unless @media_list[@next_query]

    @media_list[@next_query].callbacks.push(listener)


  # Store the query that the next listener will be assigned to
  nextQuery: (@next_query) ->
    this


  _process: () ->

    for mediaQuery, list of @media_list

      result = @_match_media(mediaQuery)
      continue if result is list.result

      list.result = result
      callback({ matches: result, media: mediaQuery }) for callback in list.callbacks


  _match_media: (mediaQuery) ->

    unless @_test
      @_test = document.createElement('div')
      @_test.id = 'janus-mq-test'
      @_test.style.cssText = 'position:absolute;top:-100em'
      document.body.insertBefore(@_test, document.body.firstChild)

    @_test.innerHTML = '&shy;<style media="' + mediaQuery + '">#janus-mq-test{width:42px;}</style>'
    @_test.removeChild(@_test.firstChild)

    @_test.offsetWidth is 42
