# Networks

Network diagrams can be created using the `Node` and `Edge` classes.

There is no overarching `Network` class. One will usually wrap elements in a `Group` or `Graph` object to create a final product. In this case, one can pass in a `coord` argument to specify the coordinate system to use. The `coord` argument is a 4-element array specifying the position of the bottom left corner and the width and height of the coordinate system. For example, `coord: [0, 0, 1, 1]` specifies the unit square. This may help with positioning elements, especially for non-square coordinate systems.
