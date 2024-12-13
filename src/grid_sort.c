#include <stdio.h>
#include <stdlib.h>
#include <time.h>

extern void show_colors(float* data, int* indices, int N, int M, int DIM) {
  for(int i = 0; i < N; i++) {
    for(int j = 0; j < M; j++) {
      int index = indices[i * M + j];
      printf("\033[48;2;%d;%d;%dm ", (int) (data[index * DIM] * 255), (int) (data[index * DIM + 1] * 255), (int) (data[index * DIM + 2] * 255));
    }
    printf("\033[0m\n");
  }
  printf("\n");
}

static inline void compute_mean(float* data, int* indices, int N, int M, int DIM, int x, int y, int neighbors, float* mean) {
  double result[DIM];
  for(int k = 0; k < DIM; k++) result[k] = 0;
  int num = 0;
  for(int i = x - neighbors; i < x + neighbors + 1; i++) {
    for(int j = y - neighbors; j < y + neighbors + 1; j++) {
      if(i > 0 && i < N && j > 0 && j < M && !(i == x && j == y)) {
        int index = indices[j + i * M];
        for(int k = 0; k < DIM; k++) result[k] += data[index * DIM + k];
        num++;
      }
    }
  }
  for(int k = 0; k < DIM; k++) mean[k] = (float) (result[k] / num);
}

static double squared_euclidian(float* a, float* b, int DIM) {
  double result = 0;
  for(int k = 0; k < DIM; k++) {
    float diff = a[k] - b[k];
    result += diff * diff;
  }
  return result;
}


static unsigned long int next = 1;

static inline int generator_rand() {
    next = next * 1103515245 + 12345;
    return (unsigned int)(next >> 16) % RAND_MAX;
}

extern void generator_seed(int seed) {
    next = (unsigned long) seed;
}

// data is float array of size [N * M][DIM], indices is int array of size [N][M]
extern void sort(float* data, int* indices, int* fixed, int N, int M, int DIM, int initial_neighbors, int num_moves) {
  for(int i = 0; i < num_moves; i++) {
    int neighbors = initial_neighbors - i * initial_neighbors / num_moves;
    int p1_x = generator_rand() % N, p1_y = generator_rand() % M;
    int p2_x = generator_rand() % N, p2_y = generator_rand() % M;

    if(p1_x == p2_x && p1_y == p2_y) continue;
    if(fixed != NULL && (fixed[p1_x * M + p1_y] == 1 || fixed[p2_x * M + p2_y] == 1)) {
      continue;
    }

    float mean1[DIM];
    compute_mean(data, indices, N, M, DIM, p1_x, p1_y, neighbors, mean1);

    float mean2[DIM];
    compute_mean(data, indices, N, M, DIM, p2_x, p2_y, neighbors, mean2);

    float* p1 = data + indices[p1_x * M + p1_y] * DIM;
    float* p2 = data + indices[p2_x * M + p2_y] * DIM;

    double d1 = squared_euclidian(mean1, p1, DIM) + squared_euclidian(mean2, p2, DIM);
    double d2 = squared_euclidian(mean1, p2, DIM) + squared_euclidian(mean2, p1, DIM);

    if(d2 < d1) {
      int tmp = indices[p1_x * M + p1_y];
      indices[p1_x * M + p1_y] = indices[p2_x * M + p2_y];
      indices[p2_x * M + p2_y] = tmp;
    }
  }
}

