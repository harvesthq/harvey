#
# show current dimension for better debugging
#
$('.dimensions').html( 'Width: ' + $(window).width() + 'px')

$(window).resize () ->
  $('.dimensions').html( 'Width: ' + $(this).width() + 'px')


janus = new Janus


qry1 = janus.attach('screen and (min-width:600px) and (max-width:900px)',
() ->
  console.log 'SETUP', this.condition
() ->
  console.log 'ON', this.condition
() ->
  console.log 'OFF', this.condition
)

qry2 = janus.attach('screen and (max-width:800px)',
() ->
  console.log 'SETUP', this.condition
() ->
  console.log 'ON', this.condition
() ->
  console.log 'OFF', this.condition
)


qry3 = janus.attach('screen and (max-width:500px)',
() ->
  console.log 'SETUP', this.condition
() ->
  console.log 'ON', this.condition
() ->
  console.log 'OFF', this.condition
)



janus.start()