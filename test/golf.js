// gum logo
let gum = 'gum'.split('').map(Text).map(t => Frame(t, {
  border: 1, padding: [0, -0.35, 0, 0], border_stroke: 'red', adjust: false
}));
return Frame(HStack(gum), {
  border: 1, margin: 0.15, border_stroke: 'blue', border_stroke_dasharray: [10, 6]
});

// save icon
let [mid, rad] = [0.25, 0.06];
let [apt, asz] = [0.17, 0.25];
let vline = VLine({pos: 0.5, ymin: 0, ymax: 1-apt});
let arrow = Polyline([[0.5-asz, 1-apt-asz], [0.5, 1-apt], [0.5+asz, 1-apt-asz]]);
let base = Bezier2Path([0, 1-mid], [
  [0, 1-rad], [[rad, 1], [0, 1]], [1-rad, 1], [[1, 1-rad], [1, 1]], [1, 1-mid]
]);
let shape = Group([vline, base, arrow]);
let frame = Frame(shape, {margin: 0.1});
return SVG(frame, {size: 25, prec: 2});

// copy icon
let x = 0.35;
let s = Scatter(
  [[x, x], [1-x, 1-x]],
  {shape: Rect(), radius: x}
);
let f = Frame(s, {margin: 0.05});
return SVG(f, {size: [20, 25]});

// square arrangement
let n = 16;
let r = Rect();
let p1 = Scatter(
    linspace(0, 1, n).map(x => [x, x]),
    {shape: r, radius: 0.1, stroke: 'red'}
);
let p2 = Scatter(
    linspace(0, 1, n).map(x => [1 - x, x]),
    {shape: r, radius: 0.1, stroke: 'blue'}
);
let gg = Group([p1, p2], {opacity: 0.75});
return Frame(gg, {margin: 0.15});

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
  tlim: [0, 100], N: 1000,
});
let p = Plot(s, {xlim: [-1, 1], ylim: [-1, 1]});
let f = Frame(p, {margin: 0.1});
return f;

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
let p = Plot(s, {xticks: xt, yticks: yt, ticksize: 0.03});
return Frame(p, {margin: 0.1});

// annotated plot
let a = 0.027;
let s1 = Line({x1: -2, y1: 2, x2: 2, y2: -2});
let s2 = SymPath({fy: t => 2*(sqrt(2+t)-1), xlim: [-2, 2], N: 500});
let s3 = VLine(0, {y1: -2, y2: 0, stroke_dasharray: 3, stroke: 'blue'});
let s4 = HLine(0, {x1: -2, x2: 0, stroke_dasharray: 3, stroke: 'red'});
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

// interactive opacity
let i = new InterActive(
    {
        x: new Slider(50, {max: 100, title: 'Opacity'}),
        y: new Slider(50, {max: 100, title: 'Width'})
    },
    (vars) => {
        let [a, w] = [vars.x / 100, vars.y / 100];
        let r = Rect({x2: w, fill: 'red', opacity: a});
        let f = Frame(r, {margin: 0.1});
        return f;
    }
);
return i;

// tex plot
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
  xticks: [-2, -1, [0, Tex('\\alpha')], 1, 2],
  yticks: [-2, -1, [0, Tex('\\beta')], 1, 2],
  ticksize: 0.04
});
let f = Frame(p, {padding: [0.15, 0.05, 0.05, 0.15]});
return f;

// multi plot
let s = [0.5, 0.7, 1.0, 1.4].map(a =>
  SymPath({fy: x => sin(a*x), xlim: [-1, 1]})
);
let t = Scatter([[0, 0.5], [0.5, 0], [-0.5, 0], [0, -0.5]], {radius: 0.015});
let e = Ellipse({cx: 0, cy: 0, rx: 0.5, ry: 0.5});
let r = Scatter([
  [Rect(), [0.5, 0.5]], [Circle(), [-0.5, -0.5]]
], {radius: 0.1});
let p = Plot([...s, e, r, t], {
  xlim: [-1, 1], ylim: [-1, 1], ygrid: true, xgrid: true,
  xlabel: 'time (seconds)', ylabel: 'space (meters)',
  title: 'Spacetime Vibes'
});
let f = Frame(p, {margin: 0.3});
return f;

