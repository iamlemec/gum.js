// plot an inverted sine wave with ticks labeled in multiples of π. There is a faint dashed grid. The x-axis is labeled "phase" and the y-axis is labeled "amplitude". The title is "Inverted Sine Wave".
let line = SymPath({fy: x => -sin(x), xlim: [0, 2*pi]});
let xticks = linspace(0, 2, 6).slice(1).map(
  x => [x*pi, `${rounder(x, 1)} π`]
);
let plot = Plot(line, {
  aspect: phi, xaxis_pos: 0, xticks, yticks: 5, grid: true,
  xlabel: 'phase', ylabel: 'amplitude', title: 'Inverted Sine Wave',
  xlabel_offset: 0.1, xaxis_tick_pos: 'both', grid_stroke_dasharray: 3
});
let frame = Frame(plot, {margin: 0.25});
return frame;
