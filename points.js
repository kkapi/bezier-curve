const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

const CURVE_WIDTH = 2;
const CURVE_COLOR = '#4676d7';

const LINE_WIDTH = 1;
const LINE_COLOR = 'green';

const POINT_BORDER_COLOR = 'black';
const POINT_BORDER_WIDTH = 1;
const POINT_RADIUS = 9;

const COORDINATES_FONT = '18px serif';
const COORDINATES_COLOR = 'black';

const ADDITIONAL_CAPTURE_RADIUS = 20;

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
		radius: POINT_RADIUS,
		borderWidth: POINT_BORDER_WIDTH,
		borderColor: POINT_BORDER_COLOR,
		fillColor: '#f94144',
	},
	{
		x: 489,
		y: 72,
		radius: POINT_RADIUS,
		borderWidth: POINT_BORDER_WIDTH,
		borderColor: POINT_BORDER_COLOR,
		fillColor: '#f3722c',
	},
	{
		x: 891,
		y: 436,
		radius: POINT_RADIUS,
		borderWidth: POINT_BORDER_WIDTH,
		borderColor: POINT_BORDER_COLOR,
		fillColor: '#f8961e',
	},
];

const addBtn = document.querySelector('#add');

const lines_check = document.querySelector('#lines_check');
const cords_check = document.querySelector('#cords_check');

const divPoints = document.querySelector('#points');

