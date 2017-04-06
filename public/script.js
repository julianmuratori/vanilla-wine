'use strict';

var wineApp = {};

wineApp.apiKey = '2b72bf53d75160535f54fa07986c65dc';
wineApp.endpoint = 'http://services.wine.com/api/beta2/service.svc/JSON/reference?';

wineApp.init = function () {
	wineApp.getSubject();
};

// Grabs the initial category selection from the user
wineApp.getSubject = function () {
	$('.category').on('submit', function (e) {
		e.preventDefault();
		var selection = $('input:checked').val();

		if (selection === undefined) {
			alert('Please select a category');
		} else {
			var category = wineApp.returnSubject(selection);
			$.when(category).then(function (data) {
				data = data.Books;
				console.log(data);
			});
		}
	});
};

// Makes an AJAX request for whichever category has been selected and adds introductory info on to the page

wineApp.returnSubject = function (selection) {
	return $.ajax({
		url: '' + wineApp.endpoint,
		method: 'GET',
		dataType: 'json',
		data: {
			filter: 'categories(' + selection + ')',
			apikey: '' + wineApp.apiKey
		}

	});
};
// .then(function(data) {
// 	data = data.Books;
// 	console.log(data);


$(wineApp.init);