# gum.js editor in fasthtml

from fasthtml.common import *
from starlette.responses import StreamingResponse

import generate

# dumbass models giving me markdown
def invert_code_blocks(text):
    parts = re.split(r'(```[^\n]*\n[\s\S]*?\n```)', text, flags=re.MULTILINE)
    result = []
    for part in parts:
        if part.startswith('```javascript') and part.endswith('```'):
            result.append(part[13:-3].strip())
        else:
            result.append(f'/*\n{part.strip()}\n*/')
    return '\n\n'.join(result)

# Set up the app, including tailwind
hdrs = [
    ScriptX('web/libs/tailwind.js'),
    ScriptX('web/libs/ace/ace.js'),
    ScriptX('web/libs/gum.js'),
    Link(rel='stylesheet', href='web/index.css'),
]
app, rt = fast_app(hdrs=hdrs, pico=False, live=True, debug=True)

@rt('/')
def get():
    # prompt area
    inputs = Textarea(id='inputs', cls='h-full grow p-2 resize-none outline-none source-code text-sm', rows='5', placeholder='Enter your prompt here...')
    generate = Button(id='generate', cls='bg-blue-600 hover:bg-blue-500 text-white p-2 m-2 rounded absolute right-0 bottom-0 font-bold')('Generate')
    prompt = Div(id='prompt', cls='flex flex-row border-b border-gray-300 relative')(inputs, generate)

    # code editor
    editor = Div(id='editor', cls='w-full grow border-b border-gray-300')
    svgout = Div(id='svgout', cls='w-full grow')
    output = Div(id='output', cls='w-full bg-white border border-gray-300')

    # paned layout
    left = Div(id='left', cls='flex flex-col grow h-full')(prompt, editor, svgout)
    mid = Div(id='mid', cls='w-[8px] bg-gray-200 h-full border-l border-r border-gray-300 cursor-col-resize')
    right = Div(id='right', cls='flex flex-col justify-center items-center grow h-full p-2 bg-gray-100 p-[20px]')(output)
    outer = Div(id='outer', cls='flex flex-row w-screen h-screen')(left, mid, right)

    # outer layout
    title = Title('gum.js')
    script_index = ScriptX('web/index.js')
    script_editor = ScriptX('web/editor.js')
    body = Body()(outer, script_editor, script_index)

    return title, body

@rt('/generate', methods=['POST'])
async def generation(request: Request):
    data = await request.json()
    prompt = data['prompt']
    response = generate.generate_gumjs(prompt)
    return invert_code_blocks(response)

serve(port=5000)