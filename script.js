//CONSTANTS

var currentMap;

const levelOne = [
	[1, 0, 0, 0],
	[-1, -1, 0, -1],
	[2, 0, 0, -1],
	[-1, -1, -1, -1]
];

const levelTwo = [
	[1, 0, -1, 0, 0],
	[-1, 0, 0, 0, 0],
	[-1, -1, 0, 0, 0],
	[0, 0, 0, -1, -1],
	[0, -1, 0, 0, 2]
]

var levels = [
	levelOne,
	levelTwo
]

var currentLevel = 0;

var pos = [0, 0];

var instructions = document.getElementById("instruction");

var go = document.getElementById("go");

var won = false;

//CONSTANTS/

//MAP DRAWING

function resetGameBoard() {
	var gameContainer = document.getElementById('gameContainer');
	
	var gameBoard = document.createElement('div'); 

	while(gameContainer.firstChild){
		gameContainer.removeChild(gameContainer.firstChild);
	}
	
	gameBoard.classList.add('game');
	
	gameContainer.appendChild(gameBoard);
	
	return gameBoard;
}

function drawMap(map) {
	
	var gameBoard = resetGameBoard();
	
	var dimensions = map[0].length;

	for(var row = 0; row < dimensions; row++) {
		
		var tileRow = document.createElement('div');
		tileRow.classList.add('tileRow');
		
		for(var col = 0; col < dimensions; col++){
		
			var tile = document.createElement('div');
			tile.classList.add('tile');
			switch(map[row][col]) {
			case 0:
				tile.classList.add('path');
				break;
			case 1:
				tile.classList.add('player');
				break;
			case -1:
				tile.classList.add('wall');
				break;
			case 2:
				tile.classList.add('exit');
				break;
			}
			tileRow.appendChild(tile);
		}
		
		gameBoard.appendChild(tileRow);
	}
	
	gameContainer.appendChild(gameBoard);
}

function setupLevel(level) {
	
	resetGameBoard();
	
	while(instructions.firstChild) {
		instructions.removeChild(instructions.firstChild);
	}
	
	won = false;
	pos = [0, 0];
	
	if(level >= levels.length) {
		alert("There are no more levels!");
		return;
	}
	
	currentMap = copyArray(levels[level]);
	drawMap(currentMap);
}

function copyArray(arr) {
	
	var copy = [];
	
	for(i = 0; i < arr.length; i++) {
		copy[i] = arr[i].slice(0);
	}
	
	return copy;
}
	
//MAP DRAWING/


function runGame(){
	var instList = instructions.getElementsByTagName('li');
	
	calculateNextMove(instList, 0);
}

function calculateNextMove(directions, instructionIndex) {
	
	if(won) {
		alert("You won!");
		currentLevel++;
		setupLevel(currentLevel);
		return;
	}
	
	if(directions.length == instructionIndex + 1) {
		alert("You did not reach the end!");
		setupLevel(currentLevel);
		return;
	}
	
	var direction = directions[instructionIndex].textContent;

	var directionVector = getDirectionVector(direction);
	
	var nextMoveValidity = isValidMove(pos, directionVector, currentMap)
	
	if(nextMoveValidity){
		var newMap = getMovedPlayer(pos, directionVector);
		
		drawMap(newMap);
		
		pos[0] += directionVector[0];
		pos[1] += directionVector[1];
		
		colorInstruction(directions, instructionIndex);
		
		setTimeout(function() {
		calculateNextMove(directions, instructionIndex + 1);
		}, 100);
	}else{
		alert("You died!");
		setupLevel(currentLevel);
		return;
	}
}

function getDirectionVector(direction) {
	switch(direction) {
	case "R":
		return [0, 1];
	case "L":
		return [0, -1];
	case "U":
		return [-1, 0];
	case "D":
		return [1, 0];
	}
}

function isValidMove(playerPos, directionVector, map) {

	var x = playerPos[0] + directionVector[0];
	var y = playerPos[1] + directionVector[1];

	var dimensionsY = map.length;
	
	if(y >= dimensionsY) {
		return false;
	}
	
	var dimensionsX = map[0].length;

	if(x >= dimensionsX) return false;
	
	if(x < 0) return false;
	
	switch(map[x][y]){
		case 0:
			return true;
		case 2:
			won = true;
			return true;
		default:
			return false;
	}

}

function getMovedPlayer(playerPos, directionVector) {

	var newPlayerPos = [playerPos[0] + directionVector[0], playerPos[1] + directionVector[1]];
	var newMap = currentMap.slice();
	newMap[playerPos[0]][playerPos[1]] = 0;
	newMap[newPlayerPos[0]][newPlayerPos[1]] = 1;
	
	return newMap;
}

function colorInstruction(directions, instructionIndex) {
	directions[instructionIndex].classList.add('moved');
}


//EVENTS

var instructionBtns = document.getElementsByClassName("instruction");

for(i = 0; i < instructionBtns.length; i++) {
	var btn = instructionBtns[i];
	btn.addEventListener("click", onInstructionClick);
}

function onInstructionClick(event) {
	var inst = document.createElement('li');
	var btn = event.target;
	inst.textContent = btn.id;	
	instructions.appendChild(inst);
	if (btn.id == "go")
		runGame();
}

//EVENTS/

//MAP GENERATION//

/*

Square dimension to generate a map with

*/
function generateNewMap(dimensions) {
	
	var map = generateFullMap(dimensions);
	
	var cutMap = cutPathTowardsExit(map, dimensions);
	
	return cutMap;
}

/*

Generates a map full of walls of a given dimension.

*/
function generateFullMap(dimensions) {
    return Array(dimensions).fill().map(() => Array(dimensions).fill(-1));
}

function generateEmptyMap(dimensions) {
	return Array(dimensions).fill().map(() => Array(dimensions).fill(0));
}

/*

	Returns a map with a cut out path from start to finish.

*/
function cutPathTowardsExit(map, dimensions) {
	
	var pathLen = Math.floor(Math.random() * (dimensions * 4)) + dimensions * 4;
	
	var cutPos = [0, 0];
	var emptyMap = generateEmptyMap(dimensions);
	
	for(i = 0; i < pathLen; i++) {
		var randomDirection = chooseRandomDirection();
		var direction = getDirectionVector(randomDirection);
		
		if(isValidMove(cutPos, direction, emptyMap)) {
			cutPos[0] += direction[0];
			cutPos[1] += direction[1];
			
			if(i == pathLen - 1) {
				console.log("Decide exit");
				if(cutPos[0] == 0 && cutPos[1] == 0){
					console.log("On start");
					map = cutPathTowardsExit(generateFullMap(dimensions), dimensions);
				} else {
					map[cutPos[0]][cutPos[1]] = 2;
				}
			} else {
			map[cutPos[0]][cutPos[1]] = 0;
			}
		}
	}

	map[0][0] = 1;
	
	return map;
}

/*

	Generates a random direction;

*/
function chooseRandomDirection() {
	switch(Math.floor(Math.random() * 4)) {
		case 0: 
			return "U";
		case 1:
			return "L";
		case 2:
			return "D";
		case 3:
			return "R";
	}
}

//Draw first level

levels[0] = generateNewMap(8);

setupLevel(0);