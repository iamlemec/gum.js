// gum.js

import render from 'katex'

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

// tick labels
let tick_font_base = 'Montserrat';
let tick_size_base = 0.02;

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

function sideRenderTextSizer(html, args) {
    let {family, size, actual} = args ?? {};
    family = family ?? font_family_base;
    size = size ?? font_size_base;
    actual = actual ?? false;

    let textDiv = document.createElement('div');
    document.body.appendChild(textDiv);

    textDiv.style.fontSize = `${size}px`;
    textDiv.style.position = 'absolute';
    textDiv.style.fontFamily = family;
    textDiv.style.visibility = 'hidden';

    textDiv.innerHTML = html;
    let rect = textDiv.getBoundingClientRect();

    let x, y, w, h;
    if (actual) {
        x = rect.left;
        y = rect.top;
        w = rect.width;
        h = rect.height;
    } else {
        x = 0;
        y = 0;
        w = rect.width;
        h = size;
    }

    document.body.removeChild(textDiv);

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

function ensure_vector(x, n) {
    if (typeof(x) == 'number') {
        return range(n).map(i => x);
    } else {
        return x;
    }
}

function is_scalar(x) {
    return typeof(x) == 'number';
}

function is_string(x) {
    return typeof(x) == 'string';
}

function is_array(x) {
    return Array.isArray(x);
}

/**
 ** core math
 **/

let exp = Math.exp;
let log = Math.log;
let sin = Math.sin;
let cos = Math.cos;
let min = Math.min;
let max = Math.max;
let sqrt = Math.sqrt;

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
    } else if (is_scalar(r)) {
        return [0, 0, r, r];
    } else if (r.length == 2) {
        let [rx, ry] = r;
        return [0, 0, rx, ry];
    } else {
        return r;
    }
}

function pad_rect(p) {
    if (p == null) {
        return frac_base;
    } else if (is_scalar(p)) {
        return [p, p, p, p];
    } else if (p.length == 2) {
        let [px, py] = p;
        return [px, py, px, py];
    } else {
        return p;
    }
}

// map padding/margin into internal boxes
function map_rect(p) {
    let [pxa, pya, pxb, pyb] = p;
    let [ptxa, ptya, ptxb, ptyb] = [
        pxa/(1+pxa), pya/(1+pya), pxb/(1+pxb), pyb/(1+pyb)
    ];
    return [ptxa, ptya, 1-ptxb, 1-ptyb];
}

