// bar plot with default and custom colors
let abar = Bar({fill: '#ff0d57', stroke: 'black'});
let bbar = Bar({fill: '#1e88e5', stroke: 'black'});
let bars = BarPlot([['A', [abar, 3]], ['B', [bbar, 8]], ['C', 6]], {
  ylim: [0, 10], yticks: 6, title: 'Example BarPlot',
  xlabel: 'Category', ylabel: 'Value', bar_fill: '#AAA'
});
return Frame(bars, {margin: 0.3});
