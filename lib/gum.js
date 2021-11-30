// gum.js

/**
 ** defaults
 **/

// namespace
let ns_svg = 'http://www.w3.org/2000/svg';

// sizing
let size_base = 250;
let rect_base = [0, 0, size_base, size_base];
let frac_base = [0, 0, 1, 1];
let prec_base = 13;

// fonts
let font_family_base = 'sans-serif';
let font_size_base = 12;

// text sizer
let textSizer = null;
function setTextSizer(sizer) {
    textSizer = sizer;
}

// use canvas sizer
function canvasTextSizer(ctx, text, args) {
    let {family, size, actual} = args ?? {};
    family = family ?? font_family_base;
    size = size ?? font_size_base;
    actual = actual ?? false;

    ctx.font = `${size}px ${family}`;
    let met = ctx.measureText(text);

    let x, y, w, h;
    if (actual) {
        x = -met.actualBoundingBoxLeft;
        y = -met.actualBoundingBoxDescent;
        w = met.actualBoundingBoxRight - x;
        h = met.actualBoundingBoxAscent - y;
    } else {
        x = 0;
        y = 0;
        w = met.width;
        h = size;
    }

    return [x, y, w, h];
}

// try for browser environment
try {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    textSizer = function(text, args) {
        return canvasTextSizer(ctx, text, args);
    }
} catch (error) {
    console.log(error);
}

/**
 ** general utils
 **/

function* gzip(...iterables) {
    let iterators = iterables.map(i => i[Symbol.iterator]());
    while (true) {
        let results = iterators.map(iter => iter.next());
        if (results.some(res => res.done)) {
            return;
        } else {
            yield results.map(res => res.value);
        }
    }
}

function zip(...iterables) {
    return [...gzip(...iterables)];
}

function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}

function cumsum(arr, first) {
    let sum = 0;
    let ret = arr.map(x => sum += x);
    return (first ?? true) ? [0, ...ret] : ret;
}

function range(i0, i1, step) {
    step = step ?? 1;
    [i0, i1] = (i1 === undefined) ? [0, i0] : [i0, i1];
    let n = Math.floor((i1-i0)/step);
    return [...Array(n).keys()].map(i => i0 + step*i);
}

function linspace(x0, x1, n) {
    let step = (x1-x0)/(n-1);
    return [...Array(n).keys()].map(i => x0 + step*i);
}

/**
 ** coordinate utils
 **/

// project fraction coordinates
// prect — outer rect (absolute)
// frect — inner rect (fraction)
function map_coords(prect, frect, aspect) {
    let [pxa, pya, pxb, pyb] = prect;
    let [fxa, fya, fxb, fyb] = frect;

    let [pw, ph] = [pxb - pxa, pyb - pya];
    let [fw, fh] = [fxb - fxa, fyb - fya];

    let [pxa1, pya1] = [pxa + fxa*pw, pya + fya*ph];
    let [pxb1, pyb1] = [pxa + fxb*pw, pya + fyb*ph];

    if (aspect != null) {
        let [pw1, ph1] = [fw*pw, fh*ph];
        let asp1 = pw1/ph1;

        if (asp1 == aspect) { // just right
        } else if (asp1 > aspect) { // too wide
            let pw2 = aspect*ph1;
            let dpw = pw1 - pw2;
            pxa1 += 0.5*dpw;
            pxb1 -= 0.5*dpw;
        } else if (asp1 < aspect) { // too tall
            let ph2 = pw1/aspect;
            let dph = ph2 - ph1
            pya1 -= 0.5*dph;
            pyb1 += 0.5*dph;
        }
    }

    return [pxa1, pya1, pxb1, pyb1];
}

// convenience mapper for rectangle positions
function pos_rect(r) {
    if (r == null) {
        return frac_base;
    } else if (!isNaN(r)) {
        let rs = Number(r);
        return [0, 0, rs, rs];
    } else if (r.length == 2) {
        let [rx, ry] = r;
        return [0, 0, rx, ry];
    } else {
        return r;
    }
}

function pad_rect(p, base) {
    let [xa, ya, xb, yb] = base ?? frac_base;
    if (p == null) {
        return [xa, ya, xb, yb];
    } else if (typeof(p) == 'number') {
        return [xa+p, ya+p, xb-p, yb-p];
    } else if (p.length == 2) {
        let [px, py] = p;
        return [xa+px, ya+py, xb-px, yb-py];
    } else {
        let [pxa, pya, pxb, pyb] = p;
        return [xa+pxa, ya+pya, xb-pxb, yb-pyb];
    }
}

