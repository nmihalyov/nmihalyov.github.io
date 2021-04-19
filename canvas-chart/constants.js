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
    COLOR: '#CCCCCC'
  },
	POINT_LINE: {
		WIDTH: 2,
		COLOR: '#DDDDDD'	
	},
  TICKS: {
    FONT: 'normal 20px Roboto, Helvetica, sans-serif',
    FILL: '#96A2AA'
  },
  LINE_WIDTH: 4,
	POINT: {
		RADIUS: 6
	}
};