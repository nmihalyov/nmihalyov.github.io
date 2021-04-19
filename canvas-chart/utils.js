// Constants
const SIZES = {
  WIDTH: 800,
  HEIGHT: 200
};
const DPI_SIZES = {
  WIDTH: SIZES.WIDTH * 2,
  HEIGHT: SIZES.HEIGHT * 2
};
const GRID_LINES_AMOUNT = 5;
const TICKS_AMOUNT = 6;
const PADDING = 40;
const VIEW = {
  WIDTH: DPI_SIZES.WIDTH,
  HEIGHT: DPI_SIZES.HEIGHT - PADDING * 2
};
const THEME = {
  GRID_LINES: {
    WIDTH: 1,
    COLOR_LIGHT: '#F2F4F5',
    COLOR_DARK: '#303E50'
  },
	POINT_LINE: {
		WIDTH: 2,
		COLOR_LIGHT: '#DFE6EB',
		COLOR_DARK: '#3B4A5A'
	},
  TICKS: {
    FONT: 'normal 20px Roboto, Helvetica, sans-serif',
    FILL_LIGHT: '#96A2AA',
    FILL_DARK: '#546778'
  },
  LINE_WIDTH: 4,
	POINT: {
		RADIUS: 8,
		FILL_LIGHT: '#FFFFFF',
		FILL_DARK: '#242F3E'
	}
};
const SLIDER = {
	HEIGHT: 40,
	get DPI_HEIGHT() {
		return this.HEIGHT * 2;
	}
};

// Get formatted date
const getDate = date => new Intl.DateTimeFormat('en-US', {day: 'numeric', month: 'short'}).format(date);

// Check whether is mouse over coordinate
const isOver = (mouse, x, length) => {
	if (mouse) {
		const STEP = DPI_SIZES.WIDTH / length; // step between two X axis values

		// Return true if mouse is closer to x than to sibling value
		return Math.abs(x - mouse.x) < STEP / 2;
	}
};

// Get min and max values
const getMinMax = columns => {
  let min;
  let max;

  columns.map(col => {
    // Get min and max values
		if (typeof min !== 'number') min = col[1];
		if (typeof max !== 'number') max = col[1];

		if (min > col[1]) min = col[1];
		if (max < col[1]) max = col[1];
		
		for (let i = 2; i < col.length; i++) {
			if (min > col[i]) min = col[i];
			if (max < col[i]) max = col[i];
		}
  });

  return {
    MIN: min,
    MAX: max
  };
};

// Get coordinates from data for drawing lines
const getCoordinates = (RATIO_X, RATIO_Y, HEIGHT, PADDING, MIN) => col => col.map((y, i) => [
  Math.round((i - 1) * RATIO_X),
  Math.round(HEIGHT - (y - MIN) / RATIO_Y - PADDING)
]).filter((_, i) => i !== 0);

// Clear canvas
const clear = (ctx, height) => {
	ctx.clearRect(0, 0, DPI_SIZES.WIDTH, height);
};