// complex scatter
let r0 = Rect({stroke: 'red', opacity: 0.5});
let ex = Group([Ray(45), Ray(-45)]);
let hi = Text('hello', {font_family: 'Montserrat', font_weight: 300});
let exhi = HStack([Frame(ex, {margin: 0.3}), hi]);
let s0 = Scatter([
  [-0.3, 0.3], [0.4, 0.6], [-0.5, 0.8]
], {
  shape: exhi, radius: 0.1
});
let p = Plot(s0, {xlim: [-1, 1], ylim: [0, 1]});
let f = Frame(p, {margin: 0.13});
return f;

// simple bars
let b = BarPlot([['A', 5], ['B', 8], ['C', 10], ['D', 6], ['E', 3]]);
return Frame(b, {margin: [0.15, 0.1]});

// multibars
let vb = Bar('v', [[3, 'yellow'], [5, 'lightblue'], [2, 'lightgreen']]);
let b = BarPlot([['A', 5], ['B', vb], ['C', 6]]);
return Frame(b, {margin: [0.15, 0.1]});

// legend example
let args2 = {stroke: 'red', stroke_dasharray: [4, 4], stroke_width: 2};
let leg = Legend([['blue', 'Hello World'], [args2, 'Testing Longer String']]);
let leg1 = Place(leg, [1.4, 1.9], 0.25);
let line1 = SymPath({fy: x => 1.5*x*(2-x), xlim: [0, 2], stroke: 'blue'});
let line2 = SymPath({fy: x => x*(2-x), xlim: [0, 2], ...args2});
let plot = Plot([line1, line2, leg1], {ylim: [0, 2]});
let frame = Frame(plot, {margin: 0.15});
return frame;

/// Expected Utility indiff curves

function guu(vars) {
    let a = vars.a / 100;
    let slope = (1-a)/a;
    let s1 = SymPath({fy: t => 1-t, xlim: [0, 1]});
    let s2 = SymPath({fy: t => slope*t, xlim: [0, a], stroke: 'red', stroke_width: 3});

    let t = 1;
    let c = [];
    while (t > -1/a) {
        c.push(t);
        t -= 0.1;
    }

    indiff_curves = c.map(x => SymPath({
        fy: t => (slope*t) + x,
        xlim: [Math.max(0,-x/slope), (1-x)*a],
        stroke_dasharray: 3
    }));
    tx = `${a}x + (1-${a})z`;

    let scl = Scatter([[a + .05, 1 - a + .02], [5, 5]], {
        radius: 0.015, stroke: 'red', fill: 'red', shape: new Text(tx, {font_size: 10})
    });

    let sc = Scatter([[a, 1-a], [5, 5]], {
        radius: 0.015, stroke: 'red', fill: 'red'
    });

    plots = indiff_curves.concat([s1, s2, sc, scl]);

    let p = Plot(plots, {
      xlim: [0, 1],
      ylim: [0, 1],
      ticksize: 0.03
    });

    return Frame(p, {padding: [0.15, 0.05, 0.05, 0.15]});
}

return InterActive({
    a: new Slider(50, {min:10, max: 100, title: 'a: y = ax + (1-a)z'})
}, guu);

/// CHECK MARK

function guu(vars) {
    let letter = 'U';
    if (vars.a) {
        letter = 'C';
    }

    let a = Node(letter);
    let n1 = VStack([a, a]);
    let n2 = HStack([n1, a]);
    return Frame(n2, {margin: vars.b/1000});
}

return InterActive({
    a: Toggle(true, {title: 'Toggle checked/unchecked'}),
    b: Slider(50, {min: 30, max: 60, title: 'margin'})
}, guu);

/// colors


function guu(vars){
  let x = interpolateVectors([0, 100],[100, 0], vars.x/100)
  return Rect({stroke:'none', fill:`hsl(180, ${x[0]}%, ${x[1]}%)`})
}

return InterActive({
    x: Slider(50, {min: 0, max: 100, title: 'margin'})
}, guu);

