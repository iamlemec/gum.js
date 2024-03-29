import { EditorView, drawSelection, keymap, lineNumbers } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { xml } from '@codemirror/lang-xml'

import { SVG, Element, Interactive, Animation, parseGum, renderElem } from './gum.js'

// svg presets
let prec = 2;
let size = 500;

// primarily for svg output
function readOnlyEditor(parent) {
    return new EditorView({
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
        parent: parent,
    });
}

function getText(state) {
    return state.doc.toString();
}

function setText(editor, text) {
    let len = editor.state.doc.length;
    let upd = editor.state.update({
        changes: {from: 0, to: len, insert: text}
    });
    editor.dispatch(upd);
}

// canned error messages
let err_nodata = 'No data. Does your final line return an element?';

class GumEditor {
    constructor(code, conv, disp, stat, inter, store) {
        this.code = code;
        this.conv = conv;
        this.stat = stat;
        this.disp = disp;
        this.inter = inter;
        this.store = store;

        // init convert
        if (this.conv != null) {
            this.conv_text = readOnlyEditor(this.conv);
        } else {
            this.conv_text = null;
        }

        // init editor
        this.edit_text = new EditorView({
            state: this.createEditState(''),
            parent: code,
        });
    }

    createEditState(doc) {
        return EditorState.create({
            doc: doc,
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
                        this.setStore(text);
                        this.updateView(text);
                    }
                }),
            ],
        });
    }

    setStore(src) {
        if (this.store != null) {
            this.store(src);
        }
    }

    setCode(src) {
        this.edit_text.setState(this.createEditState(src));
        this.updateView(src);
    }

    getConvert() {
        return getText(this.conv_text.state);
    }

    setConvert(text) {
        if (this.conv_text != null) {
            setText(this.conv_text, text);
        } else {
            this.setDisplay(text, true);
        }
    }

    setDisplay(svg, error) {
        if (error) {
            this.disp.classList.add('error');
            this.disp.innerText = svg;
        } else {
            this.disp.classList.remove('error');
            this.disp.innerHTML = svg;
        }
    }

    setState(good) {
        if (good == null) {
            this.stat.classList = [];
        } else if (good) {
            this.stat.classList = ['good'];
        } else {
            this.stat.classList = ['bad'];
        }
    }

    renderGum(out) {
        if (this.inter != null) {
            this.inter.innerHTML = '';
            if (out instanceof Interactive || out instanceof Animation) {
                let anchors = out.createAnchors(this.disp);
                out = out.create();
                this.inter.append(...anchors);
            }
        }
        let args = {size: size, prec: prec};
        return renderElem(out, args);
    }

    async updateView(src) {
        // parse gum into tree
        let elem;
        try {
            elem = await parseGum(src);
        } catch (err) {
            this.setState(false);
            if (err == 'timeout') {
                this.setConvert('function timeout');
            } else {
                this.setConvert(`parse error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
            }
            return;
        }

        // render gum tree
        if (elem == null) {
            this.setState();
            this.setConvert(err_nodata);
        } else {
            let svg;
            try {
                svg = this.renderGum(elem);
            } catch (err) {
                this.setState(false);
                this.setConvert(`render error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
                return;
            }
            this.setState(true);
            this.setConvert(svg);
            this.setDisplay(svg);
        }
    }
}

function enableResize(left, right, mid) {
    let base = left.getBoundingClientRect().left;
    function resizePane(e) {
        let vw = window.innerWidth;
        let x = e.clientX;
        let lw = Math.max(200, x - 2 - base);
        let rw = Math.max(200, vw - x - 2);
        left.style.width = `${lw}px`;
        right.style.width = `${rw}px`;
    }
    
    mid.addEventListener('mousedown', evt => {
        document.addEventListener('mousemove', resizePane, false);
    }, false);
    
    document.addEventListener('mouseup', evt => {
        document.removeEventListener('mousemove', resizePane, false);
    }, false);
}

export { GumEditor, enableResize }
