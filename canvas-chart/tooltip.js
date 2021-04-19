// Tooltip template
const tooltipHTML = data => `
	<p class="tooltip__title">${data.title}</p>
	<ul class="tooltip__list">
		${data.items.map(el => `
			<li class="tooltip__list-item">
				<p class="tooltip__value" style="color: ${el.color}">${el.value}</p>
				<p class="tooltip__name" style="color: ${el.color}">${el.name}</p>
			</li>
		`).join('')}
	</ul>
`;

// Generate tooltip
const tooltip = el => {
	// Clear tooltip contents
	const clear = () => el.innerHTML = '';

	return {
		// Show tooltip method
		show({ left, top }, data) {
			const { width, height } = el.getBoundingClientRect();
			
			clear();
			
			el.style.cssText = `
			display: block;
			top: ${top - height * 1.5}px;
			left: ${left - width / 6}px;
			`;
			el.insertAdjacentHTML('afterbegin', tooltipHTML(data));
		},
		// Hide tooltip method
		hide() {
			el.style.cssText = 'display: none';
		}
	};
};