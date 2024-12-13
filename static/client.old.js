const DB = 'vg_100k';
const DB_SIZE = 50802;
const CELL_SIZE = 244;

let cache = {};
let seen = {};

function find_closest_in_cache(x, y, radius) {
	let argmin = null, min = 0;
	for(let i = x - radius; i <= x + radius; i++) {
		for(let j = y - radius; j <= y + radius; j++) {
			let key = '' + i + ' ' + j;
			if(key in cache) {
				let distance = (x - i) * (x - i) + (y - j) * (y - j);
				if(argmin === null || distance < min) {
					argmin = cache[key];
					min = distance;
				}
			}
		}
	}
	return argmin;
}

const DELTA = [1, 0, -1, 0];
class Fetcher {
	constructor(element, x, y) {
		this.x = x;
		this.y = y;
		this.line = 1;
		this.remaining = 0;
		this.step = 0;
		this.iteration = 0;
		this.element = element;
	}

	next() {
		if(this.iteration > 62) return;
		this.x += DELTA[this.step % DELTA.length];
		this.y += DELTA[(this.step + 1) % DELTA.length];
		if(this.remaining == 0) {
			this.remaining = this.line;
			if(this.step % 2 == 0) this.line ++;
			this.step ++;
		}
		this.remaining--;
		this.load_image();
		this.iteration += 1;
	}

	show_image(num) {
		let img = document.createElement('img');
		img.width = CELL_SIZE;
		img.height = CELL_SIZE;
		img.style.position = 'absolute';
		img.style.left = (CELL_SIZE * this.x) + 'px';
		img.style.top = (CELL_SIZE * this.y) + 'px';
		//img.style.pointerEvents = 'none';
		img.style.pointer = 'pointer';
		img.style.userSelect = 'none';
		img.draggable = false;
		img.src = '/image/' + DB + '/' + num;
		this.element.appendChild(img);
	}

	load_image() {
		let saved_this = this;
		const key = '' + this.x + ' ' + this.y;
		if(key in cache) {
			this.show_image(cache[key]);
			this.next();
		} else {
			let neighbor = find_closest_in_cache(this.x, this.y, 5);
			if(neighbor !== null) {
				const url = '/neighbors/' + DB + '/' + neighbor + '/20';
				fetch(url)
					.then(function(response) {
						return response.json();
					}).then(function(data) {
						for(let i = 0; i < data.length; i++) {
							const image = data[i][1];
							console.log(neighbor, data[i]);
							if(!(image in seen)) {
								const key = '' + saved_this.x + ' ' + saved_this.y;
								cache[key] = image;
								seen[image] = 1;
								saved_this.show_image(image);
								console.log(key, image, data[i][0]);
								break;
							}
						}
						saved_this.next();
					}).catch(function(err) {
						console.log('error fetching neighbors', err);
						this.next();
					});
			}
		}
	}
}

function get_image_random(x, y) {
	const key = '' + x + ' ' + y;
	if(!(key in cache)) {
		cache[key] = Math.floor(Math.random() * DB_SIZE);
		seen[cache[key]] = 1;
	}
	return cache[key];
}

/*function load_image(img, x, y) {
	let num = get_image(x, y);
	img.src = '/image/' + DB + '/' + num;
  img.onclick = function() {
    document.location = '/original/' + DB + '/' + num;
    console.log('click');
  }
}*/

