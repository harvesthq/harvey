(function() {
  var qry1, qry2, qry3;

  $('.dimensions').html('Width: ' + $(window).width() + 'px');

  $(window).resize(function() {
    return $('.dimensions').html('Width: ' + $(this).width() + 'px');
  });

  qry1 = Janus.attach('screen and (min-width:600px) and (max-width:900px)', function() {
    return console.log('SETUP', this.condition);
  }, function() {
    return console.log('ON', this.condition);
  }, function() {
    return console.log('OFF', this.condition);
  });

  $('.media-queries').append('<li>screen and (min-width:600px) and (max-width:900px)</li>');

  qry2 = Janus.attach('screen and (max-width:800px)', function() {
    return console.log('SETUP', this.condition);
  }, function() {
    return console.log('ON', this.condition);
  }, function() {
    return console.log('OFF', this.condition);
  });

  $('.media-queries').append('<li>screen and (max-width:800px)</li>');

  qry3 = Janus.attach('screen and (max-width:500px)', function() {
    return console.log('SETUP', this.condition);
  }, function() {
    return console.log('ON', this.condition);
  }, function() {
    return console.log('OFF', this.condition);
  });

  $('.media-queries').append('<li>screen and (max-width:500px)</li>');

  Janus.start();

}).call(this);
