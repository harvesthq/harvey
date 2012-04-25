###

  Janus StateManager — Copyright (c) 2012 Joschka Kintscher

###

class State

  active: no

  constructor: (@condition, @setup, @on, @off) ->
    @is_setup = no

  on: () ->
    @setup() unless @is_setup
    @on()

  off: () ->
    @off()



class this.Janus

  mediaList: []
  states   : {}
  started  : no


  attach: (mediaQuery, callback_setup, callback_on, callback_off) ->

    unless @states.hasOwnProperty mediaQuery
      @states[mediaQuery] = []
      @_add_css_for(mediaQuery) # if userAgent is webkit

    @states[mediaQuery].push new State(mediaQuery, callback_setup, callback_on, callback_off)


  detach: () ->



  start: () ->

    return if @started
    @started = yes

    for mediaQuery, list of @states
      # chache MediaQueryList object for Firefox/Gecko
      @mediaList[mediaQuery] = window.matchMedia(mediaQuery)

      @mediaList[mediaQuery].addListener( (mql) =>
        return unless @started
      )


  stop: () ->
    @started = no


  # fix for Webkit engines
  _add_css_for: (mediaQuery) ->

    unless @style
      @style = document.createElement('style')
      document.getElementsByTagName('head')[0].appendChild(@style)

    @style.appendChild(document.createTextNode("@media #{mediaQuery} {.janus-test{}}"))


