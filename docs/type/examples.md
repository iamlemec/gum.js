Letters stacked like blocks spelling out the word "gum".
```javascript
let [g, u, m] = 'GUM'.split('').map(t =>
  Node(t, {aspect: 1, fill: '#EEE', border: 5})
);
let s = VStack([g, HStack([u, m])], {expand: false});
return Frame(s, {margin: 0.02});
```

A 25 pixel icon in which an arrow is pointing downward into a curved tray.
```javascript
let [mid, rad] = [0.25, 0.06];
let [apt, asz] = [0.17, 0.25];
let vline = VLine(0.5, {lim: [0, 1-apt]});
let arrow = Polyline([
  [0.5-asz, 1-apt-asz], [0.5, 1-apt], [0.5+asz, 1-apt-asz]
]);
let base = Bezier2Path([0, 1-mid], [
  [0, 1-rad], [[rad, 1], [0, 1]], [1-rad, 1], [[1, 1-rad], [1, 1]], [1, 1-mid]
]);
let shape = Group([vline, base, arrow]);
let frame = Frame(shape, {margin: 0.1});
return SVG(frame, {size: 25, prec: 2});
```

A 20 by 25 pixel icon of two rectangles shaped like pieces of paper partially overlaid on one another.
```javascript
let x = 0.35;
let s = Scatter(
  [[x, x], [1-x, 1-x]],
  {shape: Rect(), size: x}
);
let f = Frame(s, {margin: 0.05});
return SVG(f, {size: [20, 25]});
```

An array of partially overlapping squares depicting the letter "X". The squares for one direction are in red, while the squares in the other direction are in blue.
```javascript
let n = 16;
let r = Rect();
let p1 = Scatter(
    linspace(0, 1, n).map(x => [x, x]),
    {shape: r, size: 0.1, stroke: 'red'}
);
let p2 = Scatter(
    linspace(0, 1, n).map(x => [1 - x, x]),
    {shape: r, size: 0.1, stroke: 'blue'}
);
let gg = Group([p1, p2], {opacity: 0.75});
return Frame(gg, {margin: 0.15});
```

A square grid of four cells, where each cell contains a starburst pattern with 12 lines radiating outwards from a central point.
```javascript
let n = 12;
let r = Rect();
let s = Group(range(-90, 90, 180/n).map(t => Ray(t)));
let hs = HStack([s, s]);
let vs = VStack([hs, hs]);
let gg = Group([vs, r]);
return Frame(gg, {border: 1, margin: 0.05});
```

The word "best"
```javascript
return Text('best');
```

A rectangular box containing the word "hello"
```javascript
return Node('hello', {padding: 0.1, margin: 0.1, border: 1});
```

Two side-by-side rectangles, the left one containing a mushroom emoji, the right one containing the world "hello".
```javascript
let boxes = ['🍄', 'planet'].map(x => Node(x, {padding: 0.15, border: 1}));
let t = HStack(boxes, {expand: true});
return Frame(t, {padding: 0.05});
```

Three boxes containing the letter "A", with two boxes stacked vertically on the left side and one box on the right side.
```javascript
let a = Node('A');
let n1 = VStack([a, a]);
let n2 = HStack([n1, a]);
return Frame(n2, {margin: 0.1});
```

A plot of a curve spiraling inwards counterclockwise, with axes in both directions ranging from -1 to 1.
```javascript
let s = SymPath({
  fx: t => exp(-0.1*t)*cos(t),
  fy: t => exp(-0.1*t)*sin(t),
  tlim: [0, 100], N: 1000,
});
let p = Plot(s, {xlim: [-1, 1], ylim: [-1, 1]});
return Frame(p, {margin: 0.1});
```

A plot of three different increasing curves of varying steepness and multiple points scattered at regular intervals. The x-axis label is "time (seconds)", the y-axis label is "space (meters)", and the title is "Spacetime Vibes". There are axis ticks in both directions with assiated faint grid lines.
```javascript
let s = [0.5, 0.7, 1.0, 1.4].map(a =>
  SymPath({fy: x => sin(a*x), xlim: [-1, 1]})
);
let t = Scatter(
  [[0, 0.5], [0.5, 0], [-0.5, 0], [0, -0.5]], {radius: 0.015}
);
let r = Scatter(
  [[Rect(), [0.5, 0.5]], [Circle(), [-0.5, -0.5]]], {radius: 0.1}
);
let p = Plot([...s, r, t], {
  xlim: [-1, 1], ylim: [-1, 1], ygrid: true, xgrid: true,
  xlabel: 'time (seconds)', ylabel: 'space (meters)', title: 'Spacetime Vibes'
});
return Frame(p, {margin: 0.3});
```

Scatter plot showing three points, each one marked with an "x" and the label "hello". The x-axis ranges from -1 to 1, while the y-axis ranges from 0 to 1.
```javascript
let r0 = Rect({stroke: 'red', opacity: 0.5});
let ex = Frame(Group([Ray(45), Ray(-45)]), {margin: 0.3});
let hi = Text('hello');
let exhi = HStack([ex, hi], {spacing: 0.05});
let s0 = Scatter(
  [[-0.3, 0.3], [0.4, 0.6], [-0.5, 0.8]], {shape: exhi, size: 0.1}
);
let p = Plot(s0, {xlim: [-1, 1], ylim: [0, 1]});
let f = Frame(p, {margin: 0.15});
return f;
```

