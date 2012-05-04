(function() {
  var qry1, qry2, qry3;

  $('.dimensions').html('Width: ' + $(window).width() + 'px');

  $(window).resize(function() {
    return $('.dimensions').html('Width: ' + $(this).width() + 'px');
  });

  qry1 = Janus.attach('screen and (min-width:600px) and (max-width:900px)', {
    setup: function() {
      return console.log('SETUP', this.condition);
    },
    on: function() {
      return console.log('ON', this.condition);
    },
    off: function() {
      return console.log('OFF', this.condition);
    }
  });

  qry2 = Janus.attach('screen and (max-width:800px)', {
    setup: function() {
      return console.log('SETUP', this.condition);
    },
    on: function() {
      return console.log('ON', this.condition);
    },
    off: function() {
      return console.log('OFF', this.condition);
    }
  });

  qry3 = Janus.attach('screen and (max-width:500px)', {
    setup: function() {
      return console.log('SETUP', this.condition);
    },
    on: function() {
      return console.log('ON', this.condition);
    },
    off: function() {
      return console.log('OFF', this.condition);
    }
  });

}).call(this);
