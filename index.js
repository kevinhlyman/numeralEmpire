import Hex from './Hex.js';
import { hexTypes } from './HexType.js';
import { Player, HumanPlayer, ComputerPlayer } from './Player.js';

/** @type {Hex[][]} */
let worldMap = [];
let players = [];
let currentTurn = 0;
let activeHex = null;

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
    
    displayCurrentPlayer();
    calculateCurrentPlayerStorage();
    displayCurrentTurn();
    displayCurrentRound();
    displayCurrentPhase();
    drawWorld();
}

//Draw a new map based on what is in the wordMap array
function drawWorld(){
    clearWorld();
    drawPointyWorld();
    addEventListenersToHexes();
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
            if (hexagon.active){hexagonDiv.classList.add('hexagon-selected');}
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
            console.log('Clicked a hexagon');
            let q = +this.getAttribute('q');
            let r = +this.getAttribute('r');
            let theHexInTheWorldMap = worldMap[r][q + Math.floor(r/2.0)];

            //We'll probably need something here to do nothing if the click isn't coming from the current player
            //right now it's a single player game so if the player is clicking on hexagons while it's the computers turn we don't want anything to happen
            //haven't tested but I'm pretty sure the human player will be able to force the AI player to make moves by clicking around.
            let localCP = getCurrentPlayer();

            // We need to know what phase we're in to know how to respond.
            if (getCurrentPhase() === 'Attacking'){
                // We are in the attacking phase.
                if (theHexInTheWorldMap.playerOwner == localCP){
                    // We need to highlight/unhighlight the hex to show it is selected or not selected.
                    
                    if (theHexInTheWorldMap.active){
                        // This is the currently selected hex so they're de-selecting it.
                        unsetActiveHex();
                    }else{
                        if (activeHex === null){
                            // There is no active hex so make this one the active hex.
                            setActiveHex(theHexInTheWorldMap);
                        }else{
                            // There is an active hex and it's not the one they clicked so move the soldiers from the active hex to this hex.
                            let localSoldierCount = 0;
                            if (activeHex.hexType == hexTypes.HOME){
                                // There won't be a soldier count. It uses the storage
                                localSoldierCount = activeHex.playerOwner.storage;
                                activeHex.playerOwner.zeroOutStorage();
                            }else{
                                localSoldierCount = activeHex.soldierCount;
                                activeHex.soldierCount = 0;
                            }
        
                            theHexInTheWorldMap.soldierCount += localSoldierCount;
        
                            // Unset the active hex
                            unsetActiveHex();
                        }
                    }
                }else if(activeHex !== null && theHexInTheWorldMap.playerOwner === null){
                    // Nobody owns it so take it.
                     // Make sure they can actually move to this hex
                     if (playerOwnsANeighboringHexagon(localCP, theHexInTheWorldMap)){
                        let localSoldierCount = 0;
                        if (activeHex.hexType == hexTypes.HOME)
                        {
                            // There won't be a soldier count. It uses the storage
                            localSoldierCount = activeHex.playerOwner.storage;
                            activeHex.playerOwner.zeroOutStorage();
                        }else{
                            localSoldierCount = activeHex.soldierCount;
                            activeHex.soldierCount = 0;
                        }

                        theHexInTheWorldMap.soldierCount = localSoldierCount;
                        theHexInTheWorldMap.playerOwner = localCP;

                        // Unset the active hex
                        unsetActiveHex();
                    }
                }else if(activeHex !== null && theHexInTheWorldMap.playerOwner !== null){
                    if (playerOwnsANeighboringHexagon(localCP, theHexInTheWorldMap)){
                        // Another player owns the hex so do some attacking math
                        let activeArmy = activeHex.hexType === hexTypes.HOME ? activeHex.playerOwner.storage : activeHex.soldierCount;
                        let enemyArmy = theHexInTheWorldMap === hexTypes.HOME ? theHexInTheWorldMap.playerOwner.storage : theHexInTheWorldMap.soldierCount;

                        // This is not the correct way to do this but it's how it's being done right now until I write a method to 'combine' hexegons
                        if (activeArmy > enemyArmy){
                            // The active army wins
                            console.log(`Attcking army Wins.`);
                            let leftOverArmy = activeArmy - enemyArmy;

                            // Clear out attacking
                            if (activeHex.hexType === hexTypes.HOME){
                                // They attacked from their home
                                activeHex.playerOwner.zeroOutStorage();
                            }else{
                                activeHex.soldierCount = 0;
                            }

                            let oldOwner = theHexInTheWorldMap.playerOwner
                            let wasHome = theHexInTheWorldMap.hexType === hexTypes.HOME;
                            // Now take over the hex
                            theHexInTheWorldMap.playerOwner = localCP;
                            theHexInTheWorldMap.soldierCount = leftOverArmy;
                            theHexInTheWorldMap.hexType = hexTypes.BASIC;

                            // If it was their home, find them a new one.
                            if (wasHome){
                                // Their home was attacked
                                oldOwner.zeroOutStorage();
                                let playerHexes  = findAllHexesForPlayer(oldOwner);
                                if (playerHexes.length > 0){
                                    // For now randomly select a hex to make the home.
                                    let newHomeHex = playerHexes[Math.floor(Math.random() * 2)];
                                    newHomeHex.hexType = hexTypes.HOME;
                                    newHomeHex.soldierCount = 0;
                                }
                            }


                                
                        }else if (activeArmy === enemyArmy){
                            console.log(`Armies Tie.`);
                            // They tied, everyone dies.... ;(
                            if (activeHex.hexType === hexTypes.HOME){
                                activeHex.playerOwner.zeroOutStorage();
                            }else{
                                activeHex.soldierCount = 0;
                            }
                            
                            if (theHexInTheWorldMap === hexTypes.HOME){
                                theHexInTheWorldMap.playerOwner.zeroOutStorage();
                            }else{
                                theHexInTheWorldMap.soldierCount = 0;
                            }
                            
                        }else if (activeArmy < enemyArmy){
                            // The active army dies
                            console.log(`Attcking army loses.`);
                            if (activeHex.hexType === hexTypes.HOME){
                                activeHex.playerOwner.zeroOutStorage();
                            }else{
                                activeHex.soldierCount = 0;
                            }

                            let leftOverArmy = enemyArmy - activeArmy;
                            if (theHexInTheWorldMap === hexTypes.HOME){
                                theHexInTheWorldMap.playerOwner.setStorageTo(leftOverArmy);
                            }else{
                                theHexInTheWorldMap.soldierCount = leftOverArmy;
                            }
                        }
                        
                        unsetActiveHex();
                    }
                }
            }else if (getCurrentPhase() === 'Placing'){
                // We are in the placing phase.
                if (theHexInTheWorldMap.playerOwner == localCP){
                    // We don't want to do anything if the player is clicking on their HOME
                    if (theHexInTheWorldMap.hexType !== hexTypes.HOME){
                        if (localCP.storage > 0){
                            // Add one to the hex soldier count.
                            theHexInTheWorldMap.soldierCount++;
                            // Subtract one from the current players storage.
                            localCP.subtractFromStorage();
                        }
                    }
                }
            }
            // Redraw. I'm not sure how best to do this yet, so this works for now.
            drawWorld();
        });
    });
}

