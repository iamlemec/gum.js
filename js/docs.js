import { marked } from 'marked'

import { GumEditor, enableResize } from './editor.js'

// global elements
let code = document.querySelector('#code');
let conv = document.querySelector('#conv');
let disp = document.querySelector('#disp');
let stat = document.querySelector('#stat');

let list = document.querySelector('#list');
let left = document.querySelector('#left');
let right = document.querySelector('#right');
let mid = document.querySelector('#mid');

// fetcher
async function getData(url, json=false) {
    let resp = await fetch(url);
    if (resp.ok) {
        if (json) {
            return resp.json();
        } else {
            return resp.text();
        }
    } else {
        return `Error (${resp.status}): ${resp.statusText}`;
    }
}

async function loadEntry(name) {
    let name1 = name.toLowerCase();
    let text = await getData(`docs/text/${name1}.md`);
    left.innerHTML = marked(text);
    let code = await getData(`docs/code/${name1}.js`);
    gum_editor.setCode(code);
}

// resize panels
enableResize(left, right, mid);

// make the actual editor
let gum_editor = new GumEditor(code, conv, disp, stat);

// get docs data
let meta = await getData('docs/meta.json', true);

// populate list
let items = meta.entries.map(name => {
    let item = document.createElement('div');
    item.setAttribute('name', name);
    item.classList.add('item');
    item.innerText = name;
    return item;
});
items.forEach(item => {
    item.addEventListener('click', evt => {
        let name = item.getAttribute('name');
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        loadEntry(name);
    });
    list.append(item);
});

// go to docs home
items[0].click();
