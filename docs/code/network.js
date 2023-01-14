// simple network
return Network([
  ['A', ['hello', 'world'], [0.25 , 0.5], 0.15],
  ['B', 'hello', [0.8, 0.25]],
  ['C', 'world', [0.7, 0.75]]
], [
  ['A', 'B'], ['A', 'C']
], {
  size: 0.1, aspect: phi, directed: true,
  node_fill: '#EEE', arrow_fill: 'white',
  node_border_radius: 0.1
});
