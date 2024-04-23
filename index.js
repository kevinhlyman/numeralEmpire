import Hex from './Hex.js';
import { hexTerrainType } from './Types/HexTerrainType.js';
import { hexImprovementType } from './Types/HexImprovementType.js';
import { hexImprovementData } from './Data/HexImprovementData.js';
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
const toggleCreateMenu = document.getElementById('creationMenuToggle');
toggleCreateMenu.addEventListener('click',toggleMenu)
const buildingBoardElements = document.querySelectorAll('.purchase-square');
buildingBoardElements.forEach(element => element.addEventListener('click', function(event){
    addBuildingToBoard(event.currentTarget.getAttribute("data-improvement-type"), activeHex);
}));

function addBuildingToBoard(improvementType, hexagon){
    if (hexagon == null){
        return;
    }
    
    if (Object.values(hexImprovementType).includes(improvementType)){
        let currentPlayer = getCurrentPlayer();
        let availableMoney = currentPlayer.storage;
        let improvementPrice = hexImprovementData[improvementType].price;

        if (availableMoney >= improvementPrice){
            theWorld.changeImprovementTypeTo(improvementType, activeHex);
            currentPlayer.subtractFromStorage(improvementPrice);
            unsetActiveHex();
            drawWorld();
        }
    }
}


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
    toggleMenu();
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
                hexTypeDiv.classList.add(`hexagon-improvement`);
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
                    // They might simply be clicking to make a hex active
                    if (activeHex == null){
                        // There is no active hex so let's see if we can make this one the active hex
                        if (clickedHex.playerOwner == localCP){
                            setActiveHex(clickedHex);
                        }

                    }else{
                        // Active hex is not null so they're either deselecting the active hex or they're trying to send soldiers somewhere.
                        if (activeHex != clickedHex){
                            // For now you can only attack a hexagon that's right next to the one you're attacking from
                            if (activeHex.distanceTo(clickedHex) <= 1){
                                theWorld.combineTwoHexagons(activeHex, clickedHex);
                            }
                        }
                        unsetActiveHex();
                    }
                    break;

                case phaseTypes.PLACING:
                    // We are in the placing phase.
                    if (clickedHex.playerOwner == localCP){
                        // We can only add soldiers to hexagons without an improvement...for now
                        if (clickedHex.hexImprovement === hexImprovementType.NONE){
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
                    let modifier = hexImprovementData[hexagon.hexImprovement].modifier;
                    addToStorage += modifier;
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
    let currentPhase = getCurrentPhase();

    // Depending on the current phase of the game we need to do different things
    switch (currentPhase) {

        case phaseTypes.ATTACKING: 
        console.log(`Computer player ${getCurrentPlayer().name} is attacking`);
        
            // Find an owned hex with soldiers in it and do something.
            playerOwnedHexes.forEach((hexagon) => {
                // If this hexagon has soldiers then we'll move it, other wise move on.
                if ((hexagon.hexImprovement === hexImprovementType.HOME && currentPlayer.storage > 0) || hexagon.soldierCount > 0){
                    // Look a the neighbors and see if one of them is owned by another player
                    let enemyHexes = [];
                    let emptyHexes = [];
                    let selfHexes = [];

                    // Look at the neighbors of the hex and put it into one of the arrays for later
                    for(let h = 0; h < 6; h++){
                        let nayb = hexagon.neighbor(h);
                        nayb = theWorld.getHex(nayb.r, nayb.q);
                        if (nayb != null) {
                            if (nayb.playerOwner == null){
                                emptyHexes.push(nayb);
                            }else if (nayb.playerOwner == currentPlayer){
                                selfHexes.push(nayb);
                            }else{
                                enemyHexes.push(nayb);
                            }
                        }
                    }

                    // CPUs are aggressive and will always choose to attack an enemy, then attack an empty, then move into their own
                    // Randomly choose a hex to attack based on the priority, the priority doesn't actually exist yet and is just the order of the if else statements
                    let hexToAttack;
                    if (enemyHexes.length > 0){
                        hexToAttack = enemyHexes[Math.floor(Math.random() * enemyHexes.length)];
                    }else if (emptyHexes.length > 0){
                        hexToAttack = emptyHexes[Math.floor(Math.random() * emptyHexes.length)];
                    }else if (selfHexes.length > 0){
                        hexToAttack = selfHexes[Math.floor(Math.random() * selfHexes.length)];
                    }

                    if (hexToAttack){
                        console.log(`Computer player ${getCurrentPlayer().name} is combining ${hexagon} and ${hexToAttack}`);
                        theWorld.combineTwoHexagons(hexagon,hexToAttack);
                    }
                }
            });
            drawWorld();

            break;
        case phaseTypes.PLACING:
            while (currentPlayer.storage > 0 && playerOwnedHexes.length > 1){

                //We will add to each and every hex they own until they run out
                console.log(`Adding soldiers to computer hexes`);
                console.log(`CurrentPlayer Storage:${currentPlayer.storage}`);
                playerOwnedHexes.forEach((hexagon) => {
                    if (currentPlayer.storage > 0 && hexagon.hexImprovement !== hexImprovementType.HOME)
                    {
                        hexagon.soldierCount++;
                        currentPlayer.subtractFromStorage();
                    }    
                });
                drawWorld();
            }
        break;
    } 

    endCurrentPlayerTurn();
}

// This just clears the gameBoard div.
function clearWorld(){
    gameBoard.innerHTML = "";
}

function toggleMenu(){
    let m = document.getElementById('creationMenu');
    m.classList.toggle("hide");
}


