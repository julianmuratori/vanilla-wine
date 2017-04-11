'use strict';

var wineApp = {};
var categoryIds = [];

wineApp.apiKey = '2b72bf53d75160535f54fa07986c65dc';
wineApp.endpoint = 'http://services.wine.com/api/beta2/service.svc/JSON/reference?';

wineApp.init = function () {
	wineApp.grabInitialIds();
	wineApp.getStyle();
};

// Stores initial wine type ids in an array so that if the user clicks "start over"
// the page can be easily repopulated
wineApp.grabInitialIds = function () {
	$('.button').each(function (i, obj) {
		var eachId = $(obj).attr('id');
		eachId = parseInt(eachId, 10);
		categoryIds.push(eachId);
	});
};

// Grabs the initial category selection from the user
wineApp.getStyle = function () {
	$('.category').on('submit', function (e) {
		e.preventDefault();
		var selection = $('input:checked').val();

		if (selection === undefined) {
			alert('Please select a category');
		} else {
			console.log(selection);
			var category = wineApp.returnStyle(selection);
			$.when(category).then(function (results) {
				console.log(results);
				wineApp.resultsCondense(results);
			});
		}
	});
};

// Takes grape names and associated ids and converts them to key-value pairs

wineApp.resultsCondense = function (results) {
	results = results.Books[1].Articles;
	var resultsName = results.map(function (varietals) {
		return varietals.Title;
	});
	var resultsId = results.map(function (varietals) {
		return varietals.Id;
	});
	var resultPairs = {};
	resultsName.forEach(function (key, idx) {
		return resultPairs[key] = resultsId[idx];
	});

	wineApp.grapeOptions(resultPairs);
};

// Makes an AJAX request for whichever category has been selected and adds introductory info on to the page

wineApp.returnStyle = function (selection) {
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

// Appends grape varietals to the page and allows the user to make their choice

wineApp.grapeOptions = function (resultPairs) {
	wineApp.form();

	for (var key in resultPairs) {
		$("form").append('<input type="radio" name="categories" id="' + resultPairs[key] + '">' + key);
	}

	$("form").append('<input type="submit" id="submitButton" class="button" value="Submit">').append('<input type="submit" id="startOver" class="button" value="Start Over">');

	wineApp.startOver();
	wineApp.grapeChoice();
};

wineApp.grapeChoice = function () {
	$("#submitButton").on("click", function (e) {
		e.preventDefault();
	});
};

// Controls the button to start from the beginning

wineApp.startOver = function () {
	$("#startOver").on("click", function (e) {
		e.preventDefault();
		wineApp.form();
		var returns = [];
		var queries = categoryIds.forEach(function (i) {
			var choice = wineApp.originalChoices(i);
			$.when(choice).then(function (results) {
				// returns.push(results);
				var names = results.Books[0].Articles[0].Title;
				var ids = results.Books[0].Articles[0].Id;
				$("form").prepend('<input type="radio" name="categories" id="' + ids + '" value="' + ids + '">' + names);
			});
		});
		$("form").append('<input type="submit" id="submitButton" class="button" value="Submit">');
		wineApp.getStyle();
	});
};

// Makes AJAX call to repopulate original wine options
wineApp.originalChoices = function (i) {
	return $.ajax({
		url: '' + wineApp.endpoint,
		method: 'GET',
		dataType: 'json',
		data: {
			filter: 'categories(' + i + ')',
			apikey: '' + wineApp.apiKey
		}
	});
};

wineApp.form = function () {
	$("form").remove();
	$("main").append('<form class="category">');
};

$(wineApp.init);