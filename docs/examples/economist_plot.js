// A bar plot in the style of the Economist magazine. There are roughly 40 densely packed blue bars with random heights between 0 and 70. The y-axis has horizontal grid lines at 0, 25, 50, and 75, while the x-axis ranges between 0 and 40.

// plot parameters
let n = 41;
let ymax = 70;
let xticks = range(0, n+10, 10);
let yticks = linspace(0, 100, 5);

// generate random data
let vals = range(n).map(x => ymax*random(x));

// make bars and y-labels
let bars = VBars(vals, {
  integer: true, bar_fill: '#1e5c99', bar_stroke: 'none'
});
let labs = Points(
  yticks.map(x => [Anchor(Text(x)), [n+3, x+4]]), {size: 1}
);
let plot = Plot([bars, labs], {
  aspect: phi, xlim: [-1, n+4], ylim: [0, ymax+5], xticks, yticks,
  xaxis_tick_pos: 'down', yaxis: false, ygrid: yticks
});

// return framed plot
return Frame(plot, {margin: 0.2});
