// bar plot with multibars
let vbar = VBar([[3, '#ff0d57'], [5, '#1e88e5']]);
let bars = BarPlot([['A', 5], ['B', vbar], ['C', 6]], {
  ylim: [0, 10], yticks: 6, title: 'Example BarPlot',
  xlabel: 'Category', ylabel: 'Value'
});
return Frame(bars, {margin: 0.3});
