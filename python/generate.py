# gum.js code generation

import re
import os
import json
from glob import glob
from itertools import chain

import oneping

##
## doc parsing
##

# link to text
def inherit_repl(match):
    inner = match.groups()[0]
    classes = re.sub(r'\[([^]]+)\]\([^)]+\)', r'\1', inner)
    return f'Inherits: {classes}'

# prepare docs
def prepare_text(text):
    text = re.sub(r'# ([^#]+)', r'## \1', text)
    text = re.sub(r'<span class="inherit">([^<]+)</span>', inherit_repl, text)
    return text.strip()

def prepare_code(text):
    text = f'```javascript\n{text.strip()}\n```'
    return text

def get_file_base(fn):
    fname = os.path.basename(fn)
    return os.path.splitext(fname)[0]

##
## assemble system prompt
##

# get prompt intro
with open('../docs/type/prompt.md') as fid:
    prompt_intro = fid.read()

# get prompt examples
with open('../docs/type/examples.md') as fid:
    prompt_examples = fid.read()

# get docs metadata
with open('../docs/meta.json') as fid:
    docs_meta = json.load(fid)
meta_list = [
    (n[0] if type(n) is list else n).lower() for n in
    chain.from_iterable([v for v in vs] for k, vs in docs_meta.items())
]

# get docs content
doc_text = {get_file_base(fn): prepare_text(open(fn).read()) for fn in glob('../docs/text/*.md')}
doc_code = {get_file_base(fn): prepare_code(open(fn).read()) for fn in glob('../docs/code/*.js')}
prompt_docs = '\n\n'.join(f'{doc_text[k]}\n\n### Example\n\n{doc_code[k]}' for k in meta_list)

# create full prompt
prompt_launch = 'Now, generate JavaScript code using gum.js based on the given description or requirements, following the guidelines, documentation, and example provided above.'
prompt_system = f"""{prompt_intro}

# Documentation

{prompt_docs}

# Examples

{prompt_examples}

# Generation

{prompt_launch}"""

##
## main interface
##

def generate_gumjs(instruct, provider='anthropic', **kwargs):
    return oneping.get_llm_response(instruct, system=prompt_system, provider=provider, **kwargs)
