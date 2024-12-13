CFLAGS+=-Wall -Ofast -mtune=native -march=native -funroll-loops  -ftree-vectorize #-fopt-info-vec-missed

libgrid_sort.so: grid_sort.c
	$(CC) -shared -fPIC -Wl,-soname,$@ -o $@ $^ $(LDFLAGS) $(CFLAGS)

clean:
	rm -f libgrid_sort.so 
