import { phaseTypes } from '../Types/PhaseType.js';
import { hexImprovementType } from '../Types/HexImprovementType.js';

export class ComputerPlayerAI {
    constructor(world) {
        this.world = world;
    }

    playTurn(currentPlayer, currentPhase) {
        console.log(`Computer player ${currentPlayer.name} is playing`);
        let playerOwnedHexes = this.world.findAllHexesForPlayer(currentPlayer);
        if (currentPhase === phaseTypes.ATTACKING) {
            this.handleAttackingPhase(currentPlayer, playerOwnedHexes);
        } else if (currentPhase === phaseTypes.PURCHASING) {
            this.handlePurchasingPhase(currentPlayer, playerOwnedHexes);
        }
    }

    handleAttackingPhase(currentPlayer, playerOwnedHexes) {
        console.log(`Computer player ${currentPlayer.name} is attacking`);
        playerOwnedHexes.forEach(hexagon => {
            let availableSoldiers = hexagon.hexImprovement === hexImprovementType.HOME ? 
                currentPlayer.storage : hexagon.soldierCount;

            if (availableSoldiers > 0) {
                let adjacentHexes = this.world.getAdjacentHexes(hexagon);
                let enemyHexes = adjacentHexes.filter(hex => hex.playerOwner !== currentPlayer && hex.playerOwner != null);
                let emptyHexes = adjacentHexes.filter(hex => hex.playerOwner == null && !hex.isHole);
                let selfHexes = adjacentHexes.filter(hex => hex.playerOwner === currentPlayer);

                let hexToAttack = this.selectHexToAttack(enemyHexes, emptyHexes, selfHexes);

                if (hexToAttack) {
                    console.log(`Computer player ${currentPlayer.name} is combining ${hexagon} and ${hexToAttack}`);
                    this.world.combineTwoHexagons(hexagon, hexToAttack);
                }
            }
        });
    }

    handlePurchasingPhase(currentPlayer, playerOwnedHexes) {
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
        // First priority: Attack enemy hexes where we can win
        if (enemyHexes.length > 0) {
            console.log(`Attacking enemy hexes`);
            // Find enemy hexes we can defeat
            const winnable = enemyHexes.filter(hex => {
                const enemySoldiers = hex.hexImprovement === hexImprovementType.HOME ? 
                    hex.playerOwner.storage : hex.soldierCount;
                return this.availableSoldiers > enemySoldiers;
            });

            if (winnable.length > 0) {
                // Prioritize enemy home hexes
                const enemyHomes = winnable.filter(hex => hex.hexImprovement === hexImprovementType.HOME);
                if (enemyHomes.length > 0) {
                    return enemyHomes[0];
                }
                // Otherwise attack the weakest enemy hex we can defeat
                return winnable.sort((a, b) => a.soldierCount - b.soldierCount)[0];
            } else {
                // Attack the weakest enemy hex
                return enemyHexes.sort((a, b) => a.soldierCount - b.soldierCount)[0];
            }
        }

        // Second priority: Take empty hexes
        if (emptyHexes.length > 0) {
            console.log(`Taking empty hexes`);
            // Prefer empty hexes that are adjacent to enemy territories
            const strategicEmptyHexes = emptyHexes.filter(hex => 
                this.world.getAdjacentHexes(hex).some(adjacent => 
                    adjacent.playerOwner && adjacent.playerOwner !== this.currentPlayer
                )
            );

            if (strategicEmptyHexes.length > 0) {
                return strategicEmptyHexes[Math.floor(Math.random() * strategicEmptyHexes.length)];
            }
            // Choose a random empty hex instead of always taking the first one
            return emptyHexes[Math.floor(Math.random() * emptyHexes.length)];
        }

        // Last priority: Combine forces with friendly hexes
        if (selfHexes.length > 0) {
            console.log(`Combining forces with friendly hexes`);
            // Prefer combining with hexes that have the fewest soldiers
            return selfHexes.sort((a, b) => a.soldierCount - b.soldierCount)[0];
        }

        return null;
    }
}
