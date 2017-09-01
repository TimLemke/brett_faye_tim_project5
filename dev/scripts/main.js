const app = {};
// call to Teleport autocomplete
app.callTeleport = () => {
	TeleportAutocomplete.init('.my-input').on('change', (cityData) => {
		var latitude = cityData.latitude;
		var longitude = cityData.longitude;
		app.callDarkSky(latitude, longitude);
	});
}

// ajax call to Dark Sky
app.callDarkSky = (latitude, longitude) => {
	var keyDarkSky = 'ecb6e7f16bb182021ecf519d1099721a';
	var weather = $.ajax({
		url: `https://api.darksky.net/forecast/${keyDarkSky}/${latitude},${longitude}?units=ca`,
		method: 'GET',
		dataType: 'jsonp'
	}).then((res) => {
		console.log(res);
		app.currentTemp = $('<h2>').text(Math.round(res.currently.apparentTemperature));
		app.currentIcon = res.currently.icon;
		app.currentWeather = $('<h4>').text(res.currently.summary);
		app.weatherFilter();
	});
}

// a function that filters search results based on currentTemp
app.weatherFilter = () => {
	var foodPicks = [];
	if(app.currentTemp <= 0){
		var selectedFoods = ['roast', 'pasta', 'chili', 'pot pie', 'stew', 'winter'];
	}
	else if(app.currentTemp > 0 && app.currentTemp <= 10){
		var selectedFoods = ['soup', 'pizza', 'pumpkin', 'apple', 'slow cooker', 'dumpling', 'spicy', 'autumn'];
	}
	else if(app.currentTemp > 10 && app.currentTemp <= 20){
		var selectedFoods = ['sushi', 'sandwich', 'breakfast', 'brunch', 'fried', 'spring'];
	}
	else if(app.currentTemp > 20 && app.currentTemp <= 25){
		var selectedFoods = ['bbq', 'mexican', 'indian', 'greens', 'curry', 'berries'];
	}
	else{
		var selectedFoods = ['salad', 'ice cream', 'cool', 'cucumber', 'summer', 'watermelon'];
	}
	app.foodChoice = selectedFoods[Math.floor(Math.random()*selectedFoods.length)];
}

// a function that gathers dietary restrictions and passes them into an array
app.events = () => {
	let allergyRestrict = [];
	let dietRestrict = [];
	$('.userInfo').on('submit', function(e) {
		e.preventDefault();
		allergyRestrict = $(".allergy:checked").map(function(){
			return $(this).val();
			}).get();
		dietRestrict = $(".diet:checked").map(function(){
			return $(this).val();
			}).get();

			app.callYummly(app.foodChoice, allergyRestrict, dietRestrict);
			// console.log(dietRestrict)
			


	});
}

// ajax call to Yummly
app.callYummly = (foodChoice, allergyRestrict, dietRestrict) => {
	let idYummly = '95ec33fc';
	let keyYummly = '2410ab65b1957770177d384fa57c6070';
	let urlYummly = 'http://api.yummly.com/v1/api/recipes';
	let recipeYummly = $.ajax({
		url : urlYummly,
		dataType : 'jsonp',
		method: 'GET',
		data: {
			q: foodChoice,
			_app_id: idYummly,
			_app_key: keyYummly,
			allowedAllergy: allergyRestrict,
			allowedDiet: dietRestrict,
			excludedCourse: ["course^course-Cocktails", "course^course-Condiments and Sauces", "course^course-Beverages"],
		}
	}).then((res) => {
		console.log(res);
		var recipeMatches = res.matches;
		var recipeChoice = recipeMatches[Math.floor(Math.random()*recipeMatches.length)];
		var recipeId = recipeChoice.id;
		app.callRecipeInfo(recipeId);
		app.saveRecipes(recipeChoice);
	})
}

app.saveRecipes = (data) => {

	var dbRef = firebase.database().ref('/recipes');
	// console.log(data)
	// dbRef.push(data);
	dbRef.on('value', (data) => {
  		// Why the value doesn't work
  		dbRef.push('pizza')
		$('.saveButton').on('click', function(e) {
			e.preventDefault();
			
			app.callYummly();
			var recipeResults = $('').val();
			app.saveRecipes(recipeResults);

		});
	});	
}

// a function to call and display recipe info for selected item
app.callRecipeInfo = (recipeId) => {
	let idYummly = '95ec33fc';
	let keyYummly = '2410ab65b1957770177d384fa57c6070';
	let urlYummly = `http://api.yummly.com/v1/api/recipe/${recipeId}`;
	let recipeYummly = $.ajax({
		url : urlYummly,
		dataType : 'jsonp',
		method: 'GET',
		data: {
			_app_id: idYummly,
			_app_key: keyYummly
		}
	}).then((res) => {
		$('#weatherContainer').empty();
		let weatherIcon = {};
			if(app.currentIcon === 'clear-day'){
				weatherIcon = $('<img>').attr('src', 'dev/assets/clear-day.svg');
			}
			else if(app.currentIcon === 'clear-night'){
				weatherIcon = $('<img>').attr('src', 'dev/assets/clear-night.svg');
			}
			else if(app.currentIcon === 'rain'){
				weatherIcon = $('<img>').attr('src', 'dev/assets/clear-rain.svg');
			}
			else if(app.currentIcon === 'snow'){
				weatherIcon = $('<img>').attr('src', 'dev/assets/clear-snow.svg');
			}
			else if(app.currentIcon === 'sleet'){
				weatherIcon = $('<img>').attr('src', 'dev/assets/clear-sleet.svg');
			}
			else if(app.currentIcon === 'wind'){
				weatherIcon = $('<img>').attr('src', 'dev/assets/wind.svg');
			}
			else if(app.currentIcon === 'fog'){
				weatherIcon = $('<img>').attr('src', 'dev/assets/fog.svg');
			}
			else if(app.currentIcon === 'cloudy'){
				weatherIcon = $('<img>').attr('src', 'dev/assets/cloudy.svg');
			}
			else if(app.currentIcon === 'partly-cloudy-day'){
				weatherIcon = $('<img>').attr('src', 'dev/assets/partly-cloudy-day.svg');
			}
			else{
				weatherIcon = $('<img>').attr('src', 'dev/assets/partly-cloudy-night.svg');
			}
		// }
		$('#weatherContainer').append(app.currentTemp, weatherIcon, app.currentWeather);
		$('#recipeContainer').empty();
		let selectedImage = $('<img>').attr('src', res.images[0].hostedLargeUrl);
		let selectedName = $('<h2>').text(res.name);
		let selectedTime = $('<h4>').text(res.totalTime);
		$('#recipeContainer').append(selectedImage, selectedName, selectedTime);
		res.ingredientLines.forEach( (ingredient) => {
			$('#recipeContainer').append(`<p>${ingredient}</p>`);
		});
		let saveButton = $('<button>').addClass('saveButton').text('Save Recipe');
		$('#recipeContainer').append(saveButton);



	});
}

app.init = () => {
	app.callTeleport();
	app.events();
};

$(app.init);
