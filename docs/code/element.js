// Element extension example (note the ".class"!)
class Triangle extends Element.class {
  constructor(p0, p1, p2, attr) {
    super('polygon', true, attr);
    this.coords = [p0, p1, p2];
  }
  props(ctx) {
    let pixels = this.coords.map(c => ctx.coord_to_pixel(c));
    let points = pixels.map(([x, y]) => `${x},${y}`).join(' ');
    return {points, ...this.attr};
  }
}
return new Triangle(
  [0.5, 0.1], [0.9, 0.9], [0.1, 0.9], {fill: '#EEE'}
);
