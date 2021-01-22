const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
var canvas_container = document.getElementById("canvas-container");

var grid;
var grid_color = "rgb(0, 0, 0)";
var cell_size = 25;
var cell_gap = 2;
// var num_of_rows = Math.floor(
//   canvas_container.offsetHeight / (cell_size + cell_gap)
// );
var num_of_cols = Math.floor(
  canvas_container.offsetWidth / (cell_size + cell_gap) - 1
);
var num_of_rows = num_of_cols;
var mouse_x;
var mouse_y;
var cell_changer = "barrier";
var drawing = false;
var start_set = false;
var end_set = false;
var starting_cell;
var ending_cell;
var solving = false;
var algo;

canvas.height = num_of_rows * (cell_size + cell_gap) - cell_gap;
canvas.width = num_of_cols * (cell_size + cell_gap) - cell_gap;

// Drawing event listeners
canvas.addEventListener("mousedown", (m) => {
  drawing = true;
});

canvas.addEventListener("mousemove", (m) => {
  if (drawing === true) {
    mouse_x = m.offsetX;
    mouse_y = m.offsetY;
    change_cell(mouse_x, mouse_y);
  }
});

canvas.addEventListener("mouseup", (m) => {
  drawing = false;
});

canvas.addEventListener("click", (m) => {
  mouse_x = m.offsetX;
  mouse_y = m.offsetY;
  change_cell(mouse_x, mouse_y);
});

// Misc. Buttons
document.getElementById("start").addEventListener("click", () => {
  cell_changer = "start";
});

document.getElementById("end").addEventListener("click", () => {
  cell_changer = "end";
});

document.getElementById("barrier").addEventListener("click", () => {
  cell_changer = "barrier";
});

document
  .getElementById("random-barriers")
  .addEventListener("click", throw_barriers);

function throw_barriers() {
  for (i = 0; i < num_of_rows; i++) {
    for (j = 0; j < num_of_cols; j++) {
      let current = grid[i][j];
      if (current.is_empty()) {
        if (Math.random() > 0.7) {
          current.make_barrier();
          current.draw();
        }
      }
    }
  }
}

document.getElementById("reset_cell").addEventListener("click", () => {
  cell_changer = "reset";
});

document.getElementById("solve").addEventListener("click", algorithm);

document.getElementById("clear").addEventListener("click", clear_grid);

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
document.getElementById("algos").addEventListener("click", show_algos);

function show_algos() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

// Dropdown Buttons
document.getElementById("A*").addEventListener("click", change_to_AStar);
function change_to_AStar() {
  document.getElementById("algos").textContent = "A*";
  algo = "A*";
}

document.getElementById("BFS").addEventListener("click", change_to_BFS);
function change_to_BFS() {
  document.getElementById("algos").textContent = "Breadth First Search";
  algo = "BFS";
}

document
  .getElementById("Dijkstra")
  .addEventListener("click", change_to_Dijkstra);
function change_to_Dijkstra() {
  document.getElementById("algos").textContent = "Dijkstra's";
  algo = "Dijkstra";
}

class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.x = col * (cell_size + cell_gap);
    this.y = row * (cell_size + cell_gap);
    this.color = "white";
    this.neighbors = [];
    this.width = cell_size;
    this.height = cell_size;
    this.f = Infinity;
    this.g = Infinity;
    this.h = Infinity;
    this.previous = undefined;
    this.discovered = false;
  }

  get_pos() {
    return this.row, this.col;
  }

  was_visited() {
    return this.color == "red";
  }

  is_open() {
    return this.color == "green";
  }

  is_barrier() {
    return this.color == "black";
  }

  is_start() {
    return this.color == "orange";
  }

  is_end() {
    return this.color == "blue";
  }

  is_empty() {
    return this.color == "white";
  }

  reset() {
    this.color = "white";
  }

  make_start() {
    this.color = "orange";
  }

  make_visited() {
    this.color = "red";
  }

  make_open() {
    this.color = "green";
  }

  make_barrier() {
    this.color = "black";
  }

  make_end() {
    this.color = "blue";
  }

  make_path() {
    this.color = "purple";
  }

  update_neighbors() {
    this.neighbors = [];
    // Check Up
    if (this.row > 0 && !grid[this.row - 1][this.col].is_barrier()) {
      this.neighbors.push(grid[this.row - 1][this.col]);
    }
    // Check Right
    if (
      this.col < num_of_cols - 1 &&
      !grid[this.row][this.col + 1].is_barrier()
    ) {
      this.neighbors.push(grid[this.row][this.col + 1]);
    }
    // Check Down
    if (
      this.row < num_of_rows - 1 &&
      !grid[this.row + 1][this.col].is_barrier()
    ) {
      this.neighbors.push(grid[this.row + 1][this.col]);
    }
    // Check Left
    if (this.col > 0 && !grid[this.row][this.col - 1].is_barrier()) {
      this.neighbors.push(grid[this.row][this.col - 1]);
    }
  }

  draw() {
    c.beginPath();
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width, this.height);
    c.closePath;
  }

  update_h() {
    this.h =
      Math.abs(this.col - ending_cell.col) +
      Math.abs(this.row - ending_cell.row);
  }

  update_f() {
    this.f = this.g + this.h;
  }
}

function make_grid() {
  grid = [];
  for (i = 0; i < num_of_rows; i++) {
    grid.push([]);
    for (j = 0; j < num_of_cols; j++) {
      let cell = new Cell(i, j);
      grid[i].push(cell);
    }
  }
}