function rad_rect(p, r0) {
    let x, y, r, rx, ry;
    if (p.length == 1) {
        [r, ] = p;
        [x, y] = [0.5, 0.5];
        [rx, ry] = [r, r];
    } else if (p.length == 2) {
        [x, y] = p;
        [rx, ry] = (typeof(r0) == 'number') ? [r0, r0] : r0;
    } else if (p.length == 3) {
        [x, y, r] = p;
        [rx, ry] = [r, r];
    } else if (p.length == 4) {
        [x, y, rx, ry] = p;
    }
    return [x-rx, y-ry, x+rx, y+ry];
}

function merge_rects(rects) {
    let [xa, ya, xb, yb] = range(4)
        .map(i => rects.map(r => r[i]));
    return [
        Math.min(...xa), Math.min(...ya),
        Math.max(...xb), Math.max(...yb)
    ];
}

function rect_dims(rect) {
    let [xa, ya, xb, yb] = rect;
    let [w, h] = [xb - xa, yb - ya];
    return [w, h];
}

function rect_aspect(rect) {
    let [w, h] = rect_dims(rect);
    return w/h;
}

/**
 ** string formatters
 **/

function demangle(k) {
    return k.replace('_', '-');
}

function rounder(x, prec) {
    prec = prec ?? prec_base;

    let suf;
    if (typeof(x) == 'string' && x.endsWith('px')) {
        x = Number(x.substr(0, x.length-2));
        suf = 'px';
    } else {
        suf = '';
    }

    let ret;
    if (typeof(x) == 'number') {
        ret = x.toFixed(prec);
        ret = ret.replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '');
    } else {
        ret = x;
    }

    return ret + suf;
}

function props_repr(d, prec) {
    return Object.entries(d)
        .map(([k, v]) => `${demangle(k)}="${rounder(v, prec)}"`)
        .join(' ');
}

/**
 ** core classes
 **/

class Context {
    constructor(args) {
        let {rect, prec, size, ...attr} = args ?? {};
        this.rect = rect ?? rect_base;
        this.size = size;
        this.prec = prec;
        this.attr = attr;
    }

    map(frect, aspect) {
        let rect1 = map_coords(this.rect, frect, aspect);
        return new Context({rect: rect1, prec: this.prec});
    }
}

class Element {
    constructor(tag, unary, args) {
        let {aspect, ...attr} = args ?? {};
        this.tag = tag;
        this.unary = unary;
        this.aspect = aspect ?? null;
        this.attr = attr;
    }

    props(ctx) {
        return this.attr;
    }

    inner(ctx) {
        return '';
    }

    svg(ctx) {
        ctx = ctx ?? new Context();

        let props = props_repr(this.props(ctx), ctx.prec);
        let pre = props.length > 0 ? ' ' : '';

        if (this.unary) {
            return `<${this.tag}${pre}${props} />`;
        } else {
            return `<${this.tag}${pre}${props}>${this.inner(ctx)}</${this.tag}>`;
        }
    }
}

class Container extends Element {
    constructor(children, args) {
        let {tag, aspect, clip, ...attr} = args ?? {};
        tag = tag ?? 'g';
        clip = clip ?? false;

        // handle singleton
        if (children instanceof Element) {
            children = [children];
        }

        // handle default positioning
        children = children
            .map(c => c instanceof Element ? [c, null] : c)
            .map(([c, r]) => [c, pos_rect(r)]);

        // inherit aspect of clipped contents
        if (aspect == null && clip) {
            let ctx = new Context({rect: frac_base});
            let rects = children.map(([c, r]) => ctx.map(r, c.aspect).rect);
            let total = merge_rects(rects);
            aspect = rect_aspect(total);
        }

        // pass to Element
        let attr1 = {aspect: aspect, ...attr};
        super(tag, false, attr1);
        this.children = children;
    }

    inner(ctx) {
        let inside = this.children
            .map(([c, r]) => c.svg(ctx.map(r, c.aspect)))
            .join('\n');
        return `\n${inside}\n`;
    }
}

class SVG extends Container {
    constructor(children, args) {
        let {clip, ...attr} = args ?? {};
        clip = clip ?? true;
        let attr1 = {tag: 'svg', clip: clip, ...args};
        super(children, attr1);
    }

