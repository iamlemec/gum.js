// gum.js

import { emoji_table } from './emoji.js';

/**
 ** defaults
 **/

// namespace
let ns_svg = 'http://www.w3.org/2000/svg';

// sizing
let size_base = 500;
let rect_base = [0, 0, size_base, size_base];
let coord_base = [0, 0, 1, 1];
let prec_base = 2;

// fonts
let font_family_base = 'IBMPlexSans';
let font_weight_base = 100;
let font_size_base = 12;

// plot defaults
let num_ticks_base = 5;
let tick_size_base = 0.025;
let tick_label_size_base = 2.0;
let tick_label_offset_base = 0.5;
let label_size_base = 0.06;
let label_offset_base = 0.15;
let title_size_base = 0.1;
let title_offset_base = 0.1;
let limit_base = [0, 1];
let N_base = 100;

// default styling
let svg_props_base = {
    stroke: 'black',
    fill: 'none',
    font_family: font_family_base,
    font_weight: font_weight_base,
};

// canvas text sizer
function canvasTextSizer(ctx, text, args) {
    let {family, weight, size, actual} = args ?? {};
    family = family ?? font_family_base;
    weight = weight ?? font_weight_base;
    size = size ?? font_size_base;
    actual = actual ?? false;

    ctx.font = `${weight} ${size}px ${family}`;
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
let textSizer = null;
try {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    textSizer = function(text, args) {
        return canvasTextSizer(ctx, text, args);
    }
} catch (error) {
    // console.log(error);
}

/**
 ** general utils
 **/

function* gzip(...iterables) {
    if (iterables.length == 0) {
        return;
    }
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

function reshape(arr, shape) {
    let [n, m] = shape;
    let ret = [];
    for (let i = 0; i < n; i++) {
        ret.push(arr.slice(i*m, (i+1)*m));
    }
    return ret;
}

function split(arr, len) {
    let n = Math.ceil(arr.length / len);
    return reshape(arr, [n, len]);
}

function concat(arrs) {
    return arrs.flat();
}

function sum(arr) {
    arr = arr.filter(v => v != null);
    return arr.reduce((a, b) => a + b, 0);
}

function prod(arr) {
    arr = arr.filter(v => v != null);
    return arr.reduce((a, b) => a * b, 1);
}

function mean(arr) {
    return sum(arr)/arr.length;
}

function all(arr) {
    return arr.reduce((a, b) => a && b);
}

function any(arr) {
    return arr.reduce((a, b) => a || b);
}

function add(arr1, arr2) {
    return zip(arr1, arr2).map(([a, b]) => a + b);
}

function mul(arr1, arr2) {
    return zip(arr1, arr2).map(([a, b]) => a * b);
}

function cumsum(arr, first) {
    let sum = 0;
    let ret = arr.map(x => sum += x);
    return (first ?? true) ? [0, ...ret.slice(0, -1)] : ret;
}

// fill in missing values to ensure: sum(vals) == target
function distribute_extra(vals, target) {
    target = target ?? 1;
    let nmiss = vals.filter(v => v == null).length;
    let total = sum(vals);
    let fill = (nmiss > 0) ? (target-total)/nmiss : 0;
    return vals.map(v => v ?? fill);
}

function norm(vals, degree) {
    degree = degree ?? 1;
    return sum(vals.map(v => v**degree))**(1/degree);
}

function normalize(vals, degree) {
    degree = degree ?? 1;
    let mag = norm(vals, degree);
    return (mag == 0) ? vals.map(v => 0) : vals.map(v => v/mag);
}

function range(i0, i1, step) {
    step = step ?? 1;
    [i0, i1] = (i1 === undefined) ? [0, i0] : [i0, i1];
    let n = floor((i1-i0)/step);
    return [...Array(n).keys()].map(i => i0 + step*i);
}

function linspace(x0, x1, n) {
    if (n == 1) { return [0.5*(x0+x1)]; };
    let step = (x1-x0)/(n-1);
    return [...Array(n).keys()].map(i => x0 + step*i);
}

function enumerate(x) {
    let n = x.length;
    let idx = range(n);
    return zip(idx, x);
}

function repeat(x, n) {
    return Array(n).fill(x);
}

function meshgrid(x, y) {
    return x.flatMap(xi => y.map(yi => [xi, yi]));
}

function lingrid(xlim, ylim, N) {
    if (N >= 100) throw new Error('N is restricted to be less than 100');
    let [Nx, Ny] = ensure_vector(N, 2);
    let xgrid = linspace(...xlim, Nx);
    let ygrid = linspace(...ylim, Ny);
    return meshgrid(xgrid, ygrid);
}

function ensure_vector(x, n) {
    if (!is_array(x)) {
        return range(n).map(i => x);
    } else {
        return x;
    }
}

function string_to_int(s) {
    return (s != null) ? parseInt(s) : null;
}

function is_scalar(x) {
    return (
        (typeof(x) == 'number') ||
        (typeof(x) == 'object' && (
            (x.constructor.name == 'Number') ||
            (x.constructor.name == 'NamedNumber')
        ))
    );
}

function is_string(x) {
    return typeof(x) == 'string';
}

function is_object(x) {
    return typeof(x) == 'object';
}

function is_array(x) {
    return Array.isArray(x);
}

function is_element(x) {
    return x instanceof Element;
}

/**
 ** core math
 **/

// to be used in functions
class NamedNumber extends Number {
    constructor(name, value) {
        super(value);
        this.name = name;
    }
}

class NamedString extends String {
    constructor(name, value) {
        super(value);
        this.name = name;
    }
}

// functions
let exp = Math.exp;
let log = Math.log;
let sin = Math.sin;
let cos = Math.cos;
let tan = Math.tan;
let abs = Math.abs;
let pow = Math.pow;
let sqrt = Math.sqrt;
let sign = Math.sign;
let floor = Math.floor;
let ceil = Math.ceil;
let round = Math.round;
let atan = Math.atan;

// null on empty
function min(...vals) {
    vals = vals.filter(v => v != null);
    return (vals.length > 0) ? Math.min(...vals) : null;
}
function max(...vals) {
    vals = vals.filter(v => v != null);
    return (vals.length > 0) ? Math.max(...vals) : null;
}

function clamp(x, lim) {
    let [lo, hi] = lim;
    return max(lo, min(x, hi));
}

function mask(x, lim) {
    let [lo, hi] = lim;
    return (x >= lo && x <= hi) ? x : null;
}

function rescale(x, lim) {
    let [lo, hi] = lim;
    return (x-lo)/(hi-lo);
}

function sigmoid(x) {
    return 1/(1+exp(-x));
}

function logit(p) {
    return log(p/(1-p));
}

function smoothstep(x, lim) {
    let [lo, hi] = lim ?? [0, 1];
    let t = clamp((x-lo)/(hi-lo), [0, 1]);
    return t*t*(3 - 2*t);
}

// constants
let e = new NamedNumber('e', Math.E);
let pi = new NamedNumber('pi', Math.PI);
let phi = new NamedNumber('phi', (1+sqrt(5))/2);
let r2d = new NamedNumber('r2d', 180/Math.PI);
let d2r = new NamedNumber('d2r', Math.PI/180);
let blue = new NamedString('blue', '#1e88e5');
let red = new NamedString('red', '#ff0d57');
let green = new NamedString('green', '#4caf50');

/**
 ** random number generation
 **/

let random = Math.random;

function uniform(lo, hi) {
    return lo + (hi-lo)*random();
}

// Standard Normal variate using Box-Muller transform.
function normal(mean, stdv) {
    mean = mean ?? 0;
    stdv = stdv ?? 1;
    let [u, v] = [1 - random(), random()];
    let [r, t] = [sqrt(-2*log(u)), 2*pi*v];
    let [a, b] = [r*cos(t), r*sin(t)];
    return [a, b].map(x => mean + stdv*x);
}

/**
 ** coordinate utils
 **/

// convenience mapper for rectangle positions
function pos_rect(r) {
    if (r == null) {
        return coord_base;
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
        return coord_base;
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
function map_padmar(p, m, a) {
    let [pl, pt, pr, pb] = p;
    let [ml, mt, mr, mb] = m;
    let [pw, ph] = [pl+1+pr, pt+1+pb];
    let [tw, th] = [ml+pw+mr, mt+ph+mb];
    let crect = [(ml+pl)/tw, (mt+pt)/th, 1-(mr+pr)/tw, 1-(mb+pb)/th];
    let brect = [ml/tw, mt/th, 1-mr/tw, 1-mb/th];
    let basp = (a != null) ? a*(pw/ph) : null;
    let tasp = (a != null) ? a*(tw/th) : null;
    return [crect, brect, basp, tasp];
}

function rad_rect(p, r0) {
    let x, y, r, rx, ry;
    if (p.length == 1) {
        [r, ] = p;
        [x, y] = [0.5, 0.5];
        [rx, ry] = [r, r];
    } else if (p.length == 2) {
        [x, y] = p;
        [rx, ry] = ensure_vector(r0, 2);
    } else if (p.length == 3) {
        [x, y, r] = p;
        [rx, ry] = [r, r];
    } else if (p.length == 4) {
        [x, y, rx, ry] = p;
    }
    return [x-rx, y-ry, x+rx, y+ry];
}

function merge_rects(rects) {
    let [xa, ya, xb, yb] = zip(...rects);
    return [
        min(...xa), min(...ya), max(...xb), max(...yb)
    ];
}

function rect_lims(rect) {
    let [xa, ya, xb, yb] = rect;
    return [[xa, xb], [ya, yb]];
}

function rect_bounds(rect) {
    let [xa, ya, xb, yb] = rect;
    return [min(xa, xb), min(ya, yb), max(xa, xb), max(ya, yb)];
}

function rect_dims(rect) {
    let [xa, ya, xb, yb] = rect;
    let [w, h] = [xb - xa, yb - ya];
    return [abs(w), abs(h)];
}

function rect_aspect(rect) {
    let [w, h] = rect_dims(rect);
    return w/h;
}

function aspect_invariant(value, aspect, alpha) {
    aspect = aspect ?? 1;
    alpha = alpha ?? 0.5;

    let wfact = aspect**alpha;
    let hfact = aspect**(1-alpha);

    if (is_scalar(value)) {
        value = [value, value];
    }

    if (value.length == 2) {
        let [vw, vh] = value;
        return [vw*wfact, vh/hfact];
    } else if (value.length == 4) {
        let [vl, vt, vr, vb] = value;
        return [vl*wfact, vt/hfact, vr*wfact, vb/hfact];
    }
}

/**
 ** attributes
 **/

function prefix_split(pres, attr) {
    let attr1 = {...attr};
    let pres1 = pres.map(p => `${p}_`);
    let out = pres.map(p => Object());
    let keys = Object.keys(attr).map(k => {
        pres.forEach((p, i) => {
            if (k.startsWith(pres1[i])) {
                let k1 = k.slice(p.length+1);
                out[i][k1] = attr1[k];
                delete attr1[k];
            }
        });
    });
    return [...out, attr1];
}

function prefix_add(pre, attr) {
    return Object.fromEntries(
        Object.entries(attr).map(([k, v]) => [`${pre}_${k}`, v])
    );
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
        x = Number(x.slice(0, -2));
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
        .filter(([k, v]) => v != null)
        .map(([k, v]) => `${demangle(k)}="${rounder(v, prec)}"`)
        .join(' ');
}

/**
 ** color handling
 **/

// Converts a #ffffff hex string into an [r,g,b] array
function hex2rgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function rgb2hex(rgb) {
    let r = round(rgb[0]).toString(16).padStart(2, '0');
    let g = round(rgb[1]).toString(16).padStart(2, '0');
    let b = round(rgb[2]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

function rgb2hsl(color) {
    let r = color[0]/255;
    let g = color[1]/255;
    let b = color[2]/255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function interpolateVectors(c1, c2, alpha) {
    let len = min(c1.length, c2.length);
    return range(len).map(i => {
        let x = c1[i] + alpha*(c2[i]-c1[i]);
        return x.toFixed(3);
    });
}

function interpolateHex(c1, c2, alpha) {
    let v1 = hex2rgb(c1);
    let v2 = hex2rgb(c2);
    let v = interpolateVectors(v1, v2, alpha);
    return rgb2hex(v);
}

function interpolateVectorsPallet(c1, c2, n) {
    return linspace(0, 1, n)
        .map(alpha => interpolateVectors(c1, c2, alpha));
}

/**
 ** core classes
 **/

function degree_mod(degree, lower, upper) {
    return ((degree + lower) % (upper-lower)) - lower;
}

// public usage
function rotate_aspect(aspect, degree) {
    if (degree == null) { return aspect; }
    if (aspect == null) { return null; }
    let rotate = degree_mod(degree, -90, 90);
    let theta = (pi/180)*abs(rotate);
    return rotate_aspect_radians(aspect, theta);
}

// mostly private
function rotate_aspect_radians(aspect, theta) {
    return (aspect*cos(theta)+sin(theta))/(aspect*sin(theta)+cos(theta));
}

function align_frac(align) {
    if (is_scalar(align)) {
        return align;
    } else if (align == 'left' || align == 'top') {
        return 0;
    } else if (align == 'center' || align == 'middle') {
        return 0.5;
    } else if (align == 'right' || align == 'bottom') {
        return 1;
    } else{
        throw new Error(`Unrecognized alignment specification: ${align}`);
    }
}

class Context {
    constructor(prect, args) {
        let {coord, rrect, trans, aspec, prec, debug} = args ?? {};
        this.prect = prect;
        this.rrect = rrect;
        this.coord = coord;
        this.trans = trans;
        this.aspec = aspec;
        this.prec = prec;
        this.debug = debug ?? false;
    }

    // map using both domain (frac) and range (rect)
    coord_to_pixel(coord) {
        let [cx, cy] = coord;
        let [cx1, cy1, cx2, cy2] = this.coord ?? coord_base;
        let [cw, ch] = [cx2 - cx1, cy2 - cy1];
        let [px1, py1, px2, py2] = this.prect;
        let [pw, ph] = [px2 - px1, py2 - py1];
        let [fx, fy] = [(cx-cx1)/cw, (cy-cy1)/ch];
        let [px, py] = [px1 + fx*pw, py1 + fy*ph];
        return [px, py];
    }

    // used for sizes such as radii or vectors
    coord_to_pixel_size(size) {
        let [sw, sh] = size;
        let [cx1, cy1, cx2, cy2] = this.coord ?? coord_base;
        let [cw, ch] = [cx2 - cx1, cy2 - cy1];
        let [px1, py1, px2, py2] = this.prect;
        let [pw, ph] = [px2 - px1, py2 - py1];
        let [px, py] = [sw*abs(pw)/abs(cw), sh*abs(ph)/abs(ch)];
        return [px, py];
    }

    // used for whole rectangles
    coord_to_pixel_rect(crect) {
        let [x1, y1, x2, y2] = crect;
        let [c1, c2] = [[x1, y1], [x2, y2]];
        let p1 = this.coord_to_pixel(c1);
        let p2 = this.coord_to_pixel(c2);
        let prect = [...p1, ...p2];
        return prect;
    }
    
    // project coordinates
    map(args) {
        let {rect, aspect, rotate, expand, invar, align, pivot, coord} = args ?? {};
        rect = rect ?? coord_base;
        rotate = rotate ?? 0;
        expand = expand ?? false;
        invar = invar ?? true;
        align = align ?? 'center';
        pivot = pivot ?? 'center';

        // remap rotation angle
        let degrees = degree_mod(rotate, -90, 90); // map to [-90, 90]
        let theta0 = abs(degrees)*(pi/180); // in radians
        let theta = invar ? 0 : theta0; // account for rotate?

        // sort out alignment
        let [halign, valign] = ensure_vector(align, 2);
        halign = align_frac(halign);
        valign = align_frac(valign);

        // sort out pivot point
        let [hpivot, vpivot] = ensure_vector(pivot, 2);
        hpivot = align_frac(hpivot);
        vpivot = align_frac(vpivot);

        // get true pixel rect
        let [px1, py1, px2, py2] = this.coord_to_pixel_rect(rect);
        let [pw0, ph0] = [px2 - px1, py2 - py1];

        // embedded rectangle aspect
        let asp0 = pw0/ph0; // pixel rect
        let rasp = aspect ?? asp0; // mimic outer if null
        let asp1 = rotate_aspect_radians(rasp, theta);

        // shrink down if aspect mismatch
        let [tw, th] = [cos(theta)+sin(theta)/rasp, rasp*sin(theta)+cos(theta)];
        let [rw0, rh0] = [pw0/tw, ph0/th];
        let [pw1, ph1] = (expand ^ (asp0 >= asp1)) ? [rasp*rh0, rh0] : [rw0, rw0/rasp];
        let [rw1, rh1] = [pw1*tw, ph1*th];

        // get absolute sizes
        let [apw1, aph1] = [abs(pw1), abs(ph1)];
        let [arw1, arh1] = [abs(rw1), abs(rh1)];
        let aspec = apw1/aph1;

        // get rotated/unrotated pixel rect
        let cx = (1-halign)*px1 + halign*px2 + (0.5-halign)*rw1;
        let cy = (1-valign)*py1 + valign*py2 + (0.5-valign)*rh1;
        let prect = [cx-0.5*apw1, cy-0.5*aph1, cx+0.5*apw1, cy+0.5*aph1];
        let rrect = invar ? prect : [cx-0.5*arw1, cy-0.5*arh1, cx+0.5*arw1, cy+0.5*arh1];

        // get transform string
        let vx = (1-hpivot)*px1 + hpivot*px2;
        let vy = (1-vpivot)*py1 + vpivot*py2;
        let [sx, sy] = [vx, vy].map(z => rounder(z, this.prec));
        let trans = (rotate != 0) ? `rotate(${rounder(rotate, this.prec)} ${rounder(sx, this.prec)} ${rounder(sy, this.prec)})` : null;

        return new Context(prect, {
            coord, rrect, trans, aspec, prec: this.prec, debug: this.debug
        });
    }
}

class Element {
    constructor(tag, unary, args) {
        let {aspect, ...attr} = args ?? {};
        this.tag = tag;
        this.unary = unary;
        this.aspect = aspect ?? null;

        // store non-null attributes
        this.attr = Object.fromEntries(
            Object.entries(attr).filter(([k, v]) => v != null)
        );
    }

    props(ctx) {
        return this.attr;
    }

    inner(ctx) {
        return '';
    }

    svg(ctx) {
        ctx = ctx ?? new Context(rect_base);

        // collect all properties
        let pvals = this.props(ctx);
        if (ctx.trans != null) {
            let trans = `${pvals.transform ?? ''} ${ctx.trans}`.trim();
            pvals = {...pvals, transform: trans};
        }

        // convert to strings
        let props = props_repr(pvals, ctx.prec);
        let pre = props.length > 0 ? ' ' : '';

        // optional debug info
        let debug = '';
        if (ctx.debug) {
            let klass = this.constructor.name;
            debug = ` gum-class="${klass}"`;
        }

        // return final svg
        if (this.unary) {
            return `<${this.tag}${pre}${props}${debug} />`;
        } else {
            return `<${this.tag}${pre}${props}${debug}>${this.inner(ctx)}</${this.tag}>`;
        }
    }
}

function parse_bounds(bnd) {
    if (bnd == null) {
        return {rect: coord_base};
    } else if (is_array(bnd)) {
        return {rect: bnd};
    } else if (is_object(bnd)) {
        let {pos, rad, ...bnd1} = bnd;
        pos = pos ?? [0.5, 0.5];
        rad = rad ?? [0.5, 0.5];
        let rect = rad_rect(pos, rad);
        return {rect, ...bnd1};
    } else {
        throw Error(`Unrecognized bound specification: ${bnd}`);
    }
}

class Container extends Element {
    constructor(children, args) {
        let {tag, aspect, coord, clip, debug, ...attr} = args ?? {};
        tag = tag ?? 'g';
        clip = clip ?? true;
        debug = debug ?? false;

        // handle singleton
        if (children instanceof Element) {
            children = [children];
        }

        // handle default positioning
        children = children
            .map(c => c instanceof Element ? [c, null] : c)
            .map(([c, r]) => [c, parse_bounds(r)]);

        // get data limits
        let xlim, ylim;
        if (children.length > 0) {
            let [xmins, ymins, xmaxs, ymaxs] = zip(...children.map(([c, a]) => a.rect));
            let [xall, yall] = [[...xmins, ...xmaxs], [...ymins, ...ymaxs]];
            xlim = [min(...xall), max(...xall)];
            ylim = [min(...yall), max(...yall)];
        }

        // inherit aspect of clipped contents
        if (aspect == null && clip) {
            let ctx = new Context(coord_base);
            let rects = children
                .filter(([c, a]) => c.aspect != null)
                .map(([c, a]) => ctx.map({aspect: c.aspect, ...a}).rrect);
            if (rects.length > 0) {
                let total = merge_rects(rects);
                aspect = rect_aspect(total);
            }
        }

        // pass to Element
        let attr1 = {aspect: aspect, ...attr};
        super(tag, false, attr1);
        this.children = children;
        this.coord = coord;
        this.debug = debug;
        this.xlim = xlim;
        this.ylim = ylim;
    }

    inner(ctx) {
        // empty container
        if (this.children.length == 0) {
            return '\n';
        }

        // map to new contexts and render
        let inside = this.children.map(([c, a]) => c.svg(
            ctx.map({aspect: c.aspect, coord: this.coord, ...a})
        )).filter(s => s.length > 0).join('\n');

        // debug rects
        if (this.debug || ctx.debug) {
            let dstr = this.children.map(([c, a]) => {
                let ctx1 = ctx.map({aspect: c.aspect, coord: this.coord, ...a});
                let ctx2 = ctx.map({coord: this.coord, ...a});
                let rect1 = new Rect({stroke: 'red'});
                let rect2 = new Rect({stroke_dasharray: 4, stroke: 'blue'});
                return `${rect1.svg(ctx1)}\n${rect2.svg(ctx2)}`;
            }).join('\n');
            inside = `${inside}\n${dstr}`;
        }

        // return padded
        return `\n${inside}\n`;
    }
}

class SVG extends Container {
    constructor(children, args) {
        let {clip, size, prec, filters, ...attr} = args ?? {};
        clip = clip ?? true;
        size = size ?? size_base;
        prec = prec ?? prec_base;
        filters = filters ?? null;

        if (filters != null) {
            let defs = new Defs(filters);
            children = [defs, ...children];
        }

        let attr1 = {tag: 'svg', clip: clip, ...svg_props_base, ...attr};
        super(children, attr1);

        if (is_scalar(size)) {
            if (this.aspect == null) {
                size = [size, size];
            } else if (this.aspect >= 1) {
                size = [size, size/this.aspect];
            } else {
                size = [size*this.aspect, size];
            }
        }

        this.size = size;
        this.prec = prec;
    }

    props(ctx) {
        let [w, h] = this.size;
        let box = `0 0 ${w} ${h}`;
        let base = {viewBox: box, xmlns: ns_svg};
        return {...base, ...this.attr};
    }

    svg(args) {
        args = args ?? {};
        let rect = [0, 0, ...this.size];
        let aspec = rect_aspect(rect);
        let ctx = new Context(rect, {aspec, prec: this.prec, ...args});
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
        let {
            padding, margin, border, aspect, adjust, flex, rotate, invar, align, shrink, shape, ...attr0
        } = args ?? {};
        let [border_attr, attr] = prefix_split(['border'], attr0);
        border = border ?? 0;
        padding = padding ?? 0;
        margin = margin ?? 0;
        adjust = adjust ?? true;
        flex = flex ?? false;
        shape = shape ?? (sargs => new Rect(sargs));

        // convenience boxing
        padding = pad_rect(padding);
        margin = pad_rect(margin);

        // aspect adjusted padding/margin
        if (adjust && child.aspect != null) {
            padding = aspect_invariant(padding, 1/child.aspect);
            margin = aspect_invariant(margin, 1/child.aspect);
        }

        // get box sizes
        let casp = rotate_aspect(child.aspect, rotate);
        let iasp = aspect ?? casp;
        let [crect, brect, basp, tasp] = map_padmar(padding, margin, iasp);
        aspect = flex ? null : (aspect ?? tasp);

        // make border box
        let rargs = {stroke_width: border, ...border_attr};
        let rect = shape(rargs);

        // gather children
        let children = [[child, {rect: crect, rotate, invar, align, shrink}]];
        children.unshift([rect, brect]);

        // pass to Container
        let attr1 = {aspect, clip: false, ...attr};
        super(children, attr1);
    }
}

function get_orient(direc) {
    if (direc == 'v' || direc == 'vert' || direc == 'vertical') {
        return 'v';
    } else if (direc == 'h' || direc == 'horiz' || direc == 'horizontal') {
        return 'h';
    } else {
        throw new Error(`Unrecognized direction specification: ${direc}`);
    }
}

// expects list of Element or [Element, height]
// this is written as vertical, horizonal swaps dimensions and inverts aspects
class Stack extends Container {
    constructor(direc, children, args) {
        let {expand, align, spacing, aspect, debug, ...attr} = args ?? {};
        expand = expand ?? true;
        align = align ?? 'center';
        spacing = spacing ?? 0;
        aspect = aspect ?? 'auto';
        debug = debug ?? false;
        direc = get_orient(direc);

        // short circuit if empty
        let n = children.length;
        if (n == 0) {
            return super([], {aspect: aspect, ...attr});
        }

        // fill in missing heights with null
        let [elements, heights] = zip(...children.map(c => {
            if (is_element(c)) { return [c, null]; }
            else if (is_scalar(c)) { return [new Spacer(), c]; }
            else { return c; }
        }));

        // get aspects and adjust for direction
        let aspects = elements.map(c => c.aspect);
        let hasa = any(aspects.map(a => a != null));
        if (direc == 'h') {
            aspects = aspects.map(a => (a != null) ? 1/a : null);
        }

        // expand elements to fit width?
        let aspect_ideal = null, wlims;
        if (expand && !hasa) {
            // aspectless and full width
            heights = distribute_extra(heights);
            wlims = heights.map(w => [0, 1]);
        } else if (expand && hasa) {
            // if aspect, heights are adjusted so that all elements have full width
            // if no aspect, they can be stretched to full width anyway
            heights = zip(heights, aspects).map(([h, a]) => (a != null) ? 1/a : h);

            // renormalize heights and find ideal aspect
            let has = zip(heights, aspects);
            let atot = sum(has.map(([h, a]) => (a != null) ? h : null));
            let utot = sum(has.map(([h, a]) => (a == null) ? h : null));
            heights = has.map(([h, a]) => (a != null) ? (1-utot)*(h/atot) : h);
            aspect_ideal = (1-utot)/atot;

            // width is always full with expand
            wlims = heights.map(w => [0, 1]);
        } else {
            // fill in missing heights and find aspect widths
            heights = distribute_extra(heights);
            let widths = zip(heights, aspects).map(([h, a]) => (a != null) ? h*a : null);

            // ideal aspect determined by widest element
            let wmax = max(...widths) ?? 1;
            widths = widths.map(w => (w != null) ? w/wmax : 1);
            aspect_ideal = wmax;

            // set wlims according to alignment
            let afrac = align_frac(align);
            wlims = widths.map(w => (w != null) ? [afrac*(1-w), afrac+(1-afrac)*w] : [0, 1]);
        }

        // convert heights to cumulative intervals (with spacing)
        let pos = -spacing;
        let hlims = heights.map(y => [pos += spacing, pos += y]);
        hlims = hlims.map(([h1, h2]) => [h1/pos, h2/pos]);
        aspect_ideal = (aspect_ideal != null) ? aspect_ideal/pos : null;

        // if any element has an aspect, use ideal aspect
        // otherwise, just go with null aspect unless specified
        if (aspect == 'auto') {
            aspect = aspect_ideal;
        } else if (aspect == 'none') {
            aspect = null;
        }

        // swap dims if horizontal
        if (direc == 'h') {
            [wlims, hlims] = [hlims, wlims];
            aspect = (aspect != null) ? 1/aspect : null;
        }

        // compute child boxes
        children = zip(elements, wlims, hlims)
            .map(([c, [fw0, fw1], [fh0, fh1]]) => [c, [fw0, fh0, fw1, fh1]]);

        // add in debug lines
        if (debug) {
            let rect = new Rect({stroke: 'blue', stroke_dasharray: [4, 4]});
            let boxes = zip(wlims, hlims)
                .map(([[fw0, fw1], [fh0, fh1]]) => [rect, [fw0, fh0, fw1, fh1]]);
            children = [...children, ...boxes];
        }

        // pass to Container
        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
    }
}

class VStack extends Stack {
    constructor(children, args) {
        super('v', children, args);
    }
}

class HStack extends Stack {
    constructor(children, args) {
        super('h', children, args);
    }
}

class Grid extends Container {
    constructor(children, args) {
        let {rows, cols, widths, heights, spacing, ...attr} = args ?? {};
        spacing = ensure_vector(spacing ?? 0, 2);
        rows = rows ?? children.length;
        cols = cols ?? max(...children.map(row => row.length));

        // fill in missing rows and columns
        let spacer = new Spacer();
        let filler = range(cols).map(i => spacer);
        children = children.map(row => range(cols).map(i => i < row.length ? row[i] : spacer));
        children = range(rows).map(i => i < children.length ? children[i] : filler);

        // aggregate aspect ratios along rows and columns (assuming null goes to 1)
        let aspect_grid = children.map(row => row.map(e => e.aspect ?? 1));
        widths =  normalize(widths ?? zip(...aspect_grid).map(mean));
        heights = normalize(heights ?? aspect_grid.map(row => mean(row.map(a => 1/a))));

        // adjust widths and heights to account for spacing
        let [spacex, spacey] = spacing;
        let [scalex, scaley] = [1 - spacex * (cols-1), 1 - spacey * (rows-1)];
        widths = widths.map(w => scalex * w);
        heights = heights.map(h => scaley * h);

        // get top left positions
        let lpos = cumsum(widths.map(w => w + spacex));
        let tpos = cumsum(heights.map(h => h + spacey));
        let cbox = zip(lpos, widths).map(([l, w]) => [l, l + w]);
        let rbox = zip(tpos, heights).map(([t, h]) => [t, t + h]);

        // make grid
        let grid = meshgrid(rbox, cbox).map(([[y0, y1], [x0, x1]]) => [x0, y0, x1, y1]);
        super(zip(children.flat(), grid), attr);
    }
}

class Place extends Container {
    constructor(child, args) {
        let {rect, pos, rad, rotate, expand, invar, align, pivot, ...attr} = args ?? {};
        pos = pos ?? [0.5, 0.5];
        rad = rad ?? [0.5, 0.5];

        // find child position
        rect = rect ?? rad_rect(pos, rad);
        let spec = [child, {rect, rotate, expand, invar, align, pivot}];

        // pass to container
        let attr1 = {clip: false, ...attr};
        super([spec], attr1);
    }
}

class Rotate extends Container {
    constructor(child, rotate, args) {
        let {expand, invar, align, pivot, ...attr} = args ?? {};
        let spec = [child, {rotate, expand, invar, align, pivot}];
        let attr1 = {clip: true, ...attr};
        super([spec], attr1);
    }
}

class Anchor extends Container {
    constructor(child, args) {
        let {aspect, align, ...attr} = args ?? {};
        aspect = aspect ?? 1;
        align = align ?? 'left';

        let rmap = {
            'left': [1, 0, 1, 1], 'right': [0, 0, 0, 1],
            'top': [0, 0, 1, 0], 'bottom': [0, 1, 1, 1]
        };

        let falign = 1 - align_frac(align);
        let spec = {rect: rmap[align], expand: true, align: falign};
        super([[child, spec]], {aspect, clip: false, ...attr});
    }
}

class Attach extends Container {
    constructor(child, side, args) {
        let {offset, size, align, ...attr} = args ?? {};
        offset = offset ?? 0;
        size = size ?? 1;

        let extent = size + offset;
        let rmap = {
            'left': [-extent, 0, -offset, 1], 'right': [1+offset, 0, 1+extent, 1],
            'top': [0, -extent, 1, -offset], 'bottom': [0, 1+offset, 1, 1+extent]
        };

        let spec = {rect: rmap[side], align};
        let attr1 = {clip: false, ...attr};
        super([[child, spec]], attr1);
    }
}

class Points extends Container {
    constructor(points, args) {
        let {size, shape, color, xlim, ylim, ...attr} = args ?? {};
        shape = shape ?? new Dot({color});
        size = size ?? 0.01;

        // handle different forms
        points = points.map(p => is_scalar(p[0]) ? [p] : p);
        points = points.map(p => is_element(p[0]) ? p : [shape, ...p]);
        points = points.map(p => (p.length >= 3) ? p : [...p, size]);

        // pass to container
        let children = points.map(([s, p, r]) => [s, rad_rect(p, r)]);
        let attr1 = {clip: false, ...attr};
        super(children, attr1);
    }
}

class Point extends Place {
    constructor(pos, args) {
        let {size, shape, ...attr} = args ?? {};
        shape = shape ?? new Dot(attr);
        size = size ?? 0.01;
        super(shape, {pos, rad: size});
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

class Line extends Element {
    constructor(p1, p2, args) {
        let attr = args ?? {};
        super('line', true, attr);
        [this.p1, this.p2] = [p1, p2];
        [this.xlim, this.ylim] = zip(p1, p2);
    }

    props(ctx) {
        let [x1, y1] = ctx.coord_to_pixel(this.p1);
        let [x2, y2] = ctx.coord_to_pixel(this.p2);
        return {x1, y1, x2, y2, ...this.attr};
    }
}

class UnitLine extends Line {
    constructor(direc, pos, args) {
        let {lim, ...attr} = args ?? {};
        let [lo, hi] = lim ?? limit_base;
        direc = get_orient(direc);
        let [p1, p2] = (direc == 'v') ? [[pos, lo], [pos, hi]] : [[lo, pos], [hi, pos]];
        super(p1, p2, attr);
    }
}

class VLine extends UnitLine {
    constructor(pos, args) {
        super('v', pos, args);
    }
}

class HLine extends UnitLine {
    constructor(pos, args) {
        super('h', pos, args);
    }
}

class Rect extends Element {
    constructor(args) {
        let {rect, radius, ...attr} = args ?? {};
        rect = rect ?? coord_base;
        super('rect', true, attr);
        this.rect = rect;
        this.radius = radius;
        [this.xlim, this.ylim] = rect_lims(rect);
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.coord_to_pixel_rect(this.rect);

        // orient increasing
        let [x, y] = [x1, y1];
        let [w, h] = [x2 - x1, y2 - y1];
        if (w < 0) { x += w; w *= -1; }
        if (h < 0) { y += h; h *= -1; }

        // scale border radius
        let rx, ry;
        if (this.radius != null) {
            if (is_scalar(this.radius)) {
                let s = 0.5*(w+h);
                rx = s*this.radius;
            } else {
                let [rx0, ry0] = this.radius;
                [rx, ry] = [w*rx0, h*ry0];
            }
        }

        // output properties
        let base = {x, y, width: w, height: h, rx, ry};
        return {...base, ...this.attr};
    }
}

class Square extends Rect {
    constructor(args) {
        let {pos, rad, ...attr} = args ?? {};
        pos = pos ?? [0.5, 0.5];
        rad = rad ?? 0.5;

        let p1 = pos.map(z => z - rad);
        let p2 = pos.map(z => z + rad);
        let base = {p1, p2, aspect: 1};
        super({...base, ...attr});
    }
}

class Ellipse extends Element {
    constructor(args) {
        let {pos, rad, ...attr} = args ?? {};
        pos = pos ?? [0.5, 0.5];
        rad = rad ?? [0.5, 0.5];

        super('ellipse', true, attr);
        this.pos = pos;
        this.rad = rad;

        let [px, py] = pos;
        let [rx, ry] = rad;
        this.xlim = [px - rx, px + rx];
        this.ylim = [py - ry, py + ry];
    }

    props(ctx) {
        let [cx, cy] = ctx.coord_to_pixel(this.pos);
        let [rx, ry] = ctx.coord_to_pixel_size(this.rad);
        let base = {cx, cy, rx, ry};
        return {...base, ...this.attr};
    }
}

class Circle extends Ellipse {
    constructor(args) {
        let {pos, rad, ...attr} = args ?? {};
        pos = pos ?? [0.5, 0.5];
        rad = rad ?? 0.5;

        let rad2 = [rad, rad];
        let base = {pos, rad: rad2, aspect: 1};
        super({...base, ...attr});
    }
}

class Dot extends Circle {
    constructor(args) {
        let {color, rad, ...attr} = args ?? {};
        color = color ?? 'black';
        super({stroke: color, fill: color, rad, ...attr});
    }
}

class Ray extends Element {
    constructor(theta, args) {
        let {aspect, ...attr} = args ?? {};
        theta = theta ?? 45;

        // map into (-90, 90];
        if (theta < -90 || theta > 90) {
            theta = ((theta + 90) % 180) - 90;
        }
        if (theta == -90) {
            theta = 90;
        }

        // map theta into direction and aspect
        let direc;
        if (theta == 90) {
            direc = Infinity;
            aspect = 1;
        } else if (theta == 0) {
            direc = 0;
            aspect = 1;
        } else {
            let direc0 = tan(theta*(pi/180));
            direc = direc0;
            aspect = 1/abs(direc0);
        }

        // pass to Element
        super('line', true, {aspect, ...attr});
        this.direc = direc;
    }

    props(ctx) {
        let p1, p2;
        if (!isFinite(this.direc)) {
            [p1, p2] = [[0.5, 0], [0.5, 1]];
        } else if (this.direc == 0) {
            [p1, p2] = [[0, 0.5], [1, 0.5]];
        } else if (this.direc > 0) {
            [p1, p2] = [[0, 0], [1, 1]];
        } else {
            [p1, p2] = [[0, 1], [1, 0]];
        }
        let [x1, y1] = ctx.coord_to_pixel(p1);
        let [x2, y2] = ctx.coord_to_pixel(p2);
        let base = {x1, y1, x2, y2};
        return {...base, ...this.attr};
    }
}

/**
 ** path builder
 **/

class Pointstring extends Element {
    constructor(tag, points, args) {
        let {xlim, ylim, ...attr} = args ?? {};
        super(tag, true, attr);
        this.points = points;
        if (points.length > 0) {
            let [xvals, yvals] = zip(...points);
            this.xlim = xlim ?? [min(...xvals), max(...xvals)];
            this.ylim = ylim ?? [min(...yvals), max(...yvals)];
        }
    }

    props(ctx) {
        let points = this.points.map(p => ctx.coord_to_pixel(p));
        let str = points.map(
            ([x, y]) => `${rounder(x, ctx.prec)},${rounder(y, ctx.prec)}`
        ).join(' ');
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

class Triangle extends Polygon {
    constructor(args) {
        let {pos, rad, ...attr} = args ?? {};
        pos = pos ?? [0.5, 0.5];
        rad = rad ?? 0.5;

        // get vertices
        let [px, py] = pos;
        let [rx, ry] = ensure_vector(rad, 2);
        let points = [[px - rx, py + ry], [px + rx, py + ry], [px, py - ry]];

        // pass to Polygon
        super(points, attr);
    }
}

function arg(s, d, ctx) {
    if (s == 'xy') {
        let [x, y] = ctx.coord_to_pixel(d);
        return `${rounder(x, ctx.prec)},${rounder(y, ctx.prec)}`;
    } else if (s == 'x') {
        let [x, _] = ctx.coord_to_pixel([d, 0]);
        return `${rounder(x, ctx.prec)}`;
    } else if (s == 'y') {
        let [_, y] = ctx.coord_to_pixel([0, d]);
        return `${rounder(y, ctx.prec)}`;
    } else if (s == 'wh') {
        let [w, h] = ctx.coord_to_pixel_size(d);
        return `${rounder(w, ctx.prec)},${rounder(h, ctx.prec)}`;
    } else if (s == 'w') {
        let [w, _] = ctx.coord_to_pixel_size([d, 0]);
        return `${rounder(w, ctx.prec)}`;
    } else if (s == 'h') {
        let [_, h] = ctx.coord_to_pixel_size([0, d]);
        return `${rounder(h, ctx.prec)}`;
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
    constructor(p) {
        super('M', ['xy'], [p]);
        this.point = p;
    }
}

class MoveDel extends Command {
    constructor(p) {
        super('m', ['wh'], [p]);
    }
}

class LineTo extends Command {
    constructor(p) {
        super('L', ['xy'], [p]);
        this.point = p;
    }
}

class LineDel extends Command {
    constructor(p) {
        super('l', ['wh'], [p]);
    }
}

class VerticalTo extends Command {
    constructor(y) {
        super('V', ['y'], [y]);
        this.point = [null, y];
    }
}

class VerticalDel extends Command {
    constructor(y) {
        super('v', ['h'], [y]);
    }
}

class HorizontalTo extends Command {
    constructor(x) {
        super('H', ['x'], [x]);
        this.point = [x, null];
    }
}

class HorizontalDel extends Command {
    constructor(x) {
        super('h', ['w'], [x]);
    }
}

class Bezier2 extends Command {
    constructor(p, p1) {
        if (p1 == null) {
            super('T', ['xy'], [p]);
        } else {
            super('Q', ['xy', 'xy'], [p1, p]);
        }
        this.point = p;
    }
}

class Bezier3 extends Command {
    constructor(p, p2, p1) {
        if (p1 == null) {
            super('S', ['xy', 'xy'], [p2, p]);
        } else {
            super('C', ['xy', 'xy', 'xy'], [p1, p2, p]);
        }
        this.point = p;
    }
}

class ArcTo extends Command {
    constructor(p, r, args) {
        let {angle, large, sweep} = args ?? {};
        angle = angle ?? 0;
        large = large ?? true;
        sweep = sweep ?? true;

        large = large ? 1 : 0;
        sweep = sweep ? 1 : 0;
        super('A', ['wh', '', '', '', 'xy'], [r, angle, large, sweep, p]);
    }
}

class ArcDel extends Command {
    constructor(p, r, args) {
        let {angle, large, sweep} = args ?? {};
        angle = angle ?? 0;
        large = large ?? true;
        sweep = sweep ?? true;

        large = large ? 1 : 0;
        sweep = sweep ? 1 : 0;
        super('a', ['wh', '', '', '', 'wh'], [r, angle, large, sweep, p]);
    }
}

class ClosePath extends Command {
    constructor() {
        super('Z', [], []);
    }
}

class Path extends Element {
    constructor(commands, args) {
        super('path', true, args);
        this.commands = commands;
        let [pxs, pys] = zip(
            ...commands.map(c => c.point).filter(p => p != null)
        );
        this.xlim = [min(...pxs), max(...pxs)];
        this.ylim = [min(...pys), max(...pys)];
    }

    props(ctx) {
        let cmd = this.commands.map(c => c.string(ctx)).join(' ');
        return {d: cmd, ...this.attr};
    }
}

function make_bezier2(d) {
    let [d0, ..._] = d;
    if (is_scalar(d0)) {
        return new Bezier2(d);
    } else if (is_array(d0)) {
        return new Bezier2(...d);
    } else {
        return d;
    }
}

class Bezier2Path extends Path {
    constructor(start, bezs, args) {
        start = new MoveTo(start);
        bezs = bezs.map(make_bezier2);   
        super([start, ...bezs], args);
    }
}

// draws little vectors for path
class Bezier2PathDebug extends Container {
    constructor(start, bezs, args) {
        let bezo = new Bezier2Path(start, bezs, args);
        let [nodes, arrows] = zip(...bezs);
        nodes.unshift(start);

        let red = new Dot({color: 'red'});
        let points1 = new Points(nodes, {size: 0.01});
        let points2 = new Points(arrows, {size: 0.007, shape: red});
        let lines = zip(nodes.slice(0, -1), arrows).map(([n, a]) =>
            new Line(n, a, {stroke: 'blue', stroke_dasharray: 2, opacity: 0.7})
        );

        super([bezo, ...lines, points1, points2]);
    }
}

class Bezier2Line extends Path {
    constructor(p0, p1, px, args) {
        let start = new MoveTo(p0);
        let bezer = new Bezier2(p1, px);
        super([start, bezer], args); 
    }
}

class Bezier3Line extends Path {
    constructor(p0, p1, px0, px1, args) {
        let start = new MoveTo(p0);
        let bezer = new Bezier3(p1, px0, px1);
        super([start, bezer], args); 
    }
}

/**
 ** filters and effects
 **/

// random 6-digit hex
function random_hex() {
    return Math.floor(Math.random()*0x1000000).toString(16);
}

class MetaElement {
    constructor(tag, args) {
        this.tag = tag;
        this.args = args;
    }

    inside(ctx) {
        return null;
    }

    svg(ctx) {
        let inside = this.inside();
        let props = Object.entries(this.args).map(([k, v]) =>
            `${k.replace('_', '-')}="${v}"`
        ).join(' ');
        if (inside == null) {
            return `<${this.tag} ${props} />`;
        } else {
            return `<${this.tag} ${props}>\n${inside}\n</${this.tag}>`;
        }
    }
}

class MetaContainer extends MetaElement {
    constructor(tag, children, args) {
        super(tag, args);
        this.children = children;
    }

    inside(ctx) {
        return this.children.map(c => c.svg(ctx)).join('\n');
    }
}

class Defs extends MetaContainer {
    constructor(children, args) {
        super('defs', children, args);
    }
}

class Effect extends MetaElement {
    constructor(name, args) {
        super(`fe${name}`, args);
        let klass = this.constructor.name.toLowerCase();
        this.result = args.result ?? `${klass}_${random_hex()}`;
    }
}

class Filter extends MetaContainer {
    constructor(name, effects, args) {
        super('filter', effects, {id: name, ...args});
    }
}

class DropShadow extends Effect {
    constructor(args) {
        let {dx, dy, blur, color, ...attr} = args ?? {};
        dx = dx ?? 0;
        dy = dy ?? 0;
        blur = blur ?? 0;
        color = color ?? 'black';

        let attr1 = {dx, dy, stdDeviation: blur, flood_color: color, ...attr};
        super('DropShadow', attr1);
    }
}

class GaussianBlur extends Effect {
    constructor(args) {
        let {blur, ...attr} = args ?? {};
        blur = blur ?? 0;

        let attr1 = {stdDeviation: blur, ...attr};
        super('GaussianBlur', attr1);
    }
}

class MergeNode extends MetaElement {
    constructor(input, args) {
        let attr = {'in': input, ...args};
        super('feMergeNode', attr);
    }
}

class Merge extends MetaContainer {
    constructor(effects, args) {
        let nodes = effects.map(e => MergeNode(e.result));
        super('feMerge', nodes, args);
    }
}

/**
 ** text elements
 **/

class Text extends Element {
    constructor(text, args) {
        let {
            font_family, font_weight, size, actual, calc_family, calc_weight, calc_size, hshift, vshift, ...attr
        } = args ?? {};
        size = size ?? font_size_base;
        actual = actual ?? false;
        hshift = hshift ?? 0.0;
        vshift = vshift ?? -0.13;

        // select calculated fonts
        calc_family = calc_family ?? font_family ?? font_family_base;
        calc_weight = calc_weight ?? font_weight ?? font_weight_base;
        calc_size = calc_size ?? size;

        // compute text box
        let fargs = {family: calc_family, weight: calc_weight, calc_size: calc_size, actual};
        let [xoff, yoff, width, height] = textSizer(text, fargs);
        [xoff, yoff, size] = [xoff/height, yoff/height, size/height];
        let aspect = width/height;

        // pass to element
        let attr1 = {aspect, font_family, font_weight, fill: 'black', ...attr};
        super('text', false, attr1);

        // store metrics
        this.xoff = xoff + hshift;
        this.yoff = yoff + vshift;
        this.size = size;
        this.text = text;
    }

    props(ctx) {
        // get pixel position
        let [x, y0] = ctx.coord_to_pixel([this.xoff, this.yoff]);
        let [w0, h0] = ctx.coord_to_pixel_size([0, this.size]);

        // get adjusted size
        let h = this.size*h0;
        let y = y0 + h;

        let base = {x, y, font_size: `${h}px`};
        return {...base, ...this.attr};
    }

    inner(ctx) {
        return this.text;
    }
}

class Emoji extends Text {
    constructor(tag, args) {
        let text = emoji_table[tag];
        let text_attr = {};
        if (text == null) {
            text = `:${tag}:`;
            text_attr.fill = red;
            text_attr.stroke = red;
        }
        let attr1 = {...text_attr, ...args};
        super(text, attr1);
    }
}

function get_attributes(elem) {
    return Object.fromEntries(
        Array.from(elem.attributes, ({name, value}) => [name, value])
    )
}

class Tex extends Element {
    constructor(text, args) {
        let {pos, size, ...attr} = args ?? {};
        pos = pos ?? [0, 0];
        size = size ?? 1;

        // render with katex (or do nothing if katex is not available)
        let svg_attr, math, width, height;
        if (typeof MathJax !== 'undefined') {
            // render with mathjax
            let output = MathJax.tex2svg(text);
            let svg = output.children[0];

            // strip outer size attributes
            svg.removeAttribute('width');
            svg.removeAttribute('height');

            // get width and height
            let viewBox = svg.getAttribute('viewBox');
            let viewNum = viewBox.split(' ').map(Number);
            [width, height] = viewNum.slice(2);

            // get tag info and inner svg
            svg_attr = get_attributes(svg);
            math = svg.innerHTML;

        } else {
            math = text;
        }

        // pass to element
        let aspect = width/height;
        let attr1 = {aspect, ...svg_attr,...attr};
        super('svg', false, attr1);

        // store metrics
        self.pos = pos;
        this.size = size;
        this.math = math;
    }

    props(ctx) {
        // get pixel position
        let [x, y] = ctx.coord_to_pixel(self.pos);
        let [w, h] = ctx.coord_to_pixel_size([this.size, this.size]);

        let base = {x, y, width: w, height: h, font_size: `${h}px`};
        return {...base, ...this.attr};
    }

    inner(ctx) {
        return `\n${this.math}\n`;
    }
}

class Node extends Frame {
    constructor(text, args) {
        let {padding, border, spacing, align, latex, emoji, ...attr0} = args ?? {};
        let [text_attr, attr] = prefix_split(['text'], attr0);
        padding = padding ?? 0.1;
        spacing = spacing ?? 0.02;
        border = border ?? 1;
        latex = latex ?? false;

        // generate core elements
        let child;
        if (is_string(text)) {
            if (emoji) {
                child = new Emoji(text, text_attr);
            } else if (latex) {
                child = new Tex(text, text_attr);
            } else {
                child = new Text(text, text_attr);
            }
        } else if (is_array(text)) {
            let lines = text.map(s => is_string(s) ? new Text(s, text_attr) : s);
            child = new VStack(lines, {expand: false, align, spacing});
        } else {
            child = text;
        }

        // pass to container
        let attr1 = {padding, border, align, ...attr};
        super(child, attr1);
    }
}

class FlexNode extends Node {
    constructor(child, args) {
        let attr = args ?? {};
        let attr1 = {flex: true, ...attr};
        super(child, attr1);
    }
}

class TitleFrame extends Frame {
    constructor(child, text, attr) {
        let {title_size, title_fill, title_offset, title_radius, adjust, padding, margin, border, ...attr0} = attr ?? {};
        let [title_attr0, frame_attr0] = prefix_split(['title'], attr0);
        title_size = title_size ?? 0.075;
        title_fill = title_fill ?? 'white';
        title_offset = title_offset ?? 0;
        title_radius = title_radius ?? 0.05;
        adjust = adjust ?? false;
        padding = padding ?? 0;
        margin = margin ?? 0;
        border = border ?? 1;

        // adjust padding for title
        if (adjust) {
            margin = pad_rect(margin);
            padding = pad_rect(padding);
            let [pl, pt, pr, pb] = padding;
            let [ml, mt, mr, mb] = margin;
            padding = [pl, pt + title_size, pr, pb];
            margin = [ml, mt + title_size, mr, mb];
        }

        // fill in default attributes
        let frame_attr = {margin, border, ...frame_attr0};
        let title_attr = {fill: title_fill, border_radius: title_radius, ...title_attr0};

        // place label at top
        let base = title_offset * title_size;
        let title = new Node(text, title_attr);
        let place = new Place(title, {pos: [0.5, base], rad: [null, title_size], expand: true});
        let frame = new Frame(child, {padding});
        let group = new Group([frame, place], {clip: false, aspect: frame.aspect});

        // apply margin only frame
        super(group, frame_attr);
    }
}

/**
 ** fields
 **/

class Arrow extends Container {
    constructor(direc, args) {
        let {pos, head, tail, shape, graph, ...attr0} = args ?? {};
        let [head_attr, tail_attr, attr] = prefix_split(['head', 'tail'], attr0);
        pos = pos ?? [0.5, 0.5];
        head = head ?? 0.3;
        tail = tail ?? 2.0;
        shape = shape ?? 'arrow';
        graph = graph ?? true;

        // baked in shapes
        if (shape == 'circle') {
            shape = (_, a) => new Dot(a);
        } else if (shape == 'arrow') {
            shape = (t, a) => new Arrowhead(t, a);
        } else {
            throw new Error(`Unrecognized arrow shape: ${shape}`);
        }

        // ensure vector direction
        let theta;
        if (is_scalar(direc)) {
            theta = direc;
            let radians = d2r*direc;
            direc = [cos(radians), sin(radians)];
        } else {
            theta = r2d*Math.atan2(direc[1], direc[0]);
            direc = normalize(direc, 2);
        }

        // sort out graph direction
        direc = graph ? mul(direc, [1, -1]) : direc;

        // create head (override with null direction)
        let head_elem;
        if (norm(direc, 2) == 0) {
            head_elem = new Dot({pos, rad: head, ...head_attr});
        } else {
            head_elem = shape(theta, {pos, rad: head, ...head_attr});
        }

        // create tail
        let tail_direc = direc.map(z => -tail*z);
        let tail_elem = new Line(pos, add(pos, tail_direc), tail_attr);

        super([head_elem, tail_elem], attr);
    }
}

class Field extends Points {
    constructor(points, direcs, args) {
        let {marker, ...attr0} = args ?? {};
        let [marker_attr, attr] = prefix_split(['marker'], attr0);
        marker = marker ?? ((p, d, attr) => new Arrow(d, attr));
        let field = zip(points, direcs).map(([p, d]) => [marker(p, d, marker_attr), p]);
        super(field, attr);
    }
}

class SymField extends Field {
    constructor(func, args) {
        let {xlim, ylim, N, ...attr} = args ?? {};
        xlim = xlim ?? limit_base;
        ylim = ylim ?? limit_base;
        N = N ?? 10;

        let points = lingrid(xlim, ylim, N);
        let direcs = points.map(func);
        super(points, direcs, attr);
    }
}

/**
 ** networks
 **/

function get_center(elem) {
    let [xmin, xmax] = elem.xlim;
    let [ymin, ymax] = elem.ylim;
    let [x, y] = [0.5*(xmin+xmax), 0.5*(ymin+ymax)];
    return [x, y];
}

function get_direction(p1, p2) {
    let [x1, y1] = p1;
    let [x2, y2] = p2;

    let [dx, dy] = [x2 - x1, y2 - y1];
    let [ax, ay] = [abs(dx), abs(dy)];

    if (dy <= -ax) {
        return 'north';
    } else if (dy >= ax) {
        return 'south';
    } else if (dx >= ay) {
        return 'east';
    } else if (dx <= -ay) {
        return 'west';
    }
}

function get_anchor(elem, pos) {
    let [xmin, xmax] = elem.xlim;
    let [ymin, ymax] = elem.ylim;

    let xmid = 0.5*(xmin+xmax);
    let ymid = 0.5*(ymin+ymax);

    if (pos == 'north' || pos == 'top') {
        return [xmid, ymin];
    } else if (pos == 'south' || pos == 'bottom') {
        return [xmid, ymax];
    } else if (pos == 'east' || pos == 'right') {
        return [xmax, ymid];
    } else if (pos == 'west' || pos == 'left') {
        return [xmin, ymid];
    }
}

function norm_direc(direc) {
    if (direc == 'n' || direc == 'north') {
        return 'n';
    } else if (direc == 's' || direc == 'south') {
        return 's';
    } else if (direc == 'e' || direc == 'east') {
        return 'e';
    } else if (direc == 'w' || direc == 'west') {
        return 'w';
    } else {
        throw new Error(`Unrecognized direction specification: ${direc}`);
    }
}

class Arrowhead extends Container {
    constructor(direc, args) {
        let {pos, rad, base, stroke_width, ...attr} = args ?? {};
        pos = pos ?? [0.5, 0.5];
        rad = rad ?? [0.5, 0.5];
        base = base ?? false;
        stroke_width = stroke_width ?? 1;

        // generate arrowhead polygon
        let pattr = {stroke_width, ...attr};
        let points = [[0, 0], [0.5, 0.5], [0, 1]];
        let Maker = base ? Polygon : Polyline;
        let shape = new Maker(points, pattr);

        // calculate size
        let rad2 = ensure_vector(rad, 2);
        let rect = rad_rect(pos, rad2);

        // pass to group for rotate
        let child = [shape, {rect, rotate: -direc}];
        super([child]);
    }
}

class Edge extends Container {
    constructor(beg, end, args) {
        let {curve, arrow, arrow_beg, arrow_end, arrow_size, debug, ...attr0} = args ?? {};
        let [arrow_beg_attr, arrow_end_attr, arrow_attr, line_attr, attr] = prefix_split(
            ['arrow_beg', 'arrow_end', 'arrow', 'line'], attr0
        );
        curve = curve ?? 0.3;
        arrow_size = arrow_size ?? 0.02;
        debug = debug ?? false;

        // accumulate arguments
        arrow_beg_attr = {rad: arrow_size, ...arrow_attr, ...arrow_beg_attr};
        arrow_end_attr = {rad: arrow_size, ...arrow_attr, ...arrow_end_attr};

        // final arrowheads
        arrow = arrow ?? false;
        arrow_end = arrow || (arrow_end ?? false);

        // determine directions
        let [[p1, d1], [p2, d2]] = [beg, end].map(pd => is_array(pd[0]) ? pd : [pd, null]);
        [d1, d2] = [d1 ?? get_direction(p1, p2), d2 ?? get_direction(p2, p1)];

        // unpack positions
        let [[x1, y1], [x2, y2]] = [p1, p2];
        let [dx, dy] = [x2 - x1, y2 - y1];

        // sort out directions
        [d1, d2] = [norm_direc(d1), norm_direc(d2)];
        let vert1 = d1 == 'n' || d1 == 's';
        let vert2 = d2 == 'n' || d2 == 's';
        let wide = abs(dx) > abs(dy);

        // optional arrowheads
        let arrow_dir = {'n': -90, 's': 90, 'e': 180, 'w': 0};
        let [rot1, rot2] = [arrow_dir[d1], arrow_dir[d2]];
        let ahead_beg = arrow_beg ? new Arrowhead(rot1, {pos: p1, ...arrow_beg_attr}) : null;
        let ahead_end = arrow_end ? new Arrowhead(rot2, {pos: p2, ...arrow_end_attr}) : null;

        // reorient so that when non-aliged:
        // (1) when wide, we go vertical first
        // (2) when tall, we go horizontal first
        if (vert1 != vert2) {
            if (vert1 != wide) {
                [p1, p2] = [p2, p1];
                [[x1, y1], [x2, y2]] = [[x2, y2], [x1, y1]];
                [dx, dy] = [-dx, -dy];
                [vert1, vert2] = [vert2, vert1];
            }
        }

        // curve levels by direction
        let curve1, curve2;
        if (vert1 == vert2) {
            [curve1, curve2] = [curve, curve];
        } else {
            [curve1, curve2] = [1.0, curve];
        }

        // anchor point 1
        let px1;
        if (vert1) {
            px1 = [x1, y1 + curve1*dy];
        } else {
            px1 = [x1 + curve1*dx, y1];
        }

        // anchor point 2
        let px2;
        if (vert2) {
            px2 = [x2, y2 - curve2*dy];
        } else {
            px2 = [x2 - curve2*dx, y2];
        }

        // center point
        let pc;
        if (vert1 == vert2) {
            pc = [0.5*(x1+x2), 0.5*(y1+y2)];
        } else {
            if (wide) {
                pc = [0.5*(x1+x2), y2];
            } else {
                pc = [x2, 0.5*(y1+y2)];
            }
        }

        // create bezier curves
        let BezClass = debug ? Bezier2PathDebug : Bezier2Path;
        let line = new BezClass(p1, [[pc, px1], [p2, px2]], line_attr);

        // pass to container
        let children = [line, ahead_beg, ahead_end].filter(x => x != null);
        super(children, attr);
    }
}

class Network extends Container {
    constructor(nodes, edges, args) {
        let {size, directed, aspect, debug, arrow_size, ...attr0} = args ?? {};
        let [node_attr, edge_attr, arrow_attr, attr] = prefix_split(['node', 'edge', 'arrow'], attr0);
        size = size ?? 0.1;
        directed = directed ?? false;
        arrow_size = arrow_size ?? [0.02, 0.015];

        // sort out final edge attributes
        arrow_size = aspect_invariant(arrow_size, 1/(aspect ?? 1));
        edge_attr = {
            arrow_end: directed, arrow_size, debug, ...edge_attr, ...prefix_add('arrow', arrow_attr)
        };

        // collect node boxes
        let make_node = b => new Node(b, {flex: true, ...node_attr});
        let bmap = Object.fromEntries(nodes.map(([s, b, p, r]) => {
            b = is_element(b) ? b : make_node(b);
            return [s, new Place(b, {pos: p, rad: r ?? size})];
        }));

        // collect edge paths
        let lines = edges.map(([na1, na2, eattr]) => {
            eattr = eattr ?? {};

            let [n1, d1] = is_array(na1) ? na1 : [na1, null];
            let [n2, d2] = is_array(na2) ? na2 : [na2, null];
            let [b1, b2] = [bmap[n1], bmap[n2]];

            let [p1, p2] = [get_center(b1), get_center(b2)];
            [d1, d2] = [d1 ?? get_direction(p1, p2), d2 ?? get_direction(p2, p1)];
            let [a1, a2] = [get_anchor(b1, d1), get_anchor(b2, d2)];

            return new Edge([a1, d1], [a2, d2], {...edge_attr, ...eattr});
        });

        // find total limits
        let boxes = Object.values(bmap);
        let [xmins, xmaxs] = zip(...boxes.map(b => b.xlim));
        let [ymins, ymaxs] = zip(...boxes.map(b => b.ylim));

        // combine into container
        let attr1 = {aspect, ...attr};
        super([...boxes, ...lines], attr1);
        this.xlim = [min(...xmins), max(...xmaxs)];
        this.ylim = [min(...ymins), max(...ymaxs)];
        this.bmap = bmap;
    }

    get_anchor(tag, pos) {
        let box = this.bmap[tag];
        return get_anchor(box, pos);
    }
}

/**
 ** parametric paths
 **/

function func_or_scalar(x) {
    if (is_scalar(x)) {
        return () => x;
    } else {
        return x;
    }
}

// determines actual values given combinations of limits, values, and functions
function sympath(args) {
    let {fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N} = args ?? {};
    tlim = tlim ?? limit_base;
    fx = func_or_scalar(fx);
    fy = func_or_scalar(fy);

    // determine data size
    let Ns = new Set([tvals, xvals, yvals].filter(v => v != null).map(v => v.length));
    if (Ns.size > 1) {
        throw new Error(`Error: data sizes must be in aggreement but got ${Ns}`);
    } else if (Ns.size == 1) {
        [N,] = Ns;
    } else {
        N = N ?? N_base;
    }

    // compute data values
    tvals = tvals ?? linspace(...tlim, N);
    if (fx != null && fy != null) {
        xvals = tvals.map(fx);
        yvals = tvals.map(fy);
    } else if (fy != null) {
        xvals = xvals ?? linspace(...xlim, N);
        yvals = xvals.map(fy);
    } else if (fx != null) {
        yvals = yvals ?? linspace(...ylim, N);
        xvals = yvals.map(fx);
    }

    return [tvals, xvals, yvals];
}

class SymPath extends Polyline {
    constructor(args) {
        let {fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr} = args ?? {};

        // compute path values
        [tvals, xvals, yvals] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N
        });

        // get valid point pairs
        let points = zip(xvals, yvals).filter(
            ([x, y]) => (x != null) && (y != null)
        );

        // pass to element
        super(points, attr);
    }
}

class SymFill extends Polygon {
    constructor(args) {
        let {fx1, fy1, fx2, fy2, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr} = args ?? {};

        // compute point values
        let [tvals1, xvals1, yvals1] = sympath({
            fx: fx1, fy: fy1, xlim, ylim, tlim, xvals, yvals, tvals, N
        });
        let [tvals2, xvals2, yvals2] = sympath({
            fx: fx2, fy: fy2, xlim, ylim, tlim, xvals, yvals, tvals, N
        });
        let points = [...zip(xvals1, yvals1), ...zip(xvals2, yvals2).reverse()];

        // pass to element
        super(points, attr);
    }
}

class SymPoly extends Polygon {
    constructor(args) {
        let {fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr} = args ?? {};

        // compute point values
        let [tvals1, xvals1, yvals1] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N
        });
        let points = zip(xvals1, yvals1);

        // pass to element
        super(points, attr);
    }
}

class SymPoints extends Container {
    constructor(args) {
        let {fx, fy, fs, fr, size, shape, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr} = args ?? {};
        size = size ?? 0.01;
        shape = shape ?? new Dot();
        fr = fr ?? (() => size);
        fs = fs ?? (() => shape);

        // compute point values
        [tvals, xvals, yvals] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N
        });

        // make points
        let points = zip(tvals, xvals, yvals);
        let children = enumerate(points).map(([i, [t, x, y]]) =>
            [fs(x, y, t, i), rad_rect([x, y], fr(x, y, t, i))]
        );

        // pass  to element
        let attr1 = {clip: false, ...attr};
        super(children, attr1);
    }
}

function pointpath(args) {
    let {xvals, yvals, xlim, ylim, N} = args ?? {};
    if (xvals == null) {
        xlim = xlim ?? [0, N-1];
        xvals = linspace(...xlim, N);
    }
    if (yvals == null) {
        ylim = ylim ?? [0, N-1];
        yvals = linspace(...ylim, N);
    }
    [xvals, yvals] = [xvals, yvals].map(v => ensure_vector(v, N));
    return zip(xvals, yvals);
}

class PointPath extends Polyline {
    constructor(args) {
        let {xvals, yvals, xlim, ylim, ...attr} = args ?? {};
        let points = pointpath({xvals, yvals, xlim, ylim});
        super(points, attr);
    }
}

class PointFill extends Polygon {
    constructor(args) {
        let {xvals1, yvals1, xvals2, yvals2, xlim, ylim, ...attr} = args ?? {};

        // repeat constants
        let N = max(...[xvals1, yvals1, xvals2, yvals2].map(v => v?.length));
        [xvals1, yvals1, xvals2, yvals2] = [xvals1, yvals1, xvals2, yvals2].map(
            v => (v != null) ? ensure_vector(v, N) : null
        );

        // make forward-backard shape
        let points1 = pointpath({xvals: xvals1, yvals: yvals1, xlim, ylim, N});
        let points2 = pointpath({xvals: xvals2, yvals: yvals2, xlim, ylim, N});
        let points = [...points1, ...points2.reverse()];

        // pass to pointstring
        super(points, attr);
    }
}

/**
 ** bar components
 **/

class Bar extends Container {
    constructor(args) {
        let {color, shape, ...attr} = args ?? {};
        shape = shape ?? (a => new Rect(a));

        // make shape
        let child = shape({stroke: color, fill: color, ...attr});

        // call constructor
        super([child]);
    }
}

// no aspect, but has a ylim and optional width that is used by Bars
class MultiBar extends Stack {
    constructor(direc, lengths, args) {
        let {zero, size, color, ...attr} = args ?? {};
        zero = zero ?? 0;

        // get standardized direction
        direc = get_orient(direc);
        lengths = is_scalar(lengths) ? [lengths] : lengths;
        // if (direc == 'v') { lengths = lengths.reverse(); }

        // normalize section specs
        let boxes = lengths.map(lc => is_scalar(lc) ? [lc, null] : lc);
        let length = sum(boxes.map(([l, c]) => l));
        let children = boxes.map(([l, c]) =>
            [new Rect({fill: c ?? color, ...attr}), l/length]
        );

        super(direc, children);
        this.lim = [zero, zero + length];
    }
}

class VMultiBar extends MultiBar {
    constructor(lengths, args) {
        super('v', lengths, args);
    }
}

class HMultiBar extends MultiBar {
    constructor(lengths, args) {
        super('h', lengths, args);
    }
}

// custom bars are aspectless
// variables named for vertical bars case
class Bars extends Container {
    constructor(direc, data, args) {
        let {lim, shrink, zero, width, integer, ...attr0} = args ?? {};
        let [bar_attr, attr] = prefix_split(['bar'], attr0);
        integer = integer ?? false;
        shrink = shrink ?? 0;
        zero = zero ?? 0;
        let n = data.length;

        // get standardized direction
        direc = get_orient(direc);

        // fill in default bars
        let bar0 = new Bar(bar_attr);
        data = data.map(b => is_array(b) ? b : [bar0, b]);
        let [bars, heights] = zip(...data);

        // expand scalar list case
        let lim_int = (n > 1) ? [0, n-1] : [-0.5, 0.5];
        let lim_def = (integer) ? lim_int : limit_base;
        lim = lim ?? lim_def;
        let xlocs = linspace(...lim, n);
        if (direc == 'h') { xlocs = xlocs.reverse(); }

        // get data parameters
        let [xmin, xmax] = [min(...xlocs), max(...xlocs)];
        width = width ?? ((n > 1) ? (1-shrink)*(xmax-xmin)/(n-1) : 1);

        // aggregate lengths
        let ymins = heights.map(h => min(zero, h));
        let ymaxs = heights.map(h => max(zero, h));
        let [ymin, ymax] = [min(...ymins), max(...ymaxs)];

        // compute boxes
        let children = zip(ymins, ymaxs, xlocs, bars).map(([ylo, yhi, x, b]) => {
            let w = width;
            let box = (direc == 'v') ? [x-w/2, ylo, x+w/2, yhi] : [ylo, x-w/2, yhi, x+w/2];
            return [b, box];
        });

        // set up container
        let attr1 = {clip: false, ...attr};
        super(children, attr1);
        this.locs = xlocs;

        // set axis limits
        this.xlim = lim ?? [xmin, xmax];
        this.ylim = [ymin, ymax];
        if (direc == 'h') { [this.xlim, this.ylim] = [this.ylim, this.xlim]; }
    }
}

class VBars extends Bars {
    constructor(bars, args) {
        super('v', bars, args);
    }
}

class HBars extends Bars {
    constructor(bars, args) {
        super('h', bars, args);
    }
}

/**
 ** plotting elements
 **/

function make_ticklabel(s, prec, attr) {
    let attr1 = {border: 0, padding: 0, text_vshift: -0.13, ...attr};
    let text = rounder(s, prec);
    let node = new Node(text, attr1);
    return node;
}

function ensure_tick(t, prec) {
    prec = prec ?? 3;
    if (is_scalar(t)) {
        return [t, make_ticklabel(t, prec)];
    } else if (is_array(t) && t.length == 2) {
        let [p, x] = t;
        if (x instanceof Element) {
            return t;
        } else {
            return [p, make_ticklabel(x, prec)];
        }
    } else {
        throw new Error(`Error: tick must be value or [value,label] but got "${t}"`);
    }
}

class Scale extends Container {
    constructor(direc, locs, args) {
        let {lim, ...attr} = args ?? {};
        direc = get_orient(direc);
        let tick_dir = (direc == 'v') ? 'h' : 'v';
        let tick = new UnitLine(tick_dir, 0.5);
        let [lo, hi] = lim;
        let rect = t => (direc == 'v') ? [lo, t-0.5, hi, t+0.5] : [t-0.5, lo, t+0.5, hi];
        let children = locs.map(t => [tick, rect(t)]);
        super(children, attr);
    }
}

class VScale extends Scale {
    constructor(ticks, args) {
        super('v', ticks, args);
    }
}

class HScale extends Scale {
    constructor(ticks, args) {
        super('h', ticks, args);
    }
}

// this is used by axis with the main coordinates defined
// label elements must have an aspect to properly size them
class Labels extends Container {
    constructor(direc, ticks, args) {
        let {align, prec, ...attr} = args ?? {};
        direc = get_orient(direc);
        ticks = ticks.map(x => ensure_tick(x, prec));
        align = align ?? 'left';

        // anchor vertical ticks to unit-aspect boxes
        if (direc == 'v') {
            ticks = ticks.map(([t, c]) => [t, new Anchor(c, {align})]);
        }

        // place tick boxes using expanded lines
        let rect = t => (direc == 'v') ?
            {pos: [0.5, t], rad: [0.5, 0], expand: true} :
            {pos: [t, 0.5], rad: [0, 0.5], expand: true};
        let children = ticks.map(([t, c]) => [c, rect(t)]);

        super(children, {clip: false, ...attr});
    }
}

class HLabels extends Labels {
    constructor(ticks, args) {
        super('h', ticks, args);
    }
}

class VLabels extends Labels {
    constructor(ticks, args) {
        super('v', ticks, args);
    }
}

function get_ticklim(lim) {
    if (lim == null || lim == 'up' || lim == 'right') {
        return [0.5, 1];
    } else if (lim == 'down' || lim == 'left') {
        return [0, 0.5];
    } else if (lim == 'both') {
        return [0, 1];
    } else if (lim == 'none') {
        return [0.5, 0.5];
    } else {
        return lim;
    }
}

// this is designed to be plotted directly
class Axis extends Container {
    constructor(direc, ticks, args) {
        let {
            pos, lim, tick_size, tick_pos, label_size, label_offset, label_pos, prec, ...attr0
        } = args ?? {};
        let [label_attr, tick_attr, line_attr, attr] = prefix_split(['label', 'tick', 'line'], attr0);
        direc = get_orient(direc);
        label_size = label_size ?? tick_label_size_base;
        label_offset = label_offset ?? tick_label_offset_base;
        tick_size = tick_size ?? tick_size_base;
        pos = pos ?? 0.5;
        lim = lim ?? limit_base;

        // get numerical tick limits
        let tick_lim = get_ticklim(tick_pos);
        let tick_half = 0.5*tick_size;

        // sort out label position
        let label_pos0 = (direc == 'v') ? 'left' : 'bottom';
        label_pos = label_pos ?? label_pos0;
        let lab_size = label_size*tick_size;
        let lab_off = label_offset*tick_size;
        let lab_outer = label_pos == 'left' || label_pos == 'bottom';
        let lab_base = lab_outer ? (-tick_half-lab_off-lab_size) : tick_half+lab_off;

        // extract tick information
        let [lo, hi] = lim;
        ticks = is_scalar(ticks) ? linspace(lo, hi, ticks) : ticks;
        ticks = ticks.map(t => ensure_tick(t, prec));
        let locs = ticks.map(([t, x]) => t);

        // accumulate children
        let cline = new UnitLine(direc, 0.5, {lim, ...line_attr});
        let scale = new Scale(direc, locs, {lim: tick_lim, ...tick_attr});
        let label = new Labels(direc, ticks, {align: label_pos, ...label_attr});

        // position children (main direction has data coordinates)
        let lbox, sbox;
        if (direc == 'v') {
            sbox = [pos-tick_half, lo, pos+tick_half, hi];
            lbox = [pos+lab_base, lo, pos+lab_base+lab_size, hi];
        } else {
            sbox = [lo, pos-tick_half, hi, pos+tick_half];
            lbox = [lo, pos+lab_base, hi, pos+lab_base+lab_size];
        }

        // pass to container
        let tcoord = (direc == 'v') ? [0, hi, 1, lo] : [lo, 1, hi, 0];
        let children = [[cline, sbox], [scale, sbox], [label, lbox]];
        super(children, {coord: tcoord, ...attr});
        this.ticks = ticks;

        // set limits
        if (direc == 'v') {
            this.xlim = [pos, pos];
            this.ylim = lim; 
        } else {
            this.xlim = lim;
            this.ylim = [pos, pos];
        }
    }
}

class HAxis extends Axis {
    constructor(ticks, args) {
        super('h', ticks, args);
    }
}

class VAxis extends Axis {
    constructor(ticks, args) {
        super('v', ticks, args);
    }
}

class XLabel extends Attach {
    constructor(text, attr) {
        let {offset, size, align, ...attr0} = attr ?? {};
        offset = offset ?? label_offset_base;
        size = size ?? label_size_base;
        let label = is_element(text) ? text : new Text(text, attr0);
        super(label, 'bottom', {offset, size, align});
    }
}

class YLabel extends Attach {
    constructor(text, attr) {
        let {offset, size, align, ...attr0} = attr ?? {};
        offset = offset ?? label_offset_base;
        size = size ?? label_size_base;
        let label = is_element(text) ? text : new Text(text, attr0);
        let rotate = new Rotate(label, -90, {invar: false});
        super(rotate, 'left', {offset, size, align});
    }
}

class Title extends Frame {
    constructor(text, attr) {
        let label = is_element(text) ? text : new Text(text, attr);
        super(label);
    }
}

class Mesh extends Scale {
    constructor(direc, locs, args) {
        let {lim, opacity, ...attr} = args ?? {};
        lim = lim ?? limit_base;
        opacity = opacity ?? 0.2;
        super(direc, locs, {lim, opacity, ...attr});
    }
}

class HMesh extends Mesh {
    constructor(locs, args) {
        super('h', locs, args);
    }
}

class VMesh extends Mesh {
    constructor(locs, args) {
        super('v', locs, args);
    }
}

function make_legendbadge(c, attr0) {
    attr0 = attr0 ?? {};
    let attr;
    if (is_string(c)) {
        attr = {stroke: c, ...attr0};
    } else if (is_object(c)) {
        attr = {...c, ...attr0};
    } else {
        throw new Error(`Unrecognized legend badge specification: ${c}`);
    }
    return new HLine(0.5, {aspect: 1, ...attr});
}

function make_legendlabel(s) {
    return new Text(s);
}

class Legend extends Place {
    constructor(data, args) {
        let {badgewidth, vspacing, hspacing, rect, pos, rad, ...attr0} = args ?? {};
        let [badge_attr, attr] = prefix_split(['badge'], attr0);
        badgewidth = badgewidth ?? 0.1;
        hspacing = hspacing ?? 0.025;
        vspacing = vspacing ?? 0.1;

        let [badges, labels] = zip(...data);
        badges = badges.map(b => is_element(b) ? b : make_legendbadge(b, badge_attr));
        labels = labels.map(t => is_element(t) ? t : make_legendlabel(t));

        let bs = new VStack(badges, {spacing: vspacing});
        let ls = new VStack(labels, {expand: false, align: 'left', spacing: vspacing});
        let vs = new HStack([bs, ls], {spacing: hspacing});

        let fr = new Frame(vs, attr);
        super(fr, {rect, pos, rad});
    }
}

class Note extends Place {
    constructor(text, args) {
        let {latex, ...attr0} = args ?? {};
        latex = latex ?? false;
        let [text_attr, attr] = prefix_split(['text'], attr0);

        let Maker = latex ? Tex : Text;
        let label = new Maker(text, text_attr);
        super(label, attr);
    }
}

// find minimal containing limits
function outer_limits(elems, padding) {
    padding = padding ?? 0;
    let [xpad, ypad] = ensure_vector(padding, 2);

    let [xmins, xmaxs] = zip(...elems.map(c => c.xlim).filter(z => z != null));
    let [ymins, ymaxs] = zip(...elems.map(c => c.ylim).filter(z => z != null));

    let xlim = expand_limits([min(...xmins), max(...xmaxs)], xpad);
    let ylim = expand_limits([min(...ymins), max(...ymaxs)], ypad);

    return [xlim, ylim];
}

function expand_limits(lim, fact) {
    let [lo, hi] = lim;
    let ex = fact*(hi-lo);
    return [lo-ex, hi+ex];
}

class Graph extends Container {
    constructor(elems, args) {
        let {xlim, ylim, aspect, flex, padding, ...attr} = args ?? {};
        flex = flex ?? false;
        aspect = flex ? null : (aspect ?? 'auto');
        padding = padding ?? 0;

        // handle singleton line
        if (elems instanceof Element) {
            elems = [elems];
        }

        // determine coordinate limits
        let [xlim0, ylim0] = outer_limits(elems, padding);
        xlim = xlim ?? xlim0;
        ylim = ylim ?? ylim0;

        // make coordinate box
        let [xmin, xmax] = xlim;
        let [ymin, ymax] = ylim;
        let coord = [xmin, ymax, xmax, ymin];

        // get automatic aspect
        aspect = (aspect == 'auto') ? rect_aspect(coord) : aspect;

        // pass to container
        let attr1 = {aspect, coord, ...attr};
        super(elems, attr1);
        this.xlim = xlim;
        this.ylim = ylim;
    }
}

class Plot extends Container {
    constructor(elems, args) {
        let {
            xlim, ylim, xaxis, yaxis, xticks, yticks, grid, xgrid, ygrid, xlabel, ylabel,
            title, tick_size, label_size, label_offset, label_align, title_size, title_offset,
            xlabel_size, ylabel_size, xlabel_offset, ylabel_offset, xlabel_align, ylabel_align,
            padding, prec, aspect, flex, ...attr0
        } = args ?? {};
        xaxis = xaxis ?? true;
        yaxis = yaxis ?? true;
        xticks = xticks ?? num_ticks_base;
        yticks = yticks ?? num_ticks_base;
        tick_size = tick_size ?? tick_size_base;
        flex = flex ?? false;
        aspect = flex ? null : (aspect ?? 'auto');

        // some advanced piping
        let [
            xaxis_attr, yaxis_attr, axis_attr, xgrid_attr, ygrid_attr, grid_attr, xlabel_attr,
            ylabel_attr, label_attr, title_attr, graph_attr, attr
        ] = prefix_split([
            'xaxis', 'yaxis', 'axis', 'xgrid', 'ygrid', 'grid', 'xlabel', 'ylabel', 'label',
            'title', 'graph'
        ], attr0);
        [xaxis_attr, yaxis_attr] = [{...axis_attr, ...xaxis_attr}, {...axis_attr, ...yaxis_attr}];
        [xgrid_attr, ygrid_attr] = [{...grid_attr, ...xgrid_attr}, {...grid_attr, ...ygrid_attr}];
        [xlabel_attr, ylabel_attr] = [{...label_attr, ...xlabel_attr}, {...label_attr, ...ylabel_attr}];

        // handle singleton line
        if (elems instanceof Element) {
            elems = [elems];
        }

        // determine coordinate limits
        let [xlim0, ylim0] = outer_limits(elems, padding);
        [xlim, ylim] = [xlim ?? xlim0, ylim ?? ylim0];
        let [[xlo, xhi], [ylo, yhi]] = [xlim, ylim];
        let [xrange, yrange] = [abs(xhi-xlo), abs(yhi-ylo)];

        // ensure consistent apparent tick size
        aspect = (aspect == 'auto') ? xrange/yrange : aspect;
        let [xtick_size, ytick_size] = aspect_invariant(tick_size, aspect);
        [xtick_size, ytick_size] = [yrange*xtick_size, xrange*ytick_size];

        // default xaxis generation
        if (xaxis === true) {
            xaxis = new HAxis(xticks, {
                pos: ylo, lim: xlim, tick_size: xtick_size, ...xaxis_attr
            });
        } else if (xaxis === false) {
            xaxis = null;
        }

        // default yaxis generation
        if (yaxis === true) {
            yaxis = new VAxis(yticks, {
                pos: xlo, lim: ylim, tick_size: ytick_size, ...yaxis_attr
            });
        } else if (yaxis === false) {
            yaxis = null;
        }

        // automatic grid path
        if (grid === true || xgrid === true) {
            xgrid = (xaxis != null) ? xaxis.ticks.map(([x, t]) => x) : null;
        }
        if (grid === true || ygrid === true) {
            ygrid = (yaxis != null) ? yaxis.ticks.map(([y, t]) => y) : null;
        }
        if (is_array(xgrid)) {
            xgrid = new HMesh(xgrid, {lim: ylim, ...xgrid_attr});
        }
        if (is_array(ygrid)) {
            ygrid = new VMesh(ygrid, {lim: xlim, ...ygrid_attr});
        }

        // create graph from core elements
        let elems1 = [xgrid, ygrid, ...elems, xaxis, yaxis].filter(z => z != null);
        let graph = new Graph(elems1, {xlim, ylim, aspect, padding, ...graph_attr});

        // create base layout
        let children = [graph];

        // sort out label size and offset
        if (xlabel != null || ylabel != null) {
            label_size = label_size ?? label_size_base;
            let [xlabelsize, ylabelsize] = aspect_invariant(label_size, aspect);
            xlabel_size = xlabel_size ?? xlabelsize;
            ylabel_size = ylabel_size ?? ylabelsize;

            label_offset = label_offset ?? label_offset_base;
            let [xlabeloffset, ylabeloffset] = aspect_invariant(label_offset, aspect);
            xlabel_offset = xlabel_offset ?? xlabeloffset;
            ylabel_offset = ylabel_offset ?? ylabeloffset;

            label_align = label_align ?? 'center';
            xlabel_align = xlabel_align ?? label_align;
            ylabel_align = ylabel_align ?? label_align;
        }

        // optional axis labels
        if (xlabel != null) {
            xlabel = new XLabel(xlabel, {
                size: xlabel_size, offset: xlabel_offset, align: xlabel_align, ...xlabel_attr
            });
            children.push(xlabel);
        }
        if (ylabel != null) {
            ylabel = new YLabel(ylabel, {
                size: ylabel_size, offset: ylabel_offset, align: ylabel_align, ...ylabel_attr
            });
            children.push(ylabel);
        }

        // optional plot title
        if (title != null) {
            title_size = title_size ?? title_size_base;
            title_offset = title_offset ?? title_offset_base;
            title = new Title(title, title_attr);
            let title_rect = [0, -title_offset-title_size, 1, -title_offset];
            children.push([title, title_rect]);
        }

        // pass to container
        let attr1 = {aspect, ...attr};
        super(children, attr1);
    }
}

class BarPlot extends Plot {
    constructor(data, args) {
        let {direc, aspect, shrink, padding, color, ...attr0} = args ?? {};
        let [bars_attr, bar_attr, attr] = prefix_split(['bars', 'bar'], attr0);
        bars_attr = {...bars_attr, ...prefix_add('bar', bar_attr)};
        direc = direc ?? 'v';
        aspect = aspect ?? phi;
        shrink = shrink ?? 0.2;
        color = color ?? 'lightgray';

        // standardize direction
        direc = get_orient(direc);

        // set up appropriate padding
        let n = data.length;
        let zpad = min(0.5, 1/n);
        let padding0 = (direc == 'v') ? [zpad, 0] : [0, zpad];
        padding = padding ?? padding0;

        // generate actual bars
        let [labs, bars] = zip(...data);
        let bars1 = new Bars(direc, bars, {shrink, bar_fill: color, ...bars_attr});
        let ticks = zip(bars1.locs, labs);

        // send to general plot
        let attr1 = {aspect, padding, ...attr};
        if (direc == 'v') { attr1.xticks = ticks; } else { attr1.yticks = ticks; }
        super(bars1, attr1);
    }
}

/**
 ** Interactive
 **/

class Interactive {
    constructor(vars, func) {
        this.func = func;
        this.vars = vars;
    }

    create(redraw) {
        let vals = Object.fromEntries(Object.entries(this.vars).map(
            ([k, v]) => [k, v.value]
        ));
        let elem = this.func(vals);
        if (redraw != null) {
            redraw.innerHTML = renderElem(elem);
        }
        return elem;
    }

    createAnchors(redraw) { // tag is where to append anc, redraw is where to redraw
        let i = this;
        let ancs = Object.entries(this.vars).map(([v, k]) => {
            try {
                return k.anchor(v, i, redraw);
            } catch {
                return null;
            }
        });
        return ancs;
    }
}

class Variable {
    constructor(init, args) {
        args = args ?? {};
        this.value = init;
        this.attr = Object.fromEntries(
            Object.entries(args).filter(([k, v]) => v != null)
        );
    }

    updateVal(val, ctx, redraw) {
        this.value = val;
        ctx.create(redraw);
    }
}

function updateSliderValue(slider) {
    let pos = (slider.value - slider.min) / (slider.max - slider.min);
    let lab = slider.parentNode.querySelector('.slider_thumb');
    lab.innerHTML = slider.value;
    lab.style.left = `${100*pos}%`;
}

class Slider extends Variable {
    constructor(init, args) {
        let {min, max, step, ...attr} = args ?? {};
        min = min ?? 0;
        max = max ?? 100;
        step = step ?? 1;

        let attr1 = {min, max, step, ...attr};
        super(init, attr1);
    }

    // ctx is an interactive context
    anchor(name, ctx, redraw) {
        let {min, max, step} = this.attr;

        let cont = document.createElement('div');
        cont.className = 'var_cont slider_cont';

        let slider = document.createElement('div');
        slider.className = 'slider';

        let title = document.createElement('div');
        title.className = 'var_title';
        title.innerHTML = this.attr.title ?? `Slider: ${name}`;

        let min_lim = document.createElement('div');
        min_lim.innerHTML = min;
        min_lim.className = 'min_lim';
        let max_lim = document.createElement('div');
        max_lim.innerHTML = max;
        max_lim.className = 'max_lim';

        let input = document.createElement('input');
        input.type = 'range';
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = this.value;
        input.className = 'slider_input'; // set the CSS class

        let outer = document.createElement('div');
        outer.className = 'slider_outer';
        let track = document.createElement('div');
        track.className = 'slider_track';
        let thumb = document.createElement('div');
        thumb.className = 'slider_thumb';

        outer.append(track, thumb);
        slider.append(min_lim, input, max_lim, outer);
        cont.append(title, slider); // slider in cont in targ!

        updateSliderValue(input);
        let v = this;
        input.addEventListener('input', function() {
            updateSliderValue(this);
            let val = Number(this.value);
            v.updateVal(val, ctx, redraw);
        }, false);

        return cont;
    }
}

class Toggle extends Variable {
    constructor(init, args) {
        init = init == undefined ? true : init;
        args = args ?? {};
        super(init, args);
    }

    // ctx is an interactive context
    anchor(name, ctx, redraw) {
        let cont = document.createElement('div');
        cont.className = 'var_cont toggle_cont';

        let toggle = document.createElement('label');
        toggle.className = 'toggle';

        let title = document.createElement('div');
        title.className = 'var_title';
        title.innerHTML = this.attr.title ?? `Toggle: ${name}`;

        let input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = this.value;

        toggle.append(input);
        cont.append(title, toggle); // slider in cont in targ!

        let v = this;
        input.addEventListener('input', function() {
            v.updateVal(this.checked, ctx, redraw);
        }, false);

        return cont;
    }
}

class List extends Variable {
    constructor(init, args) {
        args = args ?? {};
        args.choices = args.choices ?? {};

        if (args.choices instanceof Array) {
            args.choices = args.choices.reduce((a, v) => ({ ...a, [v]: v}), {});
        }

        super(init, args);
    }

    // ctx is an interactive context
    anchor(name, ctx, redraw) {
        let select = document.createElement('select');
        Object.entries(this.attr.choices).forEach(([label, value]) => {
            let o = document.createElement('option');
            o.setAttribute('value', value);
            o.innerHTML = label;
            select.append(o);
        });

        let cont = document.createElement('div');
        cont.className = 'var_cont list-cont';

        let title = document.createElement('div');
        title.className = 'var_title';
        title.innerHTML = this.attr.title ?? `List: ${name}`;

        let list = document.createElement('div');
        list.className = 'list-outer';
        list.append(select);
        cont.append(title, list);

        select.value = this.value;
        this.updateVal(select.value, ctx, redraw);

        let v = this;
        select.addEventListener('input', function() {
            v.updateVal(this.value, ctx, redraw);
        });

        return cont;
    }
}

/**
 ** Animation
 **/

class Transition {
    constructor(args) {
        let {tlim} = args ?? {};
        this.tlim = tlim ?? [null, null];
    }

    frac(t, tlimf) {
        let [t0, t1] = this.tlim;
        let [t0f, t1f] = tlimf;
        t0 = t0 ?? t0f;
        t1 = t1 ?? t1f;
        let f = (t - t0) / (t1 - t0);
        return max(0, min(1, f));
    }
}

class Continuous extends Transition {
    constructor(lim, args) {
        super(args);
        this.lim = lim;
    }

    value(t, tlimf) {
        let f = this.frac(t, tlimf);
        let [lo, hi] = this.lim;
        return lo + (hi - lo) * f;
    }
}

class Discrete extends Transition {
    constructor(vals, args) {
        super(args);
        this.vals = vals;
    }

    value(t, tlimf) {
        let f = this.frac(t, tlimf);
        let i0 = floor(f * this.vals.length);
        let i = min(i0, this.vals.length - 1);
        return this.vals[i];
    }
}

class Animation {
    constructor(vars, func, args) {
        let {fps, loop, tlim} = args ?? {};
        this.func = func;
        this.vars = vars;

        // options
        this.fps = fps ?? 30;
        this.loop = loop ?? false;
        this.tlim = tlim ?? [0, 1];

        // total frames
        let [t0f, t1f] = this.tlim;
        this.n = ceil(this.fps * (t1f - t0f));
        this.time = linspace(t0f, t1f, this.n);

        // animation state
        this.pos = 0; // current frame
        this.playing = false;
        this.frameList = null;
    }

    create() {
        let [t0f, t1f] = this.tlim;
        let vals = Object.fromEntries(Object.entries(this.vars).map(
            ([k, v]) => [k, v.value(t0f, this.tlim)]
        ));
        return this.func(vals);
    }

    createAnchors(redraw) {
        let i = this;

        let cont = document.createElement('div');
        cont.className = 'var_cont animate_cont';

        let input = document.createElement('button');
        input.textContent = 'Play';
        input.className = 'animateplay__input';

        cont.append(input);
        input.addEventListener('click', function() {
            i.playpause(redraw, input);
        }, false);

        return [cont];
    }

    createFrameList() {
        return this.time.map(t => {
            let vals = Object.fromEntries(Object.entries(this.vars).map(
                ([k, v]) => [k, v.value(t, this.tlim)]
            ));
            let elem = this.func(vals);
            return renderElem(elem);
        });
    }

    animate(redraw, input) {
        if (this.frameList == null) {
            this.frameList = this.createFrameList();
        }
        this.metronome = setInterval(() => {
            if (this.pos < this.frameList.length) {
                redraw.innerHTML = this.frameList[this.pos];
                this.pos += 1;
            } else {
                this.pos = 0;
                if (!this.loop) {
                    clearInterval(this.metronome);
                    this.playing = false;
                    input.textContent = 'Play';
                }
            }
        }, 1000/this.fps);
    }

    playpause(redraw, input) {
        if (this.playing) {
            clearInterval(this.metronome);
            input.textContent = 'Play';
            this.playing = false;
        } else {
            this.animate(redraw, input);
            input.textContent = 'Pause';
            this.playing = true;
        }
    }
}

/**
 ** scripting
 **/

let Gum = [
    Context, Element, Container, Group, SVG, Frame, Stack, VStack, HStack, Grid, Place, Rotate, Anchor, Attach, Points, Spacer, Ray, Line, HLine, VLine, Rect, Square, Ellipse, Circle, Dot, Polyline, Polygon, Triangle, Path, Arrowhead, Text, Emoji, Tex, Node, FlexNode, TitleFrame, MoveTo, LineTo, VerticalTo, VerticalDel, HorizontalTo, HorizontalDel, Bezier2, Bezier3, ArcTo, ArcDel, Bezier2Path, Bezier2Line, Bezier3Line, Arrow, Field, SymField, Edge, Network, ClosePath, SymPath, SymFill, SymPoly, SymPoints, PointPath, PointFill, Bar, VMultiBar, HMultiBar, Bars, VBars, HBars, Scale, VScale, HScale, Labels, VLabels, HLabels, Axis, HAxis, VAxis, XLabel, YLabel, Mesh, Graph, Plot, BarPlot, Legend, Note, Interactive, Variable, Slider, Toggle, List, Animation, Continuous, Discrete, range, linspace, enumerate, repeat, meshgrid, lingrid, hex2rgb, rgb2hex, rgb2hsl, interpolateVectors, interpolateHex, interpolateVectorsPallet, gzip, zip, reshape, split, concat, pos_rect, pad_rect, rad_rect, sum, prod, exp, log, sin, cos, min, max, abs, pow, sqrt, floor, ceil, round, atan, norm, add, mul, clamp, mask, rescale, sigmoid, logit, smoothstep,pi, phi, r2d, d2r, rounder, make_ticklabel, aspect_invariant, random, uniform, normal, cumsum, blue, red, green, Filter, Effect, DropShadow
];

// detect object types
function detect(g) {
    if ('prototype' in g) {
        let [t, ...x] = g.toString().split(' ');
        return t;
    } else {
        return 'value';
    }
}

// make functional interface
function mapper(objs) {
    let nams = objs.map(g => g.name);
    let mako = objs.map(g => {
        let t = detect(g);
        if (t == 'class') {
            let func = function(...args) {
                return new g(...args);
            };
            func.class = g;
            return func;
        } else if (t == 'function') {
            return function(...args) {
                return g(...args);
            }
        } else {
            return g;
        }
    });
    return [nams, mako];
}

// main parser entry
let [gums, mako] = mapper(Gum);
function parseGum(src) {
    let expr = new Function(gums, src);
    return expr(...mako);
}

function renderElem(elem, args) {
    if (is_element(elem)) {
        elem = (elem instanceof SVG) ? elem : new SVG(elem, args);
        return elem.svg();
    } else {
        return String(elem);
    }
}

function renderGum(src, args) {
    let elem = parseGum(src);
    return renderElem(elem, args);
}

function renderGumSafe(src, args) {
    // parse gum into element
    let elem;
    try {
        elem = parseGum(src);
    } catch (err) {
        throw new Error(`parse error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
    }

    // check for null
    if (elem == null) {
        throw new Error('no data. does your code return an element?');
    }

    // render element to svg
    let svg;
    try {
        svg = renderElem(elem, args);
    } catch (err) {
        throw new Error(`render error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
    }

    // success
    return svg;
}

function parseHTML(str) {
    let tmp = document.implementation.createHTMLDocument('');
    tmp.body.innerHTML = str;
    return tmp.body.children[0];
}

// image injection for static viewing
function injectImage(img) {
    let src = img.getAttribute('src');
    let request = new XMLHttpRequest();
    request.open('GET', src, true);
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            let cls = img.classList;
            let alt = img.getAttribute('alt');
            let svg = parseHTML(this.response);
            svg.classList = cls;
            svg.setAttribute('alt', alt);
            img.parentNode.replaceChild(svg, img);
        }
    }
    request.send();
}

function injectScript(scr) {
    let src = scr.innerText;
    let width = scr.getAttribute('width');
    let size = string_to_int(scr.getAttribute('size'));
    let svg = renderGum(src, {size: size});
    let elem = parseHTML(svg);
    if (width != null) {
        elem.style.width = width;
        elem.style.display = 'block';
        elem.style.margin = 'auto';
    }
    scr.replaceWith(elem);
}

function injectScripts(elem) {
    elem = elem ?? document;
    elem.querySelectorAll('script').forEach(scr => {
        if (scr.getAttribute('type') == 'text/gum') {
            injectScript(scr);
        }
    })
}

function injectImages(elem) {
    elem = elem ?? document;
    elem.querySelectorAll('img').forEach(img => {
        if (img.classList.contains('gum')) {
            injectImage(img);
        }
    });
}

/**
 ** exports
 **/

export {
    Gum, Context, Element, Container, Group, SVG, Frame, Stack, VStack, HStack, Grid, Place, Rotate, Anchor, Attach, Points, Spacer, Ray, Line, HLine, VLine, Rect, Square, Ellipse, Circle, Dot, Polyline, Polygon, Triangle, Path, Arrowhead, Text, Emoji, Tex, Node, FlexNode, TitleFrame, MoveTo, LineTo, VerticalTo, VerticalDel, HorizontalTo, HorizontalDel, Bezier2, Bezier3, ArcTo, ArcDel, Bezier2Path, Bezier2Line, Bezier3Line, Arrow, Field, SymField, Edge, Network, ClosePath, SymPath, SymFill, SymPoly, SymPoints, PointPath, PointFill, Bar, VMultiBar, HMultiBar, Bars, VBars, HBars, Scale, VScale, HScale, Labels, VLabels, HLabels, Axis, HAxis, VAxis, Mesh, Graph, Plot, BarPlot, Legend, Note, Interactive, Variable, Slider, Toggle, List, Animation, Continuous, Discrete, gzip, zip, reshape, split, concat, pos_rect, pad_rect, rad_rect, demangle, props_repr, range, linspace, enumerate, repeat, meshgrid, lingrid, hex2rgb, rgb2hex, rgb2hsl, interpolateVectors, interpolateHex, interpolateVectorsPallet, exp, log, sin, cos, min, max, abs, pow, sqrt, floor, ceil, round, atan, norm, add, mul, clamp, mask, rescale, sigmoid, logit, smoothstep, e, pi, phi, r2d, d2r, rounder, make_ticklabel, mapper, parseGum, renderElem, renderGum, renderGumSafe, parseHTML, injectImage, injectImages, injectScripts, aspect_invariant, random, uniform, normal, cumsum, Filter, Effect, DropShadow, sum, prod, normalize, is_string, is_array, is_element
};
