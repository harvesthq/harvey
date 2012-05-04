#
# show current dimension for better debugging
#
$('.dimensions').html( 'Width: ' + $(window).width() + 'px')

$(window).resize () ->
  $('.dimensions').html( 'Width: ' + $(this).width() + 'px')


qry1 = Janus.attach('screen and (min-width:600px) and (max-width:900px)',
() ->
  console.log 'SETUP', this.condition
() ->
  console.log 'ON', this.condition
() ->
  console.log 'OFF', this.condition
)
$('.media-queries').append('<li>screen and (min-width:600px) and (max-width:900px)</li>')


qry2 = Janus.attach('screen and (max-width:800px)',
() ->
  console.log 'SETUP', this.condition
() ->
  console.log 'ON', this.condition
() ->
  console.log 'OFF', this.condition
)
$('.media-queries').append('<li>screen and (max-width:800px)</li>')


qry3 = Janus.attach('screen and (max-width:500px)',
() ->
  console.log 'SETUP', this.condition
() ->
  console.log 'ON', this.condition
() ->
  console.log 'OFF', this.condition
)
$('.media-queries').append('<li>screen and (max-width:500px)</li>')


Janus.start()