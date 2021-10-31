/* gum test suite */

import { range, SVG, Container, VStack, HStack, Ray, Rect } from './gum.mjs';

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

// ray
let y = new Ray();
example('Simple Ray', y);

// starburst
let sb = new Container(
    range(10, 40, 10).map(t => new Ray(t))
)
example('Starburst', sb);
