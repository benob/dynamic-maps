import numpy as np

from ctypes import *
_grid_sort = cdll.LoadLibrary("libgrid_sort.so") 

# void show_colors(float* data, int* indices, int N, int M, int DIM)
_grid_sort.show_colors.argtypes = [POINTER(c_float), POINTER(c_int), c_int, c_int, c_int]
_grid_sort.show_colors.restype = None

# void sort(float* data, int* indices, int* fixed, int N, int M, int DIM, int initial_neighbors, int num_moves)
_grid_sort.sort.argtypes = [POINTER(c_float), POINTER(c_int), POINTER(c_int), c_int, c_int, c_int, c_int, c_int]
_grid_sort.sort.restype = None

# void generator_seed(unsigned int seed)
_grid_sort.generator_seed.argtypes = [c_int]
_grid_sort.generator_seed.restype = None

def seed(value):
    _grid_sort.generator_seed(value)

def sort(vectors, N, M, indices=None, fixed=None, neighbors=3, steps=50000):
    DIM = vectors.shape[1]

    vectors = vectors.astype(np.float32)
    c_vectors = vectors.ctypes.data_as(POINTER(c_float))

    if indices is None:
        indices = np.arange(N * M).reshape(N, M).astype(np.int32)
    else:
        indices = indices.astype(np.int32)
    c_indices = indices.ctypes.data_as(POINTER(c_int))

    if fixed is not None:
        fixed = fixed.astype(np.int32)
        c_fixed = fixed.ctypes.data_as(POINTER(c_int))
    else:
        c_fixed = None

    _grid_sort.sort(c_vectors, c_indices, c_fixed, N, M, DIM, neighbors, steps)

    return indices

def show(vectors, indices):
    N, M = indices.shape
    assert(vectors.shape[0] == N * M)
    DIM = vectors.shape[1]

    vectors = vectors.astype(np.float32)
    indices = indices.astype(np.int32)

    c_vectors = vectors.ctypes.data_as(POINTER(c_float))
    c_indices = indices.ctypes.data_as(POINTER(c_int))

    _grid_sort.show_colors(c_vectors, c_indices, N, M, DIM)

if __name__ == '__main__':
    vectors = np.random.rand(100, 3)

    indices = np.arange(len(vectors)).reshape(10, 10)
    fixed = np.zeros((10, 10), dtype=np.int32)

    indices[4: 6, 4: 6] = 0
    fixed[4: 6, 4: 6] = 1

    show(vectors, indices)
    indices = sort(vectors, 10, 10, indices, fixed)
    show(vectors, indices)

    print(indices)
