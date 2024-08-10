import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils";

export default class Doodle {
  constructor(x, y) {
    this.points = [{ x, y }];
  }

  addPoint(x, y) {
    this.points.push({ x, y });
  }

  draw(ctx) {
    const myStroke = getStroke(this.points, {
      size: 5,
    });
    const pathData = getSvgPathFromStroke(myStroke);
    const myPath = new Path2D(pathData);
    ctx.fill(myPath);
  }
}
