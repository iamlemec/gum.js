// A plot with three lines: a horizontal line at height $\frac{\eta}{\alpha\rho}$ labeled "SMB", a decresing line starting at the same point labeled "PMB\*", and an increasing line starting at "1" labeled "SMC\=PMC\*". The intersections of these lines are market with grid lines and are labeled "Equil" and "Efficient". The x-axis ranges from "0" to "1" and is labeled "Researcher Share (R)".
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
let dots = Points([[rstar, 1.34], [rhat, 2]], {size: 0.008});
let label_smb = Tex('\\frac{\\eta}{\\alpha\\rho}');
let xticks = [[0, '0'], [rstar, 'Equil'], [rhat, 'Efficient'], [1, '1']];
let yticks = [[0, '0'], [1, '1'], [smb0, label_smb], [4, '']];
let plot = Plot([line_mc, line_smb, line_pmb, note_mc, note_smb, note_pmb, dots], {
  aspect: phi, xlim: [0, 1], ylim: [0, 4], xticks, yticks, grid: true,
  grid_opacity: 0.15, xlabel: 'Researcher Share (R)'
});
return Frame(plot, {margin: [0.15, 0.1, 0.15, 0.25]});

// Two by two table with columns "Product and "¬ Product" and rows "Patent" and "¬ Patent". The cell values in the table are "Protected Innovation" and "Strategic Patents" in the first row and "Secrecy" and "Incation" in the second row. The column labels are in blue and the row labels are in red.
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

// A plot of two lines: one blue one labeled "No Stretegic Patents" and one red one labeled "Strategic Patents". The x-axis is labeled "Firm Productivity" and the y-axis is labeled "Complementarity".
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

// Four wide nodes with the words "scented", "large", and "liquid" (in blue), and "OxiClean". There are arrows down to four more nodes with the same words but "liquid" is changed to "pods" (in red). The arrow for the changed node is filled in. Below that there is a horizontal line, then an array of numbers "0", "0", "1" (in red), and "0". Below that is a filled in arrow pointing to the text "25% novelty".
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

// Three rows of nodes connected by lines. The first row has three nodes for product categories 1, 2, and 3. The second row has three nodes for Wikipedia text 1, 2, and 3. And the third row has five notes for patent abstract 1 through 5. The first two rows are connected by bi-directional filled in arrows. The second and third rows are partially connected by curved lines.
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

// Four by three grid of boxes, each with a different emoji in it. The emojis are a random selection of fruits and candies.
let data = [
  '🍩🍦🍨🍫🍌',
  '🍕🍉🍒🍇🍐',
  '🥝🍎🍓🍬🍪',
]
let make_blocks = s => [...s].map(c => Node(c, {aspect: 1}));
let rows = data.map(make_blocks);
let stack = VStack(rows.map(HStack), {expand: false});
return Frame(stack, {margin: 0.05});

// Plot of a sine function where the line markers vary in color from blue to red as the function value changes and the marker size increases with the amplitude. The x-axis is labeled "phase" and the y-axis is labeled "amplitude". The plot is titled "Inverted Sine Wave".
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
