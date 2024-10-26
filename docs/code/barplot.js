// A plot with three bars with black borders at "A", "B", and "C". The first bar is red and is the shortest, the second bar is blue and is the tallest, while the third bar is gray.
let abar = Bar({fill: red, stroke: 'black'});
let bbar = Bar({fill: blue, stroke: 'black'});
let bars = BarPlot([['A', [abar, 3]], ['B', [bbar, 8]], ['C', 6]], {
  ylim: [0, 10], yticks: 6, title: 'Example BarPlot',
  xlabel: 'Category', ylabel: 'Value', bar_fill: '#AAA'
});
return Frame(bars, {margin: 0.3});
