// ride the snake
let sqr = x => Rotate(Square(), r2d*x, {invar: true});
let boxes = SymPoints(
  {fy: sin, fs: sqr, size: 0.4, xlim: [0, 2*pi], N: 150}
)
let graph = Graph(boxes);
let frame = Frame(graph, {margin: 0.1});
return frame;
