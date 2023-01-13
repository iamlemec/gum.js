# gum.js python interface

import numpy as np

# defaults
prec0 = 4

def is_iterable(x):
    return hasattr(x, '__iter__') and not np.issubdtype(type(x), np.str_)

def value_to_expr(x, prec=prec0):
    t = type(x)
    if np.issubdtype(t, np.floating):
        fmt = f'%.{prec}g'
        return fmt % x
    elif np.issubdtype(t, np.str_):
        return f'\'{x}\''
    else:
        return str(x)

def data_to_js(x, prec=prec0):
    if type(x) is dict:
        vals = ', '.join(f'{value_to_expr(k)}: {value_to_expr(v)}' for k, v in x.items())
        code = f'{{{vals}}}'
    elif is_iterable(x):
        vals = ', '.join(value_to_expr(z) for z in x)
        code = f'[{vals}]'
    else:
        code = value_to_expr(x)

    return code

def assign_js(d):
    return '\n'.join(f'let {k} = {data_to_js(v)};' for k, v in d.items())

def gum(code, vals=None):
    assign = assign_js(vals) if vals is not None else ''
    return f'{assign}\n{code}'.strip()
