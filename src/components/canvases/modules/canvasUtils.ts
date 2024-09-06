export function drawLine(
  context: CanvasRenderingContext2D,
  { x: beginX, y: beginY }: { x: number, y: number },
  { x: endX = undefined, y: endY = undefined }: { x?: number, y?: number } = {},
  {
    lineWidth = 1,
    lineDash = undefined,
    strokeStyle = undefined,
    round = true,
    anchor = 0,
  }: {
    lineWidth?: number,
    lineDash?: number[],
    strokeStyle?: string,
    round?: boolean,
    anchor?: number,
  } = {},
) {
  if ((endX === undefined) && (endY === undefined)) throw RangeError('no end point is set');
  if (round) {
    beginX = Math.round(beginX);
    beginY = Math.round(beginY);
    if (endX !== undefined) endX = Math.round(endX);
    if (endY !== undefined) endY = Math.round(endY);
  }
  if (endX === undefined) endX = beginX;
  if (endY === undefined) endY = beginY;
  const offsetX = endX - beginX;
  const offsetY = endY - beginY;
  let lineLength: number;
  if (offsetX === 0) {
    lineLength = Math.abs(offsetY);
  } else if (offsetY === 0) {
    lineLength = Math.abs(offsetX);
  } else {
    lineLength = Math.sqrt(offsetX ** 2 + offsetY ** 2);
  }
  const offsetRate = 0.5 * lineWidth / lineLength;
  const anchorOffset = 1 - 2 * anchor;
  const pathCenteringOffsetX = offsetRate * (-anchorOffset * offsetY);
  const pathCenteringOffsetY = offsetRate * (anchorOffset * offsetX);
  beginX += pathCenteringOffsetX;
  beginY += pathCenteringOffsetY;
  endX += pathCenteringOffsetX;
  endY += pathCenteringOffsetY;
  context.beginPath();
  context.moveTo(beginX, beginY);
  context.lineTo(endX, endY);
  context.lineWidth = lineWidth;
  if (lineDash !== undefined) context.setLineDash(lineDash);
  if (strokeStyle !== undefined) context.strokeStyle = strokeStyle;
  context.stroke();
}

export function drawRect(
  context: CanvasRenderingContext2D,
  { x: beginX = 0, y: beginY = 0, width, height }: { x?: number, y?: number, width: number, height: number },
  {
    lineWidth = 1,
    lineDash = undefined,
    stroke = false,
    strokeStyle = undefined,
    fill = false,
    fillStyle = undefined,
    round = true,
    anchor = 0,
  }: {
    lineWidth?: number,
    lineDash?: number[],
    stroke?: boolean,
    strokeStyle?: string,
    fill?: boolean,
    fillStyle?: string,
    round?: boolean,
    anchor?: number,
  } = {},
) {
  if (round) {
    const endX = beginX + width;
    const endY = beginY + height;
    beginX = Math.round(beginX);
    beginY = Math.round(beginY);
    width = Math.round(endX) - beginX;
    height = Math.round(endY) - beginY;
  }
  const anchorOffset = 2 * anchor - 1;
  const sizeOffset = lineWidth * anchorOffset;
  const centeringOffset = -lineWidth * anchorOffset / 2;
  context.beginPath();
  context.lineWidth = lineWidth;
  context.rect(beginX + centeringOffset, beginY + centeringOffset, width + sizeOffset, height + sizeOffset);
  if (lineDash !== undefined) context.setLineDash(lineDash);
  if (stroke) {
    if (strokeStyle !== undefined) context.strokeStyle = strokeStyle;
    context.stroke();
  }
  if (fill) {
    if (fillStyle !== undefined) context.fillStyle = fillStyle;
    context.fill();
  }
}
