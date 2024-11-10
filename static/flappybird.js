
// you can play the game by either using up arrow key or space bar to keep th player flying and to not lose ,don't hit the obstacles



let canvas;
let context;

const canvasWidth = 300;
const canvasHeight = 550;

let fpsInterval = 1000 / 30;
let now;
let then = Date.now();

const buildingWidth = 50;
const buildingGap = 150;
const buildingSpeed = 2;
const gravity = 1.5;
const liftForce = -15;

let helicopter = {
    x: canvasWidth / 4,
    y: canvasHeight / 2,
    radius: 10,
    velocity: 0
};



let buildings = [];
let score = 0;
let animationId;
let xhttp;

// let image = new Image();
// image.src = 'helicopter.png';


// image.onload = function() {
//     init();
// }

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");

    // helicopterImage.src = 'helicopter.png'; 
    // helicopterImage.onload = function() {
    // console.log('Helicopter image loaded successfully.'); 
    // }

    // helicopterImage.onerror = function() {
    //     console.error('Failed to load helicopter image.');
    // };
    
    window.addEventListener("keydown", activate, false);

    let playAgainButton = document.querySelector("#playAgain");
    playAgainButton.addEventListener("click", restartGame);
    console.log("Event listener added for Play Again button");

    createBuilding(); 
    setInterval(createBuilding, 3000);

    // console.log("Initialization completed.");

    draw();
    
}

function createBuilding() {
    let building = {
        x: canvasWidth,
        gapTop: Math.random() * (canvasHeight - buildingGap),
        gapBottom: Math.random() * (canvasHeight - buildingGap),
        width: buildingWidth,
        speed: buildingSpeed
    };
    buildings.push(building);
}

function draw() {
    animationId = window.requestAnimationFrame(draw);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "dark grey";
    for (let building of buildings) {
        context.fillRect(building.x, 0, building.width, building.gapTop);
        context.fillRect(building.x, building.gapTop + buildingGap, building.width, canvasHeight - building.gapTop - buildingGap);

        building.x -= building.speed;

        if (helicopter.x + helicopter.radius > building.x && helicopter.x - helicopter.radius < building.x + building.width &&
            (helicopter.y - helicopter.radius < building.gapTop || helicopter.y + helicopter.radius > building.gapTop + buildingGap)) {
            stop("You Lose!");
        }

        if (building.x + building.width < helicopter.x - helicopter.radius) {
            score++;
        }
    }

    context.fillStyle = "black";
    context.beginPath();
    context.arc(helicopter.x, helicopter.y, helicopter.radius, 0, Math.PI * 2);
    context.fill();
    // context.drawImage(image, helicopter.x - helicopter.radius, helicopter.y - helicopter.radius, helicopter.radius * 2, helicopter.radius * 2);


    helicopter.velocity += gravity;
    helicopter.y += helicopter.velocity;

    if (helicopter.y - helicopter.radius < 0 || helicopter.y + helicopter.radius > canvasHeight) {
        stop("You Lose!");
    }

    document.querySelector("#score").innerHTML = "Score: " + score;
}

function activate(event) {
    let key = event.key;
    if (key === "ArrowUp" || key === " ") {
        helicopter.velocity = liftForce;
    }
}

function restartGame() {
    helicopter = {
        x: canvasWidth / 4,
        y: canvasHeight / 2,
        radius: 10,
        velocity: 0
    };
    buildings = [];
    score = 0;
    document.querySelector("#score").innerHTML = "Score: " + score;
    document.querySelector("#outcome").innerHTML = "";
    document.querySelector("#playAgain").style.display = "none";

    window.addEventListener("keydown", activate);


    draw();
}


function stop(outcome) {
    window.cancelAnimationFrame(animationId);
    window.removeEventListener("keydown", activate);
    let outcome_element = document.querySelector("#outcome");
    outcome_element.innerHTML = outcome + " Score: " + score;

    let playAgainButton = document.querySelector("#playAgain");
    playAgainButton.style.display = "block";
    playAgainButton.addEventListener("click", restartGame);

    let data = new FormData();
    data.append("score", score);

    xhttp = new XMLHttpRequest();
    xhttp.addEventListener("readystatechange", handle_response, false);
    xhttp.open("POST", "/score", true);
    xhttp.send(data);
}

function handle_response(){
    if (xhttp.readyState === 4){
        if (xhttp.status ===200){
            if (xhttp.responseText === "success") {
                console.log("Yes")
            }
            else{
                console.log("No")
            }
        }
    }
}