function setActiveHex(hexagon){
    hexagon.active = true;
    activeHex = hexagon;
}

function unsetActiveHex(){
    if(activeHex !== null){
        activeHex.active = false;
        activeHex = null;
    }
}

function displayCurrentPlayer(){
    let pdiv = document.getElementById('currentPlayer');
    let currentPlayer = getCurrentPlayer();
    pdiv.innerHTML = currentPlayer.name;
    pdiv.style.backgroundColor = currentPlayer.color
}

function getCurrentTurn(){
    return currentTurn;
}

function getCurrentRound(){
    return Math.floor(currentTurn / (players.length * 2)) + 1;
}

function getCurrentPhase(){
    let currentPhase = (currentTurn % (players.length * 2)) < players.length ? 1 : 2;
    
    if (currentPhase === 1){
        return 'Placing';
    }else{
        return 'Attacking';
    }
}

function displayCurrentTurn(){
    let tdiv = document.getElementById('currentTurn');
    tdiv.innerHTML = currentTurn;

}
function displayCurrentRound(){
    let rdiv = document.getElementById('currentRound');
    rdiv.innerHTML  = getCurrentRound();
}

function displayCurrentPhase(){
    let phdiv = document.getElementById('currentPhase');
    phdiv.innerHTML = getCurrentPhase();
}

