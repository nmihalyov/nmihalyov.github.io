// Fetch data from JSON file
const getData = async url => {
	const res = await fetch(url);
	return await res.json();
};

// Execute drawing chart using data
getData('data.json').then(data => {
  const chartElement = chart(document.querySelector('[data-chart]'), data);

	chartElement.init();
});