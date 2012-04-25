(function() {
  var janus;

  janus = new Janus;

  janus.attach('screen and (max-width:600px)', function() {
    return console.log('setup');
  }, function() {
    return console.log('on');
  }, function() {
    return console.log('off');
  });

  janus.start();

}).call(this);
