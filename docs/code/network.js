// simple network
return Network([
  [['A', ['hello', 'world']], [0.2, 0.5]],
  [['B', 'hello'], [0.8, 0.25]],
  [['C', 'world'], [0.65, 0.75]]
], [
  ['A', 'B'], ['A', 'C']
], {
  size: 0.1, aspect: phi, arrow: [0.02, 0.015],
  node_fill: '#EEE', arrow_fill: 'white'
});
