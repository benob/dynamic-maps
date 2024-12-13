
#vectors = np.load(sys.argv[1])
#def normalize(v):
#    norm = np.linalg.norm(v, ord=2, axis=1)
#    np.place(norm, norm==0, 1)
#    v /= norm[:,None]
#def closest(vectors, image, n=10):
#    v = vectors[image]
#    scores = np.dot(vectors, v.T)
#    best = np.max(scores)
#    if n > len(vectors):
#        n = len(vectors)
#    indices = np.argpartition(scores, -n)[-n:]
#    indices = indices[np.argsort(scores[indices])]
#    output = []
#    for i in [int(x) for x in indices]:
#        output.append((scores[i], i))
#    return reversed(output)
#def diverse(vectors, image, n=10):
#    import math
#    v = vectors[image]
#    scores = np.dot(vectors, v.T)
#    best = sorted(range(len(scores)), key=lambda k: -scores[k])
#    output = []
#    j = 0
#    #for i in [int(-49 + (100 / math.log10(x))) for x in range(n, 1,-1)]:
#    for i in [int(math.exp(x/13)) for x in range(n)]:
#        print(i, j, len(scores))
#        output.append((scores[best[j]], best[j]))
#        j += i
#    return output
#def mmr(vectors, image, n=10, redundancy=.95):
#    v = vectors[image]
#    scores = np.dot(vectors, v.T)
#    best = sorted(range(len(scores)), key=lambda k: -scores[k])
#    selected = np.zeros((n, vectors.shape[1]))
#    selected[0] = v
#    selected_ids = [image]
#    j = 0
#    for i in range(1, n):
#        value = 1
#        while j < len(best) - 1 and value > redundancy:
#            j += 1
#            v = vectors[best[j]]
#            value = max(np.dot(selected, v.T))
#            #print(i, j, value)
#        if j == len(best) - 1:
#            break
#        selected[i] = v
#        selected_ids.append(best[j])
#    return [(scores[i], i) for i in selected_ids]

#from cachetools import cached, TTLCache  # 1 - let's import the "cached" decorator and the "TTLCache" object from cachetools
#cache = TTLCache(maxsize=1000, ttl=300)
#@cached(cache)
