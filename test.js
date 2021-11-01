/* gum test suite */

import {
    range, Context, SVG, Container, Frame, VStack, HStack, Ray, Rect
} from './gum.js';

// options
let size = [100, 100];
let rect = [0, 0, ...size];
let prec = 2;
let ctx = new Context({rect: rect, prec: prec});

// display
function example(name, elem) {
    let src;
    if (elem instanceof SVG) {
        src = elem.svg({size: size, prec: prec});
    } else {
        src = elem.svg(ctx);
    }
    console.log(`${name}:\n${src}\n`);
}

// element
let r = new Rect();
example('Simple Element', r);

// container
let c = new Container([r]);
example('Simple Container', c);

// svg
let s = new SVG([r]);
example('Simple SVG', s);

// vstack
let v = new VStack([r, r]);
example('Simple VStack', v);

// hstack
let h = new HStack([r, r]);
example('Simple HStack', h);

// ray
let y = new Ray();
example('Simple Ray', y);

// starburst
let sb = new Container(
    range(10, 40, 10).map(t => new Ray(t))
)
example('Starburst', sb);

// frame
let f = new Frame(r, {margin: 0.1, padding: 0.1, border: 1});
example('Frame:', f);