// points - массив опорных точек. Точка - двухэлементный массив, (x = points[0], y = points[1])
// step - шаг при расчете кривой (0 < step < 1)
function getBezierCurveCoordinates(points, step) {
	const coordinates = [];

	for (let t = 0; t < 1 + step; t += step) {
		const ind = coordinates.length;

		coordinates[ind] = [0, 0];

		for (let i = 0; i < points.length; i++) {
			const coefficient = getWeightCoefficientValue(
				i,
				points.length - 1,
				t
			);

			coordinates[ind][0] += points[i].x * coefficient;
			coordinates[ind][1] += points[i].y * coefficient;
		}
	}

	return coordinates;
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

function getFactorial(num) {
	let result = num;
	if (num === 0 || num === 1) return 1;
	while (num > 1) {
		num--;
		result *= num;
	}
	return result;
}

function drawBezierCurve(coordinates, curveWidth, curveColor) {
	ctx.lineWidth = curveWidth;
	ctx.strokeStyle = curveColor;

	ctx.beginPath();

	for (let i = 0; i < coordinates.length - 1; i++) {
		ctx.moveTo(coordinates[i][0], coordinates[i][1]);
		ctx.lineTo(coordinates[i + 1][0], coordinates[i + 1][1]);
	}

	ctx.stroke();
}

function drawPoints(points) {
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

function drawPoint(x, y, radius, borderWidth, borderColor, fillColor) {
	ctx.fillStyle = fillColor;
	ctx.strokeStyle = borderColor;
	ctx.lineWidth = borderWidth;

	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
}

function drawPointsCoordinates(points) {
	for (let point of points) {
		drawPointCoordinates(point);
	}
}

function drawPointCoordinates(point) {
	const text = `[${point.x} ${point.y}]`;

	const textX = Math.round(point.x - (text.length * 18) / 4.5);
	const textY = point.y + 30;

	const font = COORDINATES_FONT;
	const color = COORDINATES_COLOR;

	drawText(textX, textY, text, font, color);
}

function drawText(x, y, text, font, color) {
	ctx.font = font;
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
}

function drawLines(points, lineWidth, lineColor) {
	ctx.strokeStyle = lineColor;
	ctx.lineWidth = lineWidth;

	ctx.beginPath();
	ctx.setLineDash([10, 10]);

	for (let i = 0; i < points.length - 1; i++) {
		ctx.moveTo(points[i].x, points[i].y);
		ctx.lineTo(points[i + 1].x, points[i + 1].y);
	}

	ctx.stroke();
	ctx.setLineDash([]);
}

function drawImage() {
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	const step = 0.01;
	const cords = getBezierCurveCoordinates(points, step);
	
	drawBezierCurve(cords, CURVE_WIDTH, CURVE_COLOR);

	if (lines_check.checked) drawLines(points, LINE_WIDTH, LINE_COLOR);
	if (cords_check.checked) drawPointsCoordinates(points);

	drawPoints(points);
}

function addPoint() {
	if (points.length > 19) return;

	deleteDivCoordinates();

	const color = colors.pop();

	const newPoint = {
		x: Math.round(CANVAS_WIDTH / 2),
		y: Math.round(CANVAS_HEIGHT / 2),
		radius: POINT_RADIUS,
		borderWidth: POINT_BORDER_WIDTH,
		borderColor: POINT_BORDER_COLOR,
		fillColor: color,
	};

	points.push(newPoint);

	if (points.length > 19) addBtn.disabled = true;

	displayDivCoordinates();
	drawImage();
}

function getCanvasMouseCoordinates(event) {
	const x = event.pageX - event.target.offsetLeft;
	const y = event.pageY - event.target.offsetTop;

	return [x, y];
}

function mouseDown(event) {
	[startX, startY] = getCanvasMouseCoordinates(event);

	for (let i = points.length - 1; i > -1; i--) {
		if (mouseInPoint(startX, startY, points[i])) {
			currentPointIndex = i;
			isDragging = true;
			return;
		}
	}
}

function mouseInPoint(x, y, point) {
	return (
		(x - point.x) ** 2 + (y - point.y) ** 2 <
		(point.radius + ADDITIONAL_CAPTURE_RADIUS) ** 2
	);
}

function mouseUp() {
	if (!isDragging) return;

	isDragging = false;
}

function mouseOut() {
	if (!isDragging) return;

	isDragging = false;
}

function mouseMove(event) {
	if (!isDragging) return;

	const [x, y] = getCanvasMouseCoordinates(event);

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

function displayCoordinates() {
	for (let i = 0; i < points.length; i++) {
		const cords = document.querySelector(`.coordinates-${i} .div-info`);
		cords.textContent = `[ ${points[i].x} ${points[i].y} ]`;
	}
}

function displayDivCoordinates() {
	const divCoordinates = createDivCoordinates();

	for (let i = points.length - 1; i > -1; i--) {
		const divContainer = createDivContainer(i);
		const divPoint = createDivPoint(i);
		const divInfo = createDivInfo(i);
		const deleteButton = createDeleteButton(i);

		divContainer.appendChild(divPoint);
		divContainer.appendChild(divInfo);
		divContainer.appendChild(deleteButton);

		divCoordinates.appendChild(divContainer);
	}

	divPoints.appendChild(divCoordinates);
}

function createDivCoordinates() {
	const divCoordinates = document.createElement('div');
	divCoordinates.classList.add('cords');

	return divCoordinates;
}

function createDivContainer(i) {
	const divContainer = document.createElement('div');

	divContainer.classList.add(`container`);
	divContainer.classList.add(`coordinates-${i}`);

	return divContainer;
}

function createDivPoint(i) {
	const divPoint = document.createElement('div');

	divPoint.classList.add(`point`);
	const pointColor = points[i].fillColor;
	divPoint.style.backgroundColor = pointColor;

	return divPoint;
}

function createDivInfo(i) {
	const divInfo = document.createElement('div');

	divInfo.classList.add(`div-info`);
	divInfo.textContent = `[ ${points[i].x} ${points[i].y} ]`;

	return divInfo;
}

function createDeleteButton(i) {
	const deleteButton = document.createElement('button');
	deleteButton.textContent = `Удалить`;

	deleteButton.addEventListener('click', () => {
		addBtn.disabled = false;
		deleteDivCoordinates();
		points.splice(i, 1);
		colors.push(pointColor);
		displayDivCoordinates();
		drawImage();
	});

	return deleteButton;
}

function deleteDivCoordinates() {
	const div = document.querySelector('.cords');
	div?.remove();
}

canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mouseup', mouseUp);
canvas.addEventListener('mouseout', mouseOut);
canvas.addEventListener('mousemove', mouseMove);

addBtn.addEventListener('click', addPoint);

lines_check.addEventListener('change', drawImage);
cords_check.addEventListener('change', drawImage);

displayDivCoordinates();
drawImage();