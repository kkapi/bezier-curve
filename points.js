const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

let currentPointIndex = null;
let isDragging = false;
let startX = null;
let startY = null;

const colors = [
	'#f94144',
	'#f3722c',
	'#f8961e',
	'#f9844a',
	'#f9c74f',
	'#90be6d',
	'#4d908e',
	'#577590',
	'#277da1',
	'#f94144',
	'#f3722c',
	'#f8961e',
	'#f9844a',
	'#f9c74f',
	'#90be6d',
	'#4d908e',
	'#577590',
];

const points = [
	{
		x: 137,
		y: 373,
		radius: 9,
		borderWidth: 1,
		borderColor: 'black',
		fillColor: '#f94144',
	},
	{
		x: 489,
		y: 72,
		radius: 9,
		borderWidth: 1,
		borderColor: 'black',
		fillColor: '#f3722c',
	},
	{
		x: 891,
		y: 436,
		radius: 9,
		borderWidth: 1,
		borderColor: 'black',
		fillColor: '#f8961e',
	},
];

const lines_check = document.querySelector('#lines_check');
const cords_check = document.querySelector('#cords_check');

lines_check.addEventListener('change', () => drawImage());
cords_check.addEventListener('change', () => drawImage());

function drawText(x, y, text, font, style) {
	ctx.font = font;
	ctx.fillStyle = style;
	ctx.fillText(text, Math.round(x - (text.length * 18) / 4.5), y + 30);
}

function drawPoint(x, y, radius, borderWidth, borderColor, fillColor) {
	ctx.fillStyle = fillColor;
	ctx.strokeStyle = borderColor;
	ctx.lineWidth = borderWidth;

	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	if (cords_check.checked) {
		const text = `[${x} ${y}]`;

		drawText(x, y, text, '18px serif', 'black');
	}
}

function drawPoints(points) {
	ctx.borderWidth = 1;

	for (let point of points) {
		drawPoint(
			point.x,
			point.y,
			point.radius,
			point.borderWidth,
			point.borderColor,
			point.fillColor
		);
	}
}

function mouseDown(event) {
	event.preventDefault();

	startX = event.pageX - event.target.offsetLeft;
	startY = event.pageY - event.target.offsetTop;

	currentPointIndex = null;

	for (let i = points.length - 1; i > -1; i--) {
		if (mouseInPoint(startX, startY, points[i])) {
			currentPointIndex = i;
			isDragging = true;
			return;
		}
	}
}

function mouseInPoint(x, y, point) {
	return (x - point.x) ** 2 + (y - point.y) ** 2 < (point.radius + 20) ** 2;
}

function mouseUp(event) {
	if (!isDragging) {
		return;
	}

	event.preventDefault();
	isDragging = false;
}

function mouseOut(event) {
	if (!isDragging) {
		return;
	}

	event.preventDefault();
	isDragging = false;
}

function mouseMove(event) {
	if (!isDragging) {
		return;
	}

	event.preventDefault();

	const x = event.pageX - event.target.offsetLeft;
	const y = event.pageY - event.target.offsetTop;

	const dx = x - startX;
	const dy = y - startY;

	startX = x;
	startY = y;

	const currentPoint = points[currentPointIndex];

	currentPoint.x += dx;
	currentPoint.y += dy;

	drawImage();
	displayCoordinates();
}

canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mouseup', mouseUp);
canvas.addEventListener('mouseout', mouseOut);
canvas.addEventListener('mousemove', mouseMove);

function getFactorial(num) {
	let result = num;
	if (num === 0 || num === 1) return 1;
	while (num > 1) {
		num--;
		result *= num;
	}
	return result;
}

// i - номер вершины, n - количество вершин, t - положение кривой (от 0 до 1)
function getWeightCoefficientValue(i, n, t) {
	// считаем i-й элемент полинома Берштейна
	return (
		(getFactorial(n) / (getFactorial(i) * getFactorial(n - i))) *
		Math.pow(t, i) *
		Math.pow(1 - t, n - i)
	);
}