function draw_grid() {
  for (i = 0; i < num_of_rows; i++) {
    for (j = 0; j < num_of_cols; j++) {
      let cell = grid[i][j];
      cell.draw();
    }
  }
}

function change_cell(x, y) {
  if (!solving) {
    row = Math.floor(y / (cell_size + cell_gap));
    col = Math.floor(x / (cell_size + cell_gap));
    if (cell_changer == "reset") {
      if (grid[row][col].is_start()) {
        start_set = false;
        starting_cell = null;
      } else if (grid[row][col].is_end()) {
        end_set = false;
        ending_cell = null;
      }
      grid[row][col].reset();
    } else if (cell_changer == "barrier") {
      if (grid[row][col].is_start()) {
        start_set = false;
        starting_cell = null;
      } else if (grid[row][col].is_end()) {
        end_set = false;
        ending_cell = null;
      }
      grid[row][col].make_barrier();
    } else if (cell_changer == "start") {
      if (!start_set) {
        grid[row][col].make_start();
        starting_cell = grid[row][col];
        start_set = true;
      }
    } else if (cell_changer == "end") {
      if (!end_set) {
        grid[row][col].make_end();
        ending_cell = grid[row][col];
        end_set = true;
      }
    }
  }

  draw_grid();
}

function clear_grid() {
  if (!solving) {
    make_grid();
    draw_grid();
    start_set = false;
    end_set = false;
    starting_cell = null;
    solving = false;
    cell_changer = "barrier";
  }
}

c.fillStyle = "black";
c.fillRect(0, 0, canvas.width, canvas.height);
make_grid();
draw_grid();

// A* algorithm

var open_set;
function algorithm() {
  // Update all cell neighbors
  for (i = 0; i < num_of_rows; i++) {
    for (j = 0; j < num_of_cols; j++) {
      let cell = grid[i][j];
      cell.update_neighbors();
    }
  }

  if (algo == "A*") {
    solving = true;
    open_set = [];
    open_set.push(starting_cell);
    starting_cell.g = 0;
    starting_cell.update_h();
    starting_cell.update_f();

    a_star();
  } else if (algo == "BFS") {
    solving = true;
    open_set = [];
    open_set.push(starting_cell);
    bfs();
  } else if (algo == "Dijkstra") {
    solving = true;
    solving = true;
    open_set = [];
    open_set.push(starting_cell);
    dijkstra();
  } else {
    console.error("no algo selected");
  }
}

function a_star() {
  if (open_set.length > 0) {
    let open_set_index = 0;
    for (let i = 0; i < open_set.length; i++) {
      if (open_set[i].f < open_set[open_set_index].f) {
        open_set_index = i;
      }
    }
    let current = open_set[open_set_index];

    if (current === ending_cell) {
      solving = false;
      return reconstruct_path(ending_cell);
    }

    remove_from_array(open_set, current);

    for (let i = 0; i < current.neighbors.length; i++) {
      let neighbor = current.neighbors[i];
      let temp_g = current.g + 1;

      if (temp_g < neighbor.g) {
        neighbor.previous = current;
        neighbor.g = temp_g;
        neighbor.update_h();
        neighbor.update_f();
        if (!open_set.includes(neighbor)) {
          open_set.push(neighbor);
          neighbor.make_open();
          neighbor.draw();
        }
      }
    }

    if (current != starting_cell) {
      current.make_visited();
      current.draw();
    }

    setTimeout(() => {
      a_star();
    }, 50);
  } else {
    console.log("no path available");
    solving = false;
  }
}

function remove_from_array(array, element) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (array[i] == element) {
      array.splice(i, 1);
    }
  }
}

function bfs() {
  if (open_set.length > 0) {
    let current = open_set.shift();
    current.make_visited();
    current.draw();
    for (i = 0; i < current.neighbors.length; i++) {
      let neighbor = current.neighbors[i];
      if (!neighbor.was_visited()) {
        neighbor.previous = current;
        if (neighbor == ending_cell) {
          solving = false;
          return reconstruct_path(ending_cell);
        }
        neighbor.make_open();
        neighbor.draw();

        let temp_set = new Set(open_set);
        temp_set.add(neighbor);
        open_set = [...temp_set];
      }
    }

    setTimeout(() => {
      bfs();
    }, 50);
  } else {
    console.log("no path available");
    solving = false;
  }
}

function dijkstra() {
  if (open_set.length > 0) {
    let current = open_set.shift();
    current.make_visited();
    current.draw();
    for (i = 0; i < current.neighbors.length; i++) {
      let neighbor = current.neighbors[i];
      if (!neighbor.was_visited()) {
        neighbor.previous = current;
        if (neighbor == ending_cell) {
          solving = false;
          return reconstruct_path(ending_cell);
        }
        neighbor.make_open();
        neighbor.draw();

        let temp_set = new Set(open_set);
        temp_set.add(neighbor);
        open_set = [...temp_set];
      }
    }

    setTimeout(() => {
      dijkstra();
    }, 50);
  } else {
    console.log("no path available");
    solving = false;
  }
}

function reconstruct_path(temp) {
  if (temp.previous) {
    temp.make_path();
    temp.draw();

    setTimeout(() => {
      reconstruct_path(temp.previous);
    }, 50);
  }
  ending_cell.make_end();
  ending_cell.draw();
  starting_cell.make_start();
  starting_cell.draw();
}
