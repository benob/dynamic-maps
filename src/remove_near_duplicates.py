import numpy as np
from annoy import AnnoyIndex
import os
import sys

index_filename = sys.argv[1]
vector_filename = sys.argv[2]
image_filename = sys.argv[3]

with open(image_filename) as fp:
    images = [x.strip() for x in fp.readlines()]

vectors = np.load(vector_filename, mmap_mode='r')
dim = vectors.shape[1]

index = AnnoyIndex(dim, metric='dot')
index.load(index_filename)

n = 10
threshold = 0.95


for target in range(len(vectors)):
    indices, scores = index.get_nns_by_item(target, n, include_distances=True)
    for i, score in zip(indices, scores):
        if i != target and score > threshold:
            print(images[target], images[i], score)


