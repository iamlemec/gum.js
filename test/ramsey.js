// algo
let dk0 = 0.01; // target delta k
let del0 = 0.01; // minimum time step
let del1 = 0.04; // maximum time step
let N = 2000; // maximum iterations

// params
let α = 0.35;
let ρ = 0.05;
let δ = 0.1;

// colors
let red = '#ff0d57';
let blue = '#1e88e5';
let green = '#13b755';

// functions
let f = k => k**α;
let fp = k => α*(k**(α-1));
let dk = (k, c) => f(k) - δ * k - c;
let dc = (k, c) => c * ( fp(k) - ( δ + ρ ) );
let kdot0 = k => f(k) - δ * k;

// steady state
let kss = (α/(δ+ρ))**(1/(1-α));
let css = f(kss) - δ*kss;

// simulate path
function simpath(k0, c0, kmax, cmax, dir) {
  dir = dir ?? 1;
  let [k, c] = [k0, c0];
  let pv = [];
  let kd, cd, del;
  for (i of range(N)) {
    pv.push([k, c]);
    [kd, cd] = [dk(k, c), dc(k, c)];
    del = min(del1, max(del0, dk0/abs(kd)));
    k = k + dir*del*dk(k, c);
    c = c + dir*del*dc(k, c);
    if (k <= 0 || c <= 0 || k >= kmax || c >= cmax) {
      break;
    }
  }
  return pv;
}

// simulation bounds
let [km, cm] = [8, 2.5];

// simulate paths
let ε = 0.01;
let starts = [
  [1.5, 0.8, 1],
  [1.5, 0.6, 1],
  [5.5, 1.4, 1],
  [5.5, 1.7, 1],
];
let backs = [
  [kss-ε, css-ε, -1],
  [kss+ε, css+ε, -1],
];

// draw paths
let lines = starts.map(([k0, c0, dir]) =>
  Polyline(simpath(k0, c0, km, cm, dir), {stroke: 'gray'})
);
let arms = backs.map(([k0, c0, dir]) =>
  Polyline(simpath(k0, c0, km, cm, dir), {stroke: red, stroke_width: 1.5})
);

// points
let point = Scatter(
  starts.map(([k0, c0, N]) => [k0, c0]),
  {shape: Circle({stroke: 'gray', fill: 'gray'})}
);
let state = Scatter([[kss, css]], {radius: 0.05});

// lines
vline = VLine(kss, {
  y1: 0, y2: cm, stroke: '#777', stroke_dasharray: [5, 2], stroke_width: 0.5
});
hline = HLine(css, {
  x1: 0, x2: km, stroke: '#777', stroke_dasharray: [5, 2], stroke_width: 0.5
});
dk0line = SymPath({fy: kdot0, xlim: [0, km], N: 500, stroke: blue, stroke_width: 1});
dc0line = SymPath({fx: y => kss, ylim: [0, cm], stroke: green, stroke_width: 1});

// labels
let texstack = lines => VStack(lines.map(
  s => Tex(s, {opacity: 0.85})
));
let zones = Scatter(
  [
    [texstack(['\\dot{c} > 0', '\\dot{k} < 0']), [2.4, 2.15]],
    [texstack(['\\dot{c} < 0', '\\dot{k} < 0']), [5.5, 2.15]],
    [texstack(['\\dot{c} > 0', '\\dot{k} > 0']), [2.4, 0.35]],
    [texstack(['\\dot{c} < 0', '\\dot{k} > 0']), [5.5, 0.35]],
  ],
  {radius: 0.45}
);

// plot
let plot = Plot(
  [vline, hline, ...lines, dk0line, dc0line, ...arms, state, point, zones],
  {
    aspect: 1.3, xlim: [0, km], ylim: [0, cm],
    xticks: [[kss, Tex('k^{\\ast}')]],
    yticks: [[css, Tex('c^{\\ast}')]],
    ticksize: 0.03, ticklabelsize: 2.3
  }
);

// display
let frame = Frame(plot, {margin: 0.1});
let svg = SVG(frame, {size: 250});
return svg;