function rad_rect(p, r0) {
    let x, y, r, rx, ry;
    if (p.length == 1) {
        [r, ] = p;
        [x, y] = [0.5, 0.5];
        [rx, ry] = [r, r];
    } else if (p.length == 2) {
        [x, y] = p;
        [rx, ry] = is_scalar(r0) ? [r0, r0] : r0;
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
        min(...xa), min(...ya), max(...xb), max(...yb)
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
    if (is_string(x) && x.endsWith('px')) {
        x = Number(x.substr(0, x.length-2));
        suf = 'px';
    } else {
        suf = '';
    }

    let ret;
    if (is_scalar(x)) {
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
        this.attr = Object.fromEntries(Object.entries(attr).filter(([k, v]) => v != null));
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
        clip = clip ?? true;

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
            let rects = children
                .filter(([c, r]) => c.aspect != null)
                .map(([c, r]) => ctx.map(r, c.aspect).rect);
            if (rects.length > 0) {
                let total = merge_rects(rects);
                aspect = rect_aspect(total);
            }
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
        if (is_scalar(size)) {
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
        let {padding, margin, border, aspect, adjust, ...attr} = args ?? {};
        padding = padding ?? 0;
        margin = margin ?? 0;
        adjust = adjust ?? true;

        // convenience boxing
        padding = pad_rect(padding);
        margin = pad_rect(margin);

        // aspect adjusted padding/margin
        if (adjust && child.aspect != null) {
            let x = sqrt(child.aspect);
            let [pl, pt, pr, pb] = padding;
            let [ml, mt, mr, mb] = margin;
            padding = [pl/x, pt*x, pr/x, pb*x];
            margin = [ml/x, mt*x, mr/x, mb*x];
        }

        // get box sizes
        let padmar = zip(padding, margin).map(([p, m]) => p + m);
        let mrect = map_rect(margin);
        let trect = map_rect(padmar);

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
            is_scalar(y) ? [pos, pos += y] : [y[0], pos = y[1]]
        );

        // compute child boxes
        children = zip(elements, inter)
            .map(([c, [fh0, fh1]]) => [c, [0, fh0, 1, fh1]]);

        // use imputed aspect if null
        if (aspect == null) {
            let aspects0 = zip(heights, aspects)
                .filter(([h, a]) => a != null)
                .map(([h, a]) => h*a);
            aspect = (aspects0.length > 0) ? max(...aspects0) : null;
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
            is_scalar(x) ? [pos, pos += x] : [x[0], pos = x[1]]
        );

        // find child boxes
        children = zip(elements, inter)
            .map(([c, [fw0, fw1]]) => [c, [fw0, 0, fw1, 1]]);

        // use imputed aspect if null
        if (aspect == null) {
            let aspects0 = zip(widths, aspects)
                .filter(([w, a]) => a != null)
                .map(([w, a]) => a/w);
            aspect = (aspects0.length > 0) ? max(...aspects0) : null;
        }

        // pass to Container
        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
    }
}

class Point extends Container {
    constructor(child, p, r, attr) {
        r = is_scalar(r) ? [r, r] : r;
        let pos = [...p, ...r];
        let rect = rad_rect(pos);
        let children = [[child, rect]];
        super(children, attr);
    }
}

class Points extends Container {
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
    constructor(pos, args) {
        let attr = args ?? {};
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
    constructor(pos, args) {
        let attr = args ?? {};
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
        let point = [x, y];
        super('M', ['xy'], [point]);
    }
}

class LineTo extends Command {
    constructor(x, y) {
        let point = [x, y];
        super('L', ['xy'], [point]);
    }
}

class Bezier2 extends Command {
    constructor(x, y, x1, y1) {
        let point = [x, y];
        if (x1 == null || y1 == null) {
            super('T', ['xy'], [point]);
        } else {
            let point1 = [x1, y1];
            super('Q', ['xy', 'xy'], [point1, point]);
        }
    }
}

class Bezier3 extends Command {
    constructor(x, y, x2, y2, x1, y1) {
        let point = [x, y];
        let point2 = [x2, y2];
        if (x1 == null || y1 == null) {
            super('S', ['xy', 'xy'], [point2, point]);
        } else {
            let point1 = [x1, y1];
            super('C', ['xy', 'xy', 'xy'], [point1, point2, point]);
        }
    }
}

class Arc extends Command {
    constructor(x, y, rx, ry, angle, args) {
        let {large, sweep} = args ?? {};
        large = large ?? 1;
        sweep = sweep ?? 1;
        let point = [x, y];
        super('A', ['x', 'y', '', '', '', 'xy'], [rx, ry, angle, large, sweep, point]);
    }
}

class Close extends Command {
    constructor() {
        super('Z', [], []);
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

/**
 ** text elements
 **/

class Text extends Element {
    constructor(text, args) {
        let {family, size, actual, calc_family, vshift, ...attr} = args ?? {};
        size = size ?? font_size_base;
        actual = actual ?? false;
        vshift = vshift ?? -0.14;

        // select fonts
        let font_disp, font_calc;
        if (calc_family != null) {
            font_calc = calc_family;
        } else {
            font_disp = family ?? font_family_base;
            font_calc = font_disp;
        }

        // compute text box
        let fargs = {family: font_calc, size: size, actual: actual};
        let [xoff, yoff, width, height] = textSizer(text, fargs);
        let aspect = width/height;

        // pass to element
        let attr1 = {aspect: aspect, font_family: font_disp, ...attr};
        super('text', false, attr1);

        // store metrics
        this.xoff = xoff/height;
        this.yoff = yoff/height + vshift;
        this.hdel = size/height;
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

class Tex extends Element {
    constructor(text, args) {
        let {family, size, actual, calc_family, vshift, over, ...attr} = args ?? {};
        size = size ?? font_size_base;
        actual = actual ?? true;
        vshift = vshift ?? -0.56;
        over = over ?? 1.0;

        // render with katex
        let katex = render.renderToString(text, {output: 'html'});

        // compute text box
        let fargs = {size: size, actual: actual};
        let [xoff, yoff, width, height] = sideRenderTextSizer(katex, fargs);
        let aspect = width/height;

        // pass to element
        let attr1 = {aspect: aspect, ...attr};
        super('foreignObject', false, attr1);

        // store metrics
        this.xoff = xoff/height;
        this.yoff = yoff/height;
        this.hdel = size/height;
        this.vshift = vshift;
        this.over = over;
        this.fontsize = size
        this.katex = katex;
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.rect;
        let [w, h] = [x2 - x1, y2 - y1];

        let h1 = this.hdel*h;
        let w1 = this.hdel*w;

        let h2 = (1-this.vshift+this.over)*h1;
        let w2 = (1+this.over)*w1;

        let x = x1 - this.xoff*h;
        let y = y2 + this.yoff*h - (1-this.vshift)*h1;

        let base = {x: x, y: y, width: w2, height: h2, font_size: `${h1}px`};
        return {...base, ...this.attr};
    }

    inner(ctx) {
        return this.katex;
    }
}

class Node extends Container {
    constructor(text, args) {
        let {padding, shape, aspect, ...attr} = args ?? {};
        padding = padding ?? 0.1;
        shape = shape ?? Rect;

        // convenience padding
        padding = pad_rect(padding);

        // generate core elements
        if (is_string(text)) {
            text = new Text(text);
        }
        let outer = new shape();

        // auto-scale padding
        if (aspect == null) {
            let x = sqrt(text.aspect);
            let [pl, pt, pr, pb] = padding;
            padding = [pl/x, pt*x, pr/x, pb*x];
            aspect = text.aspect*(1+(pl+pr)/x)/(1+(pt+pb)*x);
        }

        // pass to container
        let rect = map_rect(padding);
        let children = [[text, rect], outer];
        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
    }
}

/**
 ** parametric paths
 **/

function normalize_points(vals, vlim, invert, vdef) {
    vlim = vlim ?? [min(...vals), max(...vals)];
    let vN = vals.length;
    let [vmin, vmax] = vlim;
    let vrange = vmax - vmin;
    let vmap = invert ? (v => (vmax-v)/vrange) : (v => (v-vmin)/vrange);
    let vnorm = (vrange != 0) ? vals.map(vmap) : ensure_vector(vdef, vN);
    return [vlim, vnorm];
}

class SymPath extends Element {
    constructor(args) {
        let {fx, fy, xlim, ylim, tlim, N, ...attr} = args ?? {};
        N = N ?? 100;

        // pass to element
        super('polyline', true, attr);

        // compute path points
        let xvals, yvals;
        if (fx != null && fy != null) {
            let tvals = linspace(...tlim, N);
            xvals = tvals.map(fx);
            yvals = tvals.map(fy);
        } else if (fy != null) {
            xvals = linspace(...xlim, N);
            yvals = xvals.map(fy);
        } else if (fx != null) {
            yvals = linspace(...ylim, N);
            xvals = yvals.map(fx);
        }

        // normalize coordinates
        [this.xlim, this.xnorm] = normalize_points(xvals, xlim, false, 0.5);
        [this.ylim, this.ynorm] = normalize_points(yvals, ylim, true, 0.5);
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.rect;
        let [w, h] = [x2 - x1, y2 - y1];

        let xc = this.xnorm.map(x => x1 + x*w);
        let yc = this.ynorm.map(y => y1 + y*h);
        let points = zip(xc, yc).map(([x, y]) => `${x},${y}`).join(' ');

        let base = {points: points};
        return {...base, ...this.attr};
    }
}

class Scatter extends Container {
    constructor(points, args) {
        let {radius, shape, xlim, ylim, ...attr} = args ?? {};
        shape = shape ?? new Circle({fill: 'black'});
        radius = radius ?? 0.05;

        // normalize coordinates
        let xnorm, ynorm, xmap, ymap;
        let [xvals, yvals] = zip(...points);
        [xlim, xnorm] = normalize_points(xvals, xlim, false, 0.5);
        [ylim, ynorm] = normalize_points(yvals, ylim, true, 0.5);
        let pnorm = zip(xnorm, ynorm);

        // normalize radii
        radius = is_scalar(radius) ? [radius, radius] : radius;
        let [xrad, yrad] = radius;
        let [xmin, xmax] = xlim;
        let [ymin, ymax] = ylim;
        let [xrange, yrange] = [xmax - xmin, ymax - ymin];
        radius = [xrad/xrange, yrad/yrange];

        // pass to element
        let children = pnorm.map(p => [shape, rad_rect(p, radius)]);
        let attr1 = {clip: false, ...attr};
        super(children, attr1);

        // save limits for display
        [this.xlim, this.ylim] = [xlim, ylim];
    }
}

/**
 ** plotting elements
 **/

function make_ticklabel(s, prec) {
    let t = rounder(s, prec);
    return new Text(t, {
        calc_family: tick_font_base, font_weight: 100
    });
}

function ensure_tick(t, prec) {
    prec = prec ?? 2;
    if (is_scalar(t)) {
        return [t, make_ticklabel(t, prec)];
    } else {
        let [p, x] = t;
        if (x instanceof Element) {
            return t;
        } else {
            return [p, make_ticklabel(x, prec)];
        }
    }
}

class XScale extends Container {
    constructor(ticks, anchor) {
        let line = new HLine(anchor);
        let dash = ticks.map(t => new VLine(t));
        let children = [line, ...dash];
        super(children);
    }
}

class YScale extends Container {
    constructor(ticks, anchor) {
        let line = new VLine(anchor);
        let dash = ticks.map(t => new HLine(t));
        let children = [line, ...dash];
        super(children);
    }
}

class XAxis extends Container {
    constructor(ticks, args) {
        let {anchor, labelsize, labelpad, prec, ...attr} = args ?? {};
        labelsize = labelsize ?? 1.5;
        labelpad = labelpad ?? 1.5;

        // fill out tick text
        let locs = ticks.map(([t, x]) => t);

        // get label dims
        let labelwidth = labelsize/ticks.length;
        let labelheight = labelsize;

        // accumulate children
        let scale = new XScale(locs, anchor);
        let label = ticks.map(([t, x]) => [
            x, [t-labelwidth/2*x.aspect, labelpad, t+labelwidth/2*x.aspect, labelpad+labelheight]
        ]);

        // accumulate children
        let children = [scale, ...label];
        let attr1 = {clip: false, font_family: tick_font_base, ...attr};
        super(children, attr1);
    }
}

class YAxis extends Container {
    constructor(ticks, args) {
        let {anchor, labelsize, labelpad, prec, ...attr} = args ?? {};
        labelsize = labelsize ?? 1.5;
        labelpad = labelpad ?? 0.5;

        // fill out tick text
        let locs = ticks.map(([t, x]) => t);

        // get label dims
        let labelwidth = labelsize;
        let labelheight = labelsize/ticks.length;

        // accumulate children
        let scale = new YScale(locs, anchor);
        let label = ticks.map(([t, x]) => [
            x, [-labelpad-labelwidth*x.aspect, t-labelheight/2, -labelpad, t+labelheight/2]
        ]);

        // accumulate children
        let children = [scale, ...label];
        let attr1 = {clip: false, font_family: tick_font_base, ...attr};
        super(children, attr1);
    }
}

class Axes extends Container {
    constructor(args) {
        let {xticks, yticks, xsize, ysize, ...attr} = args ?? {};
        xticks = xticks ?? [];
        yticks = yticks ?? [];
        xsize = xsize ?? tick_size_base;
        ysize = ysize ?? tick_size_base;

        // create axes
        let xaxis = (xticks != null) ? new XAxis(xticks) : null;
        let yaxis = (yticks != null) ? new YAxis(yticks) : null;

        // collect children
        let children = [];
        if (xaxis != null) {
            children.push([
                xaxis, [0, 1-xsize/2, 1, 1+xsize/2]
            ]);
        }
        if (yaxis != null) {
            children.push([
                yaxis, [-ysize/2, 0, ysize/2, 1]
            ]);
        }

        // pass to container
        super(children, attr);
    }
}

class Plot extends Container {
    constructor(lines, args) {
        let {xlim, ylim, xticks, yticks, ticksize, prec, aspect, ...attr} = args ?? {};
        xticks = xticks ?? 10;
        yticks = yticks ?? 10;
        ticksize = ticksize ?? tick_size_base;
        aspect = aspect ?? 'auto';

        // handle singleton line
        if (lines instanceof Element) {
            lines = [lines];
        }

        // collect line ranges
        let [xmins, xmaxs] = zip(...lines.map(c => c.xlim));
        let [ymins, ymaxs] = zip(...lines.map(c => c.ylim));

        // determine coordinate limits
        let [xmin, xmax] = xlim ?? [min(...xmins), max(...xmaxs)];
        let [ymin, ymax] = ylim ?? [min(...ymins), max(...ymaxs)];

        // get scale and aspect
        let [xrange, yrange] = [xmax - xmin, ymax - ymin];
        if (aspect == 'auto') {
            aspect = xrange/yrange;
        }

        // x/y coordinate functions
        let xmap = x => (x-xmin)/(xmax-xmin);
        let ymap = y => (ymax-y)/(ymax-ymin);

        // map lines into coordinates
        let coords = zip(xmins, xmaxs, ymins, ymaxs).map(
            ([x1, x2, y1, y2]) => [xmap(x1), ymap(y2), xmap(x2), ymap(y1)]
        );

        // handle integer tick specifier
        xticks = is_scalar(xticks) ? linspace(xmin, xmax, xticks+1) : xticks;
        yticks = is_scalar(yticks) ? linspace(ymin, ymax, yticks+1) : yticks;

        // handle auto-labeling of ticks
        xticks = (xticks != null) ? xticks.map(t => ensure_tick(t, prec)) : null;
        yticks = (yticks != null) ? yticks.map(t => ensure_tick(t, prec)) : null;

        // map ticks into coordinates
        xticks = (xticks != null) ? xticks.map(([p, l]) => [xmap(p), l]) : null;
        yticks = (yticks != null) ? yticks.map(([p, l]) => [ymap(p), l]) : null;

        // handle ticksize cases
        let xticksize, yticksize;
        if (ticksize == null) {
            [xticksize, yticksize] = [null, null];
        } else if (is_scalar(ticksize)) {
            let afact = sqrt(aspect ?? 1);
            [xticksize, yticksize] = [afact*ticksize, ticksize/afact];
        } else {
            [xticksize, yticksize] = ticksize;
        }

        // create axes
        let axargs = {xticks: xticks, yticks: yticks, xsize: xticksize, ysize: yticksize};
        let axes = new Axes(axargs);

        // map lines into plot area
        let children = zip(lines, coords);
        children.push(axes);

        // pass to container
        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
    }
}

/**
 ** expose
 **/

let Gum = [
    Context, Element, Container, Group, SVG, Frame, VStack, HStack, Point, Points, Spacer, Ray,
    HLine, VLine, Rect, Square, Ellipse, Circle, Polyline, Polygon, Path, Text, Tex, Node, MoveTo,
    LineTo, Bezier2, Bezier3, Arc, Close, SymPath, Scatter, XScale, YScale, XAxis, YAxis, Axes,
    Plot, range, linspace, exp, log, sin, cos, min, max
];

/**
 ** exports
 **/

export {
    Gum, gzip, zip, map_coords, pos_rect, pad_rect, rad_rect, demangle, rounder, props_repr, range,
    linspace, exp, log, sin, cos, min, max, Context, Element, Container, Group, SVG, Frame, VStack,
    HStack, Point, Points, Spacer, Ray, Rect, Square, Ellipse, Circle, Polyline, Polygon, Path,
    Text, Tex, Node, MoveTo, LineTo, Bezier2, Bezier3, Arc, Close, SymPath, Scatter, XScale, YScale,
    XAxis, YAxis, Axes, Plot
};