    props(ctx) {
        let [w, h] = ctx.size;
        let box = `0 0 ${w} ${h}`;
        let base = {viewBox: box, xmlns: ns_svg};
        return {...base, ...this.attr};
    }

    svg(args) {
        let {size, prec} = args ?? {};
        size = size ?? size_base;

        let w, h;
        if (typeof(size) == 'number') {
            if (this.aspect == null) {
                size = [size, size];
            } else if (this.aspect >= 1) {
                size = [size, size/this.aspect];
            } else {
                size = [size*this.aspect, size];
            }
        }

        let rect = [0, 0, ...size];
        let ctx = new Context({rect: rect, size: size, prec: prec});
        return super.svg(ctx);
    }
}

/**
 ** layout classes
 **/

class Group extends Container {
    constructor(children, args) {
        super(children, args);
    }
}

class Frame extends Container {
    constructor(child, args) {
        let {padding, margin, border, aspect, ...attr} = args ?? {};
        padding = padding ?? 0;
        margin = margin ?? 0;

        // get box sizes
        let mrect = pad_rect(margin);
        let prect = pad_rect(padding);
        let trect = pad_rect(padding, mrect);

        // gather children
        let children = [[child, trect]];
        if (border != null) {
            let rargs = {stroke_width: border, aspect: aspect};
            let rect = new Rect(rargs);
            children.push([rect, mrect]);
        }

        // compute eventual aspect
        if (aspect == null && child.aspect != null) {
            let [tw, th] = rect_dims(trect);
            aspect = child.aspect*(th/tw);
        }

        // pass to Container
        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
    }
}

class VStack extends Container {
    constructor(children, args) {
        let {expand, aspect, attr} = args ?? {};
        expand = expand ?? true;

        if (children.length == 0) {
            return super([], {aspect: aspect, ...attr});
        }

        // get children, heights, and aspects
        let n = children.length;
        let [elements, heights] = zip(...children
            .map(c => (c instanceof Element) ? [c, 1/n] : c)
        );
        let aspects = elements.map(c => c.aspect);

        // adjust for aspects
        if (expand) {
            heights = zip(heights, aspects).map(([h, a]) => h/(a ?? 1));
            let total = sum(heights);
            heights = heights.map(h => h/total);
        }

        // convert to cumulative intervals
        let pos = 0;
        let inter = heights.map(y =>
            (typeof(y) == 'number') ? [pos, pos += y] : [y[0], pos = y[1]]
        );

        // compute child boxes
        children = zip(elements, inter)
            .map(([c, [fh0, fh1]]) => [c, [0, fh0, 1, fh1]]);

        // use imputed aspect if null
        if (aspect == null) {
            let aspects0 = zip(heights, aspects)
                .filter(([h, a]) => a != null)
                .map(([h, a]) => h*a);
            aspect = (aspects0.length > 0) ? Math.max(...aspects0) : null;
        }

        // pass to Container
        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
    }
}

class HStack extends Container {
    constructor(children, args) {
        let {expand, aspect, attr} = args ?? {};
        expand = expand ?? true;

        if (children.length == 0) {
            return super([], {aspect: aspect, ...attr});
        }

        // get children, heights, and aspects
        let n = children.length;
        let [elements, widths] = zip(...children
            .map(c => (c instanceof Element) ? [c, 1/n] : c)
        );
        let aspects = elements.map(c => c.aspect);

        // adjust for aspects
        if (expand) {
            widths = zip(widths, aspects).map(([w, a]) => w*(a ?? 1));
            let total = sum(widths);
            widths = widths.map(w => w/total);
        }

        // convert to cumulative intervals
        let pos = 0;
        let inter = widths.map(x =>
            (typeof(x) == 'number') ? [pos, pos += x] : [x[0], pos = x[1]]
        );

        // find child boxes
        children = zip(elements, inter)
            .map(([c, [fw0, fw1]]) => [c, [fw0, 0, fw1, 1]]);

        // use imputed aspect if null
        if (aspect == null) {
            let aspects0 = zip(widths, aspects)
                .filter(([w, a]) => a != null)
                .map(([w, a]) => a/w);
            aspect = (aspects0.length > 0) ? Math.max(...aspects0) : null;
        }

        // pass to Container
        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
    }
}

