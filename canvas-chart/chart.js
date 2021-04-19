// Initialize canvas chart
const chart = (canvas, data) => {
	let requestId;
  const ctx = canvas.getContext('2d');
	const slider = chartSlider(document.querySelector('[data-slider]'), data);
	const controls = chartControls(data);
	let ratioY, ratioX; // scale ratio for x, y
	const proxy = new Proxy({controls: controls.initialState}, {
		set(...args) {
			// Redraw whole chart
			requestId = requestAnimationFrame(draw, canvas);

			// Write values to object and return true if property was changed
			return Reflect.set(...args);
		}
	}); // proxying changes over mouse, slider position and cotrols objects
	const tip = tooltip(document.querySelector('[data-tooltip]')); // get tooltip functionality

	// Draw position over chart elements
	const mouseMoveHandler = ({ clientX, clientY }) => {
		const { left, top } = canvas.getBoundingClientRect(); // canvas position relatively to the window

		// Set mouse X and tooltip position relatively to canvas
		proxy.mouse = {
			x: (clientX - left) * 2,
			tooltip: {
				left: clientX - left,
				top: clientY - top
			}
		};
	};

	// Remove position over chart elements (remove mouse X position) and tooltip
	const mouseLeaveHandler = () => {
		proxy.mouse = null;
		tip.hide();
	};

	// Draw Y axis lines
	const drawGrid = ({ MIN, MAX }, CURRENT_THEME) => {
		const STEP = VIEW.HEIGHT / GRID_LINES_AMOUNT; // step between grid lines 
		const LABEL_STEP = (MAX - MIN) / GRID_LINES_AMOUNT; // step between labels values

		ctx.beginPath();
		ctx.font = THEME.TICKS.FONT;
		ctx.fillStyle = THEME.TICKS[`FILL_${CURRENT_THEME}`];
		ctx.lineWidth = THEME.GRID_LINES.WIDTH;
		ctx.strokeStyle = THEME.GRID_LINES[`COLOR_${CURRENT_THEME}`];

		for (let i = 1; i <= GRID_LINES_AMOUNT; i++) {
			const Y = STEP * i + PADDING; // y coordinate for grid line
			const LABEL = Math.round(MAX - LABEL_STEP * i); // label text

			// Display grid labels
			ctx.fillText(LABEL, 5, Y - 10);
			// Draw grid line
			ctx.moveTo(0, Y);
			ctx.lineTo(DPI_SIZES.WIDTH, Y);
		}

		ctx.stroke();
		ctx.closePath();
	};

	// Draw elements for X axis (labels and position line) and display tooltip
	const drawXElements = (X_DATA, LINES_DATA, CURRENT_THEME) => {
		const DATA_FILTERED = X_DATA.filter((_, i) => i !== 0) // filter data off zero-index
		const STEP = Math.round(DATA_FILTERED.length / TICKS_AMOUNT); // step between labels

		ctx.beginPath();
		ctx.lineWidth = THEME.POINT_LINE.WIDTH;
		ctx.strokeStyle = THEME.POINT_LINE[`COLOR_${CURRENT_THEME}`];
		
		for (let i = 1; i < DATA_FILTERED.length + 1; i++) {
			const X = i * ratioX; // scaled X axis coordinate

			// Draw labels
			if ((i - 1) % STEP === 0 && DATA_FILTERED[i]) {
				const LABEL = getDate(new Date(DATA_FILTERED[i])); // label text
			
				ctx.fillText(LABEL, X - 15, DPI_SIZES.HEIGHT - 10);
			}

			// Draw position line
			if (isOver(proxy.mouse, X, DATA_FILTERED.length)) {
				// Save context state
				ctx.save();
				ctx.moveTo(X, PADDING / 2);
				ctx.lineTo(X, DPI_SIZES.HEIGHT - PADDING);
				// Load context state
				ctx.restore();

				// Show tooltip on current data
				tip.show(proxy.mouse.tooltip, {
					title: getDate(X_DATA[i]),
					items: LINES_DATA.map(col => ({
						color: data.colors[col[0]],
						name: data.names[col[0]],
						value: col[i + 1]
					}))
				});
			}
		}

		ctx.stroke();
		ctx.closePath();
	};

	// Draw chart line
	const drawChartLine = (coords, {color}) => {
		ctx.beginPath();
		ctx.lineWidth = THEME.LINE_WIDTH;
		ctx.strokeStyle = color;

		coords.map(([x, y]) => {
			ctx.lineTo(x, y);
		});

		ctx.stroke();
		ctx.closePath();
	};

	// Draw position point
	const drawChartPoint = (color, { x, y }, CURRENT_THEME) => {
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.fillStyle = THEME.POINT[`FILL_${CURRENT_THEME}`];
		ctx.arc(x, y, THEME.POINT.RADIUS, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	};

	// Draw whole chart
	const draw = () => {
		const CURRENT_THEME = document.body.dataset.theme.toUpperCase(); // current theme mode
		const dataLength = data.columns[0].length;
		const leftIndex = Math.round(dataLength * proxy.pos.start / 100); // start element index
		const rightIndex = Math.round(dataLength * proxy.pos.end / 100); // end element index
		const columns = data.columns.map(col => {
			const res = col.slice(leftIndex, rightIndex);
			if (typeof res[0] !== 'string') {
				res.unshift(col[0]);
			}
			return res;
		}); // get new data based on slider window and setting data type as first element
		const LINES_DATA = columns.filter(col => data.types[col[0]] === 'line' && proxy.controls[col[0]]); // data to draw chart lines
		const X_DATA = columns.filter(col => data.types[col[0]] === 'x')[0]; // data to draw x ticks
		const { MIN, MAX } = getMinMax(LINES_DATA);

		ratioY = (MAX - MIN) / VIEW.HEIGHT; // chart scale ratio by y axis
		ratioX = VIEW.WIDTH / (columns[0].length - 2); // chart scale ratio by x axis

		clear(ctx, DPI_SIZES.HEIGHT);

		drawGrid({MIN, MAX}, CURRENT_THEME);
		drawXElements(X_DATA, LINES_DATA, CURRENT_THEME);
	
		// Draw chart lines by coordinates
		LINES_DATA.map(getCoordinates(ratioX, ratioY, DPI_SIZES.HEIGHT, PADDING, MIN)).map((coords, i) => {
			const COLOR = data.colors[LINES_DATA[i][0]]; // current chart line and point color

			drawChartLine(coords, {
				color: COLOR
			});

			// Draw chart point if mouse is over coordinate
			coords.map(([x, y]) => {
				if (isOver(proxy.mouse, x, coords.length)) {
					drawChartPoint(COLOR, {x, y}, CURRENT_THEME);
				}
			});
		});
	};

  // Set canvas element size
  canvas.style.width = SIZES.WIDTH + 'px';
  canvas.style.height = SIZES.HEIGHT + 'px';
  
  // Set canvas size
  canvas.width = DPI_SIZES.WIDTH;
  canvas.height = DPI_SIZES.HEIGHT;

	// Add handlers to mouse events
	canvas.addEventListener('mousemove', mouseMoveHandler);
	canvas.addEventListener('mouseleave', mouseLeaveHandler);

	// Subscribe to slider change
	slider.subscribe(position => {
		// Set position value in proxy object
		proxy.pos = position;
	});

	// Subscribe to controls change
	controls.subscribe(checkbox => {
		if (checkbox) {
			// Toggle control state
			proxy.controls = {
				...proxy.controls,
				[checkbox]: !proxy.controls[checkbox]
			};

			// Redraw chart slider
			slider.redraw(proxy.controls);
		} else {
			// Redraw chart if theme was changed
			draw();
		}		
	});

	return {
		// Initialize chart method
		init() {
			draw();
		},
		// Destroy chart method
		destroy() {
			// Cancel request for animation frame
			cancelAnimationFrame(requestId);
			// Remove handlers of mouse events
			canvas.removeEventListener('mousemove', mouseMoveHandler);
			canvas.removeEventListener('mouseleave', mouseLeaveHandler);
		}
	};
};