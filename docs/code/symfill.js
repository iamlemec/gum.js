// a decaying sine wave filled in with blue
let decay = x => exp(-0.1*x) * sin(x);
let fill = SymFill({fy1: decay, fy2: 0, xlim: [0, 6*pi], fill: blue, fill_opacity: 0.6, N: 250});
let graph = Graph(fill, {aspect: phi});
return Frame(graph, {margin: 0.1});
