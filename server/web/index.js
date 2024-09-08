// svg presets
let prec = 2;
let size = 500;

// get elements
const left = document.querySelector('#left');
const mid = document.querySelector('#mid');
const right = document.querySelector('#right');
const editor = document.querySelector('#editor');
const svgout = document.querySelector('#svgout');
const output = document.querySelector('#output');
const inputs = document.querySelector('#inputs');
const generate = document.querySelector('#generate');

/*
 * resize panes
 */

// do resize
function resizePane(evt) {
    const pos = evt.clientX;
    const base = left.getBoundingClientRect().left;
    const wind = window.innerWidth;
    const lw = Math.max(200, pos - 2 - base);
    const rw = Math.max(200, wind - pos - 2);
    left.style.width = `${lw}px`;
    right.style.width = `${rw}px`;
}

// event listeners
mid.addEventListener('mousedown', evt => {
    document.addEventListener('mousemove', resizePane, false);
}, false);
document.addEventListener('mouseup', evt => {
    document.removeEventListener('mousemove', resizePane, false);
}, false);

/*
 * handle generation
 */

function updateSvg() {
    // get gum code
    const code = gumedit.getText();

    // parse gum to Element
    let elem;
    try {
        elem = gum.parseGum(code);
    } catch (err) { 
        if (err == 'timeout') {
            svgedit.setText('function timeout');
        } else {
            svgedit.setText(`parse error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
        }
        return;
    }

    // check for null return
    if (elem == null) {
        svgedit.setText('no return');
        return;
    }

    // render Element to svg
    let svg;
    try {
        svg = gum.renderElem(elem, {size, prec});
    } catch (err) {
        svgedit.setText(`render error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
        return;
    }

    // show svg and render
    svgedit.setText(svg);
    output.innerHTML = svg;
}

function disableInputs() {
    inputs.classList.add('disabled');
    generate.classList.add('disabled');
    editor.classList.add('disabled');
    svgout.classList.add('disabled');
    inputs.readonly = true;
    gumedit.setReadOnly(true);
    svgedit.setReadOnly(true);
}

function enableInputs() {
    inputs.classList.remove('disabled');
    generate.classList.remove('disabled');
    editor.classList.remove('disabled');
    svgout.classList.remove('disabled');
    inputs.readonly = false;
    gumedit.setReadOnly(false);
    svgedit.setReadOnly(false);
}

// do generation
generate.addEventListener('click', async () => {
    // disable button
    disableInputs();

    // do generation
    const prompt = inputs.value;
    const response = await fetch('/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({prompt}),
    });

    // read response
    const responseText = await response.text();
    gumedit.setText(responseText);

    // re-enable button
    enableInputs();
});

/*
 * init editor
 */

// starting code
const starter = `// make inverted sine
let xlim = [0, 2*pi]; let ylim = [-1, 1];
let func = x => -0.7 * sin(x);
let line = SymPath({fy: func, xlim});

// draw markers with shape and color
let pal = y => interpolateHex(blue, red, rescale(y, ylim));
let points = SymPoints({
    fy: func, xlim, N: 21, size: 0.04,
    fs: (x, y) => Circle({fill: pal(y), rad: (1+abs(y))/2})
});

// make plot with trig axes
let xticks = [[pi/2, 'π/2'], [pi, 'π'], [3*pi/2, '3π/2'], [2*pi, '2π']];
let plot = Plot([line, points], {
  xlim, ylim, aspect: 1.5, xaxis_pos: 0, xaxis_tick_pos: 'both',
  xticks, yticks: 5, grid: true, grid_stroke_dasharray: 3
});

return TitleFrame(plot, 'Inverted Sine Wave', {
    margin: 0.15, border: 0, label_border_radius: 0.05
});`;

// init editors
ace.config.set('basePath', 'web/libs/ace');
const gumedit =  new Editor(editor, {lang: 'javascript'});
const svgedit = new Editor(svgout, {
    lang: 'svg', showGutter: false, highlightActiveLine: false, wrap: false
});
gumedit.setText(starter);
svgedit.setReadOnly(true);

// connect editors
gumedit.editor.session.on('change', updateSvg);
updateSvg();