function Grid(element) {
	element.style.overflow = 'hidden';
	element.style.backgroundColor = 'black'
	element.addEventListener('contextmenu', event => event.preventDefault());
	let grid = {
		element: element,
		x: 0, 
		y: 0,
		vx: 0,
		vy: 0,
	};
	grid.move = function(x, y) {
		this.vx = x - this.x;
		this.vy = y - this.y;
	};
	grid.update = function(force) {
		if(force || Math.abs(this.vx) > 1e-2 || Math.abs(this.vy) > 1e-2) {
      //console.log(this.vx, this.vy);
			this.x += this.vx;
			this.y += this.vy;
			this.vx *= .8;
			this.vy *= .8;
			const width = Math.floor(this.element.offsetWidth / CELL_SIZE) + 2;
			const height = Math.floor(this.element.offsetHeight / CELL_SIZE) + 2;
			const x = Math.floor(this.x / CELL_SIZE);
			const y = Math.floor(this.y / CELL_SIZE);
			let mod_x = this.x % CELL_SIZE;
			let mod_y = this.y % CELL_SIZE;
			if(mod_x < 0) mod_x += CELL_SIZE;
			if(mod_y < 0) mod_y += CELL_SIZE;
			this.element.innerHTML = '';
			/*for(let j = 0; j < height; j++) {
				for(let i = 0; i < width; i++) {
					let img = document.createElement('img');
					img.width = CELL_SIZE;
					img.height = CELL_SIZE;
					img.style.position = 'absolute';
					img.style.left = (mod_x - CELL_SIZE + CELL_SIZE * i) + 'px';
					img.style.top = (mod_y - CELL_SIZE + CELL_SIZE * j) + 'px';
          //img.style.pointerEvents = 'none';
          img.style.pointer = 'pointer';
          img.style.userSelect = 'none';
          img.draggable = false;
					this.element.appendChild(img);
					load_image(img, i - x, j - y);
				}
			}*/
			let i = x + Math.floor(width / 2);
			let j = y + Math.floor(height / 2);
			get_image_random(i, j);
			fetcher = new Fetcher(this.element, i, j);
			fetcher.next();
		}
		let saved = this;
		window.requestAnimationFrame(function() { saved.update(); });
	};
	grid.update(true);
	return grid;
}

let state = { x: 0, y: 0, grid_x: 0, grid_y: 0, clicked: false };

function mouse_event(event) {
  function start(x, y) {
		state.x = x;
		state.y = y;
		state.grid_x = grid.x;
		state.grid_y = grid.y;
  }
  function move(x, y) {
		let dx = x - state.x;
		let dy = y - state.y;
		grid.move(state.grid_x + dx, state.grid_y + dy);
  }
  function end() {
  }
	if(event.type == 'mousedown') {
    state.clicked = true;
    start(event.clientX, event.clientY);
		event.stopPropagation();
	} else if(event.type == 'mouseup') {
    end();
    state.clicked = false;
    if(Math.abs(event.clientX - state.x) < 10 && Math.abs(event.clientY - state.y) > 10) {
      event.stopPropagation();
    }
	} else if(event.type == 'mousemove' && state.clicked) {
    move(event.clientX, event.clientY);
		event.stopPropagation();
  } else if(event.type == 'touchstart') {
    console.log(event.changedTouches);
    let finger = event.changedTouches[0];
    start(finger.clientX, finger.clientY);
    /*event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();*/
    ///return false;
  } else if(event.type == 'touchend') {
    console.log('end', event.changedTouches);
    let finger = event.changedTouches[0];
    stop();
    if(Math.abs(finger.clientX - state.x) < 10 && Math.abs(finger.clientY - state.y) > 10) {
      /*event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();*/
      ///return false;
    }
  } else if(event.type == 'touchmove') {
    console.log('move', event.changedTouches);
    let finger = event.changedTouches[0];
    move(finger.clientX, finger.clientY);
    /*event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();*/
    ///return false;
  } else if(event.type == 'touchcancel') {
    console.log('cancel', event.changedTouches);
    end();
    /*event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();*/
    ///return false;
  }
}

document.addEventListener("DOMContentLoaded", function(event) { 
	grid = Grid(document.body);
	window.addEventListener('mousedown', mouse_event);
	window.addEventListener('mouseup', mouse_event);
	window.addEventListener('mousemove', mouse_event);
  window.addEventListener("touchstart", mouse_event, true);
  window.addEventListener("touchend", mouse_event, true);
  window.addEventListener("touchcancel", mouse_event, true);
  window.addEventListener("touchmove", mouse_event, true);
});