Bar plot with 5 bars whose labels range from "A" to "E" and whose heights have values between 0 and 10.
```javascript
let b = BarPlot(
  [['A', 5], ['B', 8], ['C', 10], ['D', 6], ['E', 3]], {bar_fill: '#DDD'},
);
return Frame(b, {margin: [0.15, 0.1]});
```

Bar plot with 3 bars whose labels are "A", "B", and "C" and whose heights are values between 0 and 10. The center bar has multiple segments, each with a different color.
```javascript
let vb = VMultiBar([[3, 'yellow'], [5, 'lightblue'], [2, 'lightgreen']]);
let b = BarPlot([['A', 5], ['B', vb], ['C', 6]], {bar_fill: '#DDD'});
return Frame(b, {margin: [0.15, 0.1]});
```

A plot of two lines that are zero at 0 and 2 but are positive inbetween. One of the lines is solid blue while the other line is dashed red. The plot has a legend in the top right naming the blue line "Hello World" and the red line "Testing Longer String".
```javascript
let args1 = {stroke: blue};
let args2 = {stroke: red, stroke_dasharray: 6};
let info = [[args1, 'Hello World'], [args2, 'Testing Longer String']];
let leg = Legend(info, {pos: [1.5, 1.8], rad: 0.45, vspacing: 0.3});
let line1 = SymPath({fy: x => 1.5*x*(2-x), xlim: [0, 2], ...args1});
let line2 = SymPath({fy: x => x*(2-x), xlim: [0, 2], ...args2});
let plot = Plot([line1, line2, leg], {aspect: phi, ylim: [0, 2]});
let frame = Frame(plot, {margin: 0.15});
return frame;
```

A bar plot in the style of the Economist magazine. There are roughly 40 densely packed blue bars with random heights between 0 and 70. The y-axis has horizontal grid lines at 0, 25, 50, and 75, while the x-axis ranges between 0 and 40.
```javascript
let n = 41; let ymax = 70; let yticks = linspace(0, 100, 5);
let vals = range(n).map(x => ymax*random(x));
let bars = VBars(vals, {integer: true, bar_fill: '#1e5c99', bar_stroke: 'none'});
let labs = Scatter(
  yticks.map(x => [Anchor(Text(x)), [n+3, x+4]]), {size: 1}
);
let plot = Plot([bars, labs], {
  aspect: phi, xlim: [-1, n+4], ylim: [0, ymax+5], xticks: range(0, n+10, 10), yticks: 4,
  xaxis_tick_pos: 'down', yaxis: false, ygrid: yticks
});
let frame = Frame(plot, {margin: 0.15});
return frame;
```

A horizontal grid of boxes, each containing an integer. On top of each box is a label indicating which word it is associated with, such as "quick" or "fox". Near the end of the grid, there is an ellipsis box indicating there are many omitted words inbetween.
```javascript
let data = [
  ['the', '2'], ['quick', '1'], ['brown', '2'], ['fox', '1'],
  ['jumped', '1'], ['over', '1'], ['dog', '1'], ['lazy', '0'],
  ['plum', '0'], ['house', '0']
];
let cells = data.map(([w, c]) => VStack([
  Place(Text(w), {rad: [0, 0.15], expand: true, aspect: 1}),
  Node(Text(c), {padding: 0.4, aspect: 1})
]));
let circ = HStack(repeat(Dot(), 3), {spacing: 1});
let dots = Place(circ, {rad: [0.2, 0], expand: true, aspect: 1});
cells.splice(8, 0, VStack([1/2, dots]));
return Frame(HStack(cells), {margin: [0.05, 0, 0.05, 0.05]});
```

Plot of three lines, one in red which is max(0,x), another in blue which is the same but with a slight dip at 0, and a final dashed horizontal line at 0. There is a legend labeling these lines as "ReLU" for the red line and "GELU" for the blue line. The x-axis ranges from -4 to 3, making sure there is a tick at 0.
```javascript
let sigmoid = x => 1/(1+exp(-2*x));
let xlim = [-4, 3]; let ylim = [-1, 3];
let rargs = {stroke: red, stroke_width: 2};
let bargs = {stroke: blue, stroke_width: 2};
let relu = SymPath({fy: x => max(0, x), xlim, ...rargs});
let gelu = SymPath({fy: x => x*sigmoid(x), xlim, ...bargs});
let zero = HLine(0, {lim: xlim, stroke_dasharray: 4});
let leg = Legend([[rargs, 'ReLU'], [bargs, 'GELU']], {
    pos: [-2, 2], rad: 0.55, hspacing: 0.1, vspacing: 0.2
});
let plot = Plot([zero, relu, gelu, leg], {aspect: phi, ylim, xticks: 8});
return Frame(plot, {margin: 0.1});
```

A flow diagram with three nodes arranged horizontally: "Input", "Causal Self Attention", and "Perceptron". There are unidirectional arrows going from left to right, connecting the first and second nodes and the second and third nodes, each with the label "Layer Norm". Each node is a rectangle with slightly rounded corners.
```javascript
let net = Network([
  ['input', 'Input', [0.15, 0.5], [0.1, 0.2]],
  ['attn', ['Causal Self', 'Attention'], [0.5, 0.5], [0.1, 0.4]],
  ['percep', 'Perceptron', [0.85, 0.5], [0.1, 0.2]],
], [
  ['input', 'attn'], ['attn', 'percep']
], {
  aspect: 8, directed: true, node_border_radius: 0.05, arrow_size: [0.04, 0.03]
});
let notes = Scatter([[0.32, 0.4], [0.67, 0.4]], {
    shape: Text('Layer Norm'), size: 0.08
});
return Group([net, notes]);
```

