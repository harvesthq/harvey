###

  StateManager

    watch

###

class State

  constructor: (@condition, @setup, @on, @off) ->

    @is_setup = no




class StateManager

  @states = []
  @active = no


  attach: () ->


  detach: () ->



  start: () ->
    console.log "Start listening for onResize and onOrientationChange"
    @active = yes

  stop: () ->
    console.log "Stop this"
    @active = no


  _test: () ->
