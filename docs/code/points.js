// A plot of three different increasing curves of varying steepness and multiple points spaced at regular intervals. The x-axis label is "time (seconds)", the y-axis label is "space (meters)", and the title is "Spacetime Vibes". There are axis ticks in both directions with assiated faint grid lines.
let s = [0.5, 0.9, 1.5].map(a => SymPath({fy: x => sin(a*x), xlim: [-1, 1]}));
let t = Points([[0, 0.5], [0.5, 0], [-0.5, 0], [0, -0.5]], {size: 0.015});
let r = Points([[Rect(), [0.5, 0.5]], [Circle(), [-0.5, -0.5]]], {size: 0.1});
let p = Plot([...s, r, t], {
  xlim: [-1, 1], ylim: [-1, 1], ygrid: true, xgrid: true,
  xlabel: 'time (seconds)', ylabel: 'space (meters)',
  title: 'Spacetime Vibes'
});
return Frame(p, {margin: 0.3});
