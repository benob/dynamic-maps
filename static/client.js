const DB = 'vg_100k';
const DB_SIZE = 50802;
const CELL_SIZE = 244;

let cache = {};
let seen = {};

function show_image(element, x, y, num) {
	let img = document.createElement('img');
	img.width = CELL_SIZE;
	img.height = CELL_SIZE;
	img.style.position = 'absolute';
	img.style.left = (CELL_SIZE * x) + 'px';
	img.style.top = (CELL_SIZE * y) + 'px';
	//img.style.pointerEvents = 'none';
	img.style.pointer = 'pointer';
	img.style.userSelect = 'none';
	img.draggable = false;
	img.src = '/image/' + DB + '/' + num;
	element.appendChild(img);
}

function fetch_image(element, neighbor, x, y, depth) {
	function fetch_next(image) {
		fetch_image(element, image, x + 1, y, depth + 1);
		fetch_image(element, image, x - 1, y, depth + 1);
		fetch_image(element, image, x, y + 1, depth + 1);
		fetch_image(element, image, x, y - 1, depth + 1);
	}
	if (depth > 6) return;
	let key = '' + x + ' ' + y;
	if(!(key in cache)) {
		cache[key] = -1;
		const url = '/neighbors/' + DB + '/' + neighbor + '/100';
		fetch(url)
			.then(function(response) {
				return response.json();
			}).then(function(data) {
				for(let i = 0; i < data.length; i++) {
					const image = data[i][1];
					if(!(image in seen)) {
						cache[key] = image;
						seen[image] = 1;
						show_image(element, x, y, image);
						fetch_next(image);
						return;
					}
				}
			}).catch(function(err) {
				console.log('error fetching neighbors', err);
			});
	} else if(cache[key] != -1) {
		fetch_next(cache[key]);
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
	element.style.position = 'fixed';
	grid.update = function(force) {
		if(force || Math.abs(this.vx) > 1e-2 || Math.abs(this.vy) > 1e-2) {
			this.x += this.vx;
			this.y += this.vy;
			this.element.style.left = parseInt(this.x) + 'px';
			this.element.style.top = parseInt(this.y) + 'px';
			this.vx *= .8;
			this.vy *= .8;
			const width = Math.floor(this.element.offsetWidth / CELL_SIZE) + 2;
			const height = Math.floor(this.element.offsetHeight / CELL_SIZE) + 2;
			const x = Math.floor(this.x / CELL_SIZE);
			const y = Math.floor(this.y / CELL_SIZE);

			let i = -x + Math.floor(width / 2) - 1;
			let j = -y + Math.floor(height / 2) - 1;
			let key = '' + i + ' ' + j;
			let num;
			if(!(key in cache)) {
				num = get_image_random(i, j);
				show_image(this.element, i, j, num);
			} else {
				num = cache[key];
			}

			fetch_image(this.element, num, i + 1, j, 0);
			fetch_image(this.element, num, i - 1, j, 0);
			fetch_image(this.element, num, i, j + 1, 0);
			fetch_image(this.element, num, i, j - 1, 0);
		}
		let saved = this;
		window.requestAnimationFrame(function() { saved.update(); });
	};
	grid.update(true);
	return grid;
}

let state = { x: 0, y: 0, grid_x: 0, grid_y: 0, clicked: false };

function mouse_event(event) {
	if(event.button == 2) return;
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

