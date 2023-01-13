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
    expr = lambda z: value_to_expr(z, prec=prec)
    if type(x) is dict:
        vals = ', '.join(f'{expr(k)}: {expr(v)}' for k, v in x.items())
        code = f'{{{vals}}}'
    elif is_iterable(x):
        vals = ', '.join(expr(z) for z in x)
        code = f'[{vals}]'
    else:
        code = expr(x)

    return code

def assign_js(d, prec=prec0):
    return '\n'.join(f'let {k} = {data_to_js(v, prec=prec)};' for k, v in d.items())

def gum(code, vals=None, prec=prec0):
    assign = assign_js(vals, prec=prec) if vals is not None else ''
    return f'{assign}\n{code}'.strip()
