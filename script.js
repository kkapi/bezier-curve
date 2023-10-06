const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

/* canvas.addEventListener('mousedown', event => {
	const x = event.pageX - event.target.offsetLeft;
	const y = event.pageY - event.target.offsetTop;

	drawPoint(x, y, 5, 1, 'black', 'red');
});

function drawPoint(x, y, radius, borderWidth, borderColor, fillColor) {
	ctx.fillStyle = fillColor;
	ctx.strokeStyle = borderColor;
	ctx.lineWidth = borderWidth;

	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
} */

let currentShapeIndex = null;
let isDragging = false;
let startX = null;
let startY = null;

const shapes = [
	{ x: 50, y: 50, width: 200, height: 200, color: 'red' },
	{ x: 300, y: 300, width: 100, height: 100, color: 'blue' },
];

function drawShapes(shapes) {
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	for (let shape of shapes) {
		ctx.fillStyle = shape.color;
		ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
	}
}

drawShapes(shapes);

function mouseDown(event) {
	event.preventDefault();

	startX = event.pageX - event.target.offsetLeft;
	startY = event.pageY - event.target.offsetTop;

	currentShapeIndex = null;
	let index = 0;
	for (let shape of shapes) {
		if (mouseInShape(startX, startY, shape)) {
			currentShapeIndex = index;
            isDragging = true;
            return;
		}
		index++;
	}
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

function mouseInShape(x, y, shape) {
	const shapeLeft = shape.x;
	const shapeRigth = shape.x + shape.width;
	const shapeTop = shape.y;
	const shapeBottom = shape.y + shape.height;

	return x > shapeLeft && x < shapeRigth && y > shapeTop && y < shapeBottom;
}

function mouseMove(event) {
    if(!isDragging) {
        return
    }

    event.preventDefault();

	const x = event.pageX - event.target.offsetLeft;
	const y = event.pageY - event.target.offsetTop;

    const dx = x - startX;
    const dy = y - startY;

    const currentShape = shapes[currentShapeIndex];
    currentShape.x += dx;
    currentShape.y += dy;

    drawShapes(shapes);

    startX = x;
    startY = y;
}

canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mouseup', mouseUp);
canvas.addEventListener('mouseout', mouseOut);
canvas.addEventListener('mousemove', mouseMove)
