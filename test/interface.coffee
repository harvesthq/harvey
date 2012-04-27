
janus = new Janus


qry1 = janus.attach('screen and (min-width:500px) and (max-width:900px)',
() ->
  console.log 'SETUP', this.condition
() ->
  console.log 'ON', this.condition
() ->
  console.log 'OFF', this.condition
)


janus.start()