Wide-form plot depicting various curves traversing in the vertical dimension from 0 to 1. Some of the curves span the whole distance, others loop back to the origin, while others form independent loops. The x-axis is labeled "Solutions (x)" and the y-axis is labeled "Deformation path (t)".
```javascript
let path1 = SymPath({fy: x => 6*(x-0.1)*(1.2-3*x), xlim: [0.1, 0.4]});
let path2 = SymPath({fx: y => 0.6 + 0.25*cos(3*y), ylim: [0, 1]});
let ellipse1 = Ellipse({pos: [0.5, 0.3], rad: [0.05, 0.1]});
let ellipse2 = Ellipse({pos: [0.8, 0.7], rad: [0.05, 0.15]});
let line1 = HLine(1); let line2 = VLine(1);
let plot = Plot([path1, path2, ellipse1, ellipse2, line1, line2], {
    aspect: 2, xlim: [0, 1], ylim: [0, 1], xticks: [], yticks: [0, 1],
    xlabel: 'Solutions (x)', ylabel: 'Deformation Path (t)', label_offset: 0.05,
});
let frame = Frame(plot, {margin: 0.15});
return frame;
```

Draw a plot of a function increases from below zero to a maximum value of nbar. Indicate with vertical and horizontal lines where this line cross zero and a positive threshhold gz/alpha. Label these intersection points on the axis, along with nbar and zero. Let the x-axis label be "Standard of Living (y)", the y-axis label be "Population Growth (gL)", and the title be "Modified Demographic Function".
```javascript
let nbar = 2; let ybar = 1; let theta = 1; let gz = 0.5; let alpha = 0.5;
let gza = gz/alpha; let ystar = ybar + gza/theta;
let xlim = [xlo, xhi] = [0, 5]; let ylim = [ylo, yhi] = [-2, 3];
let demo = y => min(nbar, theta*(y-ybar));
let path = SymPath({fy: demo, xlim});
let zero1 = HLine(0, {lim: xlim, opacity: 0.2});
let zero2 = VLine(ybar, {lim: ylim, opacity: 0.2});
let line1 = HLine(gza, {lim: xlim, stroke_dasharray: 3});
let line2 = VLine(ystar, {lim: ylim, stroke_dasharray: 3});
let dot = Scatter([[ystar, gza]], {size: 0.04});
let xticks = [[1, Tex('\\bar{y}')], [ystar, Tex('y^{\\ast}')], [xhi, '']];
let yticks = [[0, '0'], [gz/alpha, Tex('\\frac{g_z}{\\alpha}')], [nbar, Tex('\\bar{n}')], [yhi, '']];
let plot = Plot([path, zero1, zero2, line1, line2, dot], {
  aspect: phi, xlim, ylim, xticks, yticks, xlabel: 'Standard of living (y)',
  ylabel: 'Population growth (gL)', title: 'Modified Demographic Function'
});
let frame = Frame(plot, {margin: 0.25});
return frame;
```

Plot of the path of a line that starts at a high level y0*, then at time t0 begins to decay exponentially down to a lower level y1*. The x-axis has a label for time t0, and the y-axis has labels for y0* and y1*. Each of these are also denoted with dashed lines in the plot. The x-axis label is "Time (t)" and the y-axis label is "Output (y)".
```javascript
let [t0, ymax, yss0, yss1] = [0.2, 1.4, 1.0, 0.7];
let path0 = HLine(1, {x1: 0, x2: t0, stroke_width: 2});
let path1 = SymPath({
    fy: x => min(yss0, yss1 + (yss0-yss1)*exp(-6*(x-t0))),
    xlim: [0, 1], stroke_width: 2
});
let start = VLine(t0, {lim: [0, ymax], stroke_dasharray: [4, 4]});
let steady1 = HLine(1, {lim: [0, 1], stroke_dasharray: [4, 4]});
let steady2 = HLine(yss1, {lim: [0, 1], stroke_dasharray: [4, 4]});
let plot = Plot([path0, path1, start, steady1, steady2], {
    xlim: [0, 1], ylim: [0, ymax], aspect: phi,
    xlabel: 'Time (t)', ylabel: 'Output (y)',
    ticksize: 0.06, xticks: [[t0, Tex('t_0')]],
    yticks: [[yss1, Tex('y^{\\ast}_1')], [1, Tex('y^{\\ast}_0')]]
});
let frame = Frame(plot, {padding: [0.25, 0, 0, 0.25]});
return frame;
```

Plot of two lines that both originate at zero and intersect at a single point, one that is convext and one that is concave. The intersection point is labeled as k1* and k2*, both on the axes and with grid lines. The x-axis label is "Capital Stock 1 (k1)" and the y-axis label is "Capital Stock 2 (k2)".
```javascript
let klim = [0.0, 1.5]; let [a, b] = [1.0, 0.5];
let kzero1 = k1 => a*k1**b; let kzero2 = k2 => a*k2**b;
let kstar = a**(1/(1-b));
let path1 = SymPath({fy: kzero1, xlim: klim});
let path2 = SymPath({fx: kzero2, ylim: klim});
let note1 = Note('\\dot{k}_1=0', {pos: [1.62, 1.24], rad: 0.09, latex: true});
let note2 = Note('\\dot{k}_2=0', {pos: [1.21, 1.6], rad: 0.09, latex: true});
let plot = Plot([path1, path2, note1, note2], {
  aspect: phi, xlim: klim, ylim: klim,
  xaxis_pos: 0, xaxis_tick_pos: 'both', xticks: [[kstar, Tex('k_1^{\\ast}')]], yticks: [[kstar, Tex('k_2^{\\ast}')]],
  xlabel: HStack([Text('Capital Stock 1 '), Tex('(k_1)')]), xlabel_offset: 0.15, xgrid: true,
  ylabel: HStack([Text('Capital Stock 2 '), Tex('(k_2)')]), ylabel_offset: 0.1, ygrid: true,
});
let frame = Frame(plot, {margin: [0.2, 0.1, 0.2, 0.2]});
return frame;
```

