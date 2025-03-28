import { phaseTypes } from '../Types/PhaseType.js';
import { HumanPlayer, ComputerPlayer } from '../Player.js';

export class GameState {
    constructor(players = []) {
        this.currentTurn = 0;
        this.players = players;
        this.gameOver = false;
        this.gameOverMessage = '';
        this.activeHex = null;
    }

    getCurrentTurn() {
        return this.currentTurn;
    }

    getCurrentRound() {
        return Math.floor(this.currentTurn / (this.getPlayerCount() * 2)) + 1;
    }

    getCurrentPhase() {
        let currentPhase = (this.currentTurn % (this.getPlayerCount() * 2)) < this.getPlayerCount() ? 1 : 2;
        return currentPhase === 1 ? phaseTypes.PURCHASING : phaseTypes.ATTACKING;
    }

    isPurchasingPhase() {
        return this.getCurrentPhase() === phaseTypes.PURCHASING;
    }

    isAttackingPhase() {
        return this.getCurrentPhase() === phaseTypes.ATTACKING;
    }

    increaseCurrentTurn() {
        this.currentTurn++;
    }

    getCurrentPlayer() {
        return this.players[this.currentTurn % this.getPlayerCount()];
    }

    getPlayerCount() {
        return this.players.length;
    }

    setPlayers(players) {
        this.players = players;
    }

    isComputerPlayer() {
        return this.getCurrentPlayer() instanceof ComputerPlayer;
    }

    isHumanPlayer() {
        return this.getCurrentPlayer() instanceof HumanPlayer;
    }

    findPlayerByName(name) {
        return this.players.find(player => player.name === name);
    }

    checkForGameOver(world) {
        let hexCount = 0;
        let playerOwnedHexCount = 0;

        // Check if we've hit the rounds limit
        if (world.roundsToPlay > 0 && this.getCurrentRound() >= world.roundsToPlay) {
            this.gameOver = true;
            // Track total soldiers for each player
            let playerSoldiers = new Map();
            
            // Initialize soldier count for each player (including storage)
            this.players.forEach(player => {
                playerSoldiers.set(player, player.storage);
            });

            // Add up all soldiers from hexes for each player
            world.worldMap.forEach((row) => {
                row.forEach((hexagon) => {
                    if (hexagon.playerOwner) {
                        let currentCount = playerSoldiers.get(hexagon.playerOwner);
                        playerSoldiers.set(hexagon.playerOwner, currentCount + hexagon.soldierCount);
                    }
                });
            });

            // Find player(s) with most total soldiers
            let maxSoldiers = 0;
            let winningPlayers = [];
            playerSoldiers.forEach((totalSoldiers, player) => {
                if (totalSoldiers > maxSoldiers) {
                    maxSoldiers = totalSoldiers;
                    winningPlayers = [player];
                } else if (totalSoldiers === maxSoldiers) {
                    winningPlayers.push(player);
                }
            });
            
            if (winningPlayers.length > 1) {
                const playerNames = winningPlayers.map(p => p.name).join(', ');
                this.gameOverMessage = `Tie between ${playerNames}!`;
            } else {
                this.gameOverMessage = `${winningPlayers[0].name} Wins!`;
            }
            return true;
        }

        // Existing win condition checks
        world.worldMap.forEach((row) => {
            row.forEach((hexagon) => {
                hexCount++;
                if (hexagon.playerOwner instanceof HumanPlayer) {
                    playerOwnedHexCount++;
                }
            });
        });

        console.log('HexCount', hexCount);
        console.log('PlayerOwnedHexCount', playerOwnedHexCount);
        if (hexCount === playerOwnedHexCount) {
            this.gameOver = true;
            this.gameOverMessage = "Human Wins!";
        }

        if (playerOwnedHexCount === 0) {
            this.gameOver = true;
            this.gameOverMessage = "Human Loses.";
        }

        return this.gameOver;
    }

    isGameOver() {
        return this.gameOver;
    }

    getGameOverMessage() {
        return this.gameOverMessage;
    }

    setActiveHex(hexagon) {
        if (hexagon) {
            hexagon.active = true;
            this.activeHex = hexagon;
        }
    }

    unsetActiveHex() {
        if (this.activeHex) {
            this.activeHex.active = false;
            this.activeHex = null;
        }
    }

    getActiveHex() {
        return this.activeHex;
    }
}
