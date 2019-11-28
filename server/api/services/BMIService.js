var BMIService = {

	getIndex: function (weight, height) {
		var new_number = ((weight * 10000) / (height * height));
		var bmi = new_number.toFixed(2);

		
		return bmi; 

	},

	getDescription: function (index) {
		if (index < 16.0)
			return "Gravemente sottopeso"
		else if (index >= 16.0 && index <= 16.99)
			return "Visibilmente sottopeso"
		else if (index >=17.0 && index <= 18.49)
			return "Sottopeso"
		else if (index >=18.5 && index <= 24.99)
			return "Normopeso"
		else if (index >=25.0 && index <= 29.99)
			return "Sovrappeso"
		else if (index >=30.0 && index <= 34.99)
			return "Obesitá di I classe"
		else if (index >=35.0 && index <= 39.99)
			return "Obesitá di II classe"
		else return "Obesitá di III classe"
	}

};

module.exports = BMIService;