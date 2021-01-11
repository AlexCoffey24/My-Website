//  Nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav__link");

navToggle.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
  });
});

// The game:

const easy = [
  "78-43-12-6---75--9---6-1-78--7-4-26---1-5-93-9-4-6---5-7-3---1212---74---492-6--7",
  "785439126612875349493621578857943261261758934934162785578394612126587493349216857",
];

const medium = [
  "--9-------4----6-758-31----15--4-36-------4-8----9-------75----3-------1--2--3--",
  "619472583243985617587316924158247369926531478734698152891754236365829741472163895",
];
const hard = [
  "-1-5-------97-42----5----7-5---3---7-6--2-41---8--5---1-4------2-3-----9-7----8--",
  "712583694639714258845269173521436987367928415498175326184697532253841769976352841",
];

// Variables
var timer;
var timeRemaining;
var selectedNum;
var selectedTile;
var disableSelect;
var solution;
var delay;
var solving = false;

window.onload = function () {
  id("start-btn").addEventListener("click", startGame);
  id("ai-toggle").addEventListener("click", backtracking_button);
  id("check-solution").addEventListener("click", checkSolution);
  for (let i = 0; i < id("number-container").children.length; i++) {
    id("number-container").children[i].addEventListener(
      "click",
      addNumSelector
    );
  }
};

function startGame() {
  solving = false;
  if (id("diff-easy").checked) {
    board = easy[0];
    solution = easy[1];
  } else if (id("diff-med").checked) {
    board = medium[0];
    solution = medium[1];
  } else if (id("diff-hard").checked) {
    board = hard[0];
    solution = hard[1];
  }
  disableSelect = false;

  generateBoard(board);
  startTimer();
  id("number-container").classList.remove("hidden");
}

function generateBoard(board) {
  clearBoard();
  let idCount = 0;
  for (let i = 0; i < 81; i++) {
    let tile = document.createElement("p");

    tile.id = idCount;
    idCount++;

    tile.classList.add("tile");

    if (board.charAt(i) != "-") {
      tile.textContent = board.charAt(i);
      tile.classList.add("original-number");
    } else {
      tile.addEventListener("click", function () {
        if (!disableSelect) {
          if (tile.classList.contains("selected")) {
            tile.classList.remove("selected");
            selectedTile = null;
          } else {
            for (let i = 0; i < 81; i++) {
              qsa(".tile")[i].classList.remove("selected");
            }
            tile.classList.add("selected");
            selectedTile = tile;
            updateMove();
          }
        }
      });
    }
    if (tile.id == 0) {
      tile.classList.add("top-left");
    }
    if (tile.id == 8) {
      tile.classList.add("top-right");
    }
    if (tile.id == 72) {
      tile.classList.add("bottom-left");
    }
    if (tile.id == 80) {
      tile.classList.add("bottom-right");
    }

    if (tile.id < 9) {
      tile.classList.add("topBorder");
    }

    if (
      (tile.id > 17 && tile.id < 27) ||
      (tile.id > 44 && tile.id < 54) ||
      tile.id > 71
    ) {
      tile.classList.add("bottomBorder");
    }

    if (
      (tile.id + 1) % 9 == 3 ||
      (tile.id + 1) % 9 == 6 ||
      (tile.id + 1) % 9 == 0
    ) {
      tile.classList.add("rightBorder");
    }

    if ((tile.id + 1) % 9 == 1) {
      tile.classList.add("leftBorder");
    }

    id("board").appendChild(tile);
  }
}

function id(id) {
  return document.getElementById(id);
}

function qsa(selector) {
  return document.querySelectorAll(selector);
}

function clearBoard() {
  let tiles = qsa(".tile");
  for (let i = 0; i < tiles.length; i++) {
    tiles[i].remove();
  }
  if (timer) clearTimeout(timer);
  for (let i = 0; i < id("number-container").children.length; i++) {
    id("number-container").children[i].classList.remove("selected");
  }
  selectedTile = null;
  selectedNum = null;
}

function startTimer() {
  if (id("time-1").checked) timeRemaining = 180;
  else if (id("time-2").checked) timeRemaining = 300;
  else timeRemaining = 600;
  id("timer").textContent = timeConversion(timeRemaining);
  timer = setInterval(function () {
    id("timer").textContent = timeConversion(timeRemaining);
    timeRemaining--;
    if (timeRemaining === 0) checkSolution();
  }, 1000);
}

function timeConversion(time) {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  if (seconds < 10) seconds = "0" + seconds;
  return minutes + ":" + seconds;
}

