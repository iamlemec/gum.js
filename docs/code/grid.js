// draw a grid of square boxes filled in light gray. each box contains an arrow that is pointing in a particular direction. that direction rotates clockwise as we move through the grid.
let head = Arrow(90, {pos: [0.5, 0], head: 0.3, tail: 1})
let arrows = linspace(0, 360, 10).slice(0, 9).map(th =>
    Rotate(head, th)
);
let boxes = arrows.map(a =>
    Frame(a, {border: 1, rounded: 0.1, padding: 0.2, fill: '#eee'})
);
let grid = Grid(reshape(boxes, [3, 3]), {spacing: 0.1});
return Frame(grid, {padding: 0.1});
