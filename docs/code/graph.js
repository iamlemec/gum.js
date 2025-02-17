// a series of closely spaced squares rotating clockwise along a sinusoidal path
let sqr = x => Rotate(Square(), r2d*x);
let boxes = SymPoints({
  fy: sin, fs: sqr, size: 0.4, xlim: [0, 2*pi], N: 150
});
let graph = Graph(boxes);
let frame = Frame(graph, {margin: 0.1});
return frame;
