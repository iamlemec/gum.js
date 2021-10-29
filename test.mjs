/* gum test suite */

import { SVG, Container, VStack, HStack, Rect } from './gum.mjs';

function example(name, elem) {
    console.log(`${name}:\n${elem.svg()}\n`);
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
