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
    base = base ?? frac_base;
    let [xa, ya, xb, yb] = base;
    if (p == null) {
        return base;
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

        let mrect = pad_rect(margin);
        let prect = pad_rect(padding);
        let trect = pad_rect(padding, mrect);

        let children = [];

        if (border != null) {
            let raspect;
            if (aspect == null && child.aspect != null) {
                let [pw, ph] = rect_dims(prect);
                raspect = child.aspect*(ph/pw);
            } else {
                raspect = aspect;
            }
            let rargs = {stroke_width: border, aspect: raspect};
            let rect = new Rect(rargs);
            children.push([rect, mrect]);
        }

        children.push([child, trect]);

        if (aspect == null && child.aspect != null) {
            let [tw, th] = rect_dims(trect);
            aspect = child.aspect*(th/tw);
        }

        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
    }
}

class VStack extends Container {
    constructor(children, args) {
        let {expand, aspect, attr} = args ?? {};
        expand = expand ?? true;

        // get children, heights, and aspects
        let n = children.length;
        let [elements, heights] = zip(...children
            .map(c => (c instanceof Element) ? [c, 1/n] : c)
        );
        let aspects = elements.map(c => c.aspect);

        // fill missing space if desired
        if (expand) {
            heights = zip(heights, aspects).map(([h, a]) => h/(a ?? 1));
            let total = sum(heights);
            heights = heights.map(h => h/total);
        }

        // find child boxes
        let cheights = cumsum(heights);
        children = zip(elements, cheights.slice(0, cheights.length-1), cheights.slice(1))
            .map(([c, fh0, fh1]) => [c, [0, fh0, 1, fh1]]);

        // use imputed aspect if null
        let aspects0 = zip(heights, aspects)
            .filter(([h, a]) => a != null)
            .map(([h, a]) => h*a);
        let aspect0 = (aspects0.length > 0) ? Math.max(...aspects0) : null;
        aspect = aspect ?? aspect0;

        // pass to Container
        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
    }
}

class HStack extends Container {
    constructor(children, args) {
        let {expand, aspect, attr} = args ?? {};
        expand = expand ?? true;

        // get children, heights, and aspects
        let n = children.length;
        let [elements, widths] = zip(...children
            .map(c => (c instanceof Element) ? [c, 1/n] : c)
        );
        let aspects = elements.map(c => c.aspect);

        // fill missing space if desired
        if (expand) {
            widths = zip(widths, aspects).map(([w, a]) => w*(a ?? 1));
            let total = sum(widths);
            widths = widths.map(w => w/total);
        }

        // find child boxes
        let cwidths = cumsum(widths);
        children = zip(elements, cwidths.slice(0, cwidths.length-1), cwidths.slice(1))
            .map(([c, fw0, fw1]) => [c, [fw0, 0, fw1, 1]]);

        // use imputed aspect if null
        let aspects0 = zip(widths, aspects)
            .filter(([w, a]) => a != null)
            .map(([w, a]) => a/w);
        let aspect0 = (aspects0.length > 0) ? Math.max(...aspects0) : null;
        aspect = aspect ?? aspect0;

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

// expose

let Gum = [
    Context, Element, Container, Group, SVG, Frame, VStack, HStack, Point, Scatter, Ray, HLine,
    VLine, Rect, Square, Ellipse, Circle, range, linspace
];

/**
 ** exports
 **/

export {
    Gum, map_coords, pos_rect, pad_rect, rad_rect, demangle, rounder, props_repr, range, linspace,
    Context, Element, Container, Group, SVG, Frame, VStack, HStack, Point, Scatter, Ray, Rect,
    Square, Ellipse, Circle
};