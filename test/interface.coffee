
janus = new Janus


janus.attach('screen and (max-width:600px)',
() ->
  console.log 'setup'
() ->
  console.log 'on'
() ->
  console.log 'off'
)


janus.start()
