// bar plot with default and custom colors
let abar = VBar(3, {fill: '#ff0d57', stroke: 'black'});
let bbar = VBar(8, {fill: '#1e88e5', stroke: 'black'});
let bars = BarPlot([['A', abar], ['B', bbar], ['C', 6]], {
  ylim: [0, 10], yticks: 6, title: 'Example BarPlot',
  xlabel: 'Category', ylabel: 'Value', bar_fill: '#AAA'
});
return Frame(bars, {margin: 0.3});
