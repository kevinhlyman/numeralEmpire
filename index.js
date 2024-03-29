import Hex from './Hex.js';
import { hexTerrainType } from './Types/HexTerrainType.js';
import { hexImprovementType } from './Types/HexImprovementType.js';
import { phaseTypes } from './Types/PhaseType.js';
import { Player, HumanPlayer, ComputerPlayer } from './Player.js';
import HexWorld from './HexWorld.js';


let theWorld;
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
    currentTurn = 0;
    let players = [
        new HumanPlayer('Human', 'var(--player1-background)'),
        new ComputerPlayer('AI-1', 'var(--player2-background)'),
        new ComputerPlayer('AI-2', 'var(--player3-background)'),
        new ComputerPlayer('AI-3', 'var(--player4-background)')
      ];

    let desiredRows = document.getElementById('rowsInput').value;
    let desiredColumns = document.getElementById('columnsInput').value;

    theWorld = new HexWorld(desiredColumns, desiredRows, players);

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

    theWorld.worldMap.forEach((row, rowIndex) => {
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
            if (hexagon.hexImprovement == hexImprovementType.NONE){
                if (hexagon.soldierCount > 0){
                    let hexSoldierDiv = document.createElement('div');
                    hexSoldierDiv.classList.add('soldier-div');
                    hexSoldierDiv.innerHTML = hexagon.soldierCount;
                    hexagonDiv.appendChild(hexSoldierDiv);
                }
            }else{
                // Display the improvement
                let hexTypeDiv = document.createElement('div');
                hexTypeDiv.classList.add(hexagon.hexImprovement);
                hexagonDiv.appendChild(hexTypeDiv);
                
                if (hexagon.hexImprovement == hexImprovementType.HOME){
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
            let clickedHex = theWorld.getHex(r, q);
            let localCP = getCurrentPlayer();
            let currentPhase = getCurrentPhase();

            //We'll probably need something here to do nothing if the click isn't coming from the current player
            //right now it's a single player game so if the player is clicking on hexagons while it's the computers turn we don't want anything to happen
            //haven't tested but I'm pretty sure the human player will be able to force the AI player to make moves by clicking around.
            
            switch (currentPhase) {

                case phaseTypes.ATTACKING:
                    // We are in the attacking phase.
                    if (clickedHex.playerOwner == localCP){
                        // We need to highlight/unhighlight the hex to show it is selected or not selected.
                        
                        if (clickedHex.active){
                            // This is the currently selected hex so they're de-selecting it.
                            unsetActiveHex();
                        }else{
                            if (activeHex === null){
                                // There is no active hex so make this one the active hex.
                                setActiveHex(clickedHex);
                            }else{
                                // There is an active hex and it's not the one they clicked so move the soldiers from the active hex to this hex.
                                let localSoldierCount = 0;
                                if (activeHex.hexImprovement == hexImprovementType.HOME){
                                    // There won't be a soldier count. It uses the storage
                                    localSoldierCount = activeHex.playerOwner.storage;
                                    activeHex.playerOwner.zeroOutStorage();
                                }else{
                                    localSoldierCount = activeHex.soldierCount;
                                    activeHex.soldierCount = 0;
                                }
            
                                clickedHex.soldierCount += localSoldierCount;
            
                                // Unset the active hex
                                unsetActiveHex();
                            }
                        }
                    }else if(activeHex !== null && clickedHex.playerOwner === null){

                        // Nobody owns it so take it.
                        // Make sure they can actually move to this hex
                        if (activeHex.distanceTo(clickedHex) == 1){
                            let localSoldierCount = 0;
                            if (activeHex.hexImprovement == hexImprovementType.HOME)
                            {
                                // There won't be a soldier count. It uses the storage
                                localSoldierCount = activeHex.playerOwner.storage;
                                activeHex.playerOwner.zeroOutStorage();
                            }else{
                                localSoldierCount = activeHex.soldierCount;
                                activeHex.soldierCount = 0;
                            }

                            clickedHex.soldierCount = localSoldierCount;
                            clickedHex.playerOwner = localCP;

                            // Unset the active hex
                            unsetActiveHex();
                        }
                    }else if(activeHex !== null && clickedHex.playerOwner !== null){

                        if (activeHex.distanceTo(clickedHex) == 1){
                            // Another player owns the hex so do some attacking math
                            let activeArmy = activeHex.hexImprovement === hexImprovementType.HOME ? activeHex.playerOwner.storage : activeHex.soldierCount;
                            let enemyArmy = clickedHex.hexImprovement === hexImprovementType.HOME ? clickedHex.playerOwner.storage : clickedHex.soldierCount;

                            // This is not the correct way to do this but it's how it's being done right now until I write a method to 'combine' hexegons
                            if (activeArmy > enemyArmy){
                                // The active army wins
                                console.log(`Attcking army Wins.`);
                                let leftOverArmy = activeArmy - enemyArmy;

                                // Clear out attacking
                                if (activeHex.hexImprovement === hexImprovementType.HOME){
                                    // They attacked from their home
                                    activeHex.playerOwner.zeroOutStorage();
                                }else{
                                    activeHex.soldierCount = 0;
                                }

                                let oldOwner = clickedHex.playerOwner
                                let wasHome = clickedHex.hexImprovement === hexImprovementType.HOME;
                                // Now take over the hex
                                clickedHex.playerOwner = localCP;
                                clickedHex.soldierCount = leftOverArmy;
                                clickedHex.hexImprovement = hexImprovementType.NONE;

                                // If it was their home, find them a new one.
                                if (wasHome){
                                    // Their home was attacked
                                    oldOwner.zeroOutStorage();
                                    let playerHexes  = theWorld.findAllHexesForPlayer(oldOwner);
                                    if (playerHexes.length > 0){
                                        // For now randomly select a hex to make the home.
                                        let newHomeHex = playerHexes[Math.floor(Math.random() * playerHexes.length)];
                                        newHomeHex.hexImprovement = hexImprovementType.HOME;
                                        newHomeHex.soldierCount = 0;
                                    }
                                }
                            }else if (activeArmy === enemyArmy){
                                console.log(`Armies Tie.`);
                                // They tied, everyone dies.... ;(
                                if (activeHex.hexImprovement === hexImprovementType.HOME){
                                    activeHex.playerOwner.zeroOutStorage();
                                }else{
                                    activeHex.soldierCount = 0;
                                }
                                
                                if (clickedHex.hexImprovement === hexImprovementType.HOME){
                                    clickedHex.playerOwner.zeroOutStorage();
                                }else{
                                    clickedHex.soldierCount = 0;
                                }
                                
                            }else if (activeArmy < enemyArmy){
                                // The active army dies
                                console.log(`Attcking army loses.`);
                                if (activeHex.hexImprovement === hexImprovementType.HOME){
                                    activeHex.playerOwner.zeroOutStorage();
                                }else{
                                    activeHex.soldierCount = 0;
                                }

                                let leftOverArmy = enemyArmy - activeArmy;
                                if (clickedHex.hexImprovement === hexImprovementType.HOME){
                                    clickedHex.playerOwner.setStorageTo(leftOverArmy);
                                }else{
                                    clickedHex.soldierCount = leftOverArmy;
                                }
                            }
                            
                            unsetActiveHex();
                        }
                    }
                    break;

                case phaseTypes.PLACING:
                    // We are in the placing phase.
                    if (clickedHex.playerOwner == localCP){
                        // We don't want to do anything if the player is clicking on their HOME
                        if (clickedHex.hexImprovement !== hexImprovementType.HOME){
                            if (localCP.storage > 0){
                                // Add one to the hex soldier count.
                                clickedHex.soldierCount++;
                                // Subtract one from the current players storage.
                                localCP.subtractFromStorage();
                            }
                        }
                    }
                    break;
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
    return Math.floor(currentTurn / (theWorld.players.length * 2)) + 1;
}

function getCurrentPhase(){
    let currentPhase = (currentTurn % (theWorld.players.length * 2)) < theWorld.players.length ? 1 : 2;
    
    if (currentPhase === 1){
        return phaseTypes.PLACING;//'Placing';
    }else{
        return phaseTypes.ATTACKING;//'Attacking';
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
    if (getCurrentPhase() === phaseTypes.PLACING){
        let currentPlayer = getCurrentPlayer();
        let addToStorage = 0;
        let subtractFromStorage = 0.0;
    
        theWorld.worldMap.forEach((row) => {
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
    return theWorld.players[getCurrentTurn() % getPlayerCount()];
}

function getPlayerCount(){
    return theWorld.players.length;
}

function increaseCurrentTurn(){
    currentTurn++;
}

function computerPlayerLoop(){
    console.log(`Computer player ${getCurrentPlayer().name} is playing`);
    let currentPlayer = getCurrentPlayer();
    let playerOwnedHexes = theWorld.findAllHexesForPlayer(currentPlayer);
    let maxTurns = 10; // For now a safety mechanism so this loop don't run away wild
    let currentPhase = getCurrentPhase();
    // Depending on the current phase of the game we need to do different things
    switch (currentPhase) {

        case phaseTypes.ATTACKING: 
        console.log(`Computer player ${getCurrentPlayer().name} is attacking`)
        
            while (maxTurns > 0){
                // find a hex owned that has a neighbor with an unowned hex and move the soldiers into it.
                playerOwnedHexes.forEach((hexagon) => {
                    for(let h = 0; h < 6; h++){
                        
                        if ((hexagon.hexImprovement === hexImprovementType.HOME && currentPlayer.storage > 0) || hexagon.soldierCount > 0){
                            let nayb = hexagon.neighbor(h);
                            nayb = theWorld.getHex(nayb.r, nayb.q);
                            
                            if (nayb && nayb.playerOwner == null){
                                // Move soldier from the current hex to this one.
                                let soldierCountToMove = hexagon.hexImprovement === hexImprovementType.HOME ? currentPlayer.storage : hexagon.soldierCount;
                                console.log(`Moving ${soldierCountToMove} from ${hexagon} to ${nayb}`);
                                nayb.soldierCount = soldierCountToMove;
                                nayb.playerOwner = currentPlayer;

                                if (hexagon.hexImprovement === hexImprovementType.HOME){
                                    currentPlayer.zeroOutStorage();
                                }else{
                                    hexagon.soldierCount = 0;
                                }
                            }  
                        }
                    }
                });
                drawWorld();
                maxTurns--;
            }
            break;
        case phaseTypes.PLACING:
            while (currentPlayer.storage > 0 && maxTurns > 0){
                //We will add to each and every hex they own until they run out
                console.log(`Adding soldiers to computer hexes`);
                playerOwnedHexes.forEach((hexagon) => {
                    if (currentPlayer.storage > 0 && hexagon.hexImprovement !== hexImprovementType.HOME)
                    {
                        hexagon.soldierCount++;
                        currentPlayer.subtractFromStorage();
                    }    
                });
                drawWorld();
                maxTurns--;
            }
        break;
    } 

    endCurrentPlayerTurn();
}

//This just clears the gameBoard div
function clearWorld(){
    gameBoard.innerHTML = "";
}

