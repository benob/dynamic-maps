import numpy as np
from annoy import AnnoyIndex
import os
import sys
import collections

class Index:
    def __init__(self, directory):
        print('loading index from "%s"' % directory)
        self.vector_filename = directory + '/vectors.npy'
        self.index_filename = self.vector_filename + '.ann'
        self.images_filename = directory + '/names.txt'
        self.description_filename = directory + '/descriptions.txt'
        self.image_directory = directory + '/images'

        self.vectors = np.load(self.vector_filename, mmap_mode='r')
        dim = self.vectors.shape[1]
        if not os.path.isfile(self.index_filename):
            print('building index')
            index = AnnoyIndex(dim, metric='dot')
            for i in range(self.vectors.shape[0]):
                index.add_item(i, self.vectors[i])
                if i % 1000 == 0:
                    print(i)
            index.build(20)
            index.save(self.index_filename)
        self.index = AnnoyIndex(dim, metric='dot')
        self.index.load(self.index_filename)

        with open(self.images_filename) as fp:
            self.images = [x.strip().split('\t')[0] for x in fp.readlines()]

        self.descriptions = collections.defaultdict(str)
        if os.path.exists(self.description_filename):
            with open(self.description_filename) as fp:
                for i, line in enumerate(fp.readlines()):
                    self.descriptions[i] = line.strip()

    def closest(self, i, n=10):
        return list(map(lambda x: (x[1], x[0]), zip(*self.index.get_nns_by_item(i, n, include_distances=True))))

    def image(self, i):
        if i >= 0 and i < len(self.images):
            return self.image_directory + '/' + self.images[i]
        return None

    def description(self, i):
        return self.descriptions[i]

if __name__ == '__main__':
    index = Index(sys.argv[1])
    print(list(index.closest(0, 10)))


