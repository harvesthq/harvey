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

  states : {}
  started: no


  attach: (mediaQuery, callback_setup, callback_on, callback_off) ->

    @states[mediaQuery] = [] unless @states.hasOwnProperty mediaQuery

    @states[mediaQuery].push new State(mediaQuery, callback_setup, callback_on, callback_off)


  detach: () ->



  start: () ->

    return if @started

    @started = yes


    for mediaQuery, list of @states
      window.matchMedia(mediaQuery).addListener( (mql) =>
        return unless @started
      )


  stop: () ->
    @started = no
