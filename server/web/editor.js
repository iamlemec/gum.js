class Editor {
    constructor(container, args) {
        let {lang, theme, fontSize, printMargin, showGutter, highlightActiveLine, wrap, ...options} = args ?? {};
        lang = lang ?? 'javascript';
        theme = theme ?? 'textmate';
        fontSize = fontSize ?? '12px';
        printMargin = printMargin ?? false;
        showGutter = showGutter ?? true;
        highlightActiveLine = highlightActiveLine ?? true;
        wrap = wrap ?? true;

        // init ace editor with config
        this.editor = ace.edit(container);
        this.editor.setTheme(`ace/theme/${theme}`);
        this.editor.session.setMode(`ace/mode/${lang}`);
        this.editor.setOptions({
            fontSize, printMargin, showGutter, highlightActiveLine, wrap, ...options
        });

        // handle window resize
        window.addEventListener('resize', () => this.editor.resize());
    }

    getText() {
        return this.editor.getValue();
    }

    setText(value) {
        this.editor.setValue(value, 1);
    }

    clearText() {
        this.editor.setValue('', 1);
    }

    appendChunk(chunk) {
        const session = this.editor.session;
        session.insert({
            row: session.getLength(),
            column: 0,
        }, chunk);
    }

    setReadOnly(readOnly) {
        this.editor.setReadOnly(readOnly);
    }
}