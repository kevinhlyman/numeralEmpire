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
        return currentPhase === 1 ? phaseTypes.PLACING : phaseTypes.ATTACKING;
    }

    isPlacingPhase() {
        return this.getCurrentPhase() === phaseTypes.PLACING;
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

        world.worldMap.forEach((row) => {
            row.forEach((hexagon) => {
                hexCount++;
                if (hexagon.playerOwner instanceof HumanPlayer) {
                    playerOwnedHexCount++;
                }
            });
        });

        if (hexCount === playerOwnedHexCount) {
            this.gameOver = true;
            this.gameOverMessage = "You Win!";
        }

        if (playerOwnedHexCount === 0) {
            this.gameOver = true;
            this.gameOverMessage = "You Lose.";
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
