import { EditorView, drawSelection, keymap, lineNumbers } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { xml } from '@codemirror/lang-xml'
import { SVG, Element, InterActive, Animation, parseGum } from './gum.js'

// svg presets
let prec = 2;
let size = 500;

// global elements
let code = document.querySelector('#code');
let conv = document.querySelector('#conv');
let disp = document.querySelector('#disp');
let stat = document.querySelector('#stat');
let save = document.querySelector('#save');
let copy = document.querySelector('#copy');
let save_png = document.querySelector('#save-png');
let mid = document.querySelector('#mid');
let left = document.querySelector('#left');
let right = document.querySelector('#right');
let iac = document.querySelector('#interActiveControl');

// wrap in SVG if needed
function renderGum(out) {
    let svg;
    let anchors = null;
    let redraw = document.querySelector('#disp');
    let iac = document.querySelector('#interActiveControl');
    iac.innerHTML = '';

    if (out instanceof InterActive || out instanceof Animation) {
        anchors = out.createAnchors(redraw);
        out = out.create(redraw);
        iac.append(...anchors);
    }
    if (out instanceof Element) {
        let args = {size: size, prec: prec};
        out = (out instanceof SVG) ? out : new SVG(out, args);
        return out.svg();
    } else {
        return String(out);
    }
}

function readBlobAsync(blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    })
}

// load fonts for injection
async function loadFontData(path) {
    let resp = await fetch(path);
    let blob = await resp.blob();
    let data = await readBlobAsync(blob);
    return data;
}

// generate font-face text
async function makeFontFace(family, style, weight, path) {
    let data = await loadFontData(path);
    return `
    @font-face {
        font-family: "${family}";
        font-style: ${style};
        font-weight: ${weight};
        src: url("${data}");
    }
    `;
}

// get ibm font
let ibmFontFace = await makeFontFace(
    'IBMPlexSans', 'normal', 100, 'dist/css/fonts/IBMPlexSans-Thin.ttf'
);

// get viewBox size
function parseViewbox(elem) {
    let vbox = elem.getAttribute('viewBox');
    let [xlo, ylo, xhi, yhi] = vbox.split(' ');
    let [width, height] = [xhi - xlo, yhi - ylo];
    return [width, height];
}

function embedSvgText(elem) {
    // get true dims
    let [width, height] = parseViewbox(elem);

    // clone and add in dimensions
    elem = elem.cloneNode(true);
    elem.setAttribute('width', width);
    elem.setAttribute('height', height);

    // inject font data as style
    let style = document.createElement('style');
    style.textContent = ibmFontFace;

    // insert into document
    let defs = document.createElement('defs');
    defs.appendChild(style);
    elem.prepend(defs);

    return elem;
}

// export to PNG: have to be careful with devices with different pixel ratios
// https://stackoverflow.com/questions/31910043/html5-canvas-drawimage-draws-image-blurry/58345223#58345223
let drawSvg = (elem) => new Promise((resolve, reject) => {
    try {
        // embed font data
        elem = embedSvgText(elem);
        let width = elem.getAttribute('width');
        let height = elem.getAttribute('height');

        // get converted size
        let ratio = window.devicePixelRatio;
        let [width2, height2] = [ratio*width, ratio*height];

        // create a canvas element
        let canvas = document.createElement('canvas');
        canvas.setAttribute('width', width2);
        canvas.setAttribute('height', height2);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // fill white background
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width2, height2);

        // make a url from the svg
        let svg = new XMLSerializer().serializeToString(elem);
        let blob = new Blob([svg], {type: 'image/svg+xml'});
        let url = URL.createObjectURL(blob);

        // create a new image to hold it the converted type
        let image = new Image();

        // when the image is loaded we can get it as base64 url
        image.addEventListener('load', () => {
            ctx.drawImage(image, 0, 0, width2, height2);
            URL.revokeObjectURL(url);
            canvas.toBlob(resolve);
        });

        // load the image
        image.src = url;
    } catch (err) {
        reject(err);
    }
});

// example code
let example0 = `
let n = 12;
let r = Rect();
let s = Group(
  range(-90, 90, 180/n).map(t => Ray(t))
);
let hs = HStack([s, s]);
let vs = VStack([hs, hs]);
let gg = Group([vs, r]);
return Frame(gg, {border: 1, margin: 0.05});
`.trim();

