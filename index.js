import Hex from './Hex.js';

/** @type {Hex[][]} */
let worldMap = [];

document.addEventListener("DOMContentLoaded",function(){
    createWorld();
});

const gameBoard = document.getElementById('gameBoard');
const btnMakeWorld = document.getElementById("btnMakeWorld");
btnMakeWorld.addEventListener("click", createWorld);

//Create a new array of arrays based off of the what the user set in the menu fields
function createWorld()
{
    //Reset the world and get the rows and columns
    worldMap = [];
    let desiredRows = document.getElementById("rowsInput").value;
    let desiredColumns = document.getElementById("columnsInput").value;

    //Cycle through and make our 'world' 
    for (let i = 0;i < desiredRows;i++){
        /** @type {Hex[]} */
        let row = [];
        for (let j = 0; j < desiredColumns; j++){
            row.push(new Hex(i, j, -i-j));
        }
        worldMap.push(row);
    }

    //Not sure if we should draw it here. Seems like creating and drawing are different responsibilities.
    drawNewWorld();
}

//Draw a new map based on what is in the wordMap array
function drawNewWorld(){
    clearWorld();
    worldMap.forEach((row, index) => {
        const rowDiv = document.createElement('div');
        if (index === 0)
        {
            rowDiv.className = `row zero`;
        }else{
             rowDiv.className = `row ${index % 2 === 0 ? 'even' : 'odd'}`;
        }
    
        row.forEach(hexagon => {
            const hexagonDiv = document.createElement('div');
            hexagonDiv.className = 'hexagon';
            hexagonDiv.innerHTML = `<div class="hex-info">${hexagon.toString()}</div>`
            rowDiv.appendChild(hexagonDiv);
        });
    
        gameBoard.appendChild(rowDiv);
    });
}

//This just clears the gameBoard div
function clearWorld(){
    gameBoard.innerHTML = "";
}