// arr - массив опорных точек. Точка - двухэлементный массив, (x = arr[0], y = arr[1])
// step - шаг при расчете кривой (0 < step < 1), по умолчанию 0.01
function getBezierCurve(points, step = 0.01) {
	const res = [];

	for (let t = 0; t < 1 + step; t += step) {
		if (t > 1) {
			t = 1;
		}

		const ind = res.length;

		res[ind] = [0, 0];

		for (let i = 0; i < points.length; i++) {
			const b = getWeightCoefficientValue(i, points.length - 1, t);

			res[ind][0] += points[i].x * b;
			res[ind][1] += points[i].y * b;
		}
	}

	return res;
}

function drawBezierCurve(coordinates) {
	ctx.lineWidth = 2;
	ctx.strokeStyle = '#4676d7';
	ctx.beginPath();

	for (let i = 0; i < coordinates.length - 1; i++) {
		ctx.moveTo(coordinates[i][0], coordinates[i][1]);
		ctx.lineTo(coordinates[i + 1][0], coordinates[i + 1][1]);
	}

	ctx.stroke();
}

function displayCoordinates() {
	for (let i = 0; i < points.length; i++) {
		const cords = document.querySelector(`.coordinates-${i} .div-info`);
		cords.textContent = `[ ${points[i].x} ${points[i].y} ]`;
	}
}

function drawImage() {
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	const flow = getBezierCurve(points, 0.01);
	if (lines_check.checked) {
		drawLines();
	}
	drawBezierCurve(flow);
	drawPoints(points);
}

function drawLines() {
	ctx.strokeStyle = 'green';

	ctx.beginPath();
	ctx.setLineDash([10, 10]);

	for (let i = 0; i < points.length - 1; i++) {
		ctx.moveTo(points[i].x, points[i].y);
		ctx.lineTo(points[i + 1].x, points[i + 1].y);
	}

	ctx.stroke();
	ctx.setLineDash([]);
}

drawImage();

const divPoints = document.querySelector('#points');

function createDivCoordinates() {
	const div = document.createElement('div');
	div.classList.add('cords');
	divPoints.appendChild(div);

	for (let i = points.length - 1; i > -1; i--) {
		const pointColor = points[i].fillColor;

		const divCoordinates = document.createElement('div');
		divCoordinates.classList.add(`container`);
		divCoordinates.classList.add(`coordinates-${i}`);

		const point = document.createElement('div');
		point.classList.add(`point`);
		point.style.backgroundColor = pointColor;

		const divInfo = document.createElement('div');
		divInfo.classList.add(`div-info`);
		divInfo.textContent = `[ ${points[i].x} ${points[i].y} ]`;

		const deleteButton = document.createElement('button');
		deleteButton.textContent = `Удалить`;

		deleteButton.addEventListener('click', () => {
			addBtn.disabled = false;
			deleteDivCoordinates();
			points.splice(i, 1);
			colors.push(pointColor);
			createDivCoordinates();
			drawImage();
		});

		divCoordinates.appendChild(point);
		divCoordinates.appendChild(divInfo);
		divCoordinates.appendChild(deleteButton);

		div.appendChild(divCoordinates);
	}
}

function deleteDivCoordinates() {
	const div = document.querySelector('.cords');
	div?.remove();
}

createDivCoordinates();

const addBtn = document.querySelector('#add');

addBtn.addEventListener('click', () => {
	if (points.length > 19) {
		return;
	}

	deleteDivCoordinates();

	const color = colors.pop();

	points.push({
		x: Math.round(CANVAS_WIDTH / 2),
		y: Math.round(CANVAS_HEIGHT / 2),
		radius: 9,
		borderWidth: 1,
		borderColor: 'black',
		fillColor: color,
	});

	if (points.length > 19) {
		addBtn.disabled = true;
	}

	startX = null;
	startY = null;

	createDivCoordinates();
	drawImage();
});
