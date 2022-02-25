import { parseGum, InterActive, Animation, Element as Element$2, SVG } from './gum.js';

// Compressed representation of the Grapheme_Cluster_Break=Extend
// information from
// http://www.unicode.org/Public/13.0.0/ucd/auxiliary/GraphemeBreakProperty.txt.
// Each pair of elements represents a range, as an offet from the
// previous range and a length. Numbers are in base-36, with the empty
// string being a shorthand for 1.
let extend = /*@__PURE__*/"lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map(s => s ? parseInt(s, 36) : 1);
// Convert offsets into absolute values
for (let i = 1; i < extend.length; i++)
    extend[i] += extend[i - 1];
function isExtendingChar(code) {
    for (let i = 1; i < extend.length; i += 2)
        if (extend[i] > code)
            return extend[i - 1] <= code;
    return false;
}
function isRegionalIndicator(code) {
    return code >= 0x1F1E6 && code <= 0x1F1FF;
}
const ZWJ = 0x200d;
/**
Returns a next grapheme cluster break _after_ (not equal to)
`pos`, if `forward` is true, or before otherwise. Returns `pos`
itself if no further cluster break is available in the string.
Moves across surrogate pairs, extending characters, characters
joined with zero-width joiners, and flag emoji.
*/
function findClusterBreak(str, pos, forward = true) {
    return (forward ? nextClusterBreak : prevClusterBreak)(str, pos);
}
function nextClusterBreak(str, pos) {
    if (pos == str.length)
        return pos;
    // If pos is in the middle of a surrogate pair, move to its start
    if (pos && surrogateLow(str.charCodeAt(pos)) && surrogateHigh(str.charCodeAt(pos - 1)))
        pos--;
    let prev = codePointAt(str, pos);
    pos += codePointSize(prev);
    while (pos < str.length) {
        let next = codePointAt(str, pos);
        if (prev == ZWJ || next == ZWJ || isExtendingChar(next)) {
            pos += codePointSize(next);
            prev = next;
        }
        else if (isRegionalIndicator(next)) {
            let countBefore = 0, i = pos - 2;
            while (i >= 0 && isRegionalIndicator(codePointAt(str, i))) {
                countBefore++;
                i -= 2;
            }
            if (countBefore % 2 == 0)
                break;
            else
                pos += 2;
        }
        else {
            break;
        }
    }
    return pos;
}
function prevClusterBreak(str, pos) {
    while (pos > 0) {
        let found = nextClusterBreak(str, pos - 2);
        if (found < pos)
            return found;
        pos--;
    }
    return 0;
}
function surrogateLow(ch) { return ch >= 0xDC00 && ch < 0xE000; }
function surrogateHigh(ch) { return ch >= 0xD800 && ch < 0xDC00; }
/**
Find the code point at the given position in a string (like the
[`codePointAt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt)
string method).
*/
function codePointAt(str, pos) {
    let code0 = str.charCodeAt(pos);
    if (!surrogateHigh(code0) || pos + 1 == str.length)
        return code0;
    let code1 = str.charCodeAt(pos + 1);
    if (!surrogateLow(code1))
        return code0;
    return ((code0 - 0xd800) << 10) + (code1 - 0xdc00) + 0x10000;
}
/**
The first character that takes up two positions in a JavaScript
string. It is often useful to compare with this after calling
`codePointAt`, to figure out whether your character takes up 1 or
2 index positions.
*/
function codePointSize(code) { return code < 0x10000 ? 1 : 2; }

/**
Count the column position at the given offset into the string,
taking extending characters and tab size into account.
*/
function countColumn(string, tabSize, to = string.length) {
    let n = 0;
    for (let i = 0; i < to;) {
        if (string.charCodeAt(i) == 9) {
            n += tabSize - (n % tabSize);
            i++;
        }
        else {
            n++;
            i = findClusterBreak(string, i);
        }
    }
    return n;
}
/**
Find the offset that corresponds to the given column position in a
string, taking extending characters and tab size into account. By
default, the string length is returned when it is too short to
reach the column. Pass `strict` true to make it return -1 in that
situation.
*/
function findColumn(string, col, tabSize, strict) {
    for (let i = 0, n = 0;;) {
        if (n >= col)
            return i;
        if (i == string.length)
            break;
        n += string.charCodeAt(i) == 9 ? tabSize - (n % tabSize) : 1;
        i = findClusterBreak(string, i);
    }
    return strict === true ? -1 : string.length;
}

/**
The data structure for documents.
*/
class Text {
    /**
    @internal
    */
    constructor() { }
    /**
    Get the line description around the given position.
    */
    lineAt(pos) {
        if (pos < 0 || pos > this.length)
            throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
        return this.lineInner(pos, false, 1, 0);
    }
    /**
    Get the description for the given (1-based) line number.
    */
    line(n) {
        if (n < 1 || n > this.lines)
            throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
        return this.lineInner(n, true, 1, 0);
    }
    /**
    Replace a range of the text with the given content.
    */
    replace(from, to, text) {
        let parts = [];
        this.decompose(0, from, parts, 2 /* To */);
        if (text.length)
            text.decompose(0, text.length, parts, 1 /* From */ | 2 /* To */);
        this.decompose(to, this.length, parts, 1 /* From */);
        return TextNode.from(parts, this.length - (to - from) + text.length);
    }
    /**
    Append another document to this one.
    */
    append(other) {
        return this.replace(this.length, this.length, other);
    }
    /**
    Retrieve the text between the given points.
    */
    slice(from, to = this.length) {
        let parts = [];
        this.decompose(from, to, parts, 0);
        return TextNode.from(parts, to - from);
    }
    /**
    Test whether this text is equal to another instance.
    */
    eq(other) {
        if (other == this)
            return true;
        if (other.length != this.length || other.lines != this.lines)
            return false;
        let start = this.scanIdentical(other, 1), end = this.length - this.scanIdentical(other, -1);
        let a = new RawTextCursor(this), b = new RawTextCursor(other);
        for (let skip = start, pos = start;;) {
            a.next(skip);
            b.next(skip);
            skip = 0;
            if (a.lineBreak != b.lineBreak || a.done != b.done || a.value != b.value)
                return false;
            pos += a.value.length;
            if (a.done || pos >= end)
                return true;
        }
    }
    /**
    Iterate over the text. When `dir` is `-1`, iteration happens
    from end to start. This will return lines and the breaks between
    them as separate strings, and for long lines, might split lines
    themselves into multiple chunks as well.
    */
    iter(dir = 1) { return new RawTextCursor(this, dir); }
    /**
    Iterate over a range of the text. When `from` > `to`, the
    iterator will run in reverse.
    */
    iterRange(from, to = this.length) { return new PartialTextCursor(this, from, to); }
    /**
    Return a cursor that iterates over the given range of lines,
    _without_ returning the line breaks between, and yielding empty
    strings for empty lines.
    
    When `from` and `to` are given, they should be 1-based line numbers.
    */
    iterLines(from, to) {
        let inner;
        if (from == null) {
            inner = this.iter();
        }
        else {
            if (to == null)
                to = this.lines + 1;
            let start = this.line(from).from;
            inner = this.iterRange(start, Math.max(start, to == this.lines + 1 ? this.length : to <= 1 ? 0 : this.line(to - 1).to));
        }
        return new LineCursor(inner);
    }
    /**
    @internal
    */
    toString() { return this.sliceString(0); }
    /**
    Convert the document to an array of lines (which can be
    deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#text.Text^of)).
    */
    toJSON() {
        let lines = [];
        this.flatten(lines);
        return lines;
    }
    /**
    Create a `Text` instance for the given array of lines.
    */
    static of(text) {
        if (text.length == 0)
            throw new RangeError("A document must have at least one line");
        if (text.length == 1 && !text[0])
            return Text.empty;
        return text.length <= 32 /* Branch */ ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
    }
}
// Leaves store an array of line strings. There are always line breaks
// between these strings. Leaves are limited in size and have to be
// contained in TextNode instances for bigger documents.
class TextLeaf extends Text {
    constructor(text, length = textLength(text)) {
        super();
        this.text = text;
        this.length = length;
    }
    get lines() { return this.text.length; }
    get children() { return null; }
    lineInner(target, isLine, line, offset) {
        for (let i = 0;; i++) {
            let string = this.text[i], end = offset + string.length;
            if ((isLine ? line : end) >= target)
                return new Line(offset, end, line, string);
            offset = end + 1;
            line++;
        }
    }
    decompose(from, to, target, open) {
        let text = from <= 0 && to >= this.length ? this
            : new TextLeaf(sliceText(this.text, from, to), Math.min(to, this.length) - Math.max(0, from));
        if (open & 1 /* From */) {
            let prev = target.pop();
            let joined = appendText(text.text, prev.text.slice(), 0, text.length);
            if (joined.length <= 32 /* Branch */) {
                target.push(new TextLeaf(joined, prev.length + text.length));
            }
            else {
                let mid = joined.length >> 1;
                target.push(new TextLeaf(joined.slice(0, mid)), new TextLeaf(joined.slice(mid)));
            }
        }
        else {
            target.push(text);
        }
    }
    replace(from, to, text) {
        if (!(text instanceof TextLeaf))
            return super.replace(from, to, text);
        let lines = appendText(this.text, appendText(text.text, sliceText(this.text, 0, from)), to);
        let newLen = this.length + text.length - (to - from);
        if (lines.length <= 32 /* Branch */)
            return new TextLeaf(lines, newLen);
        return TextNode.from(TextLeaf.split(lines, []), newLen);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
        let result = "";
        for (let pos = 0, i = 0; pos <= to && i < this.text.length; i++) {
            let line = this.text[i], end = pos + line.length;
            if (pos > from && i)
                result += lineSep;
            if (from < end && to > pos)
                result += line.slice(Math.max(0, from - pos), to - pos);
            pos = end + 1;
        }
        return result;
    }
    flatten(target) {
        for (let line of this.text)
            target.push(line);
    }
    scanIdentical() { return 0; }
    static split(text, target) {
        let part = [], len = -1;
        for (let line of text) {
            part.push(line);
            len += line.length + 1;
            if (part.length == 32 /* Branch */) {
                target.push(new TextLeaf(part, len));
                part = [];
                len = -1;
            }
        }
        if (len > -1)
            target.push(new TextLeaf(part, len));
        return target;
    }
}
// Nodes provide the tree structure of the `Text` type. They store a
// number of other nodes or leaves, taking care to balance themselves
// on changes. There are implied line breaks _between_ the children of
// a node (but not before the first or after the last child).
class TextNode extends Text {
    constructor(children, length) {
        super();
        this.children = children;
        this.length = length;
        this.lines = 0;
        for (let child of children)
            this.lines += child.lines;
    }
    lineInner(target, isLine, line, offset) {
        for (let i = 0;; i++) {
            let child = this.children[i], end = offset + child.length, endLine = line + child.lines - 1;
            if ((isLine ? endLine : end) >= target)
                return child.lineInner(target, isLine, line, offset);
            offset = end + 1;
            line = endLine + 1;
        }
    }
    decompose(from, to, target, open) {
        for (let i = 0, pos = 0; pos <= to && i < this.children.length; i++) {
            let child = this.children[i], end = pos + child.length;
            if (from <= end && to >= pos) {
                let childOpen = open & ((pos <= from ? 1 /* From */ : 0) | (end >= to ? 2 /* To */ : 0));
                if (pos >= from && end <= to && !childOpen)
                    target.push(child);
                else
                    child.decompose(from - pos, to - pos, target, childOpen);
            }
            pos = end + 1;
        }
    }
    replace(from, to, text) {
        if (text.lines < this.lines)
            for (let i = 0, pos = 0; i < this.children.length; i++) {
                let child = this.children[i], end = pos + child.length;
                // Fast path: if the change only affects one child and the
                // child's size remains in the acceptable range, only update
                // that child
                if (from >= pos && to <= end) {
                    let updated = child.replace(from - pos, to - pos, text);
                    let totalLines = this.lines - child.lines + updated.lines;
                    if (updated.lines < (totalLines >> (5 /* BranchShift */ - 1)) &&
                        updated.lines > (totalLines >> (5 /* BranchShift */ + 1))) {
                        let copy = this.children.slice();
                        copy[i] = updated;
                        return new TextNode(copy, this.length - (to - from) + text.length);
                    }
                    return super.replace(pos, end, updated);
                }
                pos = end + 1;
            }
        return super.replace(from, to, text);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
        let result = "";
        for (let i = 0, pos = 0; i < this.children.length && pos <= to; i++) {
            let child = this.children[i], end = pos + child.length;
            if (pos > from && i)
                result += lineSep;
            if (from < end && to > pos)
                result += child.sliceString(from - pos, to - pos, lineSep);
            pos = end + 1;
        }
        return result;
    }
    flatten(target) {
        for (let child of this.children)
            child.flatten(target);
    }
    scanIdentical(other, dir) {
        if (!(other instanceof TextNode))
            return 0;
        let length = 0;
        let [iA, iB, eA, eB] = dir > 0 ? [0, 0, this.children.length, other.children.length]
            : [this.children.length - 1, other.children.length - 1, -1, -1];
        for (;; iA += dir, iB += dir) {
            if (iA == eA || iB == eB)
                return length;
            let chA = this.children[iA], chB = other.children[iB];
            if (chA != chB)
                return length + chA.scanIdentical(chB, dir);
            length += chA.length + 1;
        }
    }
    static from(children, length = children.reduce((l, ch) => l + ch.length + 1, -1)) {
        let lines = 0;
        for (let ch of children)
            lines += ch.lines;
        if (lines < 32 /* Branch */) {
            let flat = [];
            for (let ch of children)
                ch.flatten(flat);
            return new TextLeaf(flat, length);
        }
        let chunk = Math.max(32 /* Branch */, lines >> 5 /* BranchShift */), maxChunk = chunk << 1, minChunk = chunk >> 1;
        let chunked = [], currentLines = 0, currentLen = -1, currentChunk = [];
        function add(child) {
            let last;
            if (child.lines > maxChunk && child instanceof TextNode) {
                for (let node of child.children)
                    add(node);
            }
            else if (child.lines > minChunk && (currentLines > minChunk || !currentLines)) {
                flush();
                chunked.push(child);
            }
            else if (child instanceof TextLeaf && currentLines &&
                (last = currentChunk[currentChunk.length - 1]) instanceof TextLeaf &&
                child.lines + last.lines <= 32 /* Branch */) {
                currentLines += child.lines;
                currentLen += child.length + 1;
                currentChunk[currentChunk.length - 1] = new TextLeaf(last.text.concat(child.text), last.length + 1 + child.length);
            }
            else {
                if (currentLines + child.lines > chunk)
                    flush();
                currentLines += child.lines;
                currentLen += child.length + 1;
                currentChunk.push(child);
            }
        }
        function flush() {
            if (currentLines == 0)
                return;
            chunked.push(currentChunk.length == 1 ? currentChunk[0] : TextNode.from(currentChunk, currentLen));
            currentLen = -1;
            currentLines = currentChunk.length = 0;
        }
        for (let child of children)
            add(child);
        flush();
        return chunked.length == 1 ? chunked[0] : new TextNode(chunked, length);
    }
}
Text.empty = /*@__PURE__*/new TextLeaf([""], 0);
function textLength(text) {
    let length = -1;
    for (let line of text)
        length += line.length + 1;
    return length;
}
function appendText(text, target, from = 0, to = 1e9) {
    for (let pos = 0, i = 0, first = true; i < text.length && pos <= to; i++) {
        let line = text[i], end = pos + line.length;
        if (end >= from) {
            if (end > to)
                line = line.slice(0, to - pos);
            if (pos < from)
                line = line.slice(from - pos);
            if (first) {
                target[target.length - 1] += line;
                first = false;
            }
            else
                target.push(line);
        }
        pos = end + 1;
    }
    return target;
}
function sliceText(text, from, to) {
    return appendText(text, [""], from, to);
}
class RawTextCursor {
    constructor(text, dir = 1) {
        this.dir = dir;
        this.done = false;
        this.lineBreak = false;
        this.value = "";
        this.nodes = [text];
        this.offsets = [dir > 0 ? 1 : (text instanceof TextLeaf ? text.text.length : text.children.length) << 1];
    }
    nextInner(skip, dir) {
        this.done = this.lineBreak = false;
        for (;;) {
            let last = this.nodes.length - 1;
            let top = this.nodes[last], offsetValue = this.offsets[last], offset = offsetValue >> 1;
            let size = top instanceof TextLeaf ? top.text.length : top.children.length;
            if (offset == (dir > 0 ? size : 0)) {
                if (last == 0) {
                    this.done = true;
                    this.value = "";
                    return this;
                }
                if (dir > 0)
                    this.offsets[last - 1]++;
                this.nodes.pop();
                this.offsets.pop();
            }
            else if ((offsetValue & 1) == (dir > 0 ? 0 : 1)) {
                this.offsets[last] += dir;
                if (skip == 0) {
                    this.lineBreak = true;
                    this.value = "\n";
                    return this;
                }
                skip--;
            }
            else if (top instanceof TextLeaf) {
                // Move to the next string
                let next = top.text[offset + (dir < 0 ? -1 : 0)];
                this.offsets[last] += dir;
                if (next.length > Math.max(0, skip)) {
                    this.value = skip == 0 ? next : dir > 0 ? next.slice(skip) : next.slice(0, next.length - skip);
                    return this;
                }
                skip -= next.length;
            }
            else {
                let next = top.children[offset + (dir < 0 ? -1 : 0)];
                if (skip > next.length) {
                    skip -= next.length;
                    this.offsets[last] += dir;
                }
                else {
                    if (dir < 0)
                        this.offsets[last]--;
                    this.nodes.push(next);
                    this.offsets.push(dir > 0 ? 1 : (next instanceof TextLeaf ? next.text.length : next.children.length) << 1);
                }
            }
        }
    }
    next(skip = 0) {
        if (skip < 0) {
            this.nextInner(-skip, (-this.dir));
            skip = this.value.length;
        }
        return this.nextInner(skip, this.dir);
    }
}
class PartialTextCursor {
    constructor(text, start, end) {
        this.value = "";
        this.done = false;
        this.cursor = new RawTextCursor(text, start > end ? -1 : 1);
        this.pos = start > end ? text.length : 0;
        this.from = Math.min(start, end);
        this.to = Math.max(start, end);
    }
    nextInner(skip, dir) {
        if (dir < 0 ? this.pos <= this.from : this.pos >= this.to) {
            this.value = "";
            this.done = true;
            return this;
        }
        skip += Math.max(0, dir < 0 ? this.pos - this.to : this.from - this.pos);
        let limit = dir < 0 ? this.pos - this.from : this.to - this.pos;
        if (skip > limit)
            skip = limit;
        limit -= skip;
        let { value } = this.cursor.next(skip);
        this.pos += (value.length + skip) * dir;
        this.value = value.length <= limit ? value : dir < 0 ? value.slice(value.length - limit) : value.slice(0, limit);
        this.done = !this.value;
        return this;
    }
    next(skip = 0) {
        if (skip < 0)
            skip = Math.max(skip, this.from - this.pos);
        else if (skip > 0)
            skip = Math.min(skip, this.to - this.pos);
        return this.nextInner(skip, this.cursor.dir);
    }
    get lineBreak() { return this.cursor.lineBreak && this.value != ""; }
}
class LineCursor {
    constructor(inner) {
        this.inner = inner;
        this.afterBreak = true;
        this.value = "";
        this.done = false;
    }
    next(skip = 0) {
        let { done, lineBreak, value } = this.inner.next(skip);
        if (done) {
            this.done = true;
            this.value = "";
        }
        else if (lineBreak) {
            if (this.afterBreak) {
                this.value = "";
            }
            else {
                this.afterBreak = true;
                this.next();
            }
        }
        else {
            this.value = value;
            this.afterBreak = false;
        }
        return this;
    }
    get lineBreak() { return false; }
}
if (typeof Symbol != "undefined") {
    Text.prototype[Symbol.iterator] = function () { return this.iter(); };
    RawTextCursor.prototype[Symbol.iterator] = PartialTextCursor.prototype[Symbol.iterator] =
        LineCursor.prototype[Symbol.iterator] = function () { return this; };
}
/**
This type describes a line in the document. It is created
on-demand when lines are [queried](https://codemirror.net/6/docs/ref/#text.Text.lineAt).
*/
class Line {
    /**
    @internal
    */
    constructor(
    /**
    The position of the start of the line.
    */
    from, 
    /**
    The position at the end of the line (_before_ the line break,
    or at the end of document for the last line).
    */
    to, 
    /**
    This line's line number (1-based).
    */
    number, 
    /**
    The line's content.
    */
    text) {
        this.from = from;
        this.to = to;
        this.number = number;
        this.text = text;
    }
    /**
    The length of the line (not including any line break after it).
    */
    get length() { return this.to - this.from; }
}

const DefaultSplit = /\r\n?|\n/;
/**
Distinguishes different ways in which positions can be mapped.
*/
var MapMode = /*@__PURE__*/(function (MapMode) {
    /**
    Map a position to a valid new position, even when its context
    was deleted.
    */
    MapMode[MapMode["Simple"] = 0] = "Simple";
    /**
    Return null if deletion happens across the position.
    */
    MapMode[MapMode["TrackDel"] = 1] = "TrackDel";
    /**
    Return null if the character _before_ the position is deleted.
    */
    MapMode[MapMode["TrackBefore"] = 2] = "TrackBefore";
    /**
    Return null if the character _after_ the position is deleted.
    */
    MapMode[MapMode["TrackAfter"] = 3] = "TrackAfter";
return MapMode})(MapMode || (MapMode = {}));
/**
A change description is a variant of [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet)
that doesn't store the inserted text. As such, it can't be
applied, but is cheaper to store and manipulate.
*/
class ChangeDesc {
    // Sections are encoded as pairs of integers. The first is the
    // length in the current document, and the second is -1 for
    // unaffected sections, and the length of the replacement content
    // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
    // 0), and a replacement two positive numbers.
    /**
    @internal
    */
    constructor(
    /**
    @internal
    */
    sections) {
        this.sections = sections;
    }
    /**
    The length of the document before the change.
    */
    get length() {
        let result = 0;
        for (let i = 0; i < this.sections.length; i += 2)
            result += this.sections[i];
        return result;
    }
    /**
    The length of the document after the change.
    */
    get newLength() {
        let result = 0;
        for (let i = 0; i < this.sections.length; i += 2) {
            let ins = this.sections[i + 1];
            result += ins < 0 ? this.sections[i] : ins;
        }
        return result;
    }
    /**
    False when there are actual changes in this set.
    */
    get empty() { return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0; }
    /**
    Iterate over the unchanged parts left by these changes.
    */
    iterGaps(f) {
        for (let i = 0, posA = 0, posB = 0; i < this.sections.length;) {
            let len = this.sections[i++], ins = this.sections[i++];
            if (ins < 0) {
                f(posA, posB, len);
                posB += len;
            }
            else {
                posB += ins;
            }
            posA += len;
        }
    }
    /**
    Iterate over the ranges changed by these changes. (See
    [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
    variant that also provides you with the inserted text.)
    
    When `individual` is true, adjacent changes (which are kept
    separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
    reported separately.
    */
    iterChangedRanges(f, individual = false) {
        iterChanges(this, f, individual);
    }
    /**
    Get a description of the inverted form of these changes.
    */
    get invertedDesc() {
        let sections = [];
        for (let i = 0; i < this.sections.length;) {
            let len = this.sections[i++], ins = this.sections[i++];
            if (ins < 0)
                sections.push(len, ins);
            else
                sections.push(ins, len);
        }
        return new ChangeDesc(sections);
    }
    /**
    Compute the combined effect of applying another set of changes
    after this one. The length of the document after this set should
    match the length before `other`.
    */
    composeDesc(other) { return this.empty ? other : other.empty ? this : composeSets(this, other); }
    /**
    Map this description, which should start with the same document
    as `other`, over another set of changes, so that it can be
    applied after it. When `before` is true, map as if the changes
    in `other` happened before the ones in `this`.
    */
    mapDesc(other, before = false) { return other.empty ? this : mapSet(this, other, before); }
    mapPos(pos, assoc = -1, mode = MapMode.Simple) {
        let posA = 0, posB = 0;
        for (let i = 0; i < this.sections.length;) {
            let len = this.sections[i++], ins = this.sections[i++], endA = posA + len;
            if (ins < 0) {
                if (endA > pos)
                    return posB + (pos - posA);
                posB += len;
            }
            else {
                if (mode != MapMode.Simple && endA >= pos &&
                    (mode == MapMode.TrackDel && posA < pos && endA > pos ||
                        mode == MapMode.TrackBefore && posA < pos ||
                        mode == MapMode.TrackAfter && endA > pos))
                    return null;
                if (endA > pos || endA == pos && assoc < 0 && !len)
                    return pos == posA || assoc < 0 ? posB : posB + ins;
                posB += ins;
            }
            posA = endA;
        }
        if (pos > posA)
            throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
        return posB;
    }
    /**
    Check whether these changes touch a given range. When one of the
    changes entirely covers the range, the string `"cover"` is
    returned.
    */
    touchesRange(from, to = from) {
        for (let i = 0, pos = 0; i < this.sections.length && pos <= to;) {
            let len = this.sections[i++], ins = this.sections[i++], end = pos + len;
            if (ins >= 0 && pos <= to && end >= from)
                return pos < from && end > to ? "cover" : true;
            pos = end;
        }
        return false;
    }
    /**
    @internal
    */
    toString() {
        let result = "";
        for (let i = 0; i < this.sections.length;) {
            let len = this.sections[i++], ins = this.sections[i++];
            result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
        }
        return result;
    }
    /**
    Serialize this change desc to a JSON-representable value.
    */
    toJSON() { return this.sections; }
    /**
    Create a change desc from its JSON representation (as produced
    by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
    */
    static fromJSON(json) {
        if (!Array.isArray(json) || json.length % 2 || json.some(a => typeof a != "number"))
            throw new RangeError("Invalid JSON representation of ChangeDesc");
        return new ChangeDesc(json);
    }
}
/**
A change set represents a group of modifications to a document. It
stores the document length, and can only be applied to documents
with exactly that length.
*/
class ChangeSet extends ChangeDesc {
    /**
    @internal
    */
    constructor(sections, 
    /**
    @internal
    */
    inserted) {
        super(sections);
        this.inserted = inserted;
    }
    /**
    Apply the changes to a document, returning the modified
    document.
    */
    apply(doc) {
        if (this.length != doc.length)
            throw new RangeError("Applying change set to a document with the wrong length");
        iterChanges(this, (fromA, toA, fromB, _toB, text) => doc = doc.replace(fromB, fromB + (toA - fromA), text), false);
        return doc;
    }
    mapDesc(other, before = false) { return mapSet(this, other, before, true); }
    /**
    Given the document as it existed _before_ the changes, return a
    change set that represents the inverse of this set, which could
    be used to go from the document created by the changes back to
    the document as it existed before the changes.
    */
    invert(doc) {
        let sections = this.sections.slice(), inserted = [];
        for (let i = 0, pos = 0; i < sections.length; i += 2) {
            let len = sections[i], ins = sections[i + 1];
            if (ins >= 0) {
                sections[i] = ins;
                sections[i + 1] = len;
                let index = i >> 1;
                while (inserted.length < index)
                    inserted.push(Text.empty);
                inserted.push(len ? doc.slice(pos, pos + len) : Text.empty);
            }
            pos += len;
        }
        return new ChangeSet(sections, inserted);
    }
    /**
    Combine two subsequent change sets into a single set. `other`
    must start in the document produced by `this`. If `this` goes
    `docA` → `docB` and `other` represents `docB` → `docC`, the
    returned value will represent the change `docA` → `docC`.
    */
    compose(other) { return this.empty ? other : other.empty ? this : composeSets(this, other, true); }
    /**
    Given another change set starting in the same document, maps this
    change set over the other, producing a new change set that can be
    applied to the document produced by applying `other`. When
    `before` is `true`, order changes as if `this` comes before
    `other`, otherwise (the default) treat `other` as coming first.
    
    Given two changes `A` and `B`, `A.compose(B.map(A))` and
    `B.compose(A.map(B, true))` will produce the same document. This
    provides a basic form of [operational
    transformation](https://en.wikipedia.org/wiki/Operational_transformation),
    and can be used for collaborative editing.
    */
    map(other, before = false) { return other.empty ? this : mapSet(this, other, before, true); }
    /**
    Iterate over the changed ranges in the document, calling `f` for
    each.
    
    When `individual` is true, adjacent changes are reported
    separately.
    */
    iterChanges(f, individual = false) {
        iterChanges(this, f, individual);
    }
    /**
    Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
    set.
    */
    get desc() { return new ChangeDesc(this.sections); }
    /**
    @internal
    */
    filter(ranges) {
        let resultSections = [], resultInserted = [], filteredSections = [];
        let iter = new SectionIter(this);
        done: for (let i = 0, pos = 0;;) {
            let next = i == ranges.length ? 1e9 : ranges[i++];
            while (pos < next || pos == next && iter.len == 0) {
                if (iter.done)
                    break done;
                let len = Math.min(iter.len, next - pos);
                addSection(filteredSections, len, -1);
                let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
                addSection(resultSections, len, ins);
                if (ins > 0)
                    addInsert(resultInserted, resultSections, iter.text);
                iter.forward(len);
                pos += len;
            }
            let end = ranges[i++];
            while (pos < end) {
                if (iter.done)
                    break done;
                let len = Math.min(iter.len, end - pos);
                addSection(resultSections, len, -1);
                addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
                iter.forward(len);
                pos += len;
            }
        }
        return { changes: new ChangeSet(resultSections, resultInserted),
            filtered: new ChangeDesc(filteredSections) };
    }
    /**
    Serialize this change set to a JSON-representable value.
    */
    toJSON() {
        let parts = [];
        for (let i = 0; i < this.sections.length; i += 2) {
            let len = this.sections[i], ins = this.sections[i + 1];
            if (ins < 0)
                parts.push(len);
            else if (ins == 0)
                parts.push([len]);
            else
                parts.push([len].concat(this.inserted[i >> 1].toJSON()));
        }
        return parts;
    }
    /**
    Create a change set for the given changes, for a document of the
    given length, using `lineSep` as line separator.
    */
    static of(changes, length, lineSep) {
        let sections = [], inserted = [], pos = 0;
        let total = null;
        function flush(force = false) {
            if (!force && !sections.length)
                return;
            if (pos < length)
                addSection(sections, length - pos, -1);
            let set = new ChangeSet(sections, inserted);
            total = total ? total.compose(set.map(total)) : set;
            sections = [];
            inserted = [];
            pos = 0;
        }
        function process(spec) {
            if (Array.isArray(spec)) {
                for (let sub of spec)
                    process(sub);
            }
            else if (spec instanceof ChangeSet) {
                if (spec.length != length)
                    throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
                flush();
                total = total ? total.compose(spec.map(total)) : spec;
            }
            else {
                let { from, to = from, insert } = spec;
                if (from > to || from < 0 || to > length)
                    throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);
                let insText = !insert ? Text.empty : typeof insert == "string" ? Text.of(insert.split(lineSep || DefaultSplit)) : insert;
                let insLen = insText.length;
                if (from == to && insLen == 0)
                    return;
                if (from < pos)
                    flush();
                if (from > pos)
                    addSection(sections, from - pos, -1);
                addSection(sections, to - from, insLen);
                addInsert(inserted, sections, insText);
                pos = to;
            }
        }
        process(changes);
        flush(!total);
        return total;
    }
    /**
    Create an empty changeset of the given length.
    */
    static empty(length) {
        return new ChangeSet(length ? [length, -1] : [], []);
    }
    /**
    Create a changeset from its JSON representation (as produced by
    [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
    */
    static fromJSON(json) {
        if (!Array.isArray(json))
            throw new RangeError("Invalid JSON representation of ChangeSet");
        let sections = [], inserted = [];
        for (let i = 0; i < json.length; i++) {
            let part = json[i];
            if (typeof part == "number") {
                sections.push(part, -1);
            }
            else if (!Array.isArray(part) || typeof part[0] != "number" || part.some((e, i) => i && typeof e != "string")) {
                throw new RangeError("Invalid JSON representation of ChangeSet");
            }
            else if (part.length == 1) {
                sections.push(part[0], 0);
            }
            else {
                while (inserted.length < i)
                    inserted.push(Text.empty);
                inserted[i] = Text.of(part.slice(1));
                sections.push(part[0], inserted[i].length);
            }
        }
        return new ChangeSet(sections, inserted);
    }
}
function addSection(sections, len, ins, forceJoin = false) {
    if (len == 0 && ins <= 0)
        return;
    let last = sections.length - 2;
    if (last >= 0 && ins <= 0 && ins == sections[last + 1])
        sections[last] += len;
    else if (len == 0 && sections[last] == 0)
        sections[last + 1] += ins;
    else if (forceJoin) {
        sections[last] += len;
        sections[last + 1] += ins;
    }
    else
        sections.push(len, ins);
}
function addInsert(values, sections, value) {
    if (value.length == 0)
        return;
    let index = (sections.length - 2) >> 1;
    if (index < values.length) {
        values[values.length - 1] = values[values.length - 1].append(value);
    }
    else {
        while (values.length < index)
            values.push(Text.empty);
        values.push(value);
    }
}
function iterChanges(desc, f, individual) {
    let inserted = desc.inserted;
    for (let posA = 0, posB = 0, i = 0; i < desc.sections.length;) {
        let len = desc.sections[i++], ins = desc.sections[i++];
        if (ins < 0) {
            posA += len;
            posB += len;
        }
        else {
            let endA = posA, endB = posB, text = Text.empty;
            for (;;) {
                endA += len;
                endB += ins;
                if (ins && inserted)
                    text = text.append(inserted[(i - 2) >> 1]);
                if (individual || i == desc.sections.length || desc.sections[i + 1] < 0)
                    break;
                len = desc.sections[i++];
                ins = desc.sections[i++];
            }
            f(posA, endA, posB, endB, text);
            posA = endA;
            posB = endB;
        }
    }
}
function mapSet(setA, setB, before, mkSet = false) {
    let sections = [], insert = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let posA = 0, posB = 0;;) {
        if (a.ins == -1) {
            posA += a.len;
            a.next();
        }
        else if (b.ins == -1 && posB < posA) {
            let skip = Math.min(b.len, posA - posB);
            b.forward(skip);
            addSection(sections, skip, -1);
            posB += skip;
        }
        else if (b.ins >= 0 && (a.done || posB < posA || posB == posA && (b.len < a.len || b.len == a.len && !before))) {
            addSection(sections, b.ins, -1);
            while (posA > posB && !a.done && posA + a.len < posB + b.len) {
                posA += a.len;
                a.next();
            }
            posB += b.len;
            b.next();
        }
        else if (a.ins >= 0) {
            let len = 0, end = posA + a.len;
            for (;;) {
                if (b.ins >= 0 && posB > posA && posB + b.len < end) {
                    len += b.ins;
                    posB += b.len;
                    b.next();
                }
                else if (b.ins == -1 && posB < end) {
                    let skip = Math.min(b.len, end - posB);
                    len += skip;
                    b.forward(skip);
                    posB += skip;
                }
                else {
                    break;
                }
            }
            addSection(sections, len, a.ins);
            if (insert)
                addInsert(insert, sections, a.text);
            posA = end;
            a.next();
        }
        else if (a.done && b.done) {
            return insert ? new ChangeSet(sections, insert) : new ChangeDesc(sections);
        }
        else {
            throw new Error("Mismatched change set lengths");
        }
    }
}
function composeSets(setA, setB, mkSet = false) {
    let sections = [];
    let insert = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let open = false;;) {
        if (a.done && b.done) {
            return insert ? new ChangeSet(sections, insert) : new ChangeDesc(sections);
        }
        else if (a.ins == 0) { // Deletion in A
            addSection(sections, a.len, 0, open);
            a.next();
        }
        else if (b.len == 0 && !b.done) { // Insertion in B
            addSection(sections, 0, b.ins, open);
            if (insert)
                addInsert(insert, sections, b.text);
            b.next();
        }
        else if (a.done || b.done) {
            throw new Error("Mismatched change set lengths");
        }
        else {
            let len = Math.min(a.len2, b.len), sectionLen = sections.length;
            if (a.ins == -1) {
                let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins;
                addSection(sections, len, insB, open);
                if (insert && insB)
                    addInsert(insert, sections, b.text);
            }
            else if (b.ins == -1) {
                addSection(sections, a.off ? 0 : a.len, len, open);
                if (insert)
                    addInsert(insert, sections, a.textBit(len));
            }
            else {
                addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open);
                if (insert && !b.off)
                    addInsert(insert, sections, b.text);
            }
            open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen);
            a.forward2(len);
            b.forward(len);
        }
    }
}
class SectionIter {
    constructor(set) {
        this.set = set;
        this.i = 0;
        this.next();
    }
    next() {
        let { sections } = this.set;
        if (this.i < sections.length) {
            this.len = sections[this.i++];
            this.ins = sections[this.i++];
        }
        else {
            this.len = 0;
            this.ins = -2;
        }
        this.off = 0;
    }
    get done() { return this.ins == -2; }
    get len2() { return this.ins < 0 ? this.len : this.ins; }
    get text() {
        let { inserted } = this.set, index = (this.i - 2) >> 1;
        return index >= inserted.length ? Text.empty : inserted[index];
    }
    textBit(len) {
        let { inserted } = this.set, index = (this.i - 2) >> 1;
        return index >= inserted.length && !len ? Text.empty
            : inserted[index].slice(this.off, len == null ? undefined : this.off + len);
    }
    forward(len) {
        if (len == this.len)
            this.next();
        else {
            this.len -= len;
            this.off += len;
        }
    }
    forward2(len) {
        if (this.ins == -1)
            this.forward(len);
        else if (len == this.ins)
            this.next();
        else {
            this.ins -= len;
            this.off += len;
        }
    }
}

/**
A single selection range. When
[`allowMultipleSelections`](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
is enabled, a [selection](https://codemirror.net/6/docs/ref/#state.EditorSelection) may hold
multiple ranges. By default, selections hold exactly one range.
*/
class SelectionRange {
    /**
    @internal
    */
    constructor(
    /**
    The lower boundary of the range.
    */
    from, 
    /**
    The upper boundary of the range.
    */
    to, flags) {
        this.from = from;
        this.to = to;
        this.flags = flags;
    }
    /**
    The anchor of the range—the side that doesn't move when you
    extend it.
    */
    get anchor() { return this.flags & 16 /* Inverted */ ? this.to : this.from; }
    /**
    The head of the range, which is moved when the range is
    [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
    */
    get head() { return this.flags & 16 /* Inverted */ ? this.from : this.to; }
    /**
    True when `anchor` and `head` are at the same position.
    */
    get empty() { return this.from == this.to; }
    /**
    If this is a cursor that is explicitly associated with the
    character on one of its sides, this returns the side. -1 means
    the character before its position, 1 the character after, and 0
    means no association.
    */
    get assoc() { return this.flags & 4 /* AssocBefore */ ? -1 : this.flags & 8 /* AssocAfter */ ? 1 : 0; }
    /**
    The bidirectional text level associated with this cursor, if
    any.
    */
    get bidiLevel() {
        let level = this.flags & 3 /* BidiLevelMask */;
        return level == 3 ? null : level;
    }
    /**
    The goal column (stored vertical offset) associated with a
    cursor. This is used to preserve the vertical position when
    [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
    lines of different length.
    */
    get goalColumn() {
        let value = this.flags >> 5 /* GoalColumnOffset */;
        return value == 33554431 /* NoGoalColumn */ ? undefined : value;
    }
    /**
    Map this range through a change, producing a valid range in the
    updated document.
    */
    map(change, assoc = -1) {
        let from = change.mapPos(this.from, assoc), to = change.mapPos(this.to, assoc);
        return from == this.from && to == this.to ? this : new SelectionRange(from, to, this.flags);
    }
    /**
    Extend this range to cover at least `from` to `to`.
    */
    extend(from, to = from) {
        if (from <= this.anchor && to >= this.anchor)
            return EditorSelection.range(from, to);
        let head = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
        return EditorSelection.range(this.anchor, head);
    }
    /**
    Compare this range to another range.
    */
    eq(other) {
        return this.anchor == other.anchor && this.head == other.head;
    }
    /**
    Return a JSON-serializable object representing the range.
    */
    toJSON() { return { anchor: this.anchor, head: this.head }; }
    /**
    Convert a JSON representation of a range to a `SelectionRange`
    instance.
    */
    static fromJSON(json) {
        if (!json || typeof json.anchor != "number" || typeof json.head != "number")
            throw new RangeError("Invalid JSON representation for SelectionRange");
        return EditorSelection.range(json.anchor, json.head);
    }
}
/**
An editor selection holds one or more selection ranges.
*/
class EditorSelection {
    /**
    @internal
    */
    constructor(
    /**
    The ranges in the selection, sorted by position. Ranges cannot
    overlap (but they may touch, if they aren't empty).
    */
    ranges, 
    /**
    The index of the _main_ range in the selection (which is
    usually the range that was added last).
    */
    mainIndex = 0) {
        this.ranges = ranges;
        this.mainIndex = mainIndex;
    }
    /**
    Map a selection through a change. Used to adjust the selection
    position for changes.
    */
    map(change, assoc = -1) {
        if (change.empty)
            return this;
        return EditorSelection.create(this.ranges.map(r => r.map(change, assoc)), this.mainIndex);
    }
    /**
    Compare this selection to another selection.
    */
    eq(other) {
        if (this.ranges.length != other.ranges.length ||
            this.mainIndex != other.mainIndex)
            return false;
        for (let i = 0; i < this.ranges.length; i++)
            if (!this.ranges[i].eq(other.ranges[i]))
                return false;
        return true;
    }
    /**
    Get the primary selection range. Usually, you should make sure
    your code applies to _all_ ranges, by using methods like
    [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
    */
    get main() { return this.ranges[this.mainIndex]; }
    /**
    Make sure the selection only has one range. Returns a selection
    holding only the main range from this selection.
    */
    asSingle() {
        return this.ranges.length == 1 ? this : new EditorSelection([this.main]);
    }
    /**
    Extend this selection with an extra range.
    */
    addRange(range, main = true) {
        return EditorSelection.create([range].concat(this.ranges), main ? 0 : this.mainIndex + 1);
    }
    /**
    Replace a given range with another range, and then normalize the
    selection to merge and sort ranges if necessary.
    */
    replaceRange(range, which = this.mainIndex) {
        let ranges = this.ranges.slice();
        ranges[which] = range;
        return EditorSelection.create(ranges, this.mainIndex);
    }
    /**
    Convert this selection to an object that can be serialized to
    JSON.
    */
    toJSON() {
        return { ranges: this.ranges.map(r => r.toJSON()), main: this.mainIndex };
    }
    /**
    Create a selection from a JSON representation.
    */
    static fromJSON(json) {
        if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
            throw new RangeError("Invalid JSON representation for EditorSelection");
        return new EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
    }
    /**
    Create a selection holding a single range.
    */
    static single(anchor, head = anchor) {
        return new EditorSelection([EditorSelection.range(anchor, head)], 0);
    }
    /**
    Sort and merge the given set of ranges, creating a valid
    selection.
    */
    static create(ranges, mainIndex = 0) {
        if (ranges.length == 0)
            throw new RangeError("A selection needs at least one range");
        for (let pos = 0, i = 0; i < ranges.length; i++) {
            let range = ranges[i];
            if (range.empty ? range.from <= pos : range.from < pos)
                return normalized(ranges.slice(), mainIndex);
            pos = range.to;
        }
        return new EditorSelection(ranges, mainIndex);
    }
    /**
    Create a cursor selection range at the given position. You can
    safely ignore the optional arguments in most situations.
    */
    static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
        return new SelectionRange(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 4 /* AssocBefore */ : 8 /* AssocAfter */) |
            (bidiLevel == null ? 3 : Math.min(2, bidiLevel)) |
            ((goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431 /* NoGoalColumn */) << 5 /* GoalColumnOffset */));
    }
    /**
    Create a selection range.
    */
    static range(anchor, head, goalColumn) {
        let goal = (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431 /* NoGoalColumn */) << 5 /* GoalColumnOffset */;
        return head < anchor ? new SelectionRange(head, anchor, 16 /* Inverted */ | goal) : new SelectionRange(anchor, head, goal);
    }
}
function normalized(ranges, mainIndex = 0) {
    let main = ranges[mainIndex];
    ranges.sort((a, b) => a.from - b.from);
    mainIndex = ranges.indexOf(main);
    for (let i = 1; i < ranges.length; i++) {
        let range = ranges[i], prev = ranges[i - 1];
        if (range.empty ? range.from <= prev.to : range.from < prev.to) {
            let from = prev.from, to = Math.max(range.to, prev.to);
            if (i <= mainIndex)
                mainIndex--;
            ranges.splice(--i, 2, range.anchor > range.head ? EditorSelection.range(to, from) : EditorSelection.range(from, to));
        }
    }
    return new EditorSelection(ranges, mainIndex);
}
function checkSelection(selection, docLength) {
    for (let range of selection.ranges)
        if (range.to > docLength)
            throw new RangeError("Selection points outside of document");
}

let nextID = 0;
/**
A facet is a labeled value that is associated with an editor
state. It takes inputs from any number of extensions, and combines
those into a single output value.

Examples of facets are the [theme](https://codemirror.net/6/docs/ref/#view.EditorView^theme) styles
associated with an editor or the [tab
size](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) (which is reduced to a single
value, using the input with the hightest precedence).
*/
class Facet {
    constructor(
    /**
    @internal
    */
    combine, 
    /**
    @internal
    */
    compareInput, 
    /**
    @internal
    */
    compare, isStatic, 
    /**
    @internal
    */
    extensions) {
        this.combine = combine;
        this.compareInput = compareInput;
        this.compare = compare;
        this.isStatic = isStatic;
        this.extensions = extensions;
        /**
        @internal
        */
        this.id = nextID++;
        this.default = combine([]);
    }
    /**
    Define a new facet.
    */
    static define(config = {}) {
        return new Facet(config.combine || ((a) => a), config.compareInput || ((a, b) => a === b), config.compare || (!config.combine ? sameArray$1 : (a, b) => a === b), !!config.static, config.enables);
    }
    /**
    Returns an extension that adds the given value for this facet.
    */
    of(value) {
        return new FacetProvider([], this, 0 /* Static */, value);
    }
    /**
    Create an extension that computes a value for the facet from a
    state. You must take care to declare the parts of the state that
    this value depends on, since your function is only called again
    for a new state when one of those parts changed.
    
    In most cases, you'll want to use the
    [`provide`](https://codemirror.net/6/docs/ref/#state.StateField^define^config.provide) option when
    defining a field instead.
    */
    compute(deps, get) {
        if (this.isStatic)
            throw new Error("Can't compute a static facet");
        return new FacetProvider(deps, this, 1 /* Single */, get);
    }
    /**
    Create an extension that computes zero or more values for this
    facet from a state.
    */
    computeN(deps, get) {
        if (this.isStatic)
            throw new Error("Can't compute a static facet");
        return new FacetProvider(deps, this, 2 /* Multi */, get);
    }
    from(field, get) {
        if (!get)
            get = x => x;
        return this.compute([field], state => get(state.field(field)));
    }
}
function sameArray$1(a, b) {
    return a == b || a.length == b.length && a.every((e, i) => e === b[i]);
}
class FacetProvider {
    constructor(dependencies, facet, type, value) {
        this.dependencies = dependencies;
        this.facet = facet;
        this.type = type;
        this.value = value;
        this.id = nextID++;
    }
    dynamicSlot(addresses) {
        var _a;
        let getter = this.value;
        let compare = this.facet.compareInput;
        let idx = addresses[this.id] >> 1, multi = this.type == 2 /* Multi */;
        let depDoc = false, depSel = false, depAddrs = [];
        for (let dep of this.dependencies) {
            if (dep == "doc")
                depDoc = true;
            else if (dep == "selection")
                depSel = true;
            else if ((((_a = addresses[dep.id]) !== null && _a !== void 0 ? _a : 1) & 1) == 0)
                depAddrs.push(addresses[dep.id]);
        }
        return (state, tr) => {
            let oldVal = state.values[idx];
            if (oldVal === Uninitialized) {
                state.values[idx] = getter(state);
                return 1 /* Changed */;
            }
            if (tr) {
                let depChanged = (depDoc && tr.docChanged) || (depSel && (tr.docChanged || tr.selection)) ||
                    depAddrs.some(addr => (ensureAddr(state, addr) & 1 /* Changed */) > 0);
                if (depChanged) {
                    let newVal = getter(state);
                    if (multi ? !compareArray(newVal, oldVal, compare) : !compare(newVal, oldVal)) {
                        state.values[idx] = newVal;
                        return 1 /* Changed */;
                    }
                }
            }
            return 0;
        };
    }
}
function compareArray(a, b, compare) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (!compare(a[i], b[i]))
            return false;
    return true;
}
function dynamicFacetSlot(addresses, facet, providers) {
    let providerAddrs = providers.map(p => addresses[p.id]);
    let providerTypes = providers.map(p => p.type);
    let dynamic = providerAddrs.filter(p => !(p & 1));
    let idx = addresses[facet.id] >> 1;
    return (state, tr) => {
        let oldVal = state.values[idx], changed = oldVal === Uninitialized || !tr;
        for (let dynAddr of dynamic) {
            if (ensureAddr(state, dynAddr) & 1 /* Changed */)
                changed = true;
        }
        if (!changed)
            return 0;
        let values = [];
        for (let i = 0; i < providerAddrs.length; i++) {
            let value = getAddr(state, providerAddrs[i]);
            if (providerTypes[i] == 2 /* Multi */)
                for (let val of value)
                    values.push(val);
            else
                values.push(value);
        }
        let value = facet.combine(values);
        if (oldVal !== Uninitialized && facet.compare(value, oldVal))
            return 0;
        state.values[idx] = value;
        return 1 /* Changed */;
    };
}
const initField = /*@__PURE__*/Facet.define({ static: true });
/**
Fields can store additional information in an editor state, and
keep it in sync with the rest of the state.
*/
class StateField {
    constructor(
    /**
    @internal
    */
    id, createF, updateF, compareF, 
    /**
    @internal
    */
    spec) {
        this.id = id;
        this.createF = createF;
        this.updateF = updateF;
        this.compareF = compareF;
        this.spec = spec;
        /**
        @internal
        */
        this.provides = undefined;
    }
    /**
    Define a state field.
    */
    static define(config) {
        let field = new StateField(nextID++, config.create, config.update, config.compare || ((a, b) => a === b), config);
        if (config.provide)
            field.provides = config.provide(field);
        return field;
    }
    create(state) {
        let init = state.facet(initField).find(i => i.field == this);
        return ((init === null || init === void 0 ? void 0 : init.create) || this.createF)(state);
    }
    /**
    @internal
    */
    slot(addresses) {
        let idx = addresses[this.id] >> 1;
        return (state, tr) => {
            let oldVal = state.values[idx];
            if (oldVal === Uninitialized) {
                state.values[idx] = this.create(state);
                return 1 /* Changed */;
            }
            if (tr) {
                let value = this.updateF(oldVal, tr);
                if (!this.compareF(oldVal, value)) {
                    state.values[idx] = value;
                    return 1 /* Changed */;
                }
            }
            return 0;
        };
    }
    /**
    Returns an extension that enables this field and overrides the
    way it is initialized. Can be useful when you need to provide a
    non-default starting value for the field.
    */
    init(create) {
        return [this, initField.of({ field: this, create })];
    }
    /**
    State field instances can be used as
    [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
    given state.
    */
    get extension() { return this; }
}
const Prec_ = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function prec$1(value) {
    return (ext) => new PrecExtension(ext, value);
}
/**
By default extensions are registered in the order they are found
in the flattened form of nested array that was provided.
Individual extension values can be assigned a precedence to
override this. Extensions that do not have a precedence set get
the precedence of the nearest parent with a precedence, or
[`default`](https://codemirror.net/6/docs/ref/#state.Prec.default) if there is no such parent. The
final ordering of extensions is determined by first sorting by
precedence and then by order within each precedence.
*/
const Prec = {
    /**
    The lowest precedence level. Meant for things that should end up
    near the end of the extension order.
    */
    lowest: /*@__PURE__*/prec$1(Prec_.lowest),
    /**
    A lower-than-default precedence, for extensions.
    */
    low: /*@__PURE__*/prec$1(Prec_.low),
    /**
    The default precedence, which is also used for extensions
    without an explicit precedence.
    */
    default: /*@__PURE__*/prec$1(Prec_.default),
    /**
    A higher-than-default precedence, for extensions that should
    come before those with default precedence.
    */
    high: /*@__PURE__*/prec$1(Prec_.high),
    /**
    The highest precedence level, for extensions that should end up
    near the start of the precedence ordering.
    */
    highest: /*@__PURE__*/prec$1(Prec_.highest),
    // FIXME Drop these in some future breaking version
    /**
    Backwards-compatible synonym for `Prec.lowest`.
    */
    fallback: /*@__PURE__*/prec$1(Prec_.lowest),
    /**
    Backwards-compatible synonym for `Prec.high`.
    */
    extend: /*@__PURE__*/prec$1(Prec_.high),
    /**
    Backwards-compatible synonym for `Prec.highest`.
    */
    override: /*@__PURE__*/prec$1(Prec_.highest)
};
class PrecExtension {
    constructor(inner, prec) {
        this.inner = inner;
        this.prec = prec;
    }
}
/**
Extension compartments can be used to make a configuration
dynamic. By [wrapping](https://codemirror.net/6/docs/ref/#state.Compartment.of) part of your
configuration in a compartment, you can later
[replace](https://codemirror.net/6/docs/ref/#state.Compartment.reconfigure) that part through a
transaction.
*/
class Compartment {
    /**
    Create an instance of this compartment to add to your [state
    configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
    */
    of(ext) { return new CompartmentInstance(this, ext); }
    /**
    Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
    reconfigures this compartment.
    */
    reconfigure(content) {
        return Compartment.reconfigure.of({ compartment: this, extension: content });
    }
    /**
    Get the current content of the compartment in the state, or
    `undefined` if it isn't present.
    */
    get(state) {
        return state.config.compartments.get(this);
    }
}
class CompartmentInstance {
    constructor(compartment, inner) {
        this.compartment = compartment;
        this.inner = inner;
    }
}
class Configuration {
    constructor(base, compartments, dynamicSlots, address, staticValues) {
        this.base = base;
        this.compartments = compartments;
        this.dynamicSlots = dynamicSlots;
        this.address = address;
        this.staticValues = staticValues;
        this.statusTemplate = [];
        while (this.statusTemplate.length < dynamicSlots.length)
            this.statusTemplate.push(0 /* Unresolved */);
    }
    staticFacet(facet) {
        let addr = this.address[facet.id];
        return addr == null ? facet.default : this.staticValues[addr >> 1];
    }
    static resolve(base, compartments, oldState) {
        let fields = [];
        let facets = Object.create(null);
        let newCompartments = new Map();
        for (let ext of flatten(base, compartments, newCompartments)) {
            if (ext instanceof StateField)
                fields.push(ext);
            else
                (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
        }
        let address = Object.create(null);
        let staticValues = [];
        let dynamicSlots = [];
        let dynamicDeps = [];
        for (let field of fields) {
            address[field.id] = dynamicSlots.length << 1;
            dynamicSlots.push(a => field.slot(a));
            dynamicDeps.push([]);
        }
        for (let id in facets) {
            let providers = facets[id], facet = providers[0].facet;
            if (providers.every(p => p.type == 0 /* Static */)) {
                address[facet.id] = (staticValues.length << 1) | 1;
                let value = facet.combine(providers.map(p => p.value));
                let oldAddr = oldState ? oldState.config.address[facet.id] : null;
                if (oldAddr != null) {
                    let oldVal = getAddr(oldState, oldAddr);
                    if (facet.compare(value, oldVal))
                        value = oldVal;
                }
                staticValues.push(value);
            }
            else {
                for (let p of providers) {
                    if (p.type == 0 /* Static */) {
                        address[p.id] = (staticValues.length << 1) | 1;
                        staticValues.push(p.value);
                    }
                    else {
                        address[p.id] = dynamicSlots.length << 1;
                        dynamicSlots.push(a => p.dynamicSlot(a));
                        dynamicDeps.push(p.dependencies.filter(d => typeof d != "string").map(d => d.id));
                    }
                }
                address[facet.id] = dynamicSlots.length << 1;
                dynamicSlots.push(a => dynamicFacetSlot(a, facet, providers));
                dynamicDeps.push(providers.filter(p => p.type != 0 /* Static */).map(d => d.id));
            }
        }
        let dynamicValues = dynamicSlots.map(_ => Uninitialized);
        if (oldState) {
            let canReuse = (id, depth) => {
                if (depth > 7)
                    return false;
                let addr = address[id];
                if (!(addr & 1))
                    return dynamicDeps[addr >> 1].every(id => canReuse(id, depth + 1));
                let oldAddr = oldState.config.address[id];
                return oldAddr != null && getAddr(oldState, oldAddr) == staticValues[addr >> 1];
            };
            // Copy over old values for shared facets/fields, if we can
            // prove that they don't need to be recomputed.
            for (let id in address) {
                let cur = address[id], prev = oldState.config.address[id];
                if (prev != null && (cur & 1) == 0 && canReuse(+id, 0))
                    dynamicValues[cur >> 1] = getAddr(oldState, prev);
            }
        }
        return {
            configuration: new Configuration(base, newCompartments, dynamicSlots.map(f => f(address)), address, staticValues),
            values: dynamicValues
        };
    }
}
function flatten(extension, compartments, newCompartments) {
    let result = [[], [], [], [], []];
    let seen = new Map();
    function inner(ext, prec) {
        let known = seen.get(ext);
        if (known != null) {
            if (known >= prec)
                return;
            let found = result[known].indexOf(ext);
            if (found > -1)
                result[known].splice(found, 1);
            if (ext instanceof CompartmentInstance)
                newCompartments.delete(ext.compartment);
        }
        seen.set(ext, prec);
        if (Array.isArray(ext)) {
            for (let e of ext)
                inner(e, prec);
        }
        else if (ext instanceof CompartmentInstance) {
            if (newCompartments.has(ext.compartment))
                throw new RangeError(`Duplicate use of compartment in extensions`);
            let content = compartments.get(ext.compartment) || ext.inner;
            newCompartments.set(ext.compartment, content);
            inner(content, prec);
        }
        else if (ext instanceof PrecExtension) {
            inner(ext.inner, ext.prec);
        }
        else if (ext instanceof StateField) {
            result[prec].push(ext);
            if (ext.provides)
                inner(ext.provides, prec);
        }
        else if (ext instanceof FacetProvider) {
            result[prec].push(ext);
            if (ext.facet.extensions)
                inner(ext.facet.extensions, prec);
        }
        else {
            let content = ext.extension;
            if (!content)
                throw new Error(`Unrecognized extension value in extension set (${ext}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
            inner(content, prec);
        }
    }
    inner(extension, Prec_.default);
    return result.reduce((a, b) => a.concat(b));
}
const Uninitialized = {};
function ensureAddr(state, addr) {
    if (addr & 1)
        return 2 /* Computed */;
    let idx = addr >> 1;
    let status = state.status[idx];
    if (status == 4 /* Computing */)
        throw new Error("Cyclic dependency between fields and/or facets");
    if (status & 2 /* Computed */)
        return status;
    state.status[idx] = 4 /* Computing */;
    let changed = state.config.dynamicSlots[idx](state, state.applying);
    return state.status[idx] = 2 /* Computed */ | changed;
}
function getAddr(state, addr) {
    return addr & 1 ? state.config.staticValues[addr >> 1] : state.values[addr >> 1];
}

const languageData = /*@__PURE__*/Facet.define();
const allowMultipleSelections = /*@__PURE__*/Facet.define({
    combine: values => values.some(v => v),
    static: true
});
const lineSeparator = /*@__PURE__*/Facet.define({
    combine: values => values.length ? values[0] : undefined,
    static: true
});
const changeFilter = /*@__PURE__*/Facet.define();
const transactionFilter = /*@__PURE__*/Facet.define();
const transactionExtender = /*@__PURE__*/Facet.define();
const readOnly = /*@__PURE__*/Facet.define({
    combine: values => values.length ? values[0] : false
});

/**
Annotations are tagged values that are used to add metadata to
transactions in an extensible way. They should be used to model
things that effect the entire transaction (such as its [time
stamp](https://codemirror.net/6/docs/ref/#state.Transaction^time) or information about its
[origin](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)). For effects that happen
_alongside_ the other changes made by the transaction, [state
effects](https://codemirror.net/6/docs/ref/#state.StateEffect) are more appropriate.
*/
class Annotation {
    /**
    @internal
    */
    constructor(
    /**
    The annotation type.
    */
    type, 
    /**
    The value of this annotation.
    */
    value) {
        this.type = type;
        this.value = value;
    }
    /**
    Define a new type of annotation.
    */
    static define() { return new AnnotationType(); }
}
/**
Marker that identifies a type of [annotation](https://codemirror.net/6/docs/ref/#state.Annotation).
*/
class AnnotationType {
    /**
    Create an instance of this annotation.
    */
    of(value) { return new Annotation(this, value); }
}
/**
Representation of a type of state effect. Defined with
[`StateEffect.define`](https://codemirror.net/6/docs/ref/#state.StateEffect^define).
*/
class StateEffectType {
    /**
    @internal
    */
    constructor(
    // The `any` types in these function types are there to work
    // around TypeScript issue #37631, where the type guard on
    // `StateEffect.is` mysteriously stops working when these properly
    // have type `Value`.
    /**
    @internal
    */
    map) {
        this.map = map;
    }
    /**
    Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
    type.
    */
    of(value) { return new StateEffect(this, value); }
}
/**
State effects can be used to represent additional effects
associated with a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction.effects). They
are often useful to model changes to custom [state
fields](https://codemirror.net/6/docs/ref/#state.StateField), when those changes aren't implicit in
document or selection changes.
*/
class StateEffect {
    /**
    @internal
    */
    constructor(
    /**
    @internal
    */
    type, 
    /**
    The value of this effect.
    */
    value) {
        this.type = type;
        this.value = value;
    }
    /**
    Map this effect through a position mapping. Will return
    `undefined` when that ends up deleting the effect.
    */
    map(mapping) {
        let mapped = this.type.map(this.value, mapping);
        return mapped === undefined ? undefined : mapped == this.value ? this : new StateEffect(this.type, mapped);
    }
    /**
    Tells you whether this effect object is of a given
    [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
    */
    is(type) { return this.type == type; }
    /**
    Define a new effect type. The type parameter indicates the type
    of values that his effect holds.
    */
    static define(spec = {}) {
        return new StateEffectType(spec.map || (v => v));
    }
    /**
    Map an array of effects through a change set.
    */
    static mapEffects(effects, mapping) {
        if (!effects.length)
            return effects;
        let result = [];
        for (let effect of effects) {
            let mapped = effect.map(mapping);
            if (mapped)
                result.push(mapped);
        }
        return result;
    }
}
/**
This effect can be used to reconfigure the root extensions of
the editor. Doing this will discard any extensions
[appended](https://codemirror.net/6/docs/ref/#state.StateEffect^appendConfig), but does not reset
the content of [reconfigured](https://codemirror.net/6/docs/ref/#state.Compartment.reconfigure)
compartments.
*/
StateEffect.reconfigure = /*@__PURE__*/StateEffect.define();
/**
Append extensions to the top-level configuration of the editor.
*/
StateEffect.appendConfig = /*@__PURE__*/StateEffect.define();
/**
Changes to the editor state are grouped into transactions.
Typically, a user action creates a single transaction, which may
contain any number of document changes, may change the selection,
or have other effects. Create a transaction by calling
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
*/
class Transaction {
    /**
    @internal
    */
    constructor(
    /**
    The state from which the transaction starts.
    */
    startState, 
    /**
    The document changes made by this transaction.
    */
    changes, 
    /**
    The selection set by this transaction, or undefined if it
    doesn't explicitly set a selection.
    */
    selection, 
    /**
    The effects added to the transaction.
    */
    effects, 
    /**
    @internal
    */
    annotations, 
    /**
    Whether the selection should be scrolled into view after this
    transaction is dispatched.
    */
    scrollIntoView) {
        this.startState = startState;
        this.changes = changes;
        this.selection = selection;
        this.effects = effects;
        this.annotations = annotations;
        this.scrollIntoView = scrollIntoView;
        /**
        @internal
        */
        this._doc = null;
        /**
        @internal
        */
        this._state = null;
        if (selection)
            checkSelection(selection, changes.newLength);
        if (!annotations.some((a) => a.type == Transaction.time))
            this.annotations = annotations.concat(Transaction.time.of(Date.now()));
    }
    /**
    The new document produced by the transaction. Contrary to
    [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
    force the entire new state to be computed right away, so it is
    recommended that [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
    when they need to look at the new document.
    */
    get newDoc() {
        return this._doc || (this._doc = this.changes.apply(this.startState.doc));
    }
    /**
    The new selection produced by the transaction. If
    [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
    this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
    current selection through the changes made by the transaction.
    */
    get newSelection() {
        return this.selection || this.startState.selection.map(this.changes);
    }
    /**
    The new state created by the transaction. Computed on demand
    (but retained for subsequent access), so itis recommended not to
    access it in [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
    */
    get state() {
        if (!this._state)
            this.startState.applyTransaction(this);
        return this._state;
    }
    /**
    Get the value of the given annotation type, if any.
    */
    annotation(type) {
        for (let ann of this.annotations)
            if (ann.type == type)
                return ann.value;
        return undefined;
    }
    /**
    Indicates whether the transaction changed the document.
    */
    get docChanged() { return !this.changes.empty; }
    /**
    Indicates whether this transaction reconfigures the state
    (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
    with a top-level configuration
    [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
    */
    get reconfigured() { return this.startState.config != this.state.config; }
    /**
    Returns true if the transaction has a [user
    event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
    or more specific than `event`. For example, if the transaction
    has `"select.pointer"` as user event, `"select"` and
    `"select.pointer"` will match it.
    */
    isUserEvent(event) {
        let e = this.annotation(Transaction.userEvent);
        return !!(e && (e == event || e.length > event.length && e.slice(0, event.length) == event && e[event.length] == "."));
    }
}
/**
Annotation used to store transaction timestamps.
*/
Transaction.time = /*@__PURE__*/Annotation.define();
/**
Annotation used to associate a transaction with a user interface
event. Holds a string identifying the event, using a
dot-separated format to support attaching more specific
information. The events used by the core libraries are:

 - `"input"` when content is entered
   - `"input.type"` for typed input
     - `"input.type.compose"` for composition
   - `"input.paste"` for pasted input
   - `"input.drop"` when adding content with drag-and-drop
   - `"input.complete"` when autocompleting
 - `"delete"` when the user deletes content
   - `"delete.selection"` when deleting the selection
   - `"delete.forward"` when deleting forward from the selection
   - `"delete.backward"` when deleting backward from the selection
   - `"delete.cut"` when cutting to the clipboard
 - `"move"` when content is moved
   - `"move.drop"` when content is moved within the editor through drag-and-drop
 - `"select"` when explicitly changing the selection
   - `"select.pointer"` when selecting with a mouse or other pointing device
 - `"undo"` and `"redo"` for history actions

Use [`isUserEvent`](https://codemirror.net/6/docs/ref/#state.Transaction.isUserEvent) to check
whether the annotation matches a given event.
*/
Transaction.userEvent = /*@__PURE__*/Annotation.define();
/**
Annotation indicating whether a transaction should be added to
the undo history or not.
*/
Transaction.addToHistory = /*@__PURE__*/Annotation.define();
/**
Annotation indicating (when present and true) that a transaction
represents a change made by some other actor, not the user. This
is used, for example, to tag other people's changes in
collaborative editing.
*/
Transaction.remote = /*@__PURE__*/Annotation.define();
function joinRanges(a, b) {
    let result = [];
    for (let iA = 0, iB = 0;;) {
        let from, to;
        if (iA < a.length && (iB == b.length || b[iB] >= a[iA])) {
            from = a[iA++];
            to = a[iA++];
        }
        else if (iB < b.length) {
            from = b[iB++];
            to = b[iB++];
        }
        else
            return result;
        if (!result.length || result[result.length - 1] < from)
            result.push(from, to);
        else if (result[result.length - 1] < to)
            result[result.length - 1] = to;
    }
}
function mergeTransaction(a, b, sequential) {
    var _a;
    let mapForA, mapForB, changes;
    if (sequential) {
        mapForA = b.changes;
        mapForB = ChangeSet.empty(b.changes.length);
        changes = a.changes.compose(b.changes);
    }
    else {
        mapForA = b.changes.map(a.changes);
        mapForB = a.changes.mapDesc(b.changes, true);
        changes = a.changes.compose(mapForA);
    }
    return {
        changes,
        selection: b.selection ? b.selection.map(mapForB) : (_a = a.selection) === null || _a === void 0 ? void 0 : _a.map(mapForA),
        effects: StateEffect.mapEffects(a.effects, mapForA).concat(StateEffect.mapEffects(b.effects, mapForB)),
        annotations: a.annotations.length ? a.annotations.concat(b.annotations) : b.annotations,
        scrollIntoView: a.scrollIntoView || b.scrollIntoView
    };
}
function resolveTransactionInner(state, spec, docSize) {
    let sel = spec.selection, annotations = asArray$1(spec.annotations);
    if (spec.userEvent)
        annotations = annotations.concat(Transaction.userEvent.of(spec.userEvent));
    return {
        changes: spec.changes instanceof ChangeSet ? spec.changes
            : ChangeSet.of(spec.changes || [], docSize, state.facet(lineSeparator)),
        selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
        effects: asArray$1(spec.effects),
        annotations,
        scrollIntoView: !!spec.scrollIntoView
    };
}
function resolveTransaction(state, specs, filter) {
    let s = resolveTransactionInner(state, specs.length ? specs[0] : {}, state.doc.length);
    if (specs.length && specs[0].filter === false)
        filter = false;
    for (let i = 1; i < specs.length; i++) {
        if (specs[i].filter === false)
            filter = false;
        let seq = !!specs[i].sequential;
        s = mergeTransaction(s, resolveTransactionInner(state, specs[i], seq ? s.changes.newLength : state.doc.length), seq);
    }
    let tr = new Transaction(state, s.changes, s.selection, s.effects, s.annotations, s.scrollIntoView);
    return extendTransaction(filter ? filterTransaction(tr) : tr);
}
// Finish a transaction by applying filters if necessary.
function filterTransaction(tr) {
    let state = tr.startState;
    // Change filters
    let result = true;
    for (let filter of state.facet(changeFilter)) {
        let value = filter(tr);
        if (value === false) {
            result = false;
            break;
        }
        if (Array.isArray(value))
            result = result === true ? value : joinRanges(result, value);
    }
    if (result !== true) {
        let changes, back;
        if (result === false) {
            back = tr.changes.invertedDesc;
            changes = ChangeSet.empty(state.doc.length);
        }
        else {
            let filtered = tr.changes.filter(result);
            changes = filtered.changes;
            back = filtered.filtered.invertedDesc;
        }
        tr = new Transaction(state, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.scrollIntoView);
    }
    // Transaction filters
    let filters = state.facet(transactionFilter);
    for (let i = filters.length - 1; i >= 0; i--) {
        let filtered = filters[i](tr);
        if (filtered instanceof Transaction)
            tr = filtered;
        else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
            tr = filtered[0];
        else
            tr = resolveTransaction(state, asArray$1(filtered), false);
    }
    return tr;
}
function extendTransaction(tr) {
    let state = tr.startState, extenders = state.facet(transactionExtender), spec = tr;
    for (let i = extenders.length - 1; i >= 0; i--) {
        let extension = extenders[i](tr);
        if (extension && Object.keys(extension).length)
            spec = mergeTransaction(tr, resolveTransactionInner(state, extension, tr.changes.newLength), true);
    }
    return spec == tr ? tr : new Transaction(state, tr.changes, tr.selection, spec.effects, spec.annotations, spec.scrollIntoView);
}
const none$5 = [];
function asArray$1(value) {
    return value == null ? none$5 : Array.isArray(value) ? value : [value];
}

/**
The categories produced by a [character
categorizer](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer). These are used
do things like selecting by word.
*/
var CharCategory = /*@__PURE__*/(function (CharCategory) {
    /**
    Word characters.
    */
    CharCategory[CharCategory["Word"] = 0] = "Word";
    /**
    Whitespace.
    */
    CharCategory[CharCategory["Space"] = 1] = "Space";
    /**
    Anything else.
    */
    CharCategory[CharCategory["Other"] = 2] = "Other";
return CharCategory})(CharCategory || (CharCategory = {}));
const nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let wordChar;
try {
    wordChar = /*@__PURE__*/new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
}
catch (_) { }
function hasWordChar(str) {
    if (wordChar)
        return wordChar.test(str);
    for (let i = 0; i < str.length; i++) {
        let ch = str[i];
        if (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
            return true;
    }
    return false;
}
function makeCategorizer(wordChars) {
    return (char) => {
        if (!/\S/.test(char))
            return CharCategory.Space;
        if (hasWordChar(char))
            return CharCategory.Word;
        for (let i = 0; i < wordChars.length; i++)
            if (char.indexOf(wordChars[i]) > -1)
                return CharCategory.Word;
        return CharCategory.Other;
    };
}

/**
The editor state class is a persistent (immutable) data structure.
To update a state, you [create](https://codemirror.net/6/docs/ref/#state.EditorState.update) a
[transaction](https://codemirror.net/6/docs/ref/#state.Transaction), which produces a _new_ state
instance, without modifying the original object.

As such, _never_ mutate properties of a state directly. That'll
just break things.
*/
class EditorState {
    /**
    @internal
    */
    constructor(
    /**
    @internal
    */
    config, 
    /**
    The current document.
    */
    doc, 
    /**
    The current selection.
    */
    selection, 
    /**
    @internal
    */
    values, tr = null) {
        this.config = config;
        this.doc = doc;
        this.selection = selection;
        this.values = values;
        /**
        @internal
        */
        this.applying = null;
        this.status = config.statusTemplate.slice();
        this.applying = tr;
        // Fill in the computed state immediately, so that further queries
        // for it made during the update return this state
        if (tr)
            tr._state = this;
        for (let i = 0; i < this.config.dynamicSlots.length; i++)
            ensureAddr(this, i << 1);
        this.applying = null;
    }
    field(field, require = true) {
        let addr = this.config.address[field.id];
        if (addr == null) {
            if (require)
                throw new RangeError("Field is not present in this state");
            return undefined;
        }
        ensureAddr(this, addr);
        return getAddr(this, addr);
    }
    /**
    Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
    state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
    can be passed. Unless
    [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
    [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
    are assumed to start in the _current_ document (not the document
    produced by previous specs), and its
    [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
    to the document created by its _own_ changes. The resulting
    transaction contains the combined effect of all the different
    specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
    specs take precedence over earlier ones.
    */
    update(...specs) {
        return resolveTransaction(this, specs, true);
    }
    /**
    @internal
    */
    applyTransaction(tr) {
        let conf = this.config, { base, compartments } = conf;
        for (let effect of tr.effects) {
            if (effect.is(Compartment.reconfigure)) {
                if (conf) {
                    compartments = new Map;
                    conf.compartments.forEach((val, key) => compartments.set(key, val));
                    conf = null;
                }
                compartments.set(effect.value.compartment, effect.value.extension);
            }
            else if (effect.is(StateEffect.reconfigure)) {
                conf = null;
                base = effect.value;
            }
            else if (effect.is(StateEffect.appendConfig)) {
                conf = null;
                base = asArray$1(base).concat(effect.value);
            }
        }
        let startValues;
        if (!conf) {
            let resolved = Configuration.resolve(base, compartments, this);
            conf = resolved.configuration;
            let intermediateState = new EditorState(conf, this.doc, this.selection, resolved.values, null);
            startValues = intermediateState.values;
        }
        else {
            startValues = tr.startState.values.slice();
        }
        new EditorState(conf, tr.newDoc, tr.newSelection, startValues, tr);
    }
    /**
    Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
    replaces every selection range with the given content.
    */
    replaceSelection(text) {
        if (typeof text == "string")
            text = this.toText(text);
        return this.changeByRange(range => ({ changes: { from: range.from, to: range.to, insert: text },
            range: EditorSelection.cursor(range.from + text.length) }));
    }
    /**
    Create a set of changes and a new selection by running the given
    function for each range in the active selection. The function
    can return an optional set of changes (in the coordinate space
    of the start document), plus an updated range (in the coordinate
    space of the document produced by the call's own changes). This
    method will merge all the changes and ranges into a single
    changeset and selection, and return it as a [transaction
    spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
    [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
    */
    changeByRange(f) {
        let sel = this.selection;
        let result1 = f(sel.ranges[0]);
        let changes = this.changes(result1.changes), ranges = [result1.range];
        let effects = asArray$1(result1.effects);
        for (let i = 1; i < sel.ranges.length; i++) {
            let result = f(sel.ranges[i]);
            let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
            for (let j = 0; j < i; j++)
                ranges[j] = ranges[j].map(newMapped);
            let mapBy = changes.mapDesc(newChanges, true);
            ranges.push(result.range.map(mapBy));
            changes = changes.compose(newMapped);
            effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray$1(result.effects), mapBy));
        }
        return {
            changes,
            selection: EditorSelection.create(ranges, sel.mainIndex),
            effects
        };
    }
    /**
    Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
    description, taking the state's document length and line
    separator into account.
    */
    changes(spec = []) {
        if (spec instanceof ChangeSet)
            return spec;
        return ChangeSet.of(spec, this.doc.length, this.facet(EditorState.lineSeparator));
    }
    /**
    Using the state's [line
    separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
    [`Text`](https://codemirror.net/6/docs/ref/#text.Text) instance from the given string.
    */
    toText(string) {
        return Text.of(string.split(this.facet(EditorState.lineSeparator) || DefaultSplit));
    }
    /**
    Return the given range of the document as a string.
    */
    sliceDoc(from = 0, to = this.doc.length) {
        return this.doc.sliceString(from, to, this.lineBreak);
    }
    /**
    Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
    */
    facet(facet) {
        let addr = this.config.address[facet.id];
        if (addr == null)
            return facet.default;
        ensureAddr(this, addr);
        return getAddr(this, addr);
    }
    /**
    Convert this state to a JSON-serializable object. When custom
    fields should be serialized, you can pass them in as an object
    mapping property names (in the resulting object, which should
    not use `doc` or `selection`) to fields.
    */
    toJSON(fields) {
        let result = {
            doc: this.sliceDoc(),
            selection: this.selection.toJSON()
        };
        if (fields)
            for (let prop in fields) {
                let value = fields[prop];
                if (value instanceof StateField)
                    result[prop] = value.spec.toJSON(this.field(fields[prop]), this);
            }
        return result;
    }
    /**
    Deserialize a state from its JSON representation. When custom
    fields should be deserialized, pass the same object you passed
    to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
    third argument.
    */
    static fromJSON(json, config = {}, fields) {
        if (!json || typeof json.doc != "string")
            throw new RangeError("Invalid JSON representation for EditorState");
        let fieldInit = [];
        if (fields)
            for (let prop in fields) {
                let field = fields[prop], value = json[prop];
                fieldInit.push(field.init(state => field.spec.fromJSON(value, state)));
            }
        return EditorState.create({
            doc: json.doc,
            selection: EditorSelection.fromJSON(json.selection),
            extensions: config.extensions ? fieldInit.concat([config.extensions]) : fieldInit
        });
    }
    /**
    Create a new state. You'll usually only need this when
    initializing an editor—updated states are created by applying
    transactions.
    */
    static create(config = {}) {
        let { configuration, values } = Configuration.resolve(config.extensions || [], new Map);
        let doc = config.doc instanceof Text ? config.doc
            : Text.of((config.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit));
        let selection = !config.selection ? EditorSelection.single(0)
            : config.selection instanceof EditorSelection ? config.selection
                : EditorSelection.single(config.selection.anchor, config.selection.head);
        checkSelection(selection, doc.length);
        if (!configuration.staticFacet(allowMultipleSelections))
            selection = selection.asSingle();
        return new EditorState(configuration, doc, selection, values);
    }
    /**
    The size (in columns) of a tab in the document, determined by
    the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
    */
    get tabSize() { return this.facet(EditorState.tabSize); }
    /**
    Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
    string for this state.
    */
    get lineBreak() { return this.facet(EditorState.lineSeparator) || "\n"; }
    /**
    Returns true when the editor is
    [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
    */
    get readOnly() { return this.facet(readOnly); }
    /**
    Look up a translation for the given phrase (via the
    [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
    original string if no translation is found.
    */
    phrase(phrase) {
        for (let map of this.facet(EditorState.phrases))
            if (Object.prototype.hasOwnProperty.call(map, phrase))
                return map[phrase];
        return phrase;
    }
    /**
    Find the values for a given language data field, provided by the
    the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
    */
    languageDataAt(name, pos, side = -1) {
        let values = [];
        for (let provider of this.facet(languageData)) {
            for (let result of provider(this, pos, side)) {
                if (Object.prototype.hasOwnProperty.call(result, name))
                    values.push(result[name]);
            }
        }
        return values;
    }
    /**
    Return a function that can categorize strings (expected to
    represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#text.findClusterBreak))
    into one of:
    
     - Word (contains an alphanumeric character or a character
       explicitly listed in the local language's `"wordChars"`
       language data, which should be a string)
     - Space (contains only whitespace)
     - Other (anything else)
    */
    charCategorizer(at) {
        return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
    }
    /**
    Find the word at the given position, meaning the range
    containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
    around it. If no word characters are adjacent to the position,
    this returns null.
    */
    wordAt(pos) {
        let { text, from, length } = this.doc.lineAt(pos);
        let cat = this.charCategorizer(pos);
        let start = pos - from, end = pos - from;
        while (start > 0) {
            let prev = findClusterBreak(text, start, false);
            if (cat(text.slice(prev, start)) != CharCategory.Word)
                break;
            start = prev;
        }
        while (end < length) {
            let next = findClusterBreak(text, end);
            if (cat(text.slice(end, next)) != CharCategory.Word)
                break;
            end = next;
        }
        return start == end ? null : EditorSelection.range(start + from, end + from);
    }
}
/**
A facet that, when enabled, causes the editor to allow multiple
ranges to be selected. Be careful though, because by default the
editor relies on the native DOM selection, which cannot handle
multiple selections. An extension like
[`drawSelection`](https://codemirror.net/6/docs/ref/#view.drawSelection) can be used to make
secondary selections visible to the user.
*/
EditorState.allowMultipleSelections = allowMultipleSelections;
/**
Configures the tab size to use in this state. The first
(highest-precedence) value of the facet is used. If no value is
given, this defaults to 4.
*/
EditorState.tabSize = /*@__PURE__*/Facet.define({
    combine: values => values.length ? values[0] : 4
});
/**
The line separator to use. By default, any of `"\n"`, `"\r\n"`
and `"\r"` is treated as a separator when splitting lines, and
lines are joined with `"\n"`.

When you configure a value here, only that precise separator
will be used, allowing you to round-trip documents through the
editor without normalizing line separators.
*/
EditorState.lineSeparator = lineSeparator;
/**
This facet controls the value of the
[`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) getter, which is
consulted by commands and extensions that implement editing
functionality to determine whether they should apply. It
defaults to false, but when its highest-precedence value is
`true`, such functionality disables itself.

Not to be confused with
[`EditorView.editable`](https://codemirror.net/6/docs/ref/#view.EditorView^editable), which
controls whether the editor's DOM is set to be editable (and
thus focusable).
*/
EditorState.readOnly = readOnly;
/**
Registers translation phrases. The
[`phrase`](https://codemirror.net/6/docs/ref/#state.EditorState.phrase) method will look through
all objects registered with this facet to find translations for
its argument.
*/
EditorState.phrases = /*@__PURE__*/Facet.define();
/**
A facet used to register [language
data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) providers.
*/
EditorState.languageData = languageData;
/**
Facet used to register change filters, which are called for each
transaction (unless explicitly
[disabled](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter)), and can suppress
part of the transaction's changes.

Such a function can return `true` to indicate that it doesn't
want to do anything, `false` to completely stop the changes in
the transaction, or a set of ranges in which changes should be
suppressed. Such ranges are represented as an array of numbers,
with each pair of two number indicating the start and end of a
range. So for example `[10, 20, 100, 110]` suppresses changes
between 10 and 20, and between 100 and 110.
*/
EditorState.changeFilter = changeFilter;
/**
Facet used to register a hook that gets a chance to update or
replace transaction specs before they are applied. This will
only be applied for transactions that don't have
[`filter`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter) set to `false`. You
can either return a single transaction spec (possibly the input
transaction), or an array of specs (which will be combined in
the same way as the arguments to
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)).

When possible, it is recommended to avoid accessing
[`Transaction.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state) in a filter,
since it will force creation of a state that will then be
discarded again, if the transaction is actually filtered.

(This functionality should be used with care. Indiscriminately
modifying transaction is likely to break something or degrade
the user experience.)
*/
EditorState.transactionFilter = transactionFilter;
/**
This is a more limited form of
[`transactionFilter`](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter),
which can only add
[annotations](https://codemirror.net/6/docs/ref/#state.TransactionSpec.annotations) and
[effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects). _But_, this type
of filter runs even the transaction has disabled regular
[filtering](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter), making it suitable
for effects that don't need to touch the changes or selection,
but do want to process every transaction.

Extenders run _after_ filters, when both are applied.
*/
EditorState.transactionExtender = transactionExtender;
Compartment.reconfigure = /*@__PURE__*/StateEffect.define();

/**
Utility function for combining behaviors to fill in a config
object from an array of provided configs. Will, by default, error
when a field gets two values that aren't `===`-equal, but you can
provide combine functions per field to do something else.
*/
function combineConfig(configs, defaults, // Should hold only the optional properties of Config, but I haven't managed to express that
combine = {}) {
    let result = {};
    for (let config of configs)
        for (let key of Object.keys(config)) {
            let value = config[key], current = result[key];
            if (current === undefined)
                result[key] = value;
            else if (current === value || value === undefined) ; // No conflict
            else if (Object.hasOwnProperty.call(combine, key))
                result[key] = combine[key](current, value);
            else
                throw new Error("Config merge conflict for field " + key);
        }
    for (let key in defaults)
        if (result[key] === undefined)
            result[key] = defaults[key];
    return result;
}

const C = "\u037c";
const COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
const SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
const top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};

// :: - Style modules encapsulate a set of CSS rules defined from
// JavaScript. Their definitions are only available in a given DOM
// root after it has been _mounted_ there with `StyleModule.mount`.
//
// Style modules should be created once and stored somewhere, as
// opposed to re-creating them every time you need them. The amount of
// CSS rules generated for a given DOM root is bounded by the amount
// of style modules that were used. So to avoid leaking rules, don't
// create these dynamically, but treat them as one-time allocations.
class StyleModule {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(spec, options) {
    this.rules = [];
    let {finish} = options || {};

    function splitSelector(selector) {
      return /^@/.test(selector) ? [selector] : selector.split(/,\s*/)
    }

    function render(selectors, spec, target, isKeyframes) {
      let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]), keyframes = isAt && isAt[1] == "keyframes";
      if (isAt && spec == null) return target.push(selectors[0] + ";")
      for (let prop in spec) {
        let value = spec[prop];
        if (/&/.test(prop)) {
          render(prop.split(/,\s*/).map(part => selectors.map(sel => part.replace(/&/, sel))).reduce((a, b) => a.concat(b)),
                 value, target);
        } else if (value && typeof value == "object") {
          if (!isAt) throw new RangeError("The value of a property (" + prop + ") should be a primitive value.")
          render(splitSelector(prop), value, local, keyframes);
        } else if (value != null) {
          local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, l => "-" + l.toLowerCase()) + ": " + value + ";");
        }
      }
      if (local.length || keyframes) {
        target.push((finish && !isAt && !isKeyframes ? selectors.map(finish) : selectors).join(", ") +
                    " {" + local.join(" ") + "}");
      }
    }

    for (let prop in spec) render(splitSelector(prop), spec[prop], this.rules);
  }

  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() { return this.rules.join("\n") }

  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let id = top[COUNT] || 1;
    top[COUNT] = id + 1;
    return C + id.toString(36)
  }

  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>)
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  static mount(root, modules) {
    (root[SET] || new StyleSet(root)).mount(Array.isArray(modules) ? modules : [modules]);
  }
}

let adoptedSet = null;

class StyleSet {
  constructor(root) {
    if (!root.head && root.adoptedStyleSheets && typeof CSSStyleSheet != "undefined") {
      if (adoptedSet) {
        root.adoptedStyleSheets = [adoptedSet.sheet].concat(root.adoptedStyleSheets);
        return root[SET] = adoptedSet
      }
      this.sheet = new CSSStyleSheet;
      root.adoptedStyleSheets = [this.sheet].concat(root.adoptedStyleSheets);
      adoptedSet = this;
    } else {
      this.styleTag = (root.ownerDocument || root).createElement("style");
      let target = root.head || root;
      target.insertBefore(this.styleTag, target.firstChild);
    }
    this.modules = [];
    root[SET] = this;
  }

  mount(modules) {
    let sheet = this.sheet;
    let pos = 0 /* Current rule offset */, j = 0; /* Index into this.modules */
    for (let i = 0; i < modules.length; i++) {
      let mod = modules[i], index = this.modules.indexOf(mod);
      if (index < j && index > -1) { // Ordering conflict
        this.modules.splice(index, 1);
        j--;
        index = -1;
      }
      if (index == -1) {
        this.modules.splice(j++, 0, mod);
        if (sheet) for (let k = 0; k < mod.rules.length; k++)
          sheet.insertRule(mod.rules[k], pos++);
      } else {
        while (j < index) pos += this.modules[j++].rules.length;
        pos += mod.rules.length;
        j++;
      }
    }

    if (!sheet) {
      let text = "";
      for (let i = 0; i < this.modules.length; i++)
        text += this.modules[i].getRules() + "\n";
      this.styleTag.textContent = text;
    }
  }
}

// Style::Object<union<Style,string>>
//
// A style is an object that, in the simple case, maps CSS property
// names to strings holding their values, as in `{color: "red",
// fontWeight: "bold"}`. The property names can be given in
// camel-case—the library will insert a dash before capital letters
// when converting them to CSS.
//
// If you include an underscore in a property name, it and everything
// after it will be removed from the output, which can be useful when
// providing a property multiple times, for browser compatibility
// reasons.
//
// A property in a style object can also be a sub-selector, which
// extends the current context to add a pseudo-selector or a child
// selector. Such a property should contain a `&` character, which
// will be replaced by the current selector. For example `{"&:before":
// {content: '"hi"'}}`. Sub-selectors and regular properties can
// freely be mixed in a given object. Any property containing a `&` is
// assumed to be a sub-selector.
//
// Finally, a property can specify an @-block to be wrapped around the
// styles defined inside the object that's the property's value. For
// example to create a media query you can do `{"@media screen and
// (min-width: 400px)": {...}}`.

/**
Each range is associated with a value, which must inherit from
this class.
*/
class RangeValue {
    /**
    Compare this value with another value. The default
    implementation compares by identity.
    */
    eq(other) { return this == other; }
    /**
    Create a [range](https://codemirror.net/6/docs/ref/#rangeset.Range) with this value.
    */
    range(from, to = from) { return new Range$1(from, to, this); }
}
RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
RangeValue.prototype.point = false;
RangeValue.prototype.mapMode = MapMode.TrackDel;
/**
A range associates a value with a range of positions.
*/
class Range$1 {
    /**
    @internal
    */
    constructor(
    /**
    The range's start position.
    */
    from, 
    /**
    Its end position.
    */
    to, 
    /**
    The value associated with this range.
    */
    value) {
        this.from = from;
        this.to = to;
        this.value = value;
    }
}
function cmpRange(a, b) {
    return a.from - b.from || a.value.startSide - b.value.startSide;
}
class Chunk {
    constructor(from, to, value, 
    // Chunks are marked with the largest point that occurs
    // in them (or -1 for no points), so that scans that are
    // only interested in points (such as the
    // heightmap-related logic) can skip range-only chunks.
    maxPoint) {
        this.from = from;
        this.to = to;
        this.value = value;
        this.maxPoint = maxPoint;
    }
    get length() { return this.to[this.to.length - 1]; }
    // Find the index of the given position and side. Use the ranges'
    // `from` pos when `end == false`, `to` when `end == true`.
    findIndex(pos, side, end, startAt = 0) {
        let arr = end ? this.to : this.from;
        for (let lo = startAt, hi = arr.length;;) {
            if (lo == hi)
                return lo;
            let mid = (lo + hi) >> 1;
            let diff = arr[mid] - pos || (end ? this.value[mid].endSide : this.value[mid].startSide) - side;
            if (mid == lo)
                return diff >= 0 ? lo : hi;
            if (diff >= 0)
                hi = mid;
            else
                lo = mid + 1;
        }
    }
    between(offset, from, to, f) {
        for (let i = this.findIndex(from, -1000000000 /* Far */, true), e = this.findIndex(to, 1000000000 /* Far */, false, i); i < e; i++)
            if (f(this.from[i] + offset, this.to[i] + offset, this.value[i]) === false)
                return false;
    }
    map(offset, changes) {
        let value = [], from = [], to = [], newPos = -1, maxPoint = -1;
        for (let i = 0; i < this.value.length; i++) {
            let val = this.value[i], curFrom = this.from[i] + offset, curTo = this.to[i] + offset, newFrom, newTo;
            if (curFrom == curTo) {
                let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
                if (mapped == null)
                    continue;
                newFrom = newTo = mapped;
            }
            else {
                newFrom = changes.mapPos(curFrom, val.startSide);
                newTo = changes.mapPos(curTo, val.endSide);
                if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
                    continue;
            }
            if ((newTo - newFrom || val.endSide - val.startSide) < 0)
                continue;
            if (newPos < 0)
                newPos = newFrom;
            if (val.point)
                maxPoint = Math.max(maxPoint, newTo - newFrom);
            value.push(val);
            from.push(newFrom - newPos);
            to.push(newTo - newPos);
        }
        return { mapped: value.length ? new Chunk(from, to, value, maxPoint) : null, pos: newPos };
    }
}
/**
A range set stores a collection of [ranges](https://codemirror.net/6/docs/ref/#rangeset.Range) in a
way that makes them efficient to [map](https://codemirror.net/6/docs/ref/#rangeset.RangeSet.map) and
[update](https://codemirror.net/6/docs/ref/#rangeset.RangeSet.update). This is an immutable data
structure.
*/
class RangeSet {
    /**
    @internal
    */
    constructor(
    /**
    @internal
    */
    chunkPos, 
    /**
    @internal
    */
    chunk, 
    /**
    @internal
    */
    nextLayer = RangeSet.empty, 
    /**
    @internal
    */
    maxPoint) {
        this.chunkPos = chunkPos;
        this.chunk = chunk;
        this.nextLayer = nextLayer;
        this.maxPoint = maxPoint;
    }
    /**
    @internal
    */
    get length() {
        let last = this.chunk.length - 1;
        return last < 0 ? 0 : Math.max(this.chunkEnd(last), this.nextLayer.length);
    }
    /**
    The number of ranges in the set.
    */
    get size() {
        if (this.isEmpty)
            return 0;
        let size = this.nextLayer.size;
        for (let chunk of this.chunk)
            size += chunk.value.length;
        return size;
    }
    /**
    @internal
    */
    chunkEnd(index) {
        return this.chunkPos[index] + this.chunk[index].length;
    }
    /**
    Update the range set, optionally adding new ranges or filtering
    out existing ones.
    
    (The extra type parameter is just there as a kludge to work
    around TypeScript variance issues that prevented `RangeSet<X>`
    from being a subtype of `RangeSet<Y>` when `X` is a subtype of
    `Y`.)
    */
    update(updateSpec) {
        let { add = [], sort = false, filterFrom = 0, filterTo = this.length } = updateSpec;
        let filter = updateSpec.filter;
        if (add.length == 0 && !filter)
            return this;
        if (sort)
            add.slice().sort(cmpRange);
        if (this.isEmpty)
            return add.length ? RangeSet.of(add) : this;
        let cur = new LayerCursor(this, null, -1).goto(0), i = 0, spill = [];
        let builder = new RangeSetBuilder();
        while (cur.value || i < add.length) {
            if (i < add.length && (cur.from - add[i].from || cur.startSide - add[i].value.startSide) >= 0) {
                let range = add[i++];
                if (!builder.addInner(range.from, range.to, range.value))
                    spill.push(range);
            }
            else if (cur.rangeIndex == 1 && cur.chunkIndex < this.chunk.length &&
                (i == add.length || this.chunkEnd(cur.chunkIndex) < add[i].from) &&
                (!filter || filterFrom > this.chunkEnd(cur.chunkIndex) || filterTo < this.chunkPos[cur.chunkIndex]) &&
                builder.addChunk(this.chunkPos[cur.chunkIndex], this.chunk[cur.chunkIndex])) {
                cur.nextChunk();
            }
            else {
                if (!filter || filterFrom > cur.to || filterTo < cur.from || filter(cur.from, cur.to, cur.value)) {
                    if (!builder.addInner(cur.from, cur.to, cur.value))
                        spill.push(new Range$1(cur.from, cur.to, cur.value));
                }
                cur.next();
            }
        }
        return builder.finishInner(this.nextLayer.isEmpty && !spill.length ? RangeSet.empty
            : this.nextLayer.update({ add: spill, filter, filterFrom, filterTo }));
    }
    /**
    Map this range set through a set of changes, return the new set.
    */
    map(changes) {
        if (changes.length == 0 || this.isEmpty)
            return this;
        let chunks = [], chunkPos = [], maxPoint = -1;
        for (let i = 0; i < this.chunk.length; i++) {
            let start = this.chunkPos[i], chunk = this.chunk[i];
            let touch = changes.touchesRange(start, start + chunk.length);
            if (touch === false) {
                maxPoint = Math.max(maxPoint, chunk.maxPoint);
                chunks.push(chunk);
                chunkPos.push(changes.mapPos(start));
            }
            else if (touch === true) {
                let { mapped, pos } = chunk.map(start, changes);
                if (mapped) {
                    maxPoint = Math.max(maxPoint, mapped.maxPoint);
                    chunks.push(mapped);
                    chunkPos.push(pos);
                }
            }
        }
        let next = this.nextLayer.map(changes);
        return chunks.length == 0 ? next : new RangeSet(chunkPos, chunks, next, maxPoint);
    }
    /**
    Iterate over the ranges that touch the region `from` to `to`,
    calling `f` for each. There is no guarantee that the ranges will
    be reported in any specific order. When the callback returns
    `false`, iteration stops.
    */
    between(from, to, f) {
        if (this.isEmpty)
            return;
        for (let i = 0; i < this.chunk.length; i++) {
            let start = this.chunkPos[i], chunk = this.chunk[i];
            if (to >= start && from <= start + chunk.length &&
                chunk.between(start, from - start, to - start, f) === false)
                return;
        }
        this.nextLayer.between(from, to, f);
    }
    /**
    Iterate over the ranges in this set, in order, including all
    ranges that end at or after `from`.
    */
    iter(from = 0) {
        return HeapCursor.from([this]).goto(from);
    }
    /**
    @internal
    */
    get isEmpty() { return this.nextLayer == this; }
    /**
    Iterate over the ranges in a collection of sets, in order,
    starting from `from`.
    */
    static iter(sets, from = 0) {
        return HeapCursor.from(sets).goto(from);
    }
    /**
    Iterate over two groups of sets, calling methods on `comparator`
    to notify it of possible differences.
    */
    static compare(oldSets, newSets, 
    /**
    This indicates how the underlying data changed between these
    ranges, and is needed to synchronize the iteration. `from` and
    `to` are coordinates in the _new_ space, after these changes.
    */
    textDiff, comparator, 
    /**
    Can be used to ignore all non-point ranges, and points below
    the given size. When -1, all ranges are compared.
    */
    minPointSize = -1) {
        let a = oldSets.filter(set => set.maxPoint >= 500 /* BigPointSize */ || !set.isEmpty && set.maxPoint >= minPointSize);
        let b = newSets.filter(set => set.maxPoint >= 500 /* BigPointSize */ || !set.isEmpty && set.maxPoint >= minPointSize);
        let sharedChunks = findSharedChunks(a, b, textDiff);
        let sideA = new SpanCursor(a, sharedChunks, minPointSize);
        let sideB = new SpanCursor(b, sharedChunks, minPointSize);
        textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
        if (textDiff.empty && textDiff.length == 0)
            compare(sideA, 0, sideB, 0, 0, comparator);
    }
    /**
    Compare the contents of two groups of range sets, returning true
    if they are equivalent in the given range.
    */
    static eq(oldSets, newSets, from = 0, to) {
        if (to == null)
            to = 1000000000 /* Far */;
        let a = oldSets.filter(set => !set.isEmpty && newSets.indexOf(set) < 0);
        let b = newSets.filter(set => !set.isEmpty && oldSets.indexOf(set) < 0);
        if (a.length != b.length)
            return false;
        if (!a.length)
            return true;
        let sharedChunks = findSharedChunks(a, b);
        let sideA = new SpanCursor(a, sharedChunks, 0).goto(from), sideB = new SpanCursor(b, sharedChunks, 0).goto(from);
        for (;;) {
            if (sideA.to != sideB.to ||
                !sameValues(sideA.active, sideB.active) ||
                sideA.point && (!sideB.point || !sideA.point.eq(sideB.point)))
                return false;
            if (sideA.to > to)
                return true;
            sideA.next();
            sideB.next();
        }
    }
    /**
    Iterate over a group of range sets at the same time, notifying
    the iterator about the ranges covering every given piece of
    content. Returns the open count (see
    [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#rangeset.SpanIterator.span)) at the end
    of the iteration.
    */
    static spans(sets, from, to, iterator, 
    /**
    When given and greater than -1, only points of at least this
    size are taken into account.
    */
    minPointSize = -1) {
        let cursor = new SpanCursor(sets, null, minPointSize).goto(from), pos = from;
        let open = cursor.openStart;
        for (;;) {
            let curTo = Math.min(cursor.to, to);
            if (cursor.point) {
                iterator.point(pos, curTo, cursor.point, cursor.activeForPoint(cursor.to), open);
                open = cursor.openEnd(curTo) + (cursor.to > curTo ? 1 : 0);
            }
            else if (curTo > pos) {
                iterator.span(pos, curTo, cursor.active, open);
                open = cursor.openEnd(curTo);
            }
            if (cursor.to > to)
                break;
            pos = cursor.to;
            cursor.next();
        }
        return open;
    }
    /**
    Create a range set for the given range or array of ranges. By
    default, this expects the ranges to be _sorted_ (by start
    position and, if two start at the same position,
    `value.startSide`). You can pass `true` as second argument to
    cause the method to sort them.
    */
    static of(ranges, sort = false) {
        let build = new RangeSetBuilder();
        for (let range of ranges instanceof Range$1 ? [ranges] : sort ? lazySort(ranges) : ranges)
            build.add(range.from, range.to, range.value);
        return build.finish();
    }
}
/**
The empty set of ranges.
*/
RangeSet.empty = /*@__PURE__*/new RangeSet([], [], null, -1);
function lazySort(ranges) {
    if (ranges.length > 1)
        for (let prev = ranges[0], i = 1; i < ranges.length; i++) {
            let cur = ranges[i];
            if (cmpRange(prev, cur) > 0)
                return ranges.slice().sort(cmpRange);
            prev = cur;
        }
    return ranges;
}
RangeSet.empty.nextLayer = RangeSet.empty;
/**
A range set builder is a data structure that helps build up a
[range set](https://codemirror.net/6/docs/ref/#rangeset.RangeSet) directly, without first allocating
an array of [`Range`](https://codemirror.net/6/docs/ref/#rangeset.Range) objects.
*/
class RangeSetBuilder {
    /**
    Create an empty builder.
    */
    constructor() {
        this.chunks = [];
        this.chunkPos = [];
        this.chunkStart = -1;
        this.last = null;
        this.lastFrom = -1000000000 /* Far */;
        this.lastTo = -1000000000 /* Far */;
        this.from = [];
        this.to = [];
        this.value = [];
        this.maxPoint = -1;
        this.setMaxPoint = -1;
        this.nextLayer = null;
    }
    finishChunk(newArrays) {
        this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
        this.chunkPos.push(this.chunkStart);
        this.chunkStart = -1;
        this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
        this.maxPoint = -1;
        if (newArrays) {
            this.from = [];
            this.to = [];
            this.value = [];
        }
    }
    /**
    Add a range. Ranges should be added in sorted (by `from` and
    `value.startSide`) order.
    */
    add(from, to, value) {
        if (!this.addInner(from, to, value))
            (this.nextLayer || (this.nextLayer = new RangeSetBuilder)).add(from, to, value);
    }
    /**
    @internal
    */
    addInner(from, to, value) {
        let diff = from - this.lastTo || value.startSide - this.last.endSide;
        if (diff <= 0 && (from - this.lastFrom || value.startSide - this.last.startSide) < 0)
            throw new Error("Ranges must be added sorted by `from` position and `startSide`");
        if (diff < 0)
            return false;
        if (this.from.length == 250 /* ChunkSize */)
            this.finishChunk(true);
        if (this.chunkStart < 0)
            this.chunkStart = from;
        this.from.push(from - this.chunkStart);
        this.to.push(to - this.chunkStart);
        this.last = value;
        this.lastFrom = from;
        this.lastTo = to;
        this.value.push(value);
        if (value.point)
            this.maxPoint = Math.max(this.maxPoint, to - from);
        return true;
    }
    /**
    @internal
    */
    addChunk(from, chunk) {
        if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
            return false;
        if (this.from.length)
            this.finishChunk(true);
        this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
        this.chunks.push(chunk);
        this.chunkPos.push(from);
        let last = chunk.value.length - 1;
        this.last = chunk.value[last];
        this.lastFrom = chunk.from[last] + from;
        this.lastTo = chunk.to[last] + from;
        return true;
    }
    /**
    Finish the range set. Returns the new set. The builder can't be
    used anymore after this has been called.
    */
    finish() { return this.finishInner(RangeSet.empty); }
    /**
    @internal
    */
    finishInner(next) {
        if (this.from.length)
            this.finishChunk(false);
        if (this.chunks.length == 0)
            return next;
        let result = new RangeSet(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
        this.from = null; // Make sure further `add` calls produce errors
        return result;
    }
}
function findSharedChunks(a, b, textDiff) {
    let inA = new Map();
    for (let set of a)
        for (let i = 0; i < set.chunk.length; i++)
            if (set.chunk[i].maxPoint < 500 /* BigPointSize */)
                inA.set(set.chunk[i], set.chunkPos[i]);
    let shared = new Set();
    for (let set of b)
        for (let i = 0; i < set.chunk.length; i++) {
            let known = inA.get(set.chunk[i]);
            if (known != null && (textDiff ? textDiff.mapPos(known) : known) == set.chunkPos[i])
                shared.add(set.chunk[i]);
        }
    return shared;
}
class LayerCursor {
    constructor(layer, skip, minPoint, rank = 0) {
        this.layer = layer;
        this.skip = skip;
        this.minPoint = minPoint;
        this.rank = rank;
    }
    get startSide() { return this.value ? this.value.startSide : 0; }
    get endSide() { return this.value ? this.value.endSide : 0; }
    goto(pos, side = -1000000000 /* Far */) {
        this.chunkIndex = this.rangeIndex = 0;
        this.gotoInner(pos, side, false);
        return this;
    }
    gotoInner(pos, side, forward) {
        while (this.chunkIndex < this.layer.chunk.length) {
            let next = this.layer.chunk[this.chunkIndex];
            if (!(this.skip && this.skip.has(next) ||
                this.layer.chunkEnd(this.chunkIndex) < pos ||
                next.maxPoint < this.minPoint))
                break;
            this.chunkIndex++;
            forward = false;
        }
        if (this.chunkIndex < this.layer.chunk.length) {
            let rangeIndex = this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], side, true);
            if (!forward || this.rangeIndex < rangeIndex)
                this.setRangeIndex(rangeIndex);
        }
        this.next();
    }
    forward(pos, side) {
        if ((this.to - pos || this.endSide - side) < 0)
            this.gotoInner(pos, side, true);
    }
    next() {
        for (;;) {
            if (this.chunkIndex == this.layer.chunk.length) {
                this.from = this.to = 1000000000 /* Far */;
                this.value = null;
                break;
            }
            else {
                let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
                let from = chunkPos + chunk.from[this.rangeIndex];
                this.from = from;
                this.to = chunkPos + chunk.to[this.rangeIndex];
                this.value = chunk.value[this.rangeIndex];
                this.setRangeIndex(this.rangeIndex + 1);
                if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
                    break;
            }
        }
    }
    setRangeIndex(index) {
        if (index == this.layer.chunk[this.chunkIndex].value.length) {
            this.chunkIndex++;
            if (this.skip) {
                while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
                    this.chunkIndex++;
            }
            this.rangeIndex = 0;
        }
        else {
            this.rangeIndex = index;
        }
    }
    nextChunk() {
        this.chunkIndex++;
        this.rangeIndex = 0;
        this.next();
    }
    compare(other) {
        return this.from - other.from || this.startSide - other.startSide || this.to - other.to || this.endSide - other.endSide;
    }
}
class HeapCursor {
    constructor(heap) {
        this.heap = heap;
    }
    static from(sets, skip = null, minPoint = -1) {
        let heap = [];
        for (let i = 0; i < sets.length; i++) {
            for (let cur = sets[i]; !cur.isEmpty; cur = cur.nextLayer) {
                if (cur.maxPoint >= minPoint)
                    heap.push(new LayerCursor(cur, skip, minPoint, i));
            }
        }
        return heap.length == 1 ? heap[0] : new HeapCursor(heap);
    }
    get startSide() { return this.value ? this.value.startSide : 0; }
    goto(pos, side = -1000000000 /* Far */) {
        for (let cur of this.heap)
            cur.goto(pos, side);
        for (let i = this.heap.length >> 1; i >= 0; i--)
            heapBubble(this.heap, i);
        this.next();
        return this;
    }
    forward(pos, side) {
        for (let cur of this.heap)
            cur.forward(pos, side);
        for (let i = this.heap.length >> 1; i >= 0; i--)
            heapBubble(this.heap, i);
        if ((this.to - pos || this.value.endSide - side) < 0)
            this.next();
    }
    next() {
        if (this.heap.length == 0) {
            this.from = this.to = 1000000000 /* Far */;
            this.value = null;
            this.rank = -1;
        }
        else {
            let top = this.heap[0];
            this.from = top.from;
            this.to = top.to;
            this.value = top.value;
            this.rank = top.rank;
            if (top.value)
                top.next();
            heapBubble(this.heap, 0);
        }
    }
}
function heapBubble(heap, index) {
    for (let cur = heap[index];;) {
        let childIndex = (index << 1) + 1;
        if (childIndex >= heap.length)
            break;
        let child = heap[childIndex];
        if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
            child = heap[childIndex + 1];
            childIndex++;
        }
        if (cur.compare(child) < 0)
            break;
        heap[childIndex] = cur;
        heap[index] = child;
        index = childIndex;
    }
}
class SpanCursor {
    constructor(sets, skip, minPoint) {
        this.minPoint = minPoint;
        this.active = [];
        this.activeTo = [];
        this.activeRank = [];
        this.minActive = -1;
        // A currently active point range, if any
        this.point = null;
        this.pointFrom = 0;
        this.pointRank = 0;
        this.to = -1000000000 /* Far */;
        this.endSide = 0;
        this.openStart = -1;
        this.cursor = HeapCursor.from(sets, skip, minPoint);
    }
    goto(pos, side = -1000000000 /* Far */) {
        this.cursor.goto(pos, side);
        this.active.length = this.activeTo.length = this.activeRank.length = 0;
        this.minActive = -1;
        this.to = pos;
        this.endSide = side;
        this.openStart = -1;
        this.next();
        return this;
    }
    forward(pos, side) {
        while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
            this.removeActive(this.minActive);
        this.cursor.forward(pos, side);
    }
    removeActive(index) {
        remove(this.active, index);
        remove(this.activeTo, index);
        remove(this.activeRank, index);
        this.minActive = findMinIndex(this.active, this.activeTo);
    }
    addActive(trackOpen) {
        let i = 0, { value, to, rank } = this.cursor;
        while (i < this.activeRank.length && this.activeRank[i] <= rank)
            i++;
        insert(this.active, i, value);
        insert(this.activeTo, i, to);
        insert(this.activeRank, i, rank);
        if (trackOpen)
            insert(trackOpen, i, this.cursor.from);
        this.minActive = findMinIndex(this.active, this.activeTo);
    }
    // After calling this, if `this.point` != null, the next range is a
    // point. Otherwise, it's a regular range, covered by `this.active`.
    next() {
        let from = this.to, wasPoint = this.point;
        this.point = null;
        let trackOpen = this.openStart < 0 ? [] : null, trackExtra = 0;
        for (;;) {
            let a = this.minActive;
            if (a > -1 && (this.activeTo[a] - this.cursor.from || this.active[a].endSide - this.cursor.startSide) < 0) {
                if (this.activeTo[a] > from) {
                    this.to = this.activeTo[a];
                    this.endSide = this.active[a].endSide;
                    break;
                }
                this.removeActive(a);
                if (trackOpen)
                    remove(trackOpen, a);
            }
            else if (!this.cursor.value) {
                this.to = this.endSide = 1000000000 /* Far */;
                break;
            }
            else if (this.cursor.from > from) {
                this.to = this.cursor.from;
                this.endSide = this.cursor.startSide;
                break;
            }
            else {
                let nextVal = this.cursor.value;
                if (!nextVal.point) { // Opening a range
                    this.addActive(trackOpen);
                    this.cursor.next();
                }
                else if (wasPoint && this.cursor.to == this.to && this.cursor.from < this.cursor.to && nextVal.endSide == this.endSide) {
                    // Ignore any non-empty points that end precisely at the end of the prev point
                    this.cursor.next();
                }
                else { // New point
                    this.point = nextVal;
                    this.pointFrom = this.cursor.from;
                    this.pointRank = this.cursor.rank;
                    this.to = this.cursor.to;
                    this.endSide = nextVal.endSide;
                    if (this.cursor.from < from)
                        trackExtra = 1;
                    this.cursor.next();
                    if (this.to > from)
                        this.forward(this.to, this.endSide);
                    break;
                }
            }
        }
        if (trackOpen) {
            let openStart = 0;
            while (openStart < trackOpen.length && trackOpen[openStart] < from)
                openStart++;
            this.openStart = openStart + trackExtra;
        }
    }
    activeForPoint(to) {
        if (!this.active.length)
            return this.active;
        let active = [];
        for (let i = this.active.length - 1; i >= 0; i--) {
            if (this.activeRank[i] < this.pointRank)
                break;
            if (this.activeTo[i] > to || this.activeTo[i] == to && this.active[i].endSide >= this.point.endSide)
                active.push(this.active[i]);
        }
        return active.reverse();
    }
    openEnd(to) {
        let open = 0;
        for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > to; i--)
            open++;
        return open;
    }
}
function compare(a, startA, b, startB, length, comparator) {
    a.goto(startA);
    b.goto(startB);
    let endB = startB + length;
    let pos = startB, dPos = startB - startA;
    for (;;) {
        let diff = (a.to + dPos) - b.to || a.endSide - b.endSide;
        let end = diff < 0 ? a.to + dPos : b.to, clipEnd = Math.min(end, endB);
        if (a.point || b.point) {
            if (!(a.point && b.point && (a.point == b.point || a.point.eq(b.point)) &&
                sameValues(a.activeForPoint(a.to + dPos), b.activeForPoint(b.to))))
                comparator.comparePoint(pos, clipEnd, a.point, b.point);
        }
        else {
            if (clipEnd > pos && !sameValues(a.active, b.active))
                comparator.compareRange(pos, clipEnd, a.active, b.active);
        }
        if (end > endB)
            break;
        pos = end;
        if (diff <= 0)
            a.next();
        if (diff >= 0)
            b.next();
    }
}
function sameValues(a, b) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (a[i] != b[i] && !a[i].eq(b[i]))
            return false;
    return true;
}
function remove(array, index) {
    for (let i = index, e = array.length - 1; i < e; i++)
        array[i] = array[i + 1];
    array.pop();
}
function insert(array, index, value) {
    for (let i = array.length - 1; i >= index; i--)
        array[i + 1] = array[i];
    array[index] = value;
}
function findMinIndex(value, array) {
    let found = -1, foundPos = 1000000000 /* Far */;
    for (let i = 0; i < array.length; i++)
        if ((array[i] - foundPos || value[i].endSide - value[found].endSide) < 0) {
            found = i;
            foundPos = array[i];
        }
    return found;
}

var base = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'",
  229: "q"
};

var shift = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: "\"",
  229: "Q"
};

var chrome$1 = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
var safari$1 = typeof navigator != "undefined" && /Apple Computer/.test(navigator.vendor);
var gecko$1 = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent);
var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
var ie$1 = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
var brokenModifierNames = chrome$1 && (mac || +chrome$1[1] < 57) || gecko$1 && mac;

// Fill in the digit keys
for (var i = 0; i < 10; i++) base[48 + i] = base[96 + i] = String(i);

// The function keys
for (var i = 1; i <= 24; i++) base[i + 111] = "F" + i;

// And the alphabetic keys
for (var i = 65; i <= 90; i++) {
  base[i] = String.fromCharCode(i + 32);
  shift[i] = String.fromCharCode(i);
}

// For each code that doesn't have a shift-equivalent, copy the base name
for (var code$1 in base) if (!shift.hasOwnProperty(code$1)) shift[code$1] = base[code$1];

function keyName(event) {
  // Don't trust event.key in Chrome when there are modifiers until
  // they fix https://bugs.chromium.org/p/chromium/issues/detail?id=633838
  var ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) ||
    (safari$1 || ie$1) && event.shiftKey && event.key && event.key.length == 1;
  var name = (!ignoreKey && event.key) ||
    (event.shiftKey ? shift : base)[event.keyCode] ||
    event.key || "Unidentified";
  // Edge sometimes produces wrong names (Issue #3)
  if (name == "Esc") name = "Escape";
  if (name == "Del") name = "Delete";
  // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8860571/
  if (name == "Left") name = "ArrowLeft";
  if (name == "Up") name = "ArrowUp";
  if (name == "Right") name = "ArrowRight";
  if (name == "Down") name = "ArrowDown";
  return name
}

function getSelection(root) {
    let target;
    // Browsers differ on whether shadow roots have a getSelection
    // method. If it exists, use that, otherwise, call it on the
    // document.
    if (root.nodeType == 11) { // Shadow root
        target = root.getSelection ? root : root.ownerDocument;
    }
    else {
        target = root;
    }
    return target.getSelection();
}
function contains(dom, node) {
    return node ? dom.contains(node.nodeType != 1 ? node.parentNode : node) : false;
}
function deepActiveElement() {
    let elt = document.activeElement;
    while (elt && elt.shadowRoot)
        elt = elt.shadowRoot.activeElement;
    return elt;
}
function hasSelection(dom, selection) {
    if (!selection.anchorNode)
        return false;
    try {
        // Firefox will raise 'permission denied' errors when accessing
        // properties of `sel.anchorNode` when it's in a generated CSS
        // element.
        return contains(dom, selection.anchorNode);
    }
    catch (_) {
        return false;
    }
}
function clientRectsFor(dom) {
    if (dom.nodeType == 3)
        return textRange(dom, 0, dom.nodeValue.length).getClientRects();
    else if (dom.nodeType == 1)
        return dom.getClientRects();
    else
        return [];
}
// Scans forward and backward through DOM positions equivalent to the
// given one to see if the two are in the same place (i.e. after a
// text node vs at the end of that text node)
function isEquivalentPosition(node, off, targetNode, targetOff) {
    return targetNode ? (scanFor(node, off, targetNode, targetOff, -1) ||
        scanFor(node, off, targetNode, targetOff, 1)) : false;
}
function domIndex(node) {
    for (var index = 0;; index++) {
        node = node.previousSibling;
        if (!node)
            return index;
    }
}
function scanFor(node, off, targetNode, targetOff, dir) {
    for (;;) {
        if (node == targetNode && off == targetOff)
            return true;
        if (off == (dir < 0 ? 0 : maxOffset(node))) {
            if (node.nodeName == "DIV")
                return false;
            let parent = node.parentNode;
            if (!parent || parent.nodeType != 1)
                return false;
            off = domIndex(node) + (dir < 0 ? 0 : 1);
            node = parent;
        }
        else if (node.nodeType == 1) {
            node = node.childNodes[off + (dir < 0 ? -1 : 0)];
            if (node.nodeType == 1 && node.contentEditable == "false")
                return false;
            off = dir < 0 ? maxOffset(node) : 0;
        }
        else {
            return false;
        }
    }
}
function maxOffset(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
}
const Rect0 = { left: 0, right: 0, top: 0, bottom: 0 };
function flattenRect(rect, left) {
    let x = left ? rect.left : rect.right;
    return { left: x, right: x, top: rect.top, bottom: rect.bottom };
}
function windowRect(win) {
    return { left: 0, right: win.innerWidth,
        top: 0, bottom: win.innerHeight };
}
const ScrollSpace = 5;
function scrollRectIntoView(dom, rect, side, center) {
    let doc = dom.ownerDocument, win = doc.defaultView;
    for (let cur = dom; cur;) {
        if (cur.nodeType == 1) { // Element
            let bounding, top = cur == doc.body;
            if (top) {
                bounding = windowRect(win);
            }
            else {
                if (cur.scrollHeight <= cur.clientHeight && cur.scrollWidth <= cur.clientWidth) {
                    cur = cur.parentNode;
                    continue;
                }
                let rect = cur.getBoundingClientRect();
                // Make sure scrollbar width isn't included in the rectangle
                bounding = { left: rect.left, right: rect.left + cur.clientWidth,
                    top: rect.top, bottom: rect.top + cur.clientHeight };
            }
            let moveX = 0, moveY = 0;
            if (center) {
                let rectHeight = rect.bottom - rect.top, boundingHeight = bounding.bottom - bounding.top;
                let targetTop;
                if (rectHeight <= boundingHeight)
                    targetTop = rect.top + rectHeight / 2 - boundingHeight / 2;
                else if (side < 0)
                    targetTop = rect.top - ScrollSpace;
                else
                    targetTop = rect.bottom + ScrollSpace - boundingHeight;
                moveY = targetTop - bounding.top;
                if (Math.abs(moveY) <= 1)
                    moveY = 0;
            }
            else if (rect.top < bounding.top) {
                moveY = -(bounding.top - rect.top + ScrollSpace);
                if (side > 0 && rect.bottom > bounding.bottom + moveY)
                    moveY = rect.bottom - bounding.bottom + moveY + ScrollSpace;
            }
            else if (rect.bottom > bounding.bottom) {
                moveY = rect.bottom - bounding.bottom + ScrollSpace;
                if (side < 0 && (rect.top - moveY) < bounding.top)
                    moveY = -(bounding.top + moveY - rect.top + ScrollSpace);
            }
            if (rect.left < bounding.left) {
                moveX = -(bounding.left - rect.left + ScrollSpace);
                if (side > 0 && rect.right > bounding.right + moveX)
                    moveX = rect.right - bounding.right + moveX + ScrollSpace;
            }
            else if (rect.right > bounding.right) {
                moveX = rect.right - bounding.right + ScrollSpace;
                if (side < 0 && rect.left < bounding.left + moveX)
                    moveX = -(bounding.left + moveX - rect.left + ScrollSpace);
            }
            if (moveX || moveY) {
                if (top) {
                    win.scrollBy(moveX, moveY);
                }
                else {
                    if (moveY) {
                        let start = cur.scrollTop;
                        cur.scrollTop += moveY;
                        moveY = cur.scrollTop - start;
                    }
                    if (moveX) {
                        let start = cur.scrollLeft;
                        cur.scrollLeft += moveX;
                        moveX = cur.scrollLeft - start;
                    }
                    rect = { left: rect.left - moveX, top: rect.top - moveY,
                        right: rect.right - moveX, bottom: rect.bottom - moveY };
                }
            }
            if (top)
                break;
            cur = cur.assignedSlot || cur.parentNode;
            center = false;
        }
        else if (cur.nodeType == 11) { // A shadow root
            cur = cur.host;
        }
        else {
            break;
        }
    }
}
class DOMSelection {
    constructor() {
        this.anchorNode = null;
        this.anchorOffset = 0;
        this.focusNode = null;
        this.focusOffset = 0;
    }
    eq(domSel) {
        return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset &&
            this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
    }
    set(domSel) {
        this.anchorNode = domSel.anchorNode;
        this.anchorOffset = domSel.anchorOffset;
        this.focusNode = domSel.focusNode;
        this.focusOffset = domSel.focusOffset;
    }
}
let preventScrollSupported = null;
// Feature-detects support for .focus({preventScroll: true}), and uses
// a fallback kludge when not supported.
function focusPreventScroll(dom) {
    if (dom.setActive)
        return dom.setActive(); // in IE
    if (preventScrollSupported)
        return dom.focus(preventScrollSupported);
    let stack = [];
    for (let cur = dom; cur; cur = cur.parentNode) {
        stack.push(cur, cur.scrollTop, cur.scrollLeft);
        if (cur == cur.ownerDocument)
            break;
    }
    dom.focus(preventScrollSupported == null ? {
        get preventScroll() {
            preventScrollSupported = { preventScroll: true };
            return true;
        }
    } : undefined);
    if (!preventScrollSupported) {
        preventScrollSupported = false;
        for (let i = 0; i < stack.length;) {
            let elt = stack[i++], top = stack[i++], left = stack[i++];
            if (elt.scrollTop != top)
                elt.scrollTop = top;
            if (elt.scrollLeft != left)
                elt.scrollLeft = left;
        }
    }
}
let scratchRange;
function textRange(node, from, to = from) {
    let range = scratchRange || (scratchRange = document.createRange());
    range.setEnd(node, to);
    range.setStart(node, from);
    return range;
}
function dispatchKey(elt, name, code) {
    let options = { key: name, code: name, keyCode: code, which: code, cancelable: true };
    let down = new KeyboardEvent("keydown", options);
    down.synthetic = true;
    elt.dispatchEvent(down);
    let up = new KeyboardEvent("keyup", options);
    up.synthetic = true;
    elt.dispatchEvent(up);
    return down.defaultPrevented || up.defaultPrevented;
}
function getRoot(node) {
    while (node) {
        if (node && (node.nodeType == 9 || node.nodeType == 11 && node.host))
            return node;
        node = node.assignedSlot || node.parentNode;
    }
    return null;
}

class DOMPos {
    constructor(node, offset, precise = true) {
        this.node = node;
        this.offset = offset;
        this.precise = precise;
    }
    static before(dom, precise) { return new DOMPos(dom.parentNode, domIndex(dom), precise); }
    static after(dom, precise) { return new DOMPos(dom.parentNode, domIndex(dom) + 1, precise); }
}
const none$3 = [];
class ContentView {
    constructor() {
        this.parent = null;
        this.dom = null;
        this.dirty = 2 /* Node */;
    }
    get editorView() {
        if (!this.parent)
            throw new Error("Accessing view in orphan content view");
        return this.parent.editorView;
    }
    get overrideDOMText() { return null; }
    get posAtStart() {
        return this.parent ? this.parent.posBefore(this) : 0;
    }
    get posAtEnd() {
        return this.posAtStart + this.length;
    }
    posBefore(view) {
        let pos = this.posAtStart;
        for (let child of this.children) {
            if (child == view)
                return pos;
            pos += child.length + child.breakAfter;
        }
        throw new RangeError("Invalid child in posBefore");
    }
    posAfter(view) {
        return this.posBefore(view) + view.length;
    }
    // Will return a rectangle directly before (when side < 0), after
    // (side > 0) or directly on (when the browser supports it) the
    // given position.
    coordsAt(_pos, _side) { return null; }
    sync(track) {
        var _a;
        if (this.dirty & 2 /* Node */) {
            let parent = this.dom;
            let pos = parent.firstChild;
            for (let child of this.children) {
                if (child.dirty) {
                    if (!child.dom && pos && !((_a = ContentView.get(pos)) === null || _a === void 0 ? void 0 : _a.parent))
                        child.reuseDOM(pos);
                    child.sync(track);
                    child.dirty = 0 /* Not */;
                }
                if (track && !track.written && track.node == parent && pos != child.dom)
                    track.written = true;
                if (child.dom.parentNode == parent) {
                    while (pos && pos != child.dom)
                        pos = rm(pos);
                    pos = child.dom.nextSibling;
                }
                else {
                    parent.insertBefore(child.dom, pos);
                }
            }
            if (pos && track && track.node == parent)
                track.written = true;
            while (pos)
                pos = rm(pos);
        }
        else if (this.dirty & 1 /* Child */) {
            for (let child of this.children)
                if (child.dirty) {
                    child.sync(track);
                    child.dirty = 0 /* Not */;
                }
        }
    }
    reuseDOM(_dom) { return false; }
    localPosFromDOM(node, offset) {
        let after;
        if (node == this.dom) {
            after = this.dom.childNodes[offset];
        }
        else {
            let bias = maxOffset(node) == 0 ? 0 : offset == 0 ? -1 : 1;
            for (;;) {
                let parent = node.parentNode;
                if (parent == this.dom)
                    break;
                if (bias == 0 && parent.firstChild != parent.lastChild) {
                    if (node == parent.firstChild)
                        bias = -1;
                    else
                        bias = 1;
                }
                node = parent;
            }
            if (bias < 0)
                after = node;
            else
                after = node.nextSibling;
        }
        if (after == this.dom.firstChild)
            return 0;
        while (after && !ContentView.get(after))
            after = after.nextSibling;
        if (!after)
            return this.length;
        for (let i = 0, pos = 0;; i++) {
            let child = this.children[i];
            if (child.dom == after)
                return pos;
            pos += child.length + child.breakAfter;
        }
    }
    domBoundsAround(from, to, offset = 0) {
        let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
        for (let i = 0, pos = offset, prevEnd = offset; i < this.children.length; i++) {
            let child = this.children[i], end = pos + child.length;
            if (pos < from && end > to)
                return child.domBoundsAround(from, to, pos);
            if (end >= from && fromI == -1) {
                fromI = i;
                fromStart = pos;
            }
            if (pos > to && child.dom.parentNode == this.dom) {
                toI = i;
                toEnd = prevEnd;
                break;
            }
            prevEnd = end;
            pos = end + child.breakAfter;
        }
        return { from: fromStart, to: toEnd < 0 ? offset + this.length : toEnd,
            startDOM: (fromI ? this.children[fromI - 1].dom.nextSibling : null) || this.dom.firstChild,
            endDOM: toI < this.children.length && toI >= 0 ? this.children[toI].dom : null };
    }
    markDirty(andParent = false) {
        this.dirty |= 2 /* Node */;
        this.markParentsDirty(andParent);
    }
    markParentsDirty(childList) {
        for (let parent = this.parent; parent; parent = parent.parent) {
            if (childList)
                parent.dirty |= 2 /* Node */;
            if (parent.dirty & 1 /* Child */)
                return;
            parent.dirty |= 1 /* Child */;
            childList = false;
        }
    }
    setParent(parent) {
        if (this.parent != parent) {
            this.parent = parent;
            if (this.dirty)
                this.markParentsDirty(true);
        }
    }
    setDOM(dom) {
        if (this.dom)
            this.dom.cmView = null;
        this.dom = dom;
        dom.cmView = this;
    }
    get rootView() {
        for (let v = this;;) {
            let parent = v.parent;
            if (!parent)
                return v;
            v = parent;
        }
    }
    replaceChildren(from, to, children = none$3) {
        this.markDirty();
        for (let i = from; i < to; i++) {
            let child = this.children[i];
            if (child.parent == this)
                child.parent = null;
        }
        this.children.splice(from, to - from, ...children);
        for (let i = 0; i < children.length; i++)
            children[i].setParent(this);
    }
    ignoreMutation(_rec) { return false; }
    ignoreEvent(_event) { return false; }
    childCursor(pos = this.length) {
        return new ChildCursor(this.children, pos, this.children.length);
    }
    childPos(pos, bias = 1) {
        return this.childCursor().findPos(pos, bias);
    }
    toString() {
        let name = this.constructor.name.replace("View", "");
        return name + (this.children.length ? "(" + this.children.join() + ")" :
            this.length ? "[" + (name == "Text" ? this.text : this.length) + "]" : "") +
            (this.breakAfter ? "#" : "");
    }
    static get(node) { return node.cmView; }
    get isEditable() { return true; }
}
ContentView.prototype.breakAfter = 0;
// Remove a DOM node and return its next sibling.
function rm(dom) {
    let next = dom.nextSibling;
    dom.parentNode.removeChild(dom);
    return next;
}
class ChildCursor {
    constructor(children, pos, i) {
        this.children = children;
        this.pos = pos;
        this.i = i;
        this.off = 0;
    }
    findPos(pos, bias = 1) {
        for (;;) {
            if (pos > this.pos || pos == this.pos &&
                (bias > 0 || this.i == 0 || this.children[this.i - 1].breakAfter)) {
                this.off = pos - this.pos;
                return this;
            }
            let next = this.children[--this.i];
            this.pos -= next.length + next.breakAfter;
        }
    }
}

let [nav, doc] = typeof navigator != "undefined"
    ? [navigator, document]
    : [{ userAgent: "", vendor: "", platform: "" }, { documentElement: { style: {} } }];
const ie_edge = /*@__PURE__*//Edge\/(\d+)/.exec(nav.userAgent);
const ie_upto10 = /*@__PURE__*//MSIE \d/.test(nav.userAgent);
const ie_11up = /*@__PURE__*//Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
const ie = !!(ie_upto10 || ie_11up || ie_edge);
const gecko = !ie && /*@__PURE__*//gecko\/(\d+)/i.test(nav.userAgent);
const chrome = !ie && /*@__PURE__*//Chrome\/(\d+)/.exec(nav.userAgent);
const webkit = "webkitFontSmoothing" in doc.documentElement.style;
const safari = !ie && /*@__PURE__*//Apple Computer/.test(nav.vendor);
const ios = safari && (/*@__PURE__*//Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2);
var browser = {
    mac: ios || /*@__PURE__*//Mac/.test(nav.platform),
    windows: /*@__PURE__*//Win/.test(nav.platform),
    linux: /*@__PURE__*//Linux|X11/.test(nav.platform),
    ie,
    ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
    gecko,
    gecko_version: gecko ? +(/*@__PURE__*//Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
    chrome: !!chrome,
    chrome_version: chrome ? +chrome[1] : 0,
    ios,
    android: /*@__PURE__*//Android\b/.test(nav.userAgent),
    webkit,
    safari,
    webkit_version: webkit ? +(/*@__PURE__*//\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
    tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};

const none$2 = [];
class InlineView extends ContentView {
    /**
    Return true when this view is equivalent to `other` and can take
    on its role.
    */
    become(_other) { return false; }
    // When this is a zero-length view with a side, this should return a
    // negative number to indicate it is before its position, or a
    // positive number when after its position.
    getSide() { return 0; }
}
InlineView.prototype.children = none$2;
const MaxJoinLen = 256;
class TextView extends InlineView {
    constructor(text) {
        super();
        this.text = text;
    }
    get length() { return this.text.length; }
    createDOM(textDOM) {
        this.setDOM(textDOM || document.createTextNode(this.text));
    }
    sync(track) {
        if (!this.dom)
            this.createDOM();
        if (this.dom.nodeValue != this.text) {
            if (track && track.node == this.dom)
                track.written = true;
            this.dom.nodeValue = this.text;
        }
    }
    reuseDOM(dom) {
        if (dom.nodeType != 3)
            return false;
        this.createDOM(dom);
        return true;
    }
    merge(from, to, source) {
        if (source && (!(source instanceof TextView) || this.length - (to - from) + source.length > MaxJoinLen))
            return false;
        this.text = this.text.slice(0, from) + (source ? source.text : "") + this.text.slice(to);
        this.markDirty();
        return true;
    }
    slice(from) {
        let result = new TextView(this.text.slice(from));
        this.text = this.text.slice(0, from);
        return result;
    }
    localPosFromDOM(node, offset) {
        return node == this.dom ? offset : offset ? this.text.length : 0;
    }
    domAtPos(pos) { return new DOMPos(this.dom, pos); }
    domBoundsAround(_from, _to, offset) {
        return { from: offset, to: offset + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
    }
    coordsAt(pos, side) {
        return textCoords(this.dom, pos, side);
    }
}
class MarkView extends InlineView {
    constructor(mark, children = [], length = 0) {
        super();
        this.mark = mark;
        this.children = children;
        this.length = length;
        for (let ch of children)
            ch.setParent(this);
    }
    createDOM() {
        let dom = document.createElement(this.mark.tagName);
        if (this.mark.class)
            dom.className = this.mark.class;
        if (this.mark.attrs)
            for (let name in this.mark.attrs)
                dom.setAttribute(name, this.mark.attrs[name]);
        this.setDOM(dom);
    }
    sync(track) {
        if (!this.dom || (this.dirty & 4 /* Attrs */))
            this.createDOM();
        super.sync(track);
    }
    merge(from, to, source, openStart, openEnd) {
        if (source && (!(source instanceof MarkView && source.mark.eq(this.mark)) ||
            (from && openStart <= 0) || (to < this.length && openEnd <= 0)))
            return false;
        mergeInlineChildren(this, from, to, source ? source.children : none$2, openStart - 1, openEnd - 1);
        this.markDirty();
        return true;
    }
    slice(from) {
        let result = [], off = 0, detachFrom = -1, i = 0;
        for (let elt of this.children) {
            let end = off + elt.length;
            if (end > from)
                result.push(off < from ? elt.slice(from - off) : elt);
            if (detachFrom < 0 && off >= from)
                detachFrom = i;
            off = end;
            i++;
        }
        let length = this.length - from;
        this.length = from;
        if (detachFrom > -1)
            this.replaceChildren(detachFrom, this.children.length);
        return new MarkView(this.mark, result, length);
    }
    domAtPos(pos) {
        return inlineDOMAtPos(this.dom, this.children, pos);
    }
    coordsAt(pos, side) {
        return coordsInChildren(this, pos, side);
    }
}
function textCoords(text, pos, side) {
    let length = text.nodeValue.length;
    if (pos > length)
        pos = length;
    let from = pos, to = pos, flatten = 0;
    if (pos == 0 && side < 0 || pos == length && side >= 0) {
        if (!(browser.chrome || browser.gecko)) { // These browsers reliably return valid rectangles for empty ranges
            if (pos) {
                from--;
                flatten = 1;
            } // FIXME this is wrong in RTL text
            else {
                to++;
                flatten = -1;
            }
        }
    }
    else {
        if (side < 0)
            from--;
        else
            to++;
    }
    let rects = textRange(text, from, to).getClientRects();
    if (!rects.length)
        return Rect0;
    let rect = rects[(flatten ? flatten < 0 : side >= 0) ? 0 : rects.length - 1];
    if (browser.safari && !flatten && rect.width == 0)
        rect = Array.prototype.find.call(rects, r => r.width) || rect;
    return flatten ? flattenRect(rect, flatten < 0) : rect || null;
}
// Also used for collapsed ranges that don't have a placeholder widget!
class WidgetView extends InlineView {
    constructor(widget, length, side) {
        super();
        this.widget = widget;
        this.length = length;
        this.side = side;
    }
    static create(widget, length, side) {
        return new (widget.customView || WidgetView)(widget, length, side);
    }
    slice(from) {
        let result = WidgetView.create(this.widget, this.length - from, this.side);
        this.length -= from;
        return result;
    }
    sync() {
        if (!this.dom || !this.widget.updateDOM(this.dom)) {
            this.setDOM(this.widget.toDOM(this.editorView));
            this.dom.contentEditable = "false";
        }
    }
    getSide() { return this.side; }
    merge(from, to, source, openStart, openEnd) {
        if (source && (!(source instanceof WidgetView) || !this.widget.compare(source.widget) ||
            from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
            return false;
        this.length = from + (source ? source.length : 0) + (this.length - to);
        return true;
    }
    become(other) {
        if (other.length == this.length && other instanceof WidgetView && other.side == this.side) {
            if (this.widget.constructor == other.widget.constructor) {
                if (!this.widget.eq(other.widget))
                    this.markDirty(true);
                this.widget = other.widget;
                return true;
            }
        }
        return false;
    }
    ignoreMutation() { return true; }
    ignoreEvent(event) { return this.widget.ignoreEvent(event); }
    get overrideDOMText() {
        if (this.length == 0)
            return Text.empty;
        let top = this;
        while (top.parent)
            top = top.parent;
        let view = top.editorView, text = view && view.state.doc, start = this.posAtStart;
        return text ? text.slice(start, start + this.length) : Text.empty;
    }
    domAtPos(pos) {
        return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
    }
    domBoundsAround() { return null; }
    coordsAt(pos, side) {
        let rects = this.dom.getClientRects(), rect = null;
        if (!rects.length)
            return Rect0;
        for (let i = pos > 0 ? rects.length - 1 : 0;; i += (pos > 0 ? -1 : 1)) {
            rect = rects[i];
            if (pos > 0 ? i == 0 : i == rects.length - 1 || rect.top < rect.bottom)
                break;
        }
        return (pos == 0 && side > 0 || pos == this.length && side <= 0) ? rect : flattenRect(rect, pos == 0);
    }
    get isEditable() { return false; }
}
class CompositionView extends WidgetView {
    domAtPos(pos) { return new DOMPos(this.widget.text, pos); }
    sync() { if (!this.dom)
        this.setDOM(this.widget.toDOM()); }
    localPosFromDOM(node, offset) {
        return !offset ? 0 : node.nodeType == 3 ? Math.min(offset, this.length) : this.length;
    }
    ignoreMutation() { return false; }
    get overrideDOMText() { return null; }
    coordsAt(pos, side) { return textCoords(this.widget.text, pos, side); }
    get isEditable() { return true; }
}
// These are drawn around uneditable widgets to avoid a number of
// browser bugs that show up when the cursor is directly next to
// uneditable inline content.
class WidgetBufferView extends InlineView {
    constructor(side) {
        super();
        this.side = side;
    }
    get length() { return 0; }
    merge() { return false; }
    become(other) {
        return other instanceof WidgetBufferView && other.side == this.side;
    }
    slice() { return new WidgetBufferView(this.side); }
    sync() {
        if (!this.dom)
            this.setDOM(document.createTextNode("\u200b"));
        else if (this.dirty && this.dom.nodeValue != "\u200b")
            this.dom.nodeValue = "\u200b";
    }
    getSide() { return this.side; }
    domAtPos(pos) { return DOMPos.before(this.dom); }
    domBoundsAround() { return null; }
    coordsAt(pos) {
        let rects = clientRectsFor(this.dom);
        return rects[rects.length - 1] || null;
    }
    get overrideDOMText() {
        return Text.of([this.dom.nodeValue.replace(/\u200b/g, "")]);
    }
}
function mergeInlineChildren(parent, from, to, elts, openStart, openEnd) {
    let cur = parent.childCursor();
    let { i: toI, off: toOff } = cur.findPos(to, 1);
    let { i: fromI, off: fromOff } = cur.findPos(from, -1);
    let dLen = from - to;
    for (let view of elts)
        dLen += view.length;
    parent.length += dLen;
    let { children } = parent;
    // Both from and to point into the same child view
    if (fromI == toI && fromOff) {
        let start = children[fromI];
        // Maybe just update that view and be done
        if (elts.length == 1 && start.merge(fromOff, toOff, elts[0], openStart, openEnd))
            return;
        if (elts.length == 0) {
            start.merge(fromOff, toOff, null, openStart, openEnd);
            return;
        }
        // Otherwise split it, so that we don't have to worry about aliasing front/end afterwards
        let after = start.slice(toOff);
        if (after.merge(0, 0, elts[elts.length - 1], 0, openEnd))
            elts[elts.length - 1] = after;
        else
            elts.push(after);
        toI++;
        openEnd = toOff = 0;
    }
    // Make sure start and end positions fall on node boundaries
    // (fromOff/toOff are no longer used after this), and that if the
    // start or end of the elts can be merged with adjacent nodes,
    // this is done
    if (toOff) {
        let end = children[toI];
        if (elts.length && end.merge(0, toOff, elts[elts.length - 1], 0, openEnd)) {
            elts.pop();
            openEnd = elts.length ? 0 : openStart;
        }
        else {
            end.merge(0, toOff, null, 0, 0);
        }
    }
    else if (toI < children.length && elts.length &&
        children[toI].merge(0, 0, elts[elts.length - 1], 0, openEnd)) {
        elts.pop();
        openEnd = elts.length ? 0 : openStart;
    }
    if (fromOff) {
        let start = children[fromI];
        if (elts.length && start.merge(fromOff, start.length, elts[0], openStart, 0)) {
            elts.shift();
            openStart = elts.length ? 0 : openEnd;
        }
        else {
            start.merge(fromOff, start.length, null, 0, 0);
        }
        fromI++;
    }
    else if (fromI && elts.length) {
        let end = children[fromI - 1];
        if (end.merge(end.length, end.length, elts[0], openStart, 0)) {
            elts.shift();
            openStart = elts.length ? 0 : openEnd;
        }
    }
    // Then try to merge any mergeable nodes at the start and end of
    // the changed range
    while (fromI < toI && elts.length && children[toI - 1].become(elts[elts.length - 1])) {
        elts.pop();
        toI--;
        openEnd = elts.length ? 0 : openStart;
    }
    while (fromI < toI && elts.length && children[fromI].become(elts[0])) {
        elts.shift();
        fromI++;
        openStart = elts.length ? 0 : openEnd;
    }
    if (!elts.length && fromI && toI < children.length &&
        children[toI].merge(0, 0, children[fromI - 1], openStart, openEnd))
        fromI--;
    // And if anything remains, splice the child array to insert the new elts
    if (elts.length || fromI != toI)
        parent.replaceChildren(fromI, toI, elts);
}
function inlineDOMAtPos(dom, children, pos) {
    let i = 0;
    for (let off = 0; i < children.length; i++) {
        let child = children[i], end = off + child.length;
        if (end == off && child.getSide() <= 0)
            continue;
        if (pos > off && pos < end && child.dom.parentNode == dom)
            return child.domAtPos(pos - off);
        if (pos <= off)
            break;
        off = end;
    }
    for (; i > 0; i--) {
        let before = children[i - 1].dom;
        if (before.parentNode == dom)
            return DOMPos.after(before);
    }
    return new DOMPos(dom, 0);
}
// Assumes `view`, if a mark view, has precisely 1 child.
function joinInlineInto(parent, view, open) {
    let last, { children } = parent;
    if (open > 0 && view instanceof MarkView && children.length &&
        (last = children[children.length - 1]) instanceof MarkView && last.mark.eq(view.mark)) {
        joinInlineInto(last, view.children[0], open - 1);
    }
    else {
        children.push(view);
        view.setParent(parent);
    }
    parent.length += view.length;
}
function coordsInChildren(view, pos, side) {
    for (let off = 0, i = 0; i < view.children.length; i++) {
        let child = view.children[i], end = off + child.length, next;
        if ((side <= 0 || end == view.length || child.getSide() > 0 ? end >= pos : end > pos) &&
            (pos < end || i + 1 == view.children.length || (next = view.children[i + 1]).length || next.getSide() > 0)) {
            let flatten = 0;
            if (end == off) {
                if (child.getSide() <= 0)
                    continue;
                flatten = side = -child.getSide();
            }
            let rect = child.coordsAt(pos - off, side);
            return flatten && rect ? flattenRect(rect, side < 0) : rect;
        }
        off = end;
    }
    let last = view.dom.lastChild;
    if (!last)
        return view.dom.getBoundingClientRect();
    let rects = clientRectsFor(last);
    return rects[rects.length - 1] || null;
}

function combineAttrs(source, target) {
    for (let name in source) {
        if (name == "class" && target.class)
            target.class += " " + source.class;
        else if (name == "style" && target.style)
            target.style += ";" + source.style;
        else
            target[name] = source[name];
    }
    return target;
}
function attrsEq(a, b) {
    if (a == b)
        return true;
    if (!a || !b)
        return false;
    let keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length != keysB.length)
        return false;
    for (let key of keysA) {
        if (keysB.indexOf(key) == -1 || a[key] !== b[key])
            return false;
    }
    return true;
}
function updateAttrs(dom, prev, attrs) {
    if (prev)
        for (let name in prev)
            if (!(attrs && name in attrs))
                dom.removeAttribute(name);
    if (attrs)
        for (let name in attrs)
            if (!(prev && prev[name] == attrs[name]))
                dom.setAttribute(name, attrs[name]);
}

/**
Widgets added to the content are described by subclasses of this
class. Using a description object like that makes it possible to
delay creating of the DOM structure for a widget until it is
needed, and to avoid redrawing widgets even when the decorations
that define them are recreated.
*/
class WidgetType {
    /**
    Compare this instance to another instance of the same type.
    (TypeScript can't express this, but only instances of the same
    specific class will be passed to this method.) This is used to
    avoid redrawing widgets when they are replaced by a new
    decoration of the same type. The default implementation just
    returns `false`, which will cause new instances of the widget to
    always be redrawn.
    */
    eq(_widget) { return false; }
    /**
    Update a DOM element created by a widget of the same type (but
    different, non-`eq` content) to reflect this widget. May return
    true to indicate that it could update, false to indicate it
    couldn't (in which case the widget will be redrawn). The default
    implementation just returns false.
    */
    updateDOM(_dom) { return false; }
    /**
    @internal
    */
    compare(other) {
        return this == other || this.constructor == other.constructor && this.eq(other);
    }
    /**
    The estimated height this widget will have, to be used when
    estimating the height of content that hasn't been drawn. May
    return -1 to indicate you don't know. The default implementation
    returns -1.
    */
    get estimatedHeight() { return -1; }
    /**
    Can be used to configure which kinds of events inside the widget
    should be ignored by the editor. The default is to ignore all
    events.
    */
    ignoreEvent(_event) { return true; }
    /**
    @internal
    */
    get customView() { return null; }
}
/**
The different types of blocks that can occur in an editor view.
*/
var BlockType = /*@__PURE__*/(function (BlockType) {
    /**
    A line of text.
    */
    BlockType[BlockType["Text"] = 0] = "Text";
    /**
    A block widget associated with the position after it.
    */
    BlockType[BlockType["WidgetBefore"] = 1] = "WidgetBefore";
    /**
    A block widget associated with the position before it.
    */
    BlockType[BlockType["WidgetAfter"] = 2] = "WidgetAfter";
    /**
    A block widget [replacing](https://codemirror.net/6/docs/ref/#view.Decoration^replace) a range of content.
    */
    BlockType[BlockType["WidgetRange"] = 3] = "WidgetRange";
return BlockType})(BlockType || (BlockType = {}));
/**
A decoration provides information on how to draw or style a piece
of content. You'll usually use it wrapped in a
[`Range`](https://codemirror.net/6/docs/ref/#rangeset.Range), which adds a start and end position.
*/
class Decoration extends RangeValue {
    /**
    @internal
    */
    constructor(
    /**
    @internal
    */
    startSide, 
    /**
    @internal
    */
    endSide, 
    /**
    @internal
    */
    widget, 
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    spec) {
        super();
        this.startSide = startSide;
        this.endSide = endSide;
        this.widget = widget;
        this.spec = spec;
    }
    /**
    @internal
    */
    get heightRelevant() { return false; }
    /**
    Create a mark decoration, which influences the styling of the
    content in its range. Nested mark decorations will cause nested
    DOM elements to be created. Nesting order is determined by
    precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations) or
    (below the facet-provided decorations) [view
    plugin](https://codemirror.net/6/docs/ref/#view.PluginSpec.decorations). Such elements are split
    on line boundaries and on the boundaries of higher-precedence
    decorations.
    */
    static mark(spec) {
        return new MarkDecoration(spec);
    }
    /**
    Create a widget decoration, which adds an element at the given
    position.
    */
    static widget(spec) {
        let side = spec.side || 0;
        return new PointDecoration(spec, side, side, !!spec.block, spec.widget || null, false);
    }
    /**
    Create a replace decoration which replaces the given range with
    a widget, or simply hides it.
    */
    static replace(spec) {
        let block = !!spec.block;
        let { start, end } = getInclusive(spec, block);
        let startSide = 100000000 /* Big */ * (start ? -1 : 1) * (block ? 2 : 1);
        let endSide = 100000000 /* Big */ * (end ? 1 : -1) * (block ? 2 : 1);
        return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
    }
    /**
    Create a line decoration, which can add DOM attributes to the
    line starting at the given position.
    */
    static line(spec) {
        return new LineDecoration(spec);
    }
    /**
    Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
    decorated range or ranges. If the ranges aren't already sorted,
    pass `true` for `sort` to make the library sort them for you.
    */
    static set(of, sort = false) {
        return RangeSet.of(of, sort);
    }
    /**
    @internal
    */
    hasHeight() { return this.widget ? this.widget.estimatedHeight > -1 : false; }
}
/**
The empty set of decorations.
*/
Decoration.none = RangeSet.empty;
class MarkDecoration extends Decoration {
    constructor(spec) {
        let { start, end } = getInclusive(spec);
        super(100000000 /* Big */ * (start ? -1 : 1), 100000000 /* Big */ * (end ? 1 : -1), null, spec);
        this.tagName = spec.tagName || "span";
        this.class = spec.class || "";
        this.attrs = spec.attributes || null;
    }
    eq(other) {
        return this == other ||
            other instanceof MarkDecoration &&
                this.tagName == other.tagName &&
                this.class == other.class &&
                attrsEq(this.attrs, other.attrs);
    }
    range(from, to = from) {
        if (from >= to)
            throw new RangeError("Mark decorations may not be empty");
        return super.range(from, to);
    }
}
MarkDecoration.prototype.point = false;
class LineDecoration extends Decoration {
    constructor(spec) {
        super(-100000000 /* Big */, -100000000 /* Big */, null, spec);
    }
    eq(other) {
        return other instanceof LineDecoration && attrsEq(this.spec.attributes, other.spec.attributes);
    }
    range(from, to = from) {
        if (to != from)
            throw new RangeError("Line decoration ranges must be zero-length");
        return super.range(from, to);
    }
}
LineDecoration.prototype.mapMode = MapMode.TrackBefore;
LineDecoration.prototype.point = true;
class PointDecoration extends Decoration {
    constructor(spec, startSide, endSide, block, widget, isReplace) {
        super(startSide, endSide, widget, spec);
        this.block = block;
        this.isReplace = isReplace;
        this.mapMode = !block ? MapMode.TrackDel : startSide < 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
    }
    // Only relevant when this.block == true
    get type() {
        return this.startSide < this.endSide ? BlockType.WidgetRange
            : this.startSide < 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
    }
    get heightRelevant() { return this.block || !!this.widget && this.widget.estimatedHeight >= 5; }
    eq(other) {
        return other instanceof PointDecoration &&
            widgetsEq(this.widget, other.widget) &&
            this.block == other.block &&
            this.startSide == other.startSide && this.endSide == other.endSide;
    }
    range(from, to = from) {
        if (this.isReplace && (from > to || (from == to && this.startSide > 0 && this.endSide < 0)))
            throw new RangeError("Invalid range for replacement decoration");
        if (!this.isReplace && to != from)
            throw new RangeError("Widget decorations can only have zero-length ranges");
        return super.range(from, to);
    }
}
PointDecoration.prototype.point = true;
function getInclusive(spec, block = false) {
    let { inclusiveStart: start, inclusiveEnd: end } = spec;
    if (start == null)
        start = spec.inclusive;
    if (end == null)
        end = spec.inclusive;
    return { start: start !== null && start !== void 0 ? start : block, end: end !== null && end !== void 0 ? end : block };
}
function widgetsEq(a, b) {
    return a == b || !!(a && b && a.compare(b));
}
function addRange(from, to, ranges, margin = 0) {
    let last = ranges.length - 1;
    if (last >= 0 && ranges[last] + margin > from)
        ranges[last] = Math.max(ranges[last], to);
    else
        ranges.push(from, to);
}

class LineView extends ContentView {
    constructor() {
        super(...arguments);
        this.children = [];
        this.length = 0;
        this.prevAttrs = undefined;
        this.attrs = null;
        this.breakAfter = 0;
    }
    // Consumes source
    merge(from, to, source, takeDeco, openStart, openEnd) {
        if (source) {
            if (!(source instanceof LineView))
                return false;
            if (!this.dom)
                source.transferDOM(this); // Reuse source.dom when appropriate
        }
        if (takeDeco)
            this.setDeco(source ? source.attrs : null);
        mergeInlineChildren(this, from, to, source ? source.children : none$1, openStart, openEnd);
        return true;
    }
    split(at) {
        let end = new LineView;
        end.breakAfter = this.breakAfter;
        if (this.length == 0)
            return end;
        let { i, off } = this.childPos(at);
        if (off) {
            end.append(this.children[i].slice(off), 0);
            this.children[i].merge(off, this.children[i].length, null, 0, 0);
            i++;
        }
        for (let j = i; j < this.children.length; j++)
            end.append(this.children[j], 0);
        while (i > 0 && this.children[i - 1].length == 0) {
            this.children[i - 1].parent = null;
            i--;
        }
        this.children.length = i;
        this.markDirty();
        this.length = at;
        return end;
    }
    transferDOM(other) {
        if (!this.dom)
            return;
        other.setDOM(this.dom);
        other.prevAttrs = this.prevAttrs === undefined ? this.attrs : this.prevAttrs;
        this.prevAttrs = undefined;
        this.dom = null;
    }
    setDeco(attrs) {
        if (!attrsEq(this.attrs, attrs)) {
            if (this.dom) {
                this.prevAttrs = this.attrs;
                this.markDirty();
            }
            this.attrs = attrs;
        }
    }
    // Only called when building a line view in ContentBuilder
    append(child, openStart) {
        joinInlineInto(this, child, openStart);
    }
    // Only called when building a line view in ContentBuilder
    addLineDeco(deco) {
        let attrs = deco.spec.attributes, cls = deco.spec.class;
        if (attrs)
            this.attrs = combineAttrs(attrs, this.attrs || {});
        if (cls)
            this.attrs = combineAttrs(attrs, { class: cls });
    }
    domAtPos(pos) {
        return inlineDOMAtPos(this.dom, this.children, pos);
    }
    sync(track) {
        var _a;
        if (!this.dom || (this.dirty & 4 /* Attrs */)) {
            this.setDOM(document.createElement("div"));
            this.dom.className = "cm-line";
            this.prevAttrs = this.attrs ? null : undefined;
        }
        if (this.prevAttrs !== undefined) {
            updateAttrs(this.dom, this.prevAttrs, this.attrs);
            this.dom.classList.add("cm-line");
            this.prevAttrs = undefined;
        }
        super.sync(track);
        let last = this.dom.lastChild;
        while (last && ContentView.get(last) instanceof MarkView)
            last = last.lastChild;
        if (!last ||
            last.nodeName != "BR" && ((_a = ContentView.get(last)) === null || _a === void 0 ? void 0 : _a.isEditable) == false &&
                (!browser.ios || !this.children.some(ch => ch instanceof TextView))) {
            let hack = document.createElement("BR");
            hack.cmIgnore = true;
            this.dom.appendChild(hack);
        }
    }
    measureTextSize() {
        if (this.children.length == 0 || this.length > 20)
            return null;
        let totalWidth = 0;
        for (let child of this.children) {
            if (!(child instanceof TextView))
                return null;
            let rects = clientRectsFor(child.dom);
            if (rects.length != 1)
                return null;
            totalWidth += rects[0].width;
        }
        return { lineHeight: this.dom.getBoundingClientRect().height,
            charWidth: totalWidth / this.length };
    }
    coordsAt(pos, side) {
        return coordsInChildren(this, pos, side);
    }
    match(_other) { return false; }
    get type() { return BlockType.Text; }
    static find(docView, pos) {
        for (let i = 0, off = 0;; i++) {
            let block = docView.children[i], end = off + block.length;
            if (end >= pos) {
                if (block instanceof LineView)
                    return block;
                if (block.length)
                    return null;
            }
            off = end + block.breakAfter;
        }
    }
}
const none$1 = [];
class BlockWidgetView extends ContentView {
    constructor(widget, length, type) {
        super();
        this.widget = widget;
        this.length = length;
        this.type = type;
        this.breakAfter = 0;
    }
    merge(from, to, source, _takeDeco, openStart, openEnd) {
        if (source && (!(source instanceof BlockWidgetView) || !this.widget.compare(source.widget) ||
            from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
            return false;
        this.length = from + (source ? source.length : 0) + (this.length - to);
        return true;
    }
    domAtPos(pos) {
        return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
    }
    split(at) {
        let len = this.length - at;
        this.length = at;
        let end = new BlockWidgetView(this.widget, len, this.type);
        end.breakAfter = this.breakAfter;
        return end;
    }
    get children() { return none$1; }
    sync() {
        if (!this.dom || !this.widget.updateDOM(this.dom)) {
            this.setDOM(this.widget.toDOM(this.editorView));
            this.dom.contentEditable = "false";
        }
    }
    get overrideDOMText() {
        return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : Text.empty;
    }
    domBoundsAround() { return null; }
    match(other) {
        if (other instanceof BlockWidgetView && other.type == this.type &&
            other.widget.constructor == this.widget.constructor) {
            if (!other.widget.eq(this.widget))
                this.markDirty(true);
            this.widget = other.widget;
            this.length = other.length;
            this.breakAfter = other.breakAfter;
            return true;
        }
        return false;
    }
    ignoreMutation() { return true; }
    ignoreEvent(event) { return this.widget.ignoreEvent(event); }
}

class ContentBuilder {
    constructor(doc, pos, end) {
        this.doc = doc;
        this.pos = pos;
        this.end = end;
        this.content = [];
        this.curLine = null;
        this.breakAtStart = 0;
        this.pendingBuffer = 0 /* No */;
        // Set to false directly after a widget that covers the position after it
        this.atCursorPos = true;
        this.openStart = -1;
        this.openEnd = -1;
        this.text = "";
        this.textOff = 0;
        this.cursor = doc.iter();
        this.skip = pos;
    }
    posCovered() {
        if (this.content.length == 0)
            return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
        let last = this.content[this.content.length - 1];
        return !last.breakAfter && !(last instanceof BlockWidgetView && last.type == BlockType.WidgetBefore);
    }
    getLine() {
        if (!this.curLine) {
            this.content.push(this.curLine = new LineView);
            this.atCursorPos = true;
        }
        return this.curLine;
    }
    flushBuffer(active) {
        if (this.pendingBuffer) {
            this.curLine.append(wrapMarks(new WidgetBufferView(-1), active), active.length);
            this.pendingBuffer = 0 /* No */;
        }
    }
    addBlockWidget(view) {
        this.flushBuffer([]);
        this.curLine = null;
        this.content.push(view);
    }
    finish(openEnd) {
        if (!openEnd)
            this.flushBuffer([]);
        else
            this.pendingBuffer = 0 /* No */;
        if (!this.posCovered())
            this.getLine();
    }
    buildText(length, active, openStart) {
        while (length > 0) {
            if (this.textOff == this.text.length) {
                let { value, lineBreak, done } = this.cursor.next(this.skip);
                this.skip = 0;
                if (done)
                    throw new Error("Ran out of text content when drawing inline views");
                if (lineBreak) {
                    if (!this.posCovered())
                        this.getLine();
                    if (this.content.length)
                        this.content[this.content.length - 1].breakAfter = 1;
                    else
                        this.breakAtStart = 1;
                    this.flushBuffer([]);
                    this.curLine = null;
                    length--;
                    continue;
                }
                else {
                    this.text = value;
                    this.textOff = 0;
                }
            }
            let take = Math.min(this.text.length - this.textOff, length, 512 /* Chunk */);
            this.flushBuffer(active);
            this.getLine().append(wrapMarks(new TextView(this.text.slice(this.textOff, this.textOff + take)), active), openStart);
            this.atCursorPos = true;
            this.textOff += take;
            length -= take;
            openStart = 0;
        }
    }
    span(from, to, active, openStart) {
        this.buildText(to - from, active, openStart);
        this.pos = to;
        if (this.openStart < 0)
            this.openStart = openStart;
    }
    point(from, to, deco, active, openStart) {
        let len = to - from;
        if (deco instanceof PointDecoration) {
            if (deco.block) {
                let { type } = deco;
                if (type == BlockType.WidgetAfter && !this.posCovered())
                    this.getLine();
                this.addBlockWidget(new BlockWidgetView(deco.widget || new NullWidget("div"), len, type));
            }
            else {
                let view = WidgetView.create(deco.widget || new NullWidget("span"), len, deco.startSide);
                let cursorBefore = this.atCursorPos && !view.isEditable && openStart <= active.length && (from < to || deco.startSide > 0);
                let cursorAfter = !view.isEditable && (from < to || deco.startSide <= 0);
                let line = this.getLine();
                if (this.pendingBuffer == 2 /* IfCursor */ && !cursorBefore)
                    this.pendingBuffer = 0 /* No */;
                this.flushBuffer(active);
                if (cursorBefore) {
                    line.append(wrapMarks(new WidgetBufferView(1), active), openStart);
                    openStart = active.length + Math.max(0, openStart - active.length);
                }
                line.append(wrapMarks(view, active), openStart);
                this.atCursorPos = cursorAfter;
                this.pendingBuffer = !cursorAfter ? 0 /* No */ : from < to ? 1 /* Yes */ : 2 /* IfCursor */;
            }
        }
        else if (this.doc.lineAt(this.pos).from == this.pos) { // Line decoration
            this.getLine().addLineDeco(deco);
        }
        if (len) {
            // Advance the iterator past the replaced content
            if (this.textOff + len <= this.text.length) {
                this.textOff += len;
            }
            else {
                this.skip += len - (this.text.length - this.textOff);
                this.text = "";
                this.textOff = 0;
            }
            this.pos = to;
        }
        if (this.openStart < 0)
            this.openStart = openStart;
    }
    static build(text, from, to, decorations) {
        let builder = new ContentBuilder(text, from, to);
        builder.openEnd = RangeSet.spans(decorations, from, to, builder);
        if (builder.openStart < 0)
            builder.openStart = builder.openEnd;
        builder.finish(builder.openEnd);
        return builder;
    }
}
function wrapMarks(view, active) {
    for (let mark of active)
        view = new MarkView(mark, [view], view.length);
    return view;
}
class NullWidget extends WidgetType {
    constructor(tag) {
        super();
        this.tag = tag;
    }
    eq(other) { return other.tag == this.tag; }
    toDOM() { return document.createElement(this.tag); }
    updateDOM(elt) { return elt.nodeName.toLowerCase() == this.tag; }
}

const none$4 = [];
const clickAddsSelectionRange = /*@__PURE__*/Facet.define();
const dragMovesSelection$1 = /*@__PURE__*/Facet.define();
const mouseSelectionStyle = /*@__PURE__*/Facet.define();
const exceptionSink = /*@__PURE__*/Facet.define();
const updateListener = /*@__PURE__*/Facet.define();
const inputHandler = /*@__PURE__*/Facet.define();
const scrollTo = /*@__PURE__*/StateEffect.define({
    map: (range, changes) => range.map(changes)
});
const centerOn = /*@__PURE__*/StateEffect.define({
    map: (range, changes) => range.map(changes)
});
/**
Log or report an unhandled exception in client code. Should
probably only be used by extension code that allows client code to
provide functions, and calls those functions in a context where an
exception can't be propagated to calling code in a reasonable way
(for example when in an event handler).

Either calls a handler registered with
[`EditorView.exceptionSink`](https://codemirror.net/6/docs/ref/#view.EditorView^exceptionSink),
`window.onerror`, if defined, or `console.error` (in which case
it'll pass `context`, when given, as first argument).
*/
function logException(state, exception, context) {
    let handler = state.facet(exceptionSink);
    if (handler.length)
        handler[0](exception);
    else if (window.onerror)
        window.onerror(String(exception), context, undefined, undefined, exception);
    else if (context)
        console.error(context + ":", exception);
    else
        console.error(exception);
}
const editable = /*@__PURE__*/Facet.define({ combine: values => values.length ? values[0] : true });
/**
Used to [declare](https://codemirror.net/6/docs/ref/#view.PluginSpec.provide) which
[fields](https://codemirror.net/6/docs/ref/#view.PluginValue) a [view plugin](https://codemirror.net/6/docs/ref/#view.ViewPlugin)
provides.
*/
class PluginFieldProvider {
    /**
    @internal
    */
    constructor(
    /**
    @internal
    */
    field, 
    /**
    @internal
    */
    get) {
        this.field = field;
        this.get = get;
    }
}
/**
Plugin fields are a mechanism for allowing plugins to provide
values that can be retrieved through the
[`pluginField`](https://codemirror.net/6/docs/ref/#view.EditorView.pluginField) view method.
*/
class PluginField {
    /**
    Create a [provider](https://codemirror.net/6/docs/ref/#view.PluginFieldProvider) for this field,
    to use with a plugin's [provide](https://codemirror.net/6/docs/ref/#view.PluginSpec.provide)
    option.
    */
    from(get) {
        return new PluginFieldProvider(this, get);
    }
    /**
    Define a new plugin field.
    */
    static define() { return new PluginField(); }
}
/**
This field can be used by plugins to provide
[decorations](https://codemirror.net/6/docs/ref/#view.Decoration).

**Note**: For reasons of data flow (plugins are only updated
after the viewport is computed), decorations produced by plugins
are _not_ taken into account when predicting the vertical layout
structure of the editor. Thus, things like large widgets or big
replacements (i.e. code folding) should be provided through the
state-level [`decorations` facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations),
not this plugin field. Specifically, replacing decorations that
cross line boundaries will break if provided through a plugin.
*/
PluginField.decorations = /*@__PURE__*/PluginField.define();
/**
Used to provide ranges that should be treated as atoms as far as
cursor motion is concerned. This causes methods like
[`moveByChar`](https://codemirror.net/6/docs/ref/#view.EditorView.moveByChar) and
[`moveVertically`](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) (and the
commands built on top of them) to skip across such regions when
a selection endpoint would enter them. This does _not_ prevent
direct programmatic [selection
updates](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) from moving into such
regions.
*/
PluginField.atomicRanges = /*@__PURE__*/PluginField.define();
/**
Plugins can provide additional scroll margins (space around the
sides of the scrolling element that should be considered
invisible) through this field. This can be useful when the
plugin introduces elements that cover part of that element (for
example a horizontally fixed gutter).
*/
PluginField.scrollMargins = /*@__PURE__*/PluginField.define();
let nextPluginID = 0;
const viewPlugin = /*@__PURE__*/Facet.define();
/**
View plugins associate stateful values with a view. They can
influence the way the content is drawn, and are notified of things
that happen in the view.
*/
class ViewPlugin {
    constructor(
    /**
    @internal
    */
    id, 
    /**
    @internal
    */
    create, 
    /**
    @internal
    */
    fields) {
        this.id = id;
        this.create = create;
        this.fields = fields;
        this.extension = viewPlugin.of(this);
    }
    /**
    Define a plugin from a constructor function that creates the
    plugin's value, given an editor view.
    */
    static define(create, spec) {
        let { eventHandlers, provide, decorations } = spec || {};
        let fields = [];
        if (provide)
            for (let provider of Array.isArray(provide) ? provide : [provide])
                fields.push(provider);
        if (eventHandlers)
            fields.push(domEventHandlers.from((value) => ({ plugin: value, handlers: eventHandlers })));
        if (decorations)
            fields.push(PluginField.decorations.from(decorations));
        return new ViewPlugin(nextPluginID++, create, fields);
    }
    /**
    Create a plugin for a class whose constructor takes a single
    editor view as argument.
    */
    static fromClass(cls, spec) {
        return ViewPlugin.define(view => new cls(view), spec);
    }
}
const domEventHandlers = /*@__PURE__*/PluginField.define();
class PluginInstance {
    constructor(spec) {
        this.spec = spec;
        // When starting an update, all plugins have this field set to the
        // update object, indicating they need to be updated. When finished
        // updating, it is set to `false`. Retrieving a plugin that needs to
        // be updated with `view.plugin` forces an eager update.
        this.mustUpdate = null;
        // This is null when the plugin is initially created, but
        // initialized on the first update.
        this.value = null;
    }
    takeField(type, target) {
        for (let { field, get } of this.spec.fields)
            if (field == type)
                target.push(get(this.value));
    }
    update(view) {
        if (!this.value) {
            try {
                this.value = this.spec.create(view);
            }
            catch (e) {
                logException(view.state, e, "CodeMirror plugin crashed");
                return PluginInstance.dummy;
            }
        }
        else if (this.mustUpdate) {
            let update = this.mustUpdate;
            this.mustUpdate = null;
            if (!this.value.update)
                return this;
            try {
                this.value.update(update);
            }
            catch (e) {
                logException(update.state, e, "CodeMirror plugin crashed");
                if (this.value.destroy)
                    try {
                        this.value.destroy();
                    }
                    catch (_) { }
                return PluginInstance.dummy;
            }
        }
        return this;
    }
    destroy(view) {
        var _a;
        if ((_a = this.value) === null || _a === void 0 ? void 0 : _a.destroy) {
            try {
                this.value.destroy();
            }
            catch (e) {
                logException(view.state, e, "CodeMirror plugin crashed");
            }
        }
    }
}
PluginInstance.dummy = /*@__PURE__*/new PluginInstance(/*@__PURE__*/ViewPlugin.define(() => ({})));
function combineFacetAttrs(values) {
    let result = {};
    for (let i = values.length - 1; i >= 0; i--)
        combineAttrs(values[i], result);
    return result;
}
const editorAttributes = /*@__PURE__*/Facet.define({
    combine: combineFacetAttrs
});
const contentAttributes = /*@__PURE__*/Facet.define({
    combine: combineFacetAttrs
});
// Provide decorations
const decorations = /*@__PURE__*/Facet.define();
const styleModule = /*@__PURE__*/Facet.define();
class ChangedRange {
    constructor(fromA, toA, fromB, toB) {
        this.fromA = fromA;
        this.toA = toA;
        this.fromB = fromB;
        this.toB = toB;
    }
    join(other) {
        return new ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
    }
    addToSet(set) {
        let i = set.length, me = this;
        for (; i > 0; i--) {
            let range = set[i - 1];
            if (range.fromA > me.toA)
                continue;
            if (range.toA < me.fromA)
                break;
            me = me.join(range);
            set.splice(i - 1, 1);
        }
        set.splice(i, 0, me);
        return set;
    }
    static extendWithRanges(diff, ranges) {
        if (ranges.length == 0)
            return diff;
        let result = [];
        for (let dI = 0, rI = 0, posA = 0, posB = 0;; dI++) {
            let next = dI == diff.length ? null : diff[dI], off = posA - posB;
            let end = next ? next.fromB : 1e9;
            while (rI < ranges.length && ranges[rI] < end) {
                let from = ranges[rI], to = ranges[rI + 1];
                let fromB = Math.max(posB, from), toB = Math.min(end, to);
                if (fromB <= toB)
                    new ChangedRange(fromB + off, toB + off, fromB, toB).addToSet(result);
                if (to > end)
                    break;
                else
                    rI += 2;
            }
            if (!next)
                return result;
            new ChangedRange(next.fromA, next.toA, next.fromB, next.toB).addToSet(result);
            posA = next.toA;
            posB = next.toB;
        }
    }
}
/**
View [plugins](https://codemirror.net/6/docs/ref/#view.ViewPlugin) are given instances of this
class, which describe what happened, whenever the view is updated.
*/
class ViewUpdate {
    /**
    @internal
    */
    constructor(
    /**
    The editor view that the update is associated with.
    */
    view, 
    /**
    The new editor state.
    */
    state, 
    /**
    The transactions involved in the update. May be empty.
    */
    transactions = none$4) {
        this.view = view;
        this.state = state;
        this.transactions = transactions;
        /**
        @internal
        */
        this.flags = 0;
        this.startState = view.state;
        this.changes = ChangeSet.empty(this.startState.doc.length);
        for (let tr of transactions)
            this.changes = this.changes.compose(tr.changes);
        let changedRanges = [];
        this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
        this.changedRanges = changedRanges;
        let focus = view.hasFocus;
        if (focus != view.inputState.notifiedFocused) {
            view.inputState.notifiedFocused = focus;
            this.flags |= 1 /* Focus */;
        }
        if (this.docChanged)
            this.flags |= 2 /* Height */;
    }
    /**
    Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
    [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
    update.
    */
    get viewportChanged() {
        return (this.flags & 4 /* Viewport */) > 0;
    }
    /**
    Indicates whether the line height in the editor changed in this update.
    */
    get heightChanged() {
        return (this.flags & 2 /* Height */) > 0;
    }
    /**
    Returns true when the document changed or the size of the editor
    or the lines or characters within it has changed.
    */
    get geometryChanged() {
        return this.docChanged || (this.flags & (8 /* Geometry */ | 2 /* Height */)) > 0;
    }
    /**
    True when this update indicates a focus change.
    */
    get focusChanged() {
        return (this.flags & 1 /* Focus */) > 0;
    }
    /**
    Whether the document changed in this update.
    */
    get docChanged() {
        return this.transactions.some(tr => tr.docChanged);
    }
    /**
    Whether the selection was explicitly set in this update.
    */
    get selectionSet() {
        return this.transactions.some(tr => tr.selection);
    }
    /**
    @internal
    */
    get empty() { return this.flags == 0 && this.transactions.length == 0; }
}

class DocView extends ContentView {
    constructor(view) {
        super();
        this.view = view;
        this.compositionDeco = Decoration.none;
        this.decorations = [];
        // Track a minimum width for the editor. When measuring sizes in
        // checkLayout, this is updated to point at the width of a given
        // element and its extent in the document. When a change happens in
        // that range, these are reset. That way, once we've seen a
        // line/element of a given length, we keep the editor wide enough to
        // fit at least that element, until it is changed, at which point we
        // forget it again.
        this.minWidth = 0;
        this.minWidthFrom = 0;
        this.minWidthTo = 0;
        // Track whether the DOM selection was set in a lossy way, so that
        // we don't mess it up when reading it back it
        this.impreciseAnchor = null;
        this.impreciseHead = null;
        // Used by the resize observer to ignore resizes that we caused
        // ourselves
        this.lastUpdate = 0;
        this.setDOM(view.contentDOM);
        this.children = [new LineView];
        this.children[0].setParent(this);
        this.updateInner([new ChangedRange(0, 0, 0, view.state.doc.length)], this.updateDeco(), 0);
    }
    get root() { return this.view.root; }
    get editorView() { return this.view; }
    get length() { return this.view.state.doc.length; }
    // Update the document view to a given state. scrollIntoView can be
    // used as a hint to compute a new viewport that includes that
    // position, if we know the editor is going to scroll that position
    // into view.
    update(update) {
        this.lastUpdate = Date.now();
        let changedRanges = update.changedRanges;
        if (this.minWidth > 0 && changedRanges.length) {
            if (!changedRanges.every(({ fromA, toA }) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
                this.minWidth = 0;
            }
            else {
                this.minWidthFrom = update.changes.mapPos(this.minWidthFrom, 1);
                this.minWidthTo = update.changes.mapPos(this.minWidthTo, 1);
            }
        }
        if (this.view.inputState.composing < 0)
            this.compositionDeco = Decoration.none;
        else if (update.transactions.length)
            this.compositionDeco = computeCompositionDeco(this.view, update.changes);
        // When the DOM nodes around the selection are moved to another
        // parent, Chrome sometimes reports a different selection through
        // getSelection than the one that it actually shows to the user.
        // This forces a selection update when lines are joined to work
        // around that. Issue #54
        let forceSelection = (browser.ie || browser.chrome) && !this.compositionDeco.size && update &&
            update.state.doc.lines != update.startState.doc.lines;
        let prevDeco = this.decorations, deco = this.updateDeco();
        let decoDiff = findChangedDeco(prevDeco, deco, update.changes);
        changedRanges = ChangedRange.extendWithRanges(changedRanges, decoDiff);
        let pointerSel = update.transactions.some(tr => tr.isUserEvent("select.pointer"));
        if (this.dirty == 0 /* Not */ && changedRanges.length == 0 &&
            !(update.flags & 4 /* Viewport */) &&
            update.state.selection.main.from >= this.view.viewport.from &&
            update.state.selection.main.to <= this.view.viewport.to) {
            this.updateSelection(forceSelection, pointerSel);
            return false;
        }
        else {
            this.updateInner(changedRanges, deco, update.startState.doc.length, forceSelection, pointerSel);
            return true;
        }
    }
    reset(sel) {
        if (this.dirty) {
            this.view.observer.ignore(() => this.view.docView.sync());
            this.dirty = 0 /* Not */;
        }
        if (sel)
            this.updateSelection();
    }
    // Used both by update and checkLayout do perform the actual DOM
    // update
    updateInner(changes, deco, oldLength, forceSelection = false, pointerSel = false) {
        this.updateChildren(changes, deco, oldLength);
        let { observer } = this.view;
        observer.ignore(() => {
            // Lock the height during redrawing, since Chrome sometimes
            // messes with the scroll position during DOM mutation (though
            // no relayout is triggered and I cannot imagine how it can
            // recompute the scroll position without a layout)
            this.dom.style.height = this.view.viewState.domHeight + "px";
            this.dom.style.minWidth = this.minWidth ? this.minWidth + "px" : "";
            // Chrome will sometimes, when DOM mutations occur directly
            // around the selection, get confused and report a different
            // selection from the one it displays (issue #218). This tries
            // to detect that situation.
            let track = browser.chrome || browser.ios ? { node: observer.selectionRange.focusNode, written: false } : undefined;
            this.sync(track);
            this.dirty = 0 /* Not */;
            if (track && (track.written || observer.selectionRange.focusNode != track.node))
                forceSelection = true;
            this.updateSelection(forceSelection, pointerSel);
            this.dom.style.height = "";
        });
        let gaps = [];
        if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
            for (let child of this.children)
                if (child instanceof BlockWidgetView && child.widget instanceof BlockGapWidget)
                    gaps.push(child.dom);
        observer.updateGaps(gaps);
    }
    updateChildren(changes, deco, oldLength) {
        let cursor = this.childCursor(oldLength);
        for (let i = changes.length - 1;; i--) {
            let next = i >= 0 ? changes[i] : null;
            if (!next)
                break;
            let { fromA, toA, fromB, toB } = next;
            let { content, breakAtStart, openStart, openEnd } = ContentBuilder.build(this.view.state.doc, fromB, toB, deco);
            let { i: toI, off: toOff } = cursor.findPos(toA, 1);
            let { i: fromI, off: fromOff } = cursor.findPos(fromA, -1);
            this.replaceRange(fromI, fromOff, toI, toOff, content, breakAtStart, openStart, openEnd);
        }
    }
    replaceRange(fromI, fromOff, toI, toOff, content, breakAtStart, openStart, openEnd) {
        let before = this.children[fromI], last = content.length ? content[content.length - 1] : null;
        let breakAtEnd = last ? last.breakAfter : breakAtStart;
        // Change within a single line
        if (fromI == toI && !breakAtStart && !breakAtEnd && content.length < 2 &&
            before.merge(fromOff, toOff, content.length ? last : null, fromOff == 0, openStart, openEnd))
            return;
        let after = this.children[toI];
        // Make sure the end of the line after the update is preserved in `after`
        if (toOff < after.length) {
            // If we're splitting a line, separate part of the start line to
            // avoid that being mangled when updating the start line.
            if (fromI == toI) {
                after = after.split(toOff);
                toOff = 0;
            }
            // If the element after the replacement should be merged with
            // the last replacing element, update `content`
            if (!breakAtEnd && last && after.merge(0, toOff, last, true, 0, openEnd)) {
                content[content.length - 1] = after;
            }
            else {
                // Remove the start of the after element, if necessary, and
                // add it to `content`.
                if (toOff)
                    after.merge(0, toOff, null, false, 0, openEnd);
                content.push(after);
            }
        }
        else if (after.breakAfter) {
            // The element at `toI` is entirely covered by this range.
            // Preserve its line break, if any.
            if (last)
                last.breakAfter = 1;
            else
                breakAtStart = 1;
        }
        // Since we've handled the next element from the current elements
        // now, make sure `toI` points after that.
        toI++;
        before.breakAfter = breakAtStart;
        if (fromOff > 0) {
            if (!breakAtStart && content.length && before.merge(fromOff, before.length, content[0], false, openStart, 0)) {
                before.breakAfter = content.shift().breakAfter;
            }
            else if (fromOff < before.length || before.children.length && before.children[before.children.length - 1].length == 0) {
                before.merge(fromOff, before.length, null, false, openStart, 0);
            }
            fromI++;
        }
        // Try to merge widgets on the boundaries of the replacement
        while (fromI < toI && content.length) {
            if (this.children[toI - 1].match(content[content.length - 1]))
                toI--, content.pop();
            else if (this.children[fromI].match(content[0]))
                fromI++, content.shift();
            else
                break;
        }
        if (fromI < toI || content.length)
            this.replaceChildren(fromI, toI, content);
    }
    // Sync the DOM selection to this.state.selection
    updateSelection(force = false, fromPointer = false) {
        if (!(fromPointer || this.mayControlSelection()) ||
            browser.ios && this.view.inputState.rapidCompositionStart)
            return;
        let main = this.view.state.selection.main;
        // FIXME need to handle the case where the selection falls inside a block range
        let anchor = this.domAtPos(main.anchor);
        let head = main.empty ? anchor : this.domAtPos(main.head);
        // Always reset on Firefox when next to an uneditable node to
        // avoid invisible cursor bugs (#111)
        if (browser.gecko && main.empty && betweenUneditable(anchor)) {
            let dummy = document.createTextNode("");
            this.view.observer.ignore(() => anchor.node.insertBefore(dummy, anchor.node.childNodes[anchor.offset] || null));
            anchor = head = new DOMPos(dummy, 0);
            force = true;
        }
        let domSel = this.view.observer.selectionRange;
        // If the selection is already here, or in an equivalent position, don't touch it
        if (force || !domSel.focusNode ||
            !isEquivalentPosition(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) ||
            !isEquivalentPosition(head.node, head.offset, domSel.focusNode, domSel.focusOffset)) {
            this.view.observer.ignore(() => {
                // Chrome Android will hide the virtual keyboard when tapping
                // inside an uneditable node, and not bring it back when we
                // move the cursor to its proper position. This tries to
                // restore the keyboard by cycling focus.
                if (browser.android && browser.chrome && this.dom.contains(domSel.focusNode) && inUneditable(domSel.focusNode, this.dom)) {
                    this.dom.blur();
                    this.dom.focus({ preventScroll: true });
                }
                let rawSel = getSelection(this.root);
                if (main.empty) {
                    // Work around https://bugzilla.mozilla.org/show_bug.cgi?id=1612076
                    if (browser.gecko) {
                        let nextTo = nextToUneditable(anchor.node, anchor.offset);
                        if (nextTo && nextTo != (1 /* Before */ | 2 /* After */)) {
                            let text = nearbyTextNode(anchor.node, anchor.offset, nextTo == 1 /* Before */ ? 1 : -1);
                            if (text)
                                anchor = new DOMPos(text, nextTo == 1 /* Before */ ? 0 : text.nodeValue.length);
                        }
                    }
                    rawSel.collapse(anchor.node, anchor.offset);
                    if (main.bidiLevel != null && domSel.cursorBidiLevel != null)
                        domSel.cursorBidiLevel = main.bidiLevel;
                }
                else if (rawSel.extend) {
                    // Selection.extend can be used to create an 'inverted' selection
                    // (one where the focus is before the anchor), but not all
                    // browsers support it yet.
                    rawSel.collapse(anchor.node, anchor.offset);
                    rawSel.extend(head.node, head.offset);
                }
                else {
                    // Primitive (IE) way
                    let range = document.createRange();
                    if (main.anchor > main.head)
                        [anchor, head] = [head, anchor];
                    range.setEnd(head.node, head.offset);
                    range.setStart(anchor.node, anchor.offset);
                    rawSel.removeAllRanges();
                    rawSel.addRange(range);
                }
            });
            this.view.observer.setSelectionRange(anchor, head);
        }
        this.impreciseAnchor = anchor.precise ? null : new DOMPos(domSel.anchorNode, domSel.anchorOffset);
        this.impreciseHead = head.precise ? null : new DOMPos(domSel.focusNode, domSel.focusOffset);
    }
    enforceCursorAssoc() {
        if (this.view.composing)
            return;
        let cursor = this.view.state.selection.main;
        let sel = getSelection(this.root);
        if (!cursor.empty || !cursor.assoc || !sel.modify)
            return;
        let line = LineView.find(this, cursor.head);
        if (!line)
            return;
        let lineStart = line.posAtStart;
        if (cursor.head == lineStart || cursor.head == lineStart + line.length)
            return;
        let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
        if (!before || !after || before.bottom > after.top)
            return;
        let dom = this.domAtPos(cursor.head + cursor.assoc);
        sel.collapse(dom.node, dom.offset);
        sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
    }
    mayControlSelection() {
        return this.view.state.facet(editable) ? this.root.activeElement == this.dom
            : hasSelection(this.dom, this.view.observer.selectionRange);
    }
    nearest(dom) {
        for (let cur = dom; cur;) {
            let domView = ContentView.get(cur);
            if (domView && domView.rootView == this)
                return domView;
            cur = cur.parentNode;
        }
        return null;
    }
    posFromDOM(node, offset) {
        let view = this.nearest(node);
        if (!view)
            throw new RangeError("Trying to find position for a DOM position outside of the document");
        return view.localPosFromDOM(node, offset) + view.posAtStart;
    }
    domAtPos(pos) {
        let { i, off } = this.childCursor().findPos(pos, -1);
        for (; i < this.children.length - 1;) {
            let child = this.children[i];
            if (off < child.length || child instanceof LineView)
                break;
            i++;
            off = 0;
        }
        return this.children[i].domAtPos(off);
    }
    coordsAt(pos, side) {
        for (let off = this.length, i = this.children.length - 1;; i--) {
            let child = this.children[i], start = off - child.breakAfter - child.length;
            if (pos > start ||
                (pos == start && child.type != BlockType.WidgetBefore && child.type != BlockType.WidgetAfter &&
                    (!i || side == 2 || this.children[i - 1].breakAfter ||
                        (this.children[i - 1].type == BlockType.WidgetBefore && side > -2))))
                return child.coordsAt(pos - start, side);
            off = start;
        }
    }
    measureVisibleLineHeights() {
        let result = [], { from, to } = this.view.viewState.viewport;
        let minWidth = Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
        for (let pos = 0, i = 0; i < this.children.length; i++) {
            let child = this.children[i], end = pos + child.length;
            if (end > to)
                break;
            if (pos >= from) {
                result.push(child.dom.getBoundingClientRect().height);
                let width = child.dom.scrollWidth;
                if (width > minWidth) {
                    this.minWidth = minWidth = width;
                    this.minWidthFrom = pos;
                    this.minWidthTo = end;
                }
            }
            pos = end + child.breakAfter;
        }
        return result;
    }
    measureTextSize() {
        for (let child of this.children) {
            if (child instanceof LineView) {
                let measure = child.measureTextSize();
                if (measure)
                    return measure;
            }
        }
        // If no workable line exists, force a layout of a measurable element
        let dummy = document.createElement("div"), lineHeight, charWidth;
        dummy.className = "cm-line";
        dummy.textContent = "abc def ghi jkl mno pqr stu";
        this.view.observer.ignore(() => {
            this.dom.appendChild(dummy);
            let rect = clientRectsFor(dummy.firstChild)[0];
            lineHeight = dummy.getBoundingClientRect().height;
            charWidth = rect ? rect.width / 27 : 7;
            dummy.remove();
        });
        return { lineHeight, charWidth };
    }
    childCursor(pos = this.length) {
        // Move back to start of last element when possible, so that
        // `ChildCursor.findPos` doesn't have to deal with the edge case
        // of being after the last element.
        let i = this.children.length;
        if (i)
            pos -= this.children[--i].length;
        return new ChildCursor(this.children, pos, i);
    }
    computeBlockGapDeco() {
        let deco = [], vs = this.view.viewState;
        for (let pos = 0, i = 0;; i++) {
            let next = i == vs.viewports.length ? null : vs.viewports[i];
            let end = next ? next.from - 1 : this.length;
            if (end > pos) {
                let height = vs.lineAt(end, 0).bottom - vs.lineAt(pos, 0).top;
                deco.push(Decoration.replace({ widget: new BlockGapWidget(height), block: true, inclusive: true }).range(pos, end));
            }
            if (!next)
                break;
            pos = next.to + 1;
        }
        return Decoration.set(deco);
    }
    updateDeco() {
        return this.decorations = [
            ...this.view.pluginField(PluginField.decorations),
            ...this.view.state.facet(decorations),
            this.compositionDeco,
            this.computeBlockGapDeco(),
            this.view.viewState.lineGapDeco
        ];
    }
    scrollIntoView({ range, center }) {
        let rect = this.coordsAt(range.head, range.empty ? range.assoc : range.head > range.anchor ? -1 : 1), other;
        if (!rect)
            return;
        if (!range.empty && (other = this.coordsAt(range.anchor, range.anchor > range.head ? -1 : 1)))
            rect = { left: Math.min(rect.left, other.left), top: Math.min(rect.top, other.top),
                right: Math.max(rect.right, other.right), bottom: Math.max(rect.bottom, other.bottom) };
        let mLeft = 0, mRight = 0, mTop = 0, mBottom = 0;
        for (let margins of this.view.pluginField(PluginField.scrollMargins))
            if (margins) {
                let { left, right, top, bottom } = margins;
                if (left != null)
                    mLeft = Math.max(mLeft, left);
                if (right != null)
                    mRight = Math.max(mRight, right);
                if (top != null)
                    mTop = Math.max(mTop, top);
                if (bottom != null)
                    mBottom = Math.max(mBottom, bottom);
            }
        scrollRectIntoView(this.view.scrollDOM, {
            left: rect.left - mLeft, top: rect.top - mTop,
            right: rect.right + mRight, bottom: rect.bottom + mBottom
        }, range.head < range.anchor ? -1 : 1, center);
    }
}
function betweenUneditable(pos) {
    return pos.node.nodeType == 1 && pos.node.firstChild &&
        (pos.offset == 0 || pos.node.childNodes[pos.offset - 1].contentEditable == "false") &&
        (pos.offset == pos.node.childNodes.length || pos.node.childNodes[pos.offset].contentEditable == "false");
}
class BlockGapWidget extends WidgetType {
    constructor(height) {
        super();
        this.height = height;
    }
    toDOM() {
        let elt = document.createElement("div");
        this.updateDOM(elt);
        return elt;
    }
    eq(other) { return other.height == this.height; }
    updateDOM(elt) {
        elt.style.height = this.height + "px";
        return true;
    }
    get estimatedHeight() { return this.height; }
}
function computeCompositionDeco(view, changes) {
    let sel = view.observer.selectionRange;
    let textNode = sel.focusNode && nearbyTextNode(sel.focusNode, sel.focusOffset, 0);
    if (!textNode)
        return Decoration.none;
    let cView = view.docView.nearest(textNode);
    let from, to, topNode = textNode;
    if (cView instanceof InlineView) {
        while (cView.parent instanceof InlineView)
            cView = cView.parent;
        from = cView.posAtStart;
        to = from + cView.length;
        topNode = cView.dom;
    }
    else if (cView instanceof LineView) {
        while (topNode.parentNode != cView.dom)
            topNode = topNode.parentNode;
        let prev = topNode.previousSibling;
        while (prev && !ContentView.get(prev))
            prev = prev.previousSibling;
        from = to = prev ? ContentView.get(prev).posAtEnd : cView.posAtStart;
    }
    else {
        return Decoration.none;
    }
    let newFrom = changes.mapPos(from, 1), newTo = Math.max(newFrom, changes.mapPos(to, -1));
    let text = textNode.nodeValue, { state } = view;
    if (newTo - newFrom < text.length) {
        if (state.sliceDoc(newFrom, Math.min(state.doc.length, newFrom + text.length)) == text)
            newTo = newFrom + text.length;
        else if (state.sliceDoc(Math.max(0, newTo - text.length), newTo) == text)
            newFrom = newTo - text.length;
        else
            return Decoration.none;
    }
    else if (state.sliceDoc(newFrom, newTo) != text) {
        return Decoration.none;
    }
    return Decoration.set(Decoration.replace({ widget: new CompositionWidget(topNode, textNode) }).range(newFrom, newTo));
}
class CompositionWidget extends WidgetType {
    constructor(top, text) {
        super();
        this.top = top;
        this.text = text;
    }
    eq(other) { return this.top == other.top && this.text == other.text; }
    toDOM() { return this.top; }
    ignoreEvent() { return false; }
    get customView() { return CompositionView; }
}
function nearbyTextNode(node, offset, side) {
    for (;;) {
        if (node.nodeType == 3)
            return node;
        if (node.nodeType == 1 && offset > 0 && side <= 0) {
            node = node.childNodes[offset - 1];
            offset = maxOffset(node);
        }
        else if (node.nodeType == 1 && offset < node.childNodes.length && side >= 0) {
            node = node.childNodes[offset];
            offset = 0;
        }
        else {
            return null;
        }
    }
}
function nextToUneditable(node, offset) {
    if (node.nodeType != 1)
        return 0;
    return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 /* Before */ : 0) |
        (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 /* After */ : 0);
}
class DecorationComparator$1 {
    constructor() {
        this.changes = [];
    }
    compareRange(from, to) { addRange(from, to, this.changes); }
    comparePoint(from, to) { addRange(from, to, this.changes); }
}
function findChangedDeco(a, b, diff) {
    let comp = new DecorationComparator$1;
    RangeSet.compare(a, b, diff, comp);
    return comp.changes;
}
function inUneditable(node, inside) {
    for (let cur = node; cur && cur != inside; cur = cur.assignedSlot || cur.parentNode) {
        if (cur.nodeType == 1 && cur.contentEditable == 'false') {
            return true;
        }
    }
    return false;
}

/**
Used to indicate [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
*/
var Direction = /*@__PURE__*/(function (Direction) {
    // (These are chosen to match the base levels, in bidi algorithm
    // terms, of spans in that direction.)
    /**
    Left-to-right.
    */
    Direction[Direction["LTR"] = 0] = "LTR";
    /**
    Right-to-left.
    */
    Direction[Direction["RTL"] = 1] = "RTL";
return Direction})(Direction || (Direction = {}));
const LTR = Direction.LTR, RTL = Direction.RTL;
// Decode a string with each type encoded as log2(type)
function dec(str) {
    let result = [];
    for (let i = 0; i < str.length; i++)
        result.push(1 << +str[i]);
    return result;
}
// Character types for codepoints 0 to 0xf8
const LowTypes = /*@__PURE__*/dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
// Character types for codepoints 0x600 to 0x6f9
const ArabicTypes = /*@__PURE__*/dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
const Brackets = /*@__PURE__*/Object.create(null), BracketStack = [];
// There's a lot more in
// https://www.unicode.org/Public/UCD/latest/ucd/BidiBrackets.txt,
// which are left out to keep code size down.
for (let p of ["()", "[]", "{}"]) {
    let l = /*@__PURE__*/p.charCodeAt(0), r = /*@__PURE__*/p.charCodeAt(1);
    Brackets[l] = r;
    Brackets[r] = -l;
}
function charType(ch) {
    return ch <= 0xf7 ? LowTypes[ch] :
        0x590 <= ch && ch <= 0x5f4 ? 2 /* R */ :
            0x600 <= ch && ch <= 0x6f9 ? ArabicTypes[ch - 0x600] :
                0x6ee <= ch && ch <= 0x8ac ? 4 /* AL */ :
                    0x2000 <= ch && ch <= 0x200b ? 256 /* NI */ :
                        ch == 0x200c ? 256 /* NI */ : 1 /* L */;
}
const BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
/**
Represents a contiguous range of text that has a single direction
(as in left-to-right or right-to-left).
*/
class BidiSpan {
    /**
    @internal
    */
    constructor(
    /**
    The start of the span (relative to the start of the line).
    */
    from, 
    /**
    The end of the span.
    */
    to, 
    /**
    The ["bidi
    level"](https://unicode.org/reports/tr9/#Basic_Display_Algorithm)
    of the span (in this context, 0 means
    left-to-right, 1 means right-to-left, 2 means left-to-right
    number inside right-to-left text).
    */
    level) {
        this.from = from;
        this.to = to;
        this.level = level;
    }
    /**
    The direction of this span.
    */
    get dir() { return this.level % 2 ? RTL : LTR; }
    /**
    @internal
    */
    side(end, dir) { return (this.dir == dir) == end ? this.to : this.from; }
    /**
    @internal
    */
    static find(order, index, level, assoc) {
        let maybe = -1;
        for (let i = 0; i < order.length; i++) {
            let span = order[i];
            if (span.from <= index && span.to >= index) {
                if (span.level == level)
                    return i;
                // When multiple spans match, if assoc != 0, take the one that
                // covers that side, otherwise take the one with the minimum
                // level.
                if (maybe < 0 || (assoc != 0 ? (assoc < 0 ? span.from < index : span.to > index) : order[maybe].level > span.level))
                    maybe = i;
            }
        }
        if (maybe < 0)
            throw new RangeError("Index out of range");
        return maybe;
    }
}
// Reused array of character types
const types = [];
function computeOrder(line, direction) {
    let len = line.length, outerType = direction == LTR ? 1 /* L */ : 2 /* R */, oppositeType = direction == LTR ? 2 /* R */ : 1 /* L */;
    if (!line || outerType == 1 /* L */ && !BidiRE.test(line))
        return trivialOrder(len);
    // W1. Examine each non-spacing mark (NSM) in the level run, and
    // change the type of the NSM to the type of the previous
    // character. If the NSM is at the start of the level run, it will
    // get the type of sor.
    // W2. Search backwards from each instance of a European number
    // until the first strong type (R, L, AL, or sor) is found. If an
    // AL is found, change the type of the European number to Arabic
    // number.
    // W3. Change all ALs to R.
    // (Left after this: L, R, EN, AN, ET, CS, NI)
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
        let type = charType(line.charCodeAt(i));
        if (type == 512 /* NSM */)
            type = prev;
        else if (type == 8 /* EN */ && prevStrong == 4 /* AL */)
            type = 16 /* AN */;
        types[i] = type == 4 /* AL */ ? 2 /* R */ : type;
        if (type & 7 /* Strong */)
            prevStrong = type;
        prev = type;
    }
    // W5. A sequence of European terminators adjacent to European
    // numbers changes to all European numbers.
    // W6. Otherwise, separators and terminators change to Other
    // Neutral.
    // W7. Search backwards from each instance of a European number
    // until the first strong type (R, L, or sor) is found. If an L is
    // found, then change the type of the European number to L.
    // (Left after this: L, R, EN+AN, NI)
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
        let type = types[i];
        if (type == 128 /* CS */) {
            if (i < len - 1 && prev == types[i + 1] && (prev & 24 /* Num */))
                type = types[i] = prev;
            else
                types[i] = 256 /* NI */;
        }
        else if (type == 64 /* ET */) {
            let end = i + 1;
            while (end < len && types[end] == 64 /* ET */)
                end++;
            let replace = (i && prev == 8 /* EN */) || (end < len && types[end] == 8 /* EN */) ? (prevStrong == 1 /* L */ ? 1 /* L */ : 8 /* EN */) : 256 /* NI */;
            for (let j = i; j < end; j++)
                types[j] = replace;
            i = end - 1;
        }
        else if (type == 8 /* EN */ && prevStrong == 1 /* L */) {
            types[i] = 1 /* L */;
        }
        prev = type;
        if (type & 7 /* Strong */)
            prevStrong = type;
    }
    // N0. Process bracket pairs in an isolating run sequence
    // sequentially in the logical order of the text positions of the
    // opening paired brackets using the logic given below. Within this
    // scope, bidirectional types EN and AN are treated as R.
    for (let i = 0, sI = 0, context = 0, ch, br, type; i < len; i++) {
        // Keeps [startIndex, type, strongSeen] triples for each open
        // bracket on BracketStack.
        if (br = Brackets[ch = line.charCodeAt(i)]) {
            if (br < 0) { // Closing bracket
                for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
                    if (BracketStack[sJ + 1] == -br) {
                        let flags = BracketStack[sJ + 2];
                        let type = (flags & 2 /* EmbedInside */) ? outerType :
                            !(flags & 4 /* OppositeInside */) ? 0 :
                                (flags & 1 /* OppositeBefore */) ? oppositeType : outerType;
                        if (type)
                            types[i] = types[BracketStack[sJ]] = type;
                        sI = sJ;
                        break;
                    }
                }
            }
            else if (BracketStack.length == 189 /* MaxDepth */) {
                break;
            }
            else {
                BracketStack[sI++] = i;
                BracketStack[sI++] = ch;
                BracketStack[sI++] = context;
            }
        }
        else if ((type = types[i]) == 2 /* R */ || type == 1 /* L */) {
            let embed = type == outerType;
            context = embed ? 0 : 1 /* OppositeBefore */;
            for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
                let cur = BracketStack[sJ + 2];
                if (cur & 2 /* EmbedInside */)
                    break;
                if (embed) {
                    BracketStack[sJ + 2] |= 2 /* EmbedInside */;
                }
                else {
                    if (cur & 4 /* OppositeInside */)
                        break;
                    BracketStack[sJ + 2] |= 4 /* OppositeInside */;
                }
            }
        }
    }
    // N1. A sequence of neutrals takes the direction of the
    // surrounding strong text if the text on both sides has the same
    // direction. European and Arabic numbers act as if they were R in
    // terms of their influence on neutrals. Start-of-level-run (sor)
    // and end-of-level-run (eor) are used at level run boundaries.
    // N2. Any remaining neutrals take the embedding direction.
    // (Left after this: L, R, EN+AN)
    for (let i = 0; i < len; i++) {
        if (types[i] == 256 /* NI */) {
            let end = i + 1;
            while (end < len && types[end] == 256 /* NI */)
                end++;
            let beforeL = (i ? types[i - 1] : outerType) == 1 /* L */;
            let afterL = (end < len ? types[end] : outerType) == 1 /* L */;
            let replace = beforeL == afterL ? (beforeL ? 1 /* L */ : 2 /* R */) : outerType;
            for (let j = i; j < end; j++)
                types[j] = replace;
            i = end - 1;
        }
    }
    // Here we depart from the documented algorithm, in order to avoid
    // building up an actual levels array. Since there are only three
    // levels (0, 1, 2) in an implementation that doesn't take
    // explicit embedding into account, we can build up the order on
    // the fly, without following the level-based algorithm.
    let order = [];
    if (outerType == 1 /* L */) {
        for (let i = 0; i < len;) {
            let start = i, rtl = types[i++] != 1 /* L */;
            while (i < len && rtl == (types[i] != 1 /* L */))
                i++;
            if (rtl) {
                for (let j = i; j > start;) {
                    let end = j, l = types[--j] != 2 /* R */;
                    while (j > start && l == (types[j - 1] != 2 /* R */))
                        j--;
                    order.push(new BidiSpan(j, end, l ? 2 : 1));
                }
            }
            else {
                order.push(new BidiSpan(start, i, 0));
            }
        }
    }
    else {
        for (let i = 0; i < len;) {
            let start = i, rtl = types[i++] == 2 /* R */;
            while (i < len && rtl == (types[i] == 2 /* R */))
                i++;
            order.push(new BidiSpan(start, i, rtl ? 1 : 2));
        }
    }
    return order;
}
function trivialOrder(length) {
    return [new BidiSpan(0, length, 0)];
}
let movedOver = "";
function moveVisually(line, order, dir, start, forward) {
    var _a;
    let startIndex = start.head - line.from, spanI = -1;
    if (startIndex == 0) {
        if (!forward || !line.length)
            return null;
        if (order[0].level != dir) {
            startIndex = order[0].side(false, dir);
            spanI = 0;
        }
    }
    else if (startIndex == line.length) {
        if (forward)
            return null;
        let last = order[order.length - 1];
        if (last.level != dir) {
            startIndex = last.side(true, dir);
            spanI = order.length - 1;
        }
    }
    if (spanI < 0)
        spanI = BidiSpan.find(order, startIndex, (_a = start.bidiLevel) !== null && _a !== void 0 ? _a : -1, start.assoc);
    let span = order[spanI];
    // End of span. (But not end of line--that was checked for above.)
    if (startIndex == span.side(forward, dir)) {
        span = order[spanI += forward ? 1 : -1];
        startIndex = span.side(!forward, dir);
    }
    let indexForward = forward == (span.dir == dir);
    let nextIndex = findClusterBreak(line.text, startIndex, indexForward);
    movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
    if (nextIndex != span.side(forward, dir))
        return EditorSelection.cursor(nextIndex + line.from, indexForward ? -1 : 1, span.level);
    let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
    if (!nextSpan && span.level != dir)
        return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1, dir);
    if (nextSpan && nextSpan.level < span.level)
        return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, forward ? 1 : -1, nextSpan.level);
    return EditorSelection.cursor(nextIndex + line.from, forward ? -1 : 1, span.level);
}

function groupAt(state, pos, bias = 1) {
    let categorize = state.charCategorizer(pos);
    let line = state.doc.lineAt(pos), linePos = pos - line.from;
    if (line.length == 0)
        return EditorSelection.cursor(pos);
    if (linePos == 0)
        bias = 1;
    else if (linePos == line.length)
        bias = -1;
    let from = linePos, to = linePos;
    if (bias < 0)
        from = findClusterBreak(line.text, linePos, false);
    else
        to = findClusterBreak(line.text, linePos);
    let cat = categorize(line.text.slice(from, to));
    while (from > 0) {
        let prev = findClusterBreak(line.text, from, false);
        if (categorize(line.text.slice(prev, from)) != cat)
            break;
        from = prev;
    }
    while (to < line.length) {
        let next = findClusterBreak(line.text, to);
        if (categorize(line.text.slice(to, next)) != cat)
            break;
        to = next;
    }
    return EditorSelection.range(from + line.from, to + line.from);
}
// Search the DOM for the {node, offset} position closest to the given
// coordinates. Very inefficient and crude, but can usually be avoided
// by calling caret(Position|Range)FromPoint instead.
function getdx(x, rect) {
    return rect.left > x ? rect.left - x : Math.max(0, x - rect.right);
}
function getdy(y, rect) {
    return rect.top > y ? rect.top - y : Math.max(0, y - rect.bottom);
}
function yOverlap(a, b) {
    return a.top < b.bottom - 1 && a.bottom > b.top + 1;
}
function upTop(rect, top) {
    return top < rect.top ? { top, left: rect.left, right: rect.right, bottom: rect.bottom } : rect;
}
function upBot(rect, bottom) {
    return bottom > rect.bottom ? { top: rect.top, left: rect.left, right: rect.right, bottom } : rect;
}
function domPosAtCoords(parent, x, y) {
    let closest, closestRect, closestX, closestY;
    let above, below, aboveRect, belowRect;
    for (let child = parent.firstChild; child; child = child.nextSibling) {
        let rects = clientRectsFor(child);
        for (let i = 0; i < rects.length; i++) {
            let rect = rects[i];
            if (closestRect && yOverlap(closestRect, rect))
                rect = upTop(upBot(rect, closestRect.bottom), closestRect.top);
            let dx = getdx(x, rect), dy = getdy(y, rect);
            if (dx == 0 && dy == 0)
                return child.nodeType == 3 ? domPosInText(child, x, y) : domPosAtCoords(child, x, y);
            if (!closest || closestY > dy || closestY == dy && closestX > dx) {
                closest = child;
                closestRect = rect;
                closestX = dx;
                closestY = dy;
            }
            if (dx == 0) {
                if (y > rect.bottom && (!aboveRect || aboveRect.bottom < rect.bottom)) {
                    above = child;
                    aboveRect = rect;
                }
                else if (y < rect.top && (!belowRect || belowRect.top > rect.top)) {
                    below = child;
                    belowRect = rect;
                }
            }
            else if (aboveRect && yOverlap(aboveRect, rect)) {
                aboveRect = upBot(aboveRect, rect.bottom);
            }
            else if (belowRect && yOverlap(belowRect, rect)) {
                belowRect = upTop(belowRect, rect.top);
            }
        }
    }
    if (aboveRect && aboveRect.bottom >= y) {
        closest = above;
        closestRect = aboveRect;
    }
    else if (belowRect && belowRect.top <= y) {
        closest = below;
        closestRect = belowRect;
    }
    if (!closest)
        return { node: parent, offset: 0 };
    let clipX = Math.max(closestRect.left, Math.min(closestRect.right, x));
    if (closest.nodeType == 3)
        return domPosInText(closest, clipX, y);
    if (!closestX && closest.contentEditable == "true")
        return domPosAtCoords(closest, clipX, y);
    let offset = Array.prototype.indexOf.call(parent.childNodes, closest) +
        (x >= (closestRect.left + closestRect.right) / 2 ? 1 : 0);
    return { node: parent, offset };
}
function domPosInText(node, x, y) {
    let len = node.nodeValue.length;
    let closestOffset = -1, closestDY = 1e9, generalSide = 0;
    for (let i = 0; i < len; i++) {
        let rects = textRange(node, i, i + 1).getClientRects();
        for (let j = 0; j < rects.length; j++) {
            let rect = rects[j];
            if (rect.top == rect.bottom)
                continue;
            if (!generalSide)
                generalSide = x - rect.left;
            let dy = (rect.top > y ? rect.top - y : y - rect.bottom) - 1;
            if (rect.left - 1 <= x && rect.right + 1 >= x && dy < closestDY) {
                let right = x >= (rect.left + rect.right) / 2, after = right;
                if (browser.chrome || browser.gecko) {
                    // Check for RTL on browsers that support getting client
                    // rects for empty ranges.
                    let rectBefore = textRange(node, i).getBoundingClientRect();
                    if (rectBefore.left == rect.right)
                        after = !right;
                }
                if (dy <= 0)
                    return { node, offset: i + (after ? 1 : 0) };
                closestOffset = i + (after ? 1 : 0);
                closestDY = dy;
            }
        }
    }
    return { node, offset: closestOffset > -1 ? closestOffset : generalSide > 0 ? node.nodeValue.length : 0 };
}
function posAtCoords(view, { x, y }, precise, bias = -1) {
    var _a;
    let content = view.contentDOM.getBoundingClientRect(), block;
    let halfLine = view.defaultLineHeight / 2;
    for (let bounced = false;;) {
        block = view.blockAtHeight(y, content.top);
        if (block.top > y || block.bottom < y) {
            bias = block.top > y ? -1 : 1;
            y = Math.min(block.bottom - halfLine, Math.max(block.top + halfLine, y));
            if (bounced)
                return precise ? null : 0;
            else
                bounced = true;
        }
        if (block.type == BlockType.Text)
            break;
        y = bias > 0 ? block.bottom + halfLine : block.top - halfLine;
    }
    let lineStart = block.from;
    // Clip x to the viewport sides
    x = Math.max(content.left + 1, Math.min(content.right - 1, x));
    // If this is outside of the rendered viewport, we can't determine a position
    if (lineStart < view.viewport.from)
        return view.viewport.from == 0 ? 0 : posAtCoordsImprecise(view, content, block, x, y);
    if (lineStart > view.viewport.to)
        return view.viewport.to == view.state.doc.length ? view.state.doc.length : posAtCoordsImprecise(view, content, block, x, y);
    // Prefer ShadowRootOrDocument.elementFromPoint if present, fall back to document if not
    let doc = view.dom.ownerDocument;
    let element = (view.root.elementFromPoint ? view.root : doc).elementFromPoint(x, y);
    // There's visible editor content under the point, so we can try
    // using caret(Position|Range)FromPoint as a shortcut
    let node, offset = -1;
    if (element && view.contentDOM.contains(element) && ((_a = view.docView.nearest(element)) === null || _a === void 0 ? void 0 : _a.isEditable) != false) {
        if (doc.caretPositionFromPoint) {
            let pos = doc.caretPositionFromPoint(x, y);
            if (pos)
                ({ offsetNode: node, offset } = pos);
        }
        else if (doc.caretRangeFromPoint) {
            let range = doc.caretRangeFromPoint(x, y);
            if (range) {
                ({ startContainer: node, startOffset: offset } = range);
                if (browser.safari && isSuspiciousCaretResult(node, offset, x))
                    node = undefined;
            }
        }
    }
    // No luck, do our own (potentially expensive) search
    if (!node || !view.docView.dom.contains(node)) {
        let line = LineView.find(view.docView, lineStart);
        ({ node, offset } = domPosAtCoords(line.dom, x, y));
    }
    return view.docView.posFromDOM(node, offset);
}
function posAtCoordsImprecise(view, contentRect, block, x, y) {
    let into = Math.round((x - contentRect.left) * view.defaultCharacterWidth);
    if (view.lineWrapping && block.height > view.defaultLineHeight * 1.5) {
        let line = Math.floor((y - block.top) / view.defaultLineHeight);
        into += line * view.viewState.heightOracle.lineLength;
    }
    let content = view.state.sliceDoc(block.from, block.to);
    return block.from + findColumn(content, into, view.state.tabSize);
}
// In case of a high line height, Safari's caretRangeFromPoint treats
// the space between lines as belonging to the last character of the
// line before. This is used to detect such a result so that it can be
// ignored (issue #401).
function isSuspiciousCaretResult(node, offset, x) {
    let len;
    if (node.nodeType != 3 || offset != (len = node.nodeValue.length))
        return false;
    for (let next = node.nextSibling; next; next = next.nextSibling)
        if (next.nodeType != 1 || next.nodeName != "BR")
            return false;
    return textRange(node, len - 1, len).getBoundingClientRect().left > x;
}
function moveToLineBoundary(view, start, forward, includeWrap) {
    let line = view.state.doc.lineAt(start.head);
    let coords = !includeWrap || !view.lineWrapping ? null
        : view.coordsAtPos(start.assoc < 0 && start.head > line.from ? start.head - 1 : start.head);
    if (coords) {
        let editorRect = view.dom.getBoundingClientRect();
        let pos = view.posAtCoords({ x: forward == (view.textDirection == Direction.LTR) ? editorRect.right - 1 : editorRect.left + 1,
            y: (coords.top + coords.bottom) / 2 });
        if (pos != null)
            return EditorSelection.cursor(pos, forward ? -1 : 1);
    }
    let lineView = LineView.find(view.docView, start.head);
    let end = lineView ? (forward ? lineView.posAtEnd : lineView.posAtStart) : (forward ? line.to : line.from);
    return EditorSelection.cursor(end, forward ? -1 : 1);
}
function moveByChar(view, start, forward, by) {
    let line = view.state.doc.lineAt(start.head), spans = view.bidiSpans(line);
    for (let cur = start, check = null;;) {
        let next = moveVisually(line, spans, view.textDirection, cur, forward), char = movedOver;
        if (!next) {
            if (line.number == (forward ? view.state.doc.lines : 1))
                return cur;
            char = "\n";
            line = view.state.doc.line(line.number + (forward ? 1 : -1));
            spans = view.bidiSpans(line);
            next = EditorSelection.cursor(forward ? line.from : line.to);
        }
        if (!check) {
            if (!by)
                return next;
            check = by(char);
        }
        else if (!check(char)) {
            return cur;
        }
        cur = next;
    }
}
function byGroup(view, pos, start) {
    let categorize = view.state.charCategorizer(pos);
    let cat = categorize(start);
    return (next) => {
        let nextCat = categorize(next);
        if (cat == CharCategory.Space)
            cat = nextCat;
        return cat == nextCat;
    };
}
function moveVertically(view, start, forward, distance) {
    let startPos = start.head, dir = forward ? 1 : -1;
    if (startPos == (forward ? view.state.doc.length : 0))
        return EditorSelection.cursor(startPos);
    let goal = start.goalColumn, startY;
    let rect = view.contentDOM.getBoundingClientRect();
    let startCoords = view.coordsAtPos(startPos);
    if (startCoords) {
        if (goal == null)
            goal = startCoords.left - rect.left;
        startY = dir < 0 ? startCoords.top : startCoords.bottom;
    }
    else {
        let line = view.viewState.lineAt(startPos, view.dom.getBoundingClientRect().top);
        if (goal == null)
            goal = Math.min(rect.right - rect.left, view.defaultCharacterWidth * (startPos - line.from));
        startY = dir < 0 ? line.top : line.bottom;
    }
    let resolvedGoal = rect.left + goal;
    let dist = distance !== null && distance !== void 0 ? distance : (view.defaultLineHeight >> 1);
    for (let extra = 0;; extra += 10) {
        let curY = startY + (dist + extra) * dir;
        let pos = posAtCoords(view, { x: resolvedGoal, y: curY }, false, dir);
        if (curY < rect.top || curY > rect.bottom || (dir < 0 ? pos < startPos : pos > startPos))
            return EditorSelection.cursor(pos, undefined, undefined, goal);
    }
}
function skipAtoms(view, oldPos, pos) {
    let atoms = view.pluginField(PluginField.atomicRanges);
    for (;;) {
        let moved = false;
        for (let set of atoms) {
            set.between(pos.from - 1, pos.from + 1, (from, to, value) => {
                if (pos.from > from && pos.from < to) {
                    pos = oldPos.from > pos.from ? EditorSelection.cursor(from, 1) : EditorSelection.cursor(to, -1);
                    moved = true;
                }
            });
        }
        if (!moved)
            return pos;
    }
}

// This will also be where dragging info and such goes
class InputState {
    constructor(view) {
        this.lastKeyCode = 0;
        this.lastKeyTime = 0;
        // On Chrome Android, backspace near widgets is just completely
        // broken, and there are no key events, so we need to handle the
        // beforeinput event. Deleting stuff will often create a flurry of
        // events, and interrupting it before it is done just makes
        // subsequent events even more broken, so again, we hold off doing
        // anything until the browser is finished with whatever it is trying
        // to do.
        this.pendingAndroidKey = undefined;
        // On iOS, some keys need to have their default behavior happen
        // (after which we retroactively handle them and reset the DOM) to
        // avoid messing up the virtual keyboard state.
        this.pendingIOSKey = undefined;
        this.lastSelectionOrigin = null;
        this.lastSelectionTime = 0;
        this.lastEscPress = 0;
        this.lastContextMenu = 0;
        this.scrollHandlers = [];
        this.registeredEvents = [];
        this.customHandlers = [];
        // -1 means not in a composition. Otherwise, this counts the number
        // of changes made during the composition. The count is used to
        // avoid treating the start state of the composition, before any
        // changes have been made, as part of the composition.
        this.composing = -1;
        // Tracks whether the next change should be marked as starting the
        // composition (null means no composition, true means next is the
        // first, false means first has already been marked for this
        // composition)
        this.compositionFirstChange = null;
        this.compositionEndedAt = 0;
        this.rapidCompositionStart = false;
        this.mouseSelection = null;
        for (let type in handlers) {
            let handler = handlers[type];
            view.contentDOM.addEventListener(type, (event) => {
                if (type == "keydown" && this.keydown(view, event))
                    return;
                if (!eventBelongsToEditor(view, event) || this.ignoreDuringComposition(event))
                    return;
                if (this.mustFlushObserver(event))
                    view.observer.forceFlush();
                if (this.runCustomHandlers(type, view, event))
                    event.preventDefault();
                else
                    handler(view, event);
            });
            this.registeredEvents.push(type);
        }
        this.notifiedFocused = view.hasFocus;
        this.ensureHandlers(view);
        // On Safari adding an input event handler somehow prevents an
        // issue where the composition vanishes when you press enter.
        if (browser.safari)
            view.contentDOM.addEventListener("input", () => null);
    }
    setSelectionOrigin(origin) {
        this.lastSelectionOrigin = origin;
        this.lastSelectionTime = Date.now();
    }
    ensureHandlers(view) {
        let handlers = this.customHandlers = view.pluginField(domEventHandlers);
        for (let set of handlers) {
            for (let type in set.handlers)
                if (this.registeredEvents.indexOf(type) < 0 && type != "scroll") {
                    this.registeredEvents.push(type);
                    view.contentDOM.addEventListener(type, (event) => {
                        if (!eventBelongsToEditor(view, event))
                            return;
                        if (this.runCustomHandlers(type, view, event))
                            event.preventDefault();
                    });
                }
        }
    }
    runCustomHandlers(type, view, event) {
        for (let set of this.customHandlers) {
            let handler = set.handlers[type], handled = false;
            if (handler) {
                try {
                    handled = handler.call(set.plugin, event, view);
                }
                catch (e) {
                    logException(view.state, e);
                }
                if (handled || event.defaultPrevented) {
                    // Chrome for Android often applies a bunch of nonsensical
                    // DOM changes after an enter press, even when
                    // preventDefault-ed. This tries to ignore those.
                    if (browser.android && type == "keydown" && event.keyCode == 13)
                        view.observer.flushSoon();
                    return true;
                }
            }
        }
        return false;
    }
    runScrollHandlers(view, event) {
        for (let set of this.customHandlers) {
            let handler = set.handlers.scroll;
            if (handler) {
                try {
                    handler.call(set.plugin, event, view);
                }
                catch (e) {
                    logException(view.state, e);
                }
            }
        }
    }
    keydown(view, event) {
        // Must always run, even if a custom handler handled the event
        this.lastKeyCode = event.keyCode;
        this.lastKeyTime = Date.now();
        if (this.screenKeyEvent(view, event))
            return true;
        // Prevent the default behavior of Enter on iOS makes the
        // virtual keyboard get stuck in the wrong (lowercase)
        // state. So we let it go through, and then, in
        // applyDOMChange, notify key handlers of it and reset to
        // the state they produce.
        let pending;
        if (browser.ios && (pending = PendingKeys.find(key => key.keyCode == event.keyCode)) &&
            !(event.ctrlKey || event.altKey || event.metaKey) && !event.synthetic) {
            this.pendingIOSKey = pending;
            setTimeout(() => this.flushIOSKey(view), 250);
            return true;
        }
        return false;
    }
    flushIOSKey(view) {
        let key = this.pendingIOSKey;
        if (!key)
            return false;
        this.pendingIOSKey = undefined;
        return dispatchKey(view.contentDOM, key.key, key.keyCode);
    }
    // This causes the DOM observer to pause for a bit, and sets an
    // animation frame (which seems the most reliable way to detect
    // 'Chrome is done flailing about messing with the DOM') to fire a
    // fake key event and re-sync the view again.
    setPendingAndroidKey(view, pending) {
        this.pendingAndroidKey = pending;
        requestAnimationFrame(() => {
            let key = this.pendingAndroidKey;
            if (!key)
                return;
            this.pendingAndroidKey = undefined;
            view.observer.processRecords();
            let startState = view.state;
            dispatchKey(view.contentDOM, key.key, key.keyCode);
            if (view.state == startState)
                view.docView.reset(true);
        });
    }
    ignoreDuringComposition(event) {
        if (!/^key/.test(event.type))
            return false;
        if (this.composing > 0)
            return true;
        // See https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/.
        // On some input method editors (IMEs), the Enter key is used to
        // confirm character selection. On Safari, when Enter is pressed,
        // compositionend and keydown events are sometimes emitted in the
        // wrong order. The key event should still be ignored, even when
        // it happens after the compositionend event.
        if (browser.safari && Date.now() - this.compositionEndedAt < 500) {
            this.compositionEndedAt = 0;
            return true;
        }
        return false;
    }
    screenKeyEvent(view, event) {
        let protectedTab = event.keyCode == 9 && Date.now() < this.lastEscPress + 2000;
        if (event.keyCode == 27)
            this.lastEscPress = Date.now();
        else if (modifierCodes.indexOf(event.keyCode) < 0)
            this.lastEscPress = 0;
        return protectedTab;
    }
    mustFlushObserver(event) {
        return (event.type == "keydown" && event.keyCode != 229) ||
            event.type == "compositionend" && !browser.ios;
    }
    startMouseSelection(view, event, style) {
        if (this.mouseSelection)
            this.mouseSelection.destroy();
        this.mouseSelection = new MouseSelection(this, view, event, style);
    }
    update(update) {
        if (this.mouseSelection)
            this.mouseSelection.update(update);
        if (update.transactions.length)
            this.lastKeyCode = this.lastSelectionTime = 0;
    }
    destroy() {
        if (this.mouseSelection)
            this.mouseSelection.destroy();
    }
}
const PendingKeys = [
    { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
    { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
    { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
];
// Key codes for modifier keys
const modifierCodes = [16, 17, 18, 20, 91, 92, 224, 225];
class MouseSelection {
    constructor(inputState, view, startEvent, style) {
        this.inputState = inputState;
        this.view = view;
        this.style = style;
        this.lastEvent = startEvent;
        let doc = view.contentDOM.ownerDocument;
        doc.addEventListener("mousemove", this.move = this.move.bind(this));
        doc.addEventListener("mouseup", this.up = this.up.bind(this));
        this.extend = startEvent.shiftKey;
        this.multiple = view.state.facet(EditorState.allowMultipleSelections) && addsSelectionRange(view, startEvent);
        this.dragMove = dragMovesSelection(view, startEvent);
        this.dragging = isInPrimarySelection(view, startEvent) ? null : false;
        // When clicking outside of the selection, immediately apply the
        // effect of starting the selection
        if (this.dragging === false) {
            startEvent.preventDefault();
            this.select(startEvent);
        }
    }
    move(event) {
        if (event.buttons == 0)
            return this.destroy();
        if (this.dragging !== false)
            return;
        this.select(this.lastEvent = event);
    }
    up(event) {
        if (this.dragging == null)
            this.select(this.lastEvent);
        if (!this.dragging)
            event.preventDefault();
        this.destroy();
    }
    destroy() {
        let doc = this.view.contentDOM.ownerDocument;
        doc.removeEventListener("mousemove", this.move);
        doc.removeEventListener("mouseup", this.up);
        this.inputState.mouseSelection = null;
    }
    select(event) {
        let selection = this.style.get(event, this.extend, this.multiple);
        if (!selection.eq(this.view.state.selection) || selection.main.assoc != this.view.state.selection.main.assoc)
            this.view.dispatch({
                selection,
                userEvent: "select.pointer",
                scrollIntoView: true
            });
    }
    update(update) {
        if (update.docChanged && this.dragging)
            this.dragging = this.dragging.map(update.changes);
        if (this.style.update(update))
            setTimeout(() => this.select(this.lastEvent), 20);
    }
}
function addsSelectionRange(view, event) {
    let facet = view.state.facet(clickAddsSelectionRange);
    return facet.length ? facet[0](event) : browser.mac ? event.metaKey : event.ctrlKey;
}
function dragMovesSelection(view, event) {
    let facet = view.state.facet(dragMovesSelection$1);
    return facet.length ? facet[0](event) : browser.mac ? !event.altKey : !event.ctrlKey;
}
function isInPrimarySelection(view, event) {
    let { main } = view.state.selection;
    if (main.empty)
        return false;
    // On boundary clicks, check whether the coordinates are inside the
    // selection's client rectangles
    let sel = getSelection(view.root);
    if (sel.rangeCount == 0)
        return true;
    let rects = sel.getRangeAt(0).getClientRects();
    for (let i = 0; i < rects.length; i++) {
        let rect = rects[i];
        if (rect.left <= event.clientX && rect.right >= event.clientX &&
            rect.top <= event.clientY && rect.bottom >= event.clientY)
            return true;
    }
    return false;
}
function eventBelongsToEditor(view, event) {
    if (!event.bubbles)
        return true;
    if (event.defaultPrevented)
        return false;
    for (let node = event.target, cView; node != view.contentDOM; node = node.parentNode)
        if (!node || node.nodeType == 11 || ((cView = ContentView.get(node)) && cView.ignoreEvent(event)))
            return false;
    return true;
}
const handlers = /*@__PURE__*/Object.create(null);
// This is very crude, but unfortunately both these browsers _pretend_
// that they have a clipboard API—all the objects and methods are
// there, they just don't work, and they are hard to test.
const brokenClipboardAPI = (browser.ie && browser.ie_version < 15) ||
    (browser.ios && browser.webkit_version < 604);
function capturePaste(view) {
    let parent = view.dom.parentNode;
    if (!parent)
        return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.focus();
    setTimeout(() => {
        view.focus();
        target.remove();
        doPaste(view, target.value);
    }, 50);
}
function doPaste(view, input) {
    let { state } = view, changes, i = 1, text = state.toText(input);
    let byLine = text.lines == state.selection.ranges.length;
    let linewise = lastLinewiseCopy != null && state.selection.ranges.every(r => r.empty) && lastLinewiseCopy == text.toString();
    if (linewise) {
        let lastLine = -1;
        changes = state.changeByRange(range => {
            let line = state.doc.lineAt(range.from);
            if (line.from == lastLine)
                return { range };
            lastLine = line.from;
            let insert = state.toText((byLine ? text.line(i++).text : input) + state.lineBreak);
            return { changes: { from: line.from, insert },
                range: EditorSelection.cursor(range.from + insert.length) };
        });
    }
    else if (byLine) {
        changes = state.changeByRange(range => {
            let line = text.line(i++);
            return { changes: { from: range.from, to: range.to, insert: line.text },
                range: EditorSelection.cursor(range.from + line.length) };
        });
    }
    else {
        changes = state.replaceSelection(text);
    }
    view.dispatch(changes, {
        userEvent: "input.paste",
        scrollIntoView: true
    });
}
handlers.keydown = (view, event) => {
    view.inputState.setSelectionOrigin("select");
};
let lastTouch = 0;
handlers.touchstart = (view, e) => {
    lastTouch = Date.now();
    view.inputState.setSelectionOrigin("select.pointer");
};
handlers.touchmove = view => {
    view.inputState.setSelectionOrigin("select.pointer");
};
handlers.mousedown = (view, event) => {
    view.observer.flush();
    if (lastTouch > Date.now() - 2000)
        return; // Ignore touch interaction
    let style = null;
    for (let makeStyle of view.state.facet(mouseSelectionStyle)) {
        style = makeStyle(view, event);
        if (style)
            break;
    }
    if (!style && event.button == 0)
        style = basicMouseSelection(view, event);
    if (style) {
        if (view.root.activeElement != view.contentDOM)
            view.observer.ignore(() => focusPreventScroll(view.contentDOM));
        view.inputState.startMouseSelection(view, event, style);
    }
};
function rangeForClick(view, pos, bias, type) {
    if (type == 1) { // Single click
        return EditorSelection.cursor(pos, bias);
    }
    else if (type == 2) { // Double click
        return groupAt(view.state, pos, bias);
    }
    else { // Triple click
        let visual = LineView.find(view.docView, pos), line = view.state.doc.lineAt(visual ? visual.posAtEnd : pos);
        let from = visual ? visual.posAtStart : line.from, to = visual ? visual.posAtEnd : line.to;
        if (to < view.state.doc.length && to == line.to)
            to++;
        return EditorSelection.range(from, to);
    }
}
let insideY = (y, rect) => y >= rect.top && y <= rect.bottom;
let inside = (x, y, rect) => insideY(y, rect) && x >= rect.left && x <= rect.right;
// Try to determine, for the given coordinates, associated with the
// given position, whether they are related to the element before or
// the element after the position.
function findPositionSide(view, pos, x, y) {
    let line = LineView.find(view.docView, pos);
    if (!line)
        return 1;
    let off = pos - line.posAtStart;
    // Line boundaries point into the line
    if (off == 0)
        return 1;
    if (off == line.length)
        return -1;
    // Positions on top of an element point at that element
    let before = line.coordsAt(off, -1);
    if (before && inside(x, y, before))
        return -1;
    let after = line.coordsAt(off, 1);
    if (after && inside(x, y, after))
        return 1;
    // This is probably a line wrap point. Pick before if the point is
    // beside it.
    return before && insideY(y, before) ? -1 : 1;
}
function queryPos(view, event) {
    let pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
    return { pos, bias: findPositionSide(view, pos, event.clientX, event.clientY) };
}
const BadMouseDetail = browser.ie && browser.ie_version <= 11;
let lastMouseDown = null, lastMouseDownCount = 0, lastMouseDownTime = 0;
function getClickType(event) {
    if (!BadMouseDetail)
        return event.detail;
    let last = lastMouseDown, lastTime = lastMouseDownTime;
    lastMouseDown = event;
    lastMouseDownTime = Date.now();
    return lastMouseDownCount = !last || (lastTime > Date.now() - 400 && Math.abs(last.clientX - event.clientX) < 2 &&
        Math.abs(last.clientY - event.clientY) < 2) ? (lastMouseDownCount + 1) % 3 : 1;
}
function basicMouseSelection(view, event) {
    let start = queryPos(view, event), type = getClickType(event);
    let startSel = view.state.selection;
    let last = start, lastEvent = event;
    return {
        update(update) {
            if (update.changes) {
                if (start)
                    start.pos = update.changes.mapPos(start.pos);
                startSel = startSel.map(update.changes);
                lastEvent = null;
            }
        },
        get(event, extend, multiple) {
            let cur;
            if (lastEvent && event.clientX == lastEvent.clientX && event.clientY == lastEvent.clientY)
                cur = last;
            else {
                cur = last = queryPos(view, event);
                lastEvent = event;
            }
            if (!cur || !start)
                return startSel;
            let range = rangeForClick(view, cur.pos, cur.bias, type);
            if (start.pos != cur.pos && !extend) {
                let startRange = rangeForClick(view, start.pos, start.bias, type);
                let from = Math.min(startRange.from, range.from), to = Math.max(startRange.to, range.to);
                range = from < range.from ? EditorSelection.range(from, to) : EditorSelection.range(to, from);
            }
            if (extend)
                return startSel.replaceRange(startSel.main.extend(range.from, range.to));
            else if (multiple)
                return startSel.addRange(range);
            else
                return EditorSelection.create([range]);
        }
    };
}
handlers.dragstart = (view, event) => {
    let { selection: { main } } = view.state;
    let { mouseSelection } = view.inputState;
    if (mouseSelection)
        mouseSelection.dragging = main;
    if (event.dataTransfer) {
        event.dataTransfer.setData("Text", view.state.sliceDoc(main.from, main.to));
        event.dataTransfer.effectAllowed = "copyMove";
    }
};
function dropText(view, event, text, direct) {
    let dropPos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (dropPos == null || !text)
        return;
    event.preventDefault();
    let { mouseSelection } = view.inputState;
    let del = direct && mouseSelection && mouseSelection.dragging && mouseSelection.dragMove ?
        { from: mouseSelection.dragging.from, to: mouseSelection.dragging.to } : null;
    let ins = { from: dropPos, insert: text };
    let changes = view.state.changes(del ? [del, ins] : ins);
    view.focus();
    view.dispatch({
        changes,
        selection: { anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1) },
        userEvent: del ? "move.drop" : "input.drop"
    });
}
handlers.drop = (view, event) => {
    if (!event.dataTransfer)
        return;
    if (view.state.readOnly)
        return event.preventDefault();
    let files = event.dataTransfer.files;
    if (files && files.length) { // For a file drop, read the file's text.
        event.preventDefault();
        let text = Array(files.length), read = 0;
        let finishFile = () => {
            if (++read == files.length)
                dropText(view, event, text.filter(s => s != null).join(view.state.lineBreak), false);
        };
        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader;
            reader.onerror = finishFile;
            reader.onload = () => {
                if (!/[\x00-\x08\x0e-\x1f]{2}/.test(reader.result))
                    text[i] = reader.result;
                finishFile();
            };
            reader.readAsText(files[i]);
        }
    }
    else {
        dropText(view, event, event.dataTransfer.getData("Text"), true);
    }
};
handlers.paste = (view, event) => {
    if (view.state.readOnly)
        return event.preventDefault();
    view.observer.flush();
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
        doPaste(view, data.getData("text/plain"));
        event.preventDefault();
    }
    else {
        capturePaste(view);
    }
};
function captureCopy(view, text) {
    // The extra wrapper is somehow necessary on IE/Edge to prevent the
    // content from being mangled when it is put onto the clipboard
    let parent = view.dom.parentNode;
    if (!parent)
        return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.value = text;
    target.focus();
    target.selectionEnd = text.length;
    target.selectionStart = 0;
    setTimeout(() => {
        target.remove();
        view.focus();
    }, 50);
}
function copiedRange(state) {
    let content = [], ranges = [], linewise = false;
    for (let range of state.selection.ranges)
        if (!range.empty) {
            content.push(state.sliceDoc(range.from, range.to));
            ranges.push(range);
        }
    if (!content.length) {
        // Nothing selected, do a line-wise copy
        let upto = -1;
        for (let { from } of state.selection.ranges) {
            let line = state.doc.lineAt(from);
            if (line.number > upto) {
                content.push(line.text);
                ranges.push({ from: line.from, to: Math.min(state.doc.length, line.to + 1) });
            }
            upto = line.number;
        }
        linewise = true;
    }
    return { text: content.join(state.lineBreak), ranges, linewise };
}
let lastLinewiseCopy = null;
handlers.copy = handlers.cut = (view, event) => {
    let { text, ranges, linewise } = copiedRange(view.state);
    if (!text && !linewise)
        return;
    lastLinewiseCopy = linewise ? text : null;
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
        event.preventDefault();
        data.clearData();
        data.setData("text/plain", text);
    }
    else {
        captureCopy(view, text);
    }
    if (event.type == "cut" && !view.state.readOnly)
        view.dispatch({
            changes: ranges,
            scrollIntoView: true,
            userEvent: "delete.cut"
        });
};
handlers.focus = handlers.blur = view => {
    setTimeout(() => {
        if (view.hasFocus != view.inputState.notifiedFocused)
            view.update([]);
    }, 10);
};
handlers.beforeprint = view => {
    view.viewState.printing = true;
    view.requestMeasure();
    setTimeout(() => {
        view.viewState.printing = false;
        view.requestMeasure();
    }, 2000);
};
function forceClearComposition(view, rapid) {
    if (view.docView.compositionDeco.size) {
        view.inputState.rapidCompositionStart = rapid;
        try {
            view.update([]);
        }
        finally {
            view.inputState.rapidCompositionStart = false;
        }
    }
}
handlers.compositionstart = handlers.compositionupdate = view => {
    if (view.inputState.compositionFirstChange == null)
        view.inputState.compositionFirstChange = true;
    if (view.inputState.composing < 0) {
        if (view.docView.compositionDeco.size) {
            view.observer.flush();
            forceClearComposition(view, true);
        }
        // FIXME possibly set a timeout to clear it again on Android
        view.inputState.composing = 0;
    }
};
handlers.compositionend = view => {
    view.inputState.composing = -1;
    view.inputState.compositionEndedAt = Date.now();
    view.inputState.compositionFirstChange = null;
    setTimeout(() => {
        if (view.inputState.composing < 0)
            forceClearComposition(view, false);
    }, 50);
};
handlers.contextmenu = view => {
    view.inputState.lastContextMenu = Date.now();
};
handlers.beforeinput = (view, event) => {
    var _a;
    // Because Chrome Android doesn't fire useful key events, use
    // beforeinput to detect backspace (and possibly enter and delete,
    // but those usually don't even seem to fire beforeinput events at
    // the moment) and fake a key event for it.
    //
    // (preventDefault on beforeinput, though supported in the spec,
    // seems to do nothing at all on Chrome).
    let pending;
    if (browser.chrome && browser.android && (pending = PendingKeys.find(key => key.inputType == event.inputType))) {
        view.inputState.setPendingAndroidKey(view, pending);
        if (pending.key == "Backspace" || pending.key == "Delete") {
            let startViewHeight = ((_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.height) || 0;
            setTimeout(() => {
                var _a;
                // Backspacing near uneditable nodes on Chrome Android sometimes
                // closes the virtual keyboard. This tries to crudely detect
                // that and refocus to get it back.
                if ((((_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.height) || 0) > startViewHeight + 10 && view.hasFocus) {
                    view.contentDOM.blur();
                    view.focus();
                }
            }, 100);
        }
    }
};

const wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line", "break-spaces"];
class HeightOracle {
    constructor() {
        this.doc = Text.empty;
        this.lineWrapping = false;
        this.direction = Direction.LTR;
        this.heightSamples = {};
        this.lineHeight = 14;
        this.charWidth = 7;
        this.lineLength = 30;
        // Used to track, during updateHeight, if any actual heights changed
        this.heightChanged = false;
    }
    heightForGap(from, to) {
        let lines = this.doc.lineAt(to).number - this.doc.lineAt(from).number + 1;
        if (this.lineWrapping)
            lines += Math.ceil(((to - from) - (lines * this.lineLength * 0.5)) / this.lineLength);
        return this.lineHeight * lines;
    }
    heightForLine(length) {
        if (!this.lineWrapping)
            return this.lineHeight;
        let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / (this.lineLength - 5)));
        return lines * this.lineHeight;
    }
    setDoc(doc) { this.doc = doc; return this; }
    mustRefresh(lineHeights, whiteSpace, direction) {
        let newHeight = false;
        for (let i = 0; i < lineHeights.length; i++) {
            let h = lineHeights[i];
            if (h < 0) {
                i++;
            }
            else if (!this.heightSamples[Math.floor(h * 10)]) { // Round to .1 pixels
                newHeight = true;
                this.heightSamples[Math.floor(h * 10)] = true;
            }
        }
        return newHeight || (wrappingWhiteSpace.indexOf(whiteSpace) > -1) != this.lineWrapping || this.direction != direction;
    }
    refresh(whiteSpace, direction, lineHeight, charWidth, lineLength, knownHeights) {
        let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
        let changed = Math.round(lineHeight) != Math.round(this.lineHeight) ||
            this.lineWrapping != lineWrapping ||
            this.direction != direction;
        this.lineWrapping = lineWrapping;
        this.direction = direction;
        this.lineHeight = lineHeight;
        this.charWidth = charWidth;
        this.lineLength = lineLength;
        if (changed) {
            this.heightSamples = {};
            for (let i = 0; i < knownHeights.length; i++) {
                let h = knownHeights[i];
                if (h < 0)
                    i++;
                else
                    this.heightSamples[Math.floor(h * 10)] = true;
            }
        }
        return changed;
    }
}
// This object is used by `updateHeight` to make DOM measurements
// arrive at the right nides. The `heights` array is a sequence of
// block heights, starting from position `from`.
class MeasuredHeights {
    constructor(from, heights) {
        this.from = from;
        this.heights = heights;
        this.index = 0;
    }
    get more() { return this.index < this.heights.length; }
}
/**
Record used to represent information about a block-level element
in the editor view.
*/
class BlockInfo {
    /**
    @internal
    */
    constructor(
    /**
    The start of the element in the document.
    */
    from, 
    /**
    The length of the element.
    */
    length, 
    /**
    The top position of the element.
    */
    top, 
    /**
    Its height.
    */
    height, 
    /**
    The type of element this is. When querying lines, this may be
    an array of all the blocks that make up the line.
    */
    type) {
        this.from = from;
        this.length = length;
        this.top = top;
        this.height = height;
        this.type = type;
    }
    /**
    The end of the element as a document position.
    */
    get to() { return this.from + this.length; }
    /**
    The bottom position of the element.
    */
    get bottom() { return this.top + this.height; }
    /**
    @internal
    */
    join(other) {
        let detail = (Array.isArray(this.type) ? this.type : [this])
            .concat(Array.isArray(other.type) ? other.type : [other]);
        return new BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, detail);
    }
}
var QueryType = /*@__PURE__*/(function (QueryType) {
    QueryType[QueryType["ByPos"] = 0] = "ByPos";
    QueryType[QueryType["ByHeight"] = 1] = "ByHeight";
    QueryType[QueryType["ByPosNoHeight"] = 2] = "ByPosNoHeight";
return QueryType})(QueryType || (QueryType = {}));
const Epsilon = 1e-4;
class HeightMap {
    constructor(length, // The number of characters covered
    height, // Height of this part of the document
    flags = 2 /* Outdated */) {
        this.length = length;
        this.height = height;
        this.flags = flags;
    }
    get outdated() { return (this.flags & 2 /* Outdated */) > 0; }
    set outdated(value) { this.flags = (value ? 2 /* Outdated */ : 0) | (this.flags & ~2 /* Outdated */); }
    setHeight(oracle, height) {
        if (this.height != height) {
            if (Math.abs(this.height - height) > Epsilon)
                oracle.heightChanged = true;
            this.height = height;
        }
    }
    // Base case is to replace a leaf node, which simply builds a tree
    // from the new nodes and returns that (HeightMapBranch and
    // HeightMapGap override this to actually use from/to)
    replace(_from, _to, nodes) {
        return HeightMap.of(nodes);
    }
    // Again, these are base cases, and are overridden for branch and gap nodes.
    decomposeLeft(_to, result) { result.push(this); }
    decomposeRight(_from, result) { result.push(this); }
    applyChanges(decorations, oldDoc, oracle, changes) {
        let me = this;
        for (let i = changes.length - 1; i >= 0; i--) {
            let { fromA, toA, fromB, toB } = changes[i];
            let start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
            let end = start.to >= toA ? start : me.lineAt(toA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
            toB += end.to - toA;
            toA = end.to;
            while (i > 0 && start.from <= changes[i - 1].toA) {
                fromA = changes[i - 1].fromA;
                fromB = changes[i - 1].fromB;
                i--;
                if (fromA < start.from)
                    start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
            }
            fromB += start.from - fromA;
            fromA = start.from;
            let nodes = NodeBuilder.build(oracle, decorations, fromB, toB);
            me = me.replace(fromA, toA, nodes);
        }
        return me.updateHeight(oracle, 0);
    }
    static empty() { return new HeightMapText(0, 0); }
    // nodes uses null values to indicate the position of line breaks.
    // There are never line breaks at the start or end of the array, or
    // two line breaks next to each other, and the array isn't allowed
    // to be empty (same restrictions as return value from the builder).
    static of(nodes) {
        if (nodes.length == 1)
            return nodes[0];
        let i = 0, j = nodes.length, before = 0, after = 0;
        for (;;) {
            if (i == j) {
                if (before > after * 2) {
                    let split = nodes[i - 1];
                    if (split.break)
                        nodes.splice(--i, 1, split.left, null, split.right);
                    else
                        nodes.splice(--i, 1, split.left, split.right);
                    j += 1 + split.break;
                    before -= split.size;
                }
                else if (after > before * 2) {
                    let split = nodes[j];
                    if (split.break)
                        nodes.splice(j, 1, split.left, null, split.right);
                    else
                        nodes.splice(j, 1, split.left, split.right);
                    j += 2 + split.break;
                    after -= split.size;
                }
                else {
                    break;
                }
            }
            else if (before < after) {
                let next = nodes[i++];
                if (next)
                    before += next.size;
            }
            else {
                let next = nodes[--j];
                if (next)
                    after += next.size;
            }
        }
        let brk = 0;
        if (nodes[i - 1] == null) {
            brk = 1;
            i--;
        }
        else if (nodes[i] == null) {
            brk = 1;
            j++;
        }
        return new HeightMapBranch(HeightMap.of(nodes.slice(0, i)), brk, HeightMap.of(nodes.slice(j)));
    }
}
HeightMap.prototype.size = 1;
class HeightMapBlock extends HeightMap {
    constructor(length, height, type) {
        super(length, height);
        this.type = type;
    }
    blockAt(_height, _doc, top, offset) {
        return new BlockInfo(offset, this.length, top, this.height, this.type);
    }
    lineAt(_value, _type, doc, top, offset) {
        return this.blockAt(0, doc, top, offset);
    }
    forEachLine(_from, _to, doc, top, offset, f) {
        f(this.blockAt(0, doc, top, offset));
    }
    updateHeight(oracle, offset = 0, _force = false, measured) {
        if (measured && measured.from <= offset && measured.more)
            this.setHeight(oracle, measured.heights[measured.index++]);
        this.outdated = false;
        return this;
    }
    toString() { return `block(${this.length})`; }
}
class HeightMapText extends HeightMapBlock {
    constructor(length, height) {
        super(length, height, BlockType.Text);
        this.collapsed = 0; // Amount of collapsed content in the line
        this.widgetHeight = 0; // Maximum inline widget height
    }
    replace(_from, _to, nodes) {
        let node = nodes[0];
        if (nodes.length == 1 && (node instanceof HeightMapText || node instanceof HeightMapGap && (node.flags & 4 /* SingleLine */)) &&
            Math.abs(this.length - node.length) < 10) {
            if (node instanceof HeightMapGap)
                node = new HeightMapText(node.length, this.height);
            else
                node.height = this.height;
            if (!this.outdated)
                node.outdated = false;
            return node;
        }
        else {
            return HeightMap.of(nodes);
        }
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
        if (measured && measured.from <= offset && measured.more)
            this.setHeight(oracle, measured.heights[measured.index++]);
        else if (force || this.outdated)
            this.setHeight(oracle, Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)));
        this.outdated = false;
        return this;
    }
    toString() {
        return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
    }
}
class HeightMapGap extends HeightMap {
    constructor(length) { super(length, 0); }
    lines(doc, offset) {
        let firstLine = doc.lineAt(offset).number, lastLine = doc.lineAt(offset + this.length).number;
        return { firstLine, lastLine, lineHeight: this.height / (lastLine - firstLine + 1) };
    }
    blockAt(height, doc, top, offset) {
        let { firstLine, lastLine, lineHeight } = this.lines(doc, offset);
        let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top) / lineHeight)));
        let { from, length } = doc.line(firstLine + line);
        return new BlockInfo(from, length, top + lineHeight * line, lineHeight, BlockType.Text);
    }
    lineAt(value, type, doc, top, offset) {
        if (type == QueryType.ByHeight)
            return this.blockAt(value, doc, top, offset);
        if (type == QueryType.ByPosNoHeight) {
            let { from, to } = doc.lineAt(value);
            return new BlockInfo(from, to - from, 0, 0, BlockType.Text);
        }
        let { firstLine, lineHeight } = this.lines(doc, offset);
        let { from, length, number } = doc.lineAt(value);
        return new BlockInfo(from, length, top + lineHeight * (number - firstLine), lineHeight, BlockType.Text);
    }
    forEachLine(from, to, doc, top, offset, f) {
        let { firstLine, lineHeight } = this.lines(doc, offset);
        for (let pos = Math.max(from, offset), end = Math.min(offset + this.length, to); pos <= end;) {
            let line = doc.lineAt(pos);
            if (pos == from)
                top += lineHeight * (line.number - firstLine);
            f(new BlockInfo(line.from, line.length, top, lineHeight, BlockType.Text));
            top += lineHeight;
            pos = line.to + 1;
        }
    }
    replace(from, to, nodes) {
        let after = this.length - to;
        if (after > 0) {
            let last = nodes[nodes.length - 1];
            if (last instanceof HeightMapGap)
                nodes[nodes.length - 1] = new HeightMapGap(last.length + after);
            else
                nodes.push(null, new HeightMapGap(after - 1));
        }
        if (from > 0) {
            let first = nodes[0];
            if (first instanceof HeightMapGap)
                nodes[0] = new HeightMapGap(from + first.length);
            else
                nodes.unshift(new HeightMapGap(from - 1), null);
        }
        return HeightMap.of(nodes);
    }
    decomposeLeft(to, result) {
        result.push(new HeightMapGap(to - 1), null);
    }
    decomposeRight(from, result) {
        result.push(null, new HeightMapGap(this.length - from - 1));
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
        let end = offset + this.length;
        if (measured && measured.from <= offset + this.length && measured.more) {
            // Fill in part of this gap with measured lines. We know there
            // can't be widgets or collapsed ranges in those lines, because
            // they would already have been added to the heightmap (gaps
            // only contain plain text).
            let nodes = [], pos = Math.max(offset, measured.from);
            if (measured.from > offset)
                nodes.push(new HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
            while (pos <= end && measured.more) {
                let len = oracle.doc.lineAt(pos).length;
                if (nodes.length)
                    nodes.push(null);
                let line = new HeightMapText(len, measured.heights[measured.index++]);
                line.outdated = false;
                nodes.push(line);
                pos += len + 1;
            }
            if (pos <= end)
                nodes.push(null, new HeightMapGap(end - pos).updateHeight(oracle, pos));
            oracle.heightChanged = true;
            return HeightMap.of(nodes);
        }
        else if (force || this.outdated) {
            this.setHeight(oracle, oracle.heightForGap(offset, offset + this.length));
            this.outdated = false;
        }
        return this;
    }
    toString() { return `gap(${this.length})`; }
}
class HeightMapBranch extends HeightMap {
    constructor(left, brk, right) {
        super(left.length + brk + right.length, left.height + right.height, brk | (left.outdated || right.outdated ? 2 /* Outdated */ : 0));
        this.left = left;
        this.right = right;
        this.size = left.size + right.size;
    }
    get break() { return this.flags & 1 /* Break */; }
    blockAt(height, doc, top, offset) {
        let mid = top + this.left.height;
        return height < mid || this.right.height == 0 ? this.left.blockAt(height, doc, top, offset)
            : this.right.blockAt(height, doc, mid, offset + this.left.length + this.break);
    }
    lineAt(value, type, doc, top, offset) {
        let rightTop = top + this.left.height, rightOffset = offset + this.left.length + this.break;
        let left = type == QueryType.ByHeight ? value < rightTop || this.right.height == 0 : value < rightOffset;
        let base = left ? this.left.lineAt(value, type, doc, top, offset)
            : this.right.lineAt(value, type, doc, rightTop, rightOffset);
        if (this.break || (left ? base.to < rightOffset : base.from > rightOffset))
            return base;
        let subQuery = type == QueryType.ByPosNoHeight ? QueryType.ByPosNoHeight : QueryType.ByPos;
        if (left)
            return base.join(this.right.lineAt(rightOffset, subQuery, doc, rightTop, rightOffset));
        else
            return this.left.lineAt(rightOffset, subQuery, doc, top, offset).join(base);
    }
    forEachLine(from, to, doc, top, offset, f) {
        let rightTop = top + this.left.height, rightOffset = offset + this.left.length + this.break;
        if (this.break) {
            if (from < rightOffset)
                this.left.forEachLine(from, to, doc, top, offset, f);
            if (to >= rightOffset)
                this.right.forEachLine(from, to, doc, rightTop, rightOffset, f);
        }
        else {
            let mid = this.lineAt(rightOffset, QueryType.ByPos, doc, top, offset);
            if (from < mid.from)
                this.left.forEachLine(from, mid.from - 1, doc, top, offset, f);
            if (mid.to >= from && mid.from <= to)
                f(mid);
            if (to > mid.to)
                this.right.forEachLine(mid.to + 1, to, doc, rightTop, rightOffset, f);
        }
    }
    replace(from, to, nodes) {
        let rightStart = this.left.length + this.break;
        if (to < rightStart)
            return this.balanced(this.left.replace(from, to, nodes), this.right);
        if (from > this.left.length)
            return this.balanced(this.left, this.right.replace(from - rightStart, to - rightStart, nodes));
        let result = [];
        if (from > 0)
            this.decomposeLeft(from, result);
        let left = result.length;
        for (let node of nodes)
            result.push(node);
        if (from > 0)
            mergeGaps(result, left - 1);
        if (to < this.length) {
            let right = result.length;
            this.decomposeRight(to, result);
            mergeGaps(result, right);
        }
        return HeightMap.of(result);
    }
    decomposeLeft(to, result) {
        let left = this.left.length;
        if (to <= left)
            return this.left.decomposeLeft(to, result);
        result.push(this.left);
        if (this.break) {
            left++;
            if (to >= left)
                result.push(null);
        }
        if (to > left)
            this.right.decomposeLeft(to - left, result);
    }
    decomposeRight(from, result) {
        let left = this.left.length, right = left + this.break;
        if (from >= right)
            return this.right.decomposeRight(from - right, result);
        if (from < left)
            this.left.decomposeRight(from, result);
        if (this.break && from < right)
            result.push(null);
        result.push(this.right);
    }
    balanced(left, right) {
        if (left.size > 2 * right.size || right.size > 2 * left.size)
            return HeightMap.of(this.break ? [left, null, right] : [left, right]);
        this.left = left;
        this.right = right;
        this.height = left.height + right.height;
        this.outdated = left.outdated || right.outdated;
        this.size = left.size + right.size;
        this.length = left.length + this.break + right.length;
        return this;
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
        let { left, right } = this, rightStart = offset + left.length + this.break, rebalance = null;
        if (measured && measured.from <= offset + left.length && measured.more)
            rebalance = left = left.updateHeight(oracle, offset, force, measured);
        else
            left.updateHeight(oracle, offset, force);
        if (measured && measured.from <= rightStart + right.length && measured.more)
            rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
        else
            right.updateHeight(oracle, rightStart, force);
        if (rebalance)
            return this.balanced(left, right);
        this.height = this.left.height + this.right.height;
        this.outdated = false;
        return this;
    }
    toString() { return this.left + (this.break ? " " : "-") + this.right; }
}
function mergeGaps(nodes, around) {
    let before, after;
    if (nodes[around] == null &&
        (before = nodes[around - 1]) instanceof HeightMapGap &&
        (after = nodes[around + 1]) instanceof HeightMapGap)
        nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
}
const relevantWidgetHeight = 5;
class NodeBuilder {
    constructor(pos, oracle) {
        this.pos = pos;
        this.oracle = oracle;
        this.nodes = [];
        this.lineStart = -1;
        this.lineEnd = -1;
        this.covering = null;
        this.writtenTo = pos;
    }
    get isCovered() {
        return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
    }
    span(_from, to) {
        if (this.lineStart > -1) {
            let end = Math.min(to, this.lineEnd), last = this.nodes[this.nodes.length - 1];
            if (last instanceof HeightMapText)
                last.length += end - this.pos;
            else if (end > this.pos || !this.isCovered)
                this.nodes.push(new HeightMapText(end - this.pos, -1));
            this.writtenTo = end;
            if (to > end) {
                this.nodes.push(null);
                this.writtenTo++;
                this.lineStart = -1;
            }
        }
        this.pos = to;
    }
    point(from, to, deco) {
        if (from < to || deco.heightRelevant) {
            let height = deco.widget ? Math.max(0, deco.widget.estimatedHeight) : 0;
            let len = to - from;
            if (deco.block) {
                this.addBlock(new HeightMapBlock(len, height, deco.type));
            }
            else if (len || height >= relevantWidgetHeight) {
                this.addLineDeco(height, len);
            }
        }
        else if (to > from) {
            this.span(from, to);
        }
        if (this.lineEnd > -1 && this.lineEnd < this.pos)
            this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
    }
    enterLine() {
        if (this.lineStart > -1)
            return;
        let { from, to } = this.oracle.doc.lineAt(this.pos);
        this.lineStart = from;
        this.lineEnd = to;
        if (this.writtenTo < from) {
            if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
                this.nodes.push(this.blankContent(this.writtenTo, from - 1));
            this.nodes.push(null);
        }
        if (this.pos > from)
            this.nodes.push(new HeightMapText(this.pos - from, -1));
        this.writtenTo = this.pos;
    }
    blankContent(from, to) {
        let gap = new HeightMapGap(to - from);
        if (this.oracle.doc.lineAt(from).to == to)
            gap.flags |= 4 /* SingleLine */;
        return gap;
    }
    ensureLine() {
        this.enterLine();
        let last = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
        if (last instanceof HeightMapText)
            return last;
        let line = new HeightMapText(0, -1);
        this.nodes.push(line);
        return line;
    }
    addBlock(block) {
        this.enterLine();
        if (block.type == BlockType.WidgetAfter && !this.isCovered)
            this.ensureLine();
        this.nodes.push(block);
        this.writtenTo = this.pos = this.pos + block.length;
        if (block.type != BlockType.WidgetBefore)
            this.covering = block;
    }
    addLineDeco(height, length) {
        let line = this.ensureLine();
        line.length += length;
        line.collapsed += length;
        line.widgetHeight = Math.max(line.widgetHeight, height);
        this.writtenTo = this.pos = this.pos + length;
    }
    finish(from) {
        let last = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
        if (this.lineStart > -1 && !(last instanceof HeightMapText) && !this.isCovered)
            this.nodes.push(new HeightMapText(0, -1));
        else if (this.writtenTo < this.pos || last == null)
            this.nodes.push(this.blankContent(this.writtenTo, this.pos));
        let pos = from;
        for (let node of this.nodes) {
            if (node instanceof HeightMapText)
                node.updateHeight(this.oracle, pos);
            pos += node ? node.length : 1;
        }
        return this.nodes;
    }
    // Always called with a region that on both sides either stretches
    // to a line break or the end of the document.
    // The returned array uses null to indicate line breaks, but never
    // starts or ends in a line break, or has multiple line breaks next
    // to each other.
    static build(oracle, decorations, from, to) {
        let builder = new NodeBuilder(from, oracle);
        RangeSet.spans(decorations, from, to, builder, 0);
        return builder.finish(from);
    }
}
function heightRelevantDecoChanges(a, b, diff) {
    let comp = new DecorationComparator;
    RangeSet.compare(a, b, diff, comp, 0);
    return comp.changes;
}
class DecorationComparator {
    constructor() {
        this.changes = [];
    }
    compareRange() { }
    comparePoint(from, to, a, b) {
        if (from < to || a && a.heightRelevant || b && b.heightRelevant)
            addRange(from, to, this.changes, 5);
    }
}

function visiblePixelRange(dom, paddingTop) {
    let rect = dom.getBoundingClientRect();
    let left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
    let top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
    let body = dom.ownerDocument.body;
    for (let parent = dom.parentNode; parent && parent != body;) {
        if (parent.nodeType == 1) {
            let elt = parent;
            let style = window.getComputedStyle(elt);
            if ((elt.scrollHeight > elt.clientHeight || elt.scrollWidth > elt.clientWidth) &&
                style.overflow != "visible") {
                let parentRect = elt.getBoundingClientRect();
                left = Math.max(left, parentRect.left);
                right = Math.min(right, parentRect.right);
                top = Math.max(top, parentRect.top);
                bottom = Math.min(bottom, parentRect.bottom);
            }
            parent = style.position == "absolute" || style.position == "fixed" ? elt.offsetParent : elt.parentNode;
        }
        else if (parent.nodeType == 11) { // Shadow root
            parent = parent.host;
        }
        else {
            break;
        }
    }
    return { left: left - rect.left, right: right - rect.left,
        top: top - (rect.top + paddingTop), bottom: bottom - (rect.top + paddingTop) };
}
// Line gaps are placeholder widgets used to hide pieces of overlong
// lines within the viewport, as a kludge to keep the editor
// responsive when a ridiculously long line is loaded into it.
class LineGap {
    constructor(from, to, size) {
        this.from = from;
        this.to = to;
        this.size = size;
    }
    static same(a, b) {
        if (a.length != b.length)
            return false;
        for (let i = 0; i < a.length; i++) {
            let gA = a[i], gB = b[i];
            if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
                return false;
        }
        return true;
    }
    draw(wrapping) {
        return Decoration.replace({ widget: new LineGapWidget(this.size, wrapping) }).range(this.from, this.to);
    }
}
class LineGapWidget extends WidgetType {
    constructor(size, vertical) {
        super();
        this.size = size;
        this.vertical = vertical;
    }
    eq(other) { return other.size == this.size && other.vertical == this.vertical; }
    toDOM() {
        let elt = document.createElement("div");
        if (this.vertical) {
            elt.style.height = this.size + "px";
        }
        else {
            elt.style.width = this.size + "px";
            elt.style.height = "2px";
            elt.style.display = "inline-block";
        }
        return elt;
    }
    get estimatedHeight() { return this.vertical ? this.size : -1; }
}
class ScrollTarget {
    constructor(range, center = false) {
        this.range = range;
        this.center = center;
    }
    map(changes) {
        return changes.empty ? this : new ScrollTarget(this.range.map(changes), this.center);
    }
}
class ViewState {
    constructor(state) {
        this.state = state;
        // These are contentDOM-local coordinates
        this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 };
        this.inView = true;
        this.paddingTop = 0;
        this.paddingBottom = 0;
        this.contentWidth = 0;
        this.editorHeight = 0;
        this.heightOracle = new HeightOracle;
        // See VP.MaxDOMHeight
        this.scaler = IdScaler;
        this.scrollTarget = null;
        // Briefly set to true when printing, to disable viewport limiting
        this.printing = false;
        this.visibleRanges = [];
        // Cursor 'assoc' is only significant when the cursor is on a line
        // wrap point, where it must stick to the character that it is
        // associated with. Since browsers don't provide a reasonable
        // interface to set or query this, when a selection is set that
        // might cause this to be significant, this flag is set. The next
        // measure phase will check whether the cursor is on a line-wrapping
        // boundary and, if so, reset it to make sure it is positioned in
        // the right place.
        this.mustEnforceCursorAssoc = false;
        this.heightMap = HeightMap.empty().applyChanges(state.facet(decorations), Text.empty, this.heightOracle.setDoc(state.doc), [new ChangedRange(0, 0, 0, state.doc.length)]);
        this.viewport = this.getViewport(0, null);
        this.updateForViewport();
        this.lineGaps = this.ensureLineGaps([]);
        this.lineGapDeco = Decoration.set(this.lineGaps.map(gap => gap.draw(false)));
        this.computeVisibleRanges();
    }
    updateForViewport() {
        let viewports = [this.viewport], { main } = this.state.selection;
        for (let i = 0; i <= 1; i++) {
            let pos = i ? main.head : main.anchor;
            if (!viewports.some(({ from, to }) => pos >= from && pos <= to)) {
                let { from, to } = this.lineAt(pos, 0);
                viewports.push(new Viewport(from, to));
            }
        }
        this.viewports = viewports.sort((a, b) => a.from - b.from);
        this.scaler = this.heightMap.height <= 7000000 /* MaxDOMHeight */ ? IdScaler :
            new BigScaler(this.heightOracle.doc, this.heightMap, this.viewports);
    }
    update(update, scrollTarget = null) {
        let prev = this.state;
        this.state = update.state;
        let newDeco = this.state.facet(decorations);
        let contentChanges = update.changedRanges;
        let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(update.startState.facet(decorations), newDeco, update ? update.changes : ChangeSet.empty(this.state.doc.length)));
        let prevHeight = this.heightMap.height;
        this.heightMap = this.heightMap.applyChanges(newDeco, prev.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
        if (this.heightMap.height != prevHeight)
            update.flags |= 2 /* Height */;
        let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
        if (scrollTarget && (scrollTarget.range.head < viewport.from || scrollTarget.range.head > viewport.to) ||
            !this.viewportIsAppropriate(viewport))
            viewport = this.getViewport(0, scrollTarget);
        this.viewport = viewport;
        this.updateForViewport();
        if (this.lineGaps.length || this.viewport.to - this.viewport.from > 4000 /* DoubleMargin */)
            this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update.changes)));
        update.flags |= this.computeVisibleRanges();
        if (scrollTarget)
            this.scrollTarget = scrollTarget;
        if (!this.mustEnforceCursorAssoc && update.selectionSet && update.view.lineWrapping &&
            update.state.selection.main.empty && update.state.selection.main.assoc)
            this.mustEnforceCursorAssoc = true;
    }
    measure(docView, repeated) {
        let dom = docView.dom, whiteSpace = "", direction = Direction.LTR;
        let result = 0;
        if (!repeated) {
            // Vertical padding
            let style = window.getComputedStyle(dom);
            whiteSpace = style.whiteSpace, direction = (style.direction == "rtl" ? Direction.RTL : Direction.LTR);
            let paddingTop = parseInt(style.paddingTop) || 0, paddingBottom = parseInt(style.paddingBottom) || 0;
            if (this.paddingTop != paddingTop || this.paddingBottom != paddingBottom) {
                result |= 8 /* Geometry */;
                this.paddingTop = paddingTop;
                this.paddingBottom = paddingBottom;
            }
        }
        // Pixel viewport
        let pixelViewport = this.printing ? { top: -1e8, bottom: 1e8, left: -1e8, right: 1e8 } : visiblePixelRange(dom, this.paddingTop);
        let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
        this.pixelViewport = pixelViewport;
        this.inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
        if (!this.inView)
            return 0;
        let lineHeights = docView.measureVisibleLineHeights();
        let refresh = false, bias = 0, oracle = this.heightOracle;
        if (!repeated) {
            let contentWidth = docView.dom.clientWidth;
            if (oracle.mustRefresh(lineHeights, whiteSpace, direction) ||
                oracle.lineWrapping && Math.abs(contentWidth - this.contentWidth) > oracle.charWidth) {
                let { lineHeight, charWidth } = docView.measureTextSize();
                refresh = oracle.refresh(whiteSpace, direction, lineHeight, charWidth, contentWidth / charWidth, lineHeights);
                if (refresh) {
                    docView.minWidth = 0;
                    result |= 8 /* Geometry */;
                }
            }
            if (this.contentWidth != contentWidth) {
                this.contentWidth = contentWidth;
                result |= 8 /* Geometry */;
            }
            if (this.editorHeight != docView.view.scrollDOM.clientHeight) {
                this.editorHeight = docView.view.scrollDOM.clientHeight;
                result |= 8 /* Geometry */;
            }
            if (dTop > 0 && dBottom > 0)
                bias = Math.max(dTop, dBottom);
            else if (dTop < 0 && dBottom < 0)
                bias = Math.min(dTop, dBottom);
        }
        oracle.heightChanged = false;
        this.heightMap = this.heightMap.updateHeight(oracle, 0, refresh, new MeasuredHeights(this.viewport.from, lineHeights));
        if (oracle.heightChanged)
            result |= 2 /* Height */;
        if (!this.viewportIsAppropriate(this.viewport, bias) ||
            this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to))
            this.viewport = this.getViewport(bias, this.scrollTarget);
        this.updateForViewport();
        if (this.lineGaps.length || this.viewport.to - this.viewport.from > 4000 /* DoubleMargin */)
            this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps));
        result |= this.computeVisibleRanges();
        if (this.mustEnforceCursorAssoc) {
            this.mustEnforceCursorAssoc = false;
            // This is done in the read stage, because moving the selection
            // to a line end is going to trigger a layout anyway, so it
            // can't be a pure write. It should be rare that it does any
            // writing.
            docView.enforceCursorAssoc();
        }
        return result;
    }
    get visibleTop() { return this.scaler.fromDOM(this.pixelViewport.top, 0); }
    get visibleBottom() { return this.scaler.fromDOM(this.pixelViewport.bottom, 0); }
    getViewport(bias, scrollTarget) {
        // This will divide VP.Margin between the top and the
        // bottom, depending on the bias (the change in viewport position
        // since the last update). It'll hold a number between 0 and 1
        let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1000 /* Margin */ / 2));
        let map = this.heightMap, doc = this.state.doc, { visibleTop, visibleBottom } = this;
        let viewport = new Viewport(map.lineAt(visibleTop - marginTop * 1000 /* Margin */, QueryType.ByHeight, doc, 0, 0).from, map.lineAt(visibleBottom + (1 - marginTop) * 1000 /* Margin */, QueryType.ByHeight, doc, 0, 0).to);
        // If scrollTarget is given, make sure the viewport includes that position
        if (scrollTarget) {
            let { head } = scrollTarget.range, viewHeight = visibleBottom - visibleTop;
            if (head < viewport.from || head > viewport.to) {
                let block = map.lineAt(head, QueryType.ByPos, doc, 0, 0), topPos;
                if (scrollTarget.center)
                    topPos = (block.top + block.bottom) / 2 - viewHeight / 2;
                else if (head < viewport.from)
                    topPos = block.top;
                else
                    topPos = block.bottom - viewHeight;
                viewport = new Viewport(map.lineAt(topPos - 1000 /* Margin */ / 2, QueryType.ByHeight, doc, 0, 0).from, map.lineAt(topPos + viewHeight + 1000 /* Margin */ / 2, QueryType.ByHeight, doc, 0, 0).to);
            }
        }
        return viewport;
    }
    mapViewport(viewport, changes) {
        let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
        return new Viewport(this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0).from, this.heightMap.lineAt(to, QueryType.ByPos, this.state.doc, 0, 0).to);
    }
    // Checks if a given viewport covers the visible part of the
    // document and not too much beyond that.
    viewportIsAppropriate({ from, to }, bias = 0) {
        let { top } = this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0);
        let { bottom } = this.heightMap.lineAt(to, QueryType.ByPos, this.state.doc, 0, 0);
        let { visibleTop, visibleBottom } = this;
        return (from == 0 || top <= visibleTop - Math.max(10 /* MinCoverMargin */, Math.min(-bias, 250 /* MaxCoverMargin */))) &&
            (to == this.state.doc.length ||
                bottom >= visibleBottom + Math.max(10 /* MinCoverMargin */, Math.min(bias, 250 /* MaxCoverMargin */))) &&
            (top > visibleTop - 2 * 1000 /* Margin */ && bottom < visibleBottom + 2 * 1000 /* Margin */);
    }
    mapLineGaps(gaps, changes) {
        if (!gaps.length || changes.empty)
            return gaps;
        let mapped = [];
        for (let gap of gaps)
            if (!changes.touchesRange(gap.from, gap.to))
                mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size));
        return mapped;
    }
    // Computes positions in the viewport where the start or end of a
    // line should be hidden, trying to reuse existing line gaps when
    // appropriate to avoid unneccesary redraws.
    // Uses crude character-counting for the positioning and sizing,
    // since actual DOM coordinates aren't always available and
    // predictable. Relies on generous margins (see LG.Margin) to hide
    // the artifacts this might produce from the user.
    ensureLineGaps(current) {
        let gaps = [];
        // This won't work at all in predominantly right-to-left text.
        if (this.heightOracle.direction != Direction.LTR)
            return gaps;
        this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.state.doc, 0, 0, line => {
            if (line.length < 4000 /* DoubleMargin */)
                return;
            let structure = lineStructure(line.from, line.to, this.state);
            if (structure.total < 4000 /* DoubleMargin */)
                return;
            let viewFrom, viewTo;
            if (this.heightOracle.lineWrapping) {
                let marginHeight = (2000 /* Margin */ / this.heightOracle.lineLength) * this.heightOracle.lineHeight;
                viewFrom = findPosition(structure, (this.visibleTop - line.top - marginHeight) / line.height);
                viewTo = findPosition(structure, (this.visibleBottom - line.top + marginHeight) / line.height);
            }
            else {
                let totalWidth = structure.total * this.heightOracle.charWidth;
                let marginWidth = 2000 /* Margin */ * this.heightOracle.charWidth;
                viewFrom = findPosition(structure, (this.pixelViewport.left - marginWidth) / totalWidth);
                viewTo = findPosition(structure, (this.pixelViewport.right + marginWidth) / totalWidth);
            }
            let outside = [];
            if (viewFrom > line.from)
                outside.push({ from: line.from, to: viewFrom });
            if (viewTo < line.to)
                outside.push({ from: viewTo, to: line.to });
            let sel = this.state.selection.main;
            // Make sure the gaps don't cover a selection end
            if (sel.from >= line.from && sel.from <= line.to)
                cutRange(outside, sel.from - 10 /* SelectionMargin */, sel.from + 10 /* SelectionMargin */);
            if (!sel.empty && sel.to >= line.from && sel.to <= line.to)
                cutRange(outside, sel.to - 10 /* SelectionMargin */, sel.to + 10 /* SelectionMargin */);
            for (let { from, to } of outside)
                if (to - from > 1000 /* HalfMargin */) {
                    gaps.push(find(current, gap => gap.from >= line.from && gap.to <= line.to &&
                        Math.abs(gap.from - from) < 1000 /* HalfMargin */ && Math.abs(gap.to - to) < 1000 /* HalfMargin */) ||
                        new LineGap(from, to, this.gapSize(line, from, to, structure)));
                }
        });
        return gaps;
    }
    gapSize(line, from, to, structure) {
        let fraction = findFraction(structure, to) - findFraction(structure, from);
        if (this.heightOracle.lineWrapping) {
            return line.height * fraction;
        }
        else {
            return structure.total * this.heightOracle.charWidth * fraction;
        }
    }
    updateLineGaps(gaps) {
        if (!LineGap.same(gaps, this.lineGaps)) {
            this.lineGaps = gaps;
            this.lineGapDeco = Decoration.set(gaps.map(gap => gap.draw(this.heightOracle.lineWrapping)));
        }
    }
    computeVisibleRanges() {
        let deco = this.state.facet(decorations);
        if (this.lineGaps.length)
            deco = deco.concat(this.lineGapDeco);
        let ranges = [];
        RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
            span(from, to) { ranges.push({ from, to }); },
            point() { }
        }, 20);
        let changed = ranges.length != this.visibleRanges.length ||
            this.visibleRanges.some((r, i) => r.from != ranges[i].from || r.to != ranges[i].to);
        this.visibleRanges = ranges;
        return changed ? 4 /* Viewport */ : 0;
    }
    lineAt(pos, editorTop) {
        editorTop += this.paddingTop;
        return scaleBlock(this.heightMap.lineAt(pos, QueryType.ByPos, this.state.doc, editorTop, 0), this.scaler, editorTop);
    }
    lineAtHeight(height, editorTop) {
        editorTop += this.paddingTop;
        return scaleBlock(this.heightMap.lineAt(this.scaler.fromDOM(height, editorTop), QueryType.ByHeight, this.state.doc, editorTop, 0), this.scaler, editorTop);
    }
    blockAtHeight(height, editorTop) {
        editorTop += this.paddingTop;
        return scaleBlock(this.heightMap.blockAt(this.scaler.fromDOM(height, editorTop), this.state.doc, editorTop, 0), this.scaler, editorTop);
    }
    forEachLine(from, to, f, editorTop) {
        editorTop += this.paddingTop;
        return this.heightMap.forEachLine(from, to, this.state.doc, editorTop, 0, this.scaler.scale == 1 ? f : b => f(scaleBlock(b, this.scaler, editorTop)));
    }
    get contentHeight() {
        return this.domHeight + this.paddingTop + this.paddingBottom;
    }
    get domHeight() {
        return this.scaler.toDOM(this.heightMap.height, this.paddingTop);
    }
}
class Viewport {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}
function lineStructure(from, to, state) {
    let ranges = [], pos = from, total = 0;
    RangeSet.spans(state.facet(decorations), from, to, {
        span() { },
        point(from, to) {
            if (from > pos) {
                ranges.push({ from: pos, to: from });
                total += from - pos;
            }
            pos = to;
        }
    }, 20); // We're only interested in collapsed ranges of a significant size
    if (pos < to) {
        ranges.push({ from: pos, to });
        total += to - pos;
    }
    return { total, ranges };
}
function findPosition({ total, ranges }, ratio) {
    if (ratio <= 0)
        return ranges[0].from;
    if (ratio >= 1)
        return ranges[ranges.length - 1].to;
    let dist = Math.floor(total * ratio);
    for (let i = 0;; i++) {
        let { from, to } = ranges[i], size = to - from;
        if (dist <= size)
            return from + dist;
        dist -= size;
    }
}
function findFraction(structure, pos) {
    let counted = 0;
    for (let { from, to } of structure.ranges) {
        if (pos <= to) {
            counted += pos - from;
            break;
        }
        counted += to - from;
    }
    return counted / structure.total;
}
function cutRange(ranges, from, to) {
    for (let i = 0; i < ranges.length; i++) {
        let r = ranges[i];
        if (r.from < to && r.to > from) {
            let pieces = [];
            if (r.from < from)
                pieces.push({ from: r.from, to: from });
            if (r.to > to)
                pieces.push({ from: to, to: r.to });
            ranges.splice(i, 1, ...pieces);
            i += pieces.length - 1;
        }
    }
}
function find(array, f) {
    for (let val of array)
        if (f(val))
            return val;
    return undefined;
}
// Don't scale when the document height is within the range of what
// the DOM can handle.
const IdScaler = {
    toDOM(n) { return n; },
    fromDOM(n) { return n; },
    scale: 1
};
// When the height is too big (> VP.MaxDOMHeight), scale down the
// regions outside the viewports so that the total height is
// VP.MaxDOMHeight.
class BigScaler {
    constructor(doc, heightMap, viewports) {
        let vpHeight = 0, base = 0, domBase = 0;
        this.viewports = viewports.map(({ from, to }) => {
            let top = heightMap.lineAt(from, QueryType.ByPos, doc, 0, 0).top;
            let bottom = heightMap.lineAt(to, QueryType.ByPos, doc, 0, 0).bottom;
            vpHeight += bottom - top;
            return { from, to, top, bottom, domTop: 0, domBottom: 0 };
        });
        this.scale = (7000000 /* MaxDOMHeight */ - vpHeight) / (heightMap.height - vpHeight);
        for (let obj of this.viewports) {
            obj.domTop = domBase + (obj.top - base) * this.scale;
            domBase = obj.domBottom = obj.domTop + (obj.bottom - obj.top);
            base = obj.bottom;
        }
    }
    toDOM(n, top) {
        n -= top;
        for (let i = 0, base = 0, domBase = 0;; i++) {
            let vp = i < this.viewports.length ? this.viewports[i] : null;
            if (!vp || n < vp.top)
                return domBase + (n - base) * this.scale + top;
            if (n <= vp.bottom)
                return vp.domTop + (n - vp.top) + top;
            base = vp.bottom;
            domBase = vp.domBottom;
        }
    }
    fromDOM(n, top) {
        n -= top;
        for (let i = 0, base = 0, domBase = 0;; i++) {
            let vp = i < this.viewports.length ? this.viewports[i] : null;
            if (!vp || n < vp.domTop)
                return base + (n - domBase) / this.scale + top;
            if (n <= vp.domBottom)
                return vp.top + (n - vp.domTop) + top;
            base = vp.bottom;
            domBase = vp.domBottom;
        }
    }
}
function scaleBlock(block, scaler, top) {
    if (scaler.scale == 1)
        return block;
    let bTop = scaler.toDOM(block.top, top), bBottom = scaler.toDOM(block.bottom, top);
    return new BlockInfo(block.from, block.length, bTop, bBottom - bTop, Array.isArray(block.type) ? block.type.map(b => scaleBlock(b, scaler, top)) : block.type);
}

const theme = /*@__PURE__*/Facet.define({ combine: strs => strs.join(" ") });
const darkTheme = /*@__PURE__*/Facet.define({ combine: values => values.indexOf(true) > -1 });
const baseThemeID = /*@__PURE__*/StyleModule.newName(), baseLightID = /*@__PURE__*/StyleModule.newName(), baseDarkID = /*@__PURE__*/StyleModule.newName();
const lightDarkIDs = { "&light": "." + baseLightID, "&dark": "." + baseDarkID };
function buildTheme(main, spec, scopes) {
    return new StyleModule(spec, {
        finish(sel) {
            return /&/.test(sel) ? sel.replace(/&\w*/, m => {
                if (m == "&")
                    return main;
                if (!scopes || !scopes[m])
                    throw new RangeError(`Unsupported selector: ${m}`);
                return scopes[m];
            }) : main + " " + sel;
        }
    });
}
const baseTheme$3 = /*@__PURE__*/buildTheme("." + baseThemeID, {
    "&.cm-editor": {
        position: "relative !important",
        boxSizing: "border-box",
        "&.cm-focused": {
            // Provide a simple default outline to make sure a focused
            // editor is visually distinct. Can't leave the default behavior
            // because that will apply to the content element, which is
            // inside the scrollable container and doesn't include the
            // gutters. We also can't use an 'auto' outline, since those
            // are, for some reason, drawn behind the element content, which
            // will cause things like the active line background to cover
            // the outline (#297).
            outline: "1px dotted #212121"
        },
        display: "flex !important",
        flexDirection: "column"
    },
    ".cm-scroller": {
        display: "flex !important",
        alignItems: "flex-start !important",
        fontFamily: "monospace",
        lineHeight: 1.4,
        height: "100%",
        overflowX: "auto",
        position: "relative",
        zIndex: 0
    },
    ".cm-content": {
        margin: 0,
        flexGrow: 2,
        minHeight: "100%",
        display: "block",
        whiteSpace: "pre",
        wordWrap: "normal",
        boxSizing: "border-box",
        padding: "4px 0",
        outline: "none",
        "&[contenteditable=true]": {
            WebkitUserModify: "read-write-plaintext-only",
        }
    },
    ".cm-lineWrapping": {
        whiteSpace_fallback: "pre-wrap",
        whiteSpace: "break-spaces",
        wordBreak: "break-word",
        overflowWrap: "anywhere"
    },
    "&light .cm-content": { caretColor: "black" },
    "&dark .cm-content": { caretColor: "white" },
    ".cm-line": {
        display: "block",
        padding: "0 2px 0 4px"
    },
    ".cm-selectionLayer": {
        zIndex: -1,
        contain: "size style"
    },
    ".cm-selectionBackground": {
        position: "absolute",
    },
    "&light .cm-selectionBackground": {
        background: "#d9d9d9"
    },
    "&dark .cm-selectionBackground": {
        background: "#222"
    },
    "&light.cm-focused .cm-selectionBackground": {
        background: "#d7d4f0"
    },
    "&dark.cm-focused .cm-selectionBackground": {
        background: "#233"
    },
    ".cm-cursorLayer": {
        zIndex: 100,
        contain: "size style",
        pointerEvents: "none"
    },
    "&.cm-focused .cm-cursorLayer": {
        animation: "steps(1) cm-blink 1.2s infinite"
    },
    // Two animations defined so that we can switch between them to
    // restart the animation without forcing another style
    // recomputation.
    "@keyframes cm-blink": { "0%": {}, "50%": { visibility: "hidden" }, "100%": {} },
    "@keyframes cm-blink2": { "0%": {}, "50%": { visibility: "hidden" }, "100%": {} },
    ".cm-cursor": {
        position: "absolute",
        borderLeft: "1.2px solid black",
        marginLeft: "-0.6px",
        pointerEvents: "none",
        display: "none"
    },
    "&dark .cm-cursor": {
        borderLeftColor: "#444"
    },
    "&.cm-focused .cm-cursor": {
        display: "block"
    },
    "&light .cm-activeLine": { backgroundColor: "#f3f9ff" },
    "&dark .cm-activeLine": { backgroundColor: "#223039" },
    "&light .cm-specialChar": { color: "red" },
    "&dark .cm-specialChar": { color: "#f78" },
    ".cm-tab": {
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "bottom"
    },
    ".cm-placeholder": {
        color: "#888",
        display: "inline-block"
    },
    ".cm-button": {
        verticalAlign: "middle",
        color: "inherit",
        fontSize: "70%",
        padding: ".2em 1em",
        borderRadius: "3px"
    },
    "&light .cm-button": {
        backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
        border: "1px solid #888",
        "&:active": {
            backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
        }
    },
    "&dark .cm-button": {
        backgroundImage: "linear-gradient(#393939, #111)",
        border: "1px solid #888",
        "&:active": {
            backgroundImage: "linear-gradient(#111, #333)"
        }
    },
    ".cm-textfield": {
        verticalAlign: "middle",
        color: "inherit",
        fontSize: "70%",
        border: "1px solid silver",
        padding: ".2em .5em"
    },
    "&light .cm-textfield": {
        backgroundColor: "white"
    },
    "&dark .cm-textfield": {
        border: "1px solid #555",
        backgroundColor: "inherit"
    }
}, lightDarkIDs);

const observeOptions = {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    characterDataOldValue: true
};
// IE11 has very broken mutation observers, so we also listen to
// DOMCharacterDataModified there
const useCharData = browser.ie && browser.ie_version <= 11;
class DOMObserver {
    constructor(view, onChange, onScrollChanged) {
        this.view = view;
        this.onChange = onChange;
        this.onScrollChanged = onScrollChanged;
        this.active = false;
        this.ignoreSelection = new DOMSelection;
        this.delayedFlush = -1;
        this.queue = [];
        this.lastFlush = 0;
        this.scrollTargets = [];
        this.intersection = null;
        this.resize = null;
        this.intersecting = false;
        this.gapIntersection = null;
        this.gaps = [];
        // Used to work around a Safari Selection/shadow DOM bug (#414)
        this._selectionRange = null;
        // Timeout for scheduling check of the parents that need scroll handlers
        this.parentCheck = -1;
        this.dom = view.contentDOM;
        this.observer = new MutationObserver(mutations => {
            for (let mut of mutations)
                this.queue.push(mut);
            this._selectionRange = null;
            // IE11 will sometimes (on typing over a selection or
            // backspacing out a single character text node) call the
            // observer callback before actually updating the DOM.
            //
            // Unrelatedly, iOS Safari will, when ending a composition,
            // sometimes first clear it, deliver the mutations, and then
            // reinsert the finished text. CodeMirror's handling of the
            // deletion will prevent the reinsertion from happening,
            // breaking composition.
            if ((browser.ie && browser.ie_version <= 11 || browser.ios && view.composing) &&
                mutations.some(m => m.type == "childList" && m.removedNodes.length ||
                    m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
                this.flushSoon();
            else
                this.flush();
        });
        if (useCharData)
            this.onCharData = (event) => {
                this.queue.push({ target: event.target,
                    type: "characterData",
                    oldValue: event.prevValue });
                this.flushSoon();
            };
        this.onSelectionChange = this.onSelectionChange.bind(this);
        if (typeof ResizeObserver == "function") {
            this.resize = new ResizeObserver(() => {
                if (this.view.docView.lastUpdate < Date.now() - 100)
                    this.view.requestMeasure();
            });
            this.resize.observe(view.scrollDOM);
        }
        this.start();
        this.onScroll = this.onScroll.bind(this);
        window.addEventListener("scroll", this.onScroll);
        if (typeof IntersectionObserver == "function") {
            this.intersection = new IntersectionObserver(entries => {
                if (this.parentCheck < 0)
                    this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1000);
                if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0 != this.intersecting) {
                    this.intersecting = !this.intersecting;
                    if (this.intersecting != this.view.inView)
                        this.onScrollChanged(document.createEvent("Event"));
                }
            }, {});
            this.intersection.observe(this.dom);
            this.gapIntersection = new IntersectionObserver(entries => {
                if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0)
                    this.onScrollChanged(document.createEvent("Event"));
            }, {});
        }
        this.listenForScroll();
    }
    onScroll(e) {
        if (this.intersecting)
            this.flush();
        this.onScrollChanged(e);
    }
    updateGaps(gaps) {
        if (this.gapIntersection && (gaps.length != this.gaps.length || this.gaps.some((g, i) => g != gaps[i]))) {
            this.gapIntersection.disconnect();
            for (let gap of gaps)
                this.gapIntersection.observe(gap);
            this.gaps = gaps;
        }
    }
    onSelectionChange(event) {
        if (this.lastFlush < Date.now() - 50)
            this._selectionRange = null;
        let { view } = this, sel = this.selectionRange;
        if (view.state.facet(editable) ? view.root.activeElement != this.dom : !hasSelection(view.dom, sel))
            return;
        let context = sel.anchorNode && view.docView.nearest(sel.anchorNode);
        if (context && context.ignoreEvent(event))
            return;
        // Deletions on IE11 fire their events in the wrong order, giving
        // us a selection change event before the DOM changes are
        // reported.
        // (Selection.isCollapsed isn't reliable on IE)
        if (browser.ie && browser.ie_version <= 11 && !view.state.selection.main.empty &&
            sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
            this.flushSoon();
        else
            this.flush();
    }
    get selectionRange() {
        if (!this._selectionRange) {
            let { root } = this.view, sel = getSelection(root);
            // The Selection object is broken in shadow roots in Safari. See
            // https://github.com/codemirror/codemirror.next/issues/414
            if (browser.safari && root.nodeType == 11 && deepActiveElement() == this.view.contentDOM)
                sel = safariSelectionRangeHack(this.view) || sel;
            this._selectionRange = sel;
        }
        return this._selectionRange;
    }
    setSelectionRange(anchor, head) {
        var _a;
        if (!((_a = this._selectionRange) === null || _a === void 0 ? void 0 : _a.type))
            this._selectionRange = { anchorNode: anchor.node, anchorOffset: anchor.offset,
                focusNode: head.node, focusOffset: head.offset };
    }
    listenForScroll() {
        this.parentCheck = -1;
        let i = 0, changed = null;
        for (let dom = this.dom; dom;) {
            if (dom.nodeType == 1) {
                if (!changed && i < this.scrollTargets.length && this.scrollTargets[i] == dom)
                    i++;
                else if (!changed)
                    changed = this.scrollTargets.slice(0, i);
                if (changed)
                    changed.push(dom);
                dom = dom.assignedSlot || dom.parentNode;
            }
            else if (dom.nodeType == 11) { // Shadow root
                dom = dom.host;
            }
            else {
                break;
            }
        }
        if (i < this.scrollTargets.length && !changed)
            changed = this.scrollTargets.slice(0, i);
        if (changed) {
            for (let dom of this.scrollTargets)
                dom.removeEventListener("scroll", this.onScroll);
            for (let dom of this.scrollTargets = changed)
                dom.addEventListener("scroll", this.onScroll);
        }
    }
    ignore(f) {
        if (!this.active)
            return f();
        try {
            this.stop();
            return f();
        }
        finally {
            this.start();
            this.clear();
        }
    }
    start() {
        if (this.active)
            return;
        this.observer.observe(this.dom, observeOptions);
        this.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
        if (useCharData)
            this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
        this.active = true;
    }
    stop() {
        if (!this.active)
            return;
        this.active = false;
        this.observer.disconnect();
        this.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
        if (useCharData)
            this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
    }
    clearSelection() {
        this.ignoreSelection.set(this.selectionRange);
    }
    // Throw away any pending changes
    clear() {
        this.observer.takeRecords();
        this.queue.length = 0;
        this.clearSelection();
    }
    flushSoon() {
        if (this.delayedFlush < 0)
            this.delayedFlush = window.setTimeout(() => { this.delayedFlush = -1; this.flush(); }, 20);
    }
    forceFlush() {
        if (this.delayedFlush >= 0) {
            window.clearTimeout(this.delayedFlush);
            this.delayedFlush = -1;
            this.flush();
        }
    }
    processRecords() {
        let records = this.queue;
        for (let mut of this.observer.takeRecords())
            records.push(mut);
        if (records.length)
            this.queue = [];
        let from = -1, to = -1, typeOver = false;
        for (let record of records) {
            let range = this.readMutation(record);
            if (!range)
                continue;
            if (range.typeOver)
                typeOver = true;
            if (from == -1) {
                ({ from, to } = range);
            }
            else {
                from = Math.min(range.from, from);
                to = Math.max(range.to, to);
            }
        }
        return { from, to, typeOver };
    }
    // Apply pending changes, if any
    flush() {
        // Completely hold off flushing when pending keys are set—the code
        // managing those will make sure processRecords is called and the
        // view is resynchronized after
        if (this.delayedFlush >= 0 || this.view.inputState.pendingAndroidKey)
            return;
        this.lastFlush = Date.now();
        let { from, to, typeOver } = this.processRecords();
        let selection = this.selectionRange;
        let newSel = !this.ignoreSelection.eq(selection) && hasSelection(this.dom, selection);
        if (from < 0 && !newSel)
            return;
        let startState = this.view.state;
        this.onChange(from, to, typeOver);
        // The view wasn't updated
        if (this.view.state == startState)
            this.view.docView.reset(newSel);
        this.clearSelection();
    }
    readMutation(rec) {
        let cView = this.view.docView.nearest(rec.target);
        if (!cView || cView.ignoreMutation(rec))
            return null;
        cView.markDirty(rec.type == "attributes");
        if (rec.type == "attributes")
            cView.dirty |= 4 /* Attrs */;
        if (rec.type == "childList") {
            let childBefore = findChild(cView, rec.previousSibling || rec.target.previousSibling, -1);
            let childAfter = findChild(cView, rec.nextSibling || rec.target.nextSibling, 1);
            return { from: childBefore ? cView.posAfter(childBefore) : cView.posAtStart,
                to: childAfter ? cView.posBefore(childAfter) : cView.posAtEnd, typeOver: false };
        }
        else if (rec.type == "characterData") {
            return { from: cView.posAtStart, to: cView.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue };
        }
        else {
            return null;
        }
    }
    destroy() {
        var _a, _b, _c;
        this.stop();
        (_a = this.intersection) === null || _a === void 0 ? void 0 : _a.disconnect();
        (_b = this.gapIntersection) === null || _b === void 0 ? void 0 : _b.disconnect();
        (_c = this.resize) === null || _c === void 0 ? void 0 : _c.disconnect();
        for (let dom of this.scrollTargets)
            dom.removeEventListener("scroll", this.onScroll);
        window.removeEventListener("scroll", this.onScroll);
        clearTimeout(this.parentCheck);
    }
}
function findChild(cView, dom, dir) {
    while (dom) {
        let curView = ContentView.get(dom);
        if (curView && curView.parent == cView)
            return curView;
        let parent = dom.parentNode;
        dom = parent != cView.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
    }
    return null;
}
function safariSelectionRangeHack(view) {
    let found = null;
    // Because Safari (at least in 2018-2021) doesn't provide regular
    // access to the selection inside a shadowroot, we have to perform a
    // ridiculous hack to get at it—using `execCommand` to trigger a
    // `beforeInput` event so that we can read the target range from the
    // event.
    function read(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        found = event.getTargetRanges()[0];
    }
    view.contentDOM.addEventListener("beforeinput", read, true);
    document.execCommand("indent");
    view.contentDOM.removeEventListener("beforeinput", read, true);
    if (!found)
        return null;
    let anchorNode = found.startContainer, anchorOffset = found.startOffset;
    let focusNode = found.endContainer, focusOffset = found.endOffset;
    let curAnchor = view.docView.domAtPos(view.state.selection.main.anchor);
    // Since such a range doesn't distinguish between anchor and head,
    // use a heuristic that flips it around if its end matches the
    // current anchor.
    if (isEquivalentPosition(curAnchor.node, curAnchor.offset, focusNode, focusOffset))
        [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
    return { anchorNode, anchorOffset, focusNode, focusOffset };
}

function applyDOMChange(view, start, end, typeOver) {
    let change, newSel;
    let sel = view.state.selection.main;
    if (start > -1) {
        let bounds = view.docView.domBoundsAround(start, end, 0);
        if (!bounds || view.state.readOnly)
            return;
        let { from, to } = bounds;
        let selPoints = view.docView.impreciseHead || view.docView.impreciseAnchor ? [] : selectionPoints(view);
        let reader = new DOMReader(selPoints, view);
        reader.readRange(bounds.startDOM, bounds.endDOM);
        newSel = selectionFromPoints(selPoints, from);
        let preferredPos = sel.from, preferredSide = null;
        // Prefer anchoring to end when Backspace is pressed (or, on
        // Android, when something was deleted)
        if (view.inputState.lastKeyCode === 8 && view.inputState.lastKeyTime > Date.now() - 100 ||
            browser.android && reader.text.length < to - from) {
            preferredPos = sel.to;
            preferredSide = "end";
        }
        let diff = findDiff(view.state.sliceDoc(from, to), reader.text, preferredPos - from, preferredSide);
        if (diff)
            change = { from: from + diff.from, to: from + diff.toA,
                insert: view.state.toText(reader.text.slice(diff.from, diff.toB)) };
    }
    else if (view.hasFocus || !view.state.facet(editable)) {
        let domSel = view.observer.selectionRange;
        let { impreciseHead: iHead, impreciseAnchor: iAnchor } = view.docView;
        let head = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset ||
            !contains(view.contentDOM, domSel.focusNode)
            ? view.state.selection.main.head
            : view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
        let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset ||
            !contains(view.contentDOM, domSel.anchorNode)
            ? view.state.selection.main.anchor
            : view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
        if (head != sel.head || anchor != sel.anchor)
            newSel = EditorSelection.single(anchor, head);
    }
    if (!change && !newSel)
        return;
    // Heuristic to notice typing over a selected character
    if (!change && typeOver && !sel.empty && newSel && newSel.main.empty)
        change = { from: sel.from, to: sel.to, insert: view.state.doc.slice(sel.from, sel.to) };
    // If the change is inside the selection and covers most of it,
    // assume it is a selection replace (with identical characters at
    // the start/end not included in the diff)
    else if (change && change.from >= sel.from && change.to <= sel.to &&
        (change.from != sel.from || change.to != sel.to) &&
        (sel.to - sel.from) - (change.to - change.from) <= 4)
        change = {
            from: sel.from, to: sel.to,
            insert: view.state.doc.slice(sel.from, change.from).append(change.insert).append(view.state.doc.slice(change.to, sel.to))
        };
    if (change) {
        let startState = view.state;
        // Android browsers don't fire reasonable key events for enter,
        // backspace, or delete. So this detects changes that look like
        // they're caused by those keys, and reinterprets them as key
        // events.
        if (browser.ios && view.inputState.flushIOSKey(view))
            return;
        let text = change.insert.toString();
        if (view.state.facet(inputHandler).some(h => h(view, change.from, change.to, text)))
            return;
        if (view.inputState.composing >= 0)
            view.inputState.composing++;
        let tr;
        if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3 &&
            (!newSel || newSel.main.empty && newSel.main.from == change.from + change.insert.length)) {
            let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
            let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
            tr = startState.replaceSelection(view.state.toText(before + change.insert.sliceString(0, undefined, view.state.lineBreak) +
                after));
        }
        else {
            let changes = startState.changes(change);
            tr = {
                changes,
                selection: newSel && !startState.selection.main.eq(newSel.main) && newSel.main.to <= changes.newLength
                    ? startState.selection.replaceRange(newSel.main) : undefined
            };
        }
        let userEvent = "input.type";
        if (view.composing) {
            userEvent += ".compose";
            if (view.inputState.compositionFirstChange) {
                userEvent += ".start";
                view.inputState.compositionFirstChange = false;
            }
        }
        view.dispatch(tr, { scrollIntoView: true, userEvent });
    }
    else if (newSel && !newSel.main.eq(sel)) {
        let scrollIntoView = false, userEvent = "select";
        if (view.inputState.lastSelectionTime > Date.now() - 50) {
            if (view.inputState.lastSelectionOrigin == "select")
                scrollIntoView = true;
            userEvent = view.inputState.lastSelectionOrigin;
        }
        view.dispatch({ selection: newSel, scrollIntoView, userEvent });
    }
}
function findDiff(a, b, preferredPos, preferredSide) {
    let minLen = Math.min(a.length, b.length);
    let from = 0;
    while (from < minLen && a.charCodeAt(from) == b.charCodeAt(from))
        from++;
    if (from == minLen && a.length == b.length)
        return null;
    let toA = a.length, toB = b.length;
    while (toA > 0 && toB > 0 && a.charCodeAt(toA - 1) == b.charCodeAt(toB - 1)) {
        toA--;
        toB--;
    }
    if (preferredSide == "end") {
        let adjust = Math.max(0, from - Math.min(toA, toB));
        preferredPos -= toA + adjust - from;
    }
    if (toA < from && a.length < b.length) {
        let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
        from -= move;
        toB = from + (toB - toA);
        toA = from;
    }
    else if (toB < from) {
        let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
        from -= move;
        toA = from + (toA - toB);
        toB = from;
    }
    return { from, toA, toB };
}
class DOMReader {
    constructor(points, view) {
        this.points = points;
        this.view = view;
        this.text = "";
        this.lineBreak = view.state.lineBreak;
    }
    readRange(start, end) {
        if (!start)
            return;
        let parent = start.parentNode;
        for (let cur = start;;) {
            this.findPointBefore(parent, cur);
            this.readNode(cur);
            let next = cur.nextSibling;
            if (next == end)
                break;
            let view = ContentView.get(cur), nextView = ContentView.get(next);
            if (view && nextView ? view.breakAfter :
                (view ? view.breakAfter : isBlockElement(cur)) ||
                    (isBlockElement(next) && (cur.nodeName != "BR" || cur.cmIgnore)))
                this.text += this.lineBreak;
            cur = next;
        }
        this.findPointBefore(parent, end);
    }
    readNode(node) {
        if (node.cmIgnore)
            return;
        let view = ContentView.get(node);
        let fromView = view && view.overrideDOMText;
        let text;
        if (fromView != null)
            text = fromView.sliceString(0, undefined, this.lineBreak);
        else if (node.nodeType == 3)
            text = node.nodeValue;
        else if (node.nodeName == "BR")
            text = node.nextSibling ? this.lineBreak : "";
        else if (node.nodeType == 1)
            this.readRange(node.firstChild, null);
        if (text != null) {
            this.findPointIn(node, text.length);
            this.text += text;
            // Chrome inserts two newlines when pressing shift-enter at the
            // end of a line. This drops one of those.
            if (browser.chrome && this.view.inputState.lastKeyCode == 13 && !node.nextSibling && /\n\n$/.test(this.text))
                this.text = this.text.slice(0, -1);
        }
    }
    findPointBefore(node, next) {
        for (let point of this.points)
            if (point.node == node && node.childNodes[point.offset] == next)
                point.pos = this.text.length;
    }
    findPointIn(node, maxLen) {
        for (let point of this.points)
            if (point.node == node)
                point.pos = this.text.length + Math.min(point.offset, maxLen);
    }
}
function isBlockElement(node) {
    return node.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
}
class DOMPoint {
    constructor(node, offset) {
        this.node = node;
        this.offset = offset;
        this.pos = -1;
    }
}
function selectionPoints(view) {
    let result = [];
    if (view.root.activeElement != view.contentDOM)
        return result;
    let { anchorNode, anchorOffset, focusNode, focusOffset } = view.observer.selectionRange;
    if (anchorNode) {
        result.push(new DOMPoint(anchorNode, anchorOffset));
        if (focusNode != anchorNode || focusOffset != anchorOffset)
            result.push(new DOMPoint(focusNode, focusOffset));
    }
    return result;
}
function selectionFromPoints(points, base) {
    if (points.length == 0)
        return null;
    let anchor = points[0].pos, head = points.length == 2 ? points[1].pos : anchor;
    return anchor > -1 && head > -1 ? EditorSelection.single(anchor + base, head + base) : null;
}

// The editor's update state machine looks something like this:
//
//     Idle → Updating ⇆ Idle (unchecked) → Measuring → Idle
//                                         ↑      ↓
//                                         Updating (measure)
//
// The difference between 'Idle' and 'Idle (unchecked)' lies in
// whether a layout check has been scheduled. A regular update through
// the `update` method updates the DOM in a write-only fashion, and
// relies on a check (scheduled with `requestAnimationFrame`) to make
// sure everything is where it should be and the viewport covers the
// visible code. That check continues to measure and then optionally
// update until it reaches a coherent state.
/**
An editor view represents the editor's user interface. It holds
the editable DOM surface, and possibly other elements such as the
line number gutter. It handles events and dispatches state
transactions for editing actions.
*/
class EditorView {
    /**
    Construct a new view. You'll usually want to put `view.dom` into
    your document after creating a view, so that the user can see
    it.
    */
    constructor(
    /**
    Initialization options.
    */
    config = {}) {
        this.plugins = [];
        this.editorAttrs = {};
        this.contentAttrs = {};
        this.bidiCache = [];
        this.destroyed = false;
        /**
        @internal
        */
        this.updateState = 2 /* Updating */;
        /**
        @internal
        */
        this.measureScheduled = -1;
        /**
        @internal
        */
        this.measureRequests = [];
        this.contentDOM = document.createElement("div");
        this.scrollDOM = document.createElement("div");
        this.scrollDOM.tabIndex = -1;
        this.scrollDOM.className = "cm-scroller";
        this.scrollDOM.appendChild(this.contentDOM);
        this.announceDOM = document.createElement("div");
        this.announceDOM.style.cssText = "position: absolute; top: -10000px";
        this.announceDOM.setAttribute("aria-live", "polite");
        this.dom = document.createElement("div");
        this.dom.appendChild(this.announceDOM);
        this.dom.appendChild(this.scrollDOM);
        this._dispatch = config.dispatch || ((tr) => this.update([tr]));
        this.dispatch = this.dispatch.bind(this);
        this.root = (config.root || getRoot(config.parent) || document);
        this.viewState = new ViewState(config.state || EditorState.create());
        this.plugins = this.state.facet(viewPlugin).map(spec => new PluginInstance(spec).update(this));
        this.observer = new DOMObserver(this, (from, to, typeOver) => {
            applyDOMChange(this, from, to, typeOver);
        }, event => {
            this.inputState.runScrollHandlers(this, event);
            if (this.observer.intersecting)
                this.measure();
        });
        this.inputState = new InputState(this);
        this.docView = new DocView(this);
        this.mountStyles();
        this.updateAttrs();
        this.updateState = 0 /* Idle */;
        ensureGlobalHandler();
        this.requestMeasure();
        if (config.parent)
            config.parent.appendChild(this.dom);
    }
    /**
    The current editor state.
    */
    get state() { return this.viewState.state; }
    /**
    To be able to display large documents without consuming too much
    memory or overloading the browser, CodeMirror only draws the
    code that is visible (plus a margin around it) to the DOM. This
    property tells you the extent of the current drawn viewport, in
    document positions.
    */
    get viewport() { return this.viewState.viewport; }
    /**
    When there are, for example, large collapsed ranges in the
    viewport, its size can be a lot bigger than the actual visible
    content. Thus, if you are doing something like styling the
    content in the viewport, it is preferable to only do so for
    these ranges, which are the subset of the viewport that is
    actually drawn.
    */
    get visibleRanges() { return this.viewState.visibleRanges; }
    /**
    Returns false when the editor is entirely scrolled out of view
    or otherwise hidden.
    */
    get inView() { return this.viewState.inView; }
    /**
    Indicates whether the user is currently composing text via
    [IME](https://en.wikipedia.org/wiki/Input_method).
    */
    get composing() { return this.inputState.composing > 0; }
    dispatch(...input) {
        this._dispatch(input.length == 1 && input[0] instanceof Transaction ? input[0]
            : this.state.update(...input));
    }
    /**
    Update the view for the given array of transactions. This will
    update the visible document and selection to match the state
    produced by the transactions, and notify view plugins of the
    change. You should usually call
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
    as a primitive.
    */
    update(transactions) {
        if (this.updateState != 0 /* Idle */)
            throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
        let redrawn = false, update;
        let state = this.state;
        for (let tr of transactions) {
            if (tr.startState != state)
                throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
            state = tr.state;
        }
        if (this.destroyed) {
            this.viewState.state = state;
            return;
        }
        // When the phrases change, redraw the editor
        if (state.facet(EditorState.phrases) != this.state.facet(EditorState.phrases))
            return this.setState(state);
        update = new ViewUpdate(this, state, transactions);
        let scrollTarget = null;
        try {
            this.updateState = 2 /* Updating */;
            for (let tr of transactions) {
                if (scrollTarget)
                    scrollTarget = scrollTarget.map(tr.changes);
                if (tr.scrollIntoView) {
                    let { main } = tr.state.selection;
                    scrollTarget = new ScrollTarget(main.empty ? main : EditorSelection.cursor(main.head, main.head > main.anchor ? -1 : 1));
                }
                for (let e of tr.effects) {
                    if (e.is(scrollTo))
                        scrollTarget = new ScrollTarget(e.value);
                    else if (e.is(centerOn))
                        scrollTarget = new ScrollTarget(e.value, true);
                }
            }
            this.viewState.update(update, scrollTarget);
            this.bidiCache = CachedOrder.update(this.bidiCache, update.changes);
            if (!update.empty) {
                this.updatePlugins(update);
                this.inputState.update(update);
            }
            redrawn = this.docView.update(update);
            if (this.state.facet(styleModule) != this.styleModules)
                this.mountStyles();
            this.updateAttrs();
            this.showAnnouncements(transactions);
        }
        finally {
            this.updateState = 0 /* Idle */;
        }
        if (redrawn || scrollTarget || this.viewState.mustEnforceCursorAssoc)
            this.requestMeasure();
        if (!update.empty)
            for (let listener of this.state.facet(updateListener))
                listener(update);
    }
    /**
    Reset the view to the given state. (This will cause the entire
    document to be redrawn and all view plugins to be reinitialized,
    so you should probably only use it when the new state isn't
    derived from the old state. Otherwise, use
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
    */
    setState(newState) {
        if (this.updateState != 0 /* Idle */)
            throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
        if (this.destroyed) {
            this.viewState.state = newState;
            return;
        }
        this.updateState = 2 /* Updating */;
        try {
            for (let plugin of this.plugins)
                plugin.destroy(this);
            this.viewState = new ViewState(newState);
            this.plugins = newState.facet(viewPlugin).map(spec => new PluginInstance(spec).update(this));
            this.docView = new DocView(this);
            this.inputState.ensureHandlers(this);
            this.mountStyles();
            this.updateAttrs();
            this.bidiCache = [];
        }
        finally {
            this.updateState = 0 /* Idle */;
        }
        this.requestMeasure();
    }
    updatePlugins(update) {
        let prevSpecs = update.startState.facet(viewPlugin), specs = update.state.facet(viewPlugin);
        if (prevSpecs != specs) {
            let newPlugins = [];
            for (let spec of specs) {
                let found = prevSpecs.indexOf(spec);
                if (found < 0) {
                    newPlugins.push(new PluginInstance(spec));
                }
                else {
                    let plugin = this.plugins[found];
                    plugin.mustUpdate = update;
                    newPlugins.push(plugin);
                }
            }
            for (let plugin of this.plugins)
                if (plugin.mustUpdate != update)
                    plugin.destroy(this);
            this.plugins = newPlugins;
            this.inputState.ensureHandlers(this);
        }
        else {
            for (let p of this.plugins)
                p.mustUpdate = update;
        }
        for (let i = 0; i < this.plugins.length; i++)
            this.plugins[i] = this.plugins[i].update(this);
    }
    /**
    @internal
    */
    measure(flush = true) {
        if (this.destroyed)
            return;
        if (this.measureScheduled > -1)
            cancelAnimationFrame(this.measureScheduled);
        this.measureScheduled = 0; // Prevent requestMeasure calls from scheduling another animation frame
        if (flush)
            this.observer.flush();
        let updated = null;
        try {
            for (let i = 0;; i++) {
                this.updateState = 1 /* Measuring */;
                let oldViewport = this.viewport;
                let changed = this.viewState.measure(this.docView, i > 0);
                if (!changed && !this.measureRequests.length && this.viewState.scrollTarget == null)
                    break;
                if (i > 5) {
                    console.warn("Viewport failed to stabilize");
                    break;
                }
                let measuring = [];
                // Only run measure requests in this cycle when the viewport didn't change
                if (!(changed & 4 /* Viewport */))
                    [this.measureRequests, measuring] = [measuring, this.measureRequests];
                let measured = measuring.map(m => {
                    try {
                        return m.read(this);
                    }
                    catch (e) {
                        logException(this.state, e);
                        return BadMeasure;
                    }
                });
                let update = new ViewUpdate(this, this.state);
                update.flags |= changed;
                if (!updated)
                    updated = update;
                else
                    updated.flags |= changed;
                this.updateState = 2 /* Updating */;
                if (!update.empty) {
                    this.updatePlugins(update);
                    this.inputState.update(update);
                }
                this.updateAttrs();
                if (changed)
                    this.docView.update(update);
                for (let i = 0; i < measuring.length; i++)
                    if (measured[i] != BadMeasure) {
                        try {
                            measuring[i].write(measured[i], this);
                        }
                        catch (e) {
                            logException(this.state, e);
                        }
                    }
                if (this.viewState.scrollTarget) {
                    this.docView.scrollIntoView(this.viewState.scrollTarget);
                    this.viewState.scrollTarget = null;
                }
                if (this.viewport.from == oldViewport.from && this.viewport.to == oldViewport.to && this.measureRequests.length == 0)
                    break;
            }
        }
        finally {
            this.updateState = 0 /* Idle */;
            this.measureScheduled = -1;
        }
        if (updated && !updated.empty)
            for (let listener of this.state.facet(updateListener))
                listener(updated);
    }
    /**
    Get the CSS classes for the currently active editor themes.
    */
    get themeClasses() {
        return baseThemeID + " " +
            (this.state.facet(darkTheme) ? baseDarkID : baseLightID) + " " +
            this.state.facet(theme);
    }
    updateAttrs() {
        let editorAttrs = combineAttrs(this.state.facet(editorAttributes), {
            class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
        });
        updateAttrs(this.dom, this.editorAttrs, editorAttrs);
        this.editorAttrs = editorAttrs;
        let contentAttrs = {
            spellcheck: "false",
            autocorrect: "off",
            autocapitalize: "off",
            translate: "no",
            contenteditable: !this.state.facet(editable) ? "false" : "true",
            class: "cm-content",
            style: `${browser.tabSize}: ${this.state.tabSize}`,
            role: "textbox",
            "aria-multiline": "true"
        };
        if (this.state.readOnly)
            contentAttrs["aria-readonly"] = "true";
        combineAttrs(this.state.facet(contentAttributes), contentAttrs);
        updateAttrs(this.contentDOM, this.contentAttrs, contentAttrs);
        this.contentAttrs = contentAttrs;
    }
    showAnnouncements(trs) {
        let first = true;
        for (let tr of trs)
            for (let effect of tr.effects)
                if (effect.is(EditorView.announce)) {
                    if (first)
                        this.announceDOM.textContent = "";
                    first = false;
                    let div = this.announceDOM.appendChild(document.createElement("div"));
                    div.textContent = effect.value;
                }
    }
    mountStyles() {
        this.styleModules = this.state.facet(styleModule);
        StyleModule.mount(this.root, this.styleModules.concat(baseTheme$3).reverse());
    }
    readMeasured() {
        if (this.updateState == 2 /* Updating */)
            throw new Error("Reading the editor layout isn't allowed during an update");
        if (this.updateState == 0 /* Idle */ && this.measureScheduled > -1)
            this.measure(false);
    }
    /**
    Schedule a layout measurement, optionally providing callbacks to
    do custom DOM measuring followed by a DOM write phase. Using
    this is preferable reading DOM layout directly from, for
    example, an event handler, because it'll make sure measuring and
    drawing done by other components is synchronized, avoiding
    unnecessary DOM layout computations.
    */
    requestMeasure(request) {
        if (this.measureScheduled < 0)
            this.measureScheduled = requestAnimationFrame(() => this.measure());
        if (request) {
            if (request.key != null)
                for (let i = 0; i < this.measureRequests.length; i++) {
                    if (this.measureRequests[i].key === request.key) {
                        this.measureRequests[i] = request;
                        return;
                    }
                }
            this.measureRequests.push(request);
        }
    }
    /**
    Collect all values provided by the active plugins for a given
    field.
    */
    pluginField(field) {
        let result = [];
        for (let plugin of this.plugins)
            plugin.update(this).takeField(field, result);
        return result;
    }
    /**
    Get the value of a specific plugin, if present. Note that
    plugins that crash can be dropped from a view, so even when you
    know you registered a given plugin, it is recommended to check
    the return value of this method.
    */
    plugin(plugin) {
        for (let inst of this.plugins)
            if (inst.spec == plugin)
                return inst.update(this).value;
        return null;
    }
    /**
    Find the line or block widget at the given vertical position.
    
    By default, this position is interpreted as a screen position,
    meaning `docTop` is set to the DOM top position of the editor
    content (forcing a layout). You can pass a different `docTop`
    value—for example 0 to interpret `height` as a document-relative
    position, or a precomputed document top
    (`view.contentDOM.getBoundingClientRect().top`) to limit layout
    queries.
    */
    blockAtHeight(height, docTop) {
        this.readMeasured();
        return this.viewState.blockAtHeight(height, ensureTop(docTop, this.contentDOM));
    }
    /**
    Find information for the visual line (see
    [`visualLineAt`](https://codemirror.net/6/docs/ref/#view.EditorView.visualLineAt)) at the given
    vertical position. The resulting block info might hold another
    array of block info structs in its `type` field if this line
    consists of more than one block.
    
    Defaults to treating `height` as a screen position. See
    [`blockAtHeight`](https://codemirror.net/6/docs/ref/#view.EditorView.blockAtHeight) for the
    interpretation of the `docTop` parameter.
    */
    visualLineAtHeight(height, docTop) {
        this.readMeasured();
        return this.viewState.lineAtHeight(height, ensureTop(docTop, this.contentDOM));
    }
    /**
    Iterate over the height information of the visual lines in the
    viewport. The heights of lines are reported relative to the
    given document top, which defaults to the screen position of the
    document (forcing a layout).
    */
    viewportLines(f, docTop) {
        let { from, to } = this.viewport;
        this.viewState.forEachLine(from, to, f, ensureTop(docTop, this.contentDOM));
    }
    /**
    Find the extent and height of the visual line (a range delimited
    on both sides by either non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^range)
    line breaks, or the start/end of the document) at the given position.
    
    Vertical positions are computed relative to the `docTop`
    argument, which defaults to 0 for this method. You can pass
    `view.contentDOM.getBoundingClientRect().top` here to get screen
    coordinates.
    */
    visualLineAt(pos, docTop = 0) {
        return this.viewState.lineAt(pos, docTop);
    }
    /**
    The editor's total content height.
    */
    get contentHeight() {
        return this.viewState.contentHeight;
    }
    /**
    Move a cursor position by [grapheme
    cluster](https://codemirror.net/6/docs/ref/#text.findClusterBreak). `forward` determines whether
    the motion is away from the line start, or towards it. Motion in
    bidirectional text is in visual order, in the editor's [text
    direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). When the start
    position was the last one on the line, the returned position
    will be across the line break. If there is no further line, the
    original position is returned.
    
    By default, this method moves over a single cluster. The
    optional `by` argument can be used to move across more. It will
    be called with the first cluster as argument, and should return
    a predicate that determines, for each subsequent cluster,
    whether it should also be moved over.
    */
    moveByChar(start, forward, by) {
        return skipAtoms(this, start, moveByChar(this, start, forward, by));
    }
    /**
    Move a cursor position across the next group of either
    [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
    non-whitespace characters.
    */
    moveByGroup(start, forward) {
        return skipAtoms(this, start, moveByChar(this, start, forward, initial => byGroup(this, start.head, initial)));
    }
    /**
    Move to the next line boundary in the given direction. If
    `includeWrap` is true, line wrapping is on, and there is a
    further wrap point on the current line, the wrap point will be
    returned. Otherwise this function will return the start or end
    of the line.
    */
    moveToLineBoundary(start, forward, includeWrap = true) {
        return moveToLineBoundary(this, start, forward, includeWrap);
    }
    /**
    Move a cursor position vertically. When `distance` isn't given,
    it defaults to moving to the next line (including wrapped
    lines). Otherwise, `distance` should provide a positive distance
    in pixels.
    
    When `start` has a
    [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
    motion will use that as a target horizontal position. Otherwise,
    the cursor's own horizontal position is used. The returned
    cursor will have its goal column set to whichever column was
    used.
    */
    moveVertically(start, forward, distance) {
        return skipAtoms(this, start, moveVertically(this, start, forward, distance));
    }
    // FIXME remove on next major version
    scrollPosIntoView(pos) {
        this.dispatch({ effects: scrollTo.of(EditorSelection.cursor(pos)) });
    }
    /**
    Find the DOM parent node and offset (child offset if `node` is
    an element, character offset when it is a text node) at the
    given document position.
    */
    domAtPos(pos) {
        return this.docView.domAtPos(pos);
    }
    /**
    Find the document position at the given DOM node. Can be useful
    for associating positions with DOM events. Will raise an error
    when `node` isn't part of the editor content.
    */
    posAtDOM(node, offset = 0) {
        return this.docView.posFromDOM(node, offset);
    }
    posAtCoords(coords, precise = true) {
        this.readMeasured();
        return posAtCoords(this, coords, precise);
    }
    /**
    Get the screen coordinates at the given document position.
    `side` determines whether the coordinates are based on the
    element before (-1) or after (1) the position (if no element is
    available on the given side, the method will transparently use
    another strategy to get reasonable coordinates).
    */
    coordsAtPos(pos, side = 1) {
        this.readMeasured();
        let rect = this.docView.coordsAt(pos, side);
        if (!rect || rect.left == rect.right)
            return rect;
        let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
        let span = order[BidiSpan.find(order, pos - line.from, -1, side)];
        return flattenRect(rect, (span.dir == Direction.LTR) == (side > 0));
    }
    /**
    The default width of a character in the editor. May not
    accurately reflect the width of all characters (given variable
    width fonts or styling of invididual ranges).
    */
    get defaultCharacterWidth() { return this.viewState.heightOracle.charWidth; }
    /**
    The default height of a line in the editor. May not be accurate
    for all lines.
    */
    get defaultLineHeight() { return this.viewState.heightOracle.lineHeight; }
    /**
    The text direction
    ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
    CSS property) of the editor.
    */
    get textDirection() { return this.viewState.heightOracle.direction; }
    /**
    Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
    (as determined by the
    [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
    CSS property of its content element).
    */
    get lineWrapping() { return this.viewState.heightOracle.lineWrapping; }
    /**
    Returns the bidirectional text structure of the given line
    (which should be in the current document) as an array of span
    objects. The order of these spans matches the [text
    direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
    left-to-right, the leftmost spans come first, otherwise the
    rightmost spans come first.
    */
    bidiSpans(line) {
        if (line.length > MaxBidiLine)
            return trivialOrder(line.length);
        let dir = this.textDirection;
        for (let entry of this.bidiCache)
            if (entry.from == line.from && entry.dir == dir)
                return entry.order;
        let order = computeOrder(line.text, this.textDirection);
        this.bidiCache.push(new CachedOrder(line.from, line.to, dir, order));
        return order;
    }
    /**
    Check whether the editor has focus.
    */
    get hasFocus() {
        var _a;
        // Safari return false for hasFocus when the context menu is open
        // or closing, which leads us to ignore selection changes from the
        // context menu because it looks like the editor isn't focused.
        // This kludges around that.
        return (document.hasFocus() || browser.safari && ((_a = this.inputState) === null || _a === void 0 ? void 0 : _a.lastContextMenu) > Date.now() - 3e4) &&
            this.root.activeElement == this.contentDOM;
    }
    /**
    Put focus on the editor.
    */
    focus() {
        this.observer.ignore(() => {
            focusPreventScroll(this.contentDOM);
            this.docView.updateSelection();
        });
    }
    /**
    Clean up this editor view, removing its element from the
    document, unregistering event handlers, and notifying
    plugins. The view instance can no longer be used after
    calling this.
    */
    destroy() {
        for (let plugin of this.plugins)
            plugin.destroy(this);
        this.plugins = [];
        this.inputState.destroy();
        this.dom.remove();
        this.observer.destroy();
        if (this.measureScheduled > -1)
            cancelAnimationFrame(this.measureScheduled);
        this.destroyed = true;
    }
    /**
    Facet that can be used to add DOM event handlers. The value
    should be an object mapping event names to handler functions. The
    first such function to return true will be assumed to have handled
    that event, and no other handlers or built-in behavior will be
    activated for it.
    These are registered on the [content
    element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except for `scroll`
    handlers, which will be called any time the editor's [scroll
    element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of its parent nodes
    is scrolled.
    */
    static domEventHandlers(handlers) {
        return ViewPlugin.define(() => ({}), { eventHandlers: handlers });
    }
    /**
    Create a theme extension. The first argument can be a
    [`style-mod`](https://github.com/marijnh/style-mod#documentation)
    style spec providing the styles for the theme. These will be
    prefixed with a generated class for the style.
    
    Because the selectors will be prefixed with a scope class, rule
    that directly match the editor's [wrapper
    element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
    added—need to be explicitly differentiated by adding an `&` to
    the selector for that element—for example
    `&.cm-focused`.
    
    When `dark` is set to true, the theme will be marked as dark,
    which will cause the `&dark` rules from [base
    themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
    `&light` when a light theme is active).
    */
    static theme(spec, options) {
        let prefix = StyleModule.newName();
        let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))];
        if (options && options.dark)
            result.push(darkTheme.of(true));
        return result;
    }
    /**
    Create an extension that adds styles to the base theme. Like
    with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
    place of the editor wrapper element when directly targeting
    that. You can also use `&dark` or `&light` instead to only
    target editors with a dark or light theme.
    */
    static baseTheme(spec) {
        return Prec.lowest(styleModule.of(buildTheme("." + baseThemeID, spec, lightDarkIDs)));
    }
}
/**
Effect that can be [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a
transaction to make it scroll the given range into view.
*/
EditorView.scrollTo = scrollTo;
/**
Effect that makes the editor scroll the given range to the
center of the visible view.
*/
EditorView.centerOn = centerOn;
/**
Facet to add a [style
module](https://github.com/marijnh/style-mod#documentation) to
an editor view. The view will ensure that the module is
mounted in its [document
root](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.root).
*/
EditorView.styleModule = styleModule;
/**
An input handler can override the way changes to the editable
DOM content are handled. Handlers are passed the document
positions between which the change was found, and the new
content. When one returns true, no further input handlers are
called and the default behavior is prevented.
*/
EditorView.inputHandler = inputHandler;
/**
Allows you to provide a function that should be called when the
library catches an exception from an extension (mostly from view
plugins, but may be used by other extensions to route exceptions
from user-code-provided callbacks). This is mostly useful for
debugging and logging. See [`logException`](https://codemirror.net/6/docs/ref/#view.logException).
*/
EditorView.exceptionSink = exceptionSink;
/**
A facet that can be used to register a function to be called
every time the view updates.
*/
EditorView.updateListener = updateListener;
/**
Facet that controls whether the editor content DOM is editable.
When its highest-precedence value is `false`, the element will
not longer have its `contenteditable` attribute set. (Note that
this doesn't affect API calls that change the editor content,
even when those are bound to keys or buttons. See the
[`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) facet for that.)
*/
EditorView.editable = editable;
/**
Allows you to influence the way mouse selection happens. The
functions in this facet will be called for a `mousedown` event
on the editor, and can return an object that overrides the way a
selection is computed from that mouse click or drag.
*/
EditorView.mouseSelectionStyle = mouseSelectionStyle;
/**
Facet used to configure whether a given selection drag event
should move or copy the selection. The given predicate will be
called with the `mousedown` event, and can return `true` when
the drag should move the content.
*/
EditorView.dragMovesSelection = dragMovesSelection$1;
/**
Facet used to configure whether a given selecting click adds
a new range to the existing selection or replaces it entirely.
*/
EditorView.clickAddsSelectionRange = clickAddsSelectionRange;
/**
A facet that determines which [decorations](https://codemirror.net/6/docs/ref/#view.Decoration)
are shown in the view. See also [view
plugins](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), which have a separate
mechanism for providing decorations.
*/
EditorView.decorations = decorations;
/**
Facet that provides additional DOM attributes for the editor's
editable DOM element.
*/
EditorView.contentAttributes = contentAttributes;
/**
Facet that provides DOM attributes for the editor's outer
element.
*/
EditorView.editorAttributes = editorAttributes;
/**
An extension that enables line wrapping in the editor (by
setting CSS `white-space` to `pre-wrap` in the content).
*/
EditorView.lineWrapping = /*@__PURE__*/EditorView.contentAttributes.of({ "class": "cm-lineWrapping" });
/**
State effect used to include screen reader announcements in a
transaction. These will be added to the DOM in a visually hidden
element with `aria-live="polite"` set, and should be used to
describe effects that are visually obvious but may not be
noticed by screen reader users (such as moving to the next
search match).
*/
EditorView.announce = /*@__PURE__*/StateEffect.define();
// Maximum line length for which we compute accurate bidi info
const MaxBidiLine = 4096;
function ensureTop(given, dom) {
    return given == null ? dom.getBoundingClientRect().top : given;
}
let resizeDebounce = -1;
function ensureGlobalHandler() {
    window.addEventListener("resize", () => {
        if (resizeDebounce == -1)
            resizeDebounce = setTimeout(handleResize, 50);
    });
}
function handleResize() {
    resizeDebounce = -1;
    let found = document.querySelectorAll(".cm-content");
    for (let i = 0; i < found.length; i++) {
        let docView = ContentView.get(found[i]);
        if (docView)
            docView.editorView.requestMeasure();
    }
}
const BadMeasure = {};
class CachedOrder {
    constructor(from, to, dir, order) {
        this.from = from;
        this.to = to;
        this.dir = dir;
        this.order = order;
    }
    static update(cache, changes) {
        if (changes.empty)
            return cache;
        let result = [], lastDir = cache.length ? cache[cache.length - 1].dir : Direction.LTR;
        for (let i = Math.max(0, cache.length - 10); i < cache.length; i++) {
            let entry = cache[i];
            if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
                result.push(new CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.order));
        }
        return result;
    }
}

const currentPlatform = browser.mac ? "mac" : browser.windows ? "win" : browser.linux ? "linux" : "key";
function normalizeKeyName(name, platform) {
    const parts = name.split(/-(?!$)/);
    let result = parts[parts.length - 1];
    if (result == "Space")
        result = " ";
    let alt, ctrl, shift, meta;
    for (let i = 0; i < parts.length - 1; ++i) {
        const mod = parts[i];
        if (/^(cmd|meta|m)$/i.test(mod))
            meta = true;
        else if (/^a(lt)?$/i.test(mod))
            alt = true;
        else if (/^(c|ctrl|control)$/i.test(mod))
            ctrl = true;
        else if (/^s(hift)?$/i.test(mod))
            shift = true;
        else if (/^mod$/i.test(mod)) {
            if (platform == "mac")
                meta = true;
            else
                ctrl = true;
        }
        else
            throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt)
        result = "Alt-" + result;
    if (ctrl)
        result = "Ctrl-" + result;
    if (meta)
        result = "Meta-" + result;
    if (shift)
        result = "Shift-" + result;
    return result;
}
function modifiers(name, event, shift) {
    if (event.altKey)
        name = "Alt-" + name;
    if (event.ctrlKey)
        name = "Ctrl-" + name;
    if (event.metaKey)
        name = "Meta-" + name;
    if (shift !== false && event.shiftKey)
        name = "Shift-" + name;
    return name;
}
const handleKeyEvents = /*@__PURE__*/EditorView.domEventHandlers({
    keydown(event, view) {
        return runHandlers(getKeymap(view.state), event, view, "editor");
    }
});
/**
Facet used for registering keymaps.

You can add multiple keymaps to an editor. Their priorities
determine their precedence (the ones specified early or with high
priority get checked first). When a handler has returned `true`
for a given key, no further handlers are called.
*/
const keymap = /*@__PURE__*/Facet.define({ enables: handleKeyEvents });
const Keymaps = /*@__PURE__*/new WeakMap();
// This is hidden behind an indirection, rather than directly computed
// by the facet, to keep internal types out of the facet's type.
function getKeymap(state) {
    let bindings = state.facet(keymap);
    let map = Keymaps.get(bindings);
    if (!map)
        Keymaps.set(bindings, map = buildKeymap(bindings.reduce((a, b) => a.concat(b), [])));
    return map;
}
let storedPrefix = null;
const PrefixTimeout = 4000;
function buildKeymap(bindings, platform = currentPlatform) {
    let bound = Object.create(null);
    let isPrefix = Object.create(null);
    let checkPrefix = (name, is) => {
        let current = isPrefix[name];
        if (current == null)
            isPrefix[name] = is;
        else if (current != is)
            throw new Error("Key binding " + name + " is used both as a regular binding and as a multi-stroke prefix");
    };
    let add = (scope, key, command, preventDefault) => {
        let scopeObj = bound[scope] || (bound[scope] = Object.create(null));
        let parts = key.split(/ (?!$)/).map(k => normalizeKeyName(k, platform));
        for (let i = 1; i < parts.length; i++) {
            let prefix = parts.slice(0, i).join(" ");
            checkPrefix(prefix, true);
            if (!scopeObj[prefix])
                scopeObj[prefix] = {
                    preventDefault: true,
                    commands: [(view) => {
                            let ourObj = storedPrefix = { view, prefix, scope };
                            setTimeout(() => { if (storedPrefix == ourObj)
                                storedPrefix = null; }, PrefixTimeout);
                            return true;
                        }]
                };
        }
        let full = parts.join(" ");
        checkPrefix(full, false);
        let binding = scopeObj[full] || (scopeObj[full] = { preventDefault: false, commands: [] });
        binding.commands.push(command);
        if (preventDefault)
            binding.preventDefault = true;
    };
    for (let b of bindings) {
        let name = b[platform] || b.key;
        if (!name)
            continue;
        for (let scope of b.scope ? b.scope.split(" ") : ["editor"]) {
            add(scope, name, b.run, b.preventDefault);
            if (b.shift)
                add(scope, "Shift-" + name, b.shift, b.preventDefault);
        }
    }
    return bound;
}
function runHandlers(map, event, view, scope) {
    let name = keyName(event), isChar = name.length == 1 && name != " ";
    let prefix = "", fallthrough = false;
    if (storedPrefix && storedPrefix.view == view && storedPrefix.scope == scope) {
        prefix = storedPrefix.prefix + " ";
        if (fallthrough = modifierCodes.indexOf(event.keyCode) < 0)
            storedPrefix = null;
    }
    let runFor = (binding) => {
        if (binding) {
            for (let cmd of binding.commands)
                if (cmd(view))
                    return true;
            if (binding.preventDefault)
                fallthrough = true;
        }
        return false;
    };
    let scopeObj = map[scope], baseName;
    if (scopeObj) {
        if (runFor(scopeObj[prefix + modifiers(name, event, !isChar)]))
            return true;
        if (isChar && (event.shiftKey || event.altKey || event.metaKey) &&
            (baseName = base[event.keyCode]) && baseName != name) {
            if (runFor(scopeObj[prefix + modifiers(baseName, event, true)]))
                return true;
        }
        else if (isChar && event.shiftKey) {
            if (runFor(scopeObj[prefix + modifiers(name, event, true)]))
                return true;
        }
    }
    return fallthrough;
}

const CanHidePrimary = !browser.ios; // FIXME test IE
const selectionConfig = /*@__PURE__*/Facet.define({
    combine(configs) {
        return combineConfig(configs, {
            cursorBlinkRate: 1200,
            drawRangeCursor: true
        }, {
            cursorBlinkRate: (a, b) => Math.min(a, b),
            drawRangeCursor: (a, b) => a || b
        });
    }
});
/**
Returns an extension that hides the browser's native selection and
cursor, replacing the selection with a background behind the text
(with the `cm-selectionBackground` class), and the
cursors with elements overlaid over the code (using
`cm-cursor-primary` and `cm-cursor-secondary`).

This allows the editor to display secondary selection ranges, and
tends to produce a type of selection more in line with that users
expect in a text editor (the native selection styling will often
leave gaps between lines and won't fill the horizontal space after
a line when the selection continues past it).

It does have a performance cost, in that it requires an extra DOM
layout cycle for many updates (the selection is drawn based on DOM
layout information that's only available after laying out the
content).
*/
function drawSelection(config = {}) {
    return [
        selectionConfig.of(config),
        drawSelectionPlugin,
        hideNativeSelection
    ];
}
class Piece {
    constructor(left, top, width, height, className) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.className = className;
    }
    draw() {
        let elt = document.createElement("div");
        elt.className = this.className;
        this.adjust(elt);
        return elt;
    }
    adjust(elt) {
        elt.style.left = this.left + "px";
        elt.style.top = this.top + "px";
        if (this.width >= 0)
            elt.style.width = this.width + "px";
        elt.style.height = this.height + "px";
    }
    eq(p) {
        return this.left == p.left && this.top == p.top && this.width == p.width && this.height == p.height &&
            this.className == p.className;
    }
}
const drawSelectionPlugin = /*@__PURE__*/ViewPlugin.fromClass(class {
    constructor(view) {
        this.view = view;
        this.rangePieces = [];
        this.cursors = [];
        this.measureReq = { read: this.readPos.bind(this), write: this.drawSel.bind(this) };
        this.selectionLayer = view.scrollDOM.appendChild(document.createElement("div"));
        this.selectionLayer.className = "cm-selectionLayer";
        this.selectionLayer.setAttribute("aria-hidden", "true");
        this.cursorLayer = view.scrollDOM.appendChild(document.createElement("div"));
        this.cursorLayer.className = "cm-cursorLayer";
        this.cursorLayer.setAttribute("aria-hidden", "true");
        view.requestMeasure(this.measureReq);
        this.setBlinkRate();
    }
    setBlinkRate() {
        this.cursorLayer.style.animationDuration = this.view.state.facet(selectionConfig).cursorBlinkRate + "ms";
    }
    update(update) {
        let confChanged = update.startState.facet(selectionConfig) != update.state.facet(selectionConfig);
        if (confChanged || update.selectionSet || update.geometryChanged || update.viewportChanged)
            this.view.requestMeasure(this.measureReq);
        if (update.transactions.some(tr => tr.scrollIntoView))
            this.cursorLayer.style.animationName = this.cursorLayer.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink";
        if (confChanged)
            this.setBlinkRate();
    }
    readPos() {
        let { state } = this.view, conf = state.facet(selectionConfig);
        let rangePieces = state.selection.ranges.map(r => r.empty ? [] : measureRange(this.view, r)).reduce((a, b) => a.concat(b));
        let cursors = [];
        for (let r of state.selection.ranges) {
            let prim = r == state.selection.main;
            if (r.empty ? !prim || CanHidePrimary : conf.drawRangeCursor) {
                let piece = measureCursor(this.view, r, prim);
                if (piece)
                    cursors.push(piece);
            }
        }
        return { rangePieces, cursors };
    }
    drawSel({ rangePieces, cursors }) {
        if (rangePieces.length != this.rangePieces.length || rangePieces.some((p, i) => !p.eq(this.rangePieces[i]))) {
            this.selectionLayer.textContent = "";
            for (let p of rangePieces)
                this.selectionLayer.appendChild(p.draw());
            this.rangePieces = rangePieces;
        }
        if (cursors.length != this.cursors.length || cursors.some((c, i) => !c.eq(this.cursors[i]))) {
            let oldCursors = this.cursorLayer.children;
            if (oldCursors.length !== cursors.length) {
                this.cursorLayer.textContent = "";
                for (const c of cursors)
                    this.cursorLayer.appendChild(c.draw());
            }
            else {
                cursors.forEach((c, idx) => c.adjust(oldCursors[idx]));
            }
            this.cursors = cursors;
        }
    }
    destroy() {
        this.selectionLayer.remove();
        this.cursorLayer.remove();
    }
});
const themeSpec = {
    ".cm-line": {
        "& ::selection": { backgroundColor: "transparent !important" },
        "&::selection": { backgroundColor: "transparent !important" }
    }
};
if (CanHidePrimary)
    themeSpec[".cm-line"].caretColor = "transparent !important";
const hideNativeSelection = /*@__PURE__*/Prec.highest(/*@__PURE__*/EditorView.theme(themeSpec));
function getBase(view) {
    let rect = view.scrollDOM.getBoundingClientRect();
    let left = view.textDirection == Direction.LTR ? rect.left : rect.right - view.scrollDOM.clientWidth;
    return { left: left - view.scrollDOM.scrollLeft, top: rect.top - view.scrollDOM.scrollTop };
}
function wrappedLine(view, pos, inside) {
    let range = EditorSelection.cursor(pos);
    return { from: Math.max(inside.from, view.moveToLineBoundary(range, false, true).from),
        to: Math.min(inside.to, view.moveToLineBoundary(range, true, true).from),
        type: BlockType.Text };
}
function blockAt(view, pos) {
    let line = view.visualLineAt(pos);
    if (Array.isArray(line.type))
        for (let l of line.type) {
            if (l.to > pos || l.to == pos && (l.to == line.to || l.type == BlockType.Text))
                return l;
        }
    return line;
}
function measureRange(view, range) {
    if (range.to <= view.viewport.from || range.from >= view.viewport.to)
        return [];
    let from = Math.max(range.from, view.viewport.from), to = Math.min(range.to, view.viewport.to);
    let ltr = view.textDirection == Direction.LTR;
    let content = view.contentDOM, contentRect = content.getBoundingClientRect(), base = getBase(view);
    let lineStyle = window.getComputedStyle(content.firstChild);
    let leftSide = contentRect.left + parseInt(lineStyle.paddingLeft);
    let rightSide = contentRect.right - parseInt(lineStyle.paddingRight);
    let startBlock = blockAt(view, from), endBlock = blockAt(view, to);
    let visualStart = startBlock.type == BlockType.Text ? startBlock : null;
    let visualEnd = endBlock.type == BlockType.Text ? endBlock : null;
    if (view.lineWrapping) {
        if (visualStart)
            visualStart = wrappedLine(view, from, visualStart);
        if (visualEnd)
            visualEnd = wrappedLine(view, to, visualEnd);
    }
    if (visualStart && visualEnd && visualStart.from == visualEnd.from) {
        return pieces(drawForLine(range.from, range.to, visualStart));
    }
    else {
        let top = visualStart ? drawForLine(range.from, null, visualStart) : drawForWidget(startBlock, false);
        let bottom = visualEnd ? drawForLine(null, range.to, visualEnd) : drawForWidget(endBlock, true);
        let between = [];
        if ((visualStart || startBlock).to < (visualEnd || endBlock).from - 1)
            between.push(piece(leftSide, top.bottom, rightSide, bottom.top));
        else if (top.bottom < bottom.top && blockAt(view, (top.bottom + bottom.top) / 2).type == BlockType.Text)
            top.bottom = bottom.top = (top.bottom + bottom.top) / 2;
        return pieces(top).concat(between).concat(pieces(bottom));
    }
    function piece(left, top, right, bottom) {
        return new Piece(left - base.left, top - base.top, right - left, bottom - top, "cm-selectionBackground");
    }
    function pieces({ top, bottom, horizontal }) {
        let pieces = [];
        for (let i = 0; i < horizontal.length; i += 2)
            pieces.push(piece(horizontal[i], top, horizontal[i + 1], bottom));
        return pieces;
    }
    // Gets passed from/to in line-local positions
    function drawForLine(from, to, line) {
        let top = 1e9, bottom = -1e9, horizontal = [];
        function addSpan(from, fromOpen, to, toOpen, dir) {
            // Passing 2/-2 is a kludge to force the view to return
            // coordinates on the proper side of block widgets, since
            // normalizing the side there, though appropriate for most
            // coordsAtPos queries, would break selection drawing.
            let fromCoords = view.coordsAtPos(from, (from == line.to ? -2 : 2));
            let toCoords = view.coordsAtPos(to, (to == line.from ? 2 : -2));
            top = Math.min(fromCoords.top, toCoords.top, top);
            bottom = Math.max(fromCoords.bottom, toCoords.bottom, bottom);
            if (dir == Direction.LTR)
                horizontal.push(ltr && fromOpen ? leftSide : fromCoords.left, ltr && toOpen ? rightSide : toCoords.right);
            else
                horizontal.push(!ltr && toOpen ? leftSide : toCoords.left, !ltr && fromOpen ? rightSide : fromCoords.right);
        }
        let start = from !== null && from !== void 0 ? from : line.from, end = to !== null && to !== void 0 ? to : line.to;
        // Split the range by visible range and document line
        for (let r of view.visibleRanges)
            if (r.to > start && r.from < end) {
                for (let pos = Math.max(r.from, start), endPos = Math.min(r.to, end);;) {
                    let docLine = view.state.doc.lineAt(pos);
                    for (let span of view.bidiSpans(docLine)) {
                        let spanFrom = span.from + docLine.from, spanTo = span.to + docLine.from;
                        if (spanFrom >= endPos)
                            break;
                        if (spanTo > pos)
                            addSpan(Math.max(spanFrom, pos), from == null && spanFrom <= start, Math.min(spanTo, endPos), to == null && spanTo >= end, span.dir);
                    }
                    pos = docLine.to + 1;
                    if (pos >= endPos)
                        break;
                }
            }
        if (horizontal.length == 0)
            addSpan(start, from == null, end, to == null, view.textDirection);
        return { top, bottom, horizontal };
    }
    function drawForWidget(block, top) {
        let y = contentRect.top + (top ? block.top : block.bottom);
        return { top: y, bottom: y, horizontal: [] };
    }
}
function measureCursor(view, cursor, primary) {
    let pos = view.coordsAtPos(cursor.head, cursor.assoc || 1);
    if (!pos)
        return null;
    let base = getBase(view);
    return new Piece(pos.left - base.left, pos.top - base.top, -1, pos.bottom - pos.top, primary ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary");
}

/**
A gutter marker represents a bit of information attached to a line
in a specific gutter. Your own custom markers have to extend this
class.
*/
class GutterMarker extends RangeValue {
    /**
    @internal
    */
    compare(other) {
        return this == other || this.constructor == other.constructor && this.eq(other);
    }
    /**
    Compare this marker to another marker of the same type.
    */
    eq(other) { return false; }
}
GutterMarker.prototype.elementClass = "";
GutterMarker.prototype.toDOM = undefined;
GutterMarker.prototype.mapMode = MapMode.TrackBefore;
GutterMarker.prototype.startSide = GutterMarker.prototype.endSide = -1;
GutterMarker.prototype.point = true;
/**
Facet used to add a class to all gutter elements for a given line.
Markers given to this facet should _only_ define an
[`elementclass`](https://codemirror.net/6/docs/ref/#gutter.GutterMarker.elementClass), not a
[`toDOM`](https://codemirror.net/6/docs/ref/#gutter.GutterMarker.toDOM) (or the marker will appear
in all gutters for the line).
*/
const gutterLineClass = /*@__PURE__*/Facet.define();
const activeGutters = /*@__PURE__*/Facet.define();
const baseTheme$2 = /*@__PURE__*/EditorView.baseTheme({
    ".cm-gutters": {
        display: "flex",
        height: "100%",
        boxSizing: "border-box",
        left: 0,
        zIndex: 200
    },
    "&light .cm-gutters": {
        backgroundColor: "#f5f5f5",
        color: "#999",
        borderRight: "1px solid #ddd"
    },
    "&dark .cm-gutters": {
        backgroundColor: "#333338",
        color: "#ccc"
    },
    ".cm-gutter": {
        display: "flex !important",
        flexDirection: "column",
        flexShrink: 0,
        boxSizing: "border-box",
        minHeight: "100%",
        overflow: "hidden"
    },
    ".cm-gutterElement": {
        boxSizing: "border-box"
    },
    ".cm-lineNumbers .cm-gutterElement": {
        padding: "0 3px 0 5px",
        minWidth: "20px",
        textAlign: "right",
        whiteSpace: "nowrap"
    },
    "&light .cm-activeLineGutter": {
        backgroundColor: "#e2f2ff"
    },
    "&dark .cm-activeLineGutter": {
        backgroundColor: "#222227"
    }
});
const unfixGutters = /*@__PURE__*/Facet.define({
    combine: values => values.some(x => x)
});
/**
The gutter-drawing plugin is automatically enabled when you add a
gutter, but you can use this function to explicitly configure it.

Unless `fixed` is explicitly set to `false`, the gutters are
fixed, meaning they don't scroll along with the content
horizontally (except on Internet Explorer, which doesn't support
CSS [`position:
sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)).
*/
function gutters(config) {
    let result = [
        gutterView,
        baseTheme$2
    ];
    if (config && config.fixed === false)
        result.push(unfixGutters.of(true));
    return result;
}
const gutterView = /*@__PURE__*/ViewPlugin.fromClass(class {
    constructor(view) {
        this.view = view;
        this.dom = document.createElement("div");
        this.dom.className = "cm-gutters";
        this.dom.setAttribute("aria-hidden", "true");
        this.dom.style.minHeight = this.view.contentHeight + "px";
        this.gutters = view.state.facet(activeGutters).map(conf => new SingleGutterView(view, conf));
        for (let gutter of this.gutters)
            this.dom.appendChild(gutter.dom);
        this.fixed = !view.state.facet(unfixGutters);
        if (this.fixed) {
            // FIXME IE11 fallback, which doesn't support position: sticky,
            // by using position: relative + event handlers that realign the
            // gutter (or just force fixed=false on IE11?)
            this.dom.style.position = "sticky";
        }
        view.scrollDOM.insertBefore(this.dom, view.contentDOM);
        this.syncGutters();
    }
    update(update) {
        if (this.updateGutters(update))
            this.syncGutters();
        if (update.geometryChanged)
            this.dom.style.minHeight = this.view.contentHeight + "px";
        if (this.view.state.facet(unfixGutters) != !this.fixed) {
            this.fixed = !this.fixed;
            this.dom.style.position = this.fixed ? "sticky" : "";
        }
    }
    syncGutters() {
        let lineClasses = RangeSet.iter(this.view.state.facet(gutterLineClass), this.view.viewport.from);
        let classSet = [];
        let contexts = this.gutters.map(gutter => new UpdateContext(gutter, this.view.viewport));
        this.view.viewportLines(line => {
            let text;
            if (Array.isArray(line.type)) {
                for (let b of line.type)
                    if (b.type == BlockType.Text) {
                        text = b;
                        break;
                    }
            }
            else {
                text = line.type == BlockType.Text ? line : undefined;
            }
            if (!text)
                return;
            if (classSet.length)
                classSet = [];
            advanceCursor(lineClasses, classSet, line.from);
            for (let cx of contexts)
                cx.line(this.view, text, classSet);
        }, 0);
        for (let cx of contexts)
            cx.finish();
    }
    updateGutters(update) {
        let prev = update.startState.facet(activeGutters), cur = update.state.facet(activeGutters);
        let change = update.docChanged || update.heightChanged || update.viewportChanged ||
            !RangeSet.eq(update.startState.facet(gutterLineClass), update.state.facet(gutterLineClass), update.view.viewport.from, update.view.viewport.to);
        if (prev == cur) {
            for (let gutter of this.gutters)
                if (gutter.update(update))
                    change = true;
        }
        else {
            change = true;
            let gutters = [];
            for (let conf of cur) {
                let known = prev.indexOf(conf);
                if (known < 0) {
                    gutters.push(new SingleGutterView(this.view, conf));
                }
                else {
                    this.gutters[known].update(update);
                    gutters.push(this.gutters[known]);
                }
            }
            for (let g of this.gutters)
                g.dom.remove();
            for (let g of gutters)
                this.dom.appendChild(g.dom);
            this.gutters = gutters;
        }
        return change;
    }
    destroy() {
        this.dom.remove();
    }
}, {
    provide: /*@__PURE__*/PluginField.scrollMargins.from(value => {
        if (value.gutters.length == 0 || !value.fixed)
            return null;
        return value.view.textDirection == Direction.LTR ? { left: value.dom.offsetWidth } : { right: value.dom.offsetWidth };
    })
});
function asArray(val) { return (Array.isArray(val) ? val : [val]); }
function advanceCursor(cursor, collect, pos) {
    while (cursor.value && cursor.from <= pos) {
        if (cursor.from == pos)
            collect.push(cursor.value);
        cursor.next();
    }
}
class UpdateContext {
    constructor(gutter, viewport) {
        this.gutter = gutter;
        this.localMarkers = [];
        this.i = 0;
        this.height = 0;
        this.cursor = RangeSet.iter(gutter.markers, viewport.from);
    }
    line(view, line, extraMarkers) {
        if (this.localMarkers.length)
            this.localMarkers = [];
        advanceCursor(this.cursor, this.localMarkers, line.from);
        let localMarkers = extraMarkers.length ? this.localMarkers.concat(extraMarkers) : this.localMarkers;
        let forLine = this.gutter.config.lineMarker(view, line, localMarkers);
        if (forLine)
            localMarkers.unshift(forLine);
        let gutter = this.gutter;
        if (localMarkers.length == 0 && !gutter.config.renderEmptyElements)
            return;
        let above = line.top - this.height;
        if (this.i == gutter.elements.length) {
            let newElt = new GutterElement(view, line.height, above, localMarkers);
            gutter.elements.push(newElt);
            gutter.dom.appendChild(newElt.dom);
        }
        else {
            let elt = gutter.elements[this.i];
            if (sameMarkers(localMarkers, elt.markers))
                localMarkers = elt.markers;
            elt.update(view, line.height, above, localMarkers);
        }
        this.height = line.bottom;
        this.i++;
    }
    finish() {
        let gutter = this.gutter;
        while (gutter.elements.length > this.i)
            gutter.dom.removeChild(gutter.elements.pop().dom);
    }
}
class SingleGutterView {
    constructor(view, config) {
        this.view = view;
        this.config = config;
        this.elements = [];
        this.spacer = null;
        this.dom = document.createElement("div");
        this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
        for (let prop in config.domEventHandlers) {
            this.dom.addEventListener(prop, (event) => {
                let line = view.visualLineAtHeight(event.clientY, view.contentDOM.getBoundingClientRect().top);
                if (config.domEventHandlers[prop](view, line, event))
                    event.preventDefault();
            });
        }
        this.markers = asArray(config.markers(view));
        if (config.initialSpacer) {
            this.spacer = new GutterElement(view, 0, 0, [config.initialSpacer(view)]);
            this.dom.appendChild(this.spacer.dom);
            this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none";
        }
    }
    update(update) {
        let prevMarkers = this.markers;
        this.markers = asArray(this.config.markers(update.view));
        if (this.spacer && this.config.updateSpacer) {
            let updated = this.config.updateSpacer(this.spacer.markers[0], update);
            if (updated != this.spacer.markers[0])
                this.spacer.update(update.view, 0, 0, [updated]);
        }
        let vp = update.view.viewport;
        return !RangeSet.eq(this.markers, prevMarkers, vp.from, vp.to) ||
            (this.config.lineMarkerChange ? this.config.lineMarkerChange(update) : false);
    }
}
class GutterElement {
    constructor(view, height, above, markers) {
        this.height = -1;
        this.above = 0;
        this.dom = document.createElement("div");
        this.update(view, height, above, markers);
    }
    update(view, height, above, markers) {
        if (this.height != height)
            this.dom.style.height = (this.height = height) + "px";
        if (this.above != above)
            this.dom.style.marginTop = (this.above = above) ? above + "px" : "";
        if (this.markers != markers) {
            this.markers = markers;
            for (let ch; ch = this.dom.lastChild;)
                ch.remove();
            let cls = "cm-gutterElement";
            for (let m of markers) {
                if (m.toDOM)
                    this.dom.appendChild(m.toDOM(view));
                let c = m.elementClass;
                if (c)
                    cls += " " + c;
            }
            this.dom.className = cls;
        }
    }
}
function sameMarkers(a, b) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (!a[i].compare(b[i]))
            return false;
    return true;
}
/**
Facet used to provide markers to the line number gutter.
*/
const lineNumberMarkers = /*@__PURE__*/Facet.define();
const lineNumberConfig = /*@__PURE__*/Facet.define({
    combine(values) {
        return combineConfig(values, { formatNumber: String, domEventHandlers: {} }, {
            domEventHandlers(a, b) {
                let result = Object.assign({}, a);
                for (let event in b) {
                    let exists = result[event], add = b[event];
                    result[event] = exists ? (view, line, event) => exists(view, line, event) || add(view, line, event) : add;
                }
                return result;
            }
        });
    }
});
class NumberMarker extends GutterMarker {
    constructor(number) {
        super();
        this.number = number;
    }
    eq(other) { return this.number == other.number; }
    toDOM() { return document.createTextNode(this.number); }
}
function formatNumber(view, number) {
    return view.state.facet(lineNumberConfig).formatNumber(number, view.state);
}
const lineNumberGutter = /*@__PURE__*/activeGutters.compute([lineNumberConfig], state => ({
    class: "cm-lineNumbers",
    renderEmptyElements: false,
    markers(view) { return view.state.facet(lineNumberMarkers); },
    lineMarker(view, line, others) {
        if (others.some(m => m.toDOM))
            return null;
        return new NumberMarker(formatNumber(view, view.state.doc.lineAt(line.from).number));
    },
    lineMarkerChange: update => update.startState.facet(lineNumberConfig) != update.state.facet(lineNumberConfig),
    initialSpacer(view) {
        return new NumberMarker(formatNumber(view, maxLineNumber(view.state.doc.lines)));
    },
    updateSpacer(spacer, update) {
        let max = formatNumber(update.view, maxLineNumber(update.view.state.doc.lines));
        return max == spacer.number ? spacer : new NumberMarker(max);
    },
    domEventHandlers: state.facet(lineNumberConfig).domEventHandlers
}));
/**
Create a line number gutter extension.
*/
function lineNumbers(config = {}) {
    return [
        lineNumberConfig.of(config),
        gutters(),
        lineNumberGutter
    ];
}
function maxLineNumber(lines) {
    let last = 9;
    while (last < lines)
        last = last * 10 + 9;
    return last;
}

const fromHistory = /*@__PURE__*/Annotation.define();
/**
Transaction annotation that will prevent that transaction from
being combined with other transactions in the undo history. Given
`"before"`, it'll prevent merging with previous transactions. With
`"after"`, subsequent transactions won't be combined with this
one. With `"full"`, the transaction is isolated on both sides.
*/
const isolateHistory = /*@__PURE__*/Annotation.define();
/**
This facet provides a way to register functions that, given a
transaction, provide a set of effects that the history should
store when inverting the transaction. This can be used to
integrate some kinds of effects in the history, so that they can
be undone (and redone again).
*/
const invertedEffects = /*@__PURE__*/Facet.define();
const historyConfig = /*@__PURE__*/Facet.define({
    combine(configs) {
        return combineConfig(configs, {
            minDepth: 100,
            newGroupDelay: 500
        }, { minDepth: Math.max, newGroupDelay: Math.min });
    }
});
const historyField_ = /*@__PURE__*/StateField.define({
    create() {
        return HistoryState.empty;
    },
    update(state, tr) {
        let config = tr.state.facet(historyConfig);
        let fromHist = tr.annotation(fromHistory);
        if (fromHist) {
            let item = HistEvent.fromTransaction(tr), from = fromHist.side;
            let other = from == 0 /* Done */ ? state.undone : state.done;
            if (item)
                other = updateBranch(other, other.length, config.minDepth, item);
            else
                other = addSelection(other, tr.startState.selection);
            return new HistoryState(from == 0 /* Done */ ? fromHist.rest : other, from == 0 /* Done */ ? other : fromHist.rest);
        }
        let isolate = tr.annotation(isolateHistory);
        if (isolate == "full" || isolate == "before")
            state = state.isolate();
        if (tr.annotation(Transaction.addToHistory) === false)
            return !tr.changes.empty ? state.addMapping(tr.changes.desc) : state;
        let event = HistEvent.fromTransaction(tr);
        let time = tr.annotation(Transaction.time), userEvent = tr.annotation(Transaction.userEvent);
        if (event)
            state = state.addChanges(event, time, userEvent, config.newGroupDelay, config.minDepth);
        else if (tr.selection)
            state = state.addSelection(tr.startState.selection, time, userEvent, config.newGroupDelay);
        if (isolate == "full" || isolate == "after")
            state = state.isolate();
        return state;
    },
    toJSON(value) {
        return { done: value.done.map(e => e.toJSON()), undone: value.undone.map(e => e.toJSON()) };
    },
    fromJSON(json) {
        return new HistoryState(json.done.map(HistEvent.fromJSON), json.undone.map(HistEvent.fromJSON));
    }
});
/**
Create a history extension with the given configuration.
*/
function history(config = {}) {
    return [
        historyField_,
        historyConfig.of(config),
        EditorView.domEventHandlers({
            beforeinput(e, view) {
                if (e.inputType == "historyUndo")
                    return undo(view);
                if (e.inputType == "historyRedo")
                    return redo(view);
                return false;
            }
        })
    ];
}
function cmd(side, selection) {
    return function ({ state, dispatch }) {
        let historyState = state.field(historyField_, false);
        if (!historyState)
            return false;
        let tr = historyState.pop(side, state, selection);
        if (!tr)
            return false;
        dispatch(tr);
        return true;
    };
}
/**
Undo a single group of history events. Returns false if no group
was available.
*/
const undo = /*@__PURE__*/cmd(0 /* Done */, false);
/**
Redo a group of history events. Returns false if no group was
available.
*/
const redo = /*@__PURE__*/cmd(1 /* Undone */, false);
/**
Undo a selection change.
*/
const undoSelection = /*@__PURE__*/cmd(0 /* Done */, true);
/**
Redo a selection change.
*/
const redoSelection = /*@__PURE__*/cmd(1 /* Undone */, true);
// History events store groups of changes or effects that need to be
// undone/redone together.
class HistEvent {
    constructor(
    // The changes in this event. Normal events hold at least one
    // change or effect. But it may be necessary to store selection
    // events before the first change, in which case a special type of
    // instance is created which doesn't hold any changes, with
    // changes == startSelection == undefined
    changes, 
    // The effects associated with this event
    effects, mapped, 
    // The selection before this event
    startSelection, 
    // Stores selection changes after this event, to be used for
    // selection undo/redo.
    selectionsAfter) {
        this.changes = changes;
        this.effects = effects;
        this.mapped = mapped;
        this.startSelection = startSelection;
        this.selectionsAfter = selectionsAfter;
    }
    setSelAfter(after) {
        return new HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
    }
    toJSON() {
        var _a, _b, _c;
        return {
            changes: (_a = this.changes) === null || _a === void 0 ? void 0 : _a.toJSON(),
            mapped: (_b = this.mapped) === null || _b === void 0 ? void 0 : _b.toJSON(),
            startSelection: (_c = this.startSelection) === null || _c === void 0 ? void 0 : _c.toJSON(),
            selectionsAfter: this.selectionsAfter.map(s => s.toJSON())
        };
    }
    static fromJSON(json) {
        return new HistEvent(json.changes && ChangeSet.fromJSON(json.changes), [], json.mapped && ChangeDesc.fromJSON(json.mapped), json.startSelection && EditorSelection.fromJSON(json.startSelection), json.selectionsAfter.map(EditorSelection.fromJSON));
    }
    // This does not check `addToHistory` and such, it assumes the
    // transaction needs to be converted to an item. Returns null when
    // there are no changes or effects in the transaction.
    static fromTransaction(tr) {
        let effects = none;
        for (let invert of tr.startState.facet(invertedEffects)) {
            let result = invert(tr);
            if (result.length)
                effects = effects.concat(result);
        }
        if (!effects.length && tr.changes.empty)
            return null;
        return new HistEvent(tr.changes.invert(tr.startState.doc), effects, undefined, tr.startState.selection, none);
    }
    static selection(selections) {
        return new HistEvent(undefined, none, undefined, undefined, selections);
    }
}
function updateBranch(branch, to, maxLen, newEvent) {
    let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
    let newBranch = branch.slice(start, to);
    newBranch.push(newEvent);
    return newBranch;
}
function isAdjacent(a, b) {
    let ranges = [], isAdjacent = false;
    a.iterChangedRanges((f, t) => ranges.push(f, t));
    b.iterChangedRanges((_f, _t, f, t) => {
        for (let i = 0; i < ranges.length;) {
            let from = ranges[i++], to = ranges[i++];
            if (t >= from && f <= to)
                isAdjacent = true;
        }
    });
    return isAdjacent;
}
function eqSelectionShape(a, b) {
    return a.ranges.length == b.ranges.length &&
        a.ranges.filter((r, i) => r.empty != b.ranges[i].empty).length === 0;
}
function conc(a, b) {
    return !a.length ? b : !b.length ? a : a.concat(b);
}
const none = [];
const MaxSelectionsPerEvent = 200;
function addSelection(branch, selection) {
    if (!branch.length) {
        return [HistEvent.selection([selection])];
    }
    else {
        let lastEvent = branch[branch.length - 1];
        let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
        if (sels.length && sels[sels.length - 1].eq(selection))
            return branch;
        sels.push(selection);
        return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
    }
}
// Assumes the top item has one or more selectionAfter values
function popSelection(branch) {
    let last = branch[branch.length - 1];
    let newBranch = branch.slice();
    newBranch[branch.length - 1] = last.setSelAfter(last.selectionsAfter.slice(0, last.selectionsAfter.length - 1));
    return newBranch;
}
// Add a mapping to the top event in the given branch. If this maps
// away all the changes and effects in that item, drop it and
// propagate the mapping to the next item.
function addMappingToBranch(branch, mapping) {
    if (!branch.length)
        return branch;
    let length = branch.length, selections = none;
    while (length) {
        let event = mapEvent(branch[length - 1], mapping, selections);
        if (event.changes && !event.changes.empty || event.effects.length) { // Event survived mapping
            let result = branch.slice(0, length);
            result[length - 1] = event;
            return result;
        }
        else { // Drop this event, since there's no changes or effects left
            mapping = event.mapped;
            length--;
            selections = event.selectionsAfter;
        }
    }
    return selections.length ? [HistEvent.selection(selections)] : none;
}
function mapEvent(event, mapping, extraSelections) {
    let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map(s => s.map(mapping)) : none, extraSelections);
    // Change-less events don't store mappings (they are always the last event in a branch)
    if (!event.changes)
        return HistEvent.selection(selections);
    let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
    let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
    return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
}
class HistoryState {
    constructor(done, undone, prevTime = 0, prevUserEvent = undefined) {
        this.done = done;
        this.undone = undone;
        this.prevTime = prevTime;
        this.prevUserEvent = prevUserEvent;
    }
    isolate() {
        return this.prevTime ? new HistoryState(this.done, this.undone) : this;
    }
    addChanges(event, time, userEvent, newGroupDelay, maxLen) {
        let done = this.done, lastEvent = done[done.length - 1];
        if (lastEvent && lastEvent.changes && !lastEvent.changes.empty && event.changes &&
            ((!lastEvent.selectionsAfter.length &&
                time - this.prevTime < newGroupDelay &&
                isAdjacent(lastEvent.changes, event.changes)) ||
                // For compose (but not compose.start) events, always join with previous event
                userEvent == "input.type.compose")) {
            done = updateBranch(done, done.length - 1, maxLen, new HistEvent(event.changes.compose(lastEvent.changes), conc(event.effects, lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none));
        }
        else {
            done = updateBranch(done, done.length, maxLen, event);
        }
        return new HistoryState(done, none, time, userEvent);
    }
    addSelection(selection, time, userEvent, newGroupDelay) {
        let last = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none;
        if (last.length > 0 &&
            time - this.prevTime < newGroupDelay &&
            userEvent == this.prevUserEvent && userEvent && /^select($|\.)/.test(userEvent) &&
            eqSelectionShape(last[last.length - 1], selection))
            return this;
        return new HistoryState(addSelection(this.done, selection), this.undone, time, userEvent);
    }
    addMapping(mapping) {
        return new HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
    }
    pop(side, state, selection) {
        let branch = side == 0 /* Done */ ? this.done : this.undone;
        if (branch.length == 0)
            return null;
        let event = branch[branch.length - 1];
        if (selection && event.selectionsAfter.length) {
            return state.update({
                selection: event.selectionsAfter[event.selectionsAfter.length - 1],
                annotations: fromHistory.of({ side, rest: popSelection(branch) }),
                userEvent: side == 0 /* Done */ ? "select.undo" : "select.redo"
            });
        }
        else if (!event.changes) {
            return null;
        }
        else {
            let rest = branch.length == 1 ? none : branch.slice(0, branch.length - 1);
            if (event.mapped)
                rest = addMappingToBranch(rest, event.mapped);
            return state.update({
                changes: event.changes,
                selection: event.startSelection,
                effects: event.effects,
                annotations: fromHistory.of({ side, rest }),
                filter: false,
                userEvent: side == 0 /* Done */ ? "undo" : "redo"
            });
        }
    }
}
HistoryState.empty = /*@__PURE__*/new HistoryState(none, none);
/**
Default key bindings for the undo history.

- Mod-z: [`undo`](https://codemirror.net/6/docs/ref/#history.undo).
- Mod-y (Mod-Shift-z on macOS): [`redo`](https://codemirror.net/6/docs/ref/#history.redo).
- Mod-u: [`undoSelection`](https://codemirror.net/6/docs/ref/#history.undoSelection).
- Alt-u (Mod-Shift-u on macOS): [`redoSelection`](https://codemirror.net/6/docs/ref/#history.redoSelection).
*/
const historyKeymap = [
    { key: "Mod-z", run: undo, preventDefault: true },
    { key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true },
    { key: "Mod-u", run: undoSelection, preventDefault: true },
    { key: "Alt-u", mac: "Mod-Shift-u", run: redoSelection, preventDefault: true }
];

// FIXME profile adding a per-Tree TreeNode cache, validating it by
// parent pointer
/// The default maximum length of a `TreeBuffer` node (1024).
const DefaultBufferLength = 1024;
let nextPropID = 0;
class Range {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}
/// Each [node type](#common.NodeType) or [individual tree](#common.Tree)
/// can have metadata associated with it in props. Instances of this
/// class represent prop names.
class NodeProp {
    /// Create a new node prop type.
    constructor(config = {}) {
        this.id = nextPropID++;
        this.perNode = !!config.perNode;
        this.deserialize = config.deserialize || (() => {
            throw new Error("This node type doesn't define a deserialize function");
        });
    }
    /// This is meant to be used with
    /// [`NodeSet.extend`](#common.NodeSet.extend) or
    /// [`LRParser.configure`](#lr.ParserConfig.props) to compute
    /// prop values for each node type in the set. Takes a [match
    /// object](#common.NodeType^match) or function that returns undefined
    /// if the node type doesn't get this prop, and the prop's value if
    /// it does.
    add(match) {
        if (this.perNode)
            throw new RangeError("Can't add per-node props to node types");
        if (typeof match != "function")
            match = NodeType.match(match);
        return (type) => {
            let result = match(type);
            return result === undefined ? null : [this, result];
        };
    }
}
/// Prop that is used to describe matching delimiters. For opening
/// delimiters, this holds an array of node names (written as a
/// space-separated string when declaring this prop in a grammar)
/// for the node types of closing delimiters that match it.
NodeProp.closedBy = new NodeProp({ deserialize: str => str.split(" ") });
/// The inverse of [`closedBy`](#common.NodeProp^closedBy). This is
/// attached to closing delimiters, holding an array of node names
/// of types of matching opening delimiters.
NodeProp.openedBy = new NodeProp({ deserialize: str => str.split(" ") });
/// Used to assign node types to groups (for example, all node
/// types that represent an expression could be tagged with an
/// `"Expression"` group).
NodeProp.group = new NodeProp({ deserialize: str => str.split(" ") });
/// The hash of the [context](#lr.ContextTracker.constructor)
/// that the node was parsed in, if any. Used to limit reuse of
/// contextual nodes.
NodeProp.contextHash = new NodeProp({ perNode: true });
/// The distance beyond the end of the node that the tokenizer
/// looked ahead for any of the tokens inside the node. (The LR
/// parser only stores this when it is larger than 25, for
/// efficiency reasons.)
NodeProp.lookAhead = new NodeProp({ perNode: true });
/// This per-node prop is used to replace a given node, or part of a
/// node, with another tree. This is useful to include trees from
/// different languages.
NodeProp.mounted = new NodeProp({ perNode: true });
const noProps = Object.create(null);
/// Each node in a syntax tree has a node type associated with it.
class NodeType {
    /// @internal
    constructor(
    /// The name of the node type. Not necessarily unique, but if the
    /// grammar was written properly, different node types with the
    /// same name within a node set should play the same semantic
    /// role.
    name, 
    /// @internal
    props, 
    /// The id of this node in its set. Corresponds to the term ids
    /// used in the parser.
    id, 
    /// @internal
    flags = 0) {
        this.name = name;
        this.props = props;
        this.id = id;
        this.flags = flags;
    }
    static define(spec) {
        let props = spec.props && spec.props.length ? Object.create(null) : noProps;
        let flags = (spec.top ? 1 /* Top */ : 0) | (spec.skipped ? 2 /* Skipped */ : 0) |
            (spec.error ? 4 /* Error */ : 0) | (spec.name == null ? 8 /* Anonymous */ : 0);
        let type = new NodeType(spec.name || "", props, spec.id, flags);
        if (spec.props)
            for (let src of spec.props) {
                if (!Array.isArray(src))
                    src = src(type);
                if (src) {
                    if (src[0].perNode)
                        throw new RangeError("Can't store a per-node prop on a node type");
                    props[src[0].id] = src[1];
                }
            }
        return type;
    }
    /// Retrieves a node prop for this type. Will return `undefined` if
    /// the prop isn't present on this node.
    prop(prop) { return this.props[prop.id]; }
    /// True when this is the top node of a grammar.
    get isTop() { return (this.flags & 1 /* Top */) > 0; }
    /// True when this node is produced by a skip rule.
    get isSkipped() { return (this.flags & 2 /* Skipped */) > 0; }
    /// Indicates whether this is an error node.
    get isError() { return (this.flags & 4 /* Error */) > 0; }
    /// When true, this node type doesn't correspond to a user-declared
    /// named node, for example because it is used to cache repetition.
    get isAnonymous() { return (this.flags & 8 /* Anonymous */) > 0; }
    /// Returns true when this node's name or one of its
    /// [groups](#common.NodeProp^group) matches the given string.
    is(name) {
        if (typeof name == 'string') {
            if (this.name == name)
                return true;
            let group = this.prop(NodeProp.group);
            return group ? group.indexOf(name) > -1 : false;
        }
        return this.id == name;
    }
    /// Create a function from node types to arbitrary values by
    /// specifying an object whose property names are node or
    /// [group](#common.NodeProp^group) names. Often useful with
    /// [`NodeProp.add`](#common.NodeProp.add). You can put multiple
    /// names, separated by spaces, in a single property name to map
    /// multiple node names to a single value.
    static match(map) {
        let direct = Object.create(null);
        for (let prop in map)
            for (let name of prop.split(" "))
                direct[name] = map[prop];
        return (node) => {
            for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
                let found = direct[i < 0 ? node.name : groups[i]];
                if (found)
                    return found;
            }
        };
    }
}
/// An empty dummy node type to use when no actual type is available.
NodeType.none = new NodeType("", Object.create(null), 0, 8 /* Anonymous */);
/// A node set holds a collection of node types. It is used to
/// compactly represent trees by storing their type ids, rather than a
/// full pointer to the type object, in a numeric array. Each parser
/// [has](#lr.LRParser.nodeSet) a node set, and [tree
/// buffers](#common.TreeBuffer) can only store collections of nodes
/// from the same set. A set can have a maximum of 2**16 (65536) node
/// types in it, so that the ids fit into 16-bit typed array slots.
class NodeSet {
    /// Create a set with the given types. The `id` property of each
    /// type should correspond to its position within the array.
    constructor(
    /// The node types in this set, by id.
    types) {
        this.types = types;
        for (let i = 0; i < types.length; i++)
            if (types[i].id != i)
                throw new RangeError("Node type ids should correspond to array positions when creating a node set");
    }
    /// Create a copy of this set with some node properties added. The
    /// arguments to this method should be created with
    /// [`NodeProp.add`](#common.NodeProp.add).
    extend(...props) {
        let newTypes = [];
        for (let type of this.types) {
            let newProps = null;
            for (let source of props) {
                let add = source(type);
                if (add) {
                    if (!newProps)
                        newProps = Object.assign({}, type.props);
                    newProps[add[0].id] = add[1];
                }
            }
            newTypes.push(newProps ? new NodeType(type.name, newProps, type.id, type.flags) : type);
        }
        return new NodeSet(newTypes);
    }
}
const CachedNode = new WeakMap();
/// A piece of syntax tree. There are two ways to approach these
/// trees: the way they are actually stored in memory, and the
/// convenient way.
///
/// Syntax trees are stored as a tree of `Tree` and `TreeBuffer`
/// objects. By packing detail information into `TreeBuffer` leaf
/// nodes, the representation is made a lot more memory-efficient.
///
/// However, when you want to actually work with tree nodes, this
/// representation is very awkward, so most client code will want to
/// use the [`TreeCursor`](#common.TreeCursor) or
/// [`SyntaxNode`](#common.SyntaxNode) interface instead, which provides
/// a view on some part of this data structure, and can be used to
/// move around to adjacent nodes.
class Tree {
    /// Construct a new tree. See also [`Tree.build`](#common.Tree^build).
    constructor(
    /// The type of the top node.
    type, 
    /// This node's child nodes.
    children, 
    /// The positions (offsets relative to the start of this tree) of
    /// the children.
    positions, 
    /// The total length of this tree
    length, 
    /// Per-node [node props](#common.NodeProp) to associate with this node.
    props) {
        this.type = type;
        this.children = children;
        this.positions = positions;
        this.length = length;
        /// @internal
        this.props = null;
        if (props && props.length) {
            this.props = Object.create(null);
            for (let [prop, value] of props)
                this.props[typeof prop == "number" ? prop : prop.id] = value;
        }
    }
    /// @internal
    toString() {
        let mounted = this.prop(NodeProp.mounted);
        if (mounted && !mounted.overlay)
            return mounted.tree.toString();
        let children = "";
        for (let ch of this.children) {
            let str = ch.toString();
            if (str) {
                if (children)
                    children += ",";
                children += str;
            }
        }
        return !this.type.name ? children :
            (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) +
                (children.length ? "(" + children + ")" : "");
    }
    /// Get a [tree cursor](#common.TreeCursor) rooted at this tree. When
    /// `pos` is given, the cursor is [moved](#common.TreeCursor.moveTo)
    /// to the given position and side.
    cursor(pos, side = 0) {
        let scope = (pos != null && CachedNode.get(this)) || this.topNode;
        let cursor = new TreeCursor(scope);
        if (pos != null) {
            cursor.moveTo(pos, side);
            CachedNode.set(this, cursor._tree);
        }
        return cursor;
    }
    /// Get a [tree cursor](#common.TreeCursor) that, unlike regular
    /// cursors, doesn't skip through
    /// [anonymous](#common.NodeType.isAnonymous) nodes and doesn't
    /// automatically enter mounted nodes.
    fullCursor() {
        return new TreeCursor(this.topNode, 1 /* Full */);
    }
    /// Get a [syntax node](#common.SyntaxNode) object for the top of the
    /// tree.
    get topNode() {
        return new TreeNode(this, 0, 0, null);
    }
    /// Get the [syntax node](#common.SyntaxNode) at the given position.
    /// If `side` is -1, this will move into nodes that end at the
    /// position. If 1, it'll move into nodes that start at the
    /// position. With 0, it'll only enter nodes that cover the position
    /// from both sides.
    resolve(pos, side = 0) {
        return this.cursor(pos, side).node;
    }
    /// Like [`resolve`](#common.Tree.resolve), but will enter
    /// [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
    /// pointing into the innermost overlaid tree at the given position
    /// (with parent links going through all parent structure, including
    /// the host trees).
    resolveInner(pos, side = 0) {
        let result = this.topNode;
        for (;;) {
            let inner = result.enter(pos, side);
            if (!inner)
                return result;
            result = inner;
        }
    }
    /// Iterate over the tree and its children, calling `enter` for any
    /// node that touches the `from`/`to` region (if given) before
    /// running over such a node's children, and `leave` (if given) when
    /// leaving the node. When `enter` returns `false`, that node will
    /// not have its children iterated over (or `leave` called).
    iterate(spec) {
        let { enter, leave, from = 0, to = this.length } = spec;
        for (let c = this.cursor(), get = () => c.node;;) {
            let mustLeave = false;
            if (c.from <= to && c.to >= from && (c.type.isAnonymous || enter(c.type, c.from, c.to, get) !== false)) {
                if (c.firstChild())
                    continue;
                if (!c.type.isAnonymous)
                    mustLeave = true;
            }
            for (;;) {
                if (mustLeave && leave)
                    leave(c.type, c.from, c.to, get);
                mustLeave = c.type.isAnonymous;
                if (c.nextSibling())
                    break;
                if (!c.parent())
                    return;
                mustLeave = true;
            }
        }
    }
    /// Get the value of the given [node prop](#common.NodeProp) for this
    /// node. Works with both per-node and per-type props.
    prop(prop) {
        return !prop.perNode ? this.type.prop(prop) : this.props ? this.props[prop.id] : undefined;
    }
    /// Returns the node's [per-node props](#common.NodeProp.perNode) in a
    /// format that can be passed to the [`Tree`](#common.Tree)
    /// constructor.
    get propValues() {
        let result = [];
        if (this.props)
            for (let id in this.props)
                result.push([+id, this.props[id]]);
        return result;
    }
    /// Balance the direct children of this tree, producing a copy of
    /// which may have children grouped into subtrees with type
    /// [`NodeType.none`](#common.NodeType^none).
    balance(config = {}) {
        return this.children.length <= 8 /* BranchFactor */ ? this :
            balanceRange(NodeType.none, this.children, this.positions, 0, this.children.length, 0, this.length, (children, positions, length) => new Tree(this.type, children, positions, length, this.propValues), config.makeTree || ((children, positions, length) => new Tree(NodeType.none, children, positions, length)));
    }
    /// Build a tree from a postfix-ordered buffer of node information,
    /// or a cursor over such a buffer.
    static build(data) { return buildTree(data); }
}
/// The empty tree
Tree.empty = new Tree(NodeType.none, [], [], 0);
class FlatBufferCursor {
    constructor(buffer, index) {
        this.buffer = buffer;
        this.index = index;
    }
    get id() { return this.buffer[this.index - 4]; }
    get start() { return this.buffer[this.index - 3]; }
    get end() { return this.buffer[this.index - 2]; }
    get size() { return this.buffer[this.index - 1]; }
    get pos() { return this.index; }
    next() { this.index -= 4; }
    fork() { return new FlatBufferCursor(this.buffer, this.index); }
}
/// Tree buffers contain (type, start, end, endIndex) quads for each
/// node. In such a buffer, nodes are stored in prefix order (parents
/// before children, with the endIndex of the parent indicating which
/// children belong to it)
class TreeBuffer {
    /// Create a tree buffer.
    constructor(
    /// The buffer's content.
    buffer, 
    /// The total length of the group of nodes in the buffer.
    length, 
    /// The node set used in this buffer.
    set) {
        this.buffer = buffer;
        this.length = length;
        this.set = set;
    }
    /// @internal
    get type() { return NodeType.none; }
    /// @internal
    toString() {
        let result = [];
        for (let index = 0; index < this.buffer.length;) {
            result.push(this.childString(index));
            index = this.buffer[index + 3];
        }
        return result.join(",");
    }
    /// @internal
    childString(index) {
        let id = this.buffer[index], endIndex = this.buffer[index + 3];
        let type = this.set.types[id], result = type.name;
        if (/\W/.test(result) && !type.isError)
            result = JSON.stringify(result);
        index += 4;
        if (endIndex == index)
            return result;
        let children = [];
        while (index < endIndex) {
            children.push(this.childString(index));
            index = this.buffer[index + 3];
        }
        return result + "(" + children.join(",") + ")";
    }
    /// @internal
    findChild(startIndex, endIndex, dir, pos, side) {
        let { buffer } = this, pick = -1;
        for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
            if (checkSide(side, pos, buffer[i + 1], buffer[i + 2])) {
                pick = i;
                if (dir > 0)
                    break;
            }
        }
        return pick;
    }
    /// @internal
    slice(startI, endI, from, to) {
        let b = this.buffer;
        let copy = new Uint16Array(endI - startI);
        for (let i = startI, j = 0; i < endI;) {
            copy[j++] = b[i++];
            copy[j++] = b[i++] - from;
            copy[j++] = b[i++] - from;
            copy[j++] = b[i++] - startI;
        }
        return new TreeBuffer(copy, to - from, this.set);
    }
}
function checkSide(side, pos, from, to) {
    switch (side) {
        case -2 /* Before */: return from < pos;
        case -1 /* AtOrBefore */: return to >= pos && from < pos;
        case 0 /* Around */: return from < pos && to > pos;
        case 1 /* AtOrAfter */: return from <= pos && to > pos;
        case 2 /* After */: return to > pos;
        case 4 /* DontCare */: return true;
    }
}
function enterUnfinishedNodesBefore(node, pos) {
    let scan = node.childBefore(pos);
    while (scan) {
        let last = scan.lastChild;
        if (!last || last.to != scan.to)
            break;
        if (last.type.isError && last.from == last.to) {
            node = scan;
            scan = last.prevSibling;
        }
        else {
            scan = last;
        }
    }
    return node;
}
class TreeNode {
    constructor(node, _from, 
    // Index in parent node, set to -1 if the node is not a direct child of _parent.node (overlay)
    index, _parent) {
        this.node = node;
        this._from = _from;
        this.index = index;
        this._parent = _parent;
    }
    get type() { return this.node.type; }
    get name() { return this.node.type.name; }
    get from() { return this._from; }
    get to() { return this._from + this.node.length; }
    nextChild(i, dir, pos, side, mode = 0) {
        for (let parent = this;;) {
            for (let { children, positions } = parent.node, e = dir > 0 ? children.length : -1; i != e; i += dir) {
                let next = children[i], start = positions[i] + parent._from;
                if (!checkSide(side, pos, start, start + next.length))
                    continue;
                if (next instanceof TreeBuffer) {
                    if (mode & 2 /* NoEnterBuffer */)
                        continue;
                    let index = next.findChild(0, next.buffer.length, dir, pos - start, side);
                    if (index > -1)
                        return new BufferNode(new BufferContext(parent, next, i, start), null, index);
                }
                else if ((mode & 1 /* Full */) || (!next.type.isAnonymous || hasChild(next))) {
                    let mounted;
                    if (!(mode & 1 /* Full */) && next.props && (mounted = next.prop(NodeProp.mounted)) && !mounted.overlay)
                        return new TreeNode(mounted.tree, start, i, parent);
                    let inner = new TreeNode(next, start, i, parent);
                    return (mode & 1 /* Full */) || !inner.type.isAnonymous ? inner
                        : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, pos, side);
                }
            }
            if ((mode & 1 /* Full */) || !parent.type.isAnonymous)
                return null;
            if (parent.index >= 0)
                i = parent.index + dir;
            else
                i = dir < 0 ? -1 : parent._parent.node.children.length;
            parent = parent._parent;
            if (!parent)
                return null;
        }
    }
    get firstChild() { return this.nextChild(0, 1, 0, 4 /* DontCare */); }
    get lastChild() { return this.nextChild(this.node.children.length - 1, -1, 0, 4 /* DontCare */); }
    childAfter(pos) { return this.nextChild(0, 1, pos, 2 /* After */); }
    childBefore(pos) { return this.nextChild(this.node.children.length - 1, -1, pos, -2 /* Before */); }
    enter(pos, side, overlays = true, buffers = true) {
        let mounted;
        if (overlays && (mounted = this.node.prop(NodeProp.mounted)) && mounted.overlay) {
            let rPos = pos - this.from;
            for (let { from, to } of mounted.overlay) {
                if ((side > 0 ? from <= rPos : from < rPos) &&
                    (side < 0 ? to >= rPos : to > rPos))
                    return new TreeNode(mounted.tree, mounted.overlay[0].from + this.from, -1, this);
            }
        }
        return this.nextChild(0, 1, pos, side, buffers ? 0 : 2 /* NoEnterBuffer */);
    }
    nextSignificantParent() {
        let val = this;
        while (val.type.isAnonymous && val._parent)
            val = val._parent;
        return val;
    }
    get parent() {
        return this._parent ? this._parent.nextSignificantParent() : null;
    }
    get nextSibling() {
        return this._parent && this.index >= 0 ? this._parent.nextChild(this.index + 1, 1, 0, 4 /* DontCare */) : null;
    }
    get prevSibling() {
        return this._parent && this.index >= 0 ? this._parent.nextChild(this.index - 1, -1, 0, 4 /* DontCare */) : null;
    }
    get cursor() { return new TreeCursor(this); }
    get tree() { return this.node; }
    toTree() { return this.node; }
    resolve(pos, side = 0) {
        return this.cursor.moveTo(pos, side).node;
    }
    enterUnfinishedNodesBefore(pos) { return enterUnfinishedNodesBefore(this, pos); }
    getChild(type, before = null, after = null) {
        let r = getChildren(this, type, before, after);
        return r.length ? r[0] : null;
    }
    getChildren(type, before = null, after = null) {
        return getChildren(this, type, before, after);
    }
    /// @internal
    toString() { return this.node.toString(); }
}
function getChildren(node, type, before, after) {
    let cur = node.cursor, result = [];
    if (!cur.firstChild())
        return result;
    if (before != null)
        while (!cur.type.is(before))
            if (!cur.nextSibling())
                return result;
    for (;;) {
        if (after != null && cur.type.is(after))
            return result;
        if (cur.type.is(type))
            result.push(cur.node);
        if (!cur.nextSibling())
            return after == null ? result : [];
    }
}
class BufferContext {
    constructor(parent, buffer, index, start) {
        this.parent = parent;
        this.buffer = buffer;
        this.index = index;
        this.start = start;
    }
}
class BufferNode {
    constructor(context, _parent, index) {
        this.context = context;
        this._parent = _parent;
        this.index = index;
        this.type = context.buffer.set.types[context.buffer.buffer[index]];
    }
    get name() { return this.type.name; }
    get from() { return this.context.start + this.context.buffer.buffer[this.index + 1]; }
    get to() { return this.context.start + this.context.buffer.buffer[this.index + 2]; }
    child(dir, pos, side) {
        let { buffer } = this.context;
        let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.context.start, side);
        return index < 0 ? null : new BufferNode(this.context, this, index);
    }
    get firstChild() { return this.child(1, 0, 4 /* DontCare */); }
    get lastChild() { return this.child(-1, 0, 4 /* DontCare */); }
    childAfter(pos) { return this.child(1, pos, 2 /* After */); }
    childBefore(pos) { return this.child(-1, pos, -2 /* Before */); }
    enter(pos, side, overlays, buffers = true) {
        if (!buffers)
            return null;
        let { buffer } = this.context;
        let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], side > 0 ? 1 : -1, pos - this.context.start, side);
        return index < 0 ? null : new BufferNode(this.context, this, index);
    }
    get parent() {
        return this._parent || this.context.parent.nextSignificantParent();
    }
    externalSibling(dir) {
        return this._parent ? null : this.context.parent.nextChild(this.context.index + dir, dir, 0, 4 /* DontCare */);
    }
    get nextSibling() {
        let { buffer } = this.context;
        let after = buffer.buffer[this.index + 3];
        if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
            return new BufferNode(this.context, this._parent, after);
        return this.externalSibling(1);
    }
    get prevSibling() {
        let { buffer } = this.context;
        let parentStart = this._parent ? this._parent.index + 4 : 0;
        if (this.index == parentStart)
            return this.externalSibling(-1);
        return new BufferNode(this.context, this._parent, buffer.findChild(parentStart, this.index, -1, 0, 4 /* DontCare */));
    }
    get cursor() { return new TreeCursor(this); }
    get tree() { return null; }
    toTree() {
        let children = [], positions = [];
        let { buffer } = this.context;
        let startI = this.index + 4, endI = buffer.buffer[this.index + 3];
        if (endI > startI) {
            let from = buffer.buffer[this.index + 1], to = buffer.buffer[this.index + 2];
            children.push(buffer.slice(startI, endI, from, to));
            positions.push(0);
        }
        return new Tree(this.type, children, positions, this.to - this.from);
    }
    resolve(pos, side = 0) {
        return this.cursor.moveTo(pos, side).node;
    }
    enterUnfinishedNodesBefore(pos) { return enterUnfinishedNodesBefore(this, pos); }
    /// @internal
    toString() { return this.context.buffer.childString(this.index); }
    getChild(type, before = null, after = null) {
        let r = getChildren(this, type, before, after);
        return r.length ? r[0] : null;
    }
    getChildren(type, before = null, after = null) {
        return getChildren(this, type, before, after);
    }
}
/// A tree cursor object focuses on a given node in a syntax tree, and
/// allows you to move to adjacent nodes.
class TreeCursor {
    /// @internal
    constructor(node, 
    /// @internal
    mode = 0) {
        this.mode = mode;
        this.buffer = null;
        this.stack = [];
        this.index = 0;
        this.bufferNode = null;
        if (node instanceof TreeNode) {
            this.yieldNode(node);
        }
        else {
            this._tree = node.context.parent;
            this.buffer = node.context;
            for (let n = node._parent; n; n = n._parent)
                this.stack.unshift(n.index);
            this.bufferNode = node;
            this.yieldBuf(node.index);
        }
    }
    /// Shorthand for `.type.name`.
    get name() { return this.type.name; }
    yieldNode(node) {
        if (!node)
            return false;
        this._tree = node;
        this.type = node.type;
        this.from = node.from;
        this.to = node.to;
        return true;
    }
    yieldBuf(index, type) {
        this.index = index;
        let { start, buffer } = this.buffer;
        this.type = type || buffer.set.types[buffer.buffer[index]];
        this.from = start + buffer.buffer[index + 1];
        this.to = start + buffer.buffer[index + 2];
        return true;
    }
    yield(node) {
        if (!node)
            return false;
        if (node instanceof TreeNode) {
            this.buffer = null;
            return this.yieldNode(node);
        }
        this.buffer = node.context;
        return this.yieldBuf(node.index, node.type);
    }
    /// @internal
    toString() {
        return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
    }
    /// @internal
    enterChild(dir, pos, side) {
        if (!this.buffer)
            return this.yield(this._tree.nextChild(dir < 0 ? this._tree.node.children.length - 1 : 0, dir, pos, side, this.mode));
        let { buffer } = this.buffer;
        let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.buffer.start, side);
        if (index < 0)
            return false;
        this.stack.push(this.index);
        return this.yieldBuf(index);
    }
    /// Move the cursor to this node's first child. When this returns
    /// false, the node has no child, and the cursor has not been moved.
    firstChild() { return this.enterChild(1, 0, 4 /* DontCare */); }
    /// Move the cursor to this node's last child.
    lastChild() { return this.enterChild(-1, 0, 4 /* DontCare */); }
    /// Move the cursor to the first child that ends after `pos`.
    childAfter(pos) { return this.enterChild(1, pos, 2 /* After */); }
    /// Move to the last child that starts before `pos`.
    childBefore(pos) { return this.enterChild(-1, pos, -2 /* Before */); }
    /// Move the cursor to the child around `pos`. If side is -1 the
    /// child may end at that position, when 1 it may start there. This
    /// will also enter [overlaid](#common.MountedTree.overlay)
    /// [mounted](#common.NodeProp^mounted) trees unless `overlays` is
    /// set to false.
    enter(pos, side, overlays = true, buffers = true) {
        if (!this.buffer)
            return this.yield(this._tree.enter(pos, side, overlays && !(this.mode & 1 /* Full */), buffers));
        return buffers ? this.enterChild(1, pos, side) : false;
    }
    /// Move to the node's parent node, if this isn't the top node.
    parent() {
        if (!this.buffer)
            return this.yieldNode((this.mode & 1 /* Full */) ? this._tree._parent : this._tree.parent);
        if (this.stack.length)
            return this.yieldBuf(this.stack.pop());
        let parent = (this.mode & 1 /* Full */) ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
        this.buffer = null;
        return this.yieldNode(parent);
    }
    /// @internal
    sibling(dir) {
        if (!this.buffer)
            return !this._tree._parent ? false
                : this.yield(this._tree.index < 0 ? null
                    : this._tree._parent.nextChild(this._tree.index + dir, dir, 0, 4 /* DontCare */, this.mode));
        let { buffer } = this.buffer, d = this.stack.length - 1;
        if (dir < 0) {
            let parentStart = d < 0 ? 0 : this.stack[d] + 4;
            if (this.index != parentStart)
                return this.yieldBuf(buffer.findChild(parentStart, this.index, -1, 0, 4 /* DontCare */));
        }
        else {
            let after = buffer.buffer[this.index + 3];
            if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
                return this.yieldBuf(after);
        }
        return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, 0, 4 /* DontCare */, this.mode)) : false;
    }
    /// Move to this node's next sibling, if any.
    nextSibling() { return this.sibling(1); }
    /// Move to this node's previous sibling, if any.
    prevSibling() { return this.sibling(-1); }
    atLastNode(dir) {
        let index, parent, { buffer } = this;
        if (buffer) {
            if (dir > 0) {
                if (this.index < buffer.buffer.buffer.length)
                    return false;
            }
            else {
                for (let i = 0; i < this.index; i++)
                    if (buffer.buffer.buffer[i + 3] < this.index)
                        return false;
            }
            ({ index, parent } = buffer);
        }
        else {
            ({ index, _parent: parent } = this._tree);
        }
        for (; parent; { index, _parent: parent } = parent) {
            if (index > -1)
                for (let i = index + dir, e = dir < 0 ? -1 : parent.node.children.length; i != e; i += dir) {
                    let child = parent.node.children[i];
                    if ((this.mode & 1 /* Full */) || child instanceof TreeBuffer || !child.type.isAnonymous || hasChild(child))
                        return false;
                }
        }
        return true;
    }
    move(dir, enter) {
        if (enter && this.enterChild(dir, 0, 4 /* DontCare */))
            return true;
        for (;;) {
            if (this.sibling(dir))
                return true;
            if (this.atLastNode(dir) || !this.parent())
                return false;
        }
    }
    /// Move to the next node in a
    /// [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order_(NLR))
    /// traversal, going from a node to its first child or, if the
    /// current node is empty or `enter` is false, its next sibling or
    /// the next sibling of the first parent node that has one.
    next(enter = true) { return this.move(1, enter); }
    /// Move to the next node in a last-to-first pre-order traveral. A
    /// node is followed by its last child or, if it has none, its
    /// previous sibling or the previous sibling of the first parent
    /// node that has one.
    prev(enter = true) { return this.move(-1, enter); }
    /// Move the cursor to the innermost node that covers `pos`. If
    /// `side` is -1, it will enter nodes that end at `pos`. If it is 1,
    /// it will enter nodes that start at `pos`.
    moveTo(pos, side = 0) {
        // Move up to a node that actually holds the position, if possible
        while (this.from == this.to ||
            (side < 1 ? this.from >= pos : this.from > pos) ||
            (side > -1 ? this.to <= pos : this.to < pos))
            if (!this.parent())
                break;
        // Then scan down into child nodes as far as possible
        while (this.enterChild(1, pos, side)) { }
        return this;
    }
    /// Get a [syntax node](#common.SyntaxNode) at the cursor's current
    /// position.
    get node() {
        if (!this.buffer)
            return this._tree;
        let cache = this.bufferNode, result = null, depth = 0;
        if (cache && cache.context == this.buffer) {
            scan: for (let index = this.index, d = this.stack.length; d >= 0;) {
                for (let c = cache; c; c = c._parent)
                    if (c.index == index) {
                        if (index == this.index)
                            return c;
                        result = c;
                        depth = d + 1;
                        break scan;
                    }
                index = this.stack[--d];
            }
        }
        for (let i = depth; i < this.stack.length; i++)
            result = new BufferNode(this.buffer, result, this.stack[i]);
        return this.bufferNode = new BufferNode(this.buffer, result, this.index);
    }
    /// Get the [tree](#common.Tree) that represents the current node, if
    /// any. Will return null when the node is in a [tree
    /// buffer](#common.TreeBuffer).
    get tree() {
        return this.buffer ? null : this._tree.node;
    }
}
function hasChild(tree) {
    return tree.children.some(ch => ch instanceof TreeBuffer || !ch.type.isAnonymous || hasChild(ch));
}
function buildTree(data) {
    var _a;
    let { buffer, nodeSet, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length } = data;
    let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
    let types = nodeSet.types;
    let contextHash = 0, lookAhead = 0;
    function takeNode(parentStart, minPos, children, positions, inRepeat) {
        let { id, start, end, size } = cursor;
        let lookAheadAtStart = lookAhead;
        while (size < 0) {
            cursor.next();
            if (size == -1 /* Reuse */) {
                let node = reused[id];
                children.push(node);
                positions.push(start - parentStart);
                return;
            }
            else if (size == -3 /* ContextChange */) { // Context change
                contextHash = id;
                return;
            }
            else if (size == -4 /* LookAhead */) {
                lookAhead = id;
                return;
            }
            else {
                throw new RangeError(`Unrecognized record size: ${size}`);
            }
        }
        let type = types[id], node, buffer;
        let startPos = start - parentStart;
        if (end - start <= maxBufferLength && (buffer = findBufferSize(cursor.pos - minPos, inRepeat))) {
            // Small enough for a buffer, and no reused nodes inside
            let data = new Uint16Array(buffer.size - buffer.skip);
            let endPos = cursor.pos - buffer.size, index = data.length;
            while (cursor.pos > endPos)
                index = copyToBuffer(buffer.start, data, index);
            node = new TreeBuffer(data, end - buffer.start, nodeSet);
            startPos = buffer.start - parentStart;
        }
        else { // Make it a node
            let endPos = cursor.pos - size;
            cursor.next();
            let localChildren = [], localPositions = [];
            let localInRepeat = id >= minRepeatType ? id : -1;
            let lastGroup = 0, lastEnd = end;
            while (cursor.pos > endPos) {
                if (localInRepeat >= 0 && cursor.id == localInRepeat && cursor.size >= 0) {
                    if (cursor.end <= lastEnd - maxBufferLength) {
                        makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, lookAheadAtStart);
                        lastGroup = localChildren.length;
                        lastEnd = cursor.end;
                    }
                    cursor.next();
                }
                else {
                    takeNode(start, endPos, localChildren, localPositions, localInRepeat);
                }
            }
            if (localInRepeat >= 0 && lastGroup > 0 && lastGroup < localChildren.length)
                makeRepeatLeaf(localChildren, localPositions, start, lastGroup, start, lastEnd, localInRepeat, lookAheadAtStart);
            localChildren.reverse();
            localPositions.reverse();
            if (localInRepeat > -1 && lastGroup > 0) {
                let make = makeBalanced(type);
                node = balanceRange(type, localChildren, localPositions, 0, localChildren.length, 0, end - start, make, make);
            }
            else {
                node = makeTree(type, localChildren, localPositions, end - start, lookAheadAtStart - end);
            }
        }
        children.push(node);
        positions.push(startPos);
    }
    function makeBalanced(type) {
        return (children, positions, length) => {
            let lookAhead = 0, lastI = children.length - 1, last, lookAheadProp;
            if (lastI >= 0 && (last = children[lastI]) instanceof Tree) {
                if (!lastI && last.type == type && last.length == length)
                    return last;
                if (lookAheadProp = last.prop(NodeProp.lookAhead))
                    lookAhead = positions[lastI] + last.length + lookAheadProp;
            }
            return makeTree(type, children, positions, length, lookAhead);
        };
    }
    function makeRepeatLeaf(children, positions, base, i, from, to, type, lookAhead) {
        let localChildren = [], localPositions = [];
        while (children.length > i) {
            localChildren.push(children.pop());
            localPositions.push(positions.pop() + base - from);
        }
        children.push(makeTree(nodeSet.types[type], localChildren, localPositions, to - from, lookAhead - to));
        positions.push(from - base);
    }
    function makeTree(type, children, positions, length, lookAhead = 0, props) {
        if (contextHash) {
            let pair = [NodeProp.contextHash, contextHash];
            props = props ? [pair].concat(props) : [pair];
        }
        if (lookAhead > 25) {
            let pair = [NodeProp.lookAhead, lookAhead];
            props = props ? [pair].concat(props) : [pair];
        }
        return new Tree(type, children, positions, length, props);
    }
    function findBufferSize(maxSize, inRepeat) {
        // Scan through the buffer to find previous siblings that fit
        // together in a TreeBuffer, and don't contain any reused nodes
        // (which can't be stored in a buffer).
        // If `inRepeat` is > -1, ignore node boundaries of that type for
        // nesting, but make sure the end falls either at the start
        // (`maxSize`) or before such a node.
        let fork = cursor.fork();
        let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
        let result = { size: 0, start: 0, skip: 0 };
        scan: for (let minPos = fork.pos - maxSize; fork.pos > minPos;) {
            let nodeSize = fork.size;
            // Pretend nested repeat nodes of the same type don't exist
            if (fork.id == inRepeat && nodeSize >= 0) {
                // Except that we store the current state as a valid return
                // value.
                result.size = size;
                result.start = start;
                result.skip = skip;
                skip += 4;
                size += 4;
                fork.next();
                continue;
            }
            let startPos = fork.pos - nodeSize;
            if (nodeSize < 0 || startPos < minPos || fork.start < minStart)
                break;
            let localSkipped = fork.id >= minRepeatType ? 4 : 0;
            let nodeStart = fork.start;
            fork.next();
            while (fork.pos > startPos) {
                if (fork.size < 0) {
                    if (fork.size == -3 /* ContextChange */)
                        localSkipped += 4;
                    else
                        break scan;
                }
                else if (fork.id >= minRepeatType) {
                    localSkipped += 4;
                }
                fork.next();
            }
            start = nodeStart;
            size += nodeSize;
            skip += localSkipped;
        }
        if (inRepeat < 0 || size == maxSize) {
            result.size = size;
            result.start = start;
            result.skip = skip;
        }
        return result.size > 4 ? result : undefined;
    }
    function copyToBuffer(bufferStart, buffer, index) {
        let { id, start, end, size } = cursor;
        cursor.next();
        if (size >= 0 && id < minRepeatType) {
            let startIndex = index;
            if (size > 4) {
                let endPos = cursor.pos - (size - 4);
                while (cursor.pos > endPos)
                    index = copyToBuffer(bufferStart, buffer, index);
            }
            buffer[--index] = startIndex;
            buffer[--index] = end - bufferStart;
            buffer[--index] = start - bufferStart;
            buffer[--index] = id;
        }
        else if (size == -3 /* ContextChange */) {
            contextHash = id;
        }
        else if (size == -4 /* LookAhead */) {
            lookAhead = id;
        }
        return index;
    }
    let children = [], positions = [];
    while (cursor.pos > 0)
        takeNode(data.start || 0, data.bufferStart || 0, children, positions, -1);
    let length = (_a = data.length) !== null && _a !== void 0 ? _a : (children.length ? positions[0] + children[0].length : 0);
    return new Tree(types[data.topID], children.reverse(), positions.reverse(), length);
}
const nodeSizeCache = new WeakMap;
function nodeSize(balanceType, node) {
    if (!balanceType.isAnonymous || node instanceof TreeBuffer || node.type != balanceType)
        return 1;
    let size = nodeSizeCache.get(node);
    if (size == null) {
        size = 1;
        for (let child of node.children) {
            if (child.type != balanceType || !(child instanceof Tree)) {
                size = 1;
                break;
            }
            size += nodeSize(balanceType, child);
        }
        nodeSizeCache.set(node, size);
    }
    return size;
}
function balanceRange(
// The type the balanced tree's inner nodes.
balanceType, 
// The direct children and their positions
children, positions, 
// The index range in children/positions to use
from, to, 
// The start position of the nodes, relative to their parent.
start, 
// Length of the outer node
length, 
// Function to build the top node of the balanced tree
mkTop, 
// Function to build internal nodes for the balanced tree
mkTree) {
    let total = 0;
    for (let i = from; i < to; i++)
        total += nodeSize(balanceType, children[i]);
    let maxChild = Math.ceil((total * 1.5) / 8 /* BranchFactor */);
    let localChildren = [], localPositions = [];
    function divide(children, positions, from, to, offset) {
        for (let i = from; i < to;) {
            let groupFrom = i, groupStart = positions[i], groupSize = nodeSize(balanceType, children[i]);
            i++;
            for (; i < to; i++) {
                let nextSize = nodeSize(balanceType, children[i]);
                if (groupSize + nextSize >= maxChild)
                    break;
                groupSize += nextSize;
            }
            if (i == groupFrom + 1) {
                if (groupSize > maxChild) {
                    let only = children[groupFrom]; // Only trees can have a size > 1
                    divide(only.children, only.positions, 0, only.children.length, positions[groupFrom] + offset);
                    continue;
                }
                localChildren.push(children[groupFrom]);
            }
            else {
                let length = positions[i - 1] + children[i - 1].length - groupStart;
                localChildren.push(balanceRange(balanceType, children, positions, groupFrom, i, groupStart, length, null, mkTree));
            }
            localPositions.push(groupStart + offset - start);
        }
    }
    divide(children, positions, from, to, 0);
    return (mkTop || mkTree)(localChildren, localPositions, length);
}

/// Tree fragments are used during [incremental
/// parsing](#common.Parser.startParse) to track parts of old trees
/// that can be reused in a new parse. An array of fragments is used
/// to track regions of an old tree whose nodes might be reused in new
/// parses. Use the static
/// [`applyChanges`](#common.TreeFragment^applyChanges) method to
/// update fragments for document changes.
class TreeFragment {
    /// Construct a tree fragment.
    constructor(
    /// The start of the unchanged range pointed to by this fragment.
    /// This refers to an offset in the _updated_ document (as opposed
    /// to the original tree).
    from, 
    /// The end of the unchanged range.
    to, 
    /// The tree that this fragment is based on.
    tree, 
    /// The offset between the fragment's tree and the document that
    /// this fragment can be used against. Add this when going from
    /// document to tree positions, subtract it to go from tree to
    /// document positions.
    offset, openStart = false, openEnd = false) {
        this.from = from;
        this.to = to;
        this.tree = tree;
        this.offset = offset;
        this.open = (openStart ? 1 /* Start */ : 0) | (openEnd ? 2 /* End */ : 0);
    }
    /// Whether the start of the fragment represents the start of a
    /// parse, or the end of a change. (In the second case, it may not
    /// be safe to reuse some nodes at the start, depending on the
    /// parsing algorithm.)
    get openStart() { return (this.open & 1 /* Start */) > 0; }
    /// Whether the end of the fragment represents the end of a
    /// full-document parse, or the start of a change.
    get openEnd() { return (this.open & 2 /* End */) > 0; }
    /// Create a set of fragments from a freshly parsed tree, or update
    /// an existing set of fragments by replacing the ones that overlap
    /// with a tree with content from the new tree. When `partial` is
    /// true, the parse is treated as incomplete, and the resulting
    /// fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
    /// true.
    static addTree(tree, fragments = [], partial = false) {
        let result = [new TreeFragment(0, tree.length, tree, 0, false, partial)];
        for (let f of fragments)
            if (f.to > tree.length)
                result.push(f);
        return result;
    }
    /// Apply a set of edits to an array of fragments, removing or
    /// splitting fragments as necessary to remove edited ranges, and
    /// adjusting offsets for fragments that moved.
    static applyChanges(fragments, changes, minGap = 128) {
        if (!changes.length)
            return fragments;
        let result = [];
        let fI = 1, nextF = fragments.length ? fragments[0] : null;
        for (let cI = 0, pos = 0, off = 0;; cI++) {
            let nextC = cI < changes.length ? changes[cI] : null;
            let nextPos = nextC ? nextC.fromA : 1e9;
            if (nextPos - pos >= minGap)
                while (nextF && nextF.from < nextPos) {
                    let cut = nextF;
                    if (pos >= cut.from || nextPos <= cut.to || off) {
                        let fFrom = Math.max(cut.from, pos) - off, fTo = Math.min(cut.to, nextPos) - off;
                        cut = fFrom >= fTo ? null : new TreeFragment(fFrom, fTo, cut.tree, cut.offset + off, cI > 0, !!nextC);
                    }
                    if (cut)
                        result.push(cut);
                    if (nextF.to > nextPos)
                        break;
                    nextF = fI < fragments.length ? fragments[fI++] : null;
                }
            if (!nextC)
                break;
            pos = nextC.toA;
            off = nextC.toA - nextC.toB;
        }
        return result;
    }
}
/// A superclass that parsers should extend.
class Parser {
    /// Start a parse, returning a [partial parse](#common.PartialParse)
    /// object. [`fragments`](#common.TreeFragment) can be passed in to
    /// make the parse incremental.
    ///
    /// By default, the entire input is parsed. You can pass `ranges`,
    /// which should be a sorted array of non-empty, non-overlapping
    /// ranges, to parse only those ranges. The tree returned in that
    /// case will start at `ranges[0].from`.
    startParse(input, fragments, ranges) {
        if (typeof input == "string")
            input = new StringInput(input);
        ranges = !ranges ? [new Range(0, input.length)] : ranges.length ? ranges.map(r => new Range(r.from, r.to)) : [new Range(0, 0)];
        return this.createParse(input, fragments || [], ranges);
    }
    /// Run a full parse, returning the resulting tree.
    parse(input, fragments, ranges) {
        let parse = this.startParse(input, fragments, ranges);
        for (;;) {
            let done = parse.advance();
            if (done)
                return done;
        }
    }
}
class StringInput {
    constructor(string) {
        this.string = string;
    }
    get length() { return this.string.length; }
    chunk(from) { return this.string.slice(from); }
    get lineChunks() { return false; }
    read(from, to) { return this.string.slice(from, to); }
}
new NodeProp({ perNode: true });

/**
Node prop stored in a grammar's top syntax node to provide the
facet that stores language data for that language.
*/
const languageDataProp = /*@__PURE__*/new NodeProp();
/**
Helper function to define a facet (to be added to the top syntax
node(s) for a language via
[`languageDataProp`](https://codemirror.net/6/docs/ref/#language.languageDataProp)), that will be
used to associate language data with the language. You
probably only need this when subclassing
[`Language`](https://codemirror.net/6/docs/ref/#language.Language).
*/
function defineLanguageFacet(baseData) {
    return Facet.define({
        combine: baseData ? values => values.concat(baseData) : undefined
    });
}
/**
A language object manages parsing and per-language
[metadata](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt). Parse data is
managed as a [Lezer](https://lezer.codemirror.net) tree. You'll
want to subclass this class for custom parsers, or use the
[`LRLanguage`](https://codemirror.net/6/docs/ref/#language.LRLanguage) or
[`StreamLanguage`](https://codemirror.net/6/docs/ref/#stream-parser.StreamLanguage) abstractions for
[Lezer](https://lezer.codemirror.net/) or stream parsers.
*/
class Language {
    /**
    Construct a language object. You usually don't need to invoke
    this directly. But when you do, make sure you use
    [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet) to create
    the first argument.
    */
    constructor(
    /**
    The [language data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) data
    facet used for this language.
    */
    data, parser, 
    /**
    The node type of the top node of trees produced by this parser.
    */
    topNode, extraExtensions = []) {
        this.data = data;
        this.topNode = topNode;
        // Kludge to define EditorState.tree as a debugging helper,
        // without the EditorState package actually knowing about
        // languages and lezer trees.
        if (!EditorState.prototype.hasOwnProperty("tree"))
            Object.defineProperty(EditorState.prototype, "tree", { get() { return syntaxTree(this); } });
        this.parser = parser;
        this.extension = [
            language.of(this),
            EditorState.languageData.of((state, pos, side) => state.facet(languageDataFacetAt(state, pos, side)))
        ].concat(extraExtensions);
    }
    /**
    Query whether this language is active at the given position.
    */
    isActiveAt(state, pos, side = -1) {
        return languageDataFacetAt(state, pos, side) == this.data;
    }
    /**
    Find the document regions that were parsed using this language.
    The returned regions will _include_ any nested languages rooted
    in this language, when those exist.
    */
    findRegions(state) {
        let lang = state.facet(language);
        if ((lang === null || lang === void 0 ? void 0 : lang.data) == this.data)
            return [{ from: 0, to: state.doc.length }];
        if (!lang || !lang.allowsNesting)
            return [];
        let result = [];
        let explore = (tree, from) => {
            if (tree.prop(languageDataProp) == this.data) {
                result.push({ from, to: from + tree.length });
                return;
            }
            let mount = tree.prop(NodeProp.mounted);
            if (mount) {
                if (mount.tree.prop(languageDataProp) == this.data) {
                    if (mount.overlay)
                        for (let r of mount.overlay)
                            result.push({ from: r.from + from, to: r.to + from });
                    else
                        result.push({ from: from, to: from + tree.length });
                    return;
                }
                else if (mount.overlay) {
                    let size = result.length;
                    explore(mount.tree, mount.overlay[0].from + from);
                    if (result.length > size)
                        return;
                }
            }
            for (let i = 0; i < tree.children.length; i++) {
                let ch = tree.children[i];
                if (ch instanceof Tree)
                    explore(ch, tree.positions[i] + from);
            }
        };
        explore(syntaxTree(state), 0);
        return result;
    }
    /**
    Indicates whether this language allows nested languages. The
    default implementation returns true.
    */
    get allowsNesting() { return true; }
}
/**
@internal
*/
Language.setState = /*@__PURE__*/StateEffect.define();
function languageDataFacetAt(state, pos, side) {
    let topLang = state.facet(language);
    if (!topLang)
        return null;
    let facet = topLang.data;
    if (topLang.allowsNesting) {
        for (let node = syntaxTree(state).topNode; node; node = node.enter(pos, side, true, false))
            facet = node.type.prop(languageDataProp) || facet;
    }
    return facet;
}
/**
A subclass of [`Language`](https://codemirror.net/6/docs/ref/#language.Language) for use with Lezer
[LR parsers](https://lezer.codemirror.net/docs/ref#lr.LRParser)
parsers.
*/
class LRLanguage extends Language {
    constructor(data, parser) {
        super(data, parser, parser.topNode);
        this.parser = parser;
    }
    /**
    Define a language from a parser.
    */
    static define(spec) {
        let data = defineLanguageFacet(spec.languageData);
        return new LRLanguage(data, spec.parser.configure({
            props: [languageDataProp.add(type => type.isTop ? data : undefined)]
        }));
    }
    /**
    Create a new instance of this language with a reconfigured
    version of its parser.
    */
    configure(options) {
        return new LRLanguage(this.data, this.parser.configure(options));
    }
    get allowsNesting() { return this.parser.wrappers.length > 0; } // FIXME
}
/**
Get the syntax tree for a state, which is the current (possibly
incomplete) parse tree of active [language](https://codemirror.net/6/docs/ref/#language.Language),
or the empty tree if there is no language available.
*/
function syntaxTree(state) {
    let field = state.field(Language.state, false);
    return field ? field.tree : Tree.empty;
}
// Lezer-style Input object for a Text document.
class DocInput {
    constructor(doc, length = doc.length) {
        this.doc = doc;
        this.length = length;
        this.cursorPos = 0;
        this.string = "";
        this.cursor = doc.iter();
    }
    syncTo(pos) {
        this.string = this.cursor.next(pos - this.cursorPos).value;
        this.cursorPos = pos + this.string.length;
        return this.cursorPos - this.string.length;
    }
    chunk(pos) {
        this.syncTo(pos);
        return this.string;
    }
    get lineChunks() { return true; }
    read(from, to) {
        let stringStart = this.cursorPos - this.string.length;
        if (from < stringStart || to >= this.cursorPos)
            return this.doc.sliceString(from, to);
        else
            return this.string.slice(from - stringStart, to - stringStart);
    }
}
let currentContext = null;
/**
A parse context provided to parsers working on the editor content.
*/
class ParseContext {
    /**
    @internal
    */
    constructor(parser, 
    /**
    The current editor state.
    */
    state, 
    /**
    Tree fragments that can be reused by incremental re-parses.
    */
    fragments = [], 
    /**
    @internal
    */
    tree, treeLen, 
    /**
    The current editor viewport (or some overapproximation
    thereof). Intended to be used for opportunistically avoiding
    work (in which case
    [`skipUntilInView`](https://codemirror.net/6/docs/ref/#language.ParseContext.skipUntilInView)
    should be called to make sure the parser is restarted when the
    skipped region becomes visible).
    */
    viewport, 
    /**
    @internal
    */
    skipped, 
    /**
    This is where skipping parsers can register a promise that,
    when resolved, will schedule a new parse. It is cleared when
    the parse worker picks up the promise. @internal
    */
    scheduleOn) {
        this.parser = parser;
        this.state = state;
        this.fragments = fragments;
        this.tree = tree;
        this.treeLen = treeLen;
        this.viewport = viewport;
        this.skipped = skipped;
        this.scheduleOn = scheduleOn;
        this.parse = null;
        /**
        @internal
        */
        this.tempSkipped = [];
    }
    startParse() {
        return this.parser.startParse(new DocInput(this.state.doc), this.fragments);
    }
    /**
    @internal
    */
    work(time, upto) {
        if (upto != null && upto >= this.state.doc.length)
            upto = undefined;
        if (this.tree != Tree.empty && this.isDone(upto !== null && upto !== void 0 ? upto : this.state.doc.length)) {
            this.takeTree();
            return true;
        }
        return this.withContext(() => {
            var _a;
            if (!this.parse)
                this.parse = this.startParse();
            if (upto != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > upto) &&
                upto < this.state.doc.length)
                this.parse.stopAt(upto);
            let endTime = Date.now() + time;
            for (;;) {
                let done = this.parse.advance();
                if (done) {
                    this.fragments = this.withoutTempSkipped(TreeFragment.addTree(done, this.fragments, this.parse.stoppedAt != null));
                    this.treeLen = (_a = this.parse.stoppedAt) !== null && _a !== void 0 ? _a : this.state.doc.length;
                    this.tree = done;
                    this.parse = null;
                    if (this.treeLen < (upto !== null && upto !== void 0 ? upto : this.state.doc.length))
                        this.parse = this.startParse();
                    else
                        return true;
                }
                if (Date.now() > endTime)
                    return false;
            }
        });
    }
    /**
    @internal
    */
    takeTree() {
        let pos, tree;
        if (this.parse && (pos = this.parse.parsedPos) > this.treeLen) {
            if (this.parse.stoppedAt == null || this.parse.stoppedAt > pos)
                this.parse.stopAt(pos);
            this.withContext(() => { while (!(tree = this.parse.advance())) { } });
            this.tree = tree;
            this.fragments = this.withoutTempSkipped(TreeFragment.addTree(this.tree, this.fragments, true));
            this.parse = null;
        }
    }
    withContext(f) {
        let prev = currentContext;
        currentContext = this;
        try {
            return f();
        }
        finally {
            currentContext = prev;
        }
    }
    withoutTempSkipped(fragments) {
        for (let r; r = this.tempSkipped.pop();)
            fragments = cutFragments(fragments, r.from, r.to);
        return fragments;
    }
    /**
    @internal
    */
    changes(changes, newState) {
        let { fragments, tree, treeLen, viewport, skipped } = this;
        this.takeTree();
        if (!changes.empty) {
            let ranges = [];
            changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
            fragments = TreeFragment.applyChanges(fragments, ranges);
            tree = Tree.empty;
            treeLen = 0;
            viewport = { from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1) };
            if (this.skipped.length) {
                skipped = [];
                for (let r of this.skipped) {
                    let from = changes.mapPos(r.from, 1), to = changes.mapPos(r.to, -1);
                    if (from < to)
                        skipped.push({ from, to });
                }
            }
        }
        return new ParseContext(this.parser, newState, fragments, tree, treeLen, viewport, skipped, this.scheduleOn);
    }
    /**
    @internal
    */
    updateViewport(viewport) {
        if (this.viewport.from == viewport.from && this.viewport.to == viewport.to)
            return false;
        this.viewport = viewport;
        let startLen = this.skipped.length;
        for (let i = 0; i < this.skipped.length; i++) {
            let { from, to } = this.skipped[i];
            if (from < viewport.to && to > viewport.from) {
                this.fragments = cutFragments(this.fragments, from, to);
                this.skipped.splice(i--, 1);
            }
        }
        if (this.skipped.length >= startLen)
            return false;
        this.reset();
        return true;
    }
    /**
    @internal
    */
    reset() {
        if (this.parse) {
            this.takeTree();
            this.parse = null;
        }
    }
    /**
    Notify the parse scheduler that the given region was skipped
    because it wasn't in view, and the parse should be restarted
    when it comes into view.
    */
    skipUntilInView(from, to) {
        this.skipped.push({ from, to });
    }
    /**
    Returns a parser intended to be used as placeholder when
    asynchronously loading a nested parser. It'll skip its input and
    mark it as not-really-parsed, so that the next update will parse
    it again.
    
    When `until` is given, a reparse will be scheduled when that
    promise resolves.
    */
    static getSkippingParser(until) {
        return new class extends Parser {
            createParse(input, fragments, ranges) {
                let from = ranges[0].from, to = ranges[ranges.length - 1].to;
                let parser = {
                    parsedPos: from,
                    advance() {
                        let cx = currentContext;
                        if (cx) {
                            for (let r of ranges)
                                cx.tempSkipped.push(r);
                            if (until)
                                cx.scheduleOn = cx.scheduleOn ? Promise.all([cx.scheduleOn, until]) : until;
                        }
                        this.parsedPos = to;
                        return new Tree(NodeType.none, [], [], to - from);
                    },
                    stoppedAt: null,
                    stopAt() { }
                };
                return parser;
            }
        };
    }
    /**
    @internal
    */
    movedPast(pos) {
        return this.treeLen < pos && this.parse && this.parse.parsedPos >= pos;
    }
    /**
    @internal
    */
    isDone(upto) {
        let frags = this.fragments;
        return this.treeLen >= upto && frags.length && frags[0].from == 0 && frags[0].to >= upto;
    }
    /**
    Get the context for the current parse, or `null` if no editor
    parse is in progress.
    */
    static get() { return currentContext; }
}
function cutFragments(fragments, from, to) {
    return TreeFragment.applyChanges(fragments, [{ fromA: from, toA: to, fromB: from, toB: to }]);
}
class LanguageState {
    constructor(
    // A mutable parse state that is used to preserve work done during
    // the lifetime of a state when moving to the next state.
    context) {
        this.context = context;
        this.tree = context.tree;
    }
    apply(tr) {
        if (!tr.docChanged)
            return this;
        let newCx = this.context.changes(tr.changes, tr.state);
        // If the previous parse wasn't done, go forward only up to its
        // end position or the end of the viewport, to avoid slowing down
        // state updates with parse work beyond the viewport.
        let upto = this.context.treeLen == tr.startState.doc.length ? undefined
            : Math.max(tr.changes.mapPos(this.context.treeLen), newCx.viewport.to);
        if (!newCx.work(25 /* Apply */, upto))
            newCx.takeTree();
        return new LanguageState(newCx);
    }
    static init(state) {
        let parseState = new ParseContext(state.facet(language).parser, state, [], Tree.empty, 0, { from: 0, to: state.doc.length }, [], null);
        if (!parseState.work(25 /* Apply */))
            parseState.takeTree();
        return new LanguageState(parseState);
    }
}
Language.state = /*@__PURE__*/StateField.define({
    create: LanguageState.init,
    update(value, tr) {
        for (let e of tr.effects)
            if (e.is(Language.setState))
                return e.value;
        if (tr.startState.facet(language) != tr.state.facet(language))
            return LanguageState.init(tr.state);
        return value.apply(tr);
    }
});
let requestIdle = typeof window != "undefined" && window.requestIdleCallback ||
    ((callback, { timeout }) => setTimeout(callback, timeout));
let cancelIdle = typeof window != "undefined" && window.cancelIdleCallback || clearTimeout;
const parseWorker = /*@__PURE__*/ViewPlugin.fromClass(class ParseWorker {
    constructor(view) {
        this.view = view;
        this.working = -1;
        this.workScheduled = 0;
        // End of the current time chunk
        this.chunkEnd = -1;
        // Milliseconds of budget left for this chunk
        this.chunkBudget = -1;
        this.work = this.work.bind(this);
        this.scheduleWork();
    }
    update(update) {
        let cx = this.view.state.field(Language.state).context;
        if (cx.updateViewport(update.view.viewport) || this.view.viewport.to > cx.treeLen)
            this.scheduleWork();
        if (update.docChanged) {
            if (this.view.hasFocus)
                this.chunkBudget += 50 /* ChangeBonus */;
            this.scheduleWork();
        }
        this.checkAsyncSchedule(cx);
    }
    scheduleWork() {
        if (this.working > -1)
            return;
        let { state } = this.view, field = state.field(Language.state);
        if (field.tree != field.context.tree || !field.context.isDone(state.doc.length))
            this.working = requestIdle(this.work, { timeout: 500 /* Pause */ });
    }
    work(deadline) {
        this.working = -1;
        let now = Date.now();
        if (this.chunkEnd < now && (this.chunkEnd < 0 || this.view.hasFocus)) { // Start a new chunk
            this.chunkEnd = now + 30000 /* ChunkTime */;
            this.chunkBudget = 3000 /* ChunkBudget */;
        }
        if (this.chunkBudget <= 0)
            return; // No more budget
        let { state, viewport: { to: vpTo } } = this.view, field = state.field(Language.state);
        if (field.tree == field.context.tree && field.context.treeLen >= vpTo + 1000000 /* MaxParseAhead */)
            return;
        let time = Math.min(this.chunkBudget, deadline ? Math.max(25 /* MinSlice */, deadline.timeRemaining()) : 100 /* Slice */);
        let done = field.context.work(time, vpTo + 1000000 /* MaxParseAhead */);
        this.chunkBudget -= Date.now() - now;
        if (done || this.chunkBudget <= 0 || field.context.movedPast(vpTo)) {
            field.context.takeTree();
            this.view.dispatch({ effects: Language.setState.of(new LanguageState(field.context)) });
        }
        if (!done && this.chunkBudget > 0)
            this.scheduleWork();
        this.checkAsyncSchedule(field.context);
    }
    checkAsyncSchedule(cx) {
        if (cx.scheduleOn) {
            this.workScheduled++;
            cx.scheduleOn
                .then(() => this.scheduleWork())
                .catch(err => logException(this.view.state, err))
                .then(() => this.workScheduled--);
            cx.scheduleOn = null;
        }
    }
    destroy() {
        if (this.working >= 0)
            cancelIdle(this.working);
    }
    isWorking() {
        return this.working >= 0 || this.workScheduled > 0;
    }
}, {
    eventHandlers: { focus() { this.scheduleWork(); } }
});
/**
The facet used to associate a language with an editor state.
*/
const language = /*@__PURE__*/Facet.define({
    combine(languages) { return languages.length ? languages[0] : null; },
    enables: [Language.state, parseWorker]
});
/**
This class bundles a [language object](https://codemirror.net/6/docs/ref/#language.Language) with an
optional set of supporting extensions. Language packages are
encouraged to export a function that optionally takes a
configuration object and returns a `LanguageSupport` instance, as
the main way for client code to use the package.
*/
class LanguageSupport {
    /**
    Create a support object.
    */
    constructor(
    /**
    The language object.
    */
    language, 
    /**
    An optional set of supporting extensions. When nesting a
    language in another language, the outer language is encouraged
    to include the supporting extensions for its inner languages
    in its own set of support extensions.
    */
    support = []) {
        this.language = language;
        this.support = support;
        this.extension = [language, support];
    }
}

/**
Facet that defines a way to provide a function that computes the
appropriate indentation depth at the start of a given line, or
`null` to indicate no appropriate indentation could be determined.
*/
const indentService = /*@__PURE__*/Facet.define();
/**
Facet for overriding the unit by which indentation happens.
Should be a string consisting either entirely of spaces or
entirely of tabs. When not set, this defaults to 2 spaces.
*/
const indentUnit = /*@__PURE__*/Facet.define({
    combine: values => {
        if (!values.length)
            return "  ";
        if (!/^(?: +|\t+)$/.test(values[0]))
            throw new Error("Invalid indent unit: " + JSON.stringify(values[0]));
        return values[0];
    }
});
/**
Return the _column width_ of an indent unit in the state.
Determined by the [`indentUnit`](https://codemirror.net/6/docs/ref/#language.indentUnit)
facet, and [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) when that
contains tabs.
*/
function getIndentUnit(state) {
    let unit = state.facet(indentUnit);
    return unit.charCodeAt(0) == 9 ? state.tabSize * unit.length : unit.length;
}
/**
Create an indentation string that covers columns 0 to `cols`.
Will use tabs for as much of the columns as possible when the
[`indentUnit`](https://codemirror.net/6/docs/ref/#language.indentUnit) facet contains
tabs.
*/
function indentString(state, cols) {
    let result = "", ts = state.tabSize;
    if (state.facet(indentUnit).charCodeAt(0) == 9)
        while (cols >= ts) {
            result += "\t";
            cols -= ts;
        }
    for (let i = 0; i < cols; i++)
        result += " ";
    return result;
}
/**
Get the indentation at the given position. Will first consult any
[indent services](https://codemirror.net/6/docs/ref/#language.indentService) that are registered,
and if none of those return an indentation, this will check the
syntax tree for the [indent node prop](https://codemirror.net/6/docs/ref/#language.indentNodeProp)
and use that if found. Returns a number when an indentation could
be determined, and null otherwise.
*/
function getIndentation(context, pos) {
    if (context instanceof EditorState)
        context = new IndentContext(context);
    for (let service of context.state.facet(indentService)) {
        let result = service(context, pos);
        if (result != null)
            return result;
    }
    let tree = syntaxTree(context.state);
    return tree ? syntaxIndentation(context, tree, pos) : null;
}
/**
Indentation contexts are used when calling [indentation
services](https://codemirror.net/6/docs/ref/#language.indentService). They provide helper utilities
useful in indentation logic, and can selectively override the
indentation reported for some lines.
*/
class IndentContext {
    /**
    Create an indent context.
    */
    constructor(
    /**
    The editor state.
    */
    state, 
    /**
    @internal
    */
    options = {}) {
        this.state = state;
        this.options = options;
        this.unit = getIndentUnit(state);
    }
    /**
    Get a description of the line at the given position, taking
    [simulated line
    breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
    into account. If there is such a break at `pos`, the `bias`
    argument determines whether the part of the line line before or
    after the break is used.
    */
    lineAt(pos, bias = 1) {
        let line = this.state.doc.lineAt(pos);
        let { simulateBreak } = this.options;
        if (simulateBreak != null && simulateBreak >= line.from && simulateBreak <= line.to) {
            if (bias < 0 ? simulateBreak < pos : simulateBreak <= pos)
                return { text: line.text.slice(simulateBreak - line.from), from: simulateBreak };
            else
                return { text: line.text.slice(0, simulateBreak - line.from), from: line.from };
        }
        return line;
    }
    /**
    Get the text directly after `pos`, either the entire line
    or the next 100 characters, whichever is shorter.
    */
    textAfterPos(pos, bias = 1) {
        if (this.options.simulateDoubleBreak && pos == this.options.simulateBreak)
            return "";
        let { text, from } = this.lineAt(pos, bias);
        return text.slice(pos - from, Math.min(text.length, pos + 100 - from));
    }
    /**
    Find the column for the given position.
    */
    column(pos, bias = 1) {
        let { text, from } = this.lineAt(pos, bias);
        let result = this.countColumn(text, pos - from);
        let override = this.options.overrideIndentation ? this.options.overrideIndentation(from) : -1;
        if (override > -1)
            result += override - this.countColumn(text, text.search(/\S|$/));
        return result;
    }
    /**
    Find the column position (taking tabs into account) of the given
    position in the given string.
    */
    countColumn(line, pos = line.length) {
        return countColumn(line, this.state.tabSize, pos);
    }
    /**
    Find the indentation column of the line at the given point.
    */
    lineIndent(pos, bias = 1) {
        let { text, from } = this.lineAt(pos, bias);
        let override = this.options.overrideIndentation;
        if (override) {
            let overriden = override(from);
            if (overriden > -1)
                return overriden;
        }
        return this.countColumn(text, text.search(/\S|$/));
    }
    /**
    Returns the [simulated line
    break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
    for this context, if any.
    */
    get simulatedBreak() {
        return this.options.simulateBreak || null;
    }
}
/**
A syntax tree node prop used to associate indentation strategies
with node types. Such a strategy is a function from an indentation
context to a column number or null, where null indicates that no
definitive indentation can be determined.
*/
const indentNodeProp = /*@__PURE__*/new NodeProp();
// Compute the indentation for a given position from the syntax tree.
function syntaxIndentation(cx, ast, pos) {
    return indentFrom(ast.resolveInner(pos).enterUnfinishedNodesBefore(pos), pos, cx);
}
function ignoreClosed(cx) {
    return cx.pos == cx.options.simulateBreak && cx.options.simulateDoubleBreak;
}
function indentStrategy(tree) {
    let strategy = tree.type.prop(indentNodeProp);
    if (strategy)
        return strategy;
    let first = tree.firstChild, close;
    if (first && (close = first.type.prop(NodeProp.closedBy))) {
        let last = tree.lastChild, closed = last && close.indexOf(last.name) > -1;
        return cx => delimitedStrategy(cx, true, 1, undefined, closed && !ignoreClosed(cx) ? last.from : undefined);
    }
    return tree.parent == null ? topIndent : null;
}
function indentFrom(node, pos, base) {
    for (; node; node = node.parent) {
        let strategy = indentStrategy(node);
        if (strategy)
            return strategy(new TreeIndentContext(base, pos, node));
    }
    return null;
}
function topIndent() { return 0; }
/**
Objects of this type provide context information and helper
methods to indentation functions.
*/
class TreeIndentContext extends IndentContext {
    /**
    @internal
    */
    constructor(base, 
    /**
    The position at which indentation is being computed.
    */
    pos, 
    /**
    The syntax tree node to which the indentation strategy
    applies.
    */
    node) {
        super(base.state, base.options);
        this.base = base;
        this.pos = pos;
        this.node = node;
    }
    /**
    Get the text directly after `this.pos`, either the entire line
    or the next 100 characters, whichever is shorter.
    */
    get textAfter() {
        return this.textAfterPos(this.pos);
    }
    /**
    Get the indentation at the reference line for `this.node`, which
    is the line on which it starts, unless there is a node that is
    _not_ a parent of this node covering the start of that line. If
    so, the line at the start of that node is tried, again skipping
    on if it is covered by another such node.
    */
    get baseIndent() {
        let line = this.state.doc.lineAt(this.node.from);
        // Skip line starts that are covered by a sibling (or cousin, etc)
        for (;;) {
            let atBreak = this.node.resolve(line.from);
            while (atBreak.parent && atBreak.parent.from == atBreak.from)
                atBreak = atBreak.parent;
            if (isParent(atBreak, this.node))
                break;
            line = this.state.doc.lineAt(atBreak.from);
        }
        return this.lineIndent(line.from);
    }
    /**
    Continue looking for indentations in the node's parent nodes,
    and return the result of that.
    */
    continue() {
        let parent = this.node.parent;
        return parent ? indentFrom(parent, this.pos, this.base) : 0;
    }
}
function isParent(parent, of) {
    for (let cur = of; cur; cur = cur.parent)
        if (parent == cur)
            return true;
    return false;
}
// Check whether a delimited node is aligned (meaning there are
// non-skipped nodes on the same line as the opening delimiter). And
// if so, return the opening token.
function bracketedAligned(context) {
    let tree = context.node;
    let openToken = tree.childAfter(tree.from), last = tree.lastChild;
    if (!openToken)
        return null;
    let sim = context.options.simulateBreak;
    let openLine = context.state.doc.lineAt(openToken.from);
    let lineEnd = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
    for (let pos = openToken.to;;) {
        let next = tree.childAfter(pos);
        if (!next || next == last)
            return null;
        if (!next.type.isSkipped)
            return next.from < lineEnd ? openToken : null;
        pos = next.to;
    }
}
/**
An indentation strategy for delimited (usually bracketed) nodes.
Will, by default, indent one unit more than the parent's base
indent unless the line starts with a closing token. When `align`
is true and there are non-skipped nodes on the node's opening
line, the content of the node will be aligned with the end of the
opening node, like this:

    foo(bar,
        baz)
*/
function delimitedIndent({ closing, align = true, units = 1 }) {
    return (context) => delimitedStrategy(context, align, units, closing);
}
function delimitedStrategy(context, align, units, closing, closedAt) {
    let after = context.textAfter, space = after.match(/^\s*/)[0].length;
    let closed = closing && after.slice(space, space + closing.length) == closing || closedAt == context.pos + space;
    let aligned = align ? bracketedAligned(context) : null;
    if (aligned)
        return closed ? context.column(aligned.from) : context.column(aligned.to);
    return context.baseIndent + (closed ? 0 : context.unit * units);
}
/**
An indentation strategy that aligns a node's content to its base
indentation.
*/
const flatIndent = (context) => context.baseIndent;
/**
Creates an indentation strategy that, by default, indents
continued lines one unit more than the node's base indentation.
You can provide `except` to prevent indentation of lines that
match a pattern (for example `/^else\b/` in `if`/`else`
constructs), and you can change the amount of units used with the
`units` option.
*/
function continuedIndent({ except, units = 1 } = {}) {
    return (context) => {
        let matchExcept = except && except.test(context.textAfter);
        return context.baseIndent + (matchExcept ? 0 : units * context.unit);
    };
}
/**
This node prop is used to associate folding information with
syntax node types. Given a syntax node, it should check whether
that tree is foldable and return the range that can be collapsed
when it is.
*/
const foldNodeProp = /*@__PURE__*/new NodeProp();
/**
[Fold](https://codemirror.net/6/docs/ref/#language.foldNodeProp) function that folds everything but
the first and the last child of a syntax node. Useful for nodes
that start and end with delimiters.
*/
function foldInside(node) {
    let first = node.firstChild, last = node.lastChild;
    return first && first.to < last.from ? { from: first.to, to: last.type.isError ? node.to : last.from } : null;
}

/// A parse stack. These are used internally by the parser to track
/// parsing progress. They also provide some properties and methods
/// that external code such as a tokenizer can use to get information
/// about the parse state.
class Stack {
    /// @internal
    constructor(
    /// The parse that this stack is part of @internal
    p, 
    /// Holds state, input pos, buffer index triplets for all but the
    /// top state @internal
    stack, 
    /// The current parse state @internal
    state, 
    // The position at which the next reduce should take place. This
    // can be less than `this.pos` when skipped expressions have been
    // added to the stack (which should be moved outside of the next
    // reduction)
    /// @internal
    reducePos, 
    /// The input position up to which this stack has parsed.
    pos, 
    /// The dynamic score of the stack, including dynamic precedence
    /// and error-recovery penalties
    /// @internal
    score, 
    // The output buffer. Holds (type, start, end, size) quads
    // representing nodes created by the parser, where `size` is
    // amount of buffer array entries covered by this node.
    /// @internal
    buffer, 
    // The base offset of the buffer. When stacks are split, the split
    // instance shared the buffer history with its parent up to
    // `bufferBase`, which is the absolute offset (including the
    // offset of previous splits) into the buffer at which this stack
    // starts writing.
    /// @internal
    bufferBase, 
    /// @internal
    curContext, 
    /// @internal
    lookAhead = 0, 
    // A parent stack from which this was split off, if any. This is
    // set up so that it always points to a stack that has some
    // additional buffer content, never to a stack with an equal
    // `bufferBase`.
    /// @internal
    parent) {
        this.p = p;
        this.stack = stack;
        this.state = state;
        this.reducePos = reducePos;
        this.pos = pos;
        this.score = score;
        this.buffer = buffer;
        this.bufferBase = bufferBase;
        this.curContext = curContext;
        this.lookAhead = lookAhead;
        this.parent = parent;
    }
    /// @internal
    toString() {
        return `[${this.stack.filter((_, i) => i % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
    }
    // Start an empty stack
    /// @internal
    static start(p, state, pos = 0) {
        let cx = p.parser.context;
        return new Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, 0, null);
    }
    /// The stack's current [context](#lr.ContextTracker) value, if
    /// any. Its type will depend on the context tracker's type
    /// parameter, or it will be `null` if there is no context
    /// tracker.
    get context() { return this.curContext ? this.curContext.context : null; }
    // Push a state onto the stack, tracking its start position as well
    // as the buffer base at that point.
    /// @internal
    pushState(state, start) {
        this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
        this.state = state;
    }
    // Apply a reduce action
    /// @internal
    reduce(action) {
        let depth = action >> 19 /* ReduceDepthShift */, type = action & 65535 /* ValueMask */;
        let { parser } = this.p;
        let dPrec = parser.dynamicPrecedence(type);
        if (dPrec)
            this.score += dPrec;
        if (depth == 0) {
            // Zero-depth reductions are a special case—they add stuff to
            // the stack without popping anything off.
            if (type < parser.minRepeatTerm)
                this.storeNode(type, this.reducePos, this.reducePos, 4, true);
            this.pushState(parser.getGoto(this.state, type, true), this.reducePos);
            this.reduceContext(type, this.reducePos);
            return;
        }
        // Find the base index into `this.stack`, content after which will
        // be dropped. Note that with `StayFlag` reductions we need to
        // consume two extra frames (the dummy parent node for the skipped
        // expression and the state that we'll be staying in, which should
        // be moved to `this.state`).
        let base = this.stack.length - ((depth - 1) * 3) - (action & 262144 /* StayFlag */ ? 6 : 0);
        let start = this.stack[base - 2];
        let bufferBase = this.stack[base - 1], count = this.bufferBase + this.buffer.length - bufferBase;
        // Store normal terms or `R -> R R` repeat reductions
        if (type < parser.minRepeatTerm || (action & 131072 /* RepeatFlag */)) {
            let pos = parser.stateFlag(this.state, 1 /* Skipped */) ? this.pos : this.reducePos;
            this.storeNode(type, start, pos, count + 4, true);
        }
        if (action & 262144 /* StayFlag */) {
            this.state = this.stack[base];
        }
        else {
            let baseStateID = this.stack[base - 3];
            this.state = parser.getGoto(baseStateID, type, true);
        }
        while (this.stack.length > base)
            this.stack.pop();
        this.reduceContext(type, start);
    }
    // Shift a value into the buffer
    /// @internal
    storeNode(term, start, end, size = 4, isReduce = false) {
        if (term == 0 /* Err */) { // Try to omit/merge adjacent error nodes
            let cur = this, top = this.buffer.length;
            if (top == 0 && cur.parent) {
                top = cur.bufferBase - cur.parent.bufferBase;
                cur = cur.parent;
            }
            if (top > 0 && cur.buffer[top - 4] == 0 /* Err */ && cur.buffer[top - 1] > -1) {
                if (start == end)
                    return;
                if (cur.buffer[top - 2] >= start) {
                    cur.buffer[top - 2] = end;
                    return;
                }
            }
        }
        if (!isReduce || this.pos == end) { // Simple case, just append
            this.buffer.push(term, start, end, size);
        }
        else { // There may be skipped nodes that have to be moved forward
            let index = this.buffer.length;
            if (index > 0 && this.buffer[index - 4] != 0 /* Err */)
                while (index > 0 && this.buffer[index - 2] > end) {
                    // Move this record forward
                    this.buffer[index] = this.buffer[index - 4];
                    this.buffer[index + 1] = this.buffer[index - 3];
                    this.buffer[index + 2] = this.buffer[index - 2];
                    this.buffer[index + 3] = this.buffer[index - 1];
                    index -= 4;
                    if (size > 4)
                        size -= 4;
                }
            this.buffer[index] = term;
            this.buffer[index + 1] = start;
            this.buffer[index + 2] = end;
            this.buffer[index + 3] = size;
        }
    }
    // Apply a shift action
    /// @internal
    shift(action, next, nextEnd) {
        let start = this.pos;
        if (action & 131072 /* GotoFlag */) {
            this.pushState(action & 65535 /* ValueMask */, this.pos);
        }
        else if ((action & 262144 /* StayFlag */) == 0) { // Regular shift
            let nextState = action, { parser } = this.p;
            if (nextEnd > this.pos || next <= parser.maxNode) {
                this.pos = nextEnd;
                if (!parser.stateFlag(nextState, 1 /* Skipped */))
                    this.reducePos = nextEnd;
            }
            this.pushState(nextState, start);
            this.shiftContext(next, start);
            if (next <= parser.maxNode)
                this.buffer.push(next, start, nextEnd, 4);
        }
        else { // Shift-and-stay, which means this is a skipped token
            this.pos = nextEnd;
            this.shiftContext(next, start);
            if (next <= this.p.parser.maxNode)
                this.buffer.push(next, start, nextEnd, 4);
        }
    }
    // Apply an action
    /// @internal
    apply(action, next, nextEnd) {
        if (action & 65536 /* ReduceFlag */)
            this.reduce(action);
        else
            this.shift(action, next, nextEnd);
    }
    // Add a prebuilt (reused) node into the buffer. @internal
    useNode(value, next) {
        let index = this.p.reused.length - 1;
        if (index < 0 || this.p.reused[index] != value) {
            this.p.reused.push(value);
            index++;
        }
        let start = this.pos;
        this.reducePos = this.pos = start + value.length;
        this.pushState(next, start);
        this.buffer.push(index, start, this.reducePos, -1 /* size == -1 means this is a reused value */);
        if (this.curContext)
            this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this, this.p.stream.reset(this.pos - value.length)));
    }
    // Split the stack. Due to the buffer sharing and the fact
    // that `this.stack` tends to stay quite shallow, this isn't very
    // expensive.
    /// @internal
    split() {
        let parent = this;
        let off = parent.buffer.length;
        // Because the top of the buffer (after this.pos) may be mutated
        // to reorder reductions and skipped tokens, and shared buffers
        // should be immutable, this copies any outstanding skipped tokens
        // to the new buffer, and puts the base pointer before them.
        while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
            off -= 4;
        let buffer = parent.buffer.slice(off), base = parent.bufferBase + off;
        // Make sure parent points to an actual parent with content, if there is such a parent.
        while (parent && base == parent.bufferBase)
            parent = parent.parent;
        return new Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base, this.curContext, this.lookAhead, parent);
    }
    // Try to recover from an error by 'deleting' (ignoring) one token.
    /// @internal
    recoverByDelete(next, nextEnd) {
        let isNode = next <= this.p.parser.maxNode;
        if (isNode)
            this.storeNode(next, this.pos, nextEnd, 4);
        this.storeNode(0 /* Err */, this.pos, nextEnd, isNode ? 8 : 4);
        this.pos = this.reducePos = nextEnd;
        this.score -= 190 /* Delete */;
    }
    /// Check if the given term would be able to be shifted (optionally
    /// after some reductions) on this stack. This can be useful for
    /// external tokenizers that want to make sure they only provide a
    /// given token when it applies.
    canShift(term) {
        for (let sim = new SimulatedStack(this);;) {
            let action = this.p.parser.stateSlot(sim.state, 4 /* DefaultReduce */) || this.p.parser.hasAction(sim.state, term);
            if ((action & 65536 /* ReduceFlag */) == 0)
                return true;
            if (action == 0)
                return false;
            sim.reduce(action);
        }
    }
    // Apply up to Recover.MaxNext recovery actions that conceptually
    // inserts some missing token or rule.
    /// @internal
    recoverByInsert(next) {
        if (this.stack.length >= 300 /* MaxInsertStackDepth */)
            return [];
        let nextStates = this.p.parser.nextStates(this.state);
        if (nextStates.length > 4 /* MaxNext */ << 1 || this.stack.length >= 120 /* DampenInsertStackDepth */) {
            let best = [];
            for (let i = 0, s; i < nextStates.length; i += 2) {
                if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next))
                    best.push(nextStates[i], s);
            }
            if (this.stack.length < 120 /* DampenInsertStackDepth */)
                for (let i = 0; best.length < 4 /* MaxNext */ << 1 && i < nextStates.length; i += 2) {
                    let s = nextStates[i + 1];
                    if (!best.some((v, i) => (i & 1) && v == s))
                        best.push(nextStates[i], s);
                }
            nextStates = best;
        }
        let result = [];
        for (let i = 0; i < nextStates.length && result.length < 4 /* MaxNext */; i += 2) {
            let s = nextStates[i + 1];
            if (s == this.state)
                continue;
            let stack = this.split();
            stack.storeNode(0 /* Err */, stack.pos, stack.pos, 4, true);
            stack.pushState(s, this.pos);
            stack.shiftContext(nextStates[i], this.pos);
            stack.score -= 200 /* Insert */;
            result.push(stack);
        }
        return result;
    }
    // Force a reduce, if possible. Return false if that can't
    // be done.
    /// @internal
    forceReduce() {
        let reduce = this.p.parser.stateSlot(this.state, 5 /* ForcedReduce */);
        if ((reduce & 65536 /* ReduceFlag */) == 0)
            return false;
        let { parser } = this.p;
        if (!parser.validAction(this.state, reduce)) {
            let depth = reduce >> 19 /* ReduceDepthShift */, term = reduce & 65535 /* ValueMask */;
            let target = this.stack.length - depth * 3;
            if (target < 0 || parser.getGoto(this.stack[target], term, false) < 0)
                return false;
            this.storeNode(0 /* Err */, this.reducePos, this.reducePos, 4, true);
            this.score -= 100 /* Reduce */;
        }
        this.reduce(reduce);
        return true;
    }
    /// @internal
    forceAll() {
        while (!this.p.parser.stateFlag(this.state, 2 /* Accepting */) && this.forceReduce()) { }
        return this;
    }
    /// Check whether this state has no further actions (assumed to be a direct descendant of the
    /// top state, since any other states must be able to continue
    /// somehow). @internal
    get deadEnd() {
        if (this.stack.length != 3)
            return false;
        let { parser } = this.p;
        return parser.data[parser.stateSlot(this.state, 1 /* Actions */)] == 65535 /* End */ &&
            !parser.stateSlot(this.state, 4 /* DefaultReduce */);
    }
    /// Restart the stack (put it back in its start state). Only safe
    /// when this.stack.length == 3 (state is directly below the top
    /// state). @internal
    restart() {
        this.state = this.stack[0];
        this.stack.length = 0;
    }
    /// @internal
    sameState(other) {
        if (this.state != other.state || this.stack.length != other.stack.length)
            return false;
        for (let i = 0; i < this.stack.length; i += 3)
            if (this.stack[i] != other.stack[i])
                return false;
        return true;
    }
    /// Get the parser used by this stack.
    get parser() { return this.p.parser; }
    /// Test whether a given dialect (by numeric ID, as exported from
    /// the terms file) is enabled.
    dialectEnabled(dialectID) { return this.p.parser.dialect.flags[dialectID]; }
    shiftContext(term, start) {
        if (this.curContext)
            this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this, this.p.stream.reset(start)));
    }
    reduceContext(term, start) {
        if (this.curContext)
            this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this, this.p.stream.reset(start)));
    }
    /// @internal
    emitContext() {
        let last = this.buffer.length - 1;
        if (last < 0 || this.buffer[last] != -3)
            this.buffer.push(this.curContext.hash, this.reducePos, this.reducePos, -3);
    }
    /// @internal
    emitLookAhead() {
        let last = this.buffer.length - 1;
        if (last < 0 || this.buffer[last] != -4)
            this.buffer.push(this.lookAhead, this.reducePos, this.reducePos, -4);
    }
    updateContext(context) {
        if (context != this.curContext.context) {
            let newCx = new StackContext(this.curContext.tracker, context);
            if (newCx.hash != this.curContext.hash)
                this.emitContext();
            this.curContext = newCx;
        }
    }
    /// @internal
    setLookAhead(lookAhead) {
        if (lookAhead > this.lookAhead) {
            this.emitLookAhead();
            this.lookAhead = lookAhead;
        }
    }
    /// @internal
    close() {
        if (this.curContext && this.curContext.tracker.strict)
            this.emitContext();
        if (this.lookAhead > 0)
            this.emitLookAhead();
    }
}
class StackContext {
    constructor(tracker, context) {
        this.tracker = tracker;
        this.context = context;
        this.hash = tracker.strict ? tracker.hash(context) : 0;
    }
}
var Recover;
(function (Recover) {
    Recover[Recover["Insert"] = 200] = "Insert";
    Recover[Recover["Delete"] = 190] = "Delete";
    Recover[Recover["Reduce"] = 100] = "Reduce";
    Recover[Recover["MaxNext"] = 4] = "MaxNext";
    Recover[Recover["MaxInsertStackDepth"] = 300] = "MaxInsertStackDepth";
    Recover[Recover["DampenInsertStackDepth"] = 120] = "DampenInsertStackDepth";
})(Recover || (Recover = {}));
// Used to cheaply run some reductions to scan ahead without mutating
// an entire stack
class SimulatedStack {
    constructor(start) {
        this.start = start;
        this.state = start.state;
        this.stack = start.stack;
        this.base = this.stack.length;
    }
    reduce(action) {
        let term = action & 65535 /* ValueMask */, depth = action >> 19 /* ReduceDepthShift */;
        if (depth == 0) {
            if (this.stack == this.start.stack)
                this.stack = this.stack.slice();
            this.stack.push(this.state, 0, 0);
            this.base += 3;
        }
        else {
            this.base -= (depth - 1) * 3;
        }
        let goto = this.start.p.parser.getGoto(this.stack[this.base - 3], term, true);
        this.state = goto;
    }
}
// This is given to `Tree.build` to build a buffer, and encapsulates
// the parent-stack-walking necessary to read the nodes.
class StackBufferCursor {
    constructor(stack, pos, index) {
        this.stack = stack;
        this.pos = pos;
        this.index = index;
        this.buffer = stack.buffer;
        if (this.index == 0)
            this.maybeNext();
    }
    static create(stack, pos = stack.bufferBase + stack.buffer.length) {
        return new StackBufferCursor(stack, pos, pos - stack.bufferBase);
    }
    maybeNext() {
        let next = this.stack.parent;
        if (next != null) {
            this.index = this.stack.bufferBase - next.bufferBase;
            this.stack = next;
            this.buffer = next.buffer;
        }
    }
    get id() { return this.buffer[this.index - 4]; }
    get start() { return this.buffer[this.index - 3]; }
    get end() { return this.buffer[this.index - 2]; }
    get size() { return this.buffer[this.index - 1]; }
    next() {
        this.index -= 4;
        this.pos -= 4;
        if (this.index == 0)
            this.maybeNext();
    }
    fork() {
        return new StackBufferCursor(this.stack, this.pos, this.index);
    }
}

class CachedToken {
    constructor() {
        this.start = -1;
        this.value = -1;
        this.end = -1;
        this.extended = -1;
        this.lookAhead = 0;
        this.mask = 0;
        this.context = 0;
    }
}
const nullToken = new CachedToken;
/// [Tokenizers](#lr.ExternalTokenizer) interact with the input
/// through this interface. It presents the input as a stream of
/// characters, tracking lookahead and hiding the complexity of
/// [ranges](#common.Parser.parse^ranges) from tokenizer code.
class InputStream {
    /// @internal
    constructor(
    /// @internal
    input, 
    /// @internal
    ranges) {
        this.input = input;
        this.ranges = ranges;
        /// @internal
        this.chunk = "";
        /// @internal
        this.chunkOff = 0;
        /// Backup chunk
        this.chunk2 = "";
        this.chunk2Pos = 0;
        /// The character code of the next code unit in the input, or -1
        /// when the stream is at the end of the input.
        this.next = -1;
        /// @internal
        this.token = nullToken;
        this.rangeIndex = 0;
        this.pos = this.chunkPos = ranges[0].from;
        this.range = ranges[0];
        this.end = ranges[ranges.length - 1].to;
        this.readNext();
    }
    resolveOffset(offset, assoc) {
        let range = this.range, index = this.rangeIndex;
        let pos = this.pos + offset;
        while (pos < range.from) {
            if (!index)
                return null;
            let next = this.ranges[--index];
            pos -= range.from - next.to;
            range = next;
        }
        while (assoc < 0 ? pos > range.to : pos >= range.to) {
            if (index == this.ranges.length - 1)
                return null;
            let next = this.ranges[++index];
            pos += next.from - range.to;
            range = next;
        }
        return pos;
    }
    /// Look at a code unit near the stream position. `.peek(0)` equals
    /// `.next`, `.peek(-1)` gives you the previous character, and so
    /// on.
    ///
    /// Note that looking around during tokenizing creates dependencies
    /// on potentially far-away content, which may reduce the
    /// effectiveness incremental parsing—when looking forward—or even
    /// cause invalid reparses when looking backward more than 25 code
    /// units, since the library does not track lookbehind.
    peek(offset) {
        let idx = this.chunkOff + offset, pos, result;
        if (idx >= 0 && idx < this.chunk.length) {
            pos = this.pos + offset;
            result = this.chunk.charCodeAt(idx);
        }
        else {
            let resolved = this.resolveOffset(offset, 1);
            if (resolved == null)
                return -1;
            pos = resolved;
            if (pos >= this.chunk2Pos && pos < this.chunk2Pos + this.chunk2.length) {
                result = this.chunk2.charCodeAt(pos - this.chunk2Pos);
            }
            else {
                let i = this.rangeIndex, range = this.range;
                while (range.to <= pos)
                    range = this.ranges[++i];
                this.chunk2 = this.input.chunk(this.chunk2Pos = pos);
                if (pos + this.chunk2.length > range.to)
                    this.chunk2 = this.chunk2.slice(0, range.to - pos);
                result = this.chunk2.charCodeAt(0);
            }
        }
        if (pos > this.token.lookAhead)
            this.token.lookAhead = pos;
        return result;
    }
    /// Accept a token. By default, the end of the token is set to the
    /// current stream position, but you can pass an offset (relative to
    /// the stream position) to change that.
    acceptToken(token, endOffset = 0) {
        let end = endOffset ? this.resolveOffset(endOffset, -1) : this.pos;
        if (end == null || end < this.token.start)
            throw new RangeError("Token end out of bounds");
        this.token.value = token;
        this.token.end = end;
    }
    getChunk() {
        if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
            let { chunk, chunkPos } = this;
            this.chunk = this.chunk2;
            this.chunkPos = this.chunk2Pos;
            this.chunk2 = chunk;
            this.chunk2Pos = chunkPos;
            this.chunkOff = this.pos - this.chunkPos;
        }
        else {
            this.chunk2 = this.chunk;
            this.chunk2Pos = this.chunkPos;
            let nextChunk = this.input.chunk(this.pos);
            let end = this.pos + nextChunk.length;
            this.chunk = end > this.range.to ? nextChunk.slice(0, this.range.to - this.pos) : nextChunk;
            this.chunkPos = this.pos;
            this.chunkOff = 0;
        }
    }
    readNext() {
        if (this.chunkOff >= this.chunk.length) {
            this.getChunk();
            if (this.chunkOff == this.chunk.length)
                return this.next = -1;
        }
        return this.next = this.chunk.charCodeAt(this.chunkOff);
    }
    /// Move the stream forward N (defaults to 1) code units. Returns
    /// the new value of [`next`](#lr.InputStream.next).
    advance(n = 1) {
        this.chunkOff += n;
        while (this.pos + n >= this.range.to) {
            if (this.rangeIndex == this.ranges.length - 1)
                return this.setDone();
            n -= this.range.to - this.pos;
            this.range = this.ranges[++this.rangeIndex];
            this.pos = this.range.from;
        }
        this.pos += n;
        if (this.pos > this.token.lookAhead)
            this.token.lookAhead = this.pos;
        return this.readNext();
    }
    setDone() {
        this.pos = this.chunkPos = this.end;
        this.range = this.ranges[this.rangeIndex = this.ranges.length - 1];
        this.chunk = "";
        return this.next = -1;
    }
    /// @internal
    reset(pos, token) {
        if (token) {
            this.token = token;
            token.start = token.lookAhead = pos;
            token.value = token.extended = -1;
        }
        else {
            this.token = nullToken;
        }
        if (this.pos != pos) {
            this.pos = pos;
            if (pos == this.end) {
                this.setDone();
                return this;
            }
            while (pos < this.range.from)
                this.range = this.ranges[--this.rangeIndex];
            while (pos >= this.range.to)
                this.range = this.ranges[++this.rangeIndex];
            if (pos >= this.chunkPos && pos < this.chunkPos + this.chunk.length) {
                this.chunkOff = pos - this.chunkPos;
            }
            else {
                this.chunk = "";
                this.chunkOff = 0;
            }
            this.readNext();
        }
        return this;
    }
    /// @internal
    read(from, to) {
        if (from >= this.chunkPos && to <= this.chunkPos + this.chunk.length)
            return this.chunk.slice(from - this.chunkPos, to - this.chunkPos);
        if (from >= this.range.from && to <= this.range.to)
            return this.input.read(from, to);
        let result = "";
        for (let r of this.ranges) {
            if (r.from >= to)
                break;
            if (r.to > from)
                result += this.input.read(Math.max(r.from, from), Math.min(r.to, to));
        }
        return result;
    }
}
/// @internal
class TokenGroup {
    constructor(data, id) {
        this.data = data;
        this.id = id;
    }
    token(input, stack) { readToken(this.data, input, stack, this.id); }
}
TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
/// `@external tokens` declarations in the grammar should resolve to
/// an instance of this class.
class ExternalTokenizer {
    /// Create a tokenizer. The first argument is the function that,
    /// given an input stream, scans for the types of tokens it
    /// recognizes at the stream's position, and calls
    /// [`acceptToken`](#lr.InputStream.acceptToken) when it finds
    /// one.
    constructor(
    /// @internal
    token, options = {}) {
        this.token = token;
        this.contextual = !!options.contextual;
        this.fallback = !!options.fallback;
        this.extend = !!options.extend;
    }
}
// Tokenizer data is stored a big uint16 array containing, for each
// state:
//
//  - A group bitmask, indicating what token groups are reachable from
//    this state, so that paths that can only lead to tokens not in
//    any of the current groups can be cut off early.
//
//  - The position of the end of the state's sequence of accepting
//    tokens
//
//  - The number of outgoing edges for the state
//
//  - The accepting tokens, as (token id, group mask) pairs
//
//  - The outgoing edges, as (start character, end character, state
//    index) triples, with end character being exclusive
//
// This function interprets that data, running through a stream as
// long as new states with the a matching group mask can be reached,
// and updating `token` when it matches a token.
function readToken(data, input, stack, group) {
    let state = 0, groupMask = 1 << group, { parser } = stack.p, { dialect } = parser;
    scan: for (;;) {
        if ((groupMask & data[state]) == 0)
            break;
        let accEnd = data[state + 1];
        // Check whether this state can lead to a token in the current group
        // Accept tokens in this state, possibly overwriting
        // lower-precedence / shorter tokens
        for (let i = state + 3; i < accEnd; i += 2)
            if ((data[i + 1] & groupMask) > 0) {
                let term = data[i];
                if (dialect.allows(term) &&
                    (input.token.value == -1 || input.token.value == term || parser.overrides(term, input.token.value))) {
                    input.acceptToken(term);
                    break;
                }
            }
        // Do a binary search on the state's edges
        for (let next = input.next, low = 0, high = data[state + 2]; low < high;) {
            let mid = (low + high) >> 1;
            let index = accEnd + mid + (mid << 1);
            let from = data[index], to = data[index + 1];
            if (next < from)
                high = mid;
            else if (next >= to)
                low = mid + 1;
            else {
                state = data[index + 2];
                input.advance();
                continue scan;
            }
        }
        break;
    }
}

// See lezer-generator/src/encode.ts for comments about the encoding
// used here
function decodeArray(input, Type = Uint16Array) {
    if (typeof input != "string")
        return input;
    let array = null;
    for (let pos = 0, out = 0; pos < input.length;) {
        let value = 0;
        for (;;) {
            let next = input.charCodeAt(pos++), stop = false;
            if (next == 126 /* BigValCode */) {
                value = 65535 /* BigVal */;
                break;
            }
            if (next >= 92 /* Gap2 */)
                next--;
            if (next >= 34 /* Gap1 */)
                next--;
            let digit = next - 32 /* Start */;
            if (digit >= 46 /* Base */) {
                digit -= 46 /* Base */;
                stop = true;
            }
            value += digit;
            if (stop)
                break;
            value *= 46 /* Base */;
        }
        if (array)
            array[out++] = value;
        else
            array = new Type(value);
    }
    return array;
}

// FIXME find some way to reduce recovery work done when the input
// doesn't match the grammar at all.
// Environment variable used to control console output
const verbose = typeof process != "undefined" && /\bparse\b/.test(process.env.LOG);
let stackIDs = null;
var Safety;
(function (Safety) {
    Safety[Safety["Margin"] = 25] = "Margin";
})(Safety || (Safety = {}));
function cutAt(tree, pos, side) {
    let cursor = tree.fullCursor();
    cursor.moveTo(pos);
    for (;;) {
        if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
            for (;;) {
                if ((side < 0 ? cursor.to < pos : cursor.from > pos) && !cursor.type.isError)
                    return side < 0 ? Math.max(0, Math.min(cursor.to - 1, pos - 25 /* Margin */))
                        : Math.min(tree.length, Math.max(cursor.from + 1, pos + 25 /* Margin */));
                if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
                    break;
                if (!cursor.parent())
                    return side < 0 ? 0 : tree.length;
            }
    }
}
class FragmentCursor {
    constructor(fragments, nodeSet) {
        this.fragments = fragments;
        this.nodeSet = nodeSet;
        this.i = 0;
        this.fragment = null;
        this.safeFrom = -1;
        this.safeTo = -1;
        this.trees = [];
        this.start = [];
        this.index = [];
        this.nextFragment();
    }
    nextFragment() {
        let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
        if (fr) {
            this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
            this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
            while (this.trees.length) {
                this.trees.pop();
                this.start.pop();
                this.index.pop();
            }
            this.trees.push(fr.tree);
            this.start.push(-fr.offset);
            this.index.push(0);
            this.nextStart = this.safeFrom;
        }
        else {
            this.nextStart = 1e9;
        }
    }
    // `pos` must be >= any previously given `pos` for this cursor
    nodeAt(pos) {
        if (pos < this.nextStart)
            return null;
        while (this.fragment && this.safeTo <= pos)
            this.nextFragment();
        if (!this.fragment)
            return null;
        for (;;) {
            let last = this.trees.length - 1;
            if (last < 0) { // End of tree
                this.nextFragment();
                return null;
            }
            let top = this.trees[last], index = this.index[last];
            if (index == top.children.length) {
                this.trees.pop();
                this.start.pop();
                this.index.pop();
                continue;
            }
            let next = top.children[index];
            let start = this.start[last] + top.positions[index];
            if (start > pos) {
                this.nextStart = start;
                return null;
            }
            if (next instanceof Tree) {
                if (start == pos) {
                    if (start < this.safeFrom)
                        return null;
                    let end = start + next.length;
                    if (end <= this.safeTo) {
                        let lookAhead = next.prop(NodeProp.lookAhead);
                        if (!lookAhead || end + lookAhead < this.fragment.to)
                            return next;
                    }
                }
                this.index[last]++;
                if (start + next.length >= Math.max(this.safeFrom, pos)) { // Enter this node
                    this.trees.push(next);
                    this.start.push(start);
                    this.index.push(0);
                }
            }
            else {
                this.index[last]++;
                this.nextStart = start + next.length;
            }
        }
    }
}
class TokenCache {
    constructor(parser, stream) {
        this.stream = stream;
        this.tokens = [];
        this.mainToken = null;
        this.actions = [];
        this.tokens = parser.tokenizers.map(_ => new CachedToken);
    }
    getActions(stack) {
        let actionIndex = 0;
        let main = null;
        let { parser } = stack.p, { tokenizers } = parser;
        let mask = parser.stateSlot(stack.state, 3 /* TokenizerMask */);
        let context = stack.curContext ? stack.curContext.hash : 0;
        let lookAhead = 0;
        for (let i = 0; i < tokenizers.length; i++) {
            if (((1 << i) & mask) == 0)
                continue;
            let tokenizer = tokenizers[i], token = this.tokens[i];
            if (main && !tokenizer.fallback)
                continue;
            if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
                this.updateCachedToken(token, tokenizer, stack);
                token.mask = mask;
                token.context = context;
            }
            if (token.lookAhead > token.end + 25 /* Margin */)
                lookAhead = Math.max(token.lookAhead, lookAhead);
            if (token.value != 0 /* Err */) {
                let startIndex = actionIndex;
                if (token.extended > -1)
                    actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
                actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
                if (!tokenizer.extend) {
                    main = token;
                    if (actionIndex > startIndex)
                        break;
                }
            }
        }
        while (this.actions.length > actionIndex)
            this.actions.pop();
        if (lookAhead)
            stack.setLookAhead(lookAhead);
        if (!main && stack.pos == this.stream.end) {
            main = new CachedToken;
            main.value = stack.p.parser.eofTerm;
            main.start = main.end = stack.pos;
            actionIndex = this.addActions(stack, main.value, main.end, actionIndex);
        }
        this.mainToken = main;
        return this.actions;
    }
    getMainToken(stack) {
        if (this.mainToken)
            return this.mainToken;
        let main = new CachedToken, { pos, p } = stack;
        main.start = pos;
        main.end = Math.min(pos + 1, p.stream.end);
        main.value = pos == p.stream.end ? p.parser.eofTerm : 0 /* Err */;
        return main;
    }
    updateCachedToken(token, tokenizer, stack) {
        tokenizer.token(this.stream.reset(stack.pos, token), stack);
        if (token.value > -1) {
            let { parser } = stack.p;
            for (let i = 0; i < parser.specialized.length; i++)
                if (parser.specialized[i] == token.value) {
                    let result = parser.specializers[i](this.stream.read(token.start, token.end), stack);
                    if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
                        if ((result & 1) == 0 /* Specialize */)
                            token.value = result >> 1;
                        else
                            token.extended = result >> 1;
                        break;
                    }
                }
        }
        else {
            token.value = 0 /* Err */;
            token.end = Math.min(stack.p.stream.end, stack.pos + 1);
        }
    }
    putAction(action, token, end, index) {
        // Don't add duplicate actions
        for (let i = 0; i < index; i += 3)
            if (this.actions[i] == action)
                return index;
        this.actions[index++] = action;
        this.actions[index++] = token;
        this.actions[index++] = end;
        return index;
    }
    addActions(stack, token, end, index) {
        let { state } = stack, { parser } = stack.p, { data } = parser;
        for (let set = 0; set < 2; set++) {
            for (let i = parser.stateSlot(state, set ? 2 /* Skip */ : 1 /* Actions */);; i += 3) {
                if (data[i] == 65535 /* End */) {
                    if (data[i + 1] == 1 /* Next */) {
                        i = pair(data, i + 2);
                    }
                    else {
                        if (index == 0 && data[i + 1] == 2 /* Other */)
                            index = this.putAction(pair(data, i + 1), token, end, index);
                        break;
                    }
                }
                if (data[i] == token)
                    index = this.putAction(pair(data, i + 1), token, end, index);
            }
        }
        return index;
    }
}
var Rec;
(function (Rec) {
    Rec[Rec["Distance"] = 5] = "Distance";
    Rec[Rec["MaxRemainingPerStep"] = 3] = "MaxRemainingPerStep";
    Rec[Rec["MinBufferLengthPrune"] = 200] = "MinBufferLengthPrune";
    Rec[Rec["ForceReduceLimit"] = 10] = "ForceReduceLimit";
})(Rec || (Rec = {}));
class Parse {
    constructor(parser, input, fragments, ranges) {
        this.parser = parser;
        this.input = input;
        this.ranges = ranges;
        this.recovering = 0;
        this.nextStackID = 0x2654;
        this.minStackPos = 0;
        this.reused = [];
        this.stoppedAt = null;
        this.stream = new InputStream(input, ranges);
        this.tokens = new TokenCache(parser, this.stream);
        this.topTerm = parser.top[1];
        let { from } = ranges[0];
        this.stacks = [Stack.start(this, parser.top[0], from)];
        this.fragments = fragments.length && this.stream.end - from > parser.bufferLength * 4
            ? new FragmentCursor(fragments, parser.nodeSet) : null;
    }
    get parsedPos() {
        return this.minStackPos;
    }
    // Move the parser forward. This will process all parse stacks at
    // `this.pos` and try to advance them to a further position. If no
    // stack for such a position is found, it'll start error-recovery.
    //
    // When the parse is finished, this will return a syntax tree. When
    // not, it returns `null`.
    advance() {
        let stacks = this.stacks, pos = this.minStackPos;
        // This will hold stacks beyond `pos`.
        let newStacks = this.stacks = [];
        let stopped, stoppedTokens;
        // Keep advancing any stacks at `pos` until they either move
        // forward or can't be advanced. Gather stacks that can't be
        // advanced further in `stopped`.
        for (let i = 0; i < stacks.length; i++) {
            let stack = stacks[i];
            for (;;) {
                this.tokens.mainToken = null;
                if (stack.pos > pos) {
                    newStacks.push(stack);
                }
                else if (this.advanceStack(stack, newStacks, stacks)) {
                    continue;
                }
                else {
                    if (!stopped) {
                        stopped = [];
                        stoppedTokens = [];
                    }
                    stopped.push(stack);
                    let tok = this.tokens.getMainToken(stack);
                    stoppedTokens.push(tok.value, tok.end);
                }
                break;
            }
        }
        if (!newStacks.length) {
            let finished = stopped && findFinished(stopped);
            if (finished)
                return this.stackToTree(finished);
            if (this.parser.strict) {
                if (verbose && stopped)
                    console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none"));
                throw new SyntaxError("No parse at " + pos);
            }
            if (!this.recovering)
                this.recovering = 5 /* Distance */;
        }
        if (this.recovering && stopped) {
            let finished = this.runRecovery(stopped, stoppedTokens, newStacks);
            if (finished)
                return this.stackToTree(finished.forceAll());
        }
        if (this.recovering) {
            let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3 /* MaxRemainingPerStep */;
            if (newStacks.length > maxRemaining) {
                newStacks.sort((a, b) => b.score - a.score);
                while (newStacks.length > maxRemaining)
                    newStacks.pop();
            }
            if (newStacks.some(s => s.reducePos > pos))
                this.recovering--;
        }
        else if (newStacks.length > 1) {
            // Prune stacks that are in the same state, or that have been
            // running without splitting for a while, to avoid getting stuck
            // with multiple successful stacks running endlessly on.
            outer: for (let i = 0; i < newStacks.length - 1; i++) {
                let stack = newStacks[i];
                for (let j = i + 1; j < newStacks.length; j++) {
                    let other = newStacks[j];
                    if (stack.sameState(other) ||
                        stack.buffer.length > 200 /* MinBufferLengthPrune */ && other.buffer.length > 200 /* MinBufferLengthPrune */) {
                        if (((stack.score - other.score) || (stack.buffer.length - other.buffer.length)) > 0) {
                            newStacks.splice(j--, 1);
                        }
                        else {
                            newStacks.splice(i--, 1);
                            continue outer;
                        }
                    }
                }
            }
        }
        this.minStackPos = newStacks[0].pos;
        for (let i = 1; i < newStacks.length; i++)
            if (newStacks[i].pos < this.minStackPos)
                this.minStackPos = newStacks[i].pos;
        return null;
    }
    stopAt(pos) {
        if (this.stoppedAt != null && this.stoppedAt < pos)
            throw new RangeError("Can't move stoppedAt forward");
        this.stoppedAt = pos;
    }
    // Returns an updated version of the given stack, or null if the
    // stack can't advance normally. When `split` and `stacks` are
    // given, stacks split off by ambiguous operations will be pushed to
    // `split`, or added to `stacks` if they move `pos` forward.
    advanceStack(stack, stacks, split) {
        let start = stack.pos, { parser } = this;
        let base = verbose ? this.stackID(stack) + " -> " : "";
        if (this.stoppedAt != null && start > this.stoppedAt)
            return stack.forceReduce() ? stack : null;
        if (this.fragments) {
            let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
            for (let cached = this.fragments.nodeAt(start); cached;) {
                let match = this.parser.nodeSet.types[cached.type.id] == cached.type ? parser.getGoto(stack.state, cached.type.id) : -1;
                if (match > -1 && cached.length && (!strictCx || (cached.prop(NodeProp.contextHash) || 0) == cxHash)) {
                    stack.useNode(cached, match);
                    if (verbose)
                        console.log(base + this.stackID(stack) + ` (via reuse of ${parser.getName(cached.type.id)})`);
                    return true;
                }
                if (!(cached instanceof Tree) || cached.children.length == 0 || cached.positions[0] > 0)
                    break;
                let inner = cached.children[0];
                if (inner instanceof Tree && cached.positions[0] == 0)
                    cached = inner;
                else
                    break;
            }
        }
        let defaultReduce = parser.stateSlot(stack.state, 4 /* DefaultReduce */);
        if (defaultReduce > 0) {
            stack.reduce(defaultReduce);
            if (verbose)
                console.log(base + this.stackID(stack) + ` (via always-reduce ${parser.getName(defaultReduce & 65535 /* ValueMask */)})`);
            return true;
        }
        let actions = this.tokens.getActions(stack);
        for (let i = 0; i < actions.length;) {
            let action = actions[i++], term = actions[i++], end = actions[i++];
            let last = i == actions.length || !split;
            let localStack = last ? stack : stack.split();
            localStack.apply(action, term, end);
            if (verbose)
                console.log(base + this.stackID(localStack) + ` (via ${(action & 65536 /* ReduceFlag */) == 0 ? "shift"
                    : `reduce of ${parser.getName(action & 65535 /* ValueMask */)}`} for ${parser.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
            if (last)
                return true;
            else if (localStack.pos > start)
                stacks.push(localStack);
            else
                split.push(localStack);
        }
        return false;
    }
    // Advance a given stack forward as far as it will go. Returns the
    // (possibly updated) stack if it got stuck, or null if it moved
    // forward and was given to `pushStackDedup`.
    advanceFully(stack, newStacks) {
        let pos = stack.pos;
        for (;;) {
            if (!this.advanceStack(stack, null, null))
                return false;
            if (stack.pos > pos) {
                pushStackDedup(stack, newStacks);
                return true;
            }
        }
    }
    runRecovery(stacks, tokens, newStacks) {
        let finished = null, restarted = false;
        for (let i = 0; i < stacks.length; i++) {
            let stack = stacks[i], token = tokens[i << 1], tokenEnd = tokens[(i << 1) + 1];
            let base = verbose ? this.stackID(stack) + " -> " : "";
            if (stack.deadEnd) {
                if (restarted)
                    continue;
                restarted = true;
                stack.restart();
                if (verbose)
                    console.log(base + this.stackID(stack) + " (restarted)");
                let done = this.advanceFully(stack, newStacks);
                if (done)
                    continue;
            }
            let force = stack.split(), forceBase = base;
            for (let j = 0; force.forceReduce() && j < 10 /* ForceReduceLimit */; j++) {
                if (verbose)
                    console.log(forceBase + this.stackID(force) + " (via force-reduce)");
                let done = this.advanceFully(force, newStacks);
                if (done)
                    break;
                if (verbose)
                    forceBase = this.stackID(force) + " -> ";
            }
            for (let insert of stack.recoverByInsert(token)) {
                if (verbose)
                    console.log(base + this.stackID(insert) + " (via recover-insert)");
                this.advanceFully(insert, newStacks);
            }
            if (this.stream.end > stack.pos) {
                if (tokenEnd == stack.pos) {
                    tokenEnd++;
                    token = 0 /* Err */;
                }
                stack.recoverByDelete(token, tokenEnd);
                if (verbose)
                    console.log(base + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token)})`);
                pushStackDedup(stack, newStacks);
            }
            else if (!finished || finished.score < stack.score) {
                finished = stack;
            }
        }
        return finished;
    }
    // Convert the stack's buffer to a syntax tree.
    stackToTree(stack) {
        stack.close();
        return Tree.build({ buffer: StackBufferCursor.create(stack),
            nodeSet: this.parser.nodeSet,
            topID: this.topTerm,
            maxBufferLength: this.parser.bufferLength,
            reused: this.reused,
            start: this.ranges[0].from,
            length: stack.pos - this.ranges[0].from,
            minRepeatType: this.parser.minRepeatTerm });
    }
    stackID(stack) {
        let id = (stackIDs || (stackIDs = new WeakMap)).get(stack);
        if (!id)
            stackIDs.set(stack, id = String.fromCodePoint(this.nextStackID++));
        return id + stack;
    }
}
function pushStackDedup(stack, newStacks) {
    for (let i = 0; i < newStacks.length; i++) {
        let other = newStacks[i];
        if (other.pos == stack.pos && other.sameState(stack)) {
            if (newStacks[i].score < stack.score)
                newStacks[i] = stack;
            return;
        }
    }
    newStacks.push(stack);
}
class Dialect {
    constructor(source, flags, disabled) {
        this.source = source;
        this.flags = flags;
        this.disabled = disabled;
    }
    allows(term) { return !this.disabled || this.disabled[term] == 0; }
}
const id = x => x;
/// Context trackers are used to track stateful context (such as
/// indentation in the Python grammar, or parent elements in the XML
/// grammar) needed by external tokenizers. You declare them in a
/// grammar file as `@context exportName from "module"`.
///
/// Context values should be immutable, and can be updated (replaced)
/// on shift or reduce actions.
///
/// The export used in a `@context` declaration should be of this
/// type.
class ContextTracker {
    /// Define a context tracker.
    constructor(spec) {
        this.start = spec.start;
        this.shift = spec.shift || id;
        this.reduce = spec.reduce || id;
        this.reuse = spec.reuse || id;
        this.hash = spec.hash || (() => 0);
        this.strict = spec.strict !== false;
    }
}
/// A parser holds the parse tables for a given grammar, as generated
/// by `lezer-generator`.
class LRParser extends Parser {
    /// @internal
    constructor(spec) {
        super();
        /// @internal
        this.wrappers = [];
        if (spec.version != 13 /* Version */)
            throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${13 /* Version */})`);
        let nodeNames = spec.nodeNames.split(" ");
        this.minRepeatTerm = nodeNames.length;
        for (let i = 0; i < spec.repeatNodeCount; i++)
            nodeNames.push("");
        let topTerms = Object.keys(spec.topRules).map(r => spec.topRules[r][1]);
        let nodeProps = [];
        for (let i = 0; i < nodeNames.length; i++)
            nodeProps.push([]);
        function setProp(nodeID, prop, value) {
            nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
        }
        if (spec.nodeProps)
            for (let propSpec of spec.nodeProps) {
                let prop = propSpec[0];
                for (let i = 1; i < propSpec.length;) {
                    let next = propSpec[i++];
                    if (next >= 0) {
                        setProp(next, prop, propSpec[i++]);
                    }
                    else {
                        let value = propSpec[i + -next];
                        for (let j = -next; j > 0; j--)
                            setProp(propSpec[i++], prop, value);
                        i++;
                    }
                }
            }
        this.nodeSet = new NodeSet(nodeNames.map((name, i) => NodeType.define({
            name: i >= this.minRepeatTerm ? undefined : name,
            id: i,
            props: nodeProps[i],
            top: topTerms.indexOf(i) > -1,
            error: i == 0,
            skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
        })));
        this.strict = false;
        this.bufferLength = DefaultBufferLength;
        let tokenArray = decodeArray(spec.tokenData);
        this.context = spec.context;
        this.specialized = new Uint16Array(spec.specialized ? spec.specialized.length : 0);
        this.specializers = [];
        if (spec.specialized)
            for (let i = 0; i < spec.specialized.length; i++) {
                this.specialized[i] = spec.specialized[i].term;
                this.specializers[i] = spec.specialized[i].get;
            }
        this.states = decodeArray(spec.states, Uint32Array);
        this.data = decodeArray(spec.stateData);
        this.goto = decodeArray(spec.goto);
        this.maxTerm = spec.maxTerm;
        this.tokenizers = spec.tokenizers.map(value => typeof value == "number" ? new TokenGroup(tokenArray, value) : value);
        this.topRules = spec.topRules;
        this.dialects = spec.dialects || {};
        this.dynamicPrecedences = spec.dynamicPrecedences || null;
        this.tokenPrecTable = spec.tokenPrec;
        this.termNames = spec.termNames || null;
        this.maxNode = this.nodeSet.types.length - 1;
        this.dialect = this.parseDialect();
        this.top = this.topRules[Object.keys(this.topRules)[0]];
    }
    createParse(input, fragments, ranges) {
        let parse = new Parse(this, input, fragments, ranges);
        for (let w of this.wrappers)
            parse = w(parse, input, fragments, ranges);
        return parse;
    }
    /// Get a goto table entry @internal
    getGoto(state, term, loose = false) {
        let table = this.goto;
        if (term >= table[0])
            return -1;
        for (let pos = table[term + 1];;) {
            let groupTag = table[pos++], last = groupTag & 1;
            let target = table[pos++];
            if (last && loose)
                return target;
            for (let end = pos + (groupTag >> 1); pos < end; pos++)
                if (table[pos] == state)
                    return target;
            if (last)
                return -1;
        }
    }
    /// Check if this state has an action for a given terminal @internal
    hasAction(state, terminal) {
        let data = this.data;
        for (let set = 0; set < 2; set++) {
            for (let i = this.stateSlot(state, set ? 2 /* Skip */ : 1 /* Actions */), next;; i += 3) {
                if ((next = data[i]) == 65535 /* End */) {
                    if (data[i + 1] == 1 /* Next */)
                        next = data[i = pair(data, i + 2)];
                    else if (data[i + 1] == 2 /* Other */)
                        return pair(data, i + 2);
                    else
                        break;
                }
                if (next == terminal || next == 0 /* Err */)
                    return pair(data, i + 1);
            }
        }
        return 0;
    }
    /// @internal
    stateSlot(state, slot) {
        return this.states[(state * 6 /* Size */) + slot];
    }
    /// @internal
    stateFlag(state, flag) {
        return (this.stateSlot(state, 0 /* Flags */) & flag) > 0;
    }
    /// @internal
    validAction(state, action) {
        if (action == this.stateSlot(state, 4 /* DefaultReduce */))
            return true;
        for (let i = this.stateSlot(state, 1 /* Actions */);; i += 3) {
            if (this.data[i] == 65535 /* End */) {
                if (this.data[i + 1] == 1 /* Next */)
                    i = pair(this.data, i + 2);
                else
                    return false;
            }
            if (action == pair(this.data, i + 1))
                return true;
        }
    }
    /// Get the states that can follow this one through shift actions or
    /// goto jumps. @internal
    nextStates(state) {
        let result = [];
        for (let i = this.stateSlot(state, 1 /* Actions */);; i += 3) {
            if (this.data[i] == 65535 /* End */) {
                if (this.data[i + 1] == 1 /* Next */)
                    i = pair(this.data, i + 2);
                else
                    break;
            }
            if ((this.data[i + 2] & (65536 /* ReduceFlag */ >> 16)) == 0) {
                let value = this.data[i + 1];
                if (!result.some((v, i) => (i & 1) && v == value))
                    result.push(this.data[i], value);
            }
        }
        return result;
    }
    /// @internal
    overrides(token, prev) {
        let iPrev = findOffset(this.data, this.tokenPrecTable, prev);
        return iPrev < 0 || findOffset(this.data, this.tokenPrecTable, token) < iPrev;
    }
    /// Configure the parser. Returns a new parser instance that has the
    /// given settings modified. Settings not provided in `config` are
    /// kept from the original parser.
    configure(config) {
        // Hideous reflection-based kludge to make it easy to create a
        // slightly modified copy of a parser.
        let copy = Object.assign(Object.create(LRParser.prototype), this);
        if (config.props)
            copy.nodeSet = this.nodeSet.extend(...config.props);
        if (config.top) {
            let info = this.topRules[config.top];
            if (!info)
                throw new RangeError(`Invalid top rule name ${config.top}`);
            copy.top = info;
        }
        if (config.tokenizers)
            copy.tokenizers = this.tokenizers.map(t => {
                let found = config.tokenizers.find(r => r.from == t);
                return found ? found.to : t;
            });
        if (config.contextTracker)
            copy.context = config.contextTracker;
        if (config.dialect)
            copy.dialect = this.parseDialect(config.dialect);
        if (config.strict != null)
            copy.strict = config.strict;
        if (config.wrap)
            copy.wrappers = copy.wrappers.concat(config.wrap);
        if (config.bufferLength != null)
            copy.bufferLength = config.bufferLength;
        return copy;
    }
    /// Returns the name associated with a given term. This will only
    /// work for all terms when the parser was generated with the
    /// `--names` option. By default, only the names of tagged terms are
    /// stored.
    getName(term) {
        return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
    }
    /// The eof term id is always allocated directly after the node
    /// types. @internal
    get eofTerm() { return this.maxNode + 1; }
    /// The type of top node produced by the parser.
    get topNode() { return this.nodeSet.types[this.top[1]]; }
    /// @internal
    dynamicPrecedence(term) {
        let prec = this.dynamicPrecedences;
        return prec == null ? 0 : prec[term] || 0;
    }
    /// @internal
    parseDialect(dialect) {
        let values = Object.keys(this.dialects), flags = values.map(() => false);
        if (dialect)
            for (let part of dialect.split(" ")) {
                let id = values.indexOf(part);
                if (id >= 0)
                    flags[id] = true;
            }
        let disabled = null;
        for (let i = 0; i < values.length; i++)
            if (!flags[i]) {
                for (let j = this.dialects[values[i]], id; (id = this.data[j++]) != 65535 /* End */;)
                    (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id] = 1;
            }
        return new Dialect(dialect, flags, disabled);
    }
    /// (used by the output of the parser generator) @internal
    static deserialize(spec) {
        return new LRParser(spec);
    }
}
function pair(data, off) { return data[off] | (data[off + 1] << 16); }
function findOffset(data, start, term) {
    for (let i = start, next; (next = data[i]) != 65535 /* End */; i++)
        if (next == term)
            return i - start;
    return -1;
}
function findFinished(stacks) {
    let best = null;
    for (let stack of stacks) {
        let stopped = stack.p.stoppedAt;
        if ((stack.pos == stack.p.stream.end || stopped != null && stack.pos > stopped) &&
            stack.p.parser.stateFlag(stack.state, 2 /* Accepting */) &&
            (!best || best.score < stack.score))
            best = stack;
    }
    return best;
}

// This file was generated by lezer-generator. You probably shouldn't edit it.
const noSemi = 274,
  incdec = 1,
  incdecPrefix = 2,
  templateContent = 275,
  templateDollarBrace = 276,
  templateEnd = 277,
  insertSemi = 278,
  TSExtends = 3,
  spaces = 280,
  newline = 281,
  LineComment = 4,
  BlockComment = 5,
  Dialect_ts = 1;

/* Hand-written tokenizers for JavaScript tokens that can't be
   expressed by lezer's built-in tokenizer. */

const space = [9, 10, 11, 12, 13, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200,
               8201, 8202, 8232, 8233, 8239, 8287, 12288];

const braceR = 125, braceL = 123, semicolon = 59, slash = 47, star = 42,
      plus = 43, minus = 45, dollar = 36, backtick = 96, backslash = 92;

const trackNewline = new ContextTracker({
  start: false,
  shift(context, term) {
    return term == LineComment || term == BlockComment || term == spaces ? context : term == newline
  },
  strict: false
});

const insertSemicolon = new ExternalTokenizer((input, stack) => {
  let {next} = input;
  if ((next == braceR || next == -1 || stack.context) && stack.canShift(insertSemi))
    input.acceptToken(insertSemi);
}, {contextual: true, fallback: true});

const noSemicolon = new ExternalTokenizer((input, stack) => {
  let {next} = input, after;
  if (space.indexOf(next) > -1) return
  if (next == slash && ((after = input.peek(1)) == slash || after == star)) return
  if (next != braceR && next != semicolon && next != -1 && !stack.context && stack.canShift(noSemi))
    input.acceptToken(noSemi);
}, {contextual: true});

const incdecToken = new ExternalTokenizer((input, stack) => {
  let {next} = input;
  if (next == plus || next == minus) {
    input.advance();
    if (next == input.next) {
      input.advance();
      let mayPostfix = !stack.context && stack.canShift(incdec);
      input.acceptToken(mayPostfix ? incdec : incdecPrefix);
    }
  }
}, {contextual: true});

const template = new ExternalTokenizer(input => {
  for (let afterDollar = false, i = 0;; i++) {
    let {next} = input;
    if (next < 0) {
      if (i) input.acceptToken(templateContent);
      break
    } else if (next == backtick) {
      if (i) input.acceptToken(templateContent);
      else input.acceptToken(templateEnd, 1);
      break
    } else if (next == braceL && afterDollar) {
      if (i == 1) input.acceptToken(templateDollarBrace, 1);
      else input.acceptToken(templateContent, -1);
      break
    } else if (next == 10 /* "\n" */ && i) {
      // Break up template strings on lines, to avoid huge tokens
      input.advance();
      input.acceptToken(templateContent);
      break
    } else if (next == backslash) {
      input.advance();
    }
    afterDollar = next == dollar;
    input.advance();
  }
});

function tsExtends(value, stack) {
  return value == "extends" && stack.dialectEnabled(Dialect_ts) ? TSExtends : -1
}

// This file was generated by lezer-generator. You probably shouldn't edit it.
const spec_identifier = {__proto__:null,export:16, as:21, from:25, default:30, async:35, function:36, this:46, true:54, false:54, void:60, typeof:64, null:78, super:80, new:114, await:131, yield:133, delete:134, class:144, extends:146, public:187, private:187, protected:187, readonly:189, in:210, instanceof:212, const:214, import:246, keyof:297, unique:301, infer:307, is:341, abstract:361, implements:363, type:365, let:368, var:370, interface:377, enum:381, namespace:387, module:389, declare:393, global:397, for:418, of:427, while:430, with:434, do:438, if:442, else:444, switch:448, case:454, try:460, catch:462, finally:464, return:468, throw:472, break:476, continue:480, debugger:484};
const spec_word = {__proto__:null,async:101, get:103, set:105, public:153, private:153, protected:153, static:155, abstract:157, override:159, readonly:165, new:345};
const spec_LessThan = {__proto__:null,"<":121};
const parser$1 = LRParser.deserialize({
  version: 13,
  states: "$0nO`QYOOO&}Q!LdO'#CgO'UOSO'#DSO)^QYO'#DXO)nQYO'#DdO)uQYO'#DnO-lQYO'#DtOOQO'#EW'#EWO.PQWO'#EVO.UQWO'#EVO0TQ!LdO'#IpO2kQ!LdO'#IqO3XQWO'#EuO3^QpO'#F[OOQ!LS'#E}'#E}O3fO!bO'#E}O3tQWO'#FcO5RQWO'#FbOOQ!LS'#Iq'#IqOOQ!LQ'#Ip'#IpOOQQ'#JZ'#JZO5WQWO'#HiO5]Q!LYO'#HjOOQQ'#Ib'#IbOOQQ'#Hk'#HkQ`QYOOO)uQYO'#DfO5eQWO'#GVO5jQ#tO'#ClO5xQWO'#EUO6TQ#tO'#E|O6oQWO'#GVO6tQWO'#GZO7PQWO'#GZO7_QWO'#G^O7_QWO'#G_O7_QWO'#GaO5eQWO'#GdO8OQWO'#GgO9^QWO'#CcO9nQWO'#GtO9vQWO'#GzO9vQWO'#G|O`QYO'#HOO9vQWO'#HQO9vQWO'#HTO9{QWO'#HZO:QQ!LZO'#H_O)uQYO'#HaO:]Q!LZO'#HcO:hQ!LZO'#HeO5]Q!LYO'#HgO)uQYO'#IrOOOS'#Hm'#HmO:sOSO,59nOOQ!LS,59n,59nO=UQbO'#CgO=`QYO'#HnO=mQWO'#IsO?lQbO'#IsO'aQYO'#IsO?sQWO,59sO@ZQ&jO'#D^OASQWO'#EWOAaQWO'#JOOAlQWO'#I}OAtQWO,5:tOAyQWO'#I|OBQQWO'#DuO5jQ#tO'#EUOB`QWO'#EUOBkQ`O'#E|OOQ!LS,5:O,5:OOBsQYO,5:OODqQ!LdO,5:YOE_QWO,5:`OExQ!LYO'#I{O6tQWO'#IzOFPQWO'#IzOFXQWO,5:sOF^QWO'#IzOFlQYO,5:qOHiQWO'#ESOIsQWO,5:qOKSQWO'#DhOKZQYO'#DmOKeQ&jO,5:zO)uQYO,5:zOOQQ'#Em'#EmOOQQ'#Eo'#EoO)uQYO,5:|O)uQYO,5:|O)uQYO,5:|O)uQYO,5:|O)uQYO,5:|O)uQYO,5:|O)uQYO,5:|O)uQYO,5:|O)uQYO,5:|O)uQYO,5:|O)uQYO,5:|OOQQ'#Es'#EsOKmQYO,5;^OOQ!LS,5;c,5;cOOQ!LS,5;d,5;dOMjQWO,5;dOOQ!LS,5;e,5;eO)uQYO'#HxOMoQ!LYO,5<OONZQWO,5:|O)uQYO,5;aONsQpO'#JSONbQpO'#JSONzQpO'#JSO! ]QpO,5;lOOOO,5;v,5;vO! kQYO'#F^OOOO'#Hw'#HwO3fO!bO,5;iO! rQpO'#F`OOQ!LS,5;i,5;iO!!`Q,UO'#CqOOQ!LS'#Ct'#CtO!!sQWO'#CtO!!xOSO'#CxO!#fQ#tO,5;{O!#mQWO,5;}O!$yQWO'#FmO!%WQWO'#FnO!%]QWO'#FrO!&_Q&jO'#FvO!'QQ,UO'#IkOOQ!LS'#Ik'#IkO!'[QWO'#IjO!'jQWO'#IiOOQ!LS'#Cr'#CrOOQ!LS'#Cy'#CyO!'rQWO'#C{OIxQWO'#FeOIxQWO'#FgO!'wQWO'#FiO!'|QWO'#FjO!(RQWO'#FpOIxQWO'#FuO!(WQWO'#EXO!(oQWO,5;|O`QYO,5>TOOQQ'#Ie'#IeOOQQ,5>U,5>UOOQQ-E;i-E;iO!*kQ!LdO,5:QOOQ!LQ'#Co'#CoO!+[Q#tO,5<qOOQO'#Ce'#CeO!+mQWO'#CpO!+uQ!LYO'#IfO5RQWO'#IfO9{QWO,59WO!,TQpO,59WO!,]Q#tO,59WO5jQ#tO,59WO!,hQWO,5:qO!,pQWO'#GsO!,{QWO'#J_O)uQYO,5;fO!-TQ&jO,5;hO!-YQWO,5=^O!-_QWO,5=^O!-dQWO,5=^O5]Q!LYO,5=^O5eQWO,5<qO!-rQWO'#EYO!.TQ&jO'#EZOOQ!LQ'#I|'#I|O!.fQ!LYO'#J[O5]Q!LYO,5<uO7_QWO,5<{OOQO'#Cq'#CqO!.qQpO,5<xO!.yQ#tO,5<yO!/UQWO,5<{O!/ZQ`O,5=OO9{QWO'#GiO5eQWO'#GkO!/cQWO'#GkO5jQ#tO'#GnO!/hQWO'#GnOOQQ,5=R,5=RO!/mQWO'#GoO!/uQWO'#ClO!/zQWO,58}O!0UQWO,58}O!2TQYO,58}OOQQ,58},58}O!2bQ!LYO,58}O)uQYO,58}O!2mQYO'#GvOOQQ'#Gw'#GwOOQQ'#Gx'#GxO`QYO,5=`O!2}QWO,5=`O)uQYO'#DtO`QYO,5=fO`QYO,5=hO!3SQWO,5=jO`QYO,5=lO!3XQWO,5=oO!3^QYO,5=uOOQQ,5=y,5=yO)uQYO,5=yO5]Q!LYO,5={OOQQ,5=},5=}O!7[QWO,5=}OOQQ,5>P,5>PO!7[QWO,5>POOQQ,5>R,5>RO!7aQ`O,5?^OOOS-E;k-E;kOOQ!LS1G/Y1G/YO!7fQbO,5>YO)uQYO,5>YOOQO-E;l-E;lO!7pQWO,5?_O!7xQbO,5?_O!8PQWO,5?iOOQ!LS1G/_1G/_O!8XQpO'#DQOOQO'#Iu'#IuO)uQYO'#IuO!8vQpO'#IuO!9eQpO'#D_O!9vQ&jO'#D_O!<OQYO'#D_O!<VQWO'#ItO!<_QWO,59xO!<dQWO'#E[O!<rQWO'#JPO!<zQWO,5:uO!=bQ&jO'#D_O)uQYO,5?jO!=lQWO'#HsO!8PQWO,5?iOOQ!LQ1G0`1G0`O!>xQ&jO'#DxOOQ!LS,5:a,5:aO)uQYO,5:aOHiQWO,5:aO!?PQWO,5:aO9{QWO,5:pO!,TQpO,5:pO!,]Q#tO,5:pO5jQ#tO,5:pOOQ!LS1G/j1G/jOOQ!LS1G/z1G/zOOQ!LQ'#ER'#ERO)uQYO,5?gO!?[Q!LYO,5?gO!?mQ!LYO,5?gO!?tQWO,5?fO!?|QWO'#HuO!?tQWO,5?fOOQ!LQ1G0_1G0_O6tQWO,5?fOOQ!LS1G0]1G0]O!@hQ!LdO1G0]O!AXQ!LbO,5:nOOQ!LS'#Fl'#FlO!AuQ!LdO'#IkOFlQYO1G0]O!CtQ#tO'#IvO!DOQWO,5:SO!DTQbO'#IwO)uQYO'#IwO!D_QWO,5:XOOQ!LS'#DQ'#DQOOQ!LS'#Ea'#EaOOQ!LS1G0f1G0fO!DdQWO1G0fO!FuQ!LdO1G0hO!F|Q!LdO1G0hO!IaQ!LdO1G0hO!IhQ!LdO1G0hO!KoQ!LdO1G0hO!LSQ!LdO1G0hO!NsQ!LdO1G0hO!NzQ!LdO1G0hO##_Q!LdO1G0hO##fQ!LdO1G0hO#%ZQ!LdO1G0hO#(TQ7^O'#CgO#*OQ7^O1G0xO#+yQ7^O'#IqOOQ!LS1G1O1G1OO#,^Q!LdO,5>dOOQ!LQ-E;v-E;vO#,}Q!LdO1G0hOOQ!LS1G0h1G0hO#/PQ!LdO1G0{O#/pQpO,5;nO#/uQpO,5;oO#/zQpO'#FVO#0`QWO'#FUOOQO'#JT'#JTOOQO'#Hv'#HvO#0eQpO1G1WOOQ!LS1G1W1G1WOOOO1G1a1G1aO#0sQ7^O'#IpO#0}QWO,5;xOKmQYO,5;xOOOO-E;u-E;uOOQ!LS1G1T1G1TOOQ!LS,5;z,5;zO#1SQpO,5;zOOQ!LS,59`,59`OHiQWO'#ImOOOS'#Hl'#HlO#1XOSO,59dOOQ!LS,59d,59dO)uQYO1G1gO!'|QWO'#HzO#1dQWO,5<`OOQ!LS,5<],5<]OOQO'#GQ'#GQOIxQWO,5<kOOQO'#GS'#GSOIxQWO,5<mOIxQWO,5<oOOQO1G1i1G1iO#1oQ`O'#CoO#2SQ`O,5<XO#2ZQWO'#JWO5eQWO'#JWO#2iQWO,5<ZOIxQWO,5<YO#2nQ`O'#FlO#2{Q`O'#JXO#3VQWO'#JXOHiQWO'#JXO#3[QWO,5<^OOQ!LQ'#Dc'#DcO#3aQWO'#FoO#3lQpO'#FwO!&YQ&jO'#FwO!&YQ&jO'#FyO#3}QWO'#FzO!(RQWO'#F}OOQO'#H|'#H|O#4SQ&jO,5<bOOQ!LS,5<b,5<bO#4ZQ&jO'#FwO#4iQ&jO'#FxO#4qQ&jO'#FxOOQ!LS,5<p,5<pOIxQWO,5?UOIxQWO,5?UO#4vQWO'#H}O#5RQWO,5?TOOQ!LS'#Cg'#CgO#5uQ#tO,59gOOQ!LS,59g,59gO#6hQ#tO,5<PO#7ZQ#tO,5<RO#7eQWO,5<TOOQ!LS,5<U,5<UO#7jQWO,5<[O#7oQ#tO,5<aOFlQYO1G1hO#8PQWO1G1hOOQQ1G3o1G3oOOQ!LS1G/l1G/lOMjQWO1G/lOOQQ1G2]1G2]OHiQWO1G2]O)uQYO1G2]OHiQWO1G2]O#8UQWO1G2]O#8dQWO,59[O#9mQWO'#ESOOQ!LQ,5?Q,5?QO#9wQ!LYO,5?QOOQQ1G.r1G.rO9{QWO1G.rO!,TQpO1G.rO!,]Q#tO1G.rO#:VQWO1G0]O#:[QWO'#CgO#:gQWO'#J`O#:oQWO,5=_O#:tQWO'#J`O#:yQWO'#J`O#;OQWO'#IVO#;^QWO,5?yO#;fQbO1G1QOOQ!LS1G1S1G1SO5eQWO1G2xO#;mQWO1G2xO#;rQWO1G2xO#;wQWO1G2xOOQQ1G2x1G2xO#;|Q#tO1G2]O6tQWO'#I}O6tQWO'#E[O6tQWO'#IPO#<_Q!LYO,5?vOOQQ1G2a1G2aO!/UQWO1G2gOHiQWO1G2dO#<jQWO1G2dOOQQ1G2e1G2eOHiQWO1G2eO#<oQWO1G2eO#<wQ&jO'#GcOOQQ1G2g1G2gO!&YQ&jO'#IRO!/ZQ`O1G2jOOQQ1G2j1G2jOOQQ,5=T,5=TO#=PQ#tO,5=VO5eQWO,5=VO#3}QWO,5=YO5RQWO,5=YO!,TQpO,5=YO!,]Q#tO,5=YO5jQ#tO,5=YO#=bQWO'#J^O#=mQWO,5=ZOOQQ1G.i1G.iO#=rQ!LYO1G.iO#=}QWO1G.iO!'rQWO1G.iO5]Q!LYO1G.iO#>SQbO,5?{O#>^QWO,5?{O#>iQYO,5=bO#>pQWO,5=bO6tQWO,5?{OOQQ1G2z1G2zO`QYO1G2zOOQQ1G3Q1G3QOOQQ1G3S1G3SO9vQWO1G3UO#>uQYO1G3WO#BmQYO'#HVOOQQ1G3Z1G3ZO9{QWO1G3aO#BzQWO1G3aO5]Q!LYO1G3eOOQQ1G3g1G3gOOQ!LQ'#Fs'#FsO5]Q!LYO1G3iO5]Q!LYO1G3kOOOS1G4x1G4xO#CSQ`O,5<OO#C[QbO1G3tO#CfQWO1G4yO#CnQWO1G5TO#CvQWO,5?aOKmQYO,5:vO6tQWO,5:vO9{QWO,59yOKmQYO,59yO!,TQpO,59yO#C{Q7^O,59yOOQO,5:v,5:vO#DVQ&jO'#HoO#DmQWO,5?`OOQ!LS1G/d1G/dO#DuQ&jO'#HtO#EZQWO,5?kOOQ!LQ1G0a1G0aO!9vQ&jO,59yO#EcQbO1G5UOOQO,5>_,5>_O6tQWO,5>_OOQO-E;q-E;qOOQ!LQ'#EO'#EOO#EmQ!LrO'#EPO!>pQ&jO'#DyOOQO'#Hr'#HrO#FXQ&jO,5:dOOQ!LS,5:d,5:dO#F`Q&jO'#DyO#FqQ&jO'#DyO#FxQ&jO'#EPO#GVQ&jO'#EPO!>pQ&jO'#EPO#GjQWO1G/{O#GoQ`O1G/{OOQ!LS1G/{1G/{O)uQYO1G/{OHiQWO1G/{OOQ!LS1G0[1G0[O9{QWO1G0[O!,TQpO1G0[O!,]Q#tO1G0[O#GvQ!LdO1G5RO)uQYO1G5RO#HWQ!LYO1G5RO#HiQWO1G5QO6tQWO,5>aOOQO,5>a,5>aO#HqQWO,5>aOOQO-E;s-E;sO#HiQWO1G5QO#IPQ!LdO,59gO#KOQ!LdO,5<PO#MQQ!LdO,5<RO$ SQ!LdO,5<aOOQ!LS7+%w7+%wO$#[Q!LdO7+%wO$#{QWO'#HpO$$VQWO,5?bOOQ!LS1G/n1G/nO$$_QYO'#HqO$$lQWO,5?cO$$tQbO,5?cOOQ!LS1G/s1G/sOOQ!LS7+&Q7+&QO$%OQ7^O,5:YO)uQYO7+&dO$%YQ7^O,5:QOOQO1G1Y1G1YOOQO1G1Z1G1ZO$%gQMhO,5;qOKmQYO,5;pOOQO-E;t-E;tOOQ!LS7+&r7+&rOOOO7+&{7+&{OOOO1G1d1G1dO$%rQWO1G1dOOQ!LS1G1f1G1fO$%wQ`O,5?XOOOS-E;j-E;jOOQ!LS1G/O1G/OO$&OQ!LdO7+'ROOQ!LS,5>f,5>fO$&oQWO,5>fOOQ!LS1G1z1G1zP$&tQWO'#HzPOQ!LS-E;x-E;xO$'eQ#tO1G2VO$(WQ#tO1G2XO$(bQ#tO1G2ZOOQ!LS1G1s1G1sO$(iQWO'#HyO$(wQWO,5?rO$(wQWO,5?rO$)PQWO,5?rO$)[QWO,5?rOOQO1G1u1G1uO$)jQ#tO1G1tO$)zQWO'#H{O$*[QWO,5?sOHiQWO,5?sO$*dQ`O,5?sOOQ!LS1G1x1G1xO5]Q!LYO,5<cO5]Q!LYO,5<dO$*nQWO,5<dO#3xQWO,5<dO!,TQpO,5<cO$*sQWO,5<eO5]Q!LYO,5<fO$*nQWO,5<iOOQO-E;z-E;zOOQ!LS1G1|1G1|O!&YQ&jO,5<cO$*{QWO,5<dO!&YQ&jO,5<eO!&YQ&jO,5<dO$+WQ#tO1G4pO$+bQ#tO1G4pOOQO,5>i,5>iOOQO-E;{-E;{O!-TQ&jO,59iO)uQYO,59iO$+oQWO1G1oOIxQWO1G1vO$+tQ!LdO7+'SOOQ!LS7+'S7+'SOFlQYO7+'SOOQ!LS7+%W7+%WO$,eQ`O'#JYO#GjQWO7+'wO$,oQWO7+'wO$,wQ`O7+'wOOQQ7+'w7+'wOHiQWO7+'wO)uQYO7+'wOHiQWO7+'wOOQO1G.v1G.vO$-RQ!LbO'#CgO$-cQ!LbO,5<gO$.QQWO,5<gOOQ!LQ1G4l1G4lOOQQ7+$^7+$^O9{QWO7+$^O!,TQpO7+$^OFlQYO7+%wO$.VQWO'#IUO$.eQWO,5?zOOQO1G2y1G2yO5eQWO,5?zO$.eQWO,5?zO$.mQWO,5?zOOQO,5>q,5>qOOQO-E<T-E<TOOQ!LS7+&l7+&lO$.rQWO7+(dO5]Q!LYO7+(dO5eQWO7+(dO$.wQWO7+(dO$.|QWO7+'wOOQ!LQ,5>k,5>kOOQ!LQ-E;}-E;}OOQQ7+(R7+(RO$/[Q!LbO7+(OOHiQWO7+(OO$/fQ`O7+(POOQQ7+(P7+(POHiQWO7+(PO$/mQWO'#J]O$/xQWO,5<}OOQO,5>m,5>mOOQO-E<P-E<POOQQ7+(U7+(UO$0rQ&jO'#GlOOQQ1G2q1G2qOHiQWO1G2qO)uQYO1G2qOHiQWO1G2qO$0yQWO1G2qO$1XQ#tO1G2qO5]Q!LYO1G2tO#3}QWO1G2tO5RQWO1G2tO!,TQpO1G2tO!,]Q#tO1G2tO$1jQWO'#ITO$1uQWO,5?xO$1}Q&jO,5?xOOQ!LQ1G2u1G2uOOQQ7+$T7+$TO$2SQWO7+$TO5]Q!LYO7+$TO$2XQWO7+$TO)uQYO1G5gO)uQYO1G5hO$2^QYO1G2|O$2eQWO1G2|O$2jQYO1G2|O$2qQ!LYO1G5gOOQQ7+(f7+(fO5]Q!LYO7+(pO`QYO7+(rOOQQ'#Jc'#JcOOQQ'#IW'#IWO$2{QYO,5=qOOQQ,5=q,5=qO)uQYO'#HWO$3YQWO'#HYOOQQ7+({7+({O$3_QYO7+({O6tQWO7+({OOQQ7+)P7+)POOQQ7+)T7+)TOOQQ7+)V7+)VOOQO1G4{1G4{O$7YQ7^O1G0bO$7dQWO1G0bOOQO1G/e1G/eO$7oQ7^O1G/eO9{QWO1G/eOKmQYO'#D_OOQO,5>Z,5>ZOOQO-E;m-E;mOOQO,5>`,5>`OOQO-E;r-E;rO!,TQpO1G/eOOQO1G3y1G3yO9{QWO,5:eOOQO,5:k,5:kO)uQYO,5:kO$7yQ!LYO,5:kO$8UQ!LYO,5:kO!,TQpO,5:eOOQO-E;p-E;pOOQ!LS1G0O1G0OO!>pQ&jO,5:eO$8dQ&jO,5:eO$8uQ!LrO,5:kO$9aQ&jO,5:eO!>pQ&jO,5:kO$9hQ&jO,5:kO$9uQ!LYO,5:kOOQ!LS7+%g7+%gO#GjQWO7+%gO#GoQ`O7+%gOOQ!LS7+%v7+%vO9{QWO7+%vO!,TQpO7+%vO$:ZQ!LdO7+*mO)uQYO7+*mOOQO1G3{1G3{O6tQWO1G3{O$:kQWO7+*lO$:sQ!LdO1G2VO$<uQ!LdO1G2XO$>wQ!LdO1G1tO$APQ#tO,5>[OOQO-E;n-E;nO$AZQbO,5>]O)uQYO,5>]OOQO-E;o-E;oO$AeQWO1G4}O$AmQ7^O1G0]O$CtQ7^O1G0hO$C{Q7^O1G0hO$E|Q7^O1G0hO$FTQ7^O1G0hO$GxQ7^O1G0hO$H]Q7^O1G0hO$JjQ7^O1G0hO$JqQ7^O1G0hO$LrQ7^O1G0hO$LyQ7^O1G0hO$NnQ7^O1G0hO% RQ!LdO<<JOO% rQ7^O1G0hO%#bQ7^O'#IkO%%_Q7^O1G0{OKmQYO'#FXOOQO'#JU'#JUOOQO1G1]1G1]O%%lQWO1G1[O%%qQ7^O,5>dOOOO7+'O7+'OOOOS1G4s1G4sOOQ!LS1G4Q1G4QOIxQWO7+'uO%%{QWO,5>eO5eQWO,5>eOOQO-E;w-E;wO%&ZQWO1G5^O%&ZQWO1G5^O%&cQWO1G5^O%&nQ`O,5>gO%&xQWO,5>gOHiQWO,5>gOOQO-E;y-E;yO%&}Q`O1G5_O%'XQWO1G5_OOQO1G1}1G1}OOQO1G2O1G2OO5]Q!LYO1G2OO$*nQWO1G2OO5]Q!LYO1G1}O%'aQWO1G2POHiQWO1G2POOQO1G2Q1G2QO5]Q!LYO1G2TO!,TQpO1G1}O#3xQWO1G2OO%'fQWO1G2PO%'nQWO1G2OOIxQWO7+*[OOQ!LS1G/T1G/TO%'yQWO1G/TOOQ!LS7+'Z7+'ZO%(OQ#tO7+'bO%(`Q!LdO<<JnOOQ!LS<<Jn<<JnOHiQWO'#IOO%)PQWO,5?tOOQQ<<Kc<<KcOHiQWO<<KcO#GjQWO<<KcO%)XQWO<<KcO%)aQ`O<<KcOHiQWO1G2ROOQQ<<Gx<<GxO9{QWO<<GxO%)kQ!LdO<<IcOOQ!LS<<Ic<<IcOOQO,5>p,5>pO%*[QWO,5>pO#:yQWO,5>pOOQO-E<S-E<SO%*aQWO1G5fO%*aQWO1G5fO5eQWO1G5fO%*iQWO<<LOOOQQ<<LO<<LOO%*nQWO<<LOO5]Q!LYO<<LOO)uQYO<<KcOHiQWO<<KcOOQQ<<Kj<<KjO$/[Q!LbO<<KjOOQQ<<Kk<<KkO$/fQ`O<<KkO%*sQ&jO'#IQO%+OQWO,5?wOKmQYO,5?wOOQQ1G2i1G2iO#EmQ!LrO'#EPO!>pQ&jO'#GmOOQO'#IS'#ISO%+WQ&jO,5=WOOQQ,5=W,5=WO%+_Q&jO'#EPO%+jQ&jO'#EPO%,RQ&jO'#EPO%,]Q&jO'#GmO%,nQWO7+(]O%,sQWO7+(]O%,{Q`O7+(]OOQQ7+(]7+(]OHiQWO7+(]O)uQYO7+(]OHiQWO7+(]O%-VQWO7+(]OOQQ7+(`7+(`O5]Q!LYO7+(`O#3}QWO7+(`O5RQWO7+(`O!,TQpO7+(`O%-eQWO,5>oOOQO-E<R-E<ROOQO'#Gp'#GpO%-pQWO1G5dO5]Q!LYO<<GoOOQQ<<Go<<GoO%-xQWO<<GoO%-}QWO7++RO%.SQWO7++SOOQQ7+(h7+(hO%.XQWO7+(hO%.^QYO7+(hO%.eQWO7+(hO)uQYO7++RO)uQYO7++SOOQQ<<L[<<L[OOQQ<<L^<<L^OOQQ-E<U-E<UOOQQ1G3]1G3]O%.jQWO,5=rOOQQ,5=t,5=tO9{QWO<<LgO%.oQWO<<LgOKmQYO7+%|OOQO7+%P7+%PO%.tQ7^O1G5UO9{QWO7+%POOQO1G0P1G0PO%/OQ!LdO1G0VOOQO1G0V1G0VO)uQYO1G0VO%/YQ!LYO1G0VO9{QWO1G0PO!,TQpO1G0PO!>pQ&jO1G0PO%/eQ!LYO1G0VO%/sQ&jO1G0PO%0UQ!LYO1G0VO%0jQ!LrO1G0VO%0tQ&jO1G0PO!>pQ&jO1G0VOOQ!LS<<IR<<IROOQ!LS<<Ib<<IbO9{QWO<<IbO%0{Q!LdO<<NXOOQO7+)g7+)gO%1]Q!LdO7+'bO%3eQbO1G3wO%3oQ7^O7+%wO%3|Q7^O,59gO%5yQ7^O,5<PO%7vQ7^O,5<RO%9sQ7^O,5<aO%;cQ7^O7+'RO%;pQ7^O7+'SO%;}QWO,5;sOOQO7+&v7+&vO%<SQ#tO<<KaOOQO1G4P1G4PO%<dQWO1G4PO%<oQWO1G4PO%<}QWO7+*xO%<}QWO7+*xOHiQWO1G4RO%=VQ`O1G4RO%=aQWO7+*yOOQO7+'j7+'jO5]Q!LYO7+'jOOQO7+'i7+'iO$*nQWO7+'kO%=iQ`O7+'kOOQO7+'o7+'oO5]Q!LYO7+'iO$*nQWO7+'jO%=pQWO7+'kOHiQWO7+'kO#3xQWO7+'jO%=uQ#tO<<MvOOQ!LS7+$o7+$oO%>PQ`O,5>jOOQO-E;|-E;|O#GjQWOAN@}OOQQAN@}AN@}OHiQWOAN@}O%>ZQ!LbO7+'mOOQQAN=dAN=dO5eQWO1G4[OOQO1G4[1G4[O%>hQWO1G4[O%>mQWO7++QO%>mQWO7++QO5]Q!LYOANAjO%>uQWOANAjOOQQANAjANAjO%>zQWOAN@}O%?SQ`OAN@}OOQQANAUANAUOOQQANAVANAVO%?^QWO,5>lOOQO-E<O-E<OO%?iQ7^O1G5cO#3}QWO,5=XO5RQWO,5=XO!,TQpO,5=XOOQO-E<Q-E<QOOQQ1G2r1G2rO$8uQ!LrO,5:kO!>pQ&jO,5=XO%?sQ&jO,5=XO%@UQ&jO,5:kOOQQ<<Kw<<KwOHiQWO<<KwO%,nQWO<<KwO%@`QWO<<KwO%@hQ`O<<KwO)uQYO<<KwOHiQWO<<KwOOQQ<<Kz<<KzO5]Q!LYO<<KzO#3}QWO<<KzO5RQWO<<KzO%@rQ&jO1G4ZO%@wQWO7++OOOQQAN=ZAN=ZO5]Q!LYOAN=ZOOQQ<<Nm<<NmOOQQ<<Nn<<NnOOQQ<<LS<<LSO%APQWO<<LSO%AUQYO<<LSO%A]QWO<<NmO%AbQWO<<NnOOQQ1G3^1G3^OOQQANBRANBRO9{QWOANBRO%AgQ7^O<<IhOOQO<<Hk<<HkOOQO7+%q7+%qO%/OQ!LdO7+%qO)uQYO7+%qOOQO7+%k7+%kO9{QWO7+%kO!,TQpO7+%kO%AqQ!LYO7+%qO!>pQ&jO7+%kO%A|Q!LYO7+%qO%B[Q&jO7+%kO%BmQ!LYO7+%qOOQ!LSAN>|AN>|O%CRQ!LdO<<KaO%EZQ7^O<<JOO%EhQ7^O1G1tO%GWQ7^O1G2VO%ITQ7^O1G2XO%KQQ7^O<<JnO%K_Q7^O<<IcOOQO1G1_1G1_OOQO7+)k7+)kO%KlQWO7+)kO%KwQWO<<NdO%LPQ`O7+)mOOQO<<KU<<KUO5]Q!LYO<<KVO$*nQWO<<KVOOQO<<KT<<KTO5]Q!LYO<<KUO%LZQ`O<<KVO$*nQWO<<KUOOQQG26iG26iO#GjQWOG26iOOQO7+)v7+)vO5eQWO7+)vO%LbQWO<<NlOOQQG27UG27UO5]Q!LYOG27UOHiQWOG26iOKmQYO1G4WO%LjQWO7+*}O5]Q!LYO1G2sO#3}QWO1G2sO5RQWO1G2sO!,TQpO1G2sO!>pQ&jO1G2sO%0jQ!LrO1G0VO%LrQ&jO1G2sO%,nQWOANAcOOQQANAcANAcOHiQWOANAcO%MTQWOANAcO%M]Q`OANAcOOQQANAfANAfO5]Q!LYOANAfO#3}QWOANAfOOQO'#Gq'#GqOOQO7+)u7+)uOOQQG22uG22uOOQQANAnANAnO%MgQWOANAnOOQQANDXANDXOOQQANDYANDYO%MlQYOG27mOOQO<<I]<<I]O%/OQ!LdO<<I]OOQO<<IV<<IVO9{QWO<<IVO)uQYO<<I]O!,TQpO<<IVO&#gQ!LYO<<I]O!>pQ&jO<<IVO&#rQ!LYO<<I]O&$QQ7^O7+'bOOQO<<MV<<MVOOQOAN@qAN@qO5]Q!LYOAN@qOOQOAN@pAN@pO$*nQWOAN@qO5]Q!LYOAN@pOOQQLD,TLD,TOOQO<<Mb<<MbOOQQLD,pLD,pO#GjQWOLD,TO&%pQ7^O7+)rOOQO7+(_7+(_O5]Q!LYO7+(_O#3}QWO7+(_O5RQWO7+(_O!,TQpO7+(_O!>pQ&jO7+(_OOQQG26}G26}O%,nQWOG26}OHiQWOG26}OOQQG27QG27QO5]Q!LYOG27QOOQQG27YG27YO9{QWOLD-XOOQOAN>wAN>wOOQOAN>qAN>qO%/OQ!LdOAN>wO9{QWOAN>qO)uQYOAN>wO!,TQpOAN>qO&%zQ!LYOAN>wO&&VQ7^O<<KaOOQOG26]G26]O5]Q!LYOG26]OOQOG26[G26[OOQQ!$( o!$( oOOQO<<Ky<<KyO5]Q!LYO<<KyO#3}QWO<<KyO5RQWO<<KyO!,TQpO<<KyOOQQLD,iLD,iO%,nQWOLD,iOOQQLD,lLD,lOOQQ!$(!s!$(!sOOQOG24cG24cOOQOG24]G24]O%/OQ!LdOG24cO9{QWOG24]O)uQYOG24cOOQOLD+wLD+wOOQOANAeANAeO5]Q!LYOANAeO#3}QWOANAeO5RQWOANAeOOQQ!$(!T!$(!TOOQOLD)}LD)}OOQOLD)wLD)wO%/OQ!LdOLD)}OOQOG27PG27PO5]Q!LYOG27PO#3}QWOG27POOQO!$'Mi!$'MiOOQOLD,kLD,kO5]Q!LYOLD,kOOQO!$(!V!$(!VOKmQYO'#DnO&'uQbO'#IpOKmQYO'#DfO&'|Q!LdO'#CgO&(gQbO'#CgO&(wQYO,5:qOKmQYO,5:|OKmQYO,5:|OKmQYO,5:|OKmQYO,5:|OKmQYO,5:|OKmQYO,5:|OKmQYO,5:|OKmQYO,5:|OKmQYO,5:|OKmQYO,5:|OKmQYO,5:|OKmQYO'#HxO&*tQWO,5<OO&,WQWO,5:|OKmQYO,5;aO!'rQWO'#C{O!'rQWO'#C{OHiQWO'#FeO&*|QWO'#FeOHiQWO'#FgO&*|QWO'#FgOHiQWO'#FuO&*|QWO'#FuOKmQYO,5?jO&(wQYO1G0]O&,_Q7^O'#CgOKmQYO1G1gOHiQWO,5<kO&*|QWO,5<kOHiQWO,5<mO&*|QWO,5<mOHiQWO,5<YO&*|QWO,5<YO&(wQYO1G1hOKmQYO7+&dOHiQWO1G1vO&*|QWO1G1vO&(wQYO7+'SO&(wQYO7+%wOHiQWO7+'uO&*|QWO7+'uO&,iQWO'#EVO&,nQWO'#EVO&,vQWO'#EuO&,{QWO'#JOO&-WQWO'#I|O&-cQWO,5:qO&-hQ#tO,5;{O&-oQWO'#FnO&-tQWO'#FnO&-yQWO,5;|O&.RQWO,5:qO&.ZQ7^O1G0xO&.bQWO,5<[O&.gQWO,5<[O&.lQWO1G1hO&.qQWO1G0]O&.vQ#tO1G2ZO&.}Q#tO1G2ZO3tQWO'#FcO5RQWO'#FbOB`QWO'#EUOKmQYO,5;^O!(RQWO'#FpO!(RQWO'#FpOIxQWO,5<oOIxQWO,5<o",
  stateData: "&/z~O'SOS'TOSSOSTOS~OPTOQTOWwO]bO^gOamOblOgbOiTOjbOkbOnTOpTOuROwbOxbOybO!PSO!ZjO!`UO!cTO!dTO!eTO!fTO!gTO!jkO#_qO#onO#s]O$zoO$|rO%OpO%PpO%SsO%UtO%XuO%YuO%[vO%ixO%oyO%qzO%s{O%u|O%x}O&O!OO&S!PO&U!QO&W!RO&Y!SO&[!TO'VPO'`QO'y`O~OPZXYZX^ZXiZXrZXsZXuZX}ZX!]ZX!^ZX!`ZX!fZX!wZX#RcX#VZX#WZX#XZX#YZX#ZZX#[ZX#]ZX#^ZX#`ZX#bZX#dZX#eZX#jZX'QZX'`ZX'mZX'tZX'uZX~O!X$gX~P$wO&}!VO'O!UO'P!XO~OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOnTOpTOuROwbOxbOybO!P!`O!ZjO!`UO!cTO!dTO!eTO!fTO!gTO!j!fO#o!iO#s]O'V!YO'`QO'y`O~O|!^O}!ZOz'gPz'qP~P'aO!O!jO~P`OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOnTOpTOuROwbOxbOybO!P!`O!ZjO!`UO!cTO!dTO!eTO!fTO!gTO!j!fO#o!iO#s]O'V9SO'`QO'y`O~OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOnTOpTOuROwbOxbOybO!P!`O!ZjO!`UO!cTO!dTO!eTO!fTO!gTO!j!fO#o!iO#s]O'`QO'y`O~O|!oO#P!rO#Q!oO'V9TO!_'nP~P+rO#R!sO~O!X!tO#R!sO~OP#ZOY#aOi#OOr!xOs!xOu!yO}#_O!]#QO!^!vO!`!wO!f#ZO#V!|O#W!}O#X!}O#Y!}O#Z#PO#[#QO#]#QO#^#QO#`#RO#b#TO#d#VO#e#WO'`QO'm#XO't!zO'u!{O~O^'dX'Q'dX!_'dXz'dX!P'dX${'dX!X'dX~P.^O!w#bO#j#bOP'eXY'eX^'eXi'eXr'eXs'eXu'eX}'eX!]'eX!^'eX!`'eX!f'eX#V'eX#W'eX#X'eX#Y'eX#Z'eX#['eX#^'eX#`'eX#b'eX#d'eX#e'eX'`'eX'm'eX't'eX'u'eX~O#]'eX'Q'eXz'eX!_'eX'b'eX!P'eX${'eX!X'eX~P0nO!w#bO~O#u#cO#|#gO~O!P#hO#s]O$P#iO$R#kO~O]#nOg#{Oi#oOj#nOk#nOn#|Op#}Ou#uO!P#vO!Z$SO!`#sO#Q$TO#o$QO$Y$OO$[$PO$_$RO'V#mO'`#pO'Z']P~O!`$UO~O!X$WO~O^$XO'Q$XO~O'V$]O~O!`$UO'V$]O'W$_O'[$`O~Ob$fO!`$UO'V$]O~O]$oOr$kO!P$hO!`$jO$|$nO'V$]O'W$_O[(RP~O!j$pO~Ou$qO!P$rO'V$]O~Ou$qO!P$rO%U$vO'V$]O~O'V$wO~O#_qO$|rO%OpO%PpO%SsO%UtO%XuO%YuO~Oa%QOb%PO!j$}O$z%OO%^$|O~P7dOa%TOblO!P%SO!jkO#_qO$zoO%OpO%PpO%SsO%UtO%XuO%YuO%[vO~O_%WO!w%ZO$|%UO'W$_O~P8cO!`%[O!c%`O~O!`%aO~O!PSO~O^$XO&|%iO'Q$XO~O^$XO&|%lO'Q$XO~O^$XO&|%nO'Q$XO~O&}!VO'O!UO'P%rO~OPZXYZXiZXrZXsZXuZX}ZX}cX!]ZX!^ZX!`ZX!fZX!wZX!wcX#RcX#VZX#WZX#XZX#YZX#ZZX#[ZX#]ZX#^ZX#`ZX#bZX#dZX#eZX#jZX'`ZX'mZX'tZX'uZX~OzZXzcX~P;OO|%tOz&bX}&bX~P)uO}!ZOz'gX~OP#ZOY#aOi#OOr!xOs!xOu!yO}!ZO!]#QO!^!vO!`!wO!f#ZO#V!|O#W!}O#X!}O#Y!}O#Z#PO#[#QO#]#QO#^#QO#`#RO#b#TO#d#VO#e#WO'`QO'm#XO't!zO'u!{O~Oz'gX~P=uOz%yO~Ou%|O!S&WO!T&PO!U&PO'W$_O~O]%}Oj%}O|&QO'c%zO!O'hP!O'sP~P?xOz'pX}'pX!X'pX!_'pX'm'pX~O!w'pX#R!zX!O'pX~P@qO!w&XOz'rX}'rX~O}&YOz'qX~Oz&[O~O!w#bO~P@qOR&`O!P&]O!k&_O'V$]O~Ob&eO!`$UO'V$]O~Or$kO!`$jO~O!O&fO~P`Or!xOs!xOu!yO!^!vO!`!wO'`QOP!baY!bai!ba}!ba!]!ba!f!ba#V!ba#W!ba#X!ba#Y!ba#Z!ba#[!ba#]!ba#^!ba#`!ba#b!ba#d!ba#e!ba'm!ba't!ba'u!ba~O^!ba'Q!baz!ba!_!ba'b!ba!P!ba${!ba!X!ba~PBzO!_&gO~O!X!tO!w&iO'm&hO}'oX^'oX'Q'oX~O!_'oX~PEdO}&mO!_'nX~O!_&oO~Ou$qO!P$rO#Q&pO'V$]O~OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOnTOpTOuROwbOxbOybO!PSO!ZjO!`UO!cTO!dTO!eTO!fTO!gTO!j!fO#o!iO#s]O'V9SO'`QO'y`O~O]#nOg#{Oi#oOj#nOk#nOn#|Op9fOu#uO!P#vO!Z:hO!`#sO#Q9lO#o$QO$Y9hO$[9jO$_$RO'V&tO'`#pO~O#R&vO~O]#nOg#{Oi#oOj#nOk#nOn#|Op#}Ou#uO!P#vO!Z$SO!`#sO#Q$TO#o$QO$Y$OO$[$PO$_$RO'V&tO'`#pO~O'Z'jP~PIxO|&zO!_'kP~P)uO'c&|O'l&}O~OP9POQ9PO]bOa:fOb!gOgbOi9POjbOkbOn9POp9POuROwbOxbOybO!P!`O!Z9RO!`UO!c9PO!d9PO!e9PO!f9PO!g9PO!j!fO#o!iO#s]O'V']O'`QO'y:dO~O!`!wO~O}#_O^$Wa'Q$Wa!_$Waz$Wa!P$Wa${$Wa!X$Wa~O#_'dO~PHiO!X'fO!P'vX#r'vX#u'vX#|'vX~Or'gO~PNbOr'gO!P'vX#r'vX#u'vX#|'vX~O!P'iO#r'mO#u'hO#|'nO~O|'qO~PKmO#u#cO#|'tO~Or$`Xu$`X!^$`X'm$`X't$`X'u$`X~OReX}eX!weX'ZeX'Z$`X~P! zOj'vO~O&}'xO'O'wO'P'zO~Or'|Ou'}O'm#XO't(PO'u(RO~O'Z'{O~P!#TO'Z(UO~O]#nOg#{Oi#oOj#nOk#nOn#|Op9fOu#uO!P#vO!Z:hO!`#sO#Q9lO#o$QO$Y9hO$[9jO$_$RO'`#pO~O|(YO'V(VO!_'zP~P!#rO#R([O~O|(`O'V(]Oz'{P~P!#rO^(iOi(nOu(fO!S(lO!T(eO!U(eO!`(cO!t(mO$r(hO'W$_O'c(bO~O!O(kO~P!%jO!^!vOr'_Xu'_X'm'_X't'_X'u'_X}'_X!w'_X~O'Z'_X#h'_X~P!&fOR(qO!w(pO}'^X'Z'^X~O}(rO'Z']X~O'V(tO~O!`(yO~O'V&tO~O!`(cO~Ou$qO|!oO!P$rO#P!rO#Q!oO'V$]O!_'nP~O!X!tO#R(}O~OP#ZOY#aOi#OOr!xOs!xOu!yO!]#QO!^!vO!`!wO!f#ZO#V!|O#W!}O#X!}O#Y!}O#Z#PO#[#QO#]#QO#^#QO#`#RO#b#TO#d#VO#e#WO'`QO'm#XO't!zO'u!{O~O^!Ya}!Ya'Q!Yaz!Ya!_!Ya'b!Ya!P!Ya${!Ya!X!Ya~P!(wOR)VO!P&]O!k)UO${)TO'[$`O~O'V$wO'Z']P~O!X)YO!P'YX^'YX'Q'YX~O!`$UO'[$`O~O!`$UO'V$]O'[$`O~O!X!tO#R&vO~O$|)fO'V)bO!O(SP~O})gO[(RX~O'c&|O~OY)kO~O[)lO~O!P$hO'V$]O'W$_O[(RP~Ou$qO|)qO!P$rO'V$]Oz'qP~O]&TOj&TO|)rO'c&|O!O'sP~O})sO^(OX'Q(OX~O!w)wO'[$`O~OR)zO!P#vO'[$`O~O!P)|O~Or*OO!PSO~O!j*TO~Ob*YO~O'V(tO!O(QP~Ob$fO~O$|rO'V$wO~P8cOY*`O[*_O~OPTOQTO]bOamOblOgbOiTOjbOkbOnTOpTOuROwbOxbOybO!ZjO!`UO!cTO!dTO!eTO!fTO!gTO!jkO#s]O$zoO'`QO'y`O~O!P!`O#o!iO'V9SO~P!0^O[*_O^$XO'Q$XO~O^*dO#_*fO%O*fO%P*fO~P)uO!`%[O~O%o*kO~O!P*mO~O&P*pO&Q*oOP%}aQ%}aW%}a]%}a^%}aa%}ab%}ag%}ai%}aj%}ak%}an%}ap%}au%}aw%}ax%}ay%}a!P%}a!Z%}a!`%}a!c%}a!d%}a!e%}a!f%}a!g%}a!j%}a#_%}a#o%}a#s%}a$z%}a$|%}a%O%}a%P%}a%S%}a%U%}a%X%}a%Y%}a%[%}a%i%}a%o%}a%q%}a%s%}a%u%}a%x%}a&O%}a&S%}a&U%}a&W%}a&Y%}a&[%}a&{%}a'V%}a'`%}a'y%}a!O%}a%v%}a_%}a%{%}a~O'V*sO~O'b*vO~Oz&ba}&ba~P!(wO}!ZOz'ga~Oz'ga~P=uO}&YOz'qa~O}tX}!VX!OtX!O!VX!XtX!X!VX!`!VX!wtX'[!VX~O!X*}O!w*|O}#OX}'iX!O#OX!O'iX!X'iX!`'iX'['iX~O!X+PO!`$UO'[$`O}!RX!O!RX~O]%{Oj%{Ou%|O'c(bO~OP9POQ9PO]bOa:fOb!gOgbOi9POjbOkbOn9POp9POuROwbOxbOybO!P!`O!Z9RO!`UO!c9PO!d9PO!e9PO!f9PO!g9PO!j!fO#o!iO#s]O'`QO'y:dO~O'V9pO~P!:UO}+TO!O'hX~O!O+VO~O!X*}O!w*|O}#OX!O#OX~O}+WO!O'sX~O!O+YO~O]%{Oj%{Ou%|O'W$_O'c(bO~O!T+ZO!U+ZO~P!=POu$qO|+^O!P$rO'V$]Oz&gX}&gX~O^+cO!S+fO!T+bO!U+bO!n+iO!o+hO!p+hO!q+gO!t+jO'W$_O'c(bO'l+`O~O!O+eO~P!>QOR+oO!P&]O!k+nO~O!w+uO}'oa!_'oa^'oa'Q'oa~O!X!tO~P!?[O}&mO!_'na~Ou$qO|+xO!P$rO#P+zO#Q+xO'V$]O}&iX!_&iX~O^!yi}!yi'Q!yiz!yi!_!yi'b!yi!P!yi${!yi!X!yi~P!(wO#R!va}!va!_!va!w!va!P!va^!va'Q!vaz!va~P!#TO#R'_XP'_XY'_X^'_Xi'_Xs'_X!]'_X!`'_X!f'_X#V'_X#W'_X#X'_X#Y'_X#Z'_X#['_X#]'_X#^'_X#`'_X#b'_X#d'_X#e'_X'Q'_X'`'_X!_'_Xz'_X!P'_X'b'_X${'_X!X'_X~P!&fO},TO'Z'jX~P!#TO'Z,VO~O},WO!_'kX~P!(wO!_,ZO~Oz,[O~OP#ZOr!xOs!xOu!yO!^!vO!`!wO!f#ZO'`QOY#Ui^#Uii#Ui}#Ui!]#Ui#W#Ui#X#Ui#Y#Ui#Z#Ui#[#Ui#]#Ui#^#Ui#`#Ui#b#Ui#d#Ui#e#Ui'Q#Ui'm#Ui't#Ui'u#Uiz#Ui!_#Ui'b#Ui!P#Ui${#Ui!X#Ui~O#V#Ui~P!DiO#V!|O~P!DiOP#ZOr!xOs!xOu!yO!^!vO!`!wO!f#ZO#V!|O#W!}O#X!}O#Y!}O'`QOY#Ui^#Ui}#Ui!]#Ui#Z#Ui#[#Ui#]#Ui#^#Ui#`#Ui#b#Ui#d#Ui#e#Ui'Q#Ui'm#Ui't#Ui'u#Uiz#Ui!_#Ui'b#Ui!P#Ui${#Ui!X#Ui~Oi#Ui~P!GTOi#OO~P!GTOP#ZOi#OOr!xOs!xOu!yO!^!vO!`!wO!f#ZO#V!|O#W!}O#X!}O#Y!}O#Z#PO'`QO^#Ui}#Ui#`#Ui#b#Ui#d#Ui#e#Ui'Q#Ui'm#Ui't#Ui'u#Uiz#Ui!_#Ui'b#Ui!P#Ui${#Ui!X#Ui~OY#Ui!]#Ui#[#Ui#]#Ui#^#Ui~P!IoOY#aO!]#QO#[#QO#]#QO#^#QO~P!IoOP#ZOY#aOi#OOr!xOs!xOu!yO!]#QO!^!vO!`!wO!f#ZO#V!|O#W!}O#X!}O#Y!}O#Z#PO#[#QO#]#QO#^#QO#`#RO'`QO^#Ui}#Ui#b#Ui#d#Ui#e#Ui'Q#Ui'm#Ui'u#Uiz#Ui!_#Ui'b#Ui!P#Ui${#Ui!X#Ui~O't#Ui~P!LgO't!zO~P!LgOP#ZOY#aOi#OOr!xOs!xOu!yO!]#QO!^!vO!`!wO!f#ZO#V!|O#W!}O#X!}O#Y!}O#Z#PO#[#QO#]#QO#^#QO#`#RO#b#TO'`QO't!zO^#Ui}#Ui#d#Ui#e#Ui'Q#Ui'm#Uiz#Ui!_#Ui'b#Ui!P#Ui${#Ui!X#Ui~O'u#Ui~P# RO'u!{O~P# ROP#ZOY#aOi#OOr!xOs!xOu!yO!]#QO!^!vO!`!wO!f#ZO#V!|O#W!}O#X!}O#Y!}O#Z#PO#[#QO#]#QO#^#QO#`#RO#b#TO#d#VO'`QO't!zO'u!{O~O^#Ui}#Ui#e#Ui'Q#Ui'm#Uiz#Ui!_#Ui'b#Ui!P#Ui${#Ui!X#Ui~P##mOPZXYZXiZXrZXsZXuZX!]ZX!^ZX!`ZX!fZX!wZX#RcX#VZX#WZX#XZX#YZX#ZZX#[ZX#]ZX#^ZX#`ZX#bZX#dZX#eZX#jZX'`ZX'mZX'tZX'uZX}ZX!OZX~O#hZX~P#&QOP#ZOY9dOi9XOr!xOs!xOu!yO!]9ZO!^!vO!`!wO!f#ZO#V9VO#W9WO#X9WO#Y9WO#Z9YO#[9ZO#]9ZO#^9ZO#`9[O#b9^O#d9`O#e9aO'`QO'm#XO't!zO'u!{O~O#h,^O~P#([OP'eXY'eXi'eXr'eXs'eXu'eX!]'eX!^'eX!`'eX!f'eX#V'eX#W'eX#X'eX#Y'eX#Z'eX#['eX#^'eX#`'eX#b'eX#d'eX#e'eX'`'eX'm'eX't'eX'u'eX}'eX~O!w9eO#j9eO#]'eX#h'eX!O'eX~P#*VO^&la}&la'Q&la!_&la'b&laz&la!P&la${&la!X&la~P!(wOP#UiY#Ui^#Uii#Uis#Ui}#Ui!]#Ui!^#Ui!`#Ui!f#Ui#V#Ui#W#Ui#X#Ui#Y#Ui#Z#Ui#[#Ui#]#Ui#^#Ui#`#Ui#b#Ui#d#Ui#e#Ui'Q#Ui'`#Uiz#Ui!_#Ui'b#Ui!P#Ui${#Ui!X#Ui~P!#TO^#ii}#ii'Q#iiz#ii!_#ii'b#ii!P#ii${#ii!X#ii~P!(wO#u,`O~O#u,aO~O!X'fO!w,bO!P#yX#r#yX#u#yX#|#yX~O|,cO~O!P'iO#r,eO#u'hO#|,fO~O}9bO!O'dX~P#([O!O,gO~O#|,iO~O&}'xO'O'wO'P,lO~O],oOj,oOz,pO~O}cX!XcX!_cX!_$`X'mcX~P! zO!_,vO~P!#TO},wO!X!tO'm&hO!_'zX~O!_,|O~Oz$`X}$`X!X$gX~P! zO}-OOz'{X~P!#TO!X-QO~Oz-SO~O|(YO'V$]O!_'zP~Oi-WO!X!tO!`$UO'[$`O'm&hO~O!X)YO~O!O-^O~P!%jO!T-_O!U-_O'W$_O'c(bO~Ou-aO'c(bO~O!t-bO~O'V$wO}&qX'Z&qX~O}(rO'Z']a~Or-gOs-gOu-hO'moa'toa'uoa}oa!woa~O'Zoa#hoa~P#5ZOr'|Ou'}O'm$Xa't$Xa'u$Xa}$Xa!w$Xa~O'Z$Xa#h$Xa~P#6POr'|Ou'}O'm$Za't$Za'u$Za}$Za!w$Za~O'Z$Za#h$Za~P#6rO]-iO~O#R-jO~O'Z$ia}$ia#h$ia!w$ia~P!#TO#R-mO~OR-vO!P&]O!k-uO${-tO~O'Z-wO~O]#nOi#oOj#nOk#nOn#|Op9fOu#uO!P#vO!Z:hO!`#sO#Q9lO#o$QO$Y9hO$[9jO$_$RO'`#pO~Og-yO'V-xO~P#8iO!X)YO!P'Ya^'Ya'Q'Ya~O#R.PO~OYZX}cX!OcX~O}.QO!O(SX~O!O.SO~OY.TO~O'V)bO~O!P$hO'V$]O[&yX}&yX~O})gO[(Ra~O!_.YO~P!(wO].[O~OY.]O~O[.^O~OR-vO!P&]O!k-uO${-tO'[$`O~O})sO^(Oa'Q(Oa~O!w.dO~OR.gO!P#vO~O'c&|O!O(PP~OR.qO!P.mO!k.pO${.oO'[$`O~OY.{O}.yO!O(QX~O!O.|O~O[/OO^$XO'Q$XO~O]/PO~O#]/RO%m/SO~P0nO!w#bO#]/RO%m/SO~O^/TO~P)uO^/VO~O%v/ZOP%tiQ%tiW%ti]%ti^%tia%tib%tig%tii%tij%tik%tin%tip%tiu%tiw%tix%tiy%ti!P%ti!Z%ti!`%ti!c%ti!d%ti!e%ti!f%ti!g%ti!j%ti#_%ti#o%ti#s%ti$z%ti$|%ti%O%ti%P%ti%S%ti%U%ti%X%ti%Y%ti%[%ti%i%ti%o%ti%q%ti%s%ti%u%ti%x%ti&O%ti&S%ti&U%ti&W%ti&Y%ti&[%ti&{%ti'V%ti'`%ti'y%ti!O%ti_%ti%{%ti~O_/aO!O/_O%{/`O~P`O!PSO!`/dO~O}#_O'b$Wa~Oz&bi}&bi~P!(wO}!ZOz'gi~O}&YOz'qi~Oz/hO~O}!Ra!O!Ra~P#([O]%{Oj%{O|/nO'c(bO}&cX!O&cX~P?xO}+TO!O'ha~O]&TOj&TO|)rO'c&|O}&hX!O&hX~O}+WO!O'sa~Oz'ri}'ri~P!(wO^$XO!X!tO!`$UO!f/yO!w/wO'Q$XO'[$`O'm&hO~O!O/|O~P!>QO!T/}O!U/}O'W$_O'c(bO'l+`O~O!S0OO~P#F`O!S0OO!q0QO!t0RO~P#F`O!S0OO!o0SO!p0SO!q0QO!t0RO~P#F`O!P&]O~O!P&]O~P!#TO}'oi!_'oi^'oi'Q'oi~P!(wO!w0]O}'oi!_'oi^'oi'Q'oi~O}&mO!_'ni~Ou$qO!P$rO#Q0_O'V$]O~O#RoaPoaYoa^oaioa!]oa!^oa!`oa!foa#Voa#Woa#Xoa#Yoa#Zoa#[oa#]oa#^oa#`oa#boa#doa#eoa'Qoa'`oa!_oazoa!Poa'boa${oa!Xoa~P#5ZO#R$XaP$XaY$Xa^$Xai$Xas$Xa!]$Xa!^$Xa!`$Xa!f$Xa#V$Xa#W$Xa#X$Xa#Y$Xa#Z$Xa#[$Xa#]$Xa#^$Xa#`$Xa#b$Xa#d$Xa#e$Xa'Q$Xa'`$Xa!_$Xaz$Xa!P$Xa'b$Xa${$Xa!X$Xa~P#6PO#R$ZaP$ZaY$Za^$Zai$Zas$Za!]$Za!^$Za!`$Za!f$Za#V$Za#W$Za#X$Za#Y$Za#Z$Za#[$Za#]$Za#^$Za#`$Za#b$Za#d$Za#e$Za'Q$Za'`$Za!_$Zaz$Za!P$Za'b$Za${$Za!X$Za~P#6rO#R$iaP$iaY$ia^$iai$ias$ia}$ia!]$ia!^$ia!`$ia!f$ia#V$ia#W$ia#X$ia#Y$ia#Z$ia#[$ia#]$ia#^$ia#`$ia#b$ia#d$ia#e$ia'Q$ia'`$ia!_$iaz$ia!P$ia!w$ia'b$ia${$ia!X$ia~P!#TO^!yq}!yq'Q!yqz!yq!_!yq'b!yq!P!yq${!yq!X!yq~P!(wO}&dX'Z&dX~PIxO},TO'Z'ja~O|0gO}&eX!_&eX~P)uO},WO!_'ka~O},WO!_'ka~P!(wO#h!ba!O!ba~PBzO#h!Ya}!Ya!O!Ya~P#([O!P0zO#s]O#z0{O~O!O1PO~O'b1QO~P!#TO^$Tq}$Tq'Q$Tqz$Tq!_$Tq'b$Tq!P$Tq${$Tq!X$Tq~P!(wOz1RO~O],oOj,oO~Or'|Ou'}O'u(RO'm$si't$si}$si!w$si~O'Z$si#h$si~P$&|Or'|Ou'}O'm$ui't$ui'u$ui}$ui!w$ui~O'Z$ui#h$ui~P$'oO#h1SO~P!#TO|1UO'V$]O}&mX!_&mX~O},wO!_'za~O},wO!X!tO!_'za~O},wO!X!tO'm&hO!_'za~O'Z$bi}$bi#h$bi!w$bi~P!#TO|1]O'V(]Oz&oX}&oX~P!#rO}-OOz'{a~O}-OOz'{a~P!#TO!X!tO~O!X!tO#]1gO~Oi1kO!X!tO'm&hO~O}'^i'Z'^i~P!#TO!w1nO}'^i'Z'^i~P!#TO!_1qO~O^$Uq}$Uq'Q$Uqz$Uq!_$Uq'b$Uq!P$Uq${$Uq!X$Uq~P!(wO}1uO!P'|X~P!#TO!P&]O${1xO~O!P&]O${1xO~P!#TO!P$`X$pZX^$`X'Q$`X~P! zO$p1|OrfXufX!PfX'mfX'tfX'ufX^fX'QfX~O$p1|O~O$|2TO'V)bO}&xX!O&xX~O}.QO!O(Sa~OY2XO~O[2YO~O]2]O~OR2_O!P&]O!k2^O${1xO~O^$XO'Q$XO~P!#TO!P#vO~P!#TO}2dO!w2fO!O(PX~O!O2gO~Ou(fO!S2pO!T2iO!U2iO!n2oO!o2nO!p2nO!t2mO'W$_O'c(bO'l+`O~O!O2lO~P$/}OR2wO!P.mO!k2vO${2uO~OR2wO!P.mO!k2vO${2uO'[$`O~O'V(tO}&wX!O&wX~O}.yO!O(Qa~O'c3QO~O]3SO~O[3UO~O!_3XO~P)uO^3ZO~O^3ZO~P)uO#]3]O%m3^O~PEdO_/aO!O3bO%{/`O~P`O!X3dO~O&Q3eOP%}qQ%}qW%}q]%}q^%}qa%}qb%}qg%}qi%}qj%}qk%}qn%}qp%}qu%}qw%}qx%}qy%}q!P%}q!Z%}q!`%}q!c%}q!d%}q!e%}q!f%}q!g%}q!j%}q#_%}q#o%}q#s%}q$z%}q$|%}q%O%}q%P%}q%S%}q%U%}q%X%}q%Y%}q%[%}q%i%}q%o%}q%q%}q%s%}q%u%}q%x%}q&O%}q&S%}q&U%}q&W%}q&Y%}q&[%}q&{%}q'V%}q'`%}q'y%}q!O%}q%v%}q_%}q%{%}q~O}#Oi!O#Oi~P#([O!w3gO}#Oi!O#Oi~O}!Ri!O!Ri~P#([O^$XO!w3nO'Q$XO~O^$XO!X!tO!w3nO'Q$XO~O!T3rO!U3rO'W$_O'c(bO'l+`O~O^$XO!X!tO!`$UO!f3sO!w3nO'Q$XO'[$`O'm&hO~O!S3tO~P$8dO!S3tO!q3wO!t3xO~P$8dO^$XO!X!tO!f3sO!w3nO'Q$XO'm&hO~O}'oq!_'oq^'oq'Q'oq~P!(wO}&mO!_'nq~O#R$siP$siY$si^$sii$sis$si!]$si!^$si!`$si!f$si#V$si#W$si#X$si#Y$si#Z$si#[$si#]$si#^$si#`$si#b$si#d$si#e$si'Q$si'`$si!_$siz$si!P$si'b$si${$si!X$si~P$&|O#R$uiP$uiY$ui^$uii$uis$ui!]$ui!^$ui!`$ui!f$ui#V$ui#W$ui#X$ui#Y$ui#Z$ui#[$ui#]$ui#^$ui#`$ui#b$ui#d$ui#e$ui'Q$ui'`$ui!_$uiz$ui!P$ui'b$ui${$ui!X$ui~P$'oO#R$biP$biY$bi^$bii$bis$bi}$bi!]$bi!^$bi!`$bi!f$bi#V$bi#W$bi#X$bi#Y$bi#Z$bi#[$bi#]$bi#^$bi#`$bi#b$bi#d$bi#e$bi'Q$bi'`$bi!_$biz$bi!P$bi!w$bi'b$bi${$bi!X$bi~P!#TO}&da'Z&da~P!#TO}&ea!_&ea~P!(wO},WO!_'ki~O#h!yi}!yi!O!yi~P#([OP#ZOr!xOs!xOu!yO!^!vO!`!wO!f#ZO'`QOY#Uii#Ui!]#Ui#W#Ui#X#Ui#Y#Ui#Z#Ui#[#Ui#]#Ui#^#Ui#`#Ui#b#Ui#d#Ui#e#Ui#h#Ui'm#Ui't#Ui'u#Ui}#Ui!O#Ui~O#V#Ui~P$AzO#V9VO~P$AzOP#ZOr!xOs!xOu!yO!^!vO!`!wO!f#ZO#V9VO#W9WO#X9WO#Y9WO'`QOY#Ui!]#Ui#Z#Ui#[#Ui#]#Ui#^#Ui#`#Ui#b#Ui#d#Ui#e#Ui#h#Ui'm#Ui't#Ui'u#Ui}#Ui!O#Ui~Oi#Ui~P$DSOi9XO~P$DSOP#ZOi9XOr!xOs!xOu!yO!^!vO!`!wO!f#ZO#V9VO#W9WO#X9WO#Y9WO#Z9YO'`QO#`#Ui#b#Ui#d#Ui#e#Ui#h#Ui'm#Ui't#Ui'u#Ui}#Ui!O#Ui~OY#Ui!]#Ui#[#Ui#]#Ui#^#Ui~P$F[OY9dO!]9ZO#[9ZO#]9ZO#^9ZO~P$F[OP#ZOY9dOi9XOr!xOs!xOu!yO!]9ZO!^!vO!`!wO!f#ZO#V9VO#W9WO#X9WO#Y9WO#Z9YO#[9ZO#]9ZO#^9ZO#`9[O'`QO#b#Ui#d#Ui#e#Ui#h#Ui'm#Ui'u#Ui}#Ui!O#Ui~O't#Ui~P$HpO't!zO~P$HpOP#ZOY9dOi9XOr!xOs!xOu!yO!]9ZO!^!vO!`!wO!f#ZO#V9VO#W9WO#X9WO#Y9WO#Z9YO#[9ZO#]9ZO#^9ZO#`9[O#b9^O'`QO't!zO#d#Ui#e#Ui#h#Ui'm#Ui}#Ui!O#Ui~O'u#Ui~P$JxO'u!{O~P$JxOP#ZOY9dOi9XOr!xOs!xOu!yO!]9ZO!^!vO!`!wO!f#ZO#V9VO#W9WO#X9WO#Y9WO#Z9YO#[9ZO#]9ZO#^9ZO#`9[O#b9^O#d9`O'`QO't!zO'u!{O~O#e#Ui#h#Ui'm#Ui}#Ui!O#Ui~P$MQO^#fy}#fy'Q#fyz#fy!_#fy'b#fy!P#fy${#fy!X#fy~P!(wOP#UiY#Uii#Uis#Ui!]#Ui!^#Ui!`#Ui!f#Ui#V#Ui#W#Ui#X#Ui#Y#Ui#Z#Ui#[#Ui#]#Ui#^#Ui#`#Ui#b#Ui#d#Ui#e#Ui#h#Ui'`#Ui}#Ui!O#Ui~P!#TO!^!vOP'_XY'_Xi'_Xr'_Xs'_Xu'_X!]'_X!`'_X!f'_X#V'_X#W'_X#X'_X#Y'_X#Z'_X#['_X#]'_X#^'_X#`'_X#b'_X#d'_X#e'_X#h'_X'`'_X'm'_X't'_X'u'_X}'_X!O'_X~O#h#ii}#ii!O#ii~P#([O!O4YO~O}&la!O&la~P#([O!X!tO'm&hO}&ma!_&ma~O},wO!_'zi~O},wO!X!tO!_'zi~Oz&oa}&oa~P!#TO!X4aO~O}-OOz'{i~P!#TO}-OOz'{i~Oz4gO~O!X!tO#]4mO~Oi4nO!X!tO'm&hO~Oz4pO~O'Z$dq}$dq#h$dq!w$dq~P!#TO^$Uy}$Uy'Q$Uyz$Uy!_$Uy'b$Uy!P$Uy${$Uy!X$Uy~P!(wO}1uO!P'|a~O!P&]O${4uO~O!P&]O${4uO~P!#TO^!yy}!yy'Q!yyz!yy!_!yy'b!yy!P!yy${!yy!X!yy~P!(wOY4xO~O}.QO!O(Si~O]4}O~O[5OO~O'c&|O}&tX!O&tX~O}2dO!O(Pa~O!O5]O~P$/}Ou-aO'c(bO'l+`O~O!S5`O!T5_O!U5_O!t0RO'W$_O'c(bO'l+`O~O!o5aO!p5aO~P%+jO!T5_O!U5_O'W$_O'c(bO'l+`O~O!P.mO~O!P.mO${5cO~O!P.mO${5cO~P!#TOR5hO!P.mO!k5gO${5cO~OY5mO}&wa!O&wa~O}.yO!O(Qi~O]5pO~O!_5qO~O!_5rO~O!_5sO~O!_5sO~P)uO^5uO~O!X5xO~O!_5zO~O}'ri!O'ri~P#([O^$XO'Q$XO~P!(wO^$XO!w6PO'Q$XO~O^$XO!X!tO!w6PO'Q$XO~O!T6UO!U6UO'W$_O'c(bO'l+`O~O^$XO!X!tO!f6VO!w6PO'Q$XO'm&hO~O!`$UO'[$`O~P%0UO!S6WO~P%/sO}'oy!_'oy^'oy'Q'oy~P!(wO#R$dqP$dqY$dq^$dqi$dqs$dq}$dq!]$dq!^$dq!`$dq!f$dq#V$dq#W$dq#X$dq#Y$dq#Z$dq#[$dq#]$dq#^$dq#`$dq#b$dq#d$dq#e$dq'Q$dq'`$dq!_$dqz$dq!P$dq!w$dq'b$dq${$dq!X$dq~P!#TO}&ei!_&ei~P!(wO#h!yq}!yq!O!yq~P#([Or-gOs-gOu-hOPoaYoaioa!]oa!^oa!`oa!foa#Voa#Woa#Xoa#Yoa#Zoa#[oa#]oa#^oa#`oa#boa#doa#eoa#hoa'`oa'moa'toa'uoa}oa!Ooa~Or'|Ou'}OP$XaY$Xai$Xas$Xa!]$Xa!^$Xa!`$Xa!f$Xa#V$Xa#W$Xa#X$Xa#Y$Xa#Z$Xa#[$Xa#]$Xa#^$Xa#`$Xa#b$Xa#d$Xa#e$Xa#h$Xa'`$Xa'm$Xa't$Xa'u$Xa}$Xa!O$Xa~Or'|Ou'}OP$ZaY$Zai$Zas$Za!]$Za!^$Za!`$Za!f$Za#V$Za#W$Za#X$Za#Y$Za#Z$Za#[$Za#]$Za#^$Za#`$Za#b$Za#d$Za#e$Za#h$Za'`$Za'm$Za't$Za'u$Za}$Za!O$Za~OP$iaY$iai$ias$ia!]$ia!^$ia!`$ia!f$ia#V$ia#W$ia#X$ia#Y$ia#Z$ia#[$ia#]$ia#^$ia#`$ia#b$ia#d$ia#e$ia#h$ia'`$ia}$ia!O$ia~P!#TO#h$Tq}$Tq!O$Tq~P#([O#h$Uq}$Uq!O$Uq~P#([O!O6bO~O'Z$wy}$wy#h$wy!w$wy~P!#TO!X!tO}&mi!_&mi~O!X!tO'm&hO}&mi!_&mi~O},wO!_'zq~Oz&oi}&oi~P!#TO}-OOz'{q~Oz6iO~P!#TOz6iO~O}'^y'Z'^y~P!#TO}&ra!P&ra~P!#TO!P$oq^$oq'Q$oq~P!#TOY6qO~O}.QO!O(Sq~O]6tO~O!P&]O${6uO~O!P&]O${6uO~P!#TO!w6vO}&ta!O&ta~O}2dO!O(Pi~P#([O!T6|O!U6|O'W$_O'c(bO'l+`O~O!S7OO!t3xO~P%?sO!P.mO${7RO~O!P.mO${7RO~P!#TO'c7XO~O}.yO!O(Qq~O!_7[O~O!_7[O~P)uO!_7^O~O!_7_O~O}#Oy!O#Oy~P#([O^$XO!w7eO'Q$XO~O^$XO!X!tO!w7eO'Q$XO~O!T7hO!U7hO'W$_O'c(bO'l+`O~O^$XO!X!tO!f7iO!w7eO'Q$XO'm&hO~O#R$wyP$wyY$wy^$wyi$wys$wy}$wy!]$wy!^$wy!`$wy!f$wy#V$wy#W$wy#X$wy#Y$wy#Z$wy#[$wy#]$wy#^$wy#`$wy#b$wy#d$wy#e$wy'Q$wy'`$wy!_$wyz$wy!P$wy!w$wy'b$wy${$wy!X$wy~P!#TO#h#fy}#fy!O#fy~P#([OP$biY$bii$bis$bi!]$bi!^$bi!`$bi!f$bi#V$bi#W$bi#X$bi#Y$bi#Z$bi#[$bi#]$bi#^$bi#`$bi#b$bi#d$bi#e$bi#h$bi'`$bi}$bi!O$bi~P!#TOr'|Ou'}O'u(ROP$siY$sii$sis$si!]$si!^$si!`$si!f$si#V$si#W$si#X$si#Y$si#Z$si#[$si#]$si#^$si#`$si#b$si#d$si#e$si#h$si'`$si'm$si't$si}$si!O$si~Or'|Ou'}OP$uiY$uii$uis$ui!]$ui!^$ui!`$ui!f$ui#V$ui#W$ui#X$ui#Y$ui#Z$ui#[$ui#]$ui#^$ui#`$ui#b$ui#d$ui#e$ui#h$ui'`$ui'm$ui't$ui'u$ui}$ui!O$ui~O#h$Uy}$Uy!O$Uy~P#([O#h!yy}!yy!O!yy~P#([O!X!tO}&mq!_&mq~O},wO!_'zy~Oz&oq}&oq~P!#TOz7oO~P!#TO}.QO!O(Sy~O}2dO!O(Pq~O!T7{O!U7{O'W$_O'c(bO'l+`O~O!P.mO${8OO~O!P.mO${8OO~P!#TO!_8RO~O&Q8SOP%}!ZQ%}!ZW%}!Z]%}!Z^%}!Za%}!Zb%}!Zg%}!Zi%}!Zj%}!Zk%}!Zn%}!Zp%}!Zu%}!Zw%}!Zx%}!Zy%}!Z!P%}!Z!Z%}!Z!`%}!Z!c%}!Z!d%}!Z!e%}!Z!f%}!Z!g%}!Z!j%}!Z#_%}!Z#o%}!Z#s%}!Z$z%}!Z$|%}!Z%O%}!Z%P%}!Z%S%}!Z%U%}!Z%X%}!Z%Y%}!Z%[%}!Z%i%}!Z%o%}!Z%q%}!Z%s%}!Z%u%}!Z%x%}!Z&O%}!Z&S%}!Z&U%}!Z&W%}!Z&Y%}!Z&[%}!Z&{%}!Z'V%}!Z'`%}!Z'y%}!Z!O%}!Z%v%}!Z_%}!Z%{%}!Z~O^$XO!w8XO'Q$XO~O^$XO!X!tO!w8XO'Q$XO~OP$dqY$dqi$dqs$dq!]$dq!^$dq!`$dq!f$dq#V$dq#W$dq#X$dq#Y$dq#Z$dq#[$dq#]$dq#^$dq#`$dq#b$dq#d$dq#e$dq#h$dq'`$dq}$dq!O$dq~P!#TO}&tq!O&tq~P#([O^$XO!w8nO'Q$XO~OP$wyY$wyi$wys$wy!]$wy!^$wy!`$wy!f$wy#V$wy#W$wy#X$wy#Y$wy#Z$wy#[$wy#]$wy#^$wy#`$wy#b$wy#d$wy#e$wy#h$wy'`$wy}$wy!O$wy~P!#TO'b'dX~P.^O'bZXzZX!_ZX%mZX!PZX${ZX!XZX~P$wO!XcX!_ZX!_cX'mcX~P;OOP9POQ9PO]bOa:fOb!gOgbOi9POjbOkbOn9POp9POuROwbOxbOybO!PSO!Z9RO!`UO!c9PO!d9PO!e9PO!f9PO!g9PO!j!fO#o!iO#s]O'V']O'`QO'y:dO~O}9bO!O$Wa~O]#nOg#{Oi#oOj#nOk#nOn#|Op9gOu#uO!P#vO!Z:iO!`#sO#Q9mO#o$QO$Y9iO$[9kO$_$RO'V&tO'`#pO~O#_'dO~P&*|O!OZX!OcX~P;OO#R9UO~O!X!tO#R9UO~O!w9eO~O!w9nO}'rX!O'rX~O!w9eO}'pX!O'pX~O#R9oO~O'Z9qO~P!#TO#R9vO~O#R9wO~O!X!tO#R9xO~O!X!tO#R9oO~O#h9yO~P#([O#R9zO~O#R9{O~O#R9|O~O#R9}O~O#h:OO~P!#TO#h:PO~P!#TO#s~!^!n!p!q#P#Q'y$Y$[$_$p$z${$|%S%U%X%Y%[%^~TS#s'y#Wy'S'T#u'S'V'c~",
  goto: "#Ar(WPPPPPPP(XP(iP*[PPPP-qPP.W3h5[5oP5oPPP5o5oP5oP7]PP7bP7vPPPP<VPPPP<V>uPPP>{AVP<VPCmPPPPEe<VPPPPPG^<VPPJ]KYPPPPK^LuPL}NOP<V<V!#V!&O!*o!*o!-|PPP!.T!0w<VPPPPPPPPPP!0zP!2]PP<V!3jP<VP<V<V<V<VP<V!5}PP!8tP!;g!;o!;s!;sP!8qP!;w!;wP!>jP!>n<V<V!>t!Af5oP5oP5o5oP!Bi5o5o!Da5o!Fc5o!HT5o5o!Hq!Jk!Jk!Jo!Jk!JwP!JkP5o!Ks5o!L}5o5o-qPPP!N[PP!Nt!NtP!NtP# Z!NtPP# aP# WP# W# sLy# W#!b#!h#!k(X#!n(XP#!u#!u#!uP(XP(XP(XP(XPP(XP#!{##OP##O(XPPP(XP(XP(XP(XP(XP(X(X##S##^##d##j##x#$O#$U#$`#$f#$p#$v#%U#%[#%b#%p#&V#'i#'w#'}#(T#(Z#(a#(k#(q#(w#)R#)e#)kPPPPPPPPP#)qPP#*e#.cPP#/y#0Q#0YP#4fPP#4j#6}#<w#<{#=O#=R#=^#=aPP#=d#=h#>V#>z#?O#?bPP#?f#?l#?pP#?s#?w#?z#@j#AQ#AV#AY#A]#Ac#Af#Aj#AnmgOSi{!k$W%_%b%c%e*h*m/Z/^Q$elQ$lnQ%VwS&P!`+TQ&d!gS(e#v(jQ)`$fQ)m$nQ*X%PQ+Z&WS+b&]+dQ+s&eQ-_(lQ.x*YW/}+f+g+h+iS2i.m2kU3r0O0Q0SU5_2n2o2pS6U3t3wS6|5`5aQ7h6WR7{7O$lZORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$W$j%W%Z%_%a%b%c%e%i%t%|&X&_&i&v&z'{(})U*d*h*m+n+u,W,^-h-m-u.P.p/R/S/T/V/Z/^/`/w0]0g2^2v3Z3]3^3n5g5u6P7e8X8n!j'_#Y#h&Q'q*|+P,c/n0z2f3g6v9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:gQ(u#}Q)e$hQ*Z%SQ*b%[Q+}9fQ-z)YQ.V)fQ/Q*`Q2S.QQ3O.yQ4R9gR4z2TpdOSiw{!k$W%U%_%b%c%e*h*m/Z/^R*]%W&WVOSTijm{!Q!U!Z!h!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$W$j%W%Z%[%_%a%b%c%e%i%t%|&X&_&i&v&z'q'{(})U*d*h*m*|+P+n+u,W,^,c-h-m-u.P.p/R/S/T/V/Z/^/`/n/w0]0g0z2^2f2v3Z3]3^3g3n5g5u6P6v7e8X8n9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:f:gW!aRU!^&QQ$^kQ$dlS$in$nv$spq!o!r$U$q&Y&m&p)q)r)s*f*}+^+x+z/d0_Q${uQ&a!fQ&c!gS(X#s(cS)_$e$fQ)c$hQ)p$pQ*S$}Q*W%PS+r&d&eQ,{(YQ.O)`Q.U)fQ.W)gQ.Z)kQ.s*TS.w*X*YQ0Z+sQ1T,wQ2R.QQ2V.TQ2[.]Q2}.xQ4^1UQ4y2TQ4|2XQ6p4xR7r6q!Y$bl!g$d$e$f&O&c&d&e(d)_)`+Q+a+r+s-X.O/s/z0P0Z1j3q3v6S7f8YQ)W$^Q)x$xQ){$yQ*V%PQ._)pQ.r*SU.v*W*X*YQ2x.sS2|.w.xQ5Y2hQ5l2}S6z5Z5^S7y6{6}Q8d7zR8s8eW#y`$`(r:dS$xr%UQ$ysQ$ztR)v$v$V#x`!t!v#a#s#u$O$P$T&`'w(Q(S(T([(`(p(q)T)V)Y)w)z+o,T-O-Q-j-t-v.d.g.o.q1S1]1g1n1u1x1|2_2u2w4a4m4u5c5h6u7R8O9d9h9i9j9k9l9m9r9s9t9u9v9w9z9{:O:P:d:j:kV(v#}9f9gU&T!`$r+WQ'O!xQ)j$kQ.h)|Q1o-gR5U2d&YbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$W$j%W%Z%[%_%a%b%c%e%i%t%|&Q&X&_&i&v&z'q'{(})U*d*h*m*|+P+n+u,W,^,c-h-m-u.P.p/R/S/T/V/Z/^/`/n/w0]0g0z2^2f2v3Z3]3^3g3n5g5u6P6v7e8X8n9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:g$]#^Y!]!l$[%s%w&r&y'Q'R'S'T'U'V'W'X'Y'Z'['^'a'e'o)i*x+R+[+t,S,Y,],_,m-k/i/l0[0f0j0k0l0m0n0o0p0q0r0s0t0u0v0y1O1s2P3i3l3|4P4Q4V4W5W5{6O6[6`6a7b7u8V8l8w9Q:]&ZbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$W$j%W%Z%[%_%a%b%c%e%i%t%|&Q&X&_&i&v&z'q'{(})U*d*h*m*|+P+n+u,W,^,c-h-m-u.P.p/R/S/T/V/Z/^/`/n/w0]0g0z2^2f2v3Z3]3^3g3n5g5u6P6v7e8X8n9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:gQ&R!`R/o+TY%{!`&P&W+T+ZS(d#v(jS+a&]+dS-X(e(lQ-Y(fQ-`(mQ.j*OU/z+b+f+gS0P+h+iS0T+j2mQ1j-_Q1l-aQ1m-bS2h.m2kU3q/}0O0QQ3u0RQ3v0SS5Z2i2pS5^2n2oU6S3r3t3wQ6X3xS6{5_5`Q6}5aS7f6U6WS7z6|7OQ8Y7hR8e7{lgOSi{!k$W%_%b%c%e*h*m/Z/^Q%g!OS&q!s9UQ)]$cQ*Q${Q*R$|Q+p&bS,R&v9oS-l(}9xQ-|)^Q.l*PQ/b*oQ/c*pQ/k+OQ0X+qS1t-m9|Q1}-}S2Q.P9}Q3h/mQ3k/uQ3z0YQ4w2OQ5y3eQ5|3jQ6Q3pQ6Y3{Q7`5zQ7c6RQ8U7dQ8i8SQ8k8WR8v8m$W#]Y!]!l%s%w&r&y'Q'R'S'T'U'V'W'X'Y'Z'['^'a'e'o)i*x+R+[+t,S,Y,],m-k/i/l0[0f0j0k0l0m0n0o0p0q0r0s0t0u0v0y1O1s2P3i3l3|4P4Q4V4W5W5{6O6[6`6a7b7u8V8l8w9Q:]U(o#w&u0xT)R$[,_$W#[Y!]!l%s%w&r&y'Q'R'S'T'U'V'W'X'Y'Z'['^'a'e'o)i*x+R+[+t,S,Y,],m-k/i/l0[0f0j0k0l0m0n0o0p0q0r0s0t0u0v0y1O1s2P3i3l3|4P4Q4V4W5W5{6O6[6`6a7b7u8V8l8w9Q:]Q'`#]S)Q$[,_R-n)R&YbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$W$j%W%Z%[%_%a%b%c%e%i%t%|&Q&X&_&i&v&z'q'{(})U*d*h*m*|+P+n+u,W,^,c-h-m-u.P.p/R/S/T/V/Z/^/`/n/w0]0g0z2^2f2v3Z3]3^3g3n5g5u6P6v7e8X8n9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:gQ%byQ%czQ%e|Q%f}R/Y*kQ&^!fQ)S$^Q+m&aS-s)W)pS0U+k+lW1w-p-q-r._S3y0V0WU4t1y1z1{U6n4s5Q5RQ7q6oR8`7tT+c&]+dS+a&]+dU/z+b+f+gS0P+h+iS0T+j2mS2h.m2kU3q/}0O0QQ3u0RQ3v0SS5Z2i2pS5^2n2oU6S3r3t3wQ6X3xS6{5_5`Q6}5aS7f6U6WS7z6|7OQ8Y7hR8e7{S+c&]+dT2j.m2kS&k!n/WQ,z(XQ-V(dS/y+a2hQ1Y,{S1d-W-`U3s0P0T5^Q4]1TS4k1k1mU6V3u3v6}Q6d4^Q6m4nR7i6XQ!uXS&j!n/WQ)O$VQ)Z$aQ)a$gQ+v&kQ,y(XQ-U(dQ-Z(gQ-{)[Q.t*US/x+a2hS1X,z,{S1c-V-`Q1f-YQ1i-[Q2z.uW3o/y0P0T5^Q4[1TQ4`1YS4e1d1mQ4l1lQ5j2{W6T3s3u3v6}S6c4]4^Q6h4gQ6k4kQ6x5XQ7V5kS7g6V6XQ7k6dQ7m6iQ7p6mQ7w6yQ8Q7WQ8Z7iQ8^7oQ8b7xQ8q8cQ8y8rQ8}8zQ:V:RQ:`:ZR:a:[$nWORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$W$j%W%Z%[%_%a%b%c%e%i%t%|&X&_&i&v&z'{(})U*d*h*m+n+u,W,^-h-m-u.P.p/R/S/T/V/Z/^/`/w0]0g2^2v3Z3]3^3n5g5u6P7e8X8nS!um!h!j:Q#Y#h&Q'q*|+P,c/n0z2f3g6v9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:gR:V:f$nXORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$W$j%W%Z%[%_%a%b%c%e%i%t%|&X&_&i&v&z'{(})U*d*h*m+n+u,W,^-h-m-u.P.p/R/S/T/V/Z/^/`/w0]0g2^2v3Z3]3^3n5g5u6P7e8X8nQ$Va!Y$al!g$d$e$f&O&c&d&e(d)_)`+Q+a+r+s-X.O/s/z0P0Z1j3q3v6S7f8YS$gm!hQ)[$bQ*U%PW.u*V*W*X*YU2{.v.w.xQ5X2hS5k2|2}U6y5Y5Z5^Q7W5lU7x6z6{6}S8c7y7zS8r8d8eQ8z8s!j:R#Y#h&Q'q*|+P,c/n0z2f3g6v9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:gQ:Z:eR:[:f$f[OSTij{!Q!U!Z!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$W$j%W%Z%_%a%b%c%e%i%t%|&X&_&i&v&z'{(})U*d*h*m+n+u,W,^-h-m-u.P.p/R/S/T/V/Z/^/`/w0]0g2^2v3Z3]3^3n5g5u6P7e8X8nU!eRU!^v$spq!o!r$U$q&Y&m&p)q)r)s*f*}+^+x+z/d0_Q*c%[!h:S#Y#h'q*|+P,c/n0z2f3g6v9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:gR:U&QS&U!`$rR/q+W$lZORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$W$j%W%Z%_%a%b%c%e%i%t%|&X&_&i&v&z'{(})U*d*h*m+n+u,W,^-h-m-u.P.p/R/S/T/V/Z/^/`/w0]0g2^2v3Z3]3^3n5g5u6P7e8X8n!j'_#Y#h&Q'q*|+P,c/n0z2f3g6v9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:gR*b%[R'O!x!h#SY!]$[%s%w&r&y'X'Y'Z'['a'e)i*x+[+t,S,Y,m-k0[0f0v1s2P3l3|4P6O7b8V8l8w9Q!R9]'^'o+R,_/i/l0j0r0s0t0u0y1O3i4Q4V4W5W5{6[6`6a7u:]!d#UY!]$[%s%w&r&y'Z'['a'e)i*x+[+t,S,Y,m-k0[0f0v1s2P3l3|4P6O7b8V8l8w9Q}9_'^'o+R,_/i/l0j0t0u0y1O3i4Q4V4W5W5{6[6`6a7u:]!`#YY!]$[%s%w&r&y'a'e)i*x+[+t,S,Y,m-k0[0f0v1s2P3l3|4P6O7b8V8l8w9Ql(T#q&w(|,u,}-c-d0d1r4Z4o:W:b:cx:g'^'o+R,_/i/l0j0y1O3i4Q4V4W5W5{6[6`6a7u:]!`:j&s'c(W(^+l,Q,j-R-o-r.c.e0W0c1Z1_1{2a2c2s4O4b4h4q4v5R5f6Z6f6l7TZ:k0w4U6]7j8[&YbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$W$j%W%Z%[%_%a%b%c%e%i%t%|&Q&X&_&i&v&z'q'{(})U*d*h*m*|+P+n+u,W,^,c-h-m-u.P.p/R/S/T/V/Z/^/`/n/w0]0g0z2^2f2v3Z3]3^3g3n5g5u6P6v7e8X8n9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:gS#i_#jR0{,b&a^ORSTU_ij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h#j$W$j%W%Z%[%_%a%b%c%e%i%t%|&Q&X&_&i&v&z'q'{(})U*d*h*m*|+P+n+u,W,^,b,c-h-m-u.P.p/R/S/T/V/Z/^/`/n/w0]0g0z2^2f2v3Z3]3^3g3n5g5u6P6v7e8X8n9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:gS#d]#kT'h#f'lT#e]#kT'j#f'l&a_ORSTU_ij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h#j$W$j%W%Z%[%_%a%b%c%e%i%t%|&Q&X&_&i&v&z'q'{(})U*d*h*m*|+P+n+u,W,^,b,c-h-m-u.P.p/R/S/T/V/Z/^/`/n/w0]0g0z2^2f2v3Z3]3^3g3n5g5u6P6v7e8X8n9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:gT#i_#jQ#l_R's#j$naORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$W$j%W%Z%[%_%a%b%c%e%i%t%|&X&_&i&v&z'{(})U*d*h*m+n+u,W,^-h-m-u.P.p/R/S/T/V/Z/^/`/w0]0g2^2v3Z3]3^3n5g5u6P7e8X8n!k:e#Y#h&Q'q*|+P,c/n0z2f3g6v9P9R9U9V9W9X9Y9Z9[9]9^9_9`9a9b9e9n9o9q9x9y9|9}:g#RcOSUi{!Q!U!k!y#h$W%W%Z%[%_%a%b%c%e%i%|&_'q)U*d*h*m+n,c-h-u.p/R/S/T/V/Z/^/`0z2^2v3Z3]3^5g5ut#w`!v$O$P$T(Q(S(T([(p(q,T-j1S1n:d:j:k!|&u!t#a#s#u&`'w(`)T)V)Y)w)z+o-O-Q-t-v.d.g.o.q1]1g1u1x1|2_2u2w4a4m4u5c5h6u7R8O9h9j9l9r9t9v9z:OQ(z$RQ,n'|c0x9d9i9k9m9s9u9w9{:Pt#t`!v$O$P$T(Q(S(T([(p(q,T-j1S1n:d:j:kS(g#v(jQ({$SQ-[(h!|:X!t#a#s#u&`'w(`)T)V)Y)w)z+o-O-Q-t-v.d.g.o.q1]1g1u1x1|2_2u2w4a4m4u5c5h6u7R8O9h9j9l9r9t9v9z:Ob:Y9d9i9k9m9s9u9w9{:PQ:^:hR:_:it#w`!v$O$P$T(Q(S(T([(p(q,T-j1S1n:d:j:k!|&u!t#a#s#u&`'w(`)T)V)Y)w)z+o-O-Q-t-v.d.g.o.q1]1g1u1x1|2_2u2w4a4m4u5c5h6u7R8O9h9j9l9r9t9v9z:Oc0x9d9i9k9m9s9u9w9{:PleOSi{!k$W%_%b%c%e*h*m/Z/^Q(_#uQ*t%lQ*u%nR1[-O$U#x`!t!v#a#s#u$O$P$T&`'w(Q(S(T([(`(p(q)T)V)Y)w)z+o,T-O-Q-j-t-v.d.g.o.q1S1]1g1n1u1x1|2_2u2w4a4m4u5c5h6u7R8O9d9h9i9j9k9l9m9r9s9t9u9v9w9z9{:O:P:d:j:kQ)y$yQ.f){Q2b.eR5T2cT(i#v(jS(i#v(jT2j.m2kQ)Z$aQ-Z(gQ-{)[Q.t*UQ2z.uQ5j2{Q6x5XQ7V5kQ7w6yQ8Q7WQ8b7xQ8q8cQ8y8rR8}8zl(Q#q&w(|,u,}-c-d0d1r4Z4o:W:b:c!`9r&s'c(W(^+l,Q,j-R-o-r.c.e0W0c1Z1_1{2a2c2s4O4b4h4q4v5R5f6Z6f6l7TZ9s0w4U6]7j8[n(S#q&w(|,s,u,}-c-d0d1r4Z4o:W:b:c!b9t&s'c(W(^+l,Q,j-R-o-r.c.e0W0a0c1Z1_1{2a2c2s4O4b4h4q4v5R5f6Z6f6l7T]9u0w4U6]6^7j8[pdOSiw{!k$W%U%_%b%c%e*h*m/Z/^Q%RvR*d%[pdOSiw{!k$W%U%_%b%c%e*h*m/Z/^R%RvQ)}$zR.b)vqdOSiw{!k$W%U%_%b%c%e*h*m/Z/^Q.n*SS2t.r.sW5b2q2r2s2xU7Q5d5e5fU7|7P7S7TQ8f7}R8t8gQ%YwR*^%UR3R.{R7Y5mS$in$nR.W)gQ%_xR*h%`R*n%fT/[*m/^QiOQ!kST$Zi!kQ'y#pR,k'yQ!WQR%q!WQ![RU%u![%v*yQ%v!]R*y%wQ+U&RR/p+UQ,U&wR0e,UQ,X&yS0h,X0iR0i,YQ+d&]R/{+dQ&Z!cQ*z%xT+_&Z*zQ+X&UR/r+XQ&n!pQ+w&lU+{&n+w0`R0`+|Q'l#fR,d'lQ#j_R'r#jQ#`YU'b#`*w9cQ*w9QR9c'oQ,x(XW1V,x1W4_6eU1W,y,z,{S4_1X1YR6e4`#q(O#q&s&w'c(W(^(w(x(|+l,O,P,Q,j,s,t,u,}-R-c-d-o-r.c.e0W0a0b0c0d0w1Z1_1r1{2a2c2s4O4S4T4U4Z4b4h4o4q4v5R5f6Z6]6^6_6f6l7T7j8[:W:b:cQ-P(^U1^-P1`4cQ1`-RR4c1_Q(j#vR-](jQ(s#zR-f(sQ1v-oR4r1vQ)t$tR.a)tQ2e.hS5V2e6wR6w5WQ*P${R.k*PQ2k.mR5[2kQ.z*ZS3P.z5nR5n3RQ.R)cW2U.R2W4{6rQ2W.UQ4{2VR6r4|Q)h$iR.X)hQ/^*mR3a/^WhOSi!kQ%d{Q)P$WQ*g%_Q*i%bQ*j%cQ*l%eQ/X*hS/[*m/^R3`/ZQ$YfQ%h!PQ%k!RQ%m!SQ%o!TQ)o$oQ)u$uQ*]%YQ*r%jS.}*^*aQ/e*qQ/f*tQ/g*uS/v+a2hQ1a-TQ1b-UQ1h-ZQ2Z.[Q2`.cQ2y.tQ3T/PQ3_/YY3m/x/y0P0T5^Q4d1cQ4f1eQ4i1iQ5P2]Q5S2aQ5i2zQ5o3S[5}3l3o3s3u3v6}Q6g4eQ6j4jQ6s4}Q7U5jQ7Z5pW7a6O6T6V6XQ7l6hQ7n6kQ7s6tQ7v6xQ8P7VU8T7b7g7iQ8]7mQ8_7pQ8a7wQ8h8QS8j8V8ZQ8o8^Q8p8bQ8u8lQ8x8qQ8{8wQ8|8yR9O8}Q$clQ&b!gU)^$d$e$fQ+O&OU+q&c&d&eQ-T(dS-})_)`Q/m+QQ/u+aS0Y+r+sQ1e-XQ2O.OQ3j/sS3p/z0PQ3{0ZQ4j1jS6R3q3vQ7d6SQ8W7fR8m8YS#r`:dR)X$`U#z`$`:dR-e(rQ#q`S&s!t)YQ&w!vQ'c#aQ(W#sQ(^#uQ(w$OQ(x$PQ(|$TQ+l&`Q,O9hQ,P9jQ,Q9lQ,j'wQ,s(QQ,t(SQ,u(TQ,}([Q-R(`Q-c(pQ-d(qd-o)T-t.o1x2u4u5c6u7R8OQ-r)VQ.c)wQ.e)zQ0W+oQ0a9rQ0b9tQ0c9vQ0d,TQ0w9dQ1Z-OQ1_-QQ1r-jQ1{-vQ2a.dQ2c.gQ2s.qQ4O9zQ4S9iQ4T9kQ4U9mQ4Z1SQ4b1]Q4h1gQ4o1nQ4q1uQ4v1|Q5R2_Q5f2wQ6Z:OQ6]9wQ6^9sQ6_9uQ6f4aQ6l4mQ7T5hQ7j9{Q8[:PQ:W:dQ:b:jR:c:kT'x#p'ylfOSi{!k$W%_%b%c%e*h*m/Z/^S!mU%aQ%j!QQ%p!UQ'P!yQ'p#hS*a%W%ZQ*e%[Q*q%iQ*{%|Q+k&_Q,h'qQ-q)UQ/U*dQ0V+nQ0},cQ1p-hQ1z-uQ2r.pQ3V/RQ3W/SQ3Y/TQ3[/VQ3c/`Q4X0zQ5Q2^Q5e2vQ5t3ZQ5v3]Q5w3^Q7S5gR7]5u!vYOSUi{!Q!k!y$W%W%Z%[%_%a%b%c%e%i%|&_)U*d*h*m+n-h-u.p/R/S/T/V/Z/^/`2^2v3Z3]3^5g5uQ!]RQ!lTQ$[jQ%s!ZQ%w!^Q&r!sQ&y!wQ'Q!|Q'R!}Q'S#OQ'T#PQ'U#QQ'V#RQ'W#SQ'X#TQ'Y#UQ'Z#VQ'[#WQ'^#YQ'a#_Q'e#bW'o#h'q,c0zQ)i$jQ*x%tS+R&Q/nQ+[&XQ+t&iQ,S&vQ,Y&zQ,]9PQ,_9RQ,m'{Q-k(}Q/i*|Q/l+PQ0[+uQ0f,WQ0j9UQ0k9VQ0l9WQ0m9XQ0n9YQ0o9ZQ0p9[Q0q9]Q0r9^Q0s9_Q0t9`Q0u9aQ0v,^Q0y9eQ1O9bQ1s-mQ2P.PQ3i9nQ3l/wQ3|0]Q4P0gQ4Q9oQ4V9qQ4W9xQ5W2fQ5{3gQ6O3nQ6[9yQ6`9|Q6a9}Q7b6PQ7u6vQ8V7eQ8l8XQ8w8nQ9Q!UR:]:gT!VQ!WR!_RR&S!`S&O!`+TS+Q&P&WR/s+ZR&x!vR&{!wT!qU$US!pU$UU$tpq*fS&l!o!rQ+y&mQ+|&pQ.`)sS0^+x+zR3}0_[!bR!^$q&Y)q+^h!nUpq!o!r$U&m&p)s+x+z0_Q/W*fQ/j*}Q3f/dT:T&Q)rT!dR$qS!cR$qS%x!^)qS+S&Q)rQ+]&YR/t+^T&V!`$rQ#f]R'u#kT'k#f'lR0|,bT(Z#s(cR(a#uQ-p)TQ1y-tQ2q.oQ4s1xQ5d2uQ6o4uQ7P5cQ7t6uQ7}7RR8g8OlgOSi{!k$W%_%b%c%e*h*m/Z/^Q%XwR*]%UV$upq*fR.i)|R*[%SQ$mnR)n$nR)d$hT%]x%`T%^x%`T/]*m/^",
  nodeNames: "⚠ ArithOp ArithOp extends LineComment BlockComment Script ExportDeclaration export Star as VariableName from String ; default FunctionDeclaration async function VariableDefinition TypeParamList TypeDefinition ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType VoidType void TypeofType typeof MemberExpression . ?. PropertyName [ TemplateString null super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewExpression new TypeArgList CompareOp < ) ( ArgList UnaryExpression await yield delete LogicOp BitOp ParenthesizedExpression ClassExpression class extends ClassBody MethodDeclaration Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly Optional TypeAnnotation Equals FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression PrivatePropertyName BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp in instanceof const CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression TaggedTemplatExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXStartTag JSXSelfClosingTag JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody MethodDeclaration AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try catch finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement",
  maxTerm: 329,
  context: trackNewline,
  nodeProps: [
    [NodeProp.group, -26,7,14,16,54,179,183,186,187,189,192,195,206,208,214,216,218,220,223,229,233,235,237,239,241,243,244,"Statement",-30,11,13,23,26,27,38,39,40,41,43,48,56,64,70,71,86,87,96,98,114,117,119,120,121,122,124,125,143,144,146,"Expression",-22,22,24,28,29,31,147,149,151,152,154,155,156,158,159,160,162,163,164,173,175,177,178,"Type",-2,75,81,"ClassItem"],
    [NodeProp.closedBy, 37,"]",47,"}",62,")",127,"JSXSelfCloseEndTag JSXEndTag",141,"JSXEndTag"],
    [NodeProp.openedBy, 42,"[",46,"{",61,"(",126,"JSXStartTag",136,"JSXStartTag JSXStartCloseTag"]
  ],
  skippedNodes: [0,4,5],
  repeatNodeCount: 28,
  tokenData: "!Ck~R!`OX%TXY%cYZ'RZ[%c[]%T]^'R^p%Tpq%cqr'crs(kst0htu2`uv4pvw5ewx6cxy<yyz=Zz{=k{|>k|}?O}!O>k!O!P?`!P!QCl!Q!R!0[!R![!1q![!]!7a!]!^!7s!^!_!8T!_!`!9Q!`!a!9x!a!b!;o!b!c%T!c!}2`!}#O!=Q#O#P%T#P#Q!=b#Q#R!=r#R#S2`#S#T!>V#T#o2`#o#p!>g#p#q!>l#q#r!?S#r#s!?f#s$f%T$f$g%c$g#BY2`#BY#BZ!?v#BZ$IS2`$IS$I_!?v$I_$I|2`$I|$I}!B_$I}$JO!B_$JO$JT2`$JT$JU!?v$JU$KV2`$KV$KW!?v$KW&FU2`&FU&FV!?v&FV?HT2`?HT?HU!?v?HU~2`W%YR$PWO!^%T!_#o%T#p~%T,T%jg$PW'S+{OX%TXY%cYZ%TZ[%c[p%Tpq%cq!^%T!_#o%T#p$f%T$f$g%c$g#BY%T#BY#BZ%c#BZ$IS%T$IS$I_%c$I_$JT%T$JT$JU%c$JU$KV%T$KV$KW%c$KW&FU%T&FU&FV%c&FV?HT%T?HT?HU%c?HU~%T,T'YR$PW'T+{O!^%T!_#o%T#p~%T$T'jS$PW!f#{O!^%T!_!`'v!`#o%T#p~%T$O'}S#`#v$PWO!^%T!_!`(Z!`#o%T#p~%T$O(bR#`#v$PWO!^%T!_#o%T#p~%T'u(rZ$PW]!ROY(kYZ)eZr(krs*rs!^(k!^!_+U!_#O(k#O#P-b#P#o(k#o#p+U#p~(k&r)jV$PWOr)ers*Ps!^)e!^!_*a!_#o)e#o#p*a#p~)e&r*WR#z&j$PWO!^%T!_#o%T#p~%T&j*dROr*ars*ms~*a&j*rO#z&j'u*{R#z&j$PW]!RO!^%T!_#o%T#p~%T'm+ZV]!ROY+UYZ*aZr+Urs+ps#O+U#O#P+w#P~+U'm+wO#z&j]!R'm+zROr+Urs,Ts~+U'm,[U#z&j]!ROY,nZr,nrs-Vs#O,n#O#P-[#P~,n!R,sU]!ROY,nZr,nrs-Vs#O,n#O#P-[#P~,n!R-[O]!R!R-_PO~,n'u-gV$PWOr(krs-|s!^(k!^!_+U!_#o(k#o#p+U#p~(k'u.VZ#z&j$PW]!ROY.xYZ%TZr.xrs/rs!^.x!^!_,n!_#O.x#O#P0S#P#o.x#o#p,n#p~.x!Z/PZ$PW]!ROY.xYZ%TZr.xrs/rs!^.x!^!_,n!_#O.x#O#P0S#P#o.x#o#p,n#p~.x!Z/yR$PW]!RO!^%T!_#o%T#p~%T!Z0XT$PWO!^.x!^!_,n!_#o.x#o#p,n#p~.xx0mZ$PWOt%Ttu1`u!^%T!_!c%T!c!}1`!}#R%T#R#S1`#S#T%T#T#o1`#p$g%T$g~1`x1g]$PW'lpOt%Ttu1`u!Q%T!Q![1`![!^%T!_!c%T!c!}1`!}#R%T#R#S1`#S#T%T#T#o1`#p$g%T$g~1`&i2k_$PW#uS'V%k'cpOt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$g%T$g~2`[3q_$PW#uSOt%Ttu3ju}%T}!O3j!O!Q%T!Q![3j![!^%T!_!c%T!c!}3j!}#R%T#R#S3j#S#T%T#T#o3j#p$g%T$g~3j$O4wS#X#v$PWO!^%T!_!`5T!`#o%T#p~%T$O5[R$PW#j#vO!^%T!_#o%T#p~%T%r5lU'u%j$PWOv%Tvw6Ow!^%T!_!`5T!`#o%T#p~%T$O6VS$PW#d#vO!^%T!_!`5T!`#o%T#p~%T'u6jZ$PW]!ROY6cYZ7]Zw6cwx*rx!^6c!^!_8T!_#O6c#O#P:T#P#o6c#o#p8T#p~6c&r7bV$PWOw7]wx*Px!^7]!^!_7w!_#o7]#o#p7w#p~7]&j7zROw7wwx*mx~7w'm8YV]!ROY8TYZ7wZw8Twx+px#O8T#O#P8o#P~8T'm8rROw8Twx8{x~8T'm9SU#z&j]!ROY9fZw9fwx-Vx#O9f#O#P9}#P~9f!R9kU]!ROY9fZw9fwx-Vx#O9f#O#P9}#P~9f!R:QPO~9f'u:YV$PWOw6cwx:ox!^6c!^!_8T!_#o6c#o#p8T#p~6c'u:xZ#z&j$PW]!ROY;kYZ%TZw;kwx/rx!^;k!^!_9f!_#O;k#O#P<e#P#o;k#o#p9f#p~;k!Z;rZ$PW]!ROY;kYZ%TZw;kwx/rx!^;k!^!_9f!_#O;k#O#P<e#P#o;k#o#p9f#p~;k!Z<jT$PWO!^;k!^!_9f!_#o;k#o#p9f#p~;k%V=QR!`$}$PWO!^%T!_#o%T#p~%TZ=bR!_R$PWO!^%T!_#o%T#p~%T%R=tU'W!R#Y#v$PWOz%Tz{>W{!^%T!_!`5T!`#o%T#p~%T$O>_S#V#v$PWO!^%T!_!`5T!`#o%T#p~%T$u>rSi$m$PWO!^%T!_!`5T!`#o%T#p~%T&i?VR}&a$PWO!^%T!_#o%T#p~%T&i?gVr%n$PWO!O%T!O!P?|!P!Q%T!Q![@r![!^%T!_#o%T#p~%Ty@RT$PWO!O%T!O!P@b!P!^%T!_#o%T#p~%Ty@iR|q$PWO!^%T!_#o%T#p~%Ty@yZ$PWjqO!Q%T!Q![@r![!^%T!_!g%T!g!hAl!h#R%T#R#S@r#S#X%T#X#YAl#Y#o%T#p~%TyAqZ$PWO{%T{|Bd|}%T}!OBd!O!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%TyBiV$PWO!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%TyCVV$PWjqO!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%T,TCs`$PW#W#vOYDuYZ%TZzDuz{Jl{!PDu!P!Q!-e!Q!^Du!^!_Fx!_!`!.^!`!a!/]!a!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~DuXD|[$PWyPOYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~DuXEy_$PWyPO!^%T!_#Z%T#Z#[Er#[#]%T#]#^Er#^#a%T#a#bEr#b#g%T#g#hEr#h#i%T#i#jEr#j#m%T#m#nEr#n#o%T#p~%TPF}VyPOYFxZ!PFx!P!QGd!Q!}Fx!}#OG{#O#PHh#P~FxPGiUyP#Z#[Gd#]#^Gd#a#bGd#g#hGd#i#jGd#m#nGdPHOTOYG{Z#OG{#O#PH_#P#QFx#Q~G{PHbQOYG{Z~G{PHkQOYFxZ~FxXHvY$PWOYHqYZ%TZ!^Hq!^!_G{!_#OHq#O#PIf#P#QDu#Q#oHq#o#pG{#p~HqXIkV$PWOYHqYZ%TZ!^Hq!^!_G{!_#oHq#o#pG{#p~HqXJVV$PWOYDuYZ%TZ!^Du!^!_Fx!_#oDu#o#pFx#p~Du,TJs^$PWyPOYJlYZKoZzJlz{NQ{!PJl!P!Q!,R!Q!^Jl!^!_!!]!_!}Jl!}#O!'|#O#P!+a#P#oJl#o#p!!]#p~Jl,TKtV$PWOzKoz{LZ{!^Ko!^!_M]!_#oKo#o#pM]#p~Ko,TL`X$PWOzKoz{LZ{!PKo!P!QL{!Q!^Ko!^!_M]!_#oKo#o#pM]#p~Ko,TMSR$PWT+{O!^%T!_#o%T#p~%T+{M`ROzM]z{Mi{~M]+{MlTOzM]z{Mi{!PM]!P!QM{!Q~M]+{NQOT+{,TNX^$PWyPOYJlYZKoZzJlz{NQ{!PJl!P!Q! T!Q!^Jl!^!_!!]!_!}Jl!}#O!'|#O#P!+a#P#oJl#o#p!!]#p~Jl,T! ^_$PWT+{yPO!^%T!_#Z%T#Z#[Er#[#]%T#]#^Er#^#a%T#a#bEr#b#g%T#g#hEr#h#i%T#i#jEr#j#m%T#m#nEr#n#o%T#p~%T+{!!bYyPOY!!]YZM]Zz!!]z{!#Q{!P!!]!P!Q!&x!Q!}!!]!}#O!$`#O#P!&f#P~!!]+{!#VYyPOY!!]YZM]Zz!!]z{!#Q{!P!!]!P!Q!#u!Q!}!!]!}#O!$`#O#P!&f#P~!!]+{!#|UT+{yP#Z#[Gd#]#^Gd#a#bGd#g#hGd#i#jGd#m#nGd+{!$cWOY!$`YZM]Zz!$`z{!${{#O!$`#O#P!&S#P#Q!!]#Q~!$`+{!%OYOY!$`YZM]Zz!$`z{!${{!P!$`!P!Q!%n!Q#O!$`#O#P!&S#P#Q!!]#Q~!$`+{!%sTT+{OYG{Z#OG{#O#PH_#P#QFx#Q~G{+{!&VTOY!$`YZM]Zz!$`z{!${{~!$`+{!&iTOY!!]YZM]Zz!!]z{!#Q{~!!]+{!&}_yPOzM]z{Mi{#ZM]#Z#[!&x#[#]M]#]#^!&x#^#aM]#a#b!&x#b#gM]#g#h!&x#h#iM]#i#j!&x#j#mM]#m#n!&x#n~M],T!(R[$PWOY!'|YZKoZz!'|z{!(w{!^!'|!^!_!$`!_#O!'|#O#P!*o#P#QJl#Q#o!'|#o#p!$`#p~!'|,T!(|^$PWOY!'|YZKoZz!'|z{!(w{!P!'|!P!Q!)x!Q!^!'|!^!_!$`!_#O!'|#O#P!*o#P#QJl#Q#o!'|#o#p!$`#p~!'|,T!*PY$PWT+{OYHqYZ%TZ!^Hq!^!_G{!_#OHq#O#PIf#P#QDu#Q#oHq#o#pG{#p~Hq,T!*tX$PWOY!'|YZKoZz!'|z{!(w{!^!'|!^!_!$`!_#o!'|#o#p!$`#p~!'|,T!+fX$PWOYJlYZKoZzJlz{NQ{!^Jl!^!_!!]!_#oJl#o#p!!]#p~Jl,T!,Yc$PWyPOzKoz{LZ{!^Ko!^!_M]!_#ZKo#Z#[!,R#[#]Ko#]#^!,R#^#aKo#a#b!,R#b#gKo#g#h!,R#h#iKo#i#j!,R#j#mKo#m#n!,R#n#oKo#o#pM]#p~Ko,T!-lV$PWS+{OY!-eYZ%TZ!^!-e!^!_!.R!_#o!-e#o#p!.R#p~!-e+{!.WQS+{OY!.RZ~!.R$P!.g[$PW#j#vyPOYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~Du]!/f[#rS$PWyPOYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~Duy!0cd$PWjqO!O%T!O!P@r!P!Q%T!Q![!1q![!^%T!_!g%T!g!hAl!h#R%T#R#S!1q#S#U%T#U#V!3X#V#X%T#X#YAl#Y#b%T#b#c!2w#c#d!4g#d#l%T#l#m!5o#m#o%T#p~%Ty!1x_$PWjqO!O%T!O!P@r!P!Q%T!Q![!1q![!^%T!_!g%T!g!hAl!h#R%T#R#S!1q#S#X%T#X#YAl#Y#b%T#b#c!2w#c#o%T#p~%Ty!3OR$PWjqO!^%T!_#o%T#p~%Ty!3^W$PWO!Q%T!Q!R!3v!R!S!3v!S!^%T!_#R%T#R#S!3v#S#o%T#p~%Ty!3}W$PWjqO!Q%T!Q!R!3v!R!S!3v!S!^%T!_#R%T#R#S!3v#S#o%T#p~%Ty!4lV$PWO!Q%T!Q!Y!5R!Y!^%T!_#R%T#R#S!5R#S#o%T#p~%Ty!5YV$PWjqO!Q%T!Q!Y!5R!Y!^%T!_#R%T#R#S!5R#S#o%T#p~%Ty!5tZ$PWO!Q%T!Q![!6g![!^%T!_!c%T!c!i!6g!i#R%T#R#S!6g#S#T%T#T#Z!6g#Z#o%T#p~%Ty!6nZ$PWjqO!Q%T!Q![!6g![!^%T!_!c%T!c!i!6g!i#R%T#R#S!6g#S#T%T#T#Z!6g#Z#o%T#p~%T%w!7jR!XV$PW#h%hO!^%T!_#o%T#p~%T!P!7zR^w$PWO!^%T!_#o%T#p~%T+c!8`R'[d!]%Y#s&s'yP!P!Q!8i!^!_!8n!_!`!8{W!8nO$RW#v!8sP#Z#v!_!`!8v#v!8{O#j#v#v!9QO#[#v%w!9XT!w%o$PWO!^%T!_!`'v!`!a!9h!a#o%T#p~%T$P!9oR#R#w$PWO!^%T!_#o%T#p~%T%w!:TT'Z!s#[#v#|S$PWO!^%T!_!`!:d!`!a!:t!a#o%T#p~%T$O!:kR#[#v$PWO!^%T!_#o%T#p~%T$O!:{T#Z#v$PWO!^%T!_!`5T!`!a!;[!a#o%T#p~%T$O!;cS#Z#v$PWO!^%T!_!`5T!`#o%T#p~%T%w!;vV'm%o$PWO!O%T!O!P!<]!P!^%T!_!a%T!a!b!<m!b#o%T#p~%T$`!<dRs$W$PWO!^%T!_#o%T#p~%T$O!<tS$PW#e#vO!^%T!_!`5T!`#o%T#p~%T&e!=XRu&]$PWO!^%T!_#o%T#p~%TZ!=iRzR$PWO!^%T!_#o%T#p~%T$O!=yS#b#v$PWO!^%T!_!`5T!`#o%T#p~%T$P!>^R$PW'`#wO!^%T!_#o%T#p~%T~!>lO!P~%r!>sT't%j$PWO!^%T!_!`5T!`#o%T#p#q!<m#q~%T$u!?]R!O$k$PW'bQO!^%T!_#o%T#p~%TX!?mR!gP$PWO!^%T!_#o%T#p~%T,T!@Tr$PW'S+{#uS'V%k'cpOX%TXY%cYZ%TZ[%c[p%Tpq%cqt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$f%T$f$g%c$g#BY2`#BY#BZ!?v#BZ$IS2`$IS$I_!?v$I_$JT2`$JT$JU!?v$JU$KV2`$KV$KW!?v$KW&FU2`&FU&FV!?v&FV?HT2`?HT?HU!?v?HU~2`,T!Bl_$PW'T+{#uS'V%k'cpOt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$g%T$g~2`",
  tokenizers: [noSemicolon, incdecToken, template, 0, 1, 2, 3, 4, 5, 6, 7, 8, insertSemicolon],
  topRules: {"Script":[0,6]},
  dialects: {jsx: 11230, ts: 11232},
  dynamicPrecedences: {"144":1,"171":1},
  specialized: [{term: 283, get: (value, stack) => (tsExtends(value, stack) << 1)},{term: 283, get: value => spec_identifier[value] || -1},{term: 295, get: value => spec_word[value] || -1},{term: 59, get: value => spec_LessThan[value] || -1}],
  tokenPrec: 11253
});

let nextTagID = 0;
/**
Highlighting tags are markers that denote a highlighting category.
They are [associated](https://codemirror.net/6/docs/ref/#highlight.styleTags) with parts of a syntax
tree by a language mode, and then mapped to an actual CSS style by
a [highlight style](https://codemirror.net/6/docs/ref/#highlight.HighlightStyle).

Because syntax tree node types and highlight styles have to be
able to talk the same language, CodeMirror uses a mostly _closed_
[vocabulary](https://codemirror.net/6/docs/ref/#highlight.tags) of syntax tags (as opposed to
traditional open string-based systems, which make it hard for
highlighting themes to cover all the tokens produced by the
various languages).

It _is_ possible to [define](https://codemirror.net/6/docs/ref/#highlight.Tag^define) your own
highlighting tags for system-internal use (where you control both
the language package and the highlighter), but such tags will not
be picked up by regular highlighters (though you can derive them
from standard tags to allow highlighters to fall back to those).
*/
class Tag {
    /**
    @internal
    */
    constructor(
    /**
    The set of tags that match this tag, starting with this one
    itself, sorted in order of decreasing specificity. @internal
    */
    set, 
    /**
    The base unmodified tag that this one is based on, if it's
    modified @internal
    */
    base, 
    /**
    The modifiers applied to this.base @internal
    */
    modified) {
        this.set = set;
        this.base = base;
        this.modified = modified;
        /**
        @internal
        */
        this.id = nextTagID++;
    }
    /**
    Define a new tag. If `parent` is given, the tag is treated as a
    sub-tag of that parent, and [highlight
    styles](https://codemirror.net/6/docs/ref/#highlight.HighlightStyle) that don't mention this tag
    will try to fall back to the parent tag (or grandparent tag,
    etc).
    */
    static define(parent) {
        if (parent === null || parent === void 0 ? void 0 : parent.base)
            throw new Error("Can not derive from a modified tag");
        let tag = new Tag([], null, []);
        tag.set.push(tag);
        if (parent)
            for (let t of parent.set)
                tag.set.push(t);
        return tag;
    }
    /**
    Define a tag _modifier_, which is a function that, given a tag,
    will return a tag that is a subtag of the original. Applying the
    same modifier to a twice tag will return the same value (`m1(t1)
    == m1(t1)`) and applying multiple modifiers will, regardless or
    order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
    
    When multiple modifiers are applied to a given base tag, each
    smaller set of modifiers is registered as a parent, so that for
    example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
    `m1(m3(t1)`, and so on.
    */
    static defineModifier() {
        let mod = new Modifier;
        return (tag) => {
            if (tag.modified.indexOf(mod) > -1)
                return tag;
            return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
        };
    }
}
let nextModifierID = 0;
class Modifier {
    constructor() {
        this.instances = [];
        this.id = nextModifierID++;
    }
    static get(base, mods) {
        if (!mods.length)
            return base;
        let exists = mods[0].instances.find(t => t.base == base && sameArray(mods, t.modified));
        if (exists)
            return exists;
        let set = [], tag = new Tag(set, base, mods);
        for (let m of mods)
            m.instances.push(tag);
        let configs = permute(mods);
        for (let parent of base.set)
            for (let config of configs)
                set.push(Modifier.get(parent, config));
        return tag;
    }
}
function sameArray(a, b) {
    return a.length == b.length && a.every((x, i) => x == b[i]);
}
function permute(array) {
    let result = [array];
    for (let i = 0; i < array.length; i++) {
        for (let a of permute(array.slice(0, i).concat(array.slice(i + 1))))
            result.push(a);
    }
    return result;
}
/**
This function is used to add a set of tags to a language syntax
via
[`LRParser.configure`](https://lezer.codemirror.net/docs/ref#lr.LRParser.configure).

The argument object maps node selectors to [highlighting
tags](https://codemirror.net/6/docs/ref/#highlight.Tag) or arrays of tags.

Node selectors may hold one or more (space-separated) node paths.
Such a path can be a [node
name](https://lezer.codemirror.net/docs/ref#common.NodeType.name),
or multiple node names (or `*` wildcards) separated by slash
characters, as in `"Block/Declaration/VariableName"`. Such a path
matches the final node but only if its direct parent nodes are the
other nodes mentioned. A `*` in such a path matches any parent,
but only a single level—wildcards that match multiple parents
aren't supported, both for efficiency reasons and because Lezer
trees make it rather hard to reason about what they would match.)

A path can be ended with `/...` to indicate that the tag assigned
to the node should also apply to all child nodes, even if they
match their own style (by default, only the innermost style is
used).

When a path ends in `!`, as in `Attribute!`, no further matching
happens for the node's child nodes, and the entire node gets the
given style.

In this notation, node names that contain `/`, `!`, `*`, or `...`
must be quoted as JSON strings.

For example:

```javascript
parser.withProps(
  styleTags({
    // Style Number and BigNumber nodes
    "Number BigNumber": tags.number,
    // Style Escape nodes whose parent is String
    "String/Escape": tags.escape,
    // Style anything inside Attributes nodes
    "Attributes!": tags.meta,
    // Add a style to all content inside Italic nodes
    "Italic/...": tags.emphasis,
    // Style InvalidString nodes as both `string` and `invalid`
    "InvalidString": [tags.string, tags.invalid],
    // Style the node named "/" as punctuation
    '"/"': tags.punctuation
  })
)
```
*/
function styleTags(spec) {
    let byName = Object.create(null);
    for (let prop in spec) {
        let tags = spec[prop];
        if (!Array.isArray(tags))
            tags = [tags];
        for (let part of prop.split(" "))
            if (part) {
                let pieces = [], mode = 2 /* Normal */, rest = part;
                for (let pos = 0;;) {
                    if (rest == "..." && pos > 0 && pos + 3 == part.length) {
                        mode = 1 /* Inherit */;
                        break;
                    }
                    let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
                    if (!m)
                        throw new RangeError("Invalid path: " + part);
                    pieces.push(m[0] == "*" ? null : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
                    pos += m[0].length;
                    if (pos == part.length)
                        break;
                    let next = part[pos++];
                    if (pos == part.length && next == "!") {
                        mode = 0 /* Opaque */;
                        break;
                    }
                    if (next != "/")
                        throw new RangeError("Invalid path: " + part);
                    rest = part.slice(pos);
                }
                let last = pieces.length - 1, inner = pieces[last];
                if (!inner)
                    throw new RangeError("Invalid path: " + part);
                let rule = new Rule(tags, mode, last > 0 ? pieces.slice(0, last) : null);
                byName[inner] = rule.sort(byName[inner]);
            }
    }
    return ruleNodeProp.add(byName);
}
const ruleNodeProp = /*@__PURE__*/new NodeProp();
const highlightStyle = /*@__PURE__*/Facet.define({
    combine(stylings) { return stylings.length ? HighlightStyle.combinedMatch(stylings) : null; }
});
const fallbackHighlightStyle = /*@__PURE__*/Facet.define({
    combine(values) { return values.length ? values[0].match : null; }
});
function getHighlightStyle(state) {
    return state.facet(highlightStyle) || state.facet(fallbackHighlightStyle);
}
class Rule {
    constructor(tags, mode, context, next) {
        this.tags = tags;
        this.mode = mode;
        this.context = context;
        this.next = next;
    }
    sort(other) {
        if (!other || other.depth < this.depth) {
            this.next = other;
            return this;
        }
        other.next = this.sort(other.next);
        return other;
    }
    get depth() { return this.context ? this.context.length : 0; }
}
/**
A highlight style associates CSS styles with higlighting
[tags](https://codemirror.net/6/docs/ref/#highlight.Tag).
*/
class HighlightStyle {
    constructor(spec, options) {
        this.map = Object.create(null);
        let modSpec;
        function def(spec) {
            let cls = StyleModule.newName();
            (modSpec || (modSpec = Object.create(null)))["." + cls] = spec;
            return cls;
        }
        this.all = typeof options.all == "string" ? options.all : options.all ? def(options.all) : null;
        for (let style of spec) {
            let cls = (style.class || def(Object.assign({}, style, { tag: null }))) +
                (this.all ? " " + this.all : "");
            let tags = style.tag;
            if (!Array.isArray(tags))
                this.map[tags.id] = cls;
            else
                for (let tag of tags)
                    this.map[tag.id] = cls;
        }
        this.module = modSpec ? new StyleModule(modSpec) : null;
        this.scope = options.scope || null;
        this.match = this.match.bind(this);
        let ext = [treeHighlighter];
        if (this.module)
            ext.push(EditorView.styleModule.of(this.module));
        this.extension = ext.concat(highlightStyle.of(this));
        this.fallback = ext.concat(fallbackHighlightStyle.of(this));
    }
    /**
    Returns the CSS class associated with the given tag, if any.
    This method is bound to the instance by the constructor.
    */
    match(tag, scope) {
        if (this.scope && scope != this.scope)
            return null;
        for (let t of tag.set) {
            let match = this.map[t.id];
            if (match !== undefined) {
                if (t != tag)
                    this.map[tag.id] = match;
                return match;
            }
        }
        return this.map[tag.id] = this.all;
    }
    /**
    Combines an array of highlight styles into a single match
    function that returns all of the classes assigned by the styles
    for a given tag.
    */
    static combinedMatch(styles) {
        if (styles.length == 1)
            return styles[0].match;
        let cache = styles.some(s => s.scope) ? undefined : Object.create(null);
        return (tag, scope) => {
            let cached = cache && cache[tag.id];
            if (cached !== undefined)
                return cached;
            let result = null;
            for (let style of styles) {
                let value = style.match(tag, scope);
                if (value)
                    result = result ? result + " " + value : value;
            }
            if (cache)
                cache[tag.id] = result;
            return result;
        };
    }
    /**
    Create a highlighter style that associates the given styles to
    the given tags. The spec must be objects that hold a style tag
    or array of tags in their `tag` property, and either a single
    `class` property providing a static CSS class (for highlighters
    like [`classHighlightStyle`](https://codemirror.net/6/docs/ref/#highlight.classHighlightStyle)
    that rely on external styling), or a
    [`style-mod`](https://github.com/marijnh/style-mod#documentation)-style
    set of CSS properties (which define the styling for those tags).
    
    The CSS rules created for a highlighter will be emitted in the
    order of the spec's properties. That means that for elements that
    have multiple tags associated with them, styles defined further
    down in the list will have a higher CSS precedence than styles
    defined earlier.
    */
    static define(specs, options) {
        return new HighlightStyle(specs, options || {});
    }
    /**
    Returns the CSS classes (if any) that the highlight styles
    active in the given state would assign to the given a style
    [tag](https://codemirror.net/6/docs/ref/#highlight.Tag) and (optional) language
    [scope](https://codemirror.net/6/docs/ref/#highlight.HighlightStyle^define^options.scope).
    */
    static get(state, tag, scope) {
        let style = getHighlightStyle(state);
        return style && style(tag, scope || NodeType.none);
    }
}
class TreeHighlighter {
    constructor(view) {
        this.markCache = Object.create(null);
        this.tree = syntaxTree(view.state);
        this.decorations = this.buildDeco(view, getHighlightStyle(view.state));
    }
    update(update) {
        let tree = syntaxTree(update.state), style = getHighlightStyle(update.state);
        let styleChange = style != update.startState.facet(highlightStyle);
        if (tree.length < update.view.viewport.to && !styleChange && tree.type == this.tree.type) {
            this.decorations = this.decorations.map(update.changes);
        }
        else if (tree != this.tree || update.viewportChanged || styleChange) {
            this.tree = tree;
            this.decorations = this.buildDeco(update.view, style);
        }
    }
    buildDeco(view, match) {
        if (!match || !this.tree.length)
            return Decoration.none;
        let builder = new RangeSetBuilder();
        for (let { from, to } of view.visibleRanges) {
            highlightTreeRange(this.tree, from, to, match, (from, to, style) => {
                builder.add(from, to, this.markCache[style] || (this.markCache[style] = Decoration.mark({ class: style })));
            });
        }
        return builder.finish();
    }
}
// This extension installs a highlighter that highlights based on the
// syntax tree and highlight style.
const treeHighlighter = /*@__PURE__*/Prec.extend(/*@__PURE__*/ViewPlugin.fromClass(TreeHighlighter, {
    decorations: v => v.decorations
}));
const nodeStack = [""];
class HighlightBuilder {
    constructor(at, style, span) {
        this.at = at;
        this.style = style;
        this.span = span;
        this.class = "";
    }
    startSpan(at, cls) {
        if (cls != this.class) {
            this.flush(at);
            if (at > this.at)
                this.at = at;
            this.class = cls;
        }
    }
    flush(to) {
        if (to > this.at && this.class)
            this.span(this.at, to, this.class);
    }
    highlightRange(cursor, from, to, inheritedClass, depth, scope) {
        let { type, from: start, to: end } = cursor;
        if (start >= to || end <= from)
            return;
        nodeStack[depth] = type.name;
        if (type.isTop)
            scope = type;
        let cls = inheritedClass;
        let rule = type.prop(ruleNodeProp), opaque = false;
        while (rule) {
            if (!rule.context || matchContext(rule.context, nodeStack, depth)) {
                for (let tag of rule.tags) {
                    let st = this.style(tag, scope);
                    if (st) {
                        if (cls)
                            cls += " ";
                        cls += st;
                        if (rule.mode == 1 /* Inherit */)
                            inheritedClass += (inheritedClass ? " " : "") + st;
                        else if (rule.mode == 0 /* Opaque */)
                            opaque = true;
                    }
                }
                break;
            }
            rule = rule.next;
        }
        this.startSpan(cursor.from, cls);
        if (opaque)
            return;
        let mounted = cursor.tree && cursor.tree.prop(NodeProp.mounted);
        if (mounted && mounted.overlay) {
            let inner = cursor.node.enter(mounted.overlay[0].from + start, 1);
            let hasChild = cursor.firstChild();
            for (let i = 0, pos = start;; i++) {
                let next = i < mounted.overlay.length ? mounted.overlay[i] : null;
                let nextPos = next ? next.from + start : end;
                let rangeFrom = Math.max(from, pos), rangeTo = Math.min(to, nextPos);
                if (rangeFrom < rangeTo && hasChild) {
                    while (cursor.from < rangeTo) {
                        this.highlightRange(cursor, rangeFrom, rangeTo, inheritedClass, depth + 1, scope);
                        this.startSpan(Math.min(to, cursor.to), cls);
                        if (cursor.to >= nextPos || !cursor.nextSibling())
                            break;
                    }
                }
                if (!next || nextPos > to)
                    break;
                pos = next.to + start;
                if (pos > from) {
                    this.highlightRange(inner.cursor, Math.max(from, next.from + start), Math.min(to, pos), inheritedClass, depth, mounted.tree.type);
                    this.startSpan(pos, cls);
                }
            }
            if (hasChild)
                cursor.parent();
        }
        else if (cursor.firstChild()) {
            do {
                if (cursor.to <= from)
                    continue;
                if (cursor.from >= to)
                    break;
                this.highlightRange(cursor, from, to, inheritedClass, depth + 1, scope);
                this.startSpan(Math.min(to, cursor.to), cls);
            } while (cursor.nextSibling());
            cursor.parent();
        }
    }
}
function highlightTreeRange(tree, from, to, style, span) {
    let builder = new HighlightBuilder(from, style, span);
    builder.highlightRange(tree.cursor(), from, to, "", 0, tree.type);
    builder.flush(to);
}
function matchContext(context, stack, depth) {
    if (context.length > depth - 1)
        return false;
    for (let d = depth - 1, i = context.length - 1; i >= 0; i--, d--) {
        let check = context[i];
        if (check && check != stack[d])
            return false;
    }
    return true;
}
const t = Tag.define;
const comment = /*@__PURE__*/t(), name = /*@__PURE__*/t(), typeName = /*@__PURE__*/t(name), propertyName = /*@__PURE__*/t(name), literal = /*@__PURE__*/t(), string = /*@__PURE__*/t(literal), number = /*@__PURE__*/t(literal), content = /*@__PURE__*/t(), heading = /*@__PURE__*/t(content), keyword = /*@__PURE__*/t(), operator = /*@__PURE__*/t(), punctuation = /*@__PURE__*/t(), bracket = /*@__PURE__*/t(punctuation), meta = /*@__PURE__*/t();
/**
The default set of highlighting [tags](https://codemirror.net/6/docs/ref/#highlight.Tag^define) used
by regular language packages and themes.

This collection is heavily biased towards programming languages,
and necessarily incomplete. A full ontology of syntactic
constructs would fill a stack of books, and be impractical to
write themes for. So try to make do with this set. If all else
fails, [open an
issue](https://github.com/codemirror/codemirror.next) to propose a
new tag, or [define](https://codemirror.net/6/docs/ref/#highlight.Tag^define) a local custom tag for
your use case.

Note that it is not obligatory to always attach the most specific
tag possible to an element—if your grammar can't easily
distinguish a certain type of element (such as a local variable),
it is okay to style it as its more general variant (a variable).

For tags that extend some parent tag, the documentation links to
the parent.
*/
const tags = {
    /**
    A comment.
    */
    comment,
    /**
    A line [comment](https://codemirror.net/6/docs/ref/#highlight.tags.comment).
    */
    lineComment: /*@__PURE__*/t(comment),
    /**
    A block [comment](https://codemirror.net/6/docs/ref/#highlight.tags.comment).
    */
    blockComment: /*@__PURE__*/t(comment),
    /**
    A documentation [comment](https://codemirror.net/6/docs/ref/#highlight.tags.comment).
    */
    docComment: /*@__PURE__*/t(comment),
    /**
    Any kind of identifier.
    */
    name,
    /**
    The [name](https://codemirror.net/6/docs/ref/#highlight.tags.name) of a variable.
    */
    variableName: /*@__PURE__*/t(name),
    /**
    A type [name](https://codemirror.net/6/docs/ref/#highlight.tags.name).
    */
    typeName: typeName,
    /**
    A tag name (subtag of [`typeName`](https://codemirror.net/6/docs/ref/#highlight.tags.typeName)).
    */
    tagName: /*@__PURE__*/t(typeName),
    /**
    A property or field [name](https://codemirror.net/6/docs/ref/#highlight.tags.name).
    */
    propertyName: propertyName,
    /**
    An attribute name (subtag of [`propertyName`](https://codemirror.net/6/docs/ref/#highlight.tags.propertyName)).
    */
    attributeName: /*@__PURE__*/t(propertyName),
    /**
    The [name](https://codemirror.net/6/docs/ref/#highlight.tags.name) of a class.
    */
    className: /*@__PURE__*/t(name),
    /**
    A label [name](https://codemirror.net/6/docs/ref/#highlight.tags.name).
    */
    labelName: /*@__PURE__*/t(name),
    /**
    A namespace [name](https://codemirror.net/6/docs/ref/#highlight.tags.name).
    */
    namespace: /*@__PURE__*/t(name),
    /**
    The [name](https://codemirror.net/6/docs/ref/#highlight.tags.name) of a macro.
    */
    macroName: /*@__PURE__*/t(name),
    /**
    A literal value.
    */
    literal,
    /**
    A string [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
    */
    string,
    /**
    A documentation [string](https://codemirror.net/6/docs/ref/#highlight.tags.string).
    */
    docString: /*@__PURE__*/t(string),
    /**
    A character literal (subtag of [string](https://codemirror.net/6/docs/ref/#highlight.tags.string)).
    */
    character: /*@__PURE__*/t(string),
    /**
    An attribute value (subtag of [string](https://codemirror.net/6/docs/ref/#highlight.tags.string)).
    */
    attributeValue: /*@__PURE__*/t(string),
    /**
    A number [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
    */
    number,
    /**
    An integer [number](https://codemirror.net/6/docs/ref/#highlight.tags.number) literal.
    */
    integer: /*@__PURE__*/t(number),
    /**
    A floating-point [number](https://codemirror.net/6/docs/ref/#highlight.tags.number) literal.
    */
    float: /*@__PURE__*/t(number),
    /**
    A boolean [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
    */
    bool: /*@__PURE__*/t(literal),
    /**
    Regular expression [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
    */
    regexp: /*@__PURE__*/t(literal),
    /**
    An escape [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal), for example a
    backslash escape in a string.
    */
    escape: /*@__PURE__*/t(literal),
    /**
    A color [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
    */
    color: /*@__PURE__*/t(literal),
    /**
    A URL [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
    */
    url: /*@__PURE__*/t(literal),
    /**
    A language keyword.
    */
    keyword,
    /**
    The [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) for the self or this
    object.
    */
    self: /*@__PURE__*/t(keyword),
    /**
    The [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) for null.
    */
    null: /*@__PURE__*/t(keyword),
    /**
    A [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) denoting some atomic value.
    */
    atom: /*@__PURE__*/t(keyword),
    /**
    A [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) that represents a unit.
    */
    unit: /*@__PURE__*/t(keyword),
    /**
    A modifier [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword).
    */
    modifier: /*@__PURE__*/t(keyword),
    /**
    A [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) that acts as an operator.
    */
    operatorKeyword: /*@__PURE__*/t(keyword),
    /**
    A control-flow related [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword).
    */
    controlKeyword: /*@__PURE__*/t(keyword),
    /**
    A [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) that defines something.
    */
    definitionKeyword: /*@__PURE__*/t(keyword),
    /**
    An operator.
    */
    operator,
    /**
    An [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator) that defines something.
    */
    derefOperator: /*@__PURE__*/t(operator),
    /**
    Arithmetic-related [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
    */
    arithmeticOperator: /*@__PURE__*/t(operator),
    /**
    Logical [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
    */
    logicOperator: /*@__PURE__*/t(operator),
    /**
    Bit [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
    */
    bitwiseOperator: /*@__PURE__*/t(operator),
    /**
    Comparison [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
    */
    compareOperator: /*@__PURE__*/t(operator),
    /**
    [Operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator) that updates its operand.
    */
    updateOperator: /*@__PURE__*/t(operator),
    /**
    [Operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator) that defines something.
    */
    definitionOperator: /*@__PURE__*/t(operator),
    /**
    Type-related [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
    */
    typeOperator: /*@__PURE__*/t(operator),
    /**
    Control-flow [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
    */
    controlOperator: /*@__PURE__*/t(operator),
    /**
    Program or markup punctuation.
    */
    punctuation,
    /**
    [Punctuation](https://codemirror.net/6/docs/ref/#highlight.tags.punctuation) that separates
    things.
    */
    separator: /*@__PURE__*/t(punctuation),
    /**
    Bracket-style [punctuation](https://codemirror.net/6/docs/ref/#highlight.tags.punctuation).
    */
    bracket,
    /**
    Angle [brackets](https://codemirror.net/6/docs/ref/#highlight.tags.bracket) (usually `<` and `>`
    tokens).
    */
    angleBracket: /*@__PURE__*/t(bracket),
    /**
    Square [brackets](https://codemirror.net/6/docs/ref/#highlight.tags.bracket) (usually `[` and `]`
    tokens).
    */
    squareBracket: /*@__PURE__*/t(bracket),
    /**
    Parentheses (usually `(` and `)` tokens). Subtag of
    [bracket](https://codemirror.net/6/docs/ref/#highlight.tags.bracket).
    */
    paren: /*@__PURE__*/t(bracket),
    /**
    Braces (usually `{` and `}` tokens). Subtag of
    [bracket](https://codemirror.net/6/docs/ref/#highlight.tags.bracket).
    */
    brace: /*@__PURE__*/t(bracket),
    /**
    Content, for example plain text in XML or markup documents.
    */
    content,
    /**
    [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that represents a heading.
    */
    heading,
    /**
    A level 1 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
    */
    heading1: /*@__PURE__*/t(heading),
    /**
    A level 2 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
    */
    heading2: /*@__PURE__*/t(heading),
    /**
    A level 3 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
    */
    heading3: /*@__PURE__*/t(heading),
    /**
    A level 4 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
    */
    heading4: /*@__PURE__*/t(heading),
    /**
    A level 5 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
    */
    heading5: /*@__PURE__*/t(heading),
    /**
    A level 6 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
    */
    heading6: /*@__PURE__*/t(heading),
    /**
    A prose separator (such as a horizontal rule).
    */
    contentSeparator: /*@__PURE__*/t(content),
    /**
    [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that represents a list.
    */
    list: /*@__PURE__*/t(content),
    /**
    [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that represents a quote.
    */
    quote: /*@__PURE__*/t(content),
    /**
    [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that is emphasized.
    */
    emphasis: /*@__PURE__*/t(content),
    /**
    [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that is styled strong.
    */
    strong: /*@__PURE__*/t(content),
    /**
    [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that is part of a link.
    */
    link: /*@__PURE__*/t(content),
    /**
    [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that is styled as code or
    monospace.
    */
    monospace: /*@__PURE__*/t(content),
    /**
    [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that has a strike-through
    style.
    */
    strikethrough: /*@__PURE__*/t(content),
    /**
    Inserted text in a change-tracking format.
    */
    inserted: /*@__PURE__*/t(),
    /**
    Deleted text.
    */
    deleted: /*@__PURE__*/t(),
    /**
    Changed text.
    */
    changed: /*@__PURE__*/t(),
    /**
    An invalid or unsyntactic element.
    */
    invalid: /*@__PURE__*/t(),
    /**
    Metadata or meta-instruction.
    */
    meta,
    /**
    [Metadata](https://codemirror.net/6/docs/ref/#highlight.tags.meta) that applies to the entire
    document.
    */
    documentMeta: /*@__PURE__*/t(meta),
    /**
    [Metadata](https://codemirror.net/6/docs/ref/#highlight.tags.meta) that annotates or adds
    attributes to a given syntactic element.
    */
    annotation: /*@__PURE__*/t(meta),
    /**
    Processing instruction or preprocessor directive. Subtag of
    [meta](https://codemirror.net/6/docs/ref/#highlight.tags.meta).
    */
    processingInstruction: /*@__PURE__*/t(meta),
    /**
    [Modifier](https://codemirror.net/6/docs/ref/#highlight.Tag^defineModifier) that indicates that a
    given element is being defined. Expected to be used with the
    various [name](https://codemirror.net/6/docs/ref/#highlight.tags.name) tags.
    */
    definition: /*@__PURE__*/Tag.defineModifier(),
    /**
    [Modifier](https://codemirror.net/6/docs/ref/#highlight.Tag^defineModifier) that indicates that
    something is constant. Mostly expected to be used with
    [variable names](https://codemirror.net/6/docs/ref/#highlight.tags.variableName).
    */
    constant: /*@__PURE__*/Tag.defineModifier(),
    /**
    [Modifier](https://codemirror.net/6/docs/ref/#highlight.Tag^defineModifier) used to indicate that
    a [variable](https://codemirror.net/6/docs/ref/#highlight.tags.variableName) or [property
    name](https://codemirror.net/6/docs/ref/#highlight.tags.propertyName) is being called or defined
    as a function.
    */
    function: /*@__PURE__*/Tag.defineModifier(),
    /**
    [Modifier](https://codemirror.net/6/docs/ref/#highlight.Tag^defineModifier) that can be applied to
    [names](https://codemirror.net/6/docs/ref/#highlight.tags.name) to indicate that they belong to
    the language's standard environment.
    */
    standard: /*@__PURE__*/Tag.defineModifier(),
    /**
    [Modifier](https://codemirror.net/6/docs/ref/#highlight.Tag^defineModifier) that indicates a given
    [names](https://codemirror.net/6/docs/ref/#highlight.tags.name) is local to some scope.
    */
    local: /*@__PURE__*/Tag.defineModifier(),
    /**
    A generic variant [modifier](https://codemirror.net/6/docs/ref/#highlight.Tag^defineModifier) that
    can be used to tag language-specific alternative variants of
    some common tag. It is recommended for themes to define special
    forms of at least the [string](https://codemirror.net/6/docs/ref/#highlight.tags.string) and
    [variable name](https://codemirror.net/6/docs/ref/#highlight.tags.variableName) tags, since those
    come up a lot.
    */
    special: /*@__PURE__*/Tag.defineModifier()
};
/**
A default highlight style (works well with light themes).
*/
const defaultHighlightStyle = /*@__PURE__*/HighlightStyle.define([
    { tag: tags.link,
        textDecoration: "underline" },
    { tag: tags.heading,
        textDecoration: "underline",
        fontWeight: "bold" },
    { tag: tags.emphasis,
        fontStyle: "italic" },
    { tag: tags.strong,
        fontWeight: "bold" },
    { tag: tags.strikethrough,
        textDecoration: "line-through" },
    { tag: tags.keyword,
        color: "#708" },
    { tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
        color: "#219" },
    { tag: [tags.literal, tags.inserted],
        color: "#164" },
    { tag: [tags.string, tags.deleted],
        color: "#a11" },
    { tag: [tags.regexp, tags.escape, /*@__PURE__*/tags.special(tags.string)],
        color: "#e40" },
    { tag: /*@__PURE__*/tags.definition(tags.variableName),
        color: "#00f" },
    { tag: /*@__PURE__*/tags.local(tags.variableName),
        color: "#30a" },
    { tag: [tags.typeName, tags.namespace],
        color: "#085" },
    { tag: tags.className,
        color: "#167" },
    { tag: [/*@__PURE__*/tags.special(tags.variableName), tags.macroName],
        color: "#256" },
    { tag: /*@__PURE__*/tags.definition(tags.propertyName),
        color: "#00c" },
    { tag: tags.comment,
        color: "#940" },
    { tag: tags.meta,
        color: "#7a757a" },
    { tag: tags.invalid,
        color: "#f00" }
]);

function toSet(chars) {
    let flat = Object.keys(chars).join("");
    let words = /\w/.test(flat);
    if (words)
        flat = flat.replace(/\w/g, "");
    return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
}
function prefixMatch(options) {
    let first = Object.create(null), rest = Object.create(null);
    for (let { label } of options) {
        first[label[0]] = true;
        for (let i = 1; i < label.length; i++)
            rest[label[i]] = true;
    }
    let source = toSet(first) + toSet(rest) + "*$";
    return [new RegExp("^" + source), new RegExp(source)];
}
/**
Given a a fixed array of options, return an autocompleter that
completes them.
*/
function completeFromList(list) {
    let options = list.map(o => typeof o == "string" ? { label: o } : o);
    let [span, match] = options.every(o => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
    return (context) => {
        let token = context.matchBefore(match);
        return token || context.explicit ? { from: token ? token.from : context.pos, options, span } : null;
    };
}
/**
Wrap the given completion source so that it will not fire when the
cursor is in a syntax node with one of the given names.
*/
function ifNotIn(nodes, source) {
    return (context) => {
        for (let pos = syntaxTree(context.state).resolveInner(context.pos, -1); pos; pos = pos.parent)
            if (nodes.indexOf(pos.name) > -1)
                return null;
        return source(context);
    };
}

const baseTheme$1 = /*@__PURE__*/EditorView.baseTheme({
    ".cm-tooltip.cm-tooltip-autocomplete": {
        "& > ul": {
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            overflow: "hidden auto",
            maxWidth_fallback: "700px",
            maxWidth: "min(700px, 95vw)",
            minWidth: "250px",
            maxHeight: "10em",
            listStyle: "none",
            margin: 0,
            padding: 0,
            "& > li": {
                overflowX: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
                padding: "1px 3px",
                lineHeight: 1.2
            },
        }
    },
    "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
        background: "#39e",
        color: "white",
    },
    "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
        background: "#347",
        color: "white",
    },
    ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
        content: '"···"',
        opacity: 0.5,
        display: "block",
        textAlign: "center"
    },
    ".cm-tooltip.cm-completionInfo": {
        position: "absolute",
        padding: "3px 9px",
        width: "max-content",
        maxWidth: "300px",
    },
    ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
    ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
    "&light .cm-snippetField": { backgroundColor: "#00000022" },
    "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
    ".cm-snippetFieldPosition": {
        verticalAlign: "text-top",
        width: 0,
        height: "1.15em",
        margin: "0 -0.7px -.7em",
        borderLeft: "1.4px dotted #888"
    },
    ".cm-completionMatchedText": {
        textDecoration: "underline"
    },
    ".cm-completionDetail": {
        marginLeft: "0.5em",
        fontStyle: "italic"
    },
    ".cm-completionIcon": {
        fontSize: "90%",
        width: ".8em",
        display: "inline-block",
        textAlign: "center",
        paddingRight: ".6em",
        opacity: "0.6"
    },
    ".cm-completionIcon-function, .cm-completionIcon-method": {
        "&:after": { content: "'ƒ'" }
    },
    ".cm-completionIcon-class": {
        "&:after": { content: "'○'" }
    },
    ".cm-completionIcon-interface": {
        "&:after": { content: "'◌'" }
    },
    ".cm-completionIcon-variable": {
        "&:after": { content: "'𝑥'" }
    },
    ".cm-completionIcon-constant": {
        "&:after": { content: "'𝐶'" }
    },
    ".cm-completionIcon-type": {
        "&:after": { content: "'𝑡'" }
    },
    ".cm-completionIcon-enum": {
        "&:after": { content: "'∪'" }
    },
    ".cm-completionIcon-property": {
        "&:after": { content: "'□'" }
    },
    ".cm-completionIcon-keyword": {
        "&:after": { content: "'🔑\uFE0E'" } // Disable emoji rendering
    },
    ".cm-completionIcon-namespace": {
        "&:after": { content: "'▢'" }
    },
    ".cm-completionIcon-text": {
        "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
    }
});

class FieldPos {
    constructor(field, line, from, to) {
        this.field = field;
        this.line = line;
        this.from = from;
        this.to = to;
    }
}
class FieldRange {
    constructor(field, from, to) {
        this.field = field;
        this.from = from;
        this.to = to;
    }
    map(changes) {
        return new FieldRange(this.field, changes.mapPos(this.from, -1), changes.mapPos(this.to, 1));
    }
}
class Snippet {
    constructor(lines, fieldPositions) {
        this.lines = lines;
        this.fieldPositions = fieldPositions;
    }
    instantiate(state, pos) {
        let text = [], lineStart = [pos];
        let lineObj = state.doc.lineAt(pos), baseIndent = /^\s*/.exec(lineObj.text)[0];
        for (let line of this.lines) {
            if (text.length) {
                let indent = baseIndent, tabs = /^\t*/.exec(line)[0].length;
                for (let i = 0; i < tabs; i++)
                    indent += state.facet(indentUnit);
                lineStart.push(pos + indent.length - tabs);
                line = indent + line.slice(tabs);
            }
            text.push(line);
            pos += line.length + 1;
        }
        let ranges = this.fieldPositions.map(pos => new FieldRange(pos.field, lineStart[pos.line] + pos.from, lineStart[pos.line] + pos.to));
        return { text, ranges };
    }
    static parse(template) {
        let fields = [];
        let lines = [], positions = [], m;
        for (let line of template.split(/\r\n?|\n/)) {
            while (m = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(line)) {
                let seq = m[1] ? +m[1] : null, name = m[2] || m[3] || "", found = -1;
                for (let i = 0; i < fields.length; i++) {
                    if (seq != null ? fields[i].seq == seq : name ? fields[i].name == name : false)
                        found = i;
                }
                if (found < 0) {
                    let i = 0;
                    while (i < fields.length && (seq == null || (fields[i].seq != null && fields[i].seq < seq)))
                        i++;
                    fields.splice(i, 0, { seq, name });
                    found = i;
                    for (let pos of positions)
                        if (pos.field >= found)
                            pos.field++;
                }
                positions.push(new FieldPos(found, lines.length, m.index, m.index + name.length));
                line = line.slice(0, m.index) + name + line.slice(m.index + m[0].length);
            }
            lines.push(line);
        }
        return new Snippet(lines, positions);
    }
}
let fieldMarker = /*@__PURE__*/Decoration.widget({ widget: /*@__PURE__*/new class extends WidgetType {
        toDOM() {
            let span = document.createElement("span");
            span.className = "cm-snippetFieldPosition";
            return span;
        }
        ignoreEvent() { return false; }
    } });
let fieldRange = /*@__PURE__*/Decoration.mark({ class: "cm-snippetField" });
class ActiveSnippet {
    constructor(ranges, active) {
        this.ranges = ranges;
        this.active = active;
        this.deco = Decoration.set(ranges.map(r => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to)));
    }
    map(changes) {
        return new ActiveSnippet(this.ranges.map(r => r.map(changes)), this.active);
    }
    selectionInsideField(sel) {
        return sel.ranges.every(range => this.ranges.some(r => r.field == this.active && r.from <= range.from && r.to >= range.to));
    }
}
const setActive = /*@__PURE__*/StateEffect.define({
    map(value, changes) { return value && value.map(changes); }
});
const moveToField = /*@__PURE__*/StateEffect.define();
const snippetState = /*@__PURE__*/StateField.define({
    create() { return null; },
    update(value, tr) {
        for (let effect of tr.effects) {
            if (effect.is(setActive))
                return effect.value;
            if (effect.is(moveToField) && value)
                return new ActiveSnippet(value.ranges, effect.value);
        }
        if (value && tr.docChanged)
            value = value.map(tr.changes);
        if (value && tr.selection && !value.selectionInsideField(tr.selection))
            value = null;
        return value;
    },
    provide: f => EditorView.decorations.from(f, val => val ? val.deco : Decoration.none)
});
function fieldSelection(ranges, field) {
    return EditorSelection.create(ranges.filter(r => r.field == field).map(r => EditorSelection.range(r.from, r.to)));
}
/**
Convert a snippet template to a function that can apply it.
Snippets are written using syntax like this:

    "for (let ${index} = 0; ${index} < ${end}; ${index}++) {\n\t${}\n}"

Each `${}` placeholder (you may also use `#{}`) indicates a field
that the user can fill in. Its name, if any, will be the default
content for the field.

When the snippet is activated by calling the returned function,
the code is inserted at the given position. Newlines in the
template are indented by the indentation of the start line, plus
one [indent unit](https://codemirror.net/6/docs/ref/#language.indentUnit) per tab character after
the newline.

On activation, (all instances of) the first field are selected.
The user can move between fields with Tab and Shift-Tab as long as
the fields are active. Moving to the last field or moving the
cursor out of the current field deactivates the fields.

The order of fields defaults to textual order, but you can add
numbers to placeholders (`${1}` or `${1:defaultText}`) to provide
a custom order.
*/
function snippet(template) {
    let snippet = Snippet.parse(template);
    return (editor, _completion, from, to) => {
        let { text, ranges } = snippet.instantiate(editor.state, from);
        let spec = { changes: { from, to, insert: Text.of(text) } };
        if (ranges.length)
            spec.selection = fieldSelection(ranges, 0);
        if (ranges.length > 1) {
            let active = new ActiveSnippet(ranges, 0);
            let effects = spec.effects = [setActive.of(active)];
            if (editor.state.field(snippetState, false) === undefined)
                effects.push(StateEffect.appendConfig.of([snippetState, addSnippetKeymap, snippetPointerHandler, baseTheme$1]));
        }
        editor.dispatch(editor.state.update(spec));
    };
}
function moveField(dir) {
    return ({ state, dispatch }) => {
        let active = state.field(snippetState, false);
        if (!active || dir < 0 && active.active == 0)
            return false;
        let next = active.active + dir, last = dir > 0 && !active.ranges.some(r => r.field == next + dir);
        dispatch(state.update({
            selection: fieldSelection(active.ranges, next),
            effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next))
        }));
        return true;
    };
}
/**
A command that clears the active snippet, if any.
*/
const clearSnippet = ({ state, dispatch }) => {
    let active = state.field(snippetState, false);
    if (!active)
        return false;
    dispatch(state.update({ effects: setActive.of(null) }));
    return true;
};
/**
Move to the next snippet field, if available.
*/
const nextSnippetField = /*@__PURE__*/moveField(1);
/**
Move to the previous snippet field, if available.
*/
const prevSnippetField = /*@__PURE__*/moveField(-1);
const defaultSnippetKeymap = [
    { key: "Tab", run: nextSnippetField, shift: prevSnippetField },
    { key: "Escape", run: clearSnippet }
];
/**
A facet that can be used to configure the key bindings used by
snippets. The default binds Tab to
[`nextSnippetField`](https://codemirror.net/6/docs/ref/#autocomplete.nextSnippetField), Shift-Tab to
[`prevSnippetField`](https://codemirror.net/6/docs/ref/#autocomplete.prevSnippetField), and Escape
to [`clearSnippet`](https://codemirror.net/6/docs/ref/#autocomplete.clearSnippet).
*/
const snippetKeymap = /*@__PURE__*/Facet.define({
    combine(maps) { return maps.length ? maps[0] : defaultSnippetKeymap; }
});
const addSnippetKeymap = /*@__PURE__*/Prec.highest(/*@__PURE__*/keymap.compute([snippetKeymap], state => state.facet(snippetKeymap)));
/**
Create a completion from a snippet. Returns an object with the
properties from `completion`, plus an `apply` function that
applies the snippet.
*/
function snippetCompletion(template, completion) {
    return Object.assign(Object.assign({}, completion), { apply: snippet(template) });
}
const snippetPointerHandler = /*@__PURE__*/EditorView.domEventHandlers({
    mousedown(event, view) {
        let active = view.state.field(snippetState, false), pos;
        if (!active || (pos = view.posAtCoords({ x: event.clientX, y: event.clientY })) == null)
            return false;
        let match = active.ranges.find(r => r.from <= pos && r.to >= pos);
        if (!match || match.field == active.active)
            return false;
        view.dispatch({
            selection: fieldSelection(active.ranges, match.field),
            effects: setActive.of(active.ranges.some(r => r.field > match.field) ? new ActiveSnippet(active.ranges, match.field) : null)
        });
        return true;
    }
});

/**
A collection of JavaScript-related
[snippets](https://codemirror.net/6/docs/ref/#autocomplete.snippet).
*/
const snippets = [
    /*@__PURE__*/snippetCompletion("function ${name}(${params}) {\n\t${}\n}", {
        label: "function",
        detail: "definition",
        type: "keyword"
    }),
    /*@__PURE__*/snippetCompletion("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n\t${}\n}", {
        label: "for",
        detail: "loop",
        type: "keyword"
    }),
    /*@__PURE__*/snippetCompletion("for (let ${name} of ${collection}) {\n\t${}\n}", {
        label: "for",
        detail: "of loop",
        type: "keyword"
    }),
    /*@__PURE__*/snippetCompletion("try {\n\t${}\n} catch (${error}) {\n\t${}\n}", {
        label: "try",
        detail: "block",
        type: "keyword"
    }),
    /*@__PURE__*/snippetCompletion("class ${name} {\n\tconstructor(${params}) {\n\t\t${}\n\t}\n}", {
        label: "class",
        detail: "definition",
        type: "keyword"
    }),
    /*@__PURE__*/snippetCompletion("import {${names}} from \"${module}\"\n${}", {
        label: "import",
        detail: "named",
        type: "keyword"
    }),
    /*@__PURE__*/snippetCompletion("import ${name} from \"${module}\"\n${}", {
        label: "import",
        detail: "default",
        type: "keyword"
    })
];

/**
A language provider based on the [Lezer JavaScript
parser](https://github.com/lezer-parser/javascript), extended with
highlighting and indentation information.
*/
const javascriptLanguage = /*@__PURE__*/LRLanguage.define({
    parser: /*@__PURE__*/parser$1.configure({
        props: [
            /*@__PURE__*/indentNodeProp.add({
                IfStatement: /*@__PURE__*/continuedIndent({ except: /^\s*({|else\b)/ }),
                TryStatement: /*@__PURE__*/continuedIndent({ except: /^\s*({|catch\b|finally\b)/ }),
                LabeledStatement: flatIndent,
                SwitchBody: context => {
                    let after = context.textAfter, closed = /^\s*\}/.test(after), isCase = /^\s*(case|default)\b/.test(after);
                    return context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit;
                },
                Block: /*@__PURE__*/delimitedIndent({ closing: "}" }),
                ArrowFunction: cx => cx.baseIndent + cx.unit,
                "TemplateString BlockComment": () => -1,
                "Statement Property": /*@__PURE__*/continuedIndent({ except: /^{/ }),
                JSXElement(context) {
                    let closed = /^\s*<\//.test(context.textAfter);
                    return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
                },
                JSXEscape(context) {
                    let closed = /\s*\}/.test(context.textAfter);
                    return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
                },
                "JSXOpenTag JSXSelfClosingTag"(context) {
                    return context.column(context.node.from) + context.unit;
                }
            }),
            /*@__PURE__*/foldNodeProp.add({
                "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression": foldInside,
                BlockComment(tree) { return { from: tree.from + 2, to: tree.to - 2 }; }
            }),
            /*@__PURE__*/styleTags({
                "get set async static": tags.modifier,
                "for while do if else switch try catch finally return throw break continue default case": tags.controlKeyword,
                "in of await yield void typeof delete instanceof": tags.operatorKeyword,
                "export import let var const function class extends": tags.definitionKeyword,
                "with debugger from as new": tags.keyword,
                TemplateString: /*@__PURE__*/tags.special(tags.string),
                Super: tags.atom,
                BooleanLiteral: tags.bool,
                this: tags.self,
                null: tags.null,
                Star: tags.modifier,
                VariableName: tags.variableName,
                "CallExpression/VariableName": /*@__PURE__*/tags.function(tags.variableName),
                VariableDefinition: /*@__PURE__*/tags.definition(tags.variableName),
                Label: tags.labelName,
                PropertyName: tags.propertyName,
                PrivatePropertyName: /*@__PURE__*/tags.special(tags.propertyName),
                "CallExpression/MemberExpression/PropertyName": /*@__PURE__*/tags.function(tags.propertyName),
                "FunctionDeclaration/VariableDefinition": /*@__PURE__*/tags.function(/*@__PURE__*/tags.definition(tags.variableName)),
                "ClassDeclaration/VariableDefinition": /*@__PURE__*/tags.definition(tags.className),
                PropertyDefinition: /*@__PURE__*/tags.definition(tags.propertyName),
                PrivatePropertyDefinition: /*@__PURE__*/tags.definition(/*@__PURE__*/tags.special(tags.propertyName)),
                UpdateOp: tags.updateOperator,
                LineComment: tags.lineComment,
                BlockComment: tags.blockComment,
                Number: tags.number,
                String: tags.string,
                ArithOp: tags.arithmeticOperator,
                LogicOp: tags.logicOperator,
                BitOp: tags.bitwiseOperator,
                CompareOp: tags.compareOperator,
                RegExp: tags.regexp,
                Equals: tags.definitionOperator,
                "Arrow : Spread": tags.punctuation,
                "( )": tags.paren,
                "[ ]": tags.squareBracket,
                "{ }": tags.brace,
                ".": tags.derefOperator,
                ", ;": tags.separator,
                TypeName: tags.typeName,
                TypeDefinition: /*@__PURE__*/tags.definition(tags.typeName),
                "type enum interface implements namespace module declare": tags.definitionKeyword,
                "abstract global privacy readonly override": tags.modifier,
                "is keyof unique infer": tags.operatorKeyword,
                JSXAttributeValue: tags.attributeValue,
                JSXText: tags.content,
                "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": tags.angleBracket,
                "JSXIdentifier JSXNameSpacedName": tags.tagName,
                "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": tags.attributeName
            })
        ]
    }),
    languageData: {
        closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
        commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
        indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
        wordChars: "$"
    }
});
/**
A language provider for TypeScript.
*/
const typescriptLanguage = /*@__PURE__*/javascriptLanguage.configure({ dialect: "ts" });
/**
Language provider for JSX.
*/
const jsxLanguage = /*@__PURE__*/javascriptLanguage.configure({ dialect: "jsx" });
/**
Language provider for JSX + TypeScript.
*/
const tsxLanguage = /*@__PURE__*/javascriptLanguage.configure({ dialect: "jsx ts" });
/**
JavaScript support. Includes [snippet](https://codemirror.net/6/docs/ref/#lang-javascript.snippets)
completion.
*/
function javascript(config = {}) {
    let lang = config.jsx ? (config.typescript ? tsxLanguage : jsxLanguage)
        : config.typescript ? typescriptLanguage : javascriptLanguage;
    return new LanguageSupport(lang, javascriptLanguage.data.of({
        autocomplete: ifNotIn(["LineComment", "BlockComment", "String"], completeFromList(snippets))
    }));
}

// This file was generated by lezer-generator. You probably shouldn't edit it.
const StartTag = 1,
  StartCloseTag = 2,
  MissingCloseTag = 3,
  mismatchedStartCloseTag = 4,
  incompleteStartCloseTag = 5,
  commentContent$1 = 36,
  piContent$1 = 37,
  cdataContent$1 = 38,
  Element$1 = 10,
  OpenTag = 12;

/* Hand-written tokenizer for XML tag matching. */

function nameChar(ch) {
  return ch == 45 || ch == 46 || ch == 58 || ch >= 65 && ch <= 90 || ch == 95 || ch >= 97 && ch <= 122 || ch >= 161
}

function isSpace(ch) {
  return ch == 9 || ch == 10 || ch == 13 || ch == 32
}

let cachedName = null, cachedInput = null, cachedPos = 0;
function tagNameAfter(input, offset) {
  let pos = input.pos + offset;
  if (cachedInput == input && cachedPos == pos) return cachedName
  while (isSpace(input.peek(offset))) offset++;
  let name = "";
  for (;;) {
    let next = input.peek(offset);
    if (!nameChar(next)) break
    name += String.fromCharCode(next);
    offset++;
  }
  cachedInput = input; cachedPos = pos;
  return cachedName = name || null
}

function ElementContext(name, parent) {
  this.name = name;
  this.parent = parent;
  this.hash = parent ? parent.hash : 0;
  for (let i = 0; i < name.length; i++) this.hash += (this.hash << 4) + name.charCodeAt(i) + (name.charCodeAt(i) << 8);
}

const elementContext = new ContextTracker({
  start: null,
  shift(context, term, stack, input) {
    return term == StartTag ? new ElementContext(tagNameAfter(input, 1) || "", context) : context
  },
  reduce(context, term) {
    return term == Element$1 && context ? context.parent : context
  },
  reuse(context, node, _stack, input) {
    let type = node.type.id;
    return type == StartTag || type == OpenTag
      ? new ElementContext(tagNameAfter(input, 1) || "", context) : context
  },
  hash(context) { return context ? context.hash : 0 },
  strict: false
});

const startTag = new ExternalTokenizer((input, stack) => {
  if (input.next != 60 /* '<' */) return
  input.advance();
  if (input.next == 47 /* '/' */) {
    input.advance();
    let name = tagNameAfter(input, 0);
    if (!name) return input.acceptToken(incompleteStartCloseTag)
    if (stack.context && name == stack.context.name) return input.acceptToken(StartCloseTag)
    for (let cx = stack.context; cx; cx = cx.parent) if (cx.name == name) return input.acceptToken(MissingCloseTag, -2)
    input.acceptToken(mismatchedStartCloseTag);
  } else if (input.next != 33 /* '!' */ && input.next != 63 /* '?' */) {
    return input.acceptToken(StartTag)
  }
}, {contextual: true});

function scanTo(type, end) {
  return new ExternalTokenizer(input => {
    for (let endPos = 0, len = 0;; len++) {
      if (input.next < 0) {
        if (len) input.acceptToken(type);
        break
      } 
      if (input.next == end.charCodeAt(endPos)) {
        endPos++;
        if (endPos == end.length) {
          if (len > end.length) input.acceptToken(type, 1 - end.length);
          break
        }
      } else {
        endPos = 0;
      }
      input.advance();
    }
  })
}

const commentContent = scanTo(commentContent$1, "-->");
const piContent = scanTo(piContent$1, "?>");
const cdataContent = scanTo(cdataContent$1, "]]>");

// This file was generated by lezer-generator. You probably shouldn't edit it.
const parser = LRParser.deserialize({
  version: 13,
  states: "-OOQOaOOOcObO'#CcOkOdO'#CdOOOP'#Cv'#CvOsOaO'#DTO!XOaOOOOOQ'#Cw'#CwO!aObO,58}OOOP,58},58}OOOS'#Cx'#CxO!iOdO,59OOOOP,59O,59OOOOP-E6t-E6tO!qO`O'#ChO#kOqO'#CfOOOP'#Cf'#CfO#rOaO'#CyQ$TOPOOO$YOaOOOOOQ-E6u-E6uOOOP1G.i1G.iOOOS-E6v-E6vOOOP1G.j1G.jOOOO'#Cz'#CzO$hO`O,59SO$pO!bO,59SO%OOhO'#CqO%WO`O'#CrOOOP'#D]'#D]OOOP'#C}'#C}O%`OqO,59QO%gO`O'#CsOOOP,59Q,59QOOOP,59e,59eOOOP-E6w-E6wO$TOPOOOOOO-E6x-E6xO%oO!bO1G.nO%oO!bO1G.nO%}O`O'#CjO&VO!bO'#C{O&eO!bO1G.nOOOP1G.n1G.nOOOP1G.{1G.{OOOW'#DO'#DOO&pOhO,59]OOOP,59],59]O&xO`O,59^O'QO`O,59^OOOP-E6{-E6{OOOP1G.l1G.lO'YO`O,59_O'bO`O,59_O'jO!bO7+$YO'xO!bO7+$YOOOP7+$Y7+$YOOOP7+$g7+$gO(TO`O,59UO(]O`O,59UO(eO!bO,59gOOOO-E6y-E6yOOOW-E6|-E6|OOOP1G.w1G.wO(sO`O1G.xO(sO`O1G.xOOOP1G.x1G.xO({O`O1G.yO({O`O1G.yOOOP1G.y1G.yO)TO!bO<<GtOOOP<<Gt<<GtOOOP<<HR<<HRO(]O`O1G.pO(]O`O1G.pO)`O#tO'#CmOOOO1G.p1G.pO)nO`O7+$dOOOP7+$d7+$dO)vO`O7+$eOOOP7+$e7+$eOOOPAN=`AN=`OOOPAN=mAN=mO(]O`O7+$[OOOO7+$[7+$[OOOO'#C|'#C|O*OO#tO,59XOOOO,59X,59XOOOP<<HO<<HOOOOP<<HP<<HPOOOO<<Gv<<GvOOOO-E6z-E6zOOOO1G.s1G.s",
  stateData: "*^~OyPOzRO|QOPwPXwP~OtUOxWO~OuXO{ZO~OyPOzRO|QOPwXXwXswX~OP]OXbO~OtUOxdO~OuXO{fO~O]iOzgO~OP]OQoOSkOTlOblOclOdlOyPO|QO!RjO~ORpO~P!yOyPOzRO|QOPwPswP~OP]O~OyPOzRO|QOPwP~O]uOzgO~OZzO_wOh{OzgO~Ov|O!Q!OO~O]!QOzgO~OR!SO~P!yO]!UOzgO~OZ!XO_wOh!YOzgO~O`![OzgO~OzgOZoX_oXhoX~OZ!XO_wOh!YO~Ov|O!Q!`O~O]!aOzgO~OZ!cOzgO~O]!dOzgO~OZ!fOzgO~OZ!hO_wOh!iOzgO~OZ!hO_wOh!iO~O`!jOzgO~OzgO}!lO~OzgOZoa_oahoa~OZ!oOzgO~OZ!qOzgO~OZ!rO_wOh!sO~Ob!vOc!vO}!xO!O!vO~OZ!yOzgO~OZ!zOzgO~Ob!vOc!vO}!}O!O!vO~O",
  goto: "&S!QPPPPPPP!R!RP!]P!fP!mPP!vPPP!X!X#QP#W#_#g#m#s#z%S%c%i%oPPPP%uPPPPPPP&OWROS`bTl^nU`TasTl^nZ^T^ans_xiuvy!V!W!gQ!m![S!u!j!kR!{!tQp^R!SnZ_T^ansUSO`bR[SQVPRcVQYQReYSaTsRraQh]jthv!P!T!V!Z!]!b!e!k!n!p!tQviQ!PkQ!ToQ!VuQ!ZwQ!]xQ!b!QQ!e!UQ!k![Q!n!aQ!p!dR!t!jQyiS!WuvU!^y!W!gR!g!VQ!w!lR!|!wQn^R!RnQ}jR!_}QTOQq`RsbTm^n",
  nodeNames: "⚠ StartTag StartCloseTag MissingCloseTag StartCloseTag StartCloseTag Document Comment ProcessingInst DoctypeDecl Element EndTag OpenTag TagName Attribute AttributeName Is AttributeValue EntityReference CharacterReference Text Cdata MismatchedCloseTag CloseTag SelfCloseEndTag SelfClosingTag",
  maxTerm: 49,
  context: elementContext,
  nodeProps: [
    [NodeProp.closedBy, 1,"SelfCloseEndTag EndTag",12,"CloseTag MissingCloseTag"],
    [NodeProp.openedBy, 11,"StartTag StartCloseTag",23,"OpenTag",24,"StartTag"]
  ],
  skippedNodes: [0],
  repeatNodeCount: 9,
  tokenData: "Az~R!WOX$kXY%rYZ%rZ]$k]^%r^p$kpq%rqr$krs&tsv$kvw'Uw}$k}!O(q!O!P$k!P!Q*n!Q![$k![!]+z!]!^$k!^!_/s!_!`=i!`!a>U!a!b>q!b!c$k!c!}+z!}#P$k#P#Q?}#Q#R$k#R#S+z#S#T$k#T#o+z#o%W$k%W%o+z%o%p$k%p&a+z&a&b$k&b1p+z1p4U$k4U4d+z4d4e$k4e$IS+z$IS$I`$k$I`$Ib+z$Ib$Kh$k$Kh%#t+z%#t&/x$k&/x&Et+z&Et&FV$k&FV;'S+z;'S;:j/S;:j?&r$k?&r?Ah+z?Ah?BY$k?BY?Mn+z?Mn~$kY$rUdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_~$kQ%ZRdQOv%Uw!^%U!_~%UW%iR!OWOr%dsv%dw~%d_%{]dQ!OWzTOX$kXY%rYZ%rZ]$k]^%r^p$kpq%rqr$krs%Usv$kw!^$k!^!_%d!_~$kZ&{R}XdQOv%Uw!^%U!_~%U~'XTOp'hqs'hst(Pt!]'h!^~'h~'kTOp'hqs'ht!]'h!]!^'z!^~'h~(POb~~(SROp(]q!](]!^~(]~(`SOp(]q!](]!]!^(l!^~(]~(qOc~Z(xWdQ!OWOr$krs%Usv$kw}$k}!O)b!O!^$k!^!_%d!_~$kZ)iWdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_!`$k!`!a*R!a~$kZ*[UxPdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_~$k^*uWdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_!`$k!`!a+_!a~$k^+hUhSdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_~$k_,V}_S]PdQ!OWOr$krs%Usv$kw}$k}!O+z!O!P+z!P!Q$k!Q![+z![!]+z!]!^$k!^!_%d!_!c$k!c!}+z!}#R$k#R#S+z#S#T$k#T#o+z#o$}$k$}%O+z%O%W$k%W%o+z%o%p$k%p&a+z&a&b$k&b1p+z1p4U+z4U4d+z4d4e$k4e$IS+z$IS$I`$k$I`$Ib+z$Ib$Je$k$Je$Jg+z$Jg$Kh$k$Kh%#t+z%#t&/x$k&/x&Et+z&Et&FV$k&FV;'S+z;'S;:j/S;:j?&r$k?&r?Ah+z?Ah?BY$k?BY?Mn+z?Mn~$k_/ZWdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_;=`$k;=`<%l+z<%l~$kZ/xU!OWOq%dqr0[sv%dw!a%d!a!b=X!b~%dZ0aZ!OWOr%dsv%dw}%d}!O1S!O!f%d!f!g1x!g!}%d!}#O5s#O#W%d#W#X:k#X~%dZ1XT!OWOr%dsv%dw}%d}!O1h!O~%dZ1oRyR!OWOr%dsv%dw~%dX1}T!OWOr%dsv%dw!q%d!q!r2^!r~%dX2cT!OWOr%dsv%dw!e%d!e!f2r!f~%dX2wT!OWOr%dsv%dw!v%d!v!w3W!w~%dX3]T!OWOr%dsv%dw!{%d!{!|3l!|~%dX3qT!OWOr%dsv%dw!r%d!r!s4Q!s~%dX4VT!OWOr%dsv%dw!g%d!g!h4f!h~%dX4kV!OWOr4frs5Qsv4fvw5Qw!`4f!`!a5c!a~4fP5TRO!`5Q!`!a5^!a~5QP5cOXPX5jRXP!OWOr%dsv%dw~%dY5xV!OWOr%dsv%dw!e%d!e!f6_!f#V%d#V#W8w#W~%dY6dT!OWOr%dsv%dw!f%d!f!g6s!g~%dY6xT!OWOr%dsv%dw!c%d!c!d7X!d~%dY7^T!OWOr%dsv%dw!v%d!v!w7m!w~%dY7rT!OWOr%dsv%dw!c%d!c!d8R!d~%dY8WT!OWOr%dsv%dw!}%d!}#O8g#O~%dY8nR!OW!RQOr%dsv%dw~%dY8|T!OWOr%dsv%dw#W%d#W#X9]#X~%dY9bT!OWOr%dsv%dw#T%d#T#U9q#U~%dY9vT!OWOr%dsv%dw#h%d#h#i:V#i~%dY:[T!OWOr%dsv%dw#T%d#T#U8R#U~%dX:pT!OWOr%dsv%dw#c%d#c#d;P#d~%dX;UT!OWOr%dsv%dw#V%d#V#W;e#W~%dX;jT!OWOr%dsv%dw#h%d#h#i;y#i~%dX<OT!OWOr%dsv%dw#m%d#m#n<_#n~%dX<dT!OWOr%dsv%dw#d%d#d#e<s#e~%dX<xT!OWOr%dsv%dw#X%d#X#Y4f#Y~%dZ=`R|R!OWOr%dsv%dw~%dZ=rU`PdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_~$k_>_UZTdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_~$kZ>xWdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_!`$k!`!a?b!a~$kZ?kU{PdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_~$kZ@UWdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_#P$k#P#Q@n#Q~$kZ@uWdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_!`$k!`!aA_!a~$kZAhU!QPdQ!OWOr$krs%Usv$kw!^$k!^!_%d!_~$k",
  tokenizers: [startTag, commentContent, piContent, cdataContent, 0, 1, 2, 3],
  topRules: {"Document":[0,6]},
  tokenPrec: 0
});

function tagName(doc, tag) {
    let name = tag && tag.getChild("TagName");
    return name ? doc.sliceString(name.from, name.to) : "";
}
function elementName(doc, tree) {
    let tag = tree && tree.firstChild;
    return !tag || tag.name != "OpenTag" ? "" : tagName(doc, tag);
}
function attrName(doc, tag, pos) {
    let attr = tag && tag.getChildren("Attribute").find(a => a.from <= pos && a.to >= pos);
    let name = attr && attr.getChild("AttributeName");
    return name ? doc.sliceString(name.from, name.to) : "";
}
function findParentElement(tree) {
    for (let cur = tree && tree.parent; cur; cur = cur.parent)
        if (cur.name == "Element")
            return cur;
    return null;
}
function findLocation(state, pos) {
    var _a;
    let at = syntaxTree(state).resolveInner(pos, -1), inTag = null;
    for (let cur = at; !inTag && cur.parent; cur = cur.parent)
        if (cur.name == "OpenTag" || cur.name == "CloseTag" || cur.name == "SelfClosingTag" || cur.name == "MismatchedCloseTag")
            inTag = cur;
    if (inTag && (inTag.to > pos || inTag.lastChild.type.isError)) {
        let elt = inTag.parent;
        if (at.name == "TagName")
            return inTag.name == "CloseTag" || inTag.name == "MismatchedCloseTag"
                ? { type: "closeTag", from: at.from, context: elt }
                : { type: "openTag", from: at.from, context: findParentElement(elt) };
        if (at.name == "AttributeName")
            return { type: "attrName", from: at.from, context: inTag };
        if (at.name == "AttributeValue")
            return { type: "attrValue", from: at.from, context: inTag };
        let before = at == inTag || at.name == "Attribute" ? at.childBefore(pos) : at;
        if ((before === null || before === void 0 ? void 0 : before.name) == "StartTag")
            return { type: "openTag", from: pos, context: findParentElement(elt) };
        if ((before === null || before === void 0 ? void 0 : before.name) == "StartCloseTag" && before.to <= pos)
            return { type: "closeTag", from: pos, context: elt };
        if ((before === null || before === void 0 ? void 0 : before.name) == "Is")
            return { type: "attrValue", from: pos, context: inTag };
        if (before)
            return { type: "attrName", from: pos, context: inTag };
        return null;
    }
    else if (at.name == "StartCloseTag") {
        return { type: "closeTag", from: pos, context: at.parent };
    }
    while (at.parent && at.to == pos && !((_a = at.lastChild) === null || _a === void 0 ? void 0 : _a.type.isError))
        at = at.parent;
    if (at.name == "Element" || at.name == "Text" || at.name == "Document")
        return { type: "tag", from: pos, context: at.name == "Element" ? at : findParentElement(at) };
    return null;
}
class Element {
    constructor(spec, attrs, attrValues) {
        this.attrs = attrs;
        this.attrValues = attrValues;
        this.children = [];
        this.name = spec.name;
        this.completion = Object.assign(Object.assign({ type: "type" }, spec.completion || {}), { label: this.name });
        this.openCompletion = Object.assign(Object.assign({}, this.completion), { label: "<" + this.name });
        this.closeCompletion = Object.assign(Object.assign({}, this.completion), { label: "</" + this.name + ">", boost: 2 });
        this.closeNameCompletion = Object.assign(Object.assign({}, this.completion), { label: this.name + ">" });
        this.text = spec.textContent ? spec.textContent.map(s => ({ label: s, type: "text" })) : [];
    }
}
const Identifier = /^[:\-\.\w\u00b7-\uffff]*$/;
function attrCompletion(spec) {
    return Object.assign(Object.assign({ type: "property" }, spec.completion || {}), { label: spec.name });
}
function valueCompletion(spec) {
    return typeof spec == "string" ? { label: `"${spec}"`, type: "constant" }
        : /^"/.test(spec.label) ? spec
            : Object.assign(Object.assign({}, spec), { label: `"${spec.label}"` });
}
function completeFromSchema(eltSpecs, attrSpecs) {
    let allAttrs = [], globalAttrs = [];
    let attrValues = Object.create(null);
    for (let s of attrSpecs) {
        let completion = attrCompletion(s);
        allAttrs.push(completion);
        if (s.global)
            globalAttrs.push(completion);
        if (s.values)
            attrValues[s.name] = s.values.map(valueCompletion);
    }
    let allElements = [], topElements = [];
    let byName = Object.create(null);
    for (let s of eltSpecs) {
        let attrs = globalAttrs, attrVals = attrValues;
        if (s.attributes)
            attrs = attrs.concat(s.attributes.map(s => {
                if (typeof s == "string")
                    return allAttrs.find(a => a.label == s) || { label: s, type: "property" };
                if (s.values) {
                    if (attrVals == attrValues)
                        attrVals = Object.create(attrVals);
                    attrVals[s.name] = s.values.map(valueCompletion);
                }
                return attrCompletion(s);
            }));
        let elt = new Element(s, attrs, attrVals);
        byName[elt.name] = elt;
        allElements.push(elt);
        if (s.top)
            topElements.push(elt);
    }
    if (!topElements.length)
        topElements = allElements;
    for (let i = 0; i < allElements.length; i++) {
        let s = eltSpecs[i], elt = allElements[i];
        if (s.children) {
            for (let ch of s.children)
                if (byName[ch])
                    elt.children.push(byName[ch]);
        }
        else {
            elt.children = allElements;
        }
    }
    return cx => {
        var _a;
        let { doc } = cx.state, loc = findLocation(cx.state, cx.pos);
        if (!loc || (loc.type == "tag" && !cx.explicit))
            return null;
        let { type, from, context } = loc;
        if (type == "openTag") {
            let children = topElements;
            let parentName = elementName(doc, context);
            if (parentName) {
                let parent = byName[parentName];
                children = (parent === null || parent === void 0 ? void 0 : parent.children) || allElements;
            }
            return {
                from,
                options: children.map(ch => ch.completion),
                span: Identifier
            };
        }
        else if (type == "closeTag") {
            let parentName = elementName(doc, context);
            return parentName ? {
                from,
                to: cx.pos + (doc.sliceString(cx.pos, cx.pos + 1) == ">" ? 1 : 0),
                options: [((_a = byName[parentName]) === null || _a === void 0 ? void 0 : _a.closeNameCompletion) || { label: parentName + ">", type: "type" }],
                span: Identifier
            } : null;
        }
        else if (type == "attrName") {
            let parent = byName[tagName(doc, context)];
            return {
                from,
                options: (parent === null || parent === void 0 ? void 0 : parent.attrs) || globalAttrs,
                span: Identifier
            };
        }
        else if (type == "attrValue") {
            let attr = attrName(doc, context, from);
            if (!attr)
                return null;
            let parent = byName[tagName(doc, context)];
            let values = ((parent === null || parent === void 0 ? void 0 : parent.attrValues) || attrValues)[attr];
            if (!values || !values.length)
                return null;
            return {
                from,
                to: cx.pos + (doc.sliceString(cx.pos, cx.pos + 1) == '"' ? 1 : 0),
                options: values,
                span: /^"[^"]*"?$/
            };
        }
        else if (type == "tag") {
            let parentName = elementName(doc, context), parent = byName[parentName];
            let closing = [], last = context && context.lastChild;
            if (parentName && (!last || last.name != "CloseTag" || tagName(doc, last) != parentName))
                closing.push(parent ? parent.closeCompletion : { label: "</" + parentName + ">", type: "type", boost: 2 });
            let options = closing.concat(((parent === null || parent === void 0 ? void 0 : parent.children) || (context ? allElements : topElements)).map(e => e.openCompletion));
            if (context && (parent === null || parent === void 0 ? void 0 : parent.text.length)) {
                let openTag = context.firstChild;
                if (openTag.to > cx.pos - 20 && !/\S/.test(cx.state.sliceDoc(openTag.to, cx.pos)))
                    options = options.concat(parent.text);
            }
            return {
                from,
                options,
                span: /^<\/?[:\-\.\w\u00b7-\uffff]*$/
            };
        }
        else {
            return null;
        }
    };
}

/**
A language provider based on the [Lezer XML
parser](https://github.com/lezer-parser/xml), extended with
highlighting and indentation information.
*/
const xmlLanguage = /*@__PURE__*/LRLanguage.define({
    parser: /*@__PURE__*/parser.configure({
        props: [
            /*@__PURE__*/indentNodeProp.add({
                Element(context) {
                    let closed = /^\s*<\//.test(context.textAfter);
                    return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
                },
                "OpenTag CloseTag SelfClosingTag"(context) {
                    return context.column(context.node.from) + context.unit;
                }
            }),
            /*@__PURE__*/foldNodeProp.add({
                Element(subtree) {
                    let first = subtree.firstChild, last = subtree.lastChild;
                    if (!first || first.name != "OpenTag")
                        return null;
                    return { from: first.to, to: last.name == "CloseTag" ? last.from : subtree.to };
                }
            }),
            /*@__PURE__*/styleTags({
                Text: tags.content,
                "StartTag StartCloseTag EndTag SelfCloseEndTag": tags.angleBracket,
                TagName: tags.tagName,
                "MismatchedCloseTag/Tagname": [tags.tagName, tags.invalid],
                AttributeName: tags.attributeName,
                AttributeValue: tags.attributeValue,
                Is: tags.definitionOperator,
                "EntityReference CharacterReference": tags.character,
                Comment: tags.blockComment,
                ProcessingInst: tags.processingInstruction,
                DoctypeDecl: tags.documentMeta,
                Cdata: /*@__PURE__*/tags.special(tags.string)
            })
        ]
    }),
    languageData: {
        commentTokens: { block: { open: "<!--", close: "-->" } },
        indentOnInput: /^\s*<\/$/
    }
});
/**
XML language support. Includes schema-based autocompletion when
configured.
*/
function xml(conf = {}) {
    return new LanguageSupport(xmlLanguage, xmlLanguage.data.of({
        autocomplete: completeFromSchema(conf.elements || [], conf.attributes || [])
    }));
}

const baseTheme = /*@__PURE__*/EditorView.baseTheme({
    ".cm-matchingBracket": { backgroundColor: "#328c8252" },
    ".cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
});
const DefaultScanDist = 10000, DefaultBrackets = "()[]{}";
const bracketMatchingConfig = /*@__PURE__*/Facet.define({
    combine(configs) {
        return combineConfig(configs, {
            afterCursor: true,
            brackets: DefaultBrackets,
            maxScanDistance: DefaultScanDist
        });
    }
});
const matchingMark = /*@__PURE__*/Decoration.mark({ class: "cm-matchingBracket" }), nonmatchingMark = /*@__PURE__*/Decoration.mark({ class: "cm-nonmatchingBracket" });
const bracketMatchingState = /*@__PURE__*/StateField.define({
    create() { return Decoration.none; },
    update(deco, tr) {
        if (!tr.docChanged && !tr.selection)
            return deco;
        let decorations = [];
        let config = tr.state.facet(bracketMatchingConfig);
        for (let range of tr.state.selection.ranges) {
            if (!range.empty)
                continue;
            let match = matchBrackets(tr.state, range.head, -1, config)
                || (range.head > 0 && matchBrackets(tr.state, range.head - 1, 1, config))
                || (config.afterCursor &&
                    (matchBrackets(tr.state, range.head, 1, config) ||
                        (range.head < tr.state.doc.length && matchBrackets(tr.state, range.head + 1, -1, config))));
            if (!match)
                continue;
            let mark = match.matched ? matchingMark : nonmatchingMark;
            decorations.push(mark.range(match.start.from, match.start.to));
            if (match.end)
                decorations.push(mark.range(match.end.from, match.end.to));
        }
        return Decoration.set(decorations, true);
    },
    provide: f => EditorView.decorations.from(f)
});
const bracketMatchingUnique = [
    bracketMatchingState,
    baseTheme
];
/**
Create an extension that enables bracket matching. Whenever the
cursor is next to a bracket, that bracket and the one it matches
are highlighted. Or, when no matching bracket is found, another
highlighting style is used to indicate this.
*/
function bracketMatching(config = {}) {
    return [bracketMatchingConfig.of(config), bracketMatchingUnique];
}
function matchingNodes(node, dir, brackets) {
    let byProp = node.prop(dir < 0 ? NodeProp.openedBy : NodeProp.closedBy);
    if (byProp)
        return byProp;
    if (node.name.length == 1) {
        let index = brackets.indexOf(node.name);
        if (index > -1 && index % 2 == (dir < 0 ? 1 : 0))
            return [brackets[index + dir]];
    }
    return null;
}
/**
Find the matching bracket for the token at `pos`, scanning
direction `dir`. Only the `brackets` and `maxScanDistance`
properties are used from `config`, if given. Returns null if no
bracket was found at `pos`, or a match result otherwise.
*/
function matchBrackets(state, pos, dir, config = {}) {
    let maxScanDistance = config.maxScanDistance || DefaultScanDist, brackets = config.brackets || DefaultBrackets;
    let tree = syntaxTree(state), node = tree.resolveInner(pos, dir);
    for (let cur = node; cur; cur = cur.parent) {
        let matches = matchingNodes(cur.type, dir, brackets);
        if (matches && cur.from < cur.to)
            return matchMarkedBrackets(state, pos, dir, cur, matches, brackets);
    }
    return matchPlainBrackets(state, pos, dir, tree, node.type, maxScanDistance, brackets);
}
function matchMarkedBrackets(_state, _pos, dir, token, matching, brackets) {
    let parent = token.parent, firstToken = { from: token.from, to: token.to };
    let depth = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor;
    if (cursor && (dir < 0 ? cursor.childBefore(token.from) : cursor.childAfter(token.to)))
        do {
            if (dir < 0 ? cursor.to <= token.from : cursor.from >= token.to) {
                if (depth == 0 && matching.indexOf(cursor.type.name) > -1 && cursor.from < cursor.to) {
                    return { start: firstToken, end: { from: cursor.from, to: cursor.to }, matched: true };
                }
                else if (matchingNodes(cursor.type, dir, brackets)) {
                    depth++;
                }
                else if (matchingNodes(cursor.type, -dir, brackets)) {
                    depth--;
                    if (depth == 0)
                        return {
                            start: firstToken,
                            end: cursor.from == cursor.to ? undefined : { from: cursor.from, to: cursor.to },
                            matched: false
                        };
                }
            }
        } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
    return { start: firstToken, matched: false };
}
function matchPlainBrackets(state, pos, dir, tree, tokenType, maxScanDistance, brackets) {
    let startCh = dir < 0 ? state.sliceDoc(pos - 1, pos) : state.sliceDoc(pos, pos + 1);
    let bracket = brackets.indexOf(startCh);
    if (bracket < 0 || (bracket % 2 == 0) != (dir > 0))
        return null;
    let startToken = { from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos };
    let iter = state.doc.iterRange(pos, dir > 0 ? state.doc.length : 0), depth = 0;
    for (let distance = 0; !(iter.next()).done && distance <= maxScanDistance;) {
        let text = iter.value;
        if (dir < 0)
            distance += text.length;
        let basePos = pos + distance * dir;
        for (let pos = dir > 0 ? 0 : text.length - 1, end = dir > 0 ? text.length : -1; pos != end; pos += dir) {
            let found = brackets.indexOf(text[pos]);
            if (found < 0 || tree.resolve(basePos + pos, 1).type != tokenType)
                continue;
            if ((found % 2 == 0) == (dir > 0)) {
                depth++;
            }
            else if (depth == 1) { // Closing
                return { start: startToken, end: { from: basePos + pos, to: basePos + pos + 1 }, matched: (found >> 1) == (bracket >> 1) };
            }
            else {
                depth--;
            }
        }
        if (dir > 0)
            distance += text.length;
    }
    return iter.done ? { start: startToken, matched: false } : null;
}

function updateSel(sel, by) {
    return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
}
function setSel(state, selection) {
    return state.update({ selection, scrollIntoView: true, userEvent: "select" });
}
function moveSel({ state, dispatch }, how) {
    let selection = updateSel(state.selection, how);
    if (selection.eq(state.selection))
        return false;
    dispatch(setSel(state, selection));
    return true;
}
function rangeEnd(range, forward) {
    return EditorSelection.cursor(forward ? range.to : range.from);
}
function cursorByChar(view, forward) {
    return moveSel(view, range => range.empty ? view.moveByChar(range, forward) : rangeEnd(range, forward));
}
/**
Move the selection one character to the left (which is backward in
left-to-right text, forward in right-to-left text).
*/
const cursorCharLeft = view => cursorByChar(view, view.textDirection != Direction.LTR);
/**
Move the selection one character to the right.
*/
const cursorCharRight = view => cursorByChar(view, view.textDirection == Direction.LTR);
function cursorByGroup(view, forward) {
    return moveSel(view, range => range.empty ? view.moveByGroup(range, forward) : rangeEnd(range, forward));
}
/**
Move the selection to the left across one group of word or
non-word (but also non-space) characters.
*/
const cursorGroupLeft = view => cursorByGroup(view, view.textDirection != Direction.LTR);
/**
Move the selection one group to the right.
*/
const cursorGroupRight = view => cursorByGroup(view, view.textDirection == Direction.LTR);
function interestingNode(state, node, bracketProp) {
    if (node.type.prop(bracketProp))
        return true;
    let len = node.to - node.from;
    return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
}
function moveBySyntax(state, start, forward) {
    let pos = syntaxTree(state).resolveInner(start.head);
    let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
    // Scan forward through child nodes to see if there's an interesting
    // node ahead.
    for (let at = start.head;;) {
        let next = forward ? pos.childAfter(at) : pos.childBefore(at);
        if (!next)
            break;
        if (interestingNode(state, next, bracketProp))
            pos = next;
        else
            at = forward ? next.to : next.from;
    }
    let bracket = pos.type.prop(bracketProp), match, newPos;
    if (bracket && (match = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match.matched)
        newPos = forward ? match.end.to : match.end.from;
    else
        newPos = forward ? pos.to : pos.from;
    return EditorSelection.cursor(newPos, forward ? -1 : 1);
}
/**
Move the cursor over the next syntactic element to the left.
*/
const cursorSyntaxLeft = view => moveSel(view, range => moveBySyntax(view.state, range, view.textDirection != Direction.LTR));
/**
Move the cursor over the next syntactic element to the right.
*/
const cursorSyntaxRight = view => moveSel(view, range => moveBySyntax(view.state, range, view.textDirection == Direction.LTR));
function cursorByLine(view, forward) {
    return moveSel(view, range => {
        if (!range.empty)
            return rangeEnd(range, forward);
        let moved = view.moveVertically(range, forward);
        return moved.head != range.head ? moved : view.moveToLineBoundary(range, forward);
    });
}
/**
Move the selection one line up.
*/
const cursorLineUp = view => cursorByLine(view, false);
/**
Move the selection one line down.
*/
const cursorLineDown = view => cursorByLine(view, true);
function cursorByPage(view, forward) {
    return moveSel(view, range => range.empty ? view.moveVertically(range, forward, view.dom.clientHeight) : rangeEnd(range, forward));
}
/**
Move the selection one page up.
*/
const cursorPageUp = view => cursorByPage(view, false);
/**
Move the selection one page down.
*/
const cursorPageDown = view => cursorByPage(view, true);
function moveByLineBoundary(view, start, forward) {
    let line = view.visualLineAt(start.head), moved = view.moveToLineBoundary(start, forward);
    if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
        moved = view.moveToLineBoundary(start, forward, false);
    if (!forward && moved.head == line.from && line.length) {
        let space = /^\s*/.exec(view.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
        if (space && start.head != line.from + space)
            moved = EditorSelection.cursor(line.from + space);
    }
    return moved;
}
/**
Move the selection to the next line wrap point, or to the end of
the line if there isn't one left on this line.
*/
const cursorLineBoundaryForward = view => moveSel(view, range => moveByLineBoundary(view, range, true));
/**
Move the selection to previous line wrap point, or failing that to
the start of the line. If the line is indented, and the cursor
isn't already at the end of the indentation, this will move to the
end of the indentation instead of the start of the line.
*/
const cursorLineBoundaryBackward = view => moveSel(view, range => moveByLineBoundary(view, range, false));
/**
Move the selection to the start of the line.
*/
const cursorLineStart = view => moveSel(view, range => EditorSelection.cursor(view.visualLineAt(range.head).from, 1));
/**
Move the selection to the end of the line.
*/
const cursorLineEnd = view => moveSel(view, range => EditorSelection.cursor(view.visualLineAt(range.head).to, -1));
function toMatchingBracket(state, dispatch, extend) {
    let found = false, selection = updateSel(state.selection, range => {
        let matching = matchBrackets(state, range.head, -1)
            || matchBrackets(state, range.head, 1)
            || (range.head > 0 && matchBrackets(state, range.head - 1, 1))
            || (range.head < state.doc.length && matchBrackets(state, range.head + 1, -1));
        if (!matching || !matching.end)
            return range;
        found = true;
        let head = matching.start.from == range.head ? matching.end.to : matching.end.from;
        return extend ? EditorSelection.range(range.anchor, head) : EditorSelection.cursor(head);
    });
    if (!found)
        return false;
    dispatch(setSel(state, selection));
    return true;
}
/**
Move the selection to the bracket matching the one it is currently
on, if any.
*/
const cursorMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, false);
function extendSel(view, how) {
    let selection = updateSel(view.state.selection, range => {
        let head = how(range);
        return EditorSelection.range(range.anchor, head.head, head.goalColumn);
    });
    if (selection.eq(view.state.selection))
        return false;
    view.dispatch(setSel(view.state, selection));
    return true;
}
function selectByChar(view, forward) {
    return extendSel(view, range => view.moveByChar(range, forward));
}
/**
Move the selection head one character to the left, while leaving
the anchor in place.
*/
const selectCharLeft = view => selectByChar(view, view.textDirection != Direction.LTR);
/**
Move the selection head one character to the right.
*/
const selectCharRight = view => selectByChar(view, view.textDirection == Direction.LTR);
function selectByGroup(view, forward) {
    return extendSel(view, range => view.moveByGroup(range, forward));
}
/**
Move the selection head one [group](https://codemirror.net/6/docs/ref/#commands.cursorGroupLeft) to
the left.
*/
const selectGroupLeft = view => selectByGroup(view, view.textDirection != Direction.LTR);
/**
Move the selection head one group to the right.
*/
const selectGroupRight = view => selectByGroup(view, view.textDirection == Direction.LTR);
/**
Move the selection head over the next syntactic element to the left.
*/
const selectSyntaxLeft = view => extendSel(view, range => moveBySyntax(view.state, range, view.textDirection != Direction.LTR));
/**
Move the selection head over the next syntactic element to the right.
*/
const selectSyntaxRight = view => extendSel(view, range => moveBySyntax(view.state, range, view.textDirection == Direction.LTR));
function selectByLine(view, forward) {
    return extendSel(view, range => view.moveVertically(range, forward));
}
/**
Move the selection head one line up.
*/
const selectLineUp = view => selectByLine(view, false);
/**
Move the selection head one line down.
*/
const selectLineDown = view => selectByLine(view, true);
function selectByPage(view, forward) {
    return extendSel(view, range => view.moveVertically(range, forward, view.dom.clientHeight));
}
/**
Move the selection head one page up.
*/
const selectPageUp = view => selectByPage(view, false);
/**
Move the selection head one page down.
*/
const selectPageDown = view => selectByPage(view, true);
/**
Move the selection head to the next line boundary.
*/
const selectLineBoundaryForward = view => extendSel(view, range => moveByLineBoundary(view, range, true));
/**
Move the selection head to the previous line boundary.
*/
const selectLineBoundaryBackward = view => extendSel(view, range => moveByLineBoundary(view, range, false));
/**
Move the selection head to the start of the line.
*/
const selectLineStart = view => extendSel(view, range => EditorSelection.cursor(view.visualLineAt(range.head).from));
/**
Move the selection head to the end of the line.
*/
const selectLineEnd = view => extendSel(view, range => EditorSelection.cursor(view.visualLineAt(range.head).to));
/**
Move the selection to the start of the document.
*/
const cursorDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: 0 }));
    return true;
};
/**
Move the selection to the end of the document.
*/
const cursorDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.doc.length }));
    return true;
};
/**
Move the selection head to the start of the document.
*/
const selectDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: 0 }));
    return true;
};
/**
Move the selection head to the end of the document.
*/
const selectDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: state.doc.length }));
    return true;
};
/**
Select the entire document.
*/
const selectAll = ({ state, dispatch }) => {
    dispatch(state.update({ selection: { anchor: 0, head: state.doc.length }, userEvent: "select" }));
    return true;
};
/**
Expand the selection to cover entire lines.
*/
const selectLine = ({ state, dispatch }) => {
    let ranges = selectedLineBlocks(state).map(({ from, to }) => EditorSelection.range(from, Math.min(to + 1, state.doc.length)));
    dispatch(state.update({ selection: EditorSelection.create(ranges), userEvent: "select" }));
    return true;
};
/**
Select the next syntactic construct that is larger than the
selection. Note that this will only work insofar as the language
[provider](https://codemirror.net/6/docs/ref/#language.language) you use builds up a full
syntax tree.
*/
const selectParentSyntax = ({ state, dispatch }) => {
    let selection = updateSel(state.selection, range => {
        var _a;
        let context = syntaxTree(state).resolveInner(range.head, 1);
        while (!((context.from < range.from && context.to >= range.to) ||
            (context.to > range.to && context.from <= range.from) ||
            !((_a = context.parent) === null || _a === void 0 ? void 0 : _a.parent)))
            context = context.parent;
        return EditorSelection.range(context.to, context.from);
    });
    dispatch(setSel(state, selection));
    return true;
};
/**
Simplify the current selection. When multiple ranges are selected,
reduce it to its main range. Otherwise, if the selection is
non-empty, convert it to a cursor selection.
*/
const simplifySelection = ({ state, dispatch }) => {
    let cur = state.selection, selection = null;
    if (cur.ranges.length > 1)
        selection = EditorSelection.create([cur.main]);
    else if (!cur.main.empty)
        selection = EditorSelection.create([EditorSelection.cursor(cur.main.head)]);
    if (!selection)
        return false;
    dispatch(setSel(state, selection));
    return true;
};
function deleteBy({ state, dispatch }, by) {
    if (state.readOnly)
        return false;
    let event = "delete.selection";
    let changes = state.changeByRange(range => {
        let { from, to } = range;
        if (from == to) {
            let towards = by(from);
            if (towards < from)
                event = "delete.backward";
            else if (towards > from)
                event = "delete.forward";
            from = Math.min(from, towards);
            to = Math.max(to, towards);
        }
        return from == to ? { range } : { changes: { from, to }, range: EditorSelection.cursor(from) };
    });
    if (changes.changes.empty)
        return false;
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: event }));
    return true;
}
function skipAtomic(target, pos, forward) {
    if (target instanceof EditorView)
        for (let ranges of target.pluginField(PluginField.atomicRanges))
            ranges.between(pos, pos, (from, to) => {
                if (from < pos && to > pos)
                    pos = forward ? to : from;
            });
    return pos;
}
const deleteByChar = (target, forward) => deleteBy(target, pos => {
    let { state } = target, line = state.doc.lineAt(pos), before, targetPos;
    if (!forward && pos > line.from && pos < line.from + 200 &&
        !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
        if (before[before.length - 1] == "\t")
            return pos - 1;
        let col = countColumn(before, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
        for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
            pos--;
        targetPos = pos;
    }
    else {
        targetPos = findClusterBreak(line.text, pos - line.from, forward) + line.from;
        if (targetPos == pos && line.number != (forward ? state.doc.lines : 1))
            targetPos += forward ? 1 : -1;
    }
    return skipAtomic(target, targetPos, forward);
});
/**
Delete the selection, or, for cursor selections, the character
before the cursor.
*/
const deleteCharBackward = view => deleteByChar(view, false);
/**
Delete the selection or the character after the cursor.
*/
const deleteCharForward = view => deleteByChar(view, true);
const deleteByGroup = (target, forward) => deleteBy(target, start => {
    let pos = start, { state } = target, line = state.doc.lineAt(pos);
    let categorize = state.charCategorizer(pos);
    for (let cat = null;;) {
        if (pos == (forward ? line.to : line.from)) {
            if (pos == start && line.number != (forward ? state.doc.lines : 1))
                pos += forward ? 1 : -1;
            break;
        }
        let next = findClusterBreak(line.text, pos - line.from, forward) + line.from;
        let nextChar = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
        let nextCat = categorize(nextChar);
        if (cat != null && nextCat != cat)
            break;
        if (nextChar != " " || pos != start)
            cat = nextCat;
        pos = next;
    }
    return skipAtomic(target, pos, forward);
});
/**
Delete the selection or backward until the end of the next
[group](https://codemirror.net/6/docs/ref/#view.EditorView.moveByGroup), only skipping groups of
whitespace when they consist of a single space.
*/
const deleteGroupBackward = target => deleteByGroup(target, false);
/**
Delete the selection or forward until the end of the next group.
*/
const deleteGroupForward = target => deleteByGroup(target, true);
/**
Delete the selection, or, if it is a cursor selection, delete to
the end of the line. If the cursor is directly at the end of the
line, delete the line break after it.
*/
const deleteToLineEnd = view => deleteBy(view, pos => {
    let lineEnd = view.visualLineAt(pos).to;
    return skipAtomic(view, pos < lineEnd ? lineEnd : Math.min(view.state.doc.length, pos + 1), true);
});
/**
Delete the selection, or, if it is a cursor selection, delete to
the start of the line. If the cursor is directly at the start of the
line, delete the line break before it.
*/
const deleteToLineStart = view => deleteBy(view, pos => {
    let lineStart = view.visualLineAt(pos).from;
    return skipAtomic(view, pos > lineStart ? lineStart : Math.max(0, pos - 1), false);
});
/**
Replace each selection range with a line break, leaving the cursor
on the line before the break.
*/
const splitLine = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let changes = state.changeByRange(range => {
        return { changes: { from: range.from, to: range.to, insert: Text.of(["", ""]) },
            range: EditorSelection.cursor(range.from) };
    });
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
    return true;
};
/**
Flip the characters before and after the cursor(s).
*/
const transposeChars = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let changes = state.changeByRange(range => {
        if (!range.empty || range.from == 0 || range.from == state.doc.length)
            return { range };
        let pos = range.from, line = state.doc.lineAt(pos);
        let from = pos == line.from ? pos - 1 : findClusterBreak(line.text, pos - line.from, false) + line.from;
        let to = pos == line.to ? pos + 1 : findClusterBreak(line.text, pos - line.from, true) + line.from;
        return { changes: { from, to, insert: state.doc.slice(pos, to).append(state.doc.slice(from, pos)) },
            range: EditorSelection.cursor(to) };
    });
    if (changes.changes.empty)
        return false;
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "move.character" }));
    return true;
};
function selectedLineBlocks(state) {
    let blocks = [], upto = -1;
    for (let range of state.selection.ranges) {
        let startLine = state.doc.lineAt(range.from), endLine = state.doc.lineAt(range.to);
        if (!range.empty && range.to == endLine.from)
            endLine = state.doc.lineAt(range.to - 1);
        if (upto >= startLine.number) {
            let prev = blocks[blocks.length - 1];
            prev.to = endLine.to;
            prev.ranges.push(range);
        }
        else {
            blocks.push({ from: startLine.from, to: endLine.to, ranges: [range] });
        }
        upto = endLine.number + 1;
    }
    return blocks;
}
function moveLine(state, dispatch, forward) {
    if (state.readOnly)
        return false;
    let changes = [], ranges = [];
    for (let block of selectedLineBlocks(state)) {
        if (forward ? block.to == state.doc.length : block.from == 0)
            continue;
        let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
        let size = nextLine.length + 1;
        if (forward) {
            changes.push({ from: block.to, to: nextLine.to }, { from: block.from, insert: nextLine.text + state.lineBreak });
            for (let r of block.ranges)
                ranges.push(EditorSelection.range(Math.min(state.doc.length, r.anchor + size), Math.min(state.doc.length, r.head + size)));
        }
        else {
            changes.push({ from: nextLine.from, to: block.from }, { from: block.to, insert: state.lineBreak + nextLine.text });
            for (let r of block.ranges)
                ranges.push(EditorSelection.range(r.anchor - size, r.head - size));
        }
    }
    if (!changes.length)
        return false;
    dispatch(state.update({
        changes,
        scrollIntoView: true,
        selection: EditorSelection.create(ranges, state.selection.mainIndex),
        userEvent: "move.line"
    }));
    return true;
}
/**
Move the selected lines up one line.
*/
const moveLineUp = ({ state, dispatch }) => moveLine(state, dispatch, false);
/**
Move the selected lines down one line.
*/
const moveLineDown = ({ state, dispatch }) => moveLine(state, dispatch, true);
function copyLine(state, dispatch, forward) {
    if (state.readOnly)
        return false;
    let changes = [];
    for (let block of selectedLineBlocks(state)) {
        if (forward)
            changes.push({ from: block.from, insert: state.doc.slice(block.from, block.to) + state.lineBreak });
        else
            changes.push({ from: block.to, insert: state.lineBreak + state.doc.slice(block.from, block.to) });
    }
    dispatch(state.update({ changes, scrollIntoView: true, userEvent: "input.copyline" }));
    return true;
}
/**
Create a copy of the selected lines. Keep the selection in the top copy.
*/
const copyLineUp = ({ state, dispatch }) => copyLine(state, dispatch, false);
/**
Create a copy of the selected lines. Keep the selection in the bottom copy.
*/
const copyLineDown = ({ state, dispatch }) => copyLine(state, dispatch, true);
/**
Delete selected lines.
*/
const deleteLine = view => {
    if (view.state.readOnly)
        return false;
    let { state } = view, changes = state.changes(selectedLineBlocks(state).map(({ from, to }) => {
        if (from > 0)
            from--;
        else if (to < state.doc.length)
            to++;
        return { from, to };
    }));
    let selection = updateSel(state.selection, range => view.moveVertically(range, true)).map(changes);
    view.dispatch({ changes, selection, scrollIntoView: true, userEvent: "delete.line" });
    return true;
};
function isBetweenBrackets(state, pos) {
    if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1)))
        return { from: pos, to: pos };
    let context = syntaxTree(state).resolveInner(pos);
    let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
    if (before && after && before.to <= pos && after.from >= pos &&
        (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 &&
        state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from)
        return { from: before.to, to: after.from };
    return null;
}
/**
Replace the selection with a newline and indent the newly created
line(s). If the current line consists only of whitespace, this
will also delete that whitespace. When the cursor is between
matching brackets, an additional newline will be inserted after
the cursor.
*/
const insertNewlineAndIndent = /*@__PURE__*/newlineAndIndent(false);
/**
Create a blank, indented line below the current line.
*/
const insertBlankLine = /*@__PURE__*/newlineAndIndent(true);
function newlineAndIndent(atEof) {
    return ({ state, dispatch }) => {
        if (state.readOnly)
            return false;
        let changes = state.changeByRange(range => {
            let { from, to } = range, line = state.doc.lineAt(from);
            let explode = !atEof && from == to && isBetweenBrackets(state, from);
            if (atEof)
                from = to = (to <= line.to ? line : state.doc.lineAt(to)).to;
            let cx = new IndentContext(state, { simulateBreak: from, simulateDoubleBreak: !!explode });
            let indent = getIndentation(cx, from);
            if (indent == null)
                indent = /^\s*/.exec(state.doc.lineAt(from).text)[0].length;
            while (to < line.to && /\s/.test(line.text[to - line.from]))
                to++;
            if (explode)
                ({ from, to } = explode);
            else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
                from = line.from;
            let insert = ["", indentString(state, indent)];
            if (explode)
                insert.push(indentString(state, cx.lineIndent(line.from, -1)));
            return { changes: { from, to, insert: Text.of(insert) },
                range: EditorSelection.cursor(from + 1 + insert[1].length) };
        });
        dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
        return true;
    };
}
function changeBySelectedLine(state, f) {
    let atLine = -1;
    return state.changeByRange(range => {
        let changes = [];
        for (let pos = range.from; pos <= range.to;) {
            let line = state.doc.lineAt(pos);
            if (line.number > atLine && (range.empty || range.to > line.from)) {
                f(line, changes, range);
                atLine = line.number;
            }
            pos = line.to + 1;
        }
        let changeSet = state.changes(changes);
        return { changes,
            range: EditorSelection.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1)) };
    });
}
/**
Auto-indent the selected lines. This uses the [indentation service
facet](https://codemirror.net/6/docs/ref/#language.indentService) as source for auto-indent
information.
*/
const indentSelection = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let updated = Object.create(null);
    let context = new IndentContext(state, { overrideIndentation: start => {
            let found = updated[start];
            return found == null ? -1 : found;
        } });
    let changes = changeBySelectedLine(state, (line, changes, range) => {
        let indent = getIndentation(context, line.from);
        if (indent == null)
            return;
        if (!/\S/.test(line.text))
            indent = 0;
        let cur = /^\s*/.exec(line.text)[0];
        let norm = indentString(state, indent);
        if (cur != norm || range.from < line.from + cur.length) {
            updated[line.from] = indent;
            changes.push({ from: line.from, to: line.from + cur.length, insert: norm });
        }
    });
    if (!changes.changes.empty)
        dispatch(state.update(changes, { userEvent: "indent" }));
    return true;
};
/**
Add a [unit](https://codemirror.net/6/docs/ref/#language.indentUnit) of indentation to all selected
lines.
*/
const indentMore = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
        changes.push({ from: line.from, insert: state.facet(indentUnit) });
    }), { userEvent: "input.indent" }));
    return true;
};
/**
Remove a [unit](https://codemirror.net/6/docs/ref/#language.indentUnit) of indentation from all
selected lines.
*/
const indentLess = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
        let space = /^\s*/.exec(line.text)[0];
        if (!space)
            return;
        let col = countColumn(space, state.tabSize), keep = 0;
        let insert = indentString(state, Math.max(0, col - getIndentUnit(state)));
        while (keep < space.length && keep < insert.length && space.charCodeAt(keep) == insert.charCodeAt(keep))
            keep++;
        changes.push({ from: line.from + keep, to: line.from + space.length, insert: insert.slice(keep) });
    }), { userEvent: "delete.dedent" }));
    return true;
};
/**
Array of key bindings containing the Emacs-style bindings that are
available on macOS by default.

 - Ctrl-b: [`cursorCharLeft`](https://codemirror.net/6/docs/ref/#commands.cursorCharLeft) ([`selectCharLeft`](https://codemirror.net/6/docs/ref/#commands.selectCharLeft) with Shift)
 - Ctrl-f: [`cursorCharRight`](https://codemirror.net/6/docs/ref/#commands.cursorCharRight) ([`selectCharRight`](https://codemirror.net/6/docs/ref/#commands.selectCharRight) with Shift)
 - Ctrl-p: [`cursorLineUp`](https://codemirror.net/6/docs/ref/#commands.cursorLineUp) ([`selectLineUp`](https://codemirror.net/6/docs/ref/#commands.selectLineUp) with Shift)
 - Ctrl-n: [`cursorLineDown`](https://codemirror.net/6/docs/ref/#commands.cursorLineDown) ([`selectLineDown`](https://codemirror.net/6/docs/ref/#commands.selectLineDown) with Shift)
 - Ctrl-a: [`cursorLineStart`](https://codemirror.net/6/docs/ref/#commands.cursorLineStart) ([`selectLineStart`](https://codemirror.net/6/docs/ref/#commands.selectLineStart) with Shift)
 - Ctrl-e: [`cursorLineEnd`](https://codemirror.net/6/docs/ref/#commands.cursorLineEnd) ([`selectLineEnd`](https://codemirror.net/6/docs/ref/#commands.selectLineEnd) with Shift)
 - Ctrl-d: [`deleteCharForward`](https://codemirror.net/6/docs/ref/#commands.deleteCharForward)
 - Ctrl-h: [`deleteCharBackward`](https://codemirror.net/6/docs/ref/#commands.deleteCharBackward)
 - Ctrl-k: [`deleteToLineEnd`](https://codemirror.net/6/docs/ref/#commands.deleteToLineEnd)
 - Ctrl-Alt-h: [`deleteGroupBackward`](https://codemirror.net/6/docs/ref/#commands.deleteGroupBackward)
 - Ctrl-o: [`splitLine`](https://codemirror.net/6/docs/ref/#commands.splitLine)
 - Ctrl-t: [`transposeChars`](https://codemirror.net/6/docs/ref/#commands.transposeChars)
 - Alt-<: [`cursorDocStart`](https://codemirror.net/6/docs/ref/#commands.cursorDocStart)
 - Alt->: [`cursorDocEnd`](https://codemirror.net/6/docs/ref/#commands.cursorDocEnd)
 - Ctrl-v: [`cursorPageDown`](https://codemirror.net/6/docs/ref/#commands.cursorPageDown)
 - Alt-v: [`cursorPageUp`](https://codemirror.net/6/docs/ref/#commands.cursorPageUp)
*/
const emacsStyleKeymap = [
    { key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
    { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
    { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
    { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
    { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
    { key: "Ctrl-d", run: deleteCharForward },
    { key: "Ctrl-h", run: deleteCharBackward },
    { key: "Ctrl-k", run: deleteToLineEnd },
    { key: "Ctrl-Alt-h", run: deleteGroupBackward },
    { key: "Ctrl-o", run: splitLine },
    { key: "Ctrl-t", run: transposeChars },
    { key: "Alt-<", run: cursorDocStart },
    { key: "Alt->", run: cursorDocEnd },
    { key: "Ctrl-v", run: cursorPageDown },
    { key: "Alt-v", run: cursorPageUp },
];
/**
An array of key bindings closely sticking to platform-standard or
widely used bindings. (This includes the bindings from
[`emacsStyleKeymap`](https://codemirror.net/6/docs/ref/#commands.emacsStyleKeymap), with their `key`
property changed to `mac`.)

 - ArrowLeft: [`cursorCharLeft`](https://codemirror.net/6/docs/ref/#commands.cursorCharLeft) ([`selectCharLeft`](https://codemirror.net/6/docs/ref/#commands.selectCharLeft) with Shift)
 - ArrowRight: [`cursorCharRight`](https://codemirror.net/6/docs/ref/#commands.cursorCharRight) ([`selectCharRight`](https://codemirror.net/6/docs/ref/#commands.selectCharRight) with Shift)
 - Ctrl-ArrowLeft (Alt-ArrowLeft on macOS): [`cursorGroupLeft`](https://codemirror.net/6/docs/ref/#commands.cursorGroupLeft) ([`selectGroupLeft`](https://codemirror.net/6/docs/ref/#commands.selectGroupLeft) with Shift)
 - Ctrl-ArrowRight (Alt-ArrowRight on macOS): [`cursorGroupRight`](https://codemirror.net/6/docs/ref/#commands.cursorGroupRight) ([`selectGroupRight`](https://codemirror.net/6/docs/ref/#commands.selectGroupRight) with Shift)
 - Cmd-ArrowLeft (on macOS): [`cursorLineStart`](https://codemirror.net/6/docs/ref/#commands.cursorLineStart) ([`selectLineStart`](https://codemirror.net/6/docs/ref/#commands.selectLineStart) with Shift)
 - Cmd-ArrowRight (on macOS): [`cursorLineEnd`](https://codemirror.net/6/docs/ref/#commands.cursorLineEnd) ([`selectLineEnd`](https://codemirror.net/6/docs/ref/#commands.selectLineEnd) with Shift)
 - ArrowUp: [`cursorLineUp`](https://codemirror.net/6/docs/ref/#commands.cursorLineUp) ([`selectLineUp`](https://codemirror.net/6/docs/ref/#commands.selectLineUp) with Shift)
 - ArrowDown: [`cursorLineDown`](https://codemirror.net/6/docs/ref/#commands.cursorLineDown) ([`selectLineDown`](https://codemirror.net/6/docs/ref/#commands.selectLineDown) with Shift)
 - Cmd-ArrowUp (on macOS): [`cursorDocStart`](https://codemirror.net/6/docs/ref/#commands.cursorDocStart) ([`selectDocStart`](https://codemirror.net/6/docs/ref/#commands.selectDocStart) with Shift)
 - Cmd-ArrowDown (on macOS): [`cursorDocEnd`](https://codemirror.net/6/docs/ref/#commands.cursorDocEnd) ([`selectDocEnd`](https://codemirror.net/6/docs/ref/#commands.selectDocEnd) with Shift)
 - Ctrl-ArrowUp (on macOS): [`cursorPageUp`](https://codemirror.net/6/docs/ref/#commands.cursorPageUp) ([`selectPageUp`](https://codemirror.net/6/docs/ref/#commands.selectPageUp) with Shift)
 - Ctrl-ArrowDown (on macOS): [`cursorPageDown`](https://codemirror.net/6/docs/ref/#commands.cursorPageDown) ([`selectPageDown`](https://codemirror.net/6/docs/ref/#commands.selectPageDown) with Shift)
 - PageUp: [`cursorPageUp`](https://codemirror.net/6/docs/ref/#commands.cursorPageUp) ([`selectPageUp`](https://codemirror.net/6/docs/ref/#commands.selectPageUp) with Shift)
 - PageDown: [`cursorPageDown`](https://codemirror.net/6/docs/ref/#commands.cursorPageDown) ([`selectPageDown`](https://codemirror.net/6/docs/ref/#commands.selectPageDown) with Shift)
 - Home: [`cursorLineBoundaryBackward`](https://codemirror.net/6/docs/ref/#commands.cursorLineBoundaryBackward) ([`selectLineBoundaryBackward`](https://codemirror.net/6/docs/ref/#commands.selectLineBoundaryBackward) with Shift)
 - End: [`cursorLineBoundaryForward`](https://codemirror.net/6/docs/ref/#commands.cursorLineBoundaryForward) ([`selectLineBoundaryForward`](https://codemirror.net/6/docs/ref/#commands.selectLineBoundaryForward) with Shift)
 - Ctrl-Home (Cmd-Home on macOS): [`cursorDocStart`](https://codemirror.net/6/docs/ref/#commands.cursorDocStart) ([`selectDocStart`](https://codemirror.net/6/docs/ref/#commands.selectDocStart) with Shift)
 - Ctrl-End (Cmd-Home on macOS): [`cursorDocEnd`](https://codemirror.net/6/docs/ref/#commands.cursorDocEnd) ([`selectDocEnd`](https://codemirror.net/6/docs/ref/#commands.selectDocEnd) with Shift)
 - Enter: [`insertNewlineAndIndent`](https://codemirror.net/6/docs/ref/#commands.insertNewlineAndIndent)
 - Ctrl-a (Cmd-a on macOS): [`selectAll`](https://codemirror.net/6/docs/ref/#commands.selectAll)
 - Backspace: [`deleteCharBackward`](https://codemirror.net/6/docs/ref/#commands.deleteCharBackward)
 - Delete: [`deleteCharForward`](https://codemirror.net/6/docs/ref/#commands.deleteCharForward)
 - Ctrl-Backspace (Alt-Backspace on macOS): [`deleteGroupBackward`](https://codemirror.net/6/docs/ref/#commands.deleteGroupBackward)
 - Ctrl-Delete (Alt-Delete on macOS): [`deleteGroupForward`](https://codemirror.net/6/docs/ref/#commands.deleteGroupForward)
 - Cmd-Backspace (macOS): [`deleteToLineStart`](https://codemirror.net/6/docs/ref/#commands.deleteToLineStart).
 - Cmd-Delete (macOS): [`deleteToLineEnd`](https://codemirror.net/6/docs/ref/#commands.deleteToLineEnd).
*/
const standardKeymap = /*@__PURE__*/[
    { key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft },
    { mac: "Cmd-ArrowLeft", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward },
    { key: "ArrowRight", run: cursorCharRight, shift: selectCharRight, preventDefault: true },
    { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight },
    { mac: "Cmd-ArrowRight", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward },
    { key: "ArrowUp", run: cursorLineUp, shift: selectLineUp, preventDefault: true },
    { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
    { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
    { key: "ArrowDown", run: cursorLineDown, shift: selectLineDown, preventDefault: true },
    { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
    { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
    { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
    { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
    { key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward },
    { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
    { key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward },
    { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
    { key: "Enter", run: insertNewlineAndIndent },
    { key: "Mod-a", run: selectAll },
    { key: "Backspace", run: deleteCharBackward, shift: deleteCharBackward },
    { key: "Delete", run: deleteCharForward, shift: deleteCharForward },
    { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward },
    { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward },
    { mac: "Mod-Backspace", run: deleteToLineStart },
    { mac: "Mod-Delete", run: deleteToLineEnd }
].concat(/*@__PURE__*/emacsStyleKeymap.map(b => ({ mac: b.key, run: b.run, shift: b.shift })));
/**
The default keymap. Includes all bindings from
[`standardKeymap`](https://codemirror.net/6/docs/ref/#commands.standardKeymap) plus the following:

- Alt-ArrowLeft (Ctrl-ArrowLeft on macOS): [`cursorSyntaxLeft`](https://codemirror.net/6/docs/ref/#commands.cursorSyntaxLeft) ([`selectSyntaxLeft`](https://codemirror.net/6/docs/ref/#commands.selectSyntaxLeft) with Shift)
- Alt-ArrowRight (Ctrl-ArrowRight on macOS): [`cursorSyntaxRight`](https://codemirror.net/6/docs/ref/#commands.cursorSyntaxRight) ([`selectSyntaxRight`](https://codemirror.net/6/docs/ref/#commands.selectSyntaxRight) with Shift)
- Alt-ArrowUp: [`moveLineUp`](https://codemirror.net/6/docs/ref/#commands.moveLineUp)
- Alt-ArrowDown: [`moveLineDown`](https://codemirror.net/6/docs/ref/#commands.moveLineDown)
- Shift-Alt-ArrowUp: [`copyLineUp`](https://codemirror.net/6/docs/ref/#commands.copyLineUp)
- Shift-Alt-ArrowDown: [`copyLineDown`](https://codemirror.net/6/docs/ref/#commands.copyLineDown)
- Escape: [`simplifySelection`](https://codemirror.net/6/docs/ref/#commands.simplifySelection)
- Ctrl-Enter (Comd-Enter on macOS): [`insertBlankLine`](https://codemirror.net/6/docs/ref/#commands.insertBlankLine)
- Alt-l (Ctrl-l on macOS): [`selectLine`](https://codemirror.net/6/docs/ref/#commands.selectLine)
- Ctrl-i (Cmd-i on macOS): [`selectParentSyntax`](https://codemirror.net/6/docs/ref/#commands.selectParentSyntax)
- Ctrl-[ (Cmd-[ on macOS): [`indentLess`](https://codemirror.net/6/docs/ref/#commands.indentLess)
- Ctrl-] (Cmd-] on macOS): [`indentMore`](https://codemirror.net/6/docs/ref/#commands.indentMore)
- Ctrl-Alt-\\ (Cmd-Alt-\\ on macOS): [`indentSelection`](https://codemirror.net/6/docs/ref/#commands.indentSelection)
- Shift-Ctrl-k (Shift-Cmd-k on macOS): [`deleteLine`](https://codemirror.net/6/docs/ref/#commands.deleteLine)
- Shift-Ctrl-\\ (Shift-Cmd-\\ on macOS): [`cursorMatchingBracket`](https://codemirror.net/6/docs/ref/#commands.cursorMatchingBracket)
*/
const defaultKeymap = /*@__PURE__*/[
    { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
    { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },
    { key: "Alt-ArrowUp", run: moveLineUp },
    { key: "Shift-Alt-ArrowUp", run: copyLineUp },
    { key: "Alt-ArrowDown", run: moveLineDown },
    { key: "Shift-Alt-ArrowDown", run: copyLineDown },
    { key: "Escape", run: simplifySelection },
    { key: "Mod-Enter", run: insertBlankLine },
    { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
    { key: "Mod-i", run: selectParentSyntax, preventDefault: true },
    { key: "Mod-[", run: indentLess },
    { key: "Mod-]", run: indentMore },
    { key: "Mod-Alt-\\", run: indentSelection },
    { key: "Shift-Mod-k", run: deleteLine },
    { key: "Shift-Mod-\\", run: cursorMatchingBracket }
].concat(standardKeymap);
/**
A binding that binds Tab to [`indentMore`](https://codemirror.net/6/docs/ref/#commands.indentMore) and
Shift-Tab to [`indentLess`](https://codemirror.net/6/docs/ref/#commands.indentLess).
Please see the [Tab example](../../examples/tab/) before using
this.
*/
const indentWithTab = { key: "Tab", run: indentMore, shift: indentLess };

/**
Comment or uncomment the current selection. Will use line comments
if available, otherwise falling back to block comments.
*/
const toggleComment = target => {
    let config = getConfig(target.state);
    return config.line ? toggleLineComment(target) : config.block ? toggleBlockComment(target) : false;
};
function command(f, option) {
    return ({ state, dispatch }) => {
        let tr = f(option, state.selection.ranges, state);
        if (!tr)
            return false;
        dispatch(state.update(tr));
        return true;
    };
}
/**
Comment or uncomment the current selection using line comments.
The line comment syntax is taken from the
[`commentTokens`](https://codemirror.net/6/docs/ref/#comment.CommentTokens) [language
data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt).
*/
const toggleLineComment = /*@__PURE__*/command(changeLineComment, 0 /* Toggle */);
/**
Comment or uncomment the current selection using block comments.
The block comment syntax is taken from the
[`commentTokens`](https://codemirror.net/6/docs/ref/#comment.CommentTokens) [language
data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt).
*/
const toggleBlockComment = /*@__PURE__*/command(changeBlockComment, 0 /* Toggle */);
/**
Default key bindings for this package.

 - Ctrl-/ (Cmd-/ on macOS): [`toggleComment`](https://codemirror.net/6/docs/ref/#comment.toggleComment).
 - Shift-Alt-a: [`toggleBlockComment`](https://codemirror.net/6/docs/ref/#comment.toggleBlockComment).
*/
const commentKeymap = [
    { key: "Mod-/", run: toggleComment },
    { key: "Alt-A", run: toggleBlockComment }
];
function getConfig(state, pos = state.selection.main.head) {
    let data = state.languageDataAt("commentTokens", pos);
    return data.length ? data[0] : {};
}
const SearchMargin = 50;
/**
Determines if the given range is block-commented in the given
state.
*/
function findBlockComment(state, { open, close }, from, to) {
    let textBefore = state.sliceDoc(from - SearchMargin, from);
    let textAfter = state.sliceDoc(to, to + SearchMargin);
    let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
    let beforeOff = textBefore.length - spaceBefore;
    if (textBefore.slice(beforeOff - open.length, beforeOff) == open &&
        textAfter.slice(spaceAfter, spaceAfter + close.length) == close) {
        return { open: { pos: from - spaceBefore, margin: spaceBefore && 1 },
            close: { pos: to + spaceAfter, margin: spaceAfter && 1 } };
    }
    let startText, endText;
    if (to - from <= 2 * SearchMargin) {
        startText = endText = state.sliceDoc(from, to);
    }
    else {
        startText = state.sliceDoc(from, from + SearchMargin);
        endText = state.sliceDoc(to - SearchMargin, to);
    }
    let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
    let endOff = endText.length - endSpace - close.length;
    if (startText.slice(startSpace, startSpace + open.length) == open &&
        endText.slice(endOff, endOff + close.length) == close) {
        return { open: { pos: from + startSpace + open.length,
                margin: /\s/.test(startText.charAt(startSpace + open.length)) ? 1 : 0 },
            close: { pos: to - endSpace - close.length,
                margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0 } };
    }
    return null;
}
// Performs toggle, comment and uncomment of block comments in
// languages that support them.
function changeBlockComment(option, ranges, state) {
    let tokens = ranges.map(r => getConfig(state, r.from).block);
    if (!tokens.every(c => c))
        return null;
    let comments = ranges.map((r, i) => findBlockComment(state, tokens[i], r.from, r.to));
    if (option != 2 /* Uncomment */ && !comments.every(c => c)) {
        let index = 0;
        return state.changeByRange(range => {
            let { open, close } = tokens[index++];
            if (comments[index])
                return { range };
            let shift = open.length + 1;
            return {
                changes: [{ from: range.from, insert: open + " " }, { from: range.to, insert: " " + close }],
                range: EditorSelection.range(range.anchor + shift, range.head + shift)
            };
        });
    }
    else if (option != 1 /* Comment */ && comments.some(c => c)) {
        let changes = [];
        for (let i = 0, comment; i < comments.length; i++)
            if (comment = comments[i]) {
                let token = tokens[i], { open, close } = comment;
                changes.push({ from: open.pos - token.open.length, to: open.pos + open.margin }, { from: close.pos - close.margin, to: close.pos + token.close.length });
            }
        return { changes };
    }
    return null;
}
// Performs toggle, comment and uncomment of line comments.
function changeLineComment(option, ranges, state) {
    let lines = [];
    let prevLine = -1;
    for (let { from, to } of ranges) {
        let startI = lines.length, minIndent = 1e9;
        for (let pos = from; pos <= to;) {
            let line = state.doc.lineAt(pos);
            if (line.from > prevLine && (from == to || to > line.from)) {
                prevLine = line.from;
                let token = getConfig(state, pos).line;
                if (!token)
                    continue;
                let indent = /^\s*/.exec(line.text)[0].length;
                let empty = indent == line.length;
                let comment = line.text.slice(indent, indent + token.length) == token ? indent : -1;
                if (indent < line.text.length && indent < minIndent)
                    minIndent = indent;
                lines.push({ line, comment, token, indent, empty, single: false });
            }
            pos = line.to + 1;
        }
        if (minIndent < 1e9)
            for (let i = startI; i < lines.length; i++)
                if (lines[i].indent < lines[i].line.text.length)
                    lines[i].indent = minIndent;
        if (lines.length == startI + 1)
            lines[startI].single = true;
    }
    if (option != 2 /* Uncomment */ && lines.some(l => l.comment < 0 && (!l.empty || l.single))) {
        let changes = [];
        for (let { line, token, indent, empty, single } of lines)
            if (single || !empty)
                changes.push({ from: line.from + indent, insert: token + " " });
        let changeSet = state.changes(changes);
        return { changes: changeSet, selection: state.selection.map(changeSet, 1) };
    }
    else if (option != 1 /* Comment */ && lines.some(l => l.comment >= 0)) {
        let changes = [];
        for (let { line, comment, token } of lines)
            if (comment >= 0) {
                let from = line.from + comment, to = from + token.length;
                if (line.text[to - line.from] == " ")
                    to++;
                changes.push({ from, to });
            }
        return { changes };
    }
    return null;
}

// svg presets
let prec = 2;
let size = 500;

// global elements
let code = document.querySelector('#code');
let conv = document.querySelector('#conv');
let disp = document.querySelector('#disp');
let stat = document.querySelector('#stat');
let copy = document.querySelector('#copy');
let mid = document.querySelector('#mid');
let left = document.querySelector('#left');
let right = document.querySelector('#right');
document.querySelector('#interActiveControl');

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
    if (out instanceof Element$2) {
        let args = {size: size, prec: prec};
        out = (out instanceof SVG) ? out : new SVG(out, args);
        svg = out.svg();
        return svg
    } else {
        return String(out);
    }
}

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
        if (err == 'timeout') {
            setConvert('function timeout');
        } else {
            setConvert(`parse error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
        }
        setState(false);
        return;
    }

    // render gum tree
    if (elem == null) {
        setConvert(err_nodata);
        setState();
    } else {
        let svg;
        try {
            svg = renderGum(elem);
        } catch (err) {
            setConvert(`render error, line ${err.lineNumber}: ${err.message}\n${err.stack}`);
            setState(false);
            return;
        }
        setConvert(svg);
        setState(true);
        disp.innerHTML = svg;
    }
}

// init convert
let conv_text = new EditorView({
    state: EditorState.create({
        doc: '',
        extensions: [
            xml(),
            drawSelection(),
            defaultHighlightStyle.fallback,
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
                ...commentKeymap,
            ]),
            defaultHighlightStyle.fallback,
            EditorView.updateListener.of(upd => {
                if (upd.docChanged) {
                    console.log('updating');
                    let text = getText(upd.state);
                    updateView(text);
                }
            }),
        ],
    }),
    parent: code,
});

// connect handlers
copy.addEventListener('click', evt => {
    let text = conv_text.state.doc.toString();
    navigator.clipboard.writeText(text);
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
