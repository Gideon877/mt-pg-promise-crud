function FieldManager (fields) {

	function getValues() {
		// read the values from the DOM
		Object.keys(fields).forEach(field => {
			const fieldElem = document.querySelector(`.${field}`);
			const value = fieldElem.value;
			fields[field] = value;
		});
		return fields;
	}

	function clear() {
		// read the fields in the DOM and set their value to blank
		Object.keys(fields).forEach(field => {
			const fieldElem = document.querySelector(`.${field}`);
			fieldElem.value = '';
		});
		// return fields;
	}

	return {
		clear,
		getValues
	}
}