class Point extends Container {
    constructor(child, args) {
        let {x, y, r, ...attr} = args ?? {};
        x = x ?? 0.5;
        y = y ?? 0.5;
        r = r ?? 0.5;
        r = (typeof(r) == 'number') ? [r, r] : r;

        let pos = [x, y, ...r];
        let rect = rad_rect(pos);
        let children = [[child, rect]];

        super(children, attr);
    }
}

class Scatter extends Container {
    constructor(locs, args) {
        let {r, ...attr} = args ?? {};
        r = r ?? 0.5;
        let children = locs.map(([c, p]) => [c, rad_rect(p, r)]);
        super(children, attr);
    }
}

/**
 ** basic geometry
 **/

// this can have an aspect, which is utilized by layouts
class Spacer extends Element {
    constructor(args) {
        super(null, null, args);
    }

    svg(ctx) {
        return '';
    }
}

// unary | aspect
class Ray extends Element {
    constructor(theta, attr) {
        theta = theta ?? -45;

        // map into (-90, 90];
        if (theta == -90) {
            theta = 90;
        } else if (theta < -90 || theta > 90) {
            theta = ((theta + 90) % 180) - 90;
        }

        // map theta into direction and aspect
        let direc;
        let aspect;
        if (theta == 90) {
            direc = Infinity;
            aspect = null;
        } else if (theta == 0) {
            direc = 0;
            aspect = null;
        } else {
            let direc0 = Math.tan(theta*(Math.PI/180));
            direc = direc0;
            aspect = 1/Math.abs(direc0);
        }

        // pass to Element
        super('line', true, {aspect: aspect, ...attr});
        this.direc = direc;
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.rect;
        let [w, h] = [x2 - x1, y2 - y1];

        if (!isFinite(this.direc)) {
            x1 = x2 = x1 + 0.5*w;
        } else if (this.direc == 0) {
            y1 = y2 = y1 + 0.5*h;
        } else if (this.direc > 0) {
            [y1, y2] = [y2, y1];
        }

        let base = {x1: x1, y1: y1, x2: x2, y2: y2};
        return {...base, ...this.attr};
    }
}

// unary | null-aspect
class VLine extends Element {
    constructor(args) {
        let {pos, ...attr} = args ?? {};
        super('line', true, attr);
        this.pos = pos ?? 0.5;
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.rect;
        let [w, h] = [x2 - x1, y2 - y1];
        let xm = x1 + this.pos*w;
        let base = {x1: xm, y1: y1, x2: xm, y2: y2};
        return {...base, ...this.attr};
    }
}

// unary | null-aspect
class HLine extends Element {
    constructor(args) {
        let {pos, ...attr} = args ?? {};
        super('line', true, attr);
        this.pos = pos ?? 0.5;
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.rect;
        let [w, h] = [x2 - x1, y2 - y1];
        let ym = y1 + this.pos*h;
        let base = {x1: x1, y1: ym, x2: x2, y2: ym};
        return {...base, ...this.attr};
    }
}

// unary | null-aspect
class Rect extends Element {
    constructor(attr) {
        super('rect', true, attr);
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.rect;
        let [w, h] = [x2 - x1, y2 - y1];
        let base = {x: x1, y: y1, width: w, height: h};
        return {...base, ...this.attr};
    }
}

class Square extends Rect {
    constructor(attr) {
        super({aspect: 1, ...attr});
    }
}

class Ellipse extends Element {
    constructor(attr) {
        super('ellipse', true, attr);
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.rect;
        let [w, h] = [x2 - x1, y2 - y1];
        let [cx, cy] = [x1 + 0.5*w, y1 + 0.5*h];
        let [rx, ry] = [0.5*w, 0.5*h];
        let base = {cx: cx, cy: cy, rx: rx, ry: ry};
        return {...base, ...this.attr};
    }
}

class Circle extends Ellipse {
    constructor(attr) {
        super({aspect: 1, ...attr});
    }
}

/**
 ** path builder
 **/

class Pointstring extends Element {
    constructor(tag, points, attr) {
        super(tag, true, attr);
        this.points = points;
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.rect;
        let [w, h] = [x2 - x1, y2 - y1];
        let pts = this.points.map(([fx, fy]) => [x1 + w*fx, y1 + h*fy]);
        let str = pts.map(([x, y]) => `${x},${y}`).join(' ');
        return {points: str, ...this.attr};
    }
}