A square in the top left and a circle in the bottom right.
```javascript
return Group([
  [Square(), {pos: [0.3, 0.3], rad: 0.15}],
  [Circle(), {pos: [0.7, 0.7], rad: 0.15}]
]);
```

The word "hello!" in a frame with a dashed border and rounded corners.
```javascript
return Node('hello!', {
  padding: 0.1, margin: 0.01, border: 1,
  border_stroke_dasharray: 5, border_radius: 0.05
});
```

A whale emoji in a square box.
```javascript
return Node('🐋', {margin: 0.01});
```

Three donut emojis in boxes with one stacked on top and two arrayed horizontally below.
```javascript
let d = Node('🍩');
let h = HStack([d, d]);
let v = VStack([d, h]);
return Frame(v, {margin: 0.01});
```

A rectangle with aspect ratio 2 placed in the top right and rotated 20 degrees clockwise.
```javascript
return Place(Rect(), {
  pos: [0.6, 0.4], rad: [0.2, 0.1], rotate: 20, invar: true
});
```

A square.
```javascript
return Frame(Rect(), {margin: 0.01});
```

A circle.
```javascript
return Frame(Circle(), {margin: 0.01});
```

A small square missing its top edge.
```javascript
return Polyline([
    [0.3, 0.3], [0.3, 0.7], [0.7, 0.7], [0.7, 0.3]
]);
```

A gray line spiraling clockwise inward in a triangular path. The background is nearly black with rounded corners.
```javascript
let spiral = SymPath({
  fx: t => 0.43 + 0.5*exp(-0.05*t)*cos(t),
  fy: t => 0.48 + 0.5*exp(-0.05*t)*sin(t),
  tlim: [0, 1000], N: 500, stroke: '#BBB'
});
return Frame(spiral, {
  padding: 0.05, border: 1, margin: 0.05,
  border_radius: 0.02, border_fill: '#111'
});
```

A horizontal axis with 5 ticks labeled with emojis for: mount fuji, a rocket, a whale, a watermellon, and a donut.
```javascript
let ticks = zip(linspace(0, 1, 5), ['🗻', '🚀', '🐋', '🍉', '🍩']);
let axis = HAxis(ticks, {tick_size: 0.5, tick_pos: 'both'});
return Frame(axis, {aspect: 5, margin: [0.1, 1.3, 0.1, 0]});
```

A series of closely spaced squares rotating clockwise along a sinusoidal path.
```javascript
let sqr = x => Rotate(Square(), r2d*x, {invar: true});
let boxes = SymPoints({fy: sin, fs: sqr, size: 0.4, xlim: [0, 2*pi], N: 150});
return Frame(Graph(boxes), {margin: 0.1});
```

A plot of a sin function from 0 to 2\*pi. The y-axis has ticks from -1 to 1. The x-axis has ticks from 0 to 2\*pi labeled as fractions of pi and is anchored at y\=0. There are light gray dashed grid lines aligned with the ticks.
```javascript
let line = SymPath({fy: x => -sin(x), xlim: [0, 2*pi]});
let xticks = linspace(0, 2, 6).slice(1).map(x => [x*pi, `${rounder(x, 1)} π`]);
let plot = Plot(line, {
  aspect: phi, xaxis_pos: 0, xticks, yticks: 5, grid: true,
  xlabel: 'phase', ylabel: 'amplitude', title: 'Inverted Sine Wave',
  xlabel_offset: 0.1, xaxis_tick_pos: 'both', grid_stroke_dasharray: 3
});
return Frame(plot, {margin: 0.25});
```

A plot with three bars with black borders at "A", "B", and "C". The first bar is red and is the shortest, the second bar is blue and is the tallest, while the third bar is gray.
```javascript
let abar = VBar(3, {fill: red, stroke: 'black'});
let bbar = VBar(8, {fill: blue, stroke: 'black'});
let bars = BarPlot([['A', abar], ['B', bbar], ['C', 6]], {
  ylim: [0, 10], yticks: 6, title: 'Example BarPlot',
  xlabel: 'Category', ylabel: 'Value', bar_fill: '#AAA'
});
return Frame(bars, {margin: 0.3});
```

Two boxes with text in them that have black borders and gray interiors. The box in the upper left says "hello" and the box in the lower right says "world!".
```javascript
let hello = Node('hello', {fill: '#EEE'});
let world = Node('world!', {fill: '#EEE'});
return Scatter([[hello, [0.33, 0.3]], [world, [0.62, 0.7]]], {size: [0.25, 0.1]});
```

A curved line going from the upper left to the lower right. The left side of the line has a red arrow facing left and the right side has a blue arrow facing right. Both arrows are triangular with black borders.
```javascript
return Edge([0.2, 0.3], [0.8, 0.7], {
  arrow_beg: true, arrow_end: true, arrow_base: true,
  arrow_beg_fill: red, arrow_end_fill: blue,
});
```

