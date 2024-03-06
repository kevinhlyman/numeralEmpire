import Hex from './Hex.js';
import { hexTypes } from './HexType.js';
import { Player, HumanPlayer, ComputerPlayer } from './Player.js';

/** @type {Hex[][]} */
let worldMap = [];
let players = [];
let currentTurn = 0;

document.addEventListener('DOMContentLoaded',function(){
    createWorld();

});



const gameBoard = document.getElementById('gameBoard');
const btnMakeWorld = document.getElementById('btnMakeWorld');
btnMakeWorld.addEventListener('click', createWorld);
const btnEndTurn = document.getElementById('btnEndTurn');
btnEndTurn.addEventListener('click', endCurrentPlayerTurn);

//Create a new array of arrays based off of the what the user set in the menu fields
function createWorld(){
    //Reset the world and get the rows and columns
    worldMap = [];
    currentTurn = 0;
    players = [
        new HumanPlayer('Human', 'var(--player1-background)'),
        new ComputerPlayer('AI-1', 'var(--player2-background)'),
        new ComputerPlayer('AI-2', 'var(--player3-background)'),
        new ComputerPlayer('AI-3', 'var(--player4-background)')
      ];

    let desiredRows = document.getElementById('rowsInput').value;
    let desiredColumns = document.getElementById('columnsInput').value;
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

    //this is for debuging so we can get at the structure
    window.worldMap = worldMap;
    window.players = players;
    window.currentTurn = currentTurn;


    //Not sure if we should draw it here. Seems like creating and drawing are different responsibilities.
    
    setCurrentPlayer();
    calculateCurrentPlayerStorage();
    drawWorld();
}

//Draw a new map based on what is in the wordMap array
function drawWorld(){
    clearWorld();
    drawPointyWorld();
    addEventListenersToHexes();
    //buildPlayerBoard();
}

