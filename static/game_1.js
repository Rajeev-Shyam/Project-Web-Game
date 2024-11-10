let canvas;
let context;

const canvasWidth = 600;
const canvasHeight = 600;

let fpsInterval = 1000 / 10; 
let now;
let then = Date.now();

const gridSize = 30;
const numCols = Math.floor(canvasWidth / gridSize);
const numRows = Math.floor(canvasHeight / gridSize);

let player = {
    x: Math.floor(numCols / 2),
    y: Math.floor(numRows / 2),
    speed: 1
};

let floorSpeed = 1; 
let floorSpeedIncrement = 0.1; 
let floorOffset = 0; 

let walls = [];
let obstacles = [];
let coins = [];
let collectedCoins = [];
let score = 0;

let animationId;

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    window.addEventListener("keydown", movePlayer, false);

    createMaze();
    createObstacles();
    createCoins();

    draw();
}

function createMaze() {

    for (let i = 0; i < numCols; i++) {
        walls.push({ x: i, y: 0 });
        walls.push({ x: i, y: numRows - 1 });
    }
    for (let i = 0; i < numRows; i++) {
        walls.push({ x: 0, y: i });
        walls.push({ x: numCols - 1, y: i });
    }

    for (let i = 3; i < numRows - 3; i += 3) {
        for (let j = 3; j < numCols - 3; j += 3) {
            if (Math.random() < 0.7) {
                walls.push({ x: j, y: i });
            }
        }
    }
}

function createObstacles() {
    for (let i = 0; i < numRows; i++) {
        obstacles[i] = [];
        for (let j = 0; j < numCols; j++) {
            if (Math.random() < 0.1 && !isWall(j, i)) { 
                obstacles[i][j] = true;
            } else {
                obstacles[i][j] = false;
            }
        }
    }
}

function createCoins() {
    for (let i = 0; i < numRows; i++) {
        coins[i] = [];
        for (let j = 0; j < numCols; j++) {
            if (!isWall(j, i) && !obstacles[i][j] && (i + j) % 4 === 0) { 
                coins[i][j] = true;
            } else {
                coins[i][j] = false;
            }
        }
    }
}

function draw() {
    now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        animationId = requestAnimationFrame(draw);
        return;
    }
    then = now - (elapsed % fpsInterval);

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawWalls();
    drawObstacles();
    drawCoins();
    drawPlayer();

    moveFloor();

    if (checkCollision()) {
        stop("You Lose! Score: " + score);
        return;
    }

    animationId = requestAnimationFrame(draw);
}

function drawWalls() {
    context.fillStyle = "grey";
    for (let wall of walls) {
        context.fillRect(wall.x * gridSize, wall.y * gridSize, gridSize, gridSize);
    }
}

function drawObstacles() {
    context.fillStyle = "black";
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (obstacles[i][j]) {
                context.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
            }
        }
    }
}

function drawCoins() {
    context.fillStyle = "gold";
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (coins[i][j] && !collectedCoins.includes(`${i},${j}`)) {
                context.beginPath();
                context.arc(j * gridSize + gridSize / 2, i * gridSize + gridSize / 2, 3, 0, Math.PI * 2);
                context.fill();
            }
        }
    }
}

function drawPlayer() {
    context.fillStyle = "blue";
    context.beginPath();
    context.arc(player.x * gridSize + gridSize / 2, player.y * gridSize + gridSize / 2, gridSize / 2 - 3, 0, Math.PI * 2);
    context.fill();
}

function movePlayer(event) {
    let key = event.key;
    let newX = player.x;
    let newY = player.y;
    if (key === "ArrowUp" && player.y > 0 && !isWall(player.x, player.y - 1)) {
        newY--;
    } else if (key === "ArrowDown" && player.y < numRows - 1 && !isWall(player.x, player.y + 1)) {
        newY++;
    } else if (key === "ArrowLeft" && player.x > 0 && !isWall(player.x - 1, player.y)) {
        newX--;
    } else if (key === "ArrowRight" && player.x < numCols - 1 && !isWall(player.x + 1, player.y)) {
        newX++;
    }
    if (coins[newY][newX] && !collectedCoins.includes(`${newY},${newX}`)) {
        score++;
        collectedCoins.push(`${newY},${newX}`);
        setTimeout(() => {
            collectedCoins = collectedCoins.filter(coords => coords !== `${newY},${newX}`);
            coins[newY][newX] = true;
        }, 2000); 
        coins[newY][newX] = false;
    }
    player.x = newX;
    player.y = newY;
}

function moveFloor() {
    floorOffset += floorSpeed;
    if (floorOffset >= gridSize) {
        floorOffset -= gridSize;
        floorSpeed += floorSpeedIncrement;
        obstacles.pop();
        coins.pop();
        obstacles.unshift([]);
        coins.unshift([]);
        for (let j = 0; j < numCols; j++) {
            if (Math.random() < 0.1) {
                obstacles[0][j] = true;
            } else {
                obstacles[0][j] = false;
            }
            if (!isWall(j, 1) && !obstacles[1][j] && (1 + j) % 4 === 0) { 
                coins[0][j] = true;
            } else {
                coins[0][j] = false;
            }
        }
    }
}

function checkCollision() {
    if (obstacles[player.y][player.x]) {
        return true;
    }
    return false;
}

function isWall(x, y) {
    for (let wall of walls) {
        if (wall.x === x && wall.y === y) {
            return true;
        }
    }
    return false;
}

function stop(outcome) {
    cancelAnimationFrame(animationId);
    window.removeEventListener("keydown", movePlayer);
    let outcome_element = document.querySelector("#outcome");
    outcome_element.innerHTML = outcome;

    let playAgainButton = document.querySelector("#playAgain");
    playAgainButton.style.display = "block";
    playAgainButton.addEventListener("click", restartGame);

    let data = new FormData();
    data.append("score", score);

    let xhttp = new XMLHttpRequest();
    xhttp.addEventListener("readystatechange", handle_response, false);
    xhttp.open("POST", "/score", true);
    xhttp.send(data);
}

function restartGame() {
    walls = [];
    obstacles = [];
    coins = [];
    collectedCoins = [];
    score = 0;
    floorSpeed = 1;
    createMaze();
    createObstacles();
    createCoins();
    player.x = Math.floor(numCols / 2);
    player.y = Math.floor(numRows / 2);
    document.querySelector("#outcome").innerHTML = "";
    document.querySelector("#playAgain").style.display = "none";
    window.addEventListener("keydown", movePlayer);
    draw();
}

function handle_response() {
    if (xhttp.readyState === 4) {
        if (xhttp.status === 200) {
            if (xhttp.responseText === "success") {
                console.log("Yes");
            } else {
                console.log("No");
            }
        }
    }
}