A network with a node on the left saying "hello world" and two nodes on the right saying "hello" and "world". There are arrows going from the left node to each of the right nodes. The nodes have gray backgrounds and rounded corners.
```javascript
return Network([
  ['A', ['hello', 'world'], [0.25 , 0.5], 0.15],
  ['B', 'hello', [0.8, 0.25]],
  ['C', 'world', [0.7, 0.75]]
], [
  ['A', 'B'], ['A', 'C']
], {
  aspect: phi, directed: true,
  node_fill: '#EEE', node_border_radius: 0.05
});
```

A horizontal axis with 4 ticks. On the top side, the ticks are labeled "0", "i", "j", and "1". On the bottom side, the middle two ticks are labeled in Latex with "q\_{i,1}" and "q\_{i,2}".
```javascript
let ticks1 = zip([0, 0.35, 0.7, 1], [Tex('0'), Tex('i'), Tex('j'), Tex('1')]);
let ticks2 = zip([0.35, 0.7], [Tex('q_{i,1}'), Tex('q_{j,2}')]);
let axis1 = Axis('h', ticks1, {tick_size: 0.5, tick_pos: 'both'});
let axis2 = Axis('h', ticks2, {tick_size: 0.5, tick_pos: 'both', label_pos: 'out', label_offset: 0});
return Frame(Group([axis1, axis2]), {aspect: 6, margin: [0.05, 1.3, 0.05, 1.3]});
```

A plot of two lines that are shaded below. One line is a steep exponential in blue and the other line is a more shallow exponential in red. The x-axis has tick labels at "1" and "B" and the "B" tick has associated solid vertical grid line. The y-axis has a tick at "0". The x-axis has the lable "Innovation Step Size $(\gamma)$" and the y-axis "Density $(f_k)$". There is a note in the top right of the figure indicating that the probability of exceeding "B" is 10% for the blue line and 60% for the red line.
```javascript
let [αi, αr] = [8, 2]; let B = 1.3;
let xlim = [xlo, xhi] = [1, 2]; let ylim = [ylo, yhi] = [0, sqrt(αi)];
let [fi, fr] = [αi, αr].map(α => (x => sqrt(α)*x**(-α-1)));
let si = SymFill({fy1: 0, fy2: fi, xlim, fill: blue, opacity: 0.4});
let sr = SymFill({fy1: 0, fy2: fr, xlim, fill: red, opacity: 0.4});
let [bi, br] = [fi, fr].map(f => SymPath({fy: f, xlim, stroke: '#333'}));
let bline = VLine(B, {lim: ylim, stroke_width: 2});
let bbox = SymFill({fy1: 0, fy2: yhi, xlim: [B, xhi], fill: '#EEE', stroke: 'none', opacity: 0.5});
let xticks = [[1, '1'], [B, 'B'], [2, '']];
let yticks = [[0, '0'], [sqrt(αi), '']];
let xlabel = HStack([Text('Innovation Step Size '), Tex('(\\gamma)')], {spacing: 0.02});
let ylabel = HStack([Text('Density '), Tex('(f_k)')], {spacing: 0.02});
let tnote = [
  '\\mathbb{P}_i[\\gamma\\ge B] \\approx 10\\%',
  '\\mathbb{P}_r[\\gamma\\ge B] \\approx 60\\%'
]
let note = Place(VStack(tnote.map(Tex), {spacing: 0.5}), {pos: [1.7, 1.7], rad: [0.2, 0.1]});
let plot = Plot([bbox, si, sr, bi, br, bline, note], {
  aspect: phi, yticks, xticks, grid: true, xlabel_offset: 0.13, ylabel_offset: 0.05, xlabel, ylabel
});
return Frame(plot, {margin: [0.15, 0.01, 0.01, 0.2]});
```

Two horizontal lines connected at the left with a vertical line. The top line contains mostly blue circles and one red circle. The bottom line contains mostly red circles that are spaced more widely. There is a thin box on the top line labeled "Low B" and a wider box on the bottom line labeled "High B". At the bottom of the figure there is the text "Productivity >>>".
```javascript
let [B1, B2] = [0.05, 0.2];
let [size, bsize] = [0.02, 0.1];
let [y1, y2] = [0.3, 0.7];
let [b1, b2] = [0.44, 0.65];
let p1 = [0.08, 0.17, b1, 0.52, 0.59];
let p2 = [0.2, 0.4, b2, 0.95];
let base = VLine(0);
let prods = [y1, y2].map(y => HLine(y, {stroke: 'black'}));
let steps1 = Scatter(p1.map(x => [x, y1]), {shape: Circle({fill: blue}), size});
let steps1a = Scatter([[0.36, y1]], {shape: Circle({fill: red}), size: 0.02});
let steps2 = Scatter(p2.map(x => [x, y2]), {shape: Circle({fill: red}), size});
let cross = Group([Circle({fill: blue}), Ray(45), Ray(-45)], {aspect: 1, opacity: 0.6})
let fail = Place(cross, {pos: [0.72, y2], rad: size});
let pat1 = Rect({rect: [b1, y1-bsize, b1+B1, y1+bsize], fill: '#DDD', opacity: 0.75});
let pat2 = Rect({rect: [b2, y2-bsize, b2+B2, y2+bsize], fill: '#DDD', opacity: 0.75});
let label1 = Note('"Low B"', {pos: [0.47, y1-0.15], rad: 0.06});
let label2 = Note('"High B"', {pos: [0.753, y2-0.15], rad: 0.06});
let xlabel = Note('Productivity >>>', {pos: [0.5, 1], rad: 0.1});
let group = Group([
  base, ...prods, pat1, pat2, steps1, steps2, steps1a, fail, label1, label2, xlabel
], {aspect: 1.3});
return Frame(group, {margin: 0.05});
```

