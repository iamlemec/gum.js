import { enableResize, GumEditor } from './editor.js';

// global elements
let code = document.querySelector('#code');
let conv = document.querySelector('#conv');
let disp = document.querySelector('#disp');
let stat = document.querySelector('#stat');

let left = document.querySelector('#left');
let right = document.querySelector('#right');
let mid = document.querySelector('#mid');

// resize panels
enableResize(left, right, mid);

// make the actual editor
let gum_editor = new GumEditor(code, conv, disp, stat);

// set initial code input
gum_editor.setCode(`
let circle = Circle();
let frame = Frame(circle, {margin: 0.1});
return frame;
`.trim());
