// Get chart controls
const chartControls = data => {
	let callbackFn; // callback function
	const controls = {}; // initial controls state
	const theme = document.querySelector('.theme'); // theme toggle button

	// Theme button click event handler
	theme.addEventListener('click', () => {
		// Write new theme value
		document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
		// Calling callback function
		callbackFn();
	});

	// Get array of checkboxes elements
	const checkboxes = data.columns.map(col => {
		const item = col[0]; // name of chart item

		// Working only with lines
		if (data.types[item] === 'line') {
			controls[item] = true; // set initial state as true

			return (`<label class="checkbox" style="color: ${data.colors[item]};">
				<input class="checkbox__input" type="checkbox" name="${item}" checked="checked"/>
				<div class="checkbox__box">
					<div class="checkbox__box-mark"></div>
				</div>
				<p class="checkbox__text">${data.names[item]}</p>
			</label>`);
		}
	}).join('');

	// Handler checkbox click
	const checkboxClickHandler = e => {
		const $target = e.currentTarget; // event target

		// Remove animation class when animation ends
		$target.addEventListener('animationend', () => {
			$target.setAttribute('class', 'checkbox');
		});

		// Prevent all checkboxes of being unchecked
		if (document.querySelectorAll('[type="checkbox"]:checked').length === 1 && $target.querySelector('input').checked) {
			e.preventDefault();
			// Add animation class on checkbox
			$target.classList.add('checkbox--shake');
			return false;
		}

		callbackFn(e.target.name); // executing callback with clicked checkbox name
	};

	// Display checkboxes on page
	document.querySelector('.controls').insertAdjacentHTML('afterbegin', checkboxes);

	// Apply handlers to checkboxes
	Array.from(document.querySelectorAll('.checkbox')).map(checkbox => checkbox.addEventListener('click', checkboxClickHandler));

	return {
		// Initial controls state
		initialState: controls,
		// Subscribing to controls changes
		subscribe(callback) {
			// Assign callback function to inner variable
			callbackFn = callback;
		}
	};
};