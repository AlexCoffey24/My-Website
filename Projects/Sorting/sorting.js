document.getElementById("new").addEventListener("click", new_icicles);

document.getElementById("solve").addEventListener("click", sort);

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
document.getElementById("bubble").addEventListener("click", change_to_bubble);
function change_to_bubble() {
  document.getElementById("algos").textContent = "Bubble Sort";
  algo = "bubble";
}

document
  .getElementById("insertion")
  .addEventListener("click", change_to_insertion);
function change_to_insertion() {
  document.getElementById("algos").textContent = "Insertion Sort";
  algo = "insertion";
}

document.getElementById("select").addEventListener("click", change_to_select);
function change_to_select() {
  document.getElementById("algos").textContent = "Selection Sort";
  algo = "select";
}

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const canvas_container = document.getElementById("canvas-container");

canvas.height = 1000;
canvas.width = 1210;

var icicles = [];
var icicle_heights;
var icicle_width = 40;
var icicle_gap = 10;
var num_of_icicles = Math.floor(canvas.width / (icicle_gap + icicle_width));
var algo;
var sorting = false;
var is_sorted = false;
var bubble_counter;
var insertion_counter;
var selection_index;

const backgroundGradient = c.createLinearGradient(0, 0, 0, canvas.height);
backgroundGradient.addColorStop(0, "#3700b3");
backgroundGradient.addColorStop(1, "#03dac6");

class Icicle {
  constructor(index, height) {
    this.height = height;
    this.x = index * (icicle_width + icicle_gap) + icicle_gap;
  }

  draw() {
    c.beginPath();
    c.moveTo(this.x, 0);
    c.lineTo(this.x + icicle_width / 2, this.height);
    c.lineTo(this.x + icicle_width, 0);
    c.fillStyle = "rgb(173, 240, 240)";
    c.fill();
    c.closePath();
  }
}

function generate_icicles() {
  is_sorted = false;
  icicles = [];
  icicle_heights = [];
  let icicle_unit_height = Math.floor((canvas.height - 100) / num_of_icicles);
  for (let i = 0; i < num_of_icicles; i++) {
    icicle_heights.push(icicle_unit_height * (i + 1));
  }
  for (let i = 0; i < num_of_icicles; i++) {
    let temp_index = randomIntFromRange(0, icicle_heights.length - 1);
    icicles.push(new Icicle(i, icicle_heights[temp_index]));
  }
}

function update_screen() {
  // Redraw Background
  c.beginPath();
  c.fillStyle = backgroundGradient;
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.closePath();
  // Draw Icicles
  for (let i = 0; i < num_of_icicles; i++) {
    icicles[i].draw();
  }
}

function new_icicles() {
  generate_icicles();
  update_screen();
  sorting = false;
}

function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function sort() {
  if (!sorting) {
    if (algo == "bubble") {
      sorting = true;
      bubble_counter = 0;
      bubble_sort();
    } else if (algo == "insertion") {
      sorting = true;
      insertion_counter = 0;
      insertion_sort();
    } else if (algo == "select") {
      sorting = true;
      selection_index = 0;
      selection_sort();
    } else {
      alert("Please Select an Algorithm");
    }
  }
}

function bubble_sort() {
  if (!is_sorted) {
    is_sorted = true;
    for (i = 0; i < icicles.length - 1 - bubble_counter; i++) {
      if (icicles[i].height > icicles[i + 1].height) {
        swap_icicles_by_index(i, i + 1);
        is_sorted = false;
      }
    }
    update_screen();
    bubble_counter += 1;
    setTimeout(bubble_sort, 250);
  }
}

function insertion_sort() {
  if (insertion_counter < icicles.length) {
    let j = insertion_counter;
    while (j > 0 && icicles[j].height < icicles[j - 1].height) {
      swap_icicles_by_index(j, j - 1);
      j -= 1;
    }
    insertion_counter++;
    update_screen();
    setTimeout(insertion_sort, 250);
  }
}

function selection_sort() {
  if (selection_index < icicles.length - 1) {
    let smallest_index = selection_index;
    for (i = selection_index + 1; i < icicles.length; i++) {
      if (icicles[smallest_index].height > icicles[i].height) {
        smallest_index = i;
      }
    }
    swap_icicles_by_index(selection_index, smallest_index);
    selection_index += 1;
    update_screen();
    setTimeout(selection_sort, 250);
  }
}

function swap_icicles_by_index(i, j) {
  let temp = icicles[i].height;
  icicles[i].height = icicles[j].height;
  icicles[j].height = temp;
}

generate_icicles();
update_screen();
