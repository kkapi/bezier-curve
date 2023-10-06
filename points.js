const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

let currentPointIndex = null;
let isDragging = false;
let startX = null;
let startY = null;

const points = [
	{
		x: 50,
		y: 50,
		radius: 8,
		borderWidth: 1,
		borderColor: 'black',
		fillColor: 'red',
	},
	{
		x: 150,
		y: 150,
		radius: 8,
		borderWidth: 1,
		borderColor: 'black',
		fillColor: 'red',
	},
	{
		x: 300,
		y: 400,
		radius: 8,
		borderWidth: 1,
		borderColor: 'black',
		fillColor: 'red',
	},
	{
		x: 500,
		y: 50,
		radius: 8,
		borderWidth: 1,
		borderColor: 'black',
		fillColor: 'red',
	},
];

function drawPoint(x, y, radius, borderWidth, borderColor, fillColor) {
	ctx.fillStyle = fillColor;
	ctx.strokeStyle = borderColor;
	ctx.lineWidth = borderWidth;

	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

    const text = `[${x} ${y}]`

    ctx.font = "18px serif";
	ctx.fillStyle = 'black';
    ctx.fillText(text, Math.round(x - text.length * 18 / 4.5), y + 30)
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
	let index = 0;
	for (let point of points) {
		if (mouseInPoint(startX, startY, point)) {
			currentPointIndex = index;
            console.log(startX, startY);
            console.log(currentPointIndex);
			isDragging = true;
			return;
		}
		index++;
	}
}

function mouseInPoint(x, y, point) {
	return (x - point.x) ** 2 + (y - point.y) ** 2 < point.radius ** 2;
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

	const currentPoint = points[currentPointIndex];

    console.log('CURRENT', currentPointIndex);
    console.log(`hui ${dx}, ${dy}`)

	currentPoint.x += dx;
	currentPoint.y += dy;

	drawImage();
    displayCoordinates();

	startX = x;
	startY = y;
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
    ctx.lineWidth=2;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();


	for (let i = 0; i < coordinates.length - 1; i++) {
		ctx.moveTo(coordinates[i][0], coordinates[i][1]);
		ctx.lineTo(coordinates[i + 1][0], coordinates[i + 1][1]);
	}

    ctx.stroke();
}

function displayCoordinates() {
    for (let i = 0; i < points.length; i++) {
		const cords = document.querySelector(`.coordinates-${i}`);
        cords.textContent = `[ ${points[i].x} ${points[i].y} ]`
	}
}

function drawImage() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const flow = getBezierCurve(points, 0.01);
    drawLines();
    drawBezierCurve(flow);
    drawPoints(points);    
}

function drawLines() {
    ctx.strokeStyle = 'green';

    ctx.beginPath();
    ctx.setLineDash([10, 10]);

    for (let i = 0; i < points.length - 1; i++) {
        ctx.moveTo(
			points[i].x, points[i].y
		);
		ctx.lineTo(
			points[i + 1].x, points[i + 1].y
		);

    }

    ctx.stroke();
    ctx.setLineDash([]);
}

drawImage();

const divPoints = document.querySelector('#points')

function createDivCoordinates() {
	const div = document.createElement('div');
	div.classList.add('cords');
	divPoints.appendChild(div);

	for (let i = 0; i < points.length; i++) {
		const divCoordinates = document.createElement('div');
		divCoordinates.classList.add(`coordinates-${i}`);
		divCoordinates.textContent = `[ ${points[i].x} ${points[i].y} ]`;
		div.appendChild(divCoordinates);
	}
}

createDivCoordinates();

const addBtn = document.querySelector('#add')

addBtn.addEventListener('click', () => {
    points.push({
		x: Math.round(CANVAS_WIDTH / 2),
		y: Math.round(CANVAS_HEIGHT / 2),
		radius: 8,
		borderWidth: 1,
		borderColor: 'black',
		fillColor: 'red',
	},)

    startX = null;
    startY = null;
    
    drawImage();
})