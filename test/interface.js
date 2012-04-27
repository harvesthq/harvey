(function() {
  var janus, qry1, qry2, qry3;

  $('.dimensions').html('Width: ' + $(window).width() + 'px');

  $(window).resize(function() {
    return $('.dimensions').html('Width: ' + $(this).width() + 'px');
  });

  janus = new Janus;

  qry1 = janus.attach('screen and (min-width:600px) and (max-width:900px)', function() {
    return console.log('SETUP', this.condition);
  }, function() {
    return console.log('ON', this.condition);
  }, function() {
    return console.log('OFF', this.condition);
  });

  qry2 = janus.attach('screen and (max-width:800px)', function() {
    return console.log('SETUP', this.condition);
  }, function() {
    return console.log('ON', this.condition);
  }, function() {
    return console.log('OFF', this.condition);
  });

  qry3 = janus.attach('screen and (max-width:500px)', function() {
    return console.log('SETUP', this.condition);
  }, function() {
    return console.log('ON', this.condition);
  }, function() {
    return console.log('OFF', this.condition);
  });

  janus.start();

}).call(this);