class Polyline extends Pointstring {
    constructor(points, attr) {
        super('polyline', points, attr);
    }
}

class Polygon extends Pointstring {
    constructor(points, attr) {
        super('polygon', points, attr);
    }
}

function arg(s, d, ctx) {
    let [x1, y1, x2, y2] = ctx.rect;
    let [w, h] = [x2 - x1, y2 - y1];
    if (s == 'xy') {
        let [fx, fy] = d;
        let [x, y] = [x1 + w*fx, y1 + h*fy];
        return `${x},${y}`;
    } else if (s == 'x') {
        let x = x1 + w*d;
        return `${x}`;
    } else if (s == 'y') {
        let y = y1 + h*d;
        return `${y}`;
    } else {
        return `${d}`;
    }
}

class Command {
    constructor(cmd, spec, data) {
        this.cmd = cmd;
        this.spec = spec;
        this.data = data;
    }

    string(ctx) {
        let args = zip(this.spec, this.data)
            .map(([s, d]) => arg(s, d, ctx))
            .join(' ');
        return `${this.cmd} ${args}`;
    }
}

class MoveTo extends Command {
    constructor(x, y) {
        let dat = [x, y];
        super('M', ['xy'], [dat]);
    }
}

class LineTo extends Command {
    constructor(x, y) {
        let dat = [x, y];
        super('L', ['xy'], [dat]);
    }
}

class Path extends Element {
    constructor(commands, attr) {
        super('path', true, attr);
        this.commands = commands;
    }

    props(ctx) {
        let cmd = this.commands.map(c => c.string(ctx)).join(' ');
        return {d: cmd, ...this.attr};
    }
}

/*
types:
    MoveTo: m
    LineTo: l, h, v
    Cubic Bézier Curve: c, s
    Quadratic Bézier Curve: q, t
    Elliptical Arc Curve: a
    ClosePath: z
*/

/**
 ** text elements
 **/

class Text extends Element {
    constructor(text, args) {
        let {family, size, actual, ...attr} = args ?? {};
        family = family ?? font_family_base;
        size = size ?? font_size_base;
        actual = actual ?? false;

        let fargs = {family: family, size: size, actual: actual};
        let [xoff, yoff, width, height] = textSizer(text, fargs);

        let aspect = width/height;
        let xoff1 = xoff/height;
        let yoff1 = yoff/height;
        let hdel = size/height;

        let attr1 = {aspect: aspect, font_family: family, ...attr};
        super('text', false, attr1);

        this.xoff = xoff1;
        this.yoff = yoff1;
        this.hdel = hdel;
        this.text = text;
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.rect;
        let [w, h] = [x2 - x1, y2 - y1];

        let h1 = this.hdel*h;
        let x = x1 - this.xoff*h1;
        let y = y2 + this.yoff*h1;

        let base = {x: x, y: y, font_size: `${h1}px`};
        return {...base, ...this.attr};
    }

    inner(ctx) {
        return this.text;
    }
}

class Node extends Container {
    constructor(text, args) {
        let {padding, shape, aspect, ...attr} = args ?? {};
        padding = padding ?? 0.1;
        shape = shape ?? Rect;

        // generate core elements
        if (typeof(text) == 'string') {
            text = new Text(text);
        }
        let outer = new shape();

        // auto-scale single number padding
        if (aspect == null) {
            let [px, py] = (typeof(padding) == 'number') ?
                [padding/text.aspect, padding] : padding;
            aspect = (text.aspect+2*px)/(1+2*py);
        }

        let children = [
            [text, pad_rect(padding)],
            outer,
        ];

        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
    }
}

// expose

let Gum = [
    Context, Element, Container, Group, SVG, Frame, VStack, HStack, Point, Scatter, Spacer, Ray,
    HLine, VLine, Rect, Square, Ellipse, Circle, Polyline, Polygon, Path, Text, Node, MoveTo, range,
    linspace
];

/**
 ** exports
 **/

export {
    Gum, gzip, zip, map_coords, pos_rect, pad_rect, rad_rect, demangle, rounder, props_repr, range,
    linspace, Context, Element, Container, Group, SVG, Frame, VStack, HStack, Point, Scatter,
    Spacer, Ray, Rect, Square, Ellipse, Circle, Polyline, Polygon, Path, Text, Node, MoveTo
};