function calculateCurrentPlayerStorage(){
    // We only do this on the Placing phase
    if (getCurrentPhase() === 'Placing'){
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
}

function endCurrentPlayerTurn(){
    console.log(`Ending player ${getCurrentPlayer().name} turn`);
    increaseCurrentTurn();
    displayCurrentPlayer();
    displayCurrentTurn()
    displayCurrentRound();
    displayCurrentPhase();
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

function increaseCurrentTurn(){
    currentTurn++;
}

function computerPlayerLoop(){
    console.log(`Computer player ${getCurrentPlayer().name} is playing`);
    let currentPlayer = getCurrentPlayer();
    let playerOwnedHexes = [];
    let maxTurns = 10; // For now a safety mechanism so this loop don't run away wild

    // Get a list of owned hexes by the player
    worldMap.forEach((row) => {
        row.forEach((hexagon) => {
            if (hexagon.playerOwner == currentPlayer){
                playerOwnedHexes.push(hexagon);
            }
        });
    });


    // Depending on the current phase of the game we need to do different things
    if (getCurrentPhase() === 'Placing'){
        while (currentPlayer.storage > 0 && maxTurns > 0){
            //We will add to each and every hex they own until they run out
            console.log(`Adding soldiers to computer hexes.`);
            playerOwnedHexes.forEach((hexagon) => {
                if (currentPlayer.storage > 0 && hexagon.hexType !== hexTypes.HOME)
                {
                    hexagon.soldierCount++;
                    currentPlayer.subtractFromStorage();
                }            

                // this probably isn't the correct place to put this but just for now.
                drawWorld();
            });
            maxTurns--;
        }
    }else if (getCurrentPhase() === 'Attacking'){
        while (maxTurns > 0){
            // find a hex owned that has a neighbor with an unowned hex and move the soldiers into it.
            playerOwnedHexes.forEach((hexagon) => {
                for(let h = 0; h < 6; h++){
                    if ((hexagon.hexType === hexTypes.HOME && currentPlayer.storage > 0) || hexagon.soldierCount > 0){
                        let nayb = hexagon.neighbor(h);
        
                        // For now this will work but we should make a map or world class and encapsulate all this type of stuff
                        if (worldMap[nayb.r] != null){// Stay inside the bounds
                            let naybInHexWorldMap = worldMap[nayb.r][nayb.q + Math.floor(nayb.r/2.0)];
                            if (naybInHexWorldMap != null){
                                if(naybInHexWorldMap.playerOwner === null){
                                    // Move soldier from the current hex to this one.
                                    let soldierCountToMove = hexagon.hexType === hexTypes.HOME ? currentPlayer.storage : hexagon.soldierCount;
                                    console.log(`Moving ${soldierCountToMove} from ${hexagon} to ${naybInHexWorldMap}`);
                                    naybInHexWorldMap.soldierCount = soldierCountToMove;
                                    naybInHexWorldMap.playerOwner = currentPlayer;

                                    if (hexagon.hexType === hexTypes.HOME){
                                        currentPlayer.zeroOutStorage();
                                    }else{
                                        hexagon.soldierCount = 0;
                                    }
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