A horizontal axis arrows on either end and ticks at "q/\gamma", "Bq/\gamma", "q", "Bq", and "\gamma^{\prime}q$ labeled at the bottom. On the top, "q/\gamma" is labeled with "Prev", "q" is labeled with "Current", and "\gamma^{\prime}q" is labeled with "Next". There is a semi-transparent box ranging from "Bq/\gamma" to "Bq" labeled with "Lagging" on the top left, "Leading" on the top right, and "Patent Coverage" across the bottom.
```javascript
let ticks = [
  [0.1, Tex('q/\\gamma')], [0.3, Tex('B q/\\gamma')], [0.5, Tex('q')],
  [0.7, Tex('B q')], [0.9, Tex('\\gamma^{\\prime} q')]
];
let main = HAxis(ticks, {tick_pos: 'both', label_pos: 'top', tick_size: 0.07});
let tops = [[0.1, 'Prev'], [0.3, ''], [0.5, 'Current'], [0.7, ''], [0.9, 'Next']];
let top = HAxis(tops, {tick_size: 0.05});
let vline = VLine(0.5, {opacity: 0.25, stroke_dasharray: 4});
let shade = Rect({rect: [0.3, 0, 0.7, 1], stroke: 'black', fill: '#BBB', opacity: 0.15});
let lag = Place(Text('Lagging', {stroke: '#444'}), {pos: [0.4, 0.15], rad: 0.08});
let led = Place(Text('Leading', {stroke: '#444'}), {pos: [0.6, 0.15], rad: 0.08});
let pat = Place(Text('Patent Coverage', {stroke: '#444'}), {pos: [0.5, 0.9], rad: 0.18});
let arrowl = Arrowhead(180, {pos: [0, 0.5], rad: [0.02, 0.04]});
let arrowr = Arrowhead(0, {pos: [1, 0.5], rad: [0.02, 0.04]});
let group = Group([vline, shade, main, top, lag, led, pat, arrowl, arrowr], {aspect: 3});
return Frame(group, {margin: 0.05});
```

A plot with only an x-axis with ticks, dashed grid lines, and labels at "q/\gamma", "Bq/\gamma", "q", "Bq", and "\gamma^{\prime}q". There is a steep exponential decay starting at "q" in blue on the top side of the axis and a shallow exponential decay starting at "q" on the bottom side in red. There is a semi-transparent box between "Bq/\gamma" and "Bq".
```javascript
let [αi, αr] = [8, 2]; let B = 1.3;
let xlim = [xlo, xhi] = [-0.025, 1.025];
let xlim1 = [0.4, 1];
let [fi, fr] = [αi, αr].map(α => (x => sqrt(α)*x**(-α-1)));
let fi1 = x => 0.5-0.02*fi(1+x-0.6);
let fr1 = x => 0.5+0.07*fr(1+x-0.6);
let si = SymFill({fy2: 0.5, fy1: fi1, xlim: xlim1, fill: '#1e88e5', opacity: 0.5});
let sr = SymFill({fy2: 0.5, fy1: fr1, xlim: xlim1, fill: '#ff0d57', opacity: 0.5});
let ticks = [
  [0.1, Tex('q/\\gamma')], [0.25, Tex('B q/\\gamma')], [0.4, Tex('q')],
  [0.6, Tex('B q')], [0.8, Tex('\\gamma^{\\prime} q')]
];
let main = HAxis(ticks, {
  tick_pos: 'both', label_pos: 'top', tick_size: 0.035, label_offset: 10, lim: xlim,
});
let pat = Place(Text('Patent', {stroke: '#444'}), {pos: [0.52, 0.07], rad: 0.08});
let vlines = [0.1, 0.4, 0.8].map(x => VLine(x, {opacity: 0.25, stroke_dasharray: 4}));
let shade = Rect({
  rect: [0.25, 0, 0.6, 1], stroke: 'black', fill: '#BBB', opacity: 0.15
});
let arrowl = Arrowhead(180, {pos: [xlo, 0.5], rad: [0.02, 0.03]});
let arrowr = Arrowhead(0, {pos: [xhi, 0.5], rad: [0.02, 0.03]});
let group = Group([...vlines, shade, main, arrowl, arrowr, si, sr, pat], {aspect: 2});
return Frame(group, {margin: [0.06, 0.03]});
```

