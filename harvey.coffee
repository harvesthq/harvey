###

  Harvey, A Second Face for Your Application's JavaScript

  Copyright 2012, Joschka Kintscher
  Released under the MIT License

  https://github.com/harvesthq/harvey/

###
class this.Harvey

  # Hash of all currently attached media queries and their corresponding states
  @states : {}


  ###
    Creates a new State object for the given media query using the passed hash
    of callbacks and stores it in @states. The passed hash may contain up to
    three callbacks. See documentation of the State class for more information.
  ###
  @attach: (mediaQuery, callbacks) ->

    unless @states.hasOwnProperty mediaQuery
      @states[mediaQuery] = []
      @_add_css_for(mediaQuery) # @TODO if userAgent is webkit (to avoid additional DOM manipulation)

    state = new State(mediaQuery, callbacks?.setup, callbacks?.on, callbacks?.off)

    # create a new listener for this query in case there is none already
    @_watch_query(mediaQuery) unless @states[mediaQuery].length

    @states[mediaQuery].push(state)

    # check whether the new State is valid at the moment and set it up
    @_update_states([state], yes) if @_window_matchmedia(mediaQuery).matches

    # return the new state object
    state


  ###
    Removes a given State object from the @states hash.

    @param  object  state  A valid state object
  ###
  @detach: (state) ->

    for s, i in @states[state.condition]
      @states[s.condition][i] = undefined if state is s


  ###
    Create a new matchMediaListener for the passed media query.

    @param  string  mediaQuery  A valid CSS media query to watch
  ###
  @_watch_query: (mediaQuery) ->

    @_window_matchmedia(mediaQuery).addListener((mql) =>
      @_update_states(@states[mediaQuery], mql.matches)
    )


  ###
    Activates/Deactivates every State object in the passed list.

    @param  array   states  A list of State objects to update
    @param  boolean active Whether to activate or deactivate the given states
  ###
  @_update_states: (states, active) ->

    for state in states      
      if active then state.activate() else state.deactivate()



  ###
    BEWARE: You're at the edge of the map, mate. Here there be monsters!

    ------------------------------------------------------------------------------------

    Private methods to fix and polyfill the matchMedia interface for several engines

    * Inspired by Nicholas C. Zakas' article on the different problems with matchMedia
      http://www.nczonline.net/blog/2012/01/19/css-media-queries-in-javascript-part-2/

    * Implementing a modified coffeescript version of Scott Jehl's and Paul Irish's matchMedia.js polyfill
      https://github.com/paulirish/matchMedia.js
  ###


  ###
    [FIX] for Firefox/Gecko browsers that lose reference to the
          MediaQueryList object unless it's being stored for runtime.
  ###
  @_mediaList: {}

  ###
    @param  string  mediaQuery      A valid CSS media query to monitor for updates
    @Return object  MediaQueryList  Depending on the browser and matchMedia support either a native
                                    mediaQueryList object or an instance of _mediaQueryList
  ###
  @_window_matchmedia: (mediaQuery) ->

    # always try to use the native matchMedia interface where available!
    if window.matchMedia
      @_mediaList[mediaQuery] = window.matchMedia(mediaQuery) if mediaQuery not of @_mediaList
      return @_mediaList[mediaQuery]


    ###
      [POLYFILL] for all browsers that don't support matchMedia() at all (CSS media query support
                 is still mandatory though).
    ###

    # use other available window events to listen for update on the viewport
    @_listen() unless @_listening

    @_mediaList[mediaQuery] = new _mediaQueryList(mediaQuery) if mediaQuery not of @_mediaList

    # return the corresponding object from _mediaQueryList
    @_mediaList[mediaQuery]


  ###
    Add resize and orientationChange event listeners to the window element
    to monitor updates to the viewport
  ###
  @_listen: () ->

    evt = window.addEventListener || window.attachEvent

    evt 'resize', () =>
      mediaList._process() for mediaQuery, mediaList of @_mediaList

    evt 'orientationChange', () =>
      mediaList._process() for mediaQuery, mediaList of @_mediaList

    @_listening = yes



  ###
    [FIX] for Webkit engines that only trigger the MediaQueryListListener
          when there is at least one CSS selector for the respective media query

    @param  string  MediaQuery  The media query to inject CSS for
  ###
  @_add_css_for: (mediaQuery) ->

    unless @style
      @style = document.createElement('style')
      @style.setAttribute('type', 'text/css')
      document.getElementsByTagName('head')[0].appendChild(@style)

    mediaQuery = "@media #{mediaQuery} {.harvey-test{}}"

    unless @style.styleSheet
      @style.appendChild(document.createTextNode(mediaQuery))


