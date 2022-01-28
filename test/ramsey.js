// params
let α = 0.35;
let ρ = 0.05;
let δ = 0.1;
let Δ = 0.2;

// functions
let f = k => k**α;
let fp = k => α*(k**(α-1));
let dk = (k, c) => f(k) - δ * k - c;
let dc = (k, c) => c * ( fp(k) - ( δ + ρ ) );

// steady state
let kss = (α/(δ+ρ))**(1/(1-α));
let css = f(kss) - δ*kss;

// simulate path
function simpath(k0, c0, N, dir) {
  dir = dir ?? Δ;
  let [k, c] = [k0, c0];
  let pv = [];
  for (i of range(N)) {
    pv.push([k, c]);
    k = k + dir*dk(k, c);
    c = c + dir*dc(k, c);
    if (k <= 0 || c <= 0) {
      break;
    }
  }
  return pv;
}

// simulate paths
let ε = 0.01;
let starts = [
  [1.5, 0.8, 37, Δ],
  [1.5, 0.6, 50, Δ],
  [5.5, 1.4, 50, Δ],
  [5.5, 1.7, 50, Δ],
];
let backs = [
  [kss-ε, css-ε, 200, -Δ],
  [kss+ε, css+ε, 140, -Δ],
];
let lines = starts.map(([k0, c0, N, dir]) =>
  Polyline(simpath(k0, c0, N, dir), {stroke: 'gray'})
);

let arms = backs.map(([k0, c0, N, dir]) =>
  Polyline(simpath(k0, c0, N, dir))
);

// points
let point = Scatter(
  starts.map(([k0, c0, N]) => [k0, c0]),
  {shape: Circle({stroke: 'gray', fill: 'gray'})}
);
let state = Scatter([[kss, css]], {radius: 0.05, shape: Circle({stroke: 'black', fill: 'black'})});

// plot
let plot = Plot([state, point, ...lines, ...arms], {
  aspect: 1.5, xlim: [0, 6.5], ylim: [0, 2.2]
});

// display
let frame = Frame(plot, {margin: 0.1});
return frame;
