import Hex from './Hex.js';
import { hexImprovementType } from './Types/HexImprovementType.js';

class HexWorld{
    #worldMap = [];
    #players = [];

    constructor(columns, rows, players){
        let desiredRows = rows;
        let desiredColumns = columns;
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
            this.#worldMap.push(row);
        }

        this.#players = players;

        // This is just baked in and hard coded for now, for 4 players too.
        this.#worldMap[top][left].playerOwner = players[0];
        this.#worldMap[top][left].hexImprovement = hexImprovementType.HOME;

        this.#worldMap[top][right].playerOwner = players[1];
        this.#worldMap[top][right].hexImprovement = hexImprovementType.HOME;

        this.#worldMap[bottom][left].playerOwner = players[2];
        this.#worldMap[bottom][left].hexImprovement = hexImprovementType.HOME;

        this.#worldMap[bottom][right].playerOwner = players[3];
        this.#worldMap[bottom][right].hexImprovement = hexImprovementType.HOME;

        // For testing hex types
        this.#worldMap[0][1].playerOwner = players[0];
        this.#worldMap[0][1].hexImprovement = hexImprovementType.FARM;
        this.#worldMap[0][2].playerOwner = players[0];
        this.#worldMap[0][2].hexImprovement = hexImprovementType.MARKET;
        this.#worldMap[0][3].playerOwner = players[0];
        this.#worldMap[0][3].hexImprovement = hexImprovementType.BANK;
        this.#worldMap[0][4].playerOwner = players[0];
        this.#worldMap[0][4].hexImprovement = hexImprovementType.HIGHRISE;
        this.#worldMap[0][5].playerOwner = players[0];
        this.#worldMap[0][5].hexImprovement = hexImprovementType.TOWER;
    }

    get players(){
        return this.#players;
    }

    get worldMap(){
        return this.#worldMap;
    }

    getHex(r, q){
        let adjustedIndex = q + Math.floor(r / 2.0);
        let hex = this.#worldMap[r] && this.#worldMap[r][adjustedIndex];
        return hex || null;
    }

    playerOwnsANeighboringHexagon(player, hexagon){
        for(let h = 0; h < 6; h++){
            let aNeighborHex = hexagon.neighbor(h);
            aNeighborHex = this.getHex(aNeighborHex.r, aNeighborHex.q);
            if (aNeighborHex && aNeighborHex.playerOwner == player){
                return true;
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
    findAllHexesForPlayer(player){
        // I think later on we'll probably want to just keep track of this as things go instead of trying to calculate it every time.

        // For now just loop through the world 1 by 1 and find all the hexes that belong to this player.
        let playerHexes = [];
        // This is a definite place for optimization
        this.#worldMap.forEach((row) => {
            row.forEach((hexagon) => {
                if (hexagon.playerOwner == player){
                    playerHexes.push(hexagon);
                }
            });
        });
        return playerHexes;
    }
}

export default HexWorld;