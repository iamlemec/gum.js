// spacetime vibes
let s = [0.5, 0.9, 1.5].map(a => SymPath({fy: x => sin(a*x), xlim: [-1, 1]}));
let t = Scatter([[0, 0.5], [0.5, 0], [-0.5, 0], [0, -0.5]], {size: 0.015});
let r = Scatter([[Rect(), [0.5, 0.5]], [Circle(), [-0.5, -0.5]]], {size: 0.1});
let p = Plot([...s, r, t], {
  xlim: [-1, 1], ylim: [-1, 1], ygrid: true, xgrid: true,
  xlabel: 'time (seconds)', ylabel: 'space (meters)',
  title: 'Spacetime Vibes'
});
return Frame(p, {margin: 0.3});
