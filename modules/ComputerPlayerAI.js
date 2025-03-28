import { phaseTypes } from '../Types/PhaseType.js';
import { hexImprovementType } from '../Types/HexImprovementType.js';

export class ComputerPlayerAI {
    constructor(world) {
        this.world = world;
    }

    playTurn(currentPlayer, currentPhase) {
        console.log(`Computer player ${currentPlayer.name} is playing`);
        let playerOwnedHexes = this.world.findAllHexesForPlayer(currentPlayer);
        console.log('player owned hexes', playerOwnedHexes);
        if (currentPhase === phaseTypes.ATTACKING) {
            this.handleAttackingPhase(currentPlayer, playerOwnedHexes);
        } else if (currentPhase === phaseTypes.PLACING) {
            this.handlePlacingPhase(currentPlayer, playerOwnedHexes);
        }
    }

    handleAttackingPhase(currentPlayer, playerOwnedHexes) {
        console.log(`Computer player ${currentPlayer.name} is attacking`);
        playerOwnedHexes.forEach(hexagon => {
            let availableSoldiers = hexagon.hexImprovement === hexImprovementType.HOME ? 
                currentPlayer.storage : hexagon.soldierCount;

            if (availableSoldiers > 0) {
                let adjacentHexes = this.world.getAdjacentHexes(hexagon);
                let enemyHexes = adjacentHexes.filter(hex => hex.playerOwner !== currentPlayer);
                let emptyHexes = adjacentHexes.filter(hex => hex.playerOwner === null);
                let selfHexes = adjacentHexes.filter(hex => hex.playerOwner === currentPlayer);

                let hexToAttack = this.selectHexToAttack(enemyHexes, emptyHexes, selfHexes);

                if (hexToAttack) {
                    console.log(`Computer player ${currentPlayer.name} is combining ${hexagon} and ${hexToAttack}`);
                    this.world.combineTwoHexagons(hexagon, hexToAttack);
                }
            }
        });
    }

    handlePlacingPhase(currentPlayer, playerOwnedHexes) {
        while (currentPlayer.storage > 0 && playerOwnedHexes.length > 1) {
            console.log(`Adding soldiers to computer hexes`);
            console.log(`CurrentPlayer Storage:${currentPlayer.storage}`);
            
            playerOwnedHexes.forEach(hexagon => {
                if (currentPlayer.storage > 0 && hexagon.hexImprovement !== hexImprovementType.HOME) {
                    hexagon.soldierCount++;
                    currentPlayer.subtractFromStorage();
                }
            });
        }
    }

    selectHexToAttack(enemyHexes, emptyHexes, selfHexes) {
        if (enemyHexes.length > 0) {
            return enemyHexes[Math.floor(Math.random() * enemyHexes.length)];
        }
        if (emptyHexes.length > 0) {
            return emptyHexes[Math.floor(Math.random() * emptyHexes.length)];
        }
        if (selfHexes.length > 0) {
            return selfHexes[Math.floor(Math.random() * selfHexes.length)];
        }
        return null;
    }
}
