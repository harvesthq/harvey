var deviceCheck = function(){
	var device = $('.device');
	var orientation = $('.orientation');
	var orientSpan = $('.orientation span');

	if ($(window).width() < 320) {
		device.html('Smartphones');
		orientation.show();
		orientSpan.html('Portrait');
	} else if ( 320 <= $(window).width() && $(window).width() < 480) {
		device.html('Smartphones');
		orientation.show();
		orientSpan.html('Portrait & Landscape');
	} else if (480 <= $(window).width() && $(window).width() < 768) {
		device.html('Smartphones');
		orientation.show();
		orientSpan.html('Mainly Landscape');
	} else if ( 768 <= $(window).width() && $(window).width() < 960) {
		device.html('Tablet');
		orientation.show();
		orientSpan.html('Portrait & Landscape');
	} else if (960 <= $(window).width() && $(window).width() < 1224) {
		device.html('Desktop Screen and some Tablets');
		orientation.show();
		orientSpan.html('Landscape (Tablets)');
	} else if (1224 < $(window).width() && $(window).width() < 1824) {
		device.html('Wider Desktop Screens');
		orientation.hide();
	} else if ($(window).width() >= 1824) {
		device.html('Large screens');
	} else {
		console.log('Sorry, this screen size does not seem to be standard');
	}
};


deviceCheck();
$(window).resize(function() {
	deviceCheck();    
});




