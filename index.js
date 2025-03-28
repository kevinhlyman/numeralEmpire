import { hexImprovementType } from './Types/HexImprovementType.js';
import { hexImprovementData } from './Data/HexImprovementData.js';
import { HumanPlayer, ComputerPlayer } from './Player.js';
import HexWorld from './HexWorld.js';
import { WorldRenderer } from './WorldRenderer.js';
import { GameState } from './modules/GameState.js';
import { ComputerPlayerAI } from './modules/ComputerPlayerAI.js';

let theWorld;
let gameState = new GameState();
let worldRenderer;
let computerAI;

document.addEventListener("DOMContentLoaded", function () {
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
let selectedImprovementType = null;

// Modify the building board click handlers
buildingBoardElements.forEach(element => element.addEventListener('click', function(event){
    if (gameState.isPurchasingPhase()) {
        // Remove selected class from all buildings
        buildingBoardElements.forEach(el => el.classList.remove('selected'));
        
        // If clicking the already selected building, deselect it
        if (selectedImprovementType === event.currentTarget.getAttribute("data-improvement-type")) {
            selectedImprovementType = null;
        } else {
            // Select the new building
            selectedImprovementType = event.currentTarget.getAttribute("data-improvement-type");
            event.currentTarget.classList.add('selected');
        }
    }
}));
const closeModalButton = document.getElementById('closeGameOverModal');
closeModalButton.addEventListener('click',function(){
    let gameOverModal = document.getElementById('gameOverModal');
    gameOverModal.style.display = 'none';
});

//Create a new array of arrays based off of the what the user set in the menu fields
function createWorld() {
    let players = [
        new HumanPlayer('Human', 'var(--player1-background)'),
        new ComputerPlayer('AI-1', 'var(--player2-background)'),
        new ComputerPlayer('AI-2', 'var(--player3-background)'),
        new ComputerPlayer('AI-3', 'var(--player4-background)')
    ];

    gameState = new GameState();
    gameState.setPlayers(players);

    let desiredRows = document.getElementById('rowsInput').value;
    let desiredColumns = document.getElementById('columnsInput').value;
    let roundsToPlay = document.getElementById('roundsInput').value;

    theWorld = new HexWorld(desiredColumns, desiredRows, players, roundsToPlay);
    computerAI = new ComputerPlayerAI(theWorld);
    worldRenderer = new WorldRenderer(gameBoard);

    displayCurrentPlayer();
    calculateCurrentPlayerStorage();
    displayCurrentTurn();
    displayCurrentRound();
    displayCurrentPhase();
    drawWorld();
    toggleMenu();
}

//Draw a new map based on what is in the wordMap array
function drawWorld() {
    worldRenderer.drawWorld(theWorld, gameState.getActiveHex());
    addEventListenersToHexes();
}

// Add the event listeners to the hexes of the world.
function addEventListenersToHexes() {
    const hexes = document.querySelectorAll('.hexagon');
    hexes.forEach((div) => {
        div.addEventListener('click', function() {
            let q = +this.getAttribute('q');
            let r = +this.getAttribute('r');
            let clickedHex = theWorld.getHex(r, q);
            let localCP = getCurrentPlayer();
            
            if (gameState.isAttackingPhase()) {
                // We are in teh attacking phase.
                let activeHex = gameState.getActiveHex();
                if (activeHex == null) {
                    // Only allow selecting hexes that haven't moved this turn
                    if (clickedHex.playerOwner == localCP && !clickedHex.hasMovedThisTurn) {
                        gameState.setActiveHex(clickedHex);
                    }
                } else {
                    if (activeHex != clickedHex) {
                        if (activeHex.distanceTo(clickedHex) <= 1) {
                            theWorld.combineTwoHexagons(activeHex, clickedHex);
                        }
                    }
                    gameState.unsetActiveHex();
                }
            } else if (gameState.isPurchasingPhase()) {
                // We are in the purchasing phase.
                if (clickedHex.playerOwner == localCP) {
                    if (selectedImprovementType) {
                        // Try to place the building
                        let improvementPrice = hexImprovementData[selectedImprovementType].price;
                        if (localCP.storage >= improvementPrice && clickedHex.hexImprovement === hexImprovementType.NONE) {
                            theWorld.changeImprovementTypeTo(selectedImprovementType, clickedHex);
                            localCP.subtractFromStorage(improvementPrice);
                            // Remove selected class from the building that was just placed
                            buildingBoardElements.forEach(el => el.classList.remove('selected'));
                            selectedImprovementType = null; // Reset selection after placement
                        }
                    } else if (clickedHex.hexImprovement === hexImprovementType.NONE) {
                        // Handle soldier placement (existing logic)
                        if (localCP.storage > 0) {
                            clickedHex.soldierCount++;
                            localCP.subtractFromStorage();
                        }
                    }
                }
            }
            drawWorld();
        });
    });
}

// Change the current player display to show the active current player.
function displayCurrentPlayer(){
    let pdiv = document.getElementById('currentPlayer');
    pdiv.innerHTML = gameState.getCurrentPlayer().name;
    pdiv.style.backgroundColor = gameState.getCurrentPlayer().color;
}

// Get the current phase by doing math with the current turn and amount of players.
function getCurrentPhase() {
    return gameState.getCurrentPhase();
}

// Update the display of the current turn.
function displayCurrentTurn() {
    let tdiv = document.getElementById('currentTurn');
    tdiv.innerHTML = gameState.getCurrentTurn();
}

// Update the display of the current round.
function displayCurrentRound() {
    let rdiv = document.getElementById('currentRound');
    rdiv.innerHTML = gameState.getCurrentRound();
}

// Update the display of the current phase. 
function displayCurrentPhase() {
    let phdiv = document.getElementById('currentPhase');
    phdiv.innerHTML = gameState.getCurrentPhase();
}

// Update the current players storage based on hexes owned, hex upgrades, and soldier count.
function calculateCurrentPlayerStorage() {
    // We only do this on the Purchasing phase
    if (gameState.isPurchasingPhase()) {
        let currentPlayer = getCurrentPlayer();
        let addToStorage = 0;
        let subtractFromStorage = 0.0;
    
        theWorld.worldMap.forEach((row) => {
            row.forEach((hexagon) => {
                if (hexagon.playerOwner == currentPlayer) {
                    let modifier = hexImprovementData[hexagon.hexImprovement].modifier;
                    addToStorage += modifier;
                    if (hexagon.soldierCount > 0) {
                        subtractFromStorage += hexagon.soldierCount / 2.0;
                    }
                }
            });
        });
    
        currentPlayer.addToStorage(addToStorage);
        currentPlayer.subtractFromStorage(Math.floor(subtractFromStorage));
    }
}

// End the current players turn and update a bunch of stuff.
function endCurrentPlayerTurn() {
    // Unset any selected hex before changing turns
    gameState.unsetActiveHex();

    if (gameState.checkForGameOver(theWorld)) {
        displayGameOver();
    } else {
        console.log(`Ending player ${gameState.getCurrentPlayer().name} turn`);
        gameState.increaseCurrentTurn();
        
        // If we're entering the attacking phase for a player, reset their movement
        if (gameState.isAttackingPhase()) {
            theWorld.resetMovementForPlayer(gameState.getCurrentPlayer());
        }
        
        displayCurrentPlayer();
        displayCurrentTurn();
        displayCurrentRound();
        displayCurrentPhase();
        calculateCurrentPlayerStorage();
        drawWorld();

        if (gameState.isComputerPlayer()) {
            setTimeout(function() {
                computerPlayerLoop();
            }, 1000);
        }
    }
}

function displayGameOver() {
    let gameOverModal = document.getElementById('gameOverModal');
    let gameOverMessage = document.getElementById('gameOverMessage');
    gameOverMessage.innerHTML = gameState.getGameOverMessage();
    gameOverModal.style.display = 'block';
}

// Get the player who's turn it currently is.
function getCurrentPlayer() {
    return gameState.getCurrentPlayer();
}

// The player loop for the current computer player.
function computerPlayerLoop() {
    computerAI.playTurn(getCurrentPlayer(), getCurrentPhase());
    drawWorld();
    endCurrentPlayerTurn();
}

// Hide or show the Menu based on if it's hidden or shown already.
function toggleMenu() {
  let m = document.getElementById("creationMenu");
  m.classList.toggle("hide");
}
