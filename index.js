import Hex from './Hex.js';
import { hexTypes } from './HexType.js';
import { HumanPlayer, ComputerPlayer } from './Player.js';

/** @type {Hex[][]} */
let worldMap = [];

document.addEventListener("DOMContentLoaded",function(){
    createWorld();

});



const gameBoard = document.getElementById('gameBoard');
const btnMakeWorld = document.getElementById("btnMakeWorld");
btnMakeWorld.addEventListener("click", createWorld);

//Create a new array of arrays based off of the what the user set in the menu fields
function createWorld(){
    //Reset the world and get the rows and columns
    worldMap = [];
    const players = [
        new HumanPlayer('Human', 'blue'),
        new ComputerPlayer('AI-1', 'red'),
        new ComputerPlayer('AI-2', 'green'),
        new ComputerPlayer('AI-3', 'yellow')
      ];

    let desiredRows = document.getElementById("rowsInput").value;
    let desiredColumns = document.getElementById("columnsInput").value;
    let left = 0;
    let right = desiredColumns - 1;
    let top = 0;
    let bottom = desiredRows - 1;

    // Cycle through and make our 'world' 
    // I think the for loops will need to change based on the hex type, flat or pointy
    // This is for pointy and odd row indent
    for (let r = top; r <= bottom; r++){
        /** @type {Hex[]} */
        let row = [];
        let r_offset = Math.floor(r/2.0);
        for (let q = left - r_offset; q <= right - r_offset; q++){
            let newHex = new Hex(q, r, -q-r);
            newHex.hexType = hexTypes.BASIC;
            row.push(newHex);
        }
        worldMap.push(row);
    }

    // Set starting positions for players
    worldMap[top][left].playerOwner = players[0];
    worldMap[top][left].hexType = hexTypes.HOME;

    worldMap[top][right].playerOwner = players[1];
    worldMap[top][right].hexType = hexTypes.HOME;

    worldMap[bottom][left].playerOwner = players[2];
    worldMap[bottom][left].hexType = hexTypes.HOME;

    worldMap[bottom][right].playerOwner = players[3];
    worldMap[bottom][right].hexType = hexTypes.HOME;


    window.worldMap = worldMap;//this is for debuging so we can get at the structure
    //console.table(worldMap);

    //Not sure if we should draw it here. Seems like creating and drawing are different responsibilities.
    drawNewWorld();
}

//Draw a new map based on what is in the wordMap array
function drawNewWorld(){
    clearWorld();
    let displayCoords = document.getElementById("includeCoords").checked;
    if (document.getElementById("flatHex").checked){
        drawFlatWorld(displayCoords);
    }
    else{
        drawPointyWorld(displayCoords);
    }
    addEventListenersToHexes();
}

function drawFlatWorld(displayCoords){
    worldMap.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add(`row`);
        row.forEach((hexagon, columnIndex) => {
            const hexagonDiv = document.createElement('div');
            hexagonDiv.classList.add(`hexagon`);
            hexagonDiv.classList.add(`hexagon-flat`);
            if (columnIndex % 2){
                hexagonDiv.classList.add(`hexagon-flat-odd`);
            }
            if (hexagon.active){hexagonDiv.classList.add('blinking');}
            hexagonDiv.setAttribute(`q`,hexagon.q);
            hexagonDiv.setAttribute(`r`,hexagon.r);
            hexagonDiv.setAttribute(`s`,hexagon.s);
            hexagonDiv.setAttribute("rowIndex", rowIndex);
            hexagonDiv.setAttribute("columnIndex", columnIndex);
            if (displayCoords){
                hexagonDiv.innerHTML = `<div class="hex-info">${hexagon.toString()}</div>`
            }
            rowDiv.appendChild(hexagonDiv);
        });
    
        gameBoard.appendChild(rowDiv);
    });
}

function drawPointyWorld(displayCoords){
    worldMap.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add(`row-pointy`);
        if (rowIndex % 2){
            rowDiv.classList.add(`row-pointy-odd`);
        }
        row.forEach((hexagon, columnIndex) => {
            const hexagonDiv = document.createElement('div');
            hexagonDiv.classList.add(`hexagon`);
            hexagonDiv.classList.add(`hexagon-pointy`);
            if (hexagon.active){hexagonDiv.classList.add('blinking');}
            hexagonDiv.setAttribute(`q`,hexagon.q);
            hexagonDiv.setAttribute(`r`,hexagon.r);
            hexagonDiv.setAttribute(`s`,hexagon.s);
            hexagonDiv.setAttribute(`rowIndex`, rowIndex);
            hexagonDiv.setAttribute(`columnIndex`, columnIndex);
            if (hexagon.playerOwner){hexagonDiv.style.backgroundColor = hexagon.playerOwner.color}
            if (displayCoords){hexagonDiv.innerHTML = `<div class="hex-info">${hexagon.toString()}</div>`}
            if (hexagon.hexType != hexTypes.BASIC){
                console.log(hexagon.hexType);
                // Display its type
                let hexTypeDiv = document.createElement('div');
                hexTypeDiv.classList.add(hexagon.hexType);
                hexagonDiv.appendChild(hexTypeDiv);
            }
            rowDiv.appendChild(hexagonDiv);
        });
    
        gameBoard.appendChild(rowDiv);
    });
}

function addEventListenersToHexes(){
    const hexes = document.querySelectorAll('.hexagon');

    hexes.forEach(div => {
        // Make the hex highlighted so you can see where you're pointing
        div.addEventListener('mouseenter', function(){
            this.classList.add('highlighted');
        });
        div.addEventListener('mouseleave', function(){
            this.classList.remove('highlighted');
        });

        // Make the neighbors blink....or unblink if they're already blinking. I think there's a game of life that's like this or something.
        div.addEventListener('click', function(){
            let q = +this.getAttribute('q');
            let r = +this.getAttribute('r');
            //console.log(this);
            
            let theHexInTheWorldMap = worldMap[r][q + Math.floor(r/2.0)];
            //theHexInTheWorldMap.active = !theHexInTheWorldMap.active;

            // Make the naybs blink
            for(let h = 0; h < 6; h++){
                let nayb = theHexInTheWorldMap.neighbor(h);

                // For now this will work but we should make a map or world class and encapsulate all this type of stuff
                if (worldMap[nayb.r] != null){// Stay inside the bounds
                    let naybInHexWorldMap = worldMap[nayb.r][nayb.q + Math.floor(nayb.r/2.0)];
                    if (naybInHexWorldMap != null){
                        naybInHexWorldMap.active = !naybInHexWorldMap.active;
                    }
                }
                
            }

            // Redraw. I'm not sure how best to do this yet, so this works for now.
            drawNewWorld();
        });
    });
}

//This just clears the gameBoard div
function clearWorld(){
    gameBoard.innerHTML = "";
}