function addNumSelector() {
  if (!disableSelect) {
    if (this.classList.contains("selected")) {
      this.classList.remove("selected");
      selectedNum = null;
    } else {
      for (let i = 0; i < 9; i++) {
        id("number-container").children[i].classList.remove("selected");
      }
      this.classList.add("selected");
      selectedNum = this;
      updateMove();
    }
  }
}

function updateMove() {
  if (selectedTile && selectedNum && validMove()) {
    selectedTile.textContent = selectedNum.textContent;
    selectedTile.classList.remove("selected");
    selectedNum.classList.remove("selected");
    selectedNum = null;
    selectedTile = null;
  }
}

function validMove() {
  let tiles = qsa(".tile");
  let selectedCol = getTileCol(selectedTile);
  let selectedRow = getTileRow(selectedTile);
  if (!selectedNum.textContent) {
    return true;
  }
  for (let i = 0; i < 81; i++) {
    if (selectedCol == getTileCol(tiles[i])) {
      if (selectedNum.textContent == tiles[i].textContent) {
        incorrectMove(tiles[i]);
        return false;
      }
    }
    //   Check Row
    if (selectedRow == getTileRow(tiles[i])) {
      if (selectedNum.textContent == tiles[i].textContent) {
        incorrectMove(tiles[i]);
        return false;
      }
    }
    //   Check Cube
    if (
      getTileCubeX(selectedTile) == getTileCubeX(tiles[i]) &&
      getTileCubeY(selectedTile) == getTileCubeY(tiles[i])
    ) {
      if (selectedNum.textContent == tiles[i].textContent) {
        incorrectMove(tiles[i]);
        return false;
      }
    }
  }
  return true;
}

function getTileCol(tile) {
  return tile.id % 9;
}

function getTileRow(tile) {
  return Math.floor(tile.id / 9);
}

function getTileCubeX(tile) {
  return Math.floor((tile.id % 9) / 3);
}

function getTileCubeY(tile) {
  return Math.floor(Math.floor(tile.id / 9) / 3);
}

function incorrectMove(tile) {
  selectedTile.classList.remove("selected");
  selectedNum.classList.remove("selected");
  selectedTile.classList.add("incorrect");
  tile.classList.add("incorrect");
  disableSelect = true;
  setTimeout(function () {
    selectedTile.classList.remove("incorrect");
    tile.classList.remove("incorrect");
    selectedTile = null;
    selectedNum = null;
    disableSelect = false;
  }, 500);
}

function checkSolution() {
  clearTimeout(timer);
  disableSelect = true;
  let tiles = qsa(".tile");
  let answer = "";
  for (let i = 0; i < 81; i++) {
    answer = answer + tiles[i].textContent;
  }
  if (answer == solution) {
    id("timer").textContent = "You Win!";
  } else {
    id("timer").textContent = "You Lose";
  }
}

// The algorithm
async function backtracking() {
  let tiles = qsa(".tile");
  let currentTile;
  let currentNum;
  for (let i = 0; i < 81; i++) {
    if (tiles[i].textContent == "") {
      currentTile = tiles[i];
      currentTile.classList.add("green-border");
      currentTile.classList.remove("red-border");
      break;
    } else if (i + 1 == 81) {
      return true;
    }
  }
  for (let j = 1; j < 10; j++) {
    currentNum = id("number-container").children[j];
    currentTile.textContent = j;
    if (validMoveBacktracking(currentTile, currentNum, tiles)) {
      if (await sleep(backtracking)) {
        return true;
      }
    }
  }
  currentTile.textContent = null;
  currentTile.classList.remove("green-border");
  currentTile.classList.add("red-border");
  return false;
}

function backtracking_button() {
  if (!solving) {
    backtracking();
    solving = true;
    disableSelect = true;
  }
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function sleep(fn) {
  await timeout(50);
  return fn();
}

function validMoveBacktracking(tile, num, tiles) {
  let selectedCol = getTileCol(tile);
  let selectedRow = getTileRow(tile);
  for (let i = 0; i < 81; i++) {
    // Check Col
    if (selectedCol == getTileCol(tiles[i])) {
      if (tile == tiles[i]) {
      } else if (num.textContent == tiles[i].textContent) {
        return false;
      }
    }
    // Check Row
    if (selectedRow == getTileRow(tiles[i])) {
      if (tile == tiles[i]) {
      } else if (num.textContent == tiles[i].textContent) {
        return false;
      }
    }
    // Check 3x3 Cube
    if (
      getTileCubeX(tile) == getTileCubeX(tiles[i]) &&
      getTileCubeY(tile) == getTileCubeY(tiles[i])
    ) {
      if (tile == tiles[i]) {
      } else if (num.textContent == tiles[i].textContent) {
        return false;
      }
    }
  }
  return true;
}