// initial value
let urlParams = new URLSearchParams(window.location.search);
let source = urlParams.get('source');
let cook = getCookie();
let example = source ?? cook ?? example0;

// canned error messages
let err_nodata = 'No data. Does your final line return an element?';

function getText(state) {
    return state.doc.toString();
}

function setConvert(text) {
    let len = conv_text.state.doc.length;
    let upd = conv_text.state.update({
        changes: {from: 0, to: len, insert: text}
    });
    conv_text.dispatch(upd);
}

function setDisplay(svg) {
    disp.innerHTML = svg;
}

function setState(good) {
    if (good == null) {
        stat.classList = [];
    } else if (good) {
        stat.classList = ['good'];
    } else {
        stat.classList = ['bad'];
    }
}

function getCookie() {
    let cookies = document.cookie.split(';').map(x => x.trim().split('='));
    let cgum = cookies.filter(([k, v]) => k == 'gum').shift();
    if (cgum == null) {
        return null;
    } else {
        let [_, vgum] = cgum;
        return decodeURIComponent(vgum);
    }
}

function setCookie(src) {
    let vgum = encodeURIComponent(src);
    document.cookie = `gum=${vgum}; SameSite=Lax`;
}

async function updateView(src) {
    setCookie(src);

    // parse gum into tree
    let elem;
    try {
        elem = await parseGum(src);
    } catch (err) {
        setState(false);
        if (err == 'timeout') {
            setConvert('function timeout');
        } else {
            setConvert(`parse error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
        }
        return;
    }

    // render gum tree
    if (elem == null) {
        setState();
        setConvert(err_nodata);
    } else {
        let svg;
        try {
            svg = renderGum(elem);
        } catch (err) {
            setState(false);
            setConvert(`render error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
            return;
        }
        setState(true);
        setConvert(svg);
        setDisplay(svg);
    }
}

// init convert
let conv_text = new EditorView({
    state: EditorState.create({
        doc: '',
        extensions: [
            xml(),
            drawSelection(),
            syntaxHighlighting(defaultHighlightStyle),
            EditorState.readOnly.of(true),
            EditorView.editable.of(false),
        ],
    }),
    parent: conv,
});

// init editor
let edit_text = new EditorView({
    state: EditorState.create({
        doc: example,
        extensions: [
            javascript(),
            history(),
            drawSelection(),
            lineNumbers(),
            bracketMatching(),
            keymap.of([
                indentWithTab,
                ...defaultKeymap,
                ...historyKeymap,
            ]),
            syntaxHighlighting(defaultHighlightStyle),
            EditorView.updateListener.of(upd => {
                if (upd.docChanged) {
                    let text = getText(upd.state);
                    updateView(text);
                }
            }),
        ],
    }),
    parent: code,
});

// download tools
function downloadFile(name, blob) {
    let url = URL.createObjectURL(blob);
    let element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', `${name}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// connect handlers
save.addEventListener('click', evt => {
    // let text = conv_text.state.doc.toString();
    let elem0 = disp.querySelector('svg');
    let elem = embedSvgText(elem0);
    let text = new XMLSerializer().serializeToString(elem);
    let blob = new Blob([text], {type: 'text/svg'});
    downloadFile('output.svg', blob);
});

copy.addEventListener('click', evt => {
    let text = conv_text.state.doc.toString();
    navigator.clipboard.writeText(text);
});

save_png.addEventListener('click', evt => {
    let elem = disp.querySelector('svg');
    drawSvg(elem).then(data => {
        downloadFile('output.png', data);
    }).catch(err => {
        console.log(err);
    }); 
});

// trigger input
let text = getText(edit_text.state);
updateView(text);

// resize panels
function resizePane(e) {
    let vw = window.innerWidth;
    let x = e.clientX;
    left.style.width = `${x-2}px`;
    right.style.width = `${vw-x-2}px`;
}

mid.addEventListener('mousedown', evt => {
    document.addEventListener('mousemove', resizePane, false);
}, false);

document.addEventListener('mouseup', evt => {
    document.removeEventListener('mousemove', resizePane, false);
}, false);