function drawPointyWorld(){
    let displayCoords = document.getElementById('includeCoords').checked;

    worldMap.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row-pointy');
        if (rowIndex % 2){
            rowDiv.classList.add('row-pointy-odd');
        }
        row.forEach((hexagon, columnIndex) => {
            const hexagonDiv = document.createElement('div');
            hexagonDiv.classList.add('hexagon');
            hexagonDiv.classList.add('hexagon-pointy');
            if (hexagon.active){hexagonDiv.classList.add('blinking');}
            hexagonDiv.setAttribute('q',hexagon.q);
            hexagonDiv.setAttribute('r',hexagon.r);
            hexagonDiv.setAttribute('s',hexagon.s);
            hexagonDiv.setAttribute('rowIndex', rowIndex);
            hexagonDiv.setAttribute('columnIndex', columnIndex);
            if (hexagon.playerOwner){hexagonDiv.style.backgroundColor = hexagon.playerOwner.color}
            if (displayCoords){hexagonDiv.innerHTML = `<div class="hex-info">${hexagon.toString()}</div>`}
            if (hexagon.hexType == hexTypes.BASIC){
                if (hexagon.soldierCount > 0){
                    let hexSoldierDiv = document.createElement('div');
                    hexSoldierDiv.classList.add('soldier-div');
                    hexSoldierDiv.innerHTML = hexagon.soldierCount;
                    hexagonDiv.appendChild(hexSoldierDiv);
                }
            }else{
                // Display its type
                let hexTypeDiv = document.createElement('div');
                hexTypeDiv.classList.add(hexagon.hexType);
                hexagonDiv.appendChild(hexTypeDiv);
                
                if (hexagon.hexType == hexTypes.HOME){
                    //Then we want to show the 'storage' here
                    let hexSoldierDiv = document.createElement('div');
                    hexSoldierDiv.classList.add('soldier-div');
                    hexSoldierDiv.innerHTML = hexagon.playerOwner.storage;
                    hexagonDiv.appendChild(hexSoldierDiv);
                }
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

        div.addEventListener('click', function(){
            let q = +this.getAttribute('q');
            let r = +this.getAttribute('r');
            let theHexInTheWorldMap = worldMap[r][q + Math.floor(r/2.0)];

            //We'll probably need something here to do nothing if the click isn't coming from the current player
            //right now it's a single player game so if the player is clicking on hexagons while it's the computers turn we don't want anything to happen
            //haven't tested but I'm pretty sure the human player will be able to force the AI player to make moves by clicking around.
            let localCP = getCurrentPlayer();
            if (localCP.storage > 0 && playerOwnsANeighboringHexagon(localCP, theHexInTheWorldMap))
            {
                if (theHexInTheWorldMap.playerOwner == localCP){
                    // Add one to the hex soldier count.
                    theHexInTheWorldMap.soldierCount++;
                    // Subtract one from the current players storage.
                    localCP.subtractFromStorage();
                }else if (theHexInTheWorldMap.playerOwner == null){
                    // Nobody owns it so take it.
                    theHexInTheWorldMap.soldierCount++;
                    theHexInTheWorldMap.playerOwner = localCP;
                    // Subtract one from the current players storage.
                    localCP.subtractFromStorage();
                }else if (theHexInTheWorldMap.playerOwner != localCP){
                    // Someone else owns it so attack.
                    // Right now we are just going to switch the player owner to the current player.
                    theHexInTheWorldMap.soldierCount = 1;
                    let oldOwner = theHexInTheWorldMap.playerOwner; // Track who used to own it for a check later on.
                    let oldHexType = theHexInTheWorldMap.hexType; // Track what it used to be for a check later on.
                    theHexInTheWorldMap.playerOwner = localCP;
                    theHexInTheWorldMap.hexType = hexTypes.BASIC; // Taking over a hex resets it to a basic regardless of what it was.
                    // Subtract one from the current players storage.
                    localCP.subtractFromStorage();
                    // If it was a home then we need to set the home of that old owner to some other hex they own.
                    if (oldHexType == hexTypes.HOME){
                        let playerHexes = findAllHexesForPlayer(oldOwner);
                        if (playerHexes.length > 0){
                            // For now randomly select a hex to make the home.
                            let newHomeHex = playerHexes[Math.floor(Math.random() * 2)];
                            newHomeHex.hexType = hexTypes.HOME;
                        }
                    }
                }
            }
            
            // Redraw. I'm not sure how best to do this yet, so this works for now.
            drawWorld();
        });
/*         // Make the neighbors blink....or unblink if they're already blinking. I think there's a game of life that's like this or something.
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
            drawWorld();
        }); */
    });
}

function setCurrentPlayer(){
    let pdiv = document.getElementById('currentPlayer');
    let currentPlayer = getCurrentPlayer();
    pdiv.innerHTML = currentPlayer.name;
    pdiv.style.backgroundColor = currentPlayer.color
}

function calculateCurrentPlayerStorage(){
    let currentPlayer = getCurrentPlayer();
    let addToStorage = 0;
    let subtractFromStorage = 0.0;

    worldMap.forEach((row) => {
        row.forEach((hexagon) => {
            if (hexagon.playerOwner == currentPlayer){
                addToStorage++;
                if (hexagon.soldierCount > 0){
                    subtractFromStorage += hexagon.soldierCount / 2.0;
                }
            }
        });
    });

    currentPlayer.addToStorage(addToStorage);
    currentPlayer.subtractFromStorage(Math.floor(subtractFromStorage));

}

function endCurrentPlayerTurn(){
    console.log(`Ending player ${getCurrentPlayer().name} turn`);
    increaseCurrentTurn();
    setCurrentPlayer();
    calculateCurrentPlayerStorage();
    drawWorld();

    if (getCurrentPlayer() instanceof ComputerPlayer){
        setTimeout(function(){
            // Waiting 1 second so the player can see the computers "play".
            computerPlayerLoop();
        }, 1000);
        
    }
}

function getCurrentPlayer(){
    return players[getCurrentTurn() % getPlayerCount()];
}

function getPlayerCount(){
    return players.length;
}

function getCurrentTurn(){
    return currentTurn;
}

function increaseCurrentTurn(){
    currentTurn++;
}

function buildPlayerBoard(){
    let playerBoard = document.getElementById('playerBoard');
    playerBoard.innerHTML = "";
    players.forEach((player) => {
        let pDiv = document.createElement('div');
        pDiv.innerHTML = `<div>${player.name} : <span style="display:inline-block;background-color:${player.color};padding:2px;">${player.storage}</span></div>`;
        playerBoard.appendChild(pDiv);
    });
}

function computerPlayerLoop(){
    console.log(`Computer player ${getCurrentPlayer().name} is playing`);
    let currentPlayer = getCurrentPlayer();
    let playerOwnedHexes = [];

    // Get a list of owned hexes by the player
    worldMap.forEach((row) => {
        row.forEach((hexagon) => {
            if (hexagon.playerOwner == currentPlayer){
                playerOwnedHexes.push(hexagon);
            }
        });
    });

    // see if they have anything in storage to use
    let maxTurns = 10; // For now a safety mechanism so this loop don't run away wild
    while (currentPlayer.storage > 0 && maxTurns > 0){
        console.log(currentPlayer.storage);
        // find a hex that has a neighbor with an unowned hex and put a soldier in it
        playerOwnedHexes.forEach((hexagon) => {
            for(let h = 0; h < 6; h++){
                let nayb = hexagon.neighbor(h);

                // For now this will work but we should make a map or world class and encapsulate all this type of stuff
                if (worldMap[nayb.r] != null){// Stay inside the bounds
                    let naybInHexWorldMap = worldMap[nayb.r][nayb.q + Math.floor(nayb.r/2.0)];
                    if (naybInHexWorldMap != null){
                        if(naybInHexWorldMap.playerOwner == null){
                            // make sure we have something in storage to use
                            if (currentPlayer.storage > 0){
                                // take it and turn down the storage by 1
                                naybInHexWorldMap.playerOwner = currentPlayer;
                                naybInHexWorldMap.soldierCount = 1;
                                currentPlayer.subtractFromStorage();
                            }
                        }
                    }
                }  
            }
            
            // this probably isn't the correct place to put this but just for now.
            drawWorld();
        });

        maxTurns--;
    }

    endCurrentPlayerTurn();
}


function playerOwnsANeighboringHexagon(player, hexagon){
    for(let h = 0; h < 6; h++){
        let nayb = hexagon.neighbor(h);

        // For now this will work but we should make a map or world class and encapsulate all this type of stuff
        if (worldMap[nayb.r] != null){// Stay inside the bounds
            let naybInHexWorldMap = worldMap[nayb.r][nayb.q + Math.floor(nayb.r/2.0)];
            if (naybInHexWorldMap != null){
                if(naybInHexWorldMap.playerOwner == player){
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * This function takes a player and returns a list of hexes they own.
 *
 * @param {Player} player The player whos hexes we want to know.
 * @returns {Hex[]} An array of Hex tiles owned by the player.
 */
function findAllHexesForPlayer(player){
    // I think later on we'll probably want to just keep track of this as things go instead of trying to calculate it every time.

    // For now just loop through the world 1 by 1 and find all the hexes that belong to this player.
    let playerHexes = [];
    // This is a definite place for optimization
    worldMap.forEach((row) => {
        row.forEach((hexagon) => {
            if (hexagon.playerOwner == player){
                playerHexes.push(hexagon);
            }
        });
    });
    return playerHexes;
}

//This just clears the gameBoard div
function clearWorld(){
    gameBoard.innerHTML = "";
}