A plot with an exponentially decaying line. It is divided horizontally at a point "R" with a dashed line. To the left of "R" it is shaded dark gray and labeled "Research", and to the right of "R" it is shaded light gray and labeled "Production". There are also x-axis ticks a "0" and "1" and y-axis ticks at "0". The x-axis is labeled "Worker Index $(i)$" and the y-axis is labeled "Research Aptitude ($a_i$). The graph is titled "Research Aptitude Distribution".
```javascript
let [β, R] = [0.5, 0.2];
let xlim = [xlo, xhi] = [0.0001, 1];
let ylim = [ylo, yhi] = [0, 5];
let f = x => min(yhi, (1-β)*x**(-β));
let sr = SymFill({fy1: 0, fy2: f, xlim: [xlo, R], fill: '#555', opacity: 0.4, N: 250});
let sp = SymFill({fy1: 0, fy2: f, xlim: [R, xhi], fill: '#BBB', opacity: 0.4, N: 250});
let b = SymPath({fy: f, xlim, stroke: '#333', N: 250});
let bline = VLine(R, {lim: ylim, stroke_dasharray: 3});
let xticks = [[0, '0'], [1, '1'], [R, 'R'], [2, '']];
let xlabel = HStack([Text('Worker Index '), Tex('(i)')]);
let ylabel = HStack([Text('Research Aptitude '), Tex('(a_i)')]);
let rnote = Note('Research', {pos: [0.1, 0.7], rad: 0.08});
let pnote = Note('Production', {pos: [0.5, 0.3], rad: 0.1});
let plot = Plot([sr, sp, b, bline, rnote, pnote], {
  aspect: 1.5, yticks: [0], xticks, xlabel_offset: 0.13,
  ylabel_offset: 0.05, xlabel, ylabel, ylim, title: 'Research Aptitude Distribution'
});
return Frame(plot, {margin: 0.2});
```

A plot with three lines: a horizontal line at height $\frac{\eta}{\alpha\rho}$ labeled "SMB", a decresing line starting at the same point labeled "PMB\*", and an increasing line starting at "1" labeled "SMC\=PMC\*". The intersections of these lines are market with grid lines and are labeled "Equil" and "Efficient". The x-axis ranges from "0" to "1" and is labeled "Researcher Share (R)".
```javascript
let [alpha, eta, rho] = [1, 0.1, 0.05];
let [rstar, rhat] = [0.25, 0.5];
let smb0 = eta/(alpha*rho);
let xlim = [0, 1]; let N = 500;
let mc = r => 1/(1-r);
let smb = r => smb0;
let pmb = r => (eta/alpha)/(rho+eta*r);
let line_mc = SymPath({fy: mc, xlim: [0, 0.75], N});
let line_smb = SymPath({fy: smb, xlim: [0, 1], N});
let line_pmb = SymPath({fy: pmb, xlim: [0, 1], N});
let note_mc = Note('SMC=PMC*', {pos: [0.758, 4.23], rad: 0.07});
let note_smb = Note('SMB', {pos: [1.055, 2.02], rad: 0.03});
let note_pmb = Note('PMB*', {pos: [1.06, 0.68], rad: 0.035});
let dots = Scatter([[rstar, 1.34], [rhat, 2]], {size: 0.008});
let label_smb = Tex('\\frac{\\eta}{\\alpha\\rho}');
let xticks = [[0, '0'], [rstar, 'Equil'], [rhat, 'Efficient'], [1, '1']];
let yticks = [[0, '0'], [1, '1'], [smb0, label_smb], [4, '']];
let plot = Plot([line_mc, line_smb, line_pmb, note_mc, note_smb, note_pmb, dots], {
  aspect: phi, xlim: [0, 1], ylim: [0, 4], xticks, yticks, grid: true,
  grid_opacity: 0.15, xlabel: 'Researcher Share (R)'
});
return Frame(plot, {margin: [0.15, 0.1, 0.15, 0.25]});
```

Two by two table with columns "Product and "¬ Product" and rows "Patent" and "¬ Patent". The cell values in the table are "Protected Innovation" and "Strategic Patents" in the first row and "Secrecy" and "Incation" in the second row. The column labels are in blue and the row labels are in red.
```javascript
function make_node(t, c, b, s) {
  let text = VStack(t.map(s => Text(s, {stroke: c})), {expand: false});
  let place = Place(text, {rad: [0.4, s*t.length]});
  return Frame(place, {border: b});
}
let [b, c] = [['Product'], ['¬ Product']].map(s => make_node(s, blue, 0, 0.17));
let [d, g] = [['Patent'], ['¬ Patent']].map(s => make_node(s, red, 0, 0.12));
let [e, f, h, i] = [['Protected', 'Innovation'], ['Strategic', 'Patents'], ['Secrecy'], ['Inaction']].map(
  s => make_node(s, 'black', 1, 0.12)
);
let grid1 = VStack([
  [HStack([[Spacer(), 0.25], b, c]), 0.25],
  [HStack([[d, 0.25], e, f]), 0.75/2],
  [HStack([[g, 0.25], h, i]), 0.75/2],
]);
return Frame(grid1, {aspect: phi, margin: 0.05});
```

A plot of two lines: one blue one labeled "No Stretegic Patents" and one red one labeled "Strategic Patents". The x-axis is labeled "Firm Productivity" and the y-axis is labeled "Complementarity".
```javascript
let xlim = [1, 2]; let ylim = [0, 1];
let line1 = SymPath({fy: x => 0.5/x**2, xlim, stroke: '#ff0d57', stroke_width: 2});
let line2 = SymPath({fy: x => 1 - 0.5*1/x**2, xlim, stroke: '#1e88e5', stroke_width: 2});
let note1 = Place(
  Node(['No Strategic', 'Patents'], {border: 0}), {pos: [1.3, 0.84], rad: 0.14}
);
let note2 = Place(
  Node(['Strategic', 'Patents'], {border: 0}), {pos: [1.3, 0.16], rad: 0.11}
);
let dot = Place(Dot(), {pos: [1, 0.5], rad: 0.01});
let plot = Plot([line1, line2, note1, note2, dot], {
  xlim, ylim, aspect: 1.2, xticks: [], yticks: [],
  xlabel: 'Firm Productivity', ylabel: 'Complementarity',
  xlabel_offset: 0.07, ylabel_offset: 0.07,
});
let frame = Frame(plot, {margin: [0.2, 0.05, 0.1, 0.15]});
return frame;
```

