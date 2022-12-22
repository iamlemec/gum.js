// gum.js

import render from 'katex'

/**
 ** defaults
 **/

// namespace
let ns_svg = 'http://www.w3.org/2000/svg';

// sizing
let size_base = 500;
let rect_base = [0, 0, size_base, size_base];
let coord_base = [0, 0, 1, 1];
let prec_base = 13;

// fonts
let font_family_base = 'IBMPlexSans';
let font_weight_base = 100;
let font_size_base = 12;
let font_size_latex = 14;

// plot defaults
let num_ticks_base = 5;
let tick_size_base = 0.03;
let tick_label_size_base = 1.5;
let label_size_base = 0.06;
let label_offset_base = 0.15;
let title_size_base = 0.1;
let title_offset_base = 0.1;
let grid_color_base = '#CCC';
let limit_base = [0, 1];
let N_base = 100;

// default styling
let svg_props_base = {
    stroke: 'black',
    fill: 'none',
    font_family: font_family_base,
    font_weight: font_weight_base,
};

// text sizer
let textSizer = null;
function setTextSizer(sizer) {
    textSizer = sizer;
}

// use canvas sizer
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

function sideRenderTextSizer(html, args) {
    let {family, size, actual} = args ?? {};
    family = family ?? font_family_base;
    size = size ?? font_size_base;
    actual = actual ?? false;

    let textDiv = document.createElement('div');
    textDiv.id = 'sizer';
    document.body.appendChild(textDiv);

    textDiv.style.fontSize = `${size}px`;
    textDiv.style.position = 'absolute';
    textDiv.style.top = '0';
    textDiv.style.left = '0';
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

function sum(arr) {
    arr = arr.filter(v => v != null);
    return arr.reduce((a, b) => a + b, 0);
}

function all(arr) {
    return arr.reduce((a, b) => a && b);
}

function any(arr) {
    return arr.reduce((a, b) => a || b);
}

function cumsum(arr, first) {
    let sum = 0;
    let ret = arr.map(x => sum += x);
    return (first ?? true) ? [0, ...ret] : ret;
}

// fill in missing values to ensure: sum(vals) == target
function distribute_extra(vals, target) {
    target = target ?? 1;
    let nmiss = vals.filter(v => v == null).length;
    let total = sum(vals);
    let fill = (nmiss > 0) ? (target-total)/nmiss : 0;
    return vals.map(v => v ?? fill);
}

function normalize(vals, target) {
    target = target ?? 1;
    let norm = target/sum(vals);
    return vals.map(v => norm*v);
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

function ensure_vector(x, n) {
    if (typeof(x) == 'number') {
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

// functions
let exp = Math.exp;
let log = Math.log;
let sin = Math.sin;
let cos = Math.cos;
let tan = Math.tan;
let abs = Math.abs;
let pow = Math.pow;
let sqrt = Math.sqrt;
let floor = Math.floor;
let ceil = Math.ceil;
let round = Math.round;

// null on empty
function min(...vals) {
    vals = vals.filter(v => v != null);
    return (vals.length > 0) ? Math.min(...vals) : null;
}
function max(...vals) {
    vals = vals.filter(v => v != null);
    return (vals.length > 0) ? Math.max(...vals) : null;
}

// constants
let pi = new NamedNumber('pi', Math.PI);
let phi = new NamedNumber('phi', (1+sqrt(5))/2);

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
    let [xa, ya, xb, yb] = zip(...rects);
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

function aspect_invariant(value, aspect, alpha) {
    aspect = aspect ?? 1;
    alpha = alpha ?? 0.5;

    let wfact = pow(aspect, alpha);
    let hfact = pow(aspect, 1-alpha);

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

function rotate_aspect_degrees(aspect, degree) {
    let rotate = degree_mod(degree, -90, 90);
    let theta = (pi/180)*abs(rotate);
    return rotate_aspect_radians(aspect, theta);
}

function rotate_aspect_radians(aspect, theta) {
    return (aspect*cos(theta)+sin(theta))/(aspect*sin(theta)+cos(theta));
}

class Context {
    constructor(prect, args) {
        let {coord, rrect, prec} = args ?? {};
        this.prect = prect;
        this.rrect = rrect;
        this.coord = coord;
        this.prec = prec;
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
    map(rect, args) {
        let {aspect, rotate, shrink, coord} = args ?? {};
        rotate = rotate ?? 0;
        shrink = shrink ?? false;

        // remap rotation angle
        let degrees = degree_mod(rotate, -90, 90); // map to [-90, 90]
        let theta0 = abs(degrees)*(pi/180); // in radians
        let theta = shrink ? theta0 : 0; // account for rotate?

        // get true pixel rect
        let [px1, py1, px2, py2] = this.coord_to_pixel_rect(rect);
        let [pw0, ph0] = [px2 - px1, py2 - py1];

        // embedded rectangle aspect
        let asp0 = pw0/ph0; // pixel rect
        let rasp = aspect ?? asp0; // mimic outer if null
        let asp1 = rotate_aspect_radians(rasp, theta);

        // shink down if aspect mismatch
        let pw1, ph1;
        if (asp0 >= asp1) { // too tall
            ph1 = ph0/(rasp*sin(theta)+cos(theta));
            pw1 = rasp*ph1;
        } else if (asp0 < asp1) { // too wide
            pw1 = pw0/(cos(theta)+sin(theta)/rasp);
            ph1 = pw1/rasp;
        }

        // get unrotated pixel rect
        let [cx, cy] = [0.5*(px1+px2), 0.5*(py1+py2)];
        let prect = [cx-0.5*pw1, cy-0.5*ph1, cx+0.5*pw1, cy+0.5*ph1];

        // get rotate bounding rect
        let rw = pw1*(cos(theta)+sin(theta)/rasp);
        let rh = ph1*(rasp*sin(theta)+cos(theta));
        let rrect = shrink ? [cx-0.5*rw, cy-0.5*rh, cx+0.5*rw, cy+0.5*rh] : prect;

        return new Context(prect, {coord, rrect, prec: this.prec});
    }
}

class Element {
    constructor(tag, unary, args) {
        let {aspect, rotate, shrink, ...attr} = args ?? {};
        this.tag = tag;
        this.unary = unary;
        this.aspect = aspect ?? null;
        this.rotate = rotate ?? null;
        this.shrink = shrink ?? false;

        // store attributes
        this.attr = Object.fromEntries(
            Object.entries(attr).filter(([k, v]) => v != null)
        );
    }

    props(ctx) {
        return this.attr;
    }

    // just rotation right now
    transform(ctx) {
        if (this.rotate != null) {
            let [px1, py1, px2, py2] = ctx.prect;
            let cent = [0.5*(px1+px2), 0.5*(py1+py2)];
            let [sx, sy] = cent.map(z => rounder(z, this.prec));
            return `rotate(${this.rotate} ${sx} ${sy})`;
        } else {
            return null;
        }
    }

    inner(ctx) {
        return '';
    }

    svg(ctx) {
        ctx = ctx ?? new Context(rect_base);

        let trans = this.transform(ctx);
        let pvals = {transform: trans, ...this.props(ctx)};
        let props = props_repr(pvals, ctx.prec);
        let pre = props.length > 0 ? ' ' : '';

        if (this.unary) {
            return `<${this.tag}${pre}${props} />`;
        } else {
            return `<${this.tag}${pre}${props}>${this.inner(ctx)}</${this.tag}>`;
        }
    }
}

// non-unary | variable-aspect | graphable
class Container extends Element {
    constructor(children, args) {
        let {tag, aspect, coord, clip, ...attr} = args ?? {};
        tag = tag ?? 'g';
        clip = clip ?? true;

        // handle singleton
        if (children instanceof Element) {
            children = [children];
        }

        // handle default positioning
        children = children
            .map(c => c instanceof Element ? [c, null] : c)
            .map(([c, r]) => [c, r ?? coord_base]);

        // get data limits
        let xlim, ylim;
        if (children.length > 0) {
            let [xmins, ymins, xmaxs, ymaxs] = zip(...children.map(([c, r]) => r));
            let [xall, yall] = [[...xmins, ...xmaxs], [...ymins, ...ymaxs]];
            xlim = [min(...xall), max(...xall)];
            ylim = [min(...yall), max(...yall)];
        }

        // inherit aspect of clipped contents
        if (aspect == null && clip) {
            let ctx = new Context(coord_base);
            let rects = children
                .filter(([c, r]) => c.aspect != null)
                .map(([c, r]) => ctx.map(r, {aspect: c.aspect, rotate: c.rotate, shrink: c.shrink}).rrect);
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
        this.xlim = xlim;
        this.ylim = ylim;
    }

    inner(ctx) {
        // empty container
        if (this.children.length == 0) {
            return '\n';
        }

        // map to new contexts and render
        let inside = this.children
            .map(([c, r]) => c.svg(
                ctx.map(r, {aspect: c.aspect, rotate: c.rotate, shrink: c.shrink, coord: this.coord}))
            )
            .filter(s => s.length > 0)
            .join('\n');

        // return padded
        return `\n${inside}\n`;
    }
}

class SVG extends Container {
    constructor(children, args) {
        let {clip, size, prec, ...attr} = args ?? {};
        clip = clip ?? true;
        size = size ?? size_base;
        prec = prec ?? prec_base;

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

    svg() {
        let rect = [0, 0, ...this.size];
        let ctx = new Context(rect ,{prec: this.prec});
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
        let {padding, margin, border, aspect, adjust, flex, shape, ...attr0} = args ?? {};
        let [border_attr, attr] = prefix_split(['border'], attr0);
        border = border ?? 0;
        padding = padding ?? 0;
        margin = margin ?? 0;
        adjust = adjust ?? true;
        flex = flex ?? false;
        shape = shape ?? (a => new Rect(a));

        // convenience boxing
        padding = pad_rect(padding);
        margin = pad_rect(margin);

        // aspect adjusted padding/margin
        if (adjust && child.aspect != null) {
            padding = aspect_invariant(padding, 1/child.aspect);
            margin = aspect_invariant(margin, 1/child.aspect);
        }

        // get box sizes
        let iasp = aspect ?? child.aspect;
        let [crect, brect, basp, tasp] = map_padmar(padding, margin, iasp);
        aspect = flex ? null : (aspect ?? tasp);

        // make border box
        let rargs = {stroke_width: border, ...border_attr};
        let rect = shape(rargs);

        // gather children
        let children = [[child, crect]];
        if (border != 0) {
            children.unshift([rect, brect]);
        }

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

function align_frac(align, direc) {
    if (is_scalar(align)) {
        return align;
    } else if ((direc == 'v' && align == 'left') || (direc == 'h' && align == 'top')) {
        return 0;
    } else if (align == 'center' || align == 'middle') {
        return 0.5;
    } else if ((direc == 'v' && align == 'right') || (direc == 'h' && align == 'bottom')) {
        return 1;
    } else{
        throw new Error(`Unrecognized alignment specification: ${align}`);
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
            let afrac = align_frac(align, direc);
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

// non-unary | variable-aspect | graphable
class Place extends Container {
    constructor(child, pos, rad, args) {
        let {...attr} = args ?? {};

        if (is_scalar(rad)) {
            rad = aspect_invariant(rad, child.aspect);
        }

        let [[x, y], [rx, ry]] = [pos, rad];
        let rect = [x-rx, y-ry, x+rx, y+ry];

        let attr1 = {clip: false, ...attr};
        super([[child, rect]], attr1);
    }
}

// non-unary | variable-aspect | graphable
class Scatter extends Container {
    constructor(points, args) {
        let {shape, radius, xlim, ylim, ...attr} = args ?? {};
        shape = shape ?? black_dot();
        radius = radius ?? 0.05;

        // handle different forms
        points = points.map(p => is_element(p[0]) ? p : [shape, p]);

        // pass to container
        let children = points.map(([s, p]) => [s, rad_rect(p, radius)]);
        let attr1 = {clip: false, ...attr};
        super(children, attr1);
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
let spacer = new Spacer();

// unary | null-aspect | graphable
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

// unary | null-aspect | graphable
class UnitLine extends Line {
    constructor(direc, pos, args) {
        let {lim, ...attr} = args ?? {};
        let [lo, hi] = lim ?? limit_base;
        direc = get_orient(direc);
        let [p1, p2] = (direc == 'v') ? [[pos, lo], [pos, hi]] : [[lo, pos], [hi, pos]];
        super(p1, p2, attr);
    }
}

// unary | null-aspect | graphable
class VLine extends UnitLine {
    constructor(pos, args) {
        super('v', pos, args);
    }
}

// unary | null-aspect | graphable
class HLine extends UnitLine {
    constructor(pos, args) {
        super('h', pos, args);
    }
}

// unary | null-aspect | graphable
class Rect extends Element {
    constructor(args) {
        let {p1, p2, radius, ...attr} = args ?? {};
        p1 = p1 ?? [0, 0];
        p2 = p2 ?? [1, 1];

        super('rect', true, attr);
        this.p1 = p1;
        this.p2 = p2;
        this.radius = radius;
        [this.xlim, this.ylim] = zip(p1, p2);
    }

    props(ctx) {
        let [x1, y1] = ctx.coord_to_pixel(this.p1);
        let [x2, y2] = ctx.coord_to_pixel(this.p2);

        // orient increasing
        let [x, y] = [x1, y1];
        let [w, h] = [x2 - x1, y2 - y1];
        if (w < 0) { x += w; w *= -1; }
        if (h < 0) { y += h; h *= -1; }

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

        let base = {x, y, width: w, height: h, rx, ry};
        return {...base, ...this.attr};
    }
}

// unary | unit-aspect | graphable
class Square extends Rect {
    constructor(args) {
        let {p, s, ...attr} = args ?? {};
        p = p ?? [0, 0];
        s = s ?? 1;

        let p2 = p.map(z => z + s);
        let base = {p1: p, p2, aspect: 1};
        super({...base, ...attr});
    }
}

// unary | null-aspect | graphable
class Ellipse extends Element {
    constructor(args) {
        let {c, r, ...attr} = args ?? {};
        c = c ?? [0.5, 0.5];
        r = r ?? [0.5, 0.5];

        super('ellipse', true, attr);
        this.c = c;
        this.r = r;

        let [cx, cy] = c;
        let [rx, ry] = r;
        this.xlim = [cx - rx, cx + rx];
        this.ylim = [cy - ry, cy + ry];
    }

    props(ctx) {
        let [cx, cy] = ctx.coord_to_pixel(this.c);
        let [rx, ry] = ctx.coord_to_pixel_size(this.r);
        let base = {cx, cy, rx, ry};
        return {...base, ...this.attr};
    }
}

// unary | unit-aspect | graphable
class Circle extends Ellipse {
    constructor(args) {
        let {c, r, ...attr} = args ?? {};
        c = c ?? [0.5, 0.5];
        r = r ?? 0.5;

        let r2 = [r, r];
        let base = {c, r: r2, aspect: 1};
        super({...base, ...attr});
    }
}

let black_dot = () => new Circle({fill: 'black'});

// unary | aspect | non-graphable
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
        let [x1, y1] = ctx.coord_to_pixel(this.p1);
        let [x2, y2] = ctx.coord_to_pixel(this.p2);
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

function arg(s, d, ctx) {
    if (s == 'xy') {
        let [x, y] = ctx.coord_to_pixel(d);
        return `${rounder(x, ctx.prec)},${rounder(y, ctx.prec)}`;
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

class LineTo extends Command {
    constructor(p) {
        super('L', ['xy'], [p]);
        this.point = p;
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

class Arc extends Command {
    constructor(p, r, args) {
        let {angle, large, sweep} = args ?? {};
        angle = angle ?? 0;
        large = large ?? 1;
        sweep = sweep ?? 1;
        super('A', ['xy', '', '', '', 'xy'], [r, angle, large, sweep, p]);
    }
}

class Close extends Command {
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

        let red = new Circle({stroke: 'red', fill: 'red'});
        let scatter1 = new Scatter(nodes, {radius: 0.01});
        let scatter2 = new Scatter(arrows, {radius: 0.007, shape: red});
        let lines = zip(nodes.slice(0, -1), arrows).map(([n, a]) =>
            new Line(n, a, {stroke: 'blue', stroke_dasharray: 2, opacity: 0.7})
        );

        super([bezo, ...lines, scatter1, scatter2]);
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
 ** advanced shapes
 **/

function radial_move(point, theta, size) {
    size = ensure_vector(size ?? 1, 2);
    let rads = (pi/180)*theta;
    let vec = [cos(rads), sin(rads)];
    return zip(point, size, vec).map(([p, s, v]) => p + s*v);
}

// unary | aspect | graphable
class Arrowhead extends Polygon {
    constructor(p, args) {
        let {size, rot, arc, ...attr} = args ?? {};
        size = size ?? 0.02;
        arc = arc ?? 50;
        rot = (rot ?? 0) - 180;

        let points = [
            p, radial_move(p, rot-arc/2, size), radial_move(p, rot+arc/2, size)
        ];

        let attr1 = {fill: 'black', ...attr};
        super(points, attr1);
        this.points0 = points;
        this.stroke = attr.stroke ?? 1;
        this.rotate = rot;
    }

    // this is hacky! shifts by stroke-width so there's no overlap on target
    props(ctx) {
        let size = rect_dims(ctx.prect).map(x => 0.5*this.stroke/x);
        let poff = radial_move(this.points0[0], this.rotate, size);
        this.points = [poff, ...this.points0.slice(1)];
        return super.props(ctx);
    }
}

/**
 ** text elements
 **/

class Text extends Element {
    constructor(text, args) {
        let {
            family, weight, size, actual, calc_family, calc_weight, calc_size, hshift, vshift, ...attr
        } = args ?? {};
        size = size ?? font_size_base;
        actual = actual ?? false;
        hshift = hshift ?? 0.0;
        vshift = vshift ?? -0.13;

        // select calculated fonts
        calc_family = calc_family ?? family ?? font_family_base;
        calc_weight = calc_weight ?? weight ?? font_weight_base;
        calc_size = calc_size ?? size;

        // compute text box
        let fargs = {family: calc_family, weight: calc_weight, calc_size: size, actual};
        let [xoff, yoff, width, height] = textSizer(text, fargs);
        [xoff, yoff, size] = [xoff/height, yoff/height, size/height];
        let aspect = width/height;

        // pass to element
        let attr1 = {aspect: aspect, font_family: family, font_weight: weight, fill: 'black', ...attr};
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

class Tex extends Element {
    constructor(text, args) {
        let {family, size, actual, calc_family, vshift, xover, yover, rotate, ...attr} = args ?? {};
        size = size ?? font_size_latex;
        rotate = (rotate ?? 0) % 360;
        actual = actual ?? true;
        vshift = vshift ?? 0;
        yover = yover ?? 1.0;
        xover = xover ?? 0.5;

        // render with katex
        let katex = render.renderToString(text, {output: 'html', trust: true});

        // compute text box
        let fargs = {size: size, actual: actual};
        let [xoff, yoff, width0, height0] = sideRenderTextSizer(katex, fargs);
        [xoff, yoff, size] = [xoff/width0, yoff/height0, size/height0];
        let aspect0 = width0/height0;

        // account for rotation
        let theta = (pi/180)*rotate;
        let width = abs(cos(theta))*width0 + abs(sin(theta))*height0;
        let height = abs(sin(theta))*width0 + abs(cos(theta))*height0;
        let [wfact, hfact] = [width0/width, height0/height];

        // pass to element
        let aspect = width/height;
        let attr1 = {aspect: aspect, ...attr};
        super('foreignObject', false, attr1);

        // store metrics
        this.xoff = xoff;
        this.yoff = yoff + vshift;
        this.size = size;
        this.xover = xover;
        this.yover = yover;
        this.wfact = wfact;
        this.hfact = hfact;
        this.rotate = rotate;
        this.katex = katex;
    }

    props(ctx) {
        let [x1, y1, x2, y2] = ctx.prect;
        let [w, h] = [x2 - x1, y2 - y1];

        let w0 = this.wfact*w;
        let h0 = this.hfact*h;

        let w1 = w0;
        let h1 = this.size*h0;
        let fs = this.size*h0;

        let w2 = (1+this.xover)*w1;
        let h2 = (1+this.yover)*h1;

        // get unrotated origin
        let cx = x1 + 0.5*w;
        let cy = y1 + 0.5*h;
        let x = cx - 0.5*w0 - this.xoff*w1;
        let y = cy - 0.5*h0 + this.yoff*h1;

        let rprop = (this.rotate != 0) ? {transform: `rotate(${this.rotate} ${cx} ${cy})`} : {};
        let base = {
            x: x, y: y, width: w2, height: h2, font_size: `${fs}px`, ...rprop
        };
        return {...base, ...this.attr};
    }

    inner(ctx) {
        return this.katex;
    }
}

class Node extends Frame {
    constructor(text, args) {
        let {padding, border, spacing, align, ...attr0} = args ?? {};
        let [text_attr, attr] = prefix_split(['text'], attr0);
        padding = padding ?? 0.1;
        spacing = spacing ?? 0.02;
        border = border ?? 1;

        // generate core elements
        let child;
        if (is_string(text)) {
            child = new Text(text, text_attr);
        } else if (is_array(text)) {
            let lines = text.map(s => new Text(s, text_attr));
            child = new VStack(lines, {expand: false, align, spacing});
        } else {
            child = text;
        }

        // pass to container
        let attr1 = {padding, border, ...attr};
        super(child, attr1);
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

let arrow_dir = {'n': 90, 's': -90, 'e': 180, 'w': 0};
class Edge extends Container {
    constructor(pd1, pd2, args) {
        let {curve, arrow, debug, ...attr0} = args ?? {};
        let [arrow_attr, attr] = prefix_split(['arrow'], attr0);
        curve = curve ?? 0.3;
        arrow = arrow ?? 0;
        debug = debug ?? false;

        let [[p1, d1], [p2, d2]] = [pd1, pd2];
        let [[x1, y1], [x2, y2]] = [p1, p2];
        let [dx, dy] = [x2 - x1, y2 - y1];

        [d1, d2] = [norm_direc(d1), norm_direc(d2)];
        let vert1 = d1 == 'n' || d1 == 's';
        let vert2 = d2 == 'n' || d2 == 's';
        let wide = abs(dx) > abs(dy);

        let ahead = null;
        if (arrow > 0) {
            let rot = arrow_dir[d2];
            let arrow_attr1 = {size: arrow, rot, ...arrow_attr};
            ahead = new Arrowhead(p2, arrow_attr1);
        }

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

        let curve1, curve2;
        if (vert1 == vert2) {
            [curve1, curve2] = [curve, curve];
        } else {
            [curve1, curve2] = [1.0, curve];
        }

        let px1;
        if (vert1) {
            px1 = [x1, y1 + curve1*dy];
        } else {
            px1 = [x1 + curve1*dx, y1];
        }

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

        let BezClass = debug ? Bezier2PathDebug : Bezier2Path;
        let line = new BezClass(p1, [[pc, px1], [p2, px2]], attr);
        let children = [line];
        if (ahead != null) {
            children.push(ahead);
        }

        super(children);
    }
}

class Network extends Container {
    constructor(nodes, edges, args) {
        let {radius, arrow, debug, ...attr0} = args ?? {};
        let [node_attr, edge_attr, arrow_attr, attr] = prefix_split(['node', 'edge', 'arrow'], attr0);
        edge_attr = {arrow, debug, ...edge_attr, ...prefix_add('arrow', arrow_attr)};
        radius = radius ?? 0.1;

        let make_node = b => new Node(b, {flex: true, ...node_attr});
        let bmap = Object.fromEntries(nodes.map(([n, p, r]) => {
            let [s, b] = is_string(n) ? [n, n] : n;
            b = (is_string(b) || is_array(b)) ? make_node(b) : b;
            return [s, new Place(b, p, r ?? radius)];
        }));
        let boxes = Object.values(bmap);
        let cont1 = new Container(boxes);

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
        let cont2 = new Container(lines);

        let [xmins, xmaxs] = zip(...boxes.map(b => b.xlim));
        let [ymins, ymaxs] = zip(...boxes.map(b => b.ylim));

        super([cont1, cont2], attr);
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
    let {fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr} = args ?? {};
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
        xvals = linspace(...xlim, N);
        yvals = xvals.map(fy);
    } else if (fx != null) {
        yvals = linspace(...ylim, N);
        xvals = yvals.map(fx);
    }

    return [tvals, xvals, yvals];
}

class SymPath extends Polyline {
    constructor(args) {
        let {fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr} = args ?? {};

        // compute point values
        [tvals, xvals, yvals] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N
        });
        let points = zip(xvals, yvals);

        // pass to element
        super(points, attr);
    }
}

class SymFill extends Polygon {
    constructor(args) {
        let {fx1, fy1, fx2, fy2, xlim, ylim, N, ...attr} = args ?? {};

        // compute point values
        let [tvals1, xvals1, yvals1] = sympath({fx: fx1, fy: fy1, xlim, ylim, N});
        let [tvals2, xvals2, yvals2] = sympath({fx: fx2, fy: fy2, xlim, ylim, N});
        let points = [...zip(xvals1, yvals1), ...zip(xvals2, yvals2).reverse()];

        // pass to element
        super(points, attr);
    }
}

class SymPoly extends Polygon {
    constructor(args) {
        let {fx, fy, xlim, ylim, tlim, N, ...attr} = args ?? {};

        // compute point values
        let [tvals, xvals, yvals] = sympath({fx, fy, xlim, ylim, tlim, N});
        let points = zip(xvals, yvals);

        // pass to element
        super(points, attr);
    }
}

class SymPoints extends Container {
    constructor(args) {
        let {fx, fy, fs, fr, radius, shape, xlim, ylim, tlim, xvals, yvals, tvals, N, ...attr} = args ?? {};
        shape = shape ?? black_dot();
        radius = radius ?? 0.05;
        fr = fr ?? (() => radius);
        fs = fs ?? (() => shape);

        // compute point values
        [tvals, xvals, yvals] = sympath({
            fx, fy, xlim, ylim, tlim, xvals, yvals, tvals, N: N
        });

        // make points
        let points = zip(tvals, xvals, yvals);
        let children = points.map(([t, x, y]) =>
            [fs(x, y, t), rad_rect([x, y], fr(x, y, t))]
        );

        // pass to element
        let attr1 = {clip: false, ...attr};
        super(children, attr1);
    }
}

/**
 ** bar components
 **/

// no aspect, but has a ylim and optional width that is used by Bars
class Bar extends Stack {
    constructor(direc, lengths, args) {
        let {zero, size, ...attr} = args ?? {};
        zero = zero ?? 0;

        // get standardized direction
        direc = get_orient(direc);

        // normalize section specs
        lengths = is_scalar(lengths) ? [lengths] : lengths;
        let boxes = lengths.map(lc => is_scalar(lc) ? [lc, null] : lc);
        let length = sum(boxes.map(([l, c]) => l));
        let children = boxes.map(([l, c]) => [new Rect({fill: c}), l/length]);

        super(direc, children, attr);
        this.lim = [zero, zero + length];
        this.size = size;
    }
}

class VBar extends Bar {
    constructor(lengths, args) {
        super('v', lengths, args);
    }
}

// non-unary | variable-aspect | graphable
// custom bars must have a ylim and optionally a width
class Bars extends Container {
    constructor(direc, bars, args) {
        let {lim, zero, shrink, size, color, integer, ...attr} = args ?? {};
        zero = zero ?? 0;
        integer = integer ?? false;
        shrink = shrink ?? 0;
        let n = bars.length;

        // get standardized direction
        direc = get_orient(direc);

        // check input sizes
        let arrs = new Set(bars.map(is_array));
        if (arrs.size > 1) {
            throw new Error('Error: bar specs must all be same type');
        }
        let [arr,] = arrs;

        // expand scalar list case
        let vals;
        if (arr) {
            [vals, bars] = zip(...bars);
        } else {
            let lim_int = (n > 1) ? [0, n-1] : [-0.5, 0.5];
            let lim_def = (integer) ? lim_int : limit_base;
            lim = lim ?? lim_def;
            vals = linspace(...lim, n);
            if (direc == 'h') { vals = vals.reverse(); }
        }

        // get data parameters
        let [vmin, vmax] = [min(...vals), max(...vals)];
        size = size ?? ((n > 1) ? (1-shrink)*(vmax-vmin)/(n-1) : 1);

        // handle scalar and custom bars
        bars = bars.map(b =>
            is_scalar(b) ? new Bar(direc, [[b, color]], {zero, size}) : b
        );

        // aggregate lengths
        let [zmins, zmaxs] = zip(...bars.map(b => b.lim));
        let [zmin, zmax] = [min(...zmins), max(...zmaxs)];

        // compute boxes
        let children = zip(vals, bars).map(([v, b]) => {
            let [zlo, zhi, s] = [...b.lim, b.size ?? size];
            let box = (direc == 'v') ? [v-s/2, zlo, v+s/2, zhi] : [zlo, v-s/2, zhi, v+s/2];
            return [b, box];
        });

        // set up container
        let attr1 = {clip: false, ...attr};
        super(children, attr1);
        this.vals = vals;

        // set axis limits
        this.xlim = lim ?? [vmin, vmax];
        this.ylim = [zmin, zmax];
        if (direc == 'h') { [this.xlim, this.ylim] = [this.ylim, this.xlim]; }
    }
}

class VBars extends Bars {
    constructor(bars, args) {
        super('v', bars, args);
    }
}

/**
 ** plotting elements
 **/

function make_ticklabel(s, prec) {
    return new Text(rounder(s, prec), {vshift: -0.15});
}

function make_axislabel(s, attr) {
    return new Text(s, attr);
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
    constructor(direc, ticks, args) {
        let {lim, ...attr} = args ?? {};
        direc = get_orient(direc);
        let tickdir = (direc == 'v') ? 'h' : 'v';
        let children = ticks.map(t => new UnitLine(tickdir, t, {lim: lim}));
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

// the tick classes extend well outside their bounds (so don't clip)
class Ticks extends Container {
    constructor(direc, ticks, args) {
        let {size, lim, align, ...attr} = args ?? {};
        size = size ?? tick_label_size_base;
        lim = lim ?? limit_base;
        align = align ?? 0.5;
        direc = get_orient(direc);
        ticks = ticks.map(ensure_tick);

        let [lo, hi] = lim;
        let tsize = (hi-lo)*size;

        let locator = (t, x) => (direc == 'v') ?
            [align*(1-size*x.aspect), t-tsize/2, 1-(1-align)*(1-size*x.aspect), t+tsize/2] :
            [t-(1-align)*tsize*x.aspect, 0, t+align*tsize*x.aspect, 1];
        let children = ticks.map(([t, x]) => [x, locator(t, x)]);

        super(children, {clip: false, ...attr});
    }
}

class VTicks extends Ticks {
    constructor(ticks, args) {
        super('v', ticks, args);
    }
}

class HTicks extends Ticks {
    constructor(ticks, args) {
        super('h', ticks, args);
    }
}

function get_ticklim(lim) {
    if (lim == null || lim == 'inner') {
        return [0.5, 1];
    } else if (lim == 'outer') {
        return [0, 0.5];
    } else if (lim == 'both') {
        return [0, 1];
    } else {
        return lim;
    }
}

class Axis extends Container {
    constructor(direc, ticks, args) {
        let {label_size, label_inner, label_align, tick_lim, lim, ...attr0} = args ?? {};
        let [label_attr, tick_attr, line_attr, attr] = prefix_split(['label', 'tick', 'line'], attr0);
        label_size = label_size ?? tick_label_size_base;
        lim = lim ?? limit_base;
        tick_lim = get_ticklim(tick_lim);
        direc = get_orient(direc);

        // get default label alignment
        let align0 = (direc == 'v') ? (label_inner ? 0 : 1) : 0.5;
        label_align = label_align ?? align0;

        // invert ytick limits (since higher y means up here)
        tick_lim = (direc == 'v') ? tick_lim : tick_lim.map(x => 1 - x);

        // extract information
        let locs = ticks.map(([t, x]) => t);
        let [lo, hi] = lim;

        // accumulate children
        let cline = new UnitLine(direc, 0.5, {lim, ...line_attr});
        let scale = new Scale(direc, locs, {lim: tick_lim, ...tick_attr});
        let label = new Ticks(direc, ticks, {
            size: label_size, lim: lim, align: label_align, ...label_attr
        });

        // position children
        let lbox, tcoord;
        if (direc == 'v') {
            let lbase = label_inner ? 1 : -1;
            lbox = [lbase, 0, lbase + 1, 1];
            tcoord = [0, hi, 1, lo];
        } else {
            let lbase = label_inner ? -label_size : 1;
            lbox = [0, lbase, 1, lbase + label_size];
            tcoord = [lo, 0, hi, 1];
        }

        // pass to container
        let children = [cline, scale, [label, lbox]];
        super(children, {coord: tcoord, ...attr});
    }
}

class VAxis extends Axis {
    constructor(ticks, args) {
        super('v', ticks, args);
    }
}

class HAxis extends Axis {
    constructor(ticks, args) {
        super('h', ticks, args);
    }
}

function maybe_two(x) {
    if (is_scalar(x)) {
        return [x, x];
    } else {
        return x;
    }
}

class Axes extends Container {
    constructor(args) {
        let {
            xticks, yticks, xlim, ylim, xanchor, yanchor, tick_size, label_size,
            xaxis_tick_size, yaxis_tick_size, xaxis_label_size, yaxis_label_size,
            aspect, prec, ...attr0
        } = args ?? {};
        let [xaxis_attr, yaxis_attr, attr] = prefix_split(['xaxis', 'yaxis'], attr0);
        xticks = xticks ?? num_ticks_base;
        yticks = yticks ?? num_ticks_base;
        xlim = xlim ?? limit_base;
        ylim = ylim ?? limit_base;

        // handle tick_size cases
        tick_size = tick_size ?? tick_size_base;
        let [xtick_size, ytick_size] = aspect_invariant(tick_size, aspect);
        xaxis_tick_size = xaxis_tick_size ?? xtick_size;
        yaxis_tick_size = yaxis_tick_size ?? ytick_size;

        // handle label_size cases
        label_size = label_size ?? tick_label_size_base;
        let [xlabel_size, ylabel_size] = maybe_two(label_size);
        xaxis_label_size = xaxis_label_size ?? xlabel_size;
        yaxis_label_size = yaxis_label_size ?? ylabel_size;

        // collect limits
        let [xmin, xmax] = xlim;
        let [ymin, ymax] = ylim;

        // determine axis locations
        xanchor = xanchor ?? ymin;
        yanchor = yanchor ?? xmin;
        xanchor = (xanchor-ymax)/(ymin-ymax);
        yanchor = (yanchor-xmin)/(xmax-xmin);

        // get xaxis ticks
        xticks = is_scalar(xticks) ? linspace(xmin, xmax, xticks) : xticks;
        xticks = (xticks != null) ? xticks.map(t => ensure_tick(t, prec)) : []

        // get yaxis ticks
        yticks = is_scalar(yticks) ? linspace(ymin, ymax, yticks) : yticks;
        yticks = (yticks != null) ? yticks.map(t => ensure_tick(t, prec)) : [];
        let yticklocs = yticks.map(([y, t]) => y);

        // collect children
        let children = [];

        // make the xaxis
        if (xticks != null) {
            let xaxis = new HAxis(xticks, {lim: xlim, label_size: xaxis_label_size, ...xaxis_attr});
            children.push([
                xaxis, [0, xanchor-xaxis_tick_size/2, 1, xanchor+xaxis_tick_size/2]
            ]);
        }

        // make the yaxis
        if (yticks != null) {
            let yaxis = new VAxis(yticks, {lim: ylim, label_size: yaxis_label_size, ...yaxis_attr});
            children.push([
                yaxis, [yanchor-yaxis_tick_size/2, 0, yanchor+yaxis_tick_size/2, 1]
            ]);
        }

        // pass to container
        let attr1 = {aspect: aspect, ...attr};
        super(children, attr1);
        this.xticks = xticks;
        this.yticks = yticks;
    }
}

class XLabel extends Container {
    constructor(text, attr) {
        let label = is_element(text) ? text : make_axislabel(text);
        super(label, attr);
    }
}

class YLabel extends Container {
    constructor(text, attr) {
        let label = is_element(text) ? text : make_axislabel(text, {rotate: -90});
        super(label, attr);
    }
}

class Title extends Container {
    constructor(text, attr) {
        let label = is_element(text) ? text : make_axislabel(text);
        super(label, attr);
    }
}

class Grid extends Container {
    constructor(args) {
        let {xgrid, ygrid, xlim, ylim, opacity, ...attr0} = args ?? {};
        let [xgrid_attr, ygrid_attr, attr] = prefix_split(['xgrid', 'ygrid'], attr0);
        xlim = xlim ?? limit_base;
        ylim = ylim ?? limit_base;
        opacity = opacity ?? 0.2;

        let [xmin, xmax] = xlim;
        let [ymin, ymax] = ylim;
        let grids = [];

        if (xgrid != null && xgrid !== false) {
            let xgridlines = new HScale(xgrid, {lim: ylim, opacity, ...ygrid_attr});
            grids.push(xgridlines);
        }
        if (ygrid != null && ygrid !== false) {
            let ygridlines = new VScale(ygrid, {lim: xlim, opacity, ...xgrid_attr});
            grids.push(ygridlines);
        }

        let coord = [xmin, ymax, xmax, ymin];
        let attr1 = {coord, ...attr};
        super(grids, attr1);
        this.xlim = xlim;
        this.ylim = ylim;
    }
}

function make_legendbadge(c) {
    let attr;
    if (is_string(c)) {
        attr = {stroke: c};
    } else if (is_object(c)) {
        attr = c;
    } else {
        throw new Error(`Unrecognized legend badge specification: ${c}`);
    }
    let attr1 = {aspect: 1, ...attr};
    return new HLine(attr1);
}

function make_legendlabel(s) {
    return new Text(s, {vshift: -0.12});
}

class Legend extends Place {
    constructor(data, pos, size, args) {
        let {badgewidth, vspacing, hspacing, ...attr} = args ?? {};
        badgewidth = badgewidth ?? 0.1;
        hspacing = hspacing ?? 0.025;
        vspacing = vspacing ?? 0.1;

        let [badges, labels] = zip(...data);
        badges = badges.map(b => is_element(b) ? b : make_legendbadge(b));
        labels = labels.map(t => is_element(t) ? t : make_legendlabel(t));
        let bs = new VStack(badges, {spacing: vspacing});
        let ls = new VStack(labels, {expand: false, align: 'left', spacing: vspacing});
        let vs = new HStack([bs, ls], {spacing: hspacing});

        let fr = new Frame(vs, attr);

        super(fr, pos, size);
    }
}

class Note extends Place {
    constructor(text, pos, size, args) {
        let {font_family, font_weight, latex, ...attr} = args ?? {};
        latex = latex ?? false;

        let Maker = latex ? Tex : Text;
        let label = new Maker(text, attr);
        super(label, pos, size);
    }
}

function expand_limits(lim, fact) {
    let [lo, hi] = lim;
    let ex = fact*(hi-lo);
    return [lo-ex, hi+ex];
}

class Graph extends Container {
    constructor(elems, args) {
        let {xlim, ylim, aspect, padding, ...attr} = args ?? {};
        aspect = aspect ?? 'auto';
        padding = padding ?? 0;

        // handle singleton line
        if (elems instanceof Element) {
            elems = [elems];
        }

        // collect line ranges
        let [xmins, xmaxs] = zip(...elems
            .filter(c => 'xlim' in c).map(c => c.xlim)
        );
        let [ymins, ymaxs] = zip(...elems
            .filter(c => 'ylim' in c).map(c => c.ylim)
        );

        // determine coordinate limits
        let [xpad, ypad] = maybe_two(padding);
        xlim = xlim ?? expand_limits([min(...xmins), max(...xmaxs)], xpad);
        ylim = ylim ?? expand_limits([min(...ymins), max(...ymaxs)], ypad);
        let [xmin, xmax] = xlim;
        let [ymin, ymax] = ylim;

        // get scale and aspect
        if (aspect == 'auto') {
            let [xrange, yrange] = [abs(xmax-xmin), abs(ymax-ymin)];
            aspect = xrange/yrange;
        }

        // pass to container
        let coord = [xmin, ymax, xmax, ymin];
        let attr1 = {aspect, coord, ...attr};
        super(elems, attr1);
        this.xlim = xlim;
        this.ylim = ylim;
    }
}

class Plot extends Container {
    constructor(elems, args) {
        let {
            xlim, ylim, xticks, yticks, xanchor, yanchor, xgrid, ygrid, grid_color,
            xlabel, ylabel, title, tick_size, label_size, label_offset, tick_label_size,
            title_size, title_offset, xlabel_size, ylabel_size, xlabel_offset, ylabel_offset,
            padding, margin, prec, aspect, ...attr0
        } = args ?? {};
        title_size = title_size ?? title_size_base;
        title_offset = title_offset ?? title_offset_base;

        // some advanced piping
        let [
            xaxis_attr, yaxis_attr, axis_attr, xgrid_attr, ygrid_attr, grid_attr, xlabel_attr, ylabel_attr, label_attr, title_attr, attr
        ] = prefix_split(
            ['xaxis', 'yaxis', 'axis', 'xgrid', 'ygrid', 'grid', 'xlabel', 'ylabel', 'label', 'title'], attr0
        );
        [xaxis_attr, yaxis_attr] = [{...axis_attr, ...xaxis_attr}, {...axis_attr, ...yaxis_attr}];
        [xgrid_attr, ygrid_attr] = [{...grid_attr, ...xgrid_attr}, {...grid_attr, ...ygrid_attr}];
        [xlabel_attr, ylabel_attr] = [{...label_attr, ...xlabel_attr}, {...label_attr, ...ylabel_attr}];
        axis_attr = {...prefix_add('xaxis', xaxis_attr), ...prefix_add('yaxis', yaxis_attr)};
        grid_attr = {...prefix_add('xgrid', xgrid_attr), ...prefix_add('ygrid', ygrid_attr)};

        // create graph from elements
        let graph = new Graph(elems, {xlim, ylim, aspect, padding});

        // create axes to match
        let axes = new Axes({
            xticks, yticks, xanchor, yanchor, tick_size, label_size: tick_label_size,
            xlim: graph.xlim, ylim: graph.ylim, aspect: graph.aspect, prec, ...axis_attr
        });

        // create base layout
        let children = [axes, graph];

        // create gridlines
        if (xgrid != null || ygrid != null) {
            let xtick_locs = axes.xticks.map(([x, t]) => x);
            let ytick_locs = axes.yticks.map(([y, t]) => y);
            xgrid = (xgrid == true) ? xtick_locs : xgrid;
            ygrid = (ygrid == true) ? ytick_locs : ygrid;
            let grid = new Grid({
                xgrid, ygrid, grid_color, xlim: graph.xlim,
                ylim: graph.ylim, aspect: graph.aspect, ...grid_attr
            });
            children.unshift(grid);
        }

        // sort out label size
        label_size = label_size ?? label_size_base;
        let [xlabelsize, ylabelsize] = aspect_invariant(label_size, graph.aspect);
        xlabel_size = xlabel_size ?? xlabelsize;
        ylabel_size = ylabel_size ?? ylabelsize;

        // sort out label offset
        label_offset = label_offset ?? label_offset_base;
        let [xlabeloffset, ylabeloffset] = aspect_invariant(label_offset, graph.aspect);
        xlabel_offset = xlabel_offset ?? xlabeloffset;
        ylabel_offset = ylabel_offset ?? ylabeloffset;

        // optional axis labels
        if (xlabel != null) {
            xlabel = new XLabel(xlabel, xlabel_attr);
            let xlabel_rect = [0, 1+xlabel_offset, 1, 1+xlabel_offset+xlabel_size];
            children.push([xlabel, xlabel_rect]);
        }
        if (ylabel != null) {
            ylabel = new YLabel(ylabel, ylabel_attr);
            let ylabel_rect = [-ylabel_offset-ylabel_size, 0, -ylabel_offset, 1];
            children.push([ylabel, ylabel_rect]);
        }

        // optional plot title
        if (title != null) {
            title = new Title(title, title_attr);
            let title_rect = [0, -title_offset-title_size, 1, -title_offset];
            children.push([title, title_rect]);
        }

        // pass to container
        let attr1 = {aspect: graph.aspect, ...attr};
        super(children, attr1);
    }
}

class BarPlot extends Plot {
    constructor(data, args) {
        let {direc, aspect, width, shrink, padding, color, ...attr} = args ?? {};
        direc = direc ?? 'v';
        aspect = aspect ?? phi;
        shrink = shrink ?? 0.2;
        color = color ?? 'lightgray';
        let n = data.length;

        // standardize direction
        direc = get_orient(direc);

        // set up appropriate padding
        let zpad = min(0.5, 1/n);
        let padding0 = (direc == 'v') ? [zpad, 0] : [0, zpad];
        padding = padding ?? padding0;

        // generate actual bars
        let [labs, bars] = zip(...data);
        let bars1 = new Bars(direc, bars, {width, shrink, color});
        let ticks = zip(bars1.vals, labs);

        // send to general plot
        let attr1 = {aspect, padding, ...attr};
        if (direc == 'v') { attr1.xticks = ticks; } else { attr1.yticks = ticks; }
        super(bars1, attr1);
    }
}

//// INTERACTIVE

class InterActive {
    constructor(vars, func) {
        this.gumify = func;
        this.vars = vars;
    }

    create(redraw) {
        let vals = Object.fromEntries(
            Object.entries(this.vars).map(([k, v]) => [k, v.value])
        );
        if (redraw != null) {
            let elem = this.gumify(vals);
            if (elem instanceof Element) {
                elem = (elem instanceof SVG) ? elem : new SVG(elem);
                elem = elem.svg();
            }
            redraw.innerHTML = elem;
        }
        return this.gumify(vals);
    }

    createAnchors(redraw) { // tag is where to append anc, redraw is where to redraw
        let i = this;
        let ancs = Object.entries(this.vars).map(([v, k]) => {
            try {
                let z = k.anchor(v, i, redraw);
                return z;
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
        let v = this;
        let {min, max, step} = v.attr;

        let cont = document.createElement('div');
        cont.className = 'var_cont slider_cont';

        let slider = document.createElement('div');
        slider.className = 'slider';

        let title = document.createElement('div');
        title.className = 'var_title';
        title.innerHTML = v.attr.title ?? `Slider: ${name}`;

        let valInd = document.createElement('span');
        valInd.id = `sliderVal_${name}`;
        valInd.className = 'slider_label';
        valInd.innerHTML = this.value;

        let phantomTrack = document.createElement('div');
        phantomTrack.className = 'phantom_track'

        let trackWrap = document.createElement('div');
        trackWrap.className = 'phantom_track_wrap'

        let min_lim = document.createElement('div');
        min_lim.innerHTML = min;
        min_lim.className = 'min_lim';
        let max_lim = document.createElement('div');
        max_lim.innerHTML = max;
        max_lim.className = 'max_lim';

        trackWrap.append(min_lim, phantomTrack, max_lim);

        let input = document.createElement('input');
        input.type = 'range';
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = this.value;
        input.className = 'slider_input'; // set the CSS class
        input.id = `InterActive_${name}`;

        slider.append(trackWrap, valInd, input);
        cont.append(title, slider); // slider in cont in targ!

        updateSliderValue(input);
        input.addEventListener('input', function() {
            updateSliderValue(this);
            v.updateVal(this.value, ctx, redraw);
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
        let v = this;

        let checkinner = `
<span class="toggle-indicator">
    <span class="checkMark">
        <svg width="20" height="20">
            <use xlink:href="icons.svg#svg-check"></use>
        </svg>
    </span>
</span>
`.trim();

        let cont = document.createElement('div');
        cont.className = 'var_cont toggle_cont';

        let toggle = document.createElement('label');
        toggle.className = 'toggle';

        let track = document.createElement('span');
        track.className = 'toggle-track';
        track.innerHTML = checkinner;

        let title = document.createElement('div');
        title.className = 'var_title';
        title.innerHTML = v.attr.title ?? `Toggle: ${name}`;

        let input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'toggle__input';
        input.checked = this.value;
        input.id = `InterActive_${name}`;

        toggle.append(input, track);
        //targ.appendChild(cont).append(title, toggle); // slider in cont in targ!
        cont.append(title, toggle); // slider in cont in targ!
        input.addEventListener('input', function() {
            v.updateVal(this.checked, ctx, redraw);
        }, false);

        return cont
    }
}

class List extends Variable {
    constructor(init, args) {
        args = args ?? {};
        args.choices = args.choices ?? {};

        if (args.choices instanceof Array) {
            args.choices = args.choices.reduce((a, v) => ({ ...a, [v]: v}), {})
        }

        super(init, args);
    }

    // ctx is an interactive context
    anchor(name, ctx, redraw) {
        let v = this;

        let wrap = document.createElement('div');
        wrap.className = 'custom-select-wrapper';

        let source = document.createElement('div');
        source.className = 'custom-select sources';

        let trigger = document.createElement('span');
        trigger.className = 'custom-select-trigger';
        trigger.innerHTML = v.value;

        let opts = document.createElement('div');
        opts.className = 'custom-options';


        wrap.appendChild(source).append(trigger, opts);

        Object.entries(v.attr.choices).forEach(([label, value]) => {

        let o  = document.createElement('div');
        o.className = 'custom-option';
        o.innerHTML = label;
        o.setAttribute('data-value', value);
        opts.append(o);
        o.addEventListener('click', function() {
                let opt = this.closest('.custom-select')
                let opt_txt = this.textContent;
                let opt_val = this.getAttribute('data-value');
                opt.querySelector('.custom-select-trigger').innerHTML = opt_txt;
                v.updateVal(opt_val, ctx, redraw);
                opt.classList.toggle("opened");
            }, false);
        });


        let cont = document.createElement('div');
        cont.className = 'var_cont list_cont';

        let list = document.createElement('div');
        list.className = 'list';
        list.appendChild(wrap);

        let title = document.createElement('div');
        title.className = 'var_title';
        title.innerHTML = v.attr.title ?? `List: ${name}`;

        cont.append(title, list); // slider in cont in targ!

        list.querySelector('.custom-select-trigger').addEventListener('click', function() {
                this.parentElement.classList.toggle("opened");
            }, false);

        return cont
    }
}

/// shit for making interactive bits beautiful

function updateSliderValue(slider) {
    let pos = (slider.value - slider.min) / (slider.max - slider.min);
    let len = slider.getBoundingClientRect().width;
    let lab = slider.parentNode.querySelector('.slider_label');
    let lef = (100*pos*(len-30))/len;
    lab.innerHTML = slider.value;
    lab.style.left = `${lef}%`; //in prec for window resize events
}

//// Animation

class Animation {
    //vars must be numeric
    constructor(vars, steps, func, fps=20) {
        this.gumify = func;
        this.steps = steps;
        this.init = {...vars};//copy object
        this.vals = vars;
        this.fps = fps;
        this.pos = 0; //current frame
        this.playing = false;
        this.frameList = this.createFrameList();

    }

    create(redraw) {
        if (redraw != null) {
            let elem = this.gumify(this.vals);
            if (elem instanceof Element) {
                elem = (elem instanceof SVG) ? elem : new SVG(elem);
                elem = elem.svg();
            }
            redraw.innerHTML = elem;
        }
        return this.gumify(this.vals);
    }

    createAnchors(redraw) { // tag is where to append anc, redraw is where to redraw
        let i = this;

        let cont = document.createElement('div');
        cont.className = 'var_cont animate_cont';

        let input = document.createElement('button');
        input.textContent = 'Play'
        input.className = 'animateplay__input';

        cont.append(input);
        input.addEventListener('click', function() {
            i.playpause(redraw, input)
        }, false);

        return [cont]
    }


    createFrameList(){
        //list of lists, inner list [dict of vars and ranges, time]

        let frameList=[]
        this.steps.forEach((step) =>{
            let vars = step[0];
            let time = step[1];
            let n = ceil(time * (this.fps / 1000))

            let stepFrames = [...Array(n+1).keys()].map((k) => {
                let frame = {};
                Object.entries(vars).forEach(([v,r]) => {
                    frame[v] = r[0] + k*((r[1] - r[0])/n);
                })
                return frame;
            });
            frameList.push(...stepFrames);

        })
        return frameList;

    }

    animate(redraw, input){
        let frameList = this.frameList;
        let stop = frameList.length;
        this.metronome = setInterval(()=>{
            if(this.pos < stop){
            Object.entries(frameList[this.pos]).forEach(([k, v]) => {
                this.vals[k] = v
                this.create(redraw);
            })
            this.pos += 1;
            }else{
                clearInterval(this.metronome);
                this.playing = false
                this.pos = 0;
                this.vals = {...this.init}; //copy to not connect init
                input.textContent = 'RePlay'
            }
        }, 1000/this.fps);
    }

    playpause(redraw, input){
        if(this.playing){
            clearInterval(this.metronome);
            input.textContent = 'Play'
            this.playing = false;
        } else {
            this.animate(redraw, input)
            input.textContent = 'Pause'
            this.playing = true;
        }
    }
}

/**
 ** expose
 **/

let Gum = [
    Context, Element, Container, Group, SVG, Frame, VStack, HStack, Place, Scatter, Spacer, Ray, Line, HLine, VLine, Rect, Square, Ellipse, Circle, Polyline, Polygon, Path, Arrowhead, Text, Tex, Node, MoveTo, LineTo, Bezier2, Bezier3, Arc, Bezier2Path, Bezier2Line, Bezier3Line, Edge, Network, Close, SymPath, SymFill, SymPoly, SymPoints, Bar, VBar, Bars, VBars, Scale, VScale, HScale, Ticks, VTicks, HTicks, Axis, VAxis, HAxis, Axes, Graph, Plot, BarPlot, Legend, Note, InterActive, Variable, Slider, Toggle, List, Animation, black_dot, range, linspace, enumerate, hex2rgb, rgb2hex, rgb2hsl, interpolateVectors, interpolateHex, interpolateVectorsPallet, zip, exp, log, sin, cos, min, max, abs, pow, sqrt, floor, ceil, round, pi, phi, rounder, make_ticklabel
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

// interface mapper
let gums = Gum.map(g => g.name);
let mako = Gum.map(g => {
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

// main parser entry
function parseGum(src) {
    let expr = new Function(gums, src);
    return expr(...mako);
}

function renderGum(src, args) {
    let elem = parseGum(src);
    if (is_element(elem)) {
        elem = (elem instanceof SVG) ? elem : new SVG(elem, args);
        return elem.svg();
    } else {
        return String(elem);
    }
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
    Gum, Context, Element, Container, Group, SVG, Frame, VStack, HStack, Place, Scatter, Spacer, Ray, Line, Rect, Square, Ellipse, Circle, Polyline, Polygon, Path, Arrowhead, Text, Tex, Node, MoveTo, LineTo, Bezier2, Bezier3, Arc, Bezier2Path, Bezier2Line, Bezier3Line, Edge, Network, Close, SymPath, SymFill, SymPoly, SymPoints, Bar, VBar, Bars, VBars, Scale, VScale, HScale, Ticks, VTicks, HTicks, Axis, VAxis, HAxis, Axes, Graph, Plot, BarPlot, Legend, Note, InterActive, Variable, Slider, Toggle, List, Animation, black_dot, gzip, zip, pos_rect, pad_rect, rad_rect, demangle, props_repr, range, linspace, enumerate, hex2rgb, rgb2hex, rgb2hsl, interpolateVectors, interpolateHex, interpolateVectorsPallet, exp, log, sin, cos, min, max, abs, pow, sqrt, floor, ceil, round, pi, phi, rounder, make_ticklabel, parseGum, renderGum, gums, mako, injectImage, injectImages, injectScripts
};
