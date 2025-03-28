import { hexImprovementType } from './Types/HexImprovementType.js';
import { HumanPlayer } from './Player.js';

export class WorldRenderer {
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
    }

    drawWorld(theWorld, activeHex) {
        this.clearWorld();
        this.drawPointyWorld(theWorld, activeHex);
    }

    drawPointyWorld(theWorld, activeHex) {
        let displayCoords = document.getElementById('includeCoords').checked;

        theWorld.worldMap.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('row-pointy');
            if (rowIndex % 2) {
                rowDiv.classList.add('row-pointy-odd');
            }
            row.forEach((hexagon, columnIndex) => {
                const hexagonDiv = document.createElement('div');
                hexagonDiv.classList.add('hexagon');
                hexagonDiv.classList.add('hexagon-pointy');
                if (hexagon === activeHex) { hexagonDiv.classList.add('hexagon-selected'); }
                hexagonDiv.setAttribute('q', hexagon.q);
                hexagonDiv.setAttribute('r', hexagon.r);
                hexagonDiv.setAttribute('s', hexagon.s);
                hexagonDiv.setAttribute('rowIndex', rowIndex);
                hexagonDiv.setAttribute('columnIndex', columnIndex);
                if (hexagon.playerOwner) { hexagonDiv.style.backgroundColor = hexagon.playerOwner.color; }
                if (displayCoords) { hexagonDiv.innerHTML = `<div class="hex-info">${hexagon.toString()}</div>`; }
                if (hexagon.hexImprovement == hexImprovementType.NONE) {
                    if (hexagon.soldierCount > 0) {
                        let hexSoldierDiv = document.createElement('div');
                        hexSoldierDiv.classList.add('soldier-div');
                        hexSoldierDiv.innerHTML = hexagon.soldierCount;
                        hexagonDiv.appendChild(hexSoldierDiv);
                    }
                } else {
                    // Display the improvement
                    let hexTypeDiv = document.createElement('div');
                    hexTypeDiv.classList.add(`hexagon-improvement`);
                    hexTypeDiv.classList.add(hexagon.hexImprovement);
                    hexagonDiv.appendChild(hexTypeDiv);

                    if (hexagon.hexImprovement == hexImprovementType.HOME) {
                        //Then we want to show the 'storage' here
                        let hexSoldierDiv = document.createElement('div');
                        hexSoldierDiv.classList.add('soldier-div');
                        hexSoldierDiv.innerHTML = hexagon.playerOwner.storage;
                        hexagonDiv.appendChild(hexSoldierDiv);
                    }
                }

                rowDiv.appendChild(hexagonDiv);
            });

            this.gameBoard.appendChild(rowDiv);
        });
    }

    clearWorld() {
        this.gameBoard.innerHTML = "";
    }
}