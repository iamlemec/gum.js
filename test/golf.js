// copy icon
let x = 0.35;
let r = Rect();
let s = Points([
  [r, [x, x, x]],
  [r, [1-x, 1-x, x]],
]);
let f = Frame(s, {margin: 0.05});
return SVG(f).svg({size: [20, 25]});

// square arrangement
let n = 13;
let r0 = Rect();
let p1 = Points(
    linspace(0.1, 0.9, n).map(x => [r0, [x, x]]),
    {r: 0.1, stroke: 'red', opacity: 0.75}
);
let p2 = Points(
    linspace(0.1, 0.9, n).map(x => [r0, [1 - x, x]]),
    {r: 0.1, stroke: 'blue', opacity: 0.75}
);
let gg = Group([p1, p2]);
return Frame(gg, {margin: 0.05});

// starburst pattern
let n = 12;
let r = Rect();
let s = Group(
  range(-90, 90, 180/n).map(t => Ray(t))
);
let hs = HStack([s, s]);
let vs = VStack([hs, hs]);
let gg = Group([vs, r]);
return Frame(gg, {border: 1, margin: 0.05});

// basic text
let t = Text('hello');
let f = Frame(t, {padding: 0.1, margin: 0.1, border: 1});
return f;

// combined text
let t1 = Text('🍄');
let t2 = Text('gello');
B = x => Frame(x, {padding: 0.15, border: 1});
let t = HStack([B(t1), B(t2)], {expand: true});
return Frame(t, {padding: 0.05});

// rect node
let n = Node('hello');
let f = Frame(n, {margin: 0.1});
return f;

// letter stack
let a = Node('A');
let n1 = VStack([a, a]);
let n2 = HStack([n1, a]);
let f = Frame(n2, {margin: 0.1});
return f;

// symbolic path
let s = SymPath({
  fx: t => exp(-0.1*t)*cos(t),
  fy: t => exp(-0.1*t)*sin(t),
  xlim: [-1, 1], ylim: [-1, 1],
  tlim: [0, 100], N: 1000,
});
return s;

// basic plot
let a = 0.027;
let s = SymPath({
  fx: t => exp(-a*t)*cos(t),
  fy: t => exp(-a*t)*sin(t),
  xlim: [-2, 2], ylim: [-1.1, 1.1],
  tlim: [0, 150], N: 100,
});
let p = Plot(s, {yticks: 7});
return Frame(p, {padding: 0.13});

// goofy plot
let a = 0.027;
let s = SymPath({
  fx: t => exp(-a*t)*cos(t),
  fy: t => exp(-a*t)*sin(t),
  xlim: [-1, 1], ylim: [-1, 1],
  tlim: [0, 150], N: 100,
});
let xt = linspace(-1, 1, 10).map(t => [t, '🍩']);
let yt = linspace(-1, 1, 10).map(t => [t, '🐋']);
let p = Plot(s, {xticks: xt, yticks: yt});
return Frame(p, {margin: 0.1});

// annotated plot
let a = 0.027;
let s1 = SymPath({fy: t => t, xlim: [-2, 2]});
let s2 = SymPath({fy: t => -t, xlim: [-2, 2]});
let s3 = SymPath({fx: t => 0, ylim: [-2, 0], stroke_dasharray: 3, stroke: 'blue'});
let s4 = SymPath({fy: t => 0, xlim: [-2, 0], stroke_dasharray: 3, stroke: 'red'});
let sc = Scatter([
  [0, 0], [2, 2], [-2, -2], [2, -2], [-2, 2], [0, -2], [-2, 0]
]);
let p = Plot([s1, s2, s3, s4, sc], {
  xlim: [-2.5, 2.5], ylim: [-2.5, 2.5],
  xticks: [-2, -1, [0, '🍩'], 1, 2],
  yticks: [-2, -1, [0, '🐋'], 1, 2],
  ticksize: 0.04
});
let f = Frame(p, {padding: [0.15, 0.05, 0.05, 0.15]});
return f;

//interactive opacity

let i = new InterActive(
  {x: new Slider(60)}, (vars) => {
  let r = new Rect({fill: 'red', opacity: vars.x / 100}) 
  return r
  }
)
return i