// custom axes
let ax = XAxis([[1, 'lo'], [2.1, 'hi']], {lim: [0, 3.2], aspect: 3});
let out = Frame(ax, {margin: [0, 0, 0, 0.5]});
let f = Frame(out, {margin: 0.2});
return f;

let ax = YAxis([[1, 'lo'], [2.1, 'hi']], {lim: [0, 3.2], aspect: 0.3});
let out = Frame(ax, {margin: [0.5, 0, 0, 0]});
let f = Frame(out, {margin: 0.2});
return f;

let ax = Axes({
    xticks: [[1, 'lo'], [2.1, 'hi']],
    yticks: [[1, 'lo'], [2.1, 'hi']],
    xlim: [0, 3], ylim: [0, 3]
})
let f = Frame(ax, {margin: 0.2});
return f;

// vector field
let grid0 = linspace(-1, 1, 11);
let grid = Array.prototype.concat(...grid0.map(x => grid0.map(y => [x, y])));
let fshape = ([x, y]) => Group([
  Circle({cx: 0.5+x, cy: 0.5-y, r: 0.1, fill: 'black'}),
  Line({x1: 0.5, y1: 0.5, x2: 0.5+x, y2: 0.5-y})
]);
let field = Scatter(
  grid.map(p => [fshape(p), p]),
  {radius: 0.04}
);
let p = Plot(field, {
  xlim: [-1.2, 1.2], ylim: [-1.2, 1.2],
  xticks: linspace(-1, 1, 5), yticks: linspace(-1, 1, 5)
});
let f = Frame(p, {margin: 0.13});
return f;

// custom axis anchors
let ln = SymPath({fy: sin, xlim: [0, 2*pi]});
let ax = Plot(ln, {
  xticks: range(1, 7), yticks: range(-1, 2),
  xlim: [0, 2*pi], xanchor: 0, aspect: 1.5
})
let f = Frame(ax, {margin: 0.1});
return f;

// fancy plot
let red = '#ff0d57';
let blue = '#1e88e5';
let pal = x => interpolateHex(blue, red, x);

let xt = linspace(0, 2, 6).slice(1).map(
  x => [x*pi, `${rounder(x, 1)} π`]
);
let yt = linspace(-1, 1, 5);

let f = SymPath({fy: x => -sin(x), xlim: [0, 2*pi]});
let s = SymPoints({
  fy: x => -sin(x), xlim: [0, 2*pi], N: 21,
  fr: (t, x, y) => 0.03+abs(y)/20,
  fs: (t, x, y) => Circle({fill: pal((1+y)/2)})
});

let p = Plot([f, s], {
  aspect: 1.5, xlim: [0, 2*pi], ylim: [-1, 1], labeloffset: [0.05, 0.1],
  xanchor: 0, xticks: xt, yticks: yt, ygrid: true,
  xlabel: 'time', ylabel: 'amplitude', title: 'Inverted Sine Wave'
});
return Frame(p, {margin: 0.2});

// bezier paths
let p0 = [0.2, 0.8];
let p1 = [0.8, 0.2];
let px = [0.3, 0.3];
let path = Path([MoveTo(p0), Bezier2(p1, px)]);
let dots = Scatter([p0, p1, [Circle({fill: 'white'}), px]], {radius: 0.01});
let line1 = Line({p1: p0, p2: px, stroke_dasharray: [5, 5]});
let line2 = Line({p1: p1, p2: px, stroke_dasharray: [5, 5]});
let plot = Plot([path, line1, line2, dots], {
  xlim: [0, 1], ylim: [0, 1], xticks: 6, yticks: 6
});
let frame = Frame(plot, {margin: 0.15});
return frame;

// networks
return Network([
  [['A', ['hello', 'world']], [0.15, 0.5]],
  [['B', 'hello'], [0.85, 0.2]],
  [['C', 'world'], [0.7, 0.8]]
], [
  ['A', 'B'], ['A', 'C']
], {
  radius: 0.1, aspect: phi
});

////// INTERACTIBFG VECTOR FIELD

