#
# show current dimension for better debugging
#
$('.dimensions').html( 'Width: ' + $(window).width() + 'px')

$(window).resize () ->
  $('.dimensions').html( 'Width: ' + $(this).width() + 'px')


qry1 = Harvey.attach('screen and (min-width:600px) and (max-width:900px)',
  setup: () ->
    console.log 'SETUP', this.condition
  on: () ->
    console.log 'ON', this.condition
  off: () ->
    console.log 'OFF', this.condition
)

qry2 = Harvey.attach('screen and (max-width:800px)',
  setup: () ->
    console.log 'SETUP', this.condition
  on: () ->
    console.log 'ON', this.condition
  off: () ->
    console.log 'OFF', this.condition
)

qry3 = Harvey.attach('screen and (max-width:500px)',
  setup: () ->
    console.log 'SETUP', this.condition
  on: () ->
    console.log 'ON', this.condition
  off: () ->
    console.log 'OFF', this.condition
)
