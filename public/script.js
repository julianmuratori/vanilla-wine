'use strict';

var wineApp = {};
var categoryIds = [];

wineApp.apiKey = '2b72bf53d75160535f54fa07986c65dc';
wineApp.endpoint = 'http://services.wine.com/api/beta2/service.svc/JSON/reference?';

wineApp.init = function () {
	wineApp.grabInitialIds();
	wineApp.getStyle();
	wineApp.checkBoxHandler();
};

// Makes sure only one checkbox can be checked at a time
wineApp.checkBoxHandler = function () {
	$('input[type="checkbox"]').on('change', function () {
		$('input[type="checkbox"]').not(this).prop('checked', false);
	});
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
			wineApp.loading();
			var category = wineApp.returnStyle(selection);
			$.when(category).then(function (results) {
				wineApp.resultsCondense(results);
			});
		}
	});
};

// Takes grape names and associated ids and converts them to key-value pairs

wineApp.resultsCondense = function (results) {
	console.log(results);
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
	wineApp.loading();

	for (var key in resultPairs) {
		var check = '<input type="checkbox" name="categories" id="' + resultPairs[key] + '"><label for="' + resultPairs[key] + '" class="button">' + key + '</label>';
		$(".options").append(check);
	}

	$(".submit").append('<input type="submit" id="submitButton" class="submitButton" value="Submit">').append('<input type="submit" id="startOver" class="submitButton" value="Start Over">');

	wineApp.checkBoxHandler();
	wineApp.startOver();
	wineApp.grapeChoice();
};

wineApp.grapeChoice = function () {
	$("#submitButton").on("click", function (e) {
		e.preventDefault();
		var selection = $('input:checked').attr("id");
		if (selection === undefined) {
			alert('Please select a category');
		} else {
			var category = wineApp.returnStyle(selection);
			$.when(category).then(function (results) {
				var title = results.Books[0].Articles[0].Title;
				results = results.Books[0].Articles[0].Content;
				var combined = [];
				combined.push(results);
				combined.push(title);
				console.log(combined);
				var cleanUp = wineApp.removeClutter(combined);
			});
		}
	});
};

// Some random links and phrases that the API adds to the page that are annoying to style needed to be removed.
wineApp.removeClutter = function (combined) {
	console.log(combined[1]);
	combined[0] = combined[0].replace('Related Links:', "");
	combined[0] = combined[0].replace('Shop our most popular ' + combined[1] + 's', "");
	combined[0] = combined[0].replace('Shop our most popular ' + combined[1], "");
	combined[0] = combined[0].replace('Shop our highest rated ' + combined[1], "");
	combined[0] = combined[0].replace('Shop for ' + combined[1], '');
	combined[0] = combined[0].replace('' + combined[1], '<h2 class="grapeTitle headingStyle">' + combined[1] + '</h2>');
	combined[0] = combined[0].replace('Notable Facts', '<h3 class="secondHeading headingStyle">Notable Facts</h3>');
	combined[0] = combined[0].replace('Summing it up', '<h2 class="secondHeading headingStyle">Summing It Up</h2>');
	combined[0] = combined[0].replace('Successful Sites:', '<h3 class="secondHeading headingStyle">Common Appelations</h3>');
	combined[0] = combined[0].replace('Common Descriptors:', '<h3 class="secondHeading headingStyle">Common Descriptors</h3>');
	combined[0] = combined[0].replace("Shop our most popular Pink Bubbles", "");
	combined[0] = combined[0].replace("Pink Bubbles", "");
	combined[0] = combined[0].replace("Shop our most popular Rhone Blends", "").replace("Shop our highest rated Rhone Blends", "");
	combined[0] = combined[0].replace("Champagne and Sparkling Wines", "");
	combined[0] = combined[0].replace("Bubblese", "");
	combined[0] = combined[0].replace("Bubbles", "");
	wineApp.grapeDescription(combined[0]);
};

// Displays final results on page
wineApp.grapeDescription = function (results) {
	// console.log(results);
	$(".options").remove();
	$(".submit").remove();
	$(".mainWrapper").append('<div class="results">');
	$(".results").append('<p>' + results + '</p>');
	$(".mainWrapper").append('<div class="submit">');
	$(".submit").append('<input type="submit" id="startOver" class="submitButton" value="Start Over">');
	wineApp.startOver();
};

// Controls the button to start from the beginning

wineApp.startOver = function () {
	$("#startOver").on("click", function (e) {
		e.preventDefault();
		$(".results").remove();
		wineApp.form();
		wineApp.loading();
		var returns = [];
		var queries = categoryIds.forEach(function (i) {
			var choice = wineApp.originalChoices(i);
			$.when(choice).then(function (results) {
				var names = results.Books[0].Articles[0].Title;
				var ids = results.Books[0].Articles[0].Id;
				$(".options").append('<input type="checkbox" name="categories" value="' + ids + '" id="' + ids + '" value="' + names + '">').append('<label for=' + ids + ' class="button">' + names + '</label>');
				wineApp.checkBoxHandler();
			});
		});
		$(".submit").append('<input type="submit" id="submitButton" class="submitButton" value="Submit">');
		// 	wineApp.checkBoxHandler();
		// wineApp.init();
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

// Removes and adds form options that get repopulated by AJAX calls
wineApp.form = function () {
	$(".options").remove();
	$(".submit").remove();
	$("form").append('<div class="options">');
	$("form").append('<div class="submit">');
};

// Loading Modal
wineApp.loading = function () {
	$(document).on({
		ajaxStart: function ajaxStart() {
			$("body").addClass("loading");
		},
		ajaxStop: function ajaxStop() {
			$("body").removeClass("loading");
		}
	});
};

$(wineApp.init);