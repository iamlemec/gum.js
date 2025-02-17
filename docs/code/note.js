// plot the function 1 - x^2 and add a note on the top labeling the function
let line = SymPath({fy: x => 1-x*x, xlim: [-1, 1]});
let note = Note('1 - x^2', {pos: [0.025, 1.1], rad: 0.15, latex: true});
let plot = Plot([line, note], {
  aspect: phi, ylim: [0, 1.5], yticks: 4, grid: true, grid_opacity: 0.1
});
return Frame(plot, {margin: 0.15});