function guu(vars) {
  let a = vars.a / 50;
  let b = vars.b / 50;
  let grid0 = linspace(-1, 1, 15);
  let grid = Array.prototype.concat(...grid0.map(x => grid0.map(y => [x, y])));
  let fshape = ([x, y]) => {
    let z = interpolateVectors([70, 50, 50],[140, 50, 50], (x*a/2))
    let c = `hsl(${z[0]}, ${z[1]}%, ${z[2]}%)`
    let o = ((a*x)**2 + (b*y)**2)**(1.5)
    return  Group([
    Circle({cx: 0.5+(a*x), cy: 0.5-(b*y), r: 0.1, stroke: c, fill: c, opacity: o}),
    Line({x1: 0.5, y1: 0.5, x2: 0.5+(a*x), y2: 0.5-(b*y), stroke_width: 2, stroke: c, opacity: o})
  ])};
  let field = Scatter(
    grid.map(p => [fshape(p), p]),
    {radius: 0.04}
  );
  let p = Plot(field, {
    xlim: [-1.2, 1.2], ylim: [-1.2, 1.2],
    xticks: linspace(-1, 1, 5), yticks: linspace(-1, 1, 5)
  });
  let f = Frame(p, {margin: 0.13});
  return f;
}

return InterActive({
  a: Slider(50, {min: 1, max: 100, title: 'x-dispersion'}),
  b: Slider(50, {min: 1, max: 100, title: 'y-dispersion'}),
}, guu);function guu(vars) {
  let a = vars.a / 50;
  let b = vars.b / 50;
  let grid0 = linspace(-1, 1, 15);
  let grid = Array.prototype.concat(...grid0.map(x => grid0.map(y => [x, y])));
  let fshape = ([x, y]) => {
    let z = interpolateVectors([70, 50, 50],[140, 50, 50], (x*a/2))
    let c = `hsl(${z[0]}, ${z[1]}%, ${z[2]}%)`
    let o = ((a*x)**2 + (b*y)**2)**(1.5)
    return  Group([
    Circle({cx: 0.5+(a*x), cy: 0.5-(b*y), r: 0.1, stroke: c, fill: c, opacity: o}),
    Line({x1: 0.5, y1: 0.5, x2: 0.5+(a*x), y2: 0.5-(b*y), stroke_width: 2, stroke: c, opacity: o})
  ])};
  let field = Scatter(
    grid.map(p => [fshape(p), p]),
    {radius: 0.04}
  );
  let p = Plot(field, {
    xlim: [-1.2, 1.2], ylim: [-1.2, 1.2],
    xticks: linspace(-1, 1, 5), yticks: linspace(-1, 1, 5)
  });
  let f = Frame(p, {margin: 0.13});
  return f;
}

return InterActive({
  a: Slider(50, {min: 1, max: 100, title: 'x-dispersion'}),
  b: Slider(50, {min: 1, max: 100, title: 'y-dispersion'}),
}, guu);

///BAR PLOT

function guu(vars){
d = {'a': 2, 'b': vars.x, 'c':20, 'd': 13}
b = BarPlot(d, {color:[[17, 100, 45],[78,  80, 45]]})
return Frame(b, {padding: [0.15, 0.05, 0.05, 0.15]});
}

return InterActive({
    x: Slider(10, {min: 0, max: 20, title: 'b'})
}, guu);

///stacked bar

function guu(vars){
d = {'a': {stacked: [[vars.x/4], [2, 'blue'],[2, 'purple']]}, 'b': 8, 'c': 4}
b = BarPlot(d, {color_by:[[17, 100, 45],[78,  80, 45]]})
return Frame(b, {padding: [0.15, 0.05, 0.05, 0.15]});
}

return InterActive({
    x: Slider(10, {min: 0, max: 20, title: 'b'})
}, guu);


///ANIMATIONS

function guu(vars){
        let [a, w] = [vars.x / 100, vars.y / 100];
        let r = Rect({x2: w, fill: 'red', opacity: a});
        let f = Frame(r, {margin: 0.1});
        return f;
}


  let i = new Animation(
    {
        x: 0,
        y: 50,
    }, [
      [{x: [0,100]}, 1000],
      [{y: [50,100]}, 1000]
    ],
    guu);

return i;