###
  A State allows to execute a set of callbacks for the given valid CSS media query.

  Callbacks are executed in the context of their state object to allow access to the
  corresponding media query of the State.

  States are not exposed to the global namespace. They can be used by calling the
  static Harvey.attach() and Harvey.detach() methods.
###
class State

  # Whether this State is active or inactive at the moment
  active  : no

  # Whether this State has been set up
  is_setup: no


  ###
    Creates a new State object

    @param  string    condition The media query to check for
    @param  function  setup     Called the first time `condition` becomes valid
    @param  function  on        Called every time `condition` becomes valid
    @param  function  off       Called every time `condition` becomes invalid
  ###
  constructor: (@condition, @setup, @on, @off) ->


  ###
    Activate this State object if it is currently deactivated. Also perform all
    set up tasks if this is the first time the State is activated
  ###
  activate: () ->

    return if @active

    unless @is_setup
      @setup?()
      @is_setup = yes

    @on?()
    @active = yes


  ###
    Deactive this State object if it is currently active
  ###
  deactivate: () ->

    return unless @active

    @off?()
    @active = no



###
  [FIX] simple implemenation of the matchMedia interface to mimic the native
        matchMedia interface behaviour to work as a polyfill for Harvey
###
class _mediaQueryList

  ###
    Creates a new _mediaQueryList object

    @param  string  media  A valid CSS media query
  ###
  constructor: (@media) ->

    # A list of all listeners that are attached this media query
    @_listeners = []

    # Stores whether the registered media query is currently valid or not
    @matches = @_matches()


  ###
    Add a new listener to this mediaQueryList that will be called every time
    the media query becomes valid
  ###
  addListener: (listener) ->

    @_listeners.push(listener)

    # return undefined just like the native addListener method
    undefined


  ###
    Evaluate the media query of this mediaQueryList object and notify
    all registered listeners if the state has changed
  ###
  _process: () ->

    current = @_matches()
    return if @matches is current

    @matches = current
    callback(this) for callback in @_listeners


  ###
    Check whether the media query is currently valid
  ###
  _matches: () ->
    @_get_tester() unless @_tester

    # Replace all contents of the tester element with a CSS represenation of the media query
    @_tester.innerHTML = '&shy;<style media="' + @media + '">#harvey-mq-test{width:42px;}</style>'

    # Fix for browsers that won't process a <style> tag as the first child of a non <head>-element 
    @_tester.removeChild(@_tester.firstChild)

    # Return whether the media query affected the test element (matches) or not (doesn't match)
    @_tester.offsetWidth is 42


  ###
    Retrieve the element to test the media query on from the DOM or create
    it if it has not been injected into the page yet
  ###
  _get_tester: () ->
    @_tester = document.getElementById('harvey-mq-test')
    @_build_tester() unless @_tester


  ###
    Create a new div with a unique id, move it outsite of the viewport and inject it into the DOM.
    This element will be used to check whether the registered media query is currently valid.
  ###
  _build_tester: () ->
    @_tester = document.createElement('div')
    @_tester.id = 'harvey-mq-test'
    @_tester.style.cssText = 'position:absolute;top:-100em'
    document.body.insertBefore(@_tester, document.body.firstChild)