Four wide nodes with the words "scented", "large", and "liquid" (in blue), and "OxiClean". There are arrows down to four more nodes with the same words but "liquid" is changed to "pods" (in red). The arrow for the changed node is filled in. Below that there is a horizontal line, then an array of numbers "0", "0", "1" (in red), and "0". Below that is a filled in arrow pointing to the text "25% novelty".
```javascript
let cells1 = [['scented'], ['large'], ['liquid', {text_stroke: 'blue'}], ['OxiClean']];
let cells2 = [['scented'], ['large'], ['pods', {text_stroke: 'red'}], ['OxiClean']];
let aprops = [{}, {}, {arrow_fill: '#CCC', arrow_base: true}, {}]
let vals = [[0], [0], [1, {stroke: 'red'}], [0]];
let row1 = HStack(cells1.map(([s, a]) => Node(s, {aspect: 3, padding: 0.2, ...a})));
let row2 = HStack(cells2.map(([s, a]) => Node(s, {aspect: 3, padding: 0.2, ...a})));
let arrow1 = HStack(aprops.map(a =>
  Edge([0.5, 0], [0.5, 1], {arrow: true, arrow_size: [0.1, 0.08], ...a})
));
let arrow2 = Edge([0.5, 0], [0.5, 1], {
  arrow: true, arrow_size: [0.03, 0.15], arrow_fill: '#CCC', arrow_base: true
});
let nums = HStack(vals.map(([s, a]) =>
  Node(`${s}`, {flex: true, padding: 0, border: 0, ...a})
));
let line = HLine(0.5);
let result = Node('25% novelty', {flex: true, border: 0});
let rows = VStack([
  [row1, 0.1], [arrow1, 0.25], [row2, 0.1], [line, 0.15],
  [nums, 0.1], [Spacer(), 0.03], [arrow2, 0.15], [Spacer(), 0.03],
  [result, 0.1]
]);
let nn = (s, a) => Node(s, {flex: true, border: 0, ...a});
return Frame(rows, {margin: 0.05});
```

Three rows of nodes connected by lines. The first row has three nodes for product categories 1, 2, and 3. The second row has three nodes for Wikipedia text 1, 2, and 3. And the third row has five notes for patent abstract 1 through 5. The first two rows are connected by bi-directional filled in arrows. The second and third rows are partially connected by curved lines.
```javascript
let locs = range(5).map(i => 0.2*i+0.1);
let cells1 = [null, ...range(1, 4).map(i => ['Product', `Category ${i}`]), null];
let cells2 = [null, ...range(1, 4).map(i => ['Wikipedia', `Text ${i}`]), null];
let cells3 = range(1, 6).map(i => ['Patent', `Abstract ${i}`]);
let noder = s => (s == null) ? Spacer() : Node(s, {
  aspect: 3, padding: 0.2, flex: true, border_radius: 0.05
});
let [row1, row2, row3] = [cells1, cells2, cells3].map(
  c => HStack(c.map(noder), {spacing: 0.02})
);
let bidi = Edge([0.5, 0], [0.5, 1], {
  arrow_beg: true, arrow_end: true, arrow_size: [0.1, 0.075], arrow_fill: '#DDD', arrow_base: true
});
let edges1 = HStack([Spacer(), bidi, bidi, bidi, Spacer()]);
let elocs2 = [[0, 1], [1, 1], [2, 3], [3, 2], [4, 3]].map(
  ([x1, x2]) => [[locs[x1], 1], [locs[x2], 0]]
);
let edges2 = Group(elocs2.map(([p1, p2]) => Edge(p1, p2)));
let rows = VStack([row1, edges1, row2, edges2, row3], {aspect: phi});
return Frame(rows, {margin: 0.05});
```

Four by three grid of boxes, each with a different emoji in it. The emojis are a random selection of fruits and candies.
```javascript
let data = [
  '🍩🍦🍨🍫🍌',
  '🍕🍉🍒🍇🍐',
  '🥝🍎🍓🍬🍪',
]
let make_blocks = s => [...s].map(c => Node(c, {aspect: 1}));
let rows = data.map(make_blocks);
let stack = VStack(rows.map(HStack), {expand: false});
return Frame(stack, {margin: 0.05});
```

Plot of a sine function where the line markers vary in color from blue to red as the function value changes and the marker size increases with the amplitude. The x-axis is labeled "phase" and the y-axis is labeled "amplitude". The plot is titled "Inverted Sine Wave".
```javascript
let xlim = [0, 2*pi], ylim = [-1, 1];
let func = x => -sin(x);
let pal = x => interpolateHex('#1e88e5', '#ff0d57', x);
let xticks = linspace(0, 2, 6).slice(1).map(x => [x*pi, `${rounder(x, 1)} π`]);
let line = SymPath({fy: func, xlim});
let points = SymPoints({
  fy: func, xlim, N: 21, size: 0.04,
  fs: (x, y) => Circle({fill: pal((1+y)/2), rad: (1+abs(y))/2})
});
let plot = Plot([line, points], {
  xlim, ylim, xanchor: 0, aspect: 1.5, xaxis_tick_pos: 'both',
  xticks, yticks: 5, xgrid: true, ygrid: true, xlabel_offset: 0.1,
  xlabel: 'phase', ylabel: 'amplitude', title: 'Inverted Sine Wave',
  xgrid_stroke_dasharray: 3, ygrid_stroke_dasharray: 3
});
return Frame(plot, {margin: 0.25});
```