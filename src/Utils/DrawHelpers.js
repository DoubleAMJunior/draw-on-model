export function drawLine(context,color,x1, y1, x2, y2,width=5) {
    context.strokeStyle = color;
    context.lineWidth=width;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

export function drawPoint(context,color,x,y,width=3){
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, width, 0, Math.PI * 2);
    context.fill();
}