import Hex from './Hex.js';
import { hexTypes } from './Types/HexType.js';

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
        this.#worldMap[top][left].hexType = hexTypes.HOME;

        this.#worldMap[top][right].playerOwner = players[1];
        this.#worldMap[top][right].hexType = hexTypes.HOME;

        this.#worldMap[bottom][left].playerOwner = players[2];
        this.#worldMap[bottom][left].hexType = hexTypes.HOME;

        this.#worldMap[bottom][right].playerOwner = players[3];
        this.#worldMap[bottom][right].hexType = hexTypes.HOME;
    }

    get players(){
        return this.#players;
    }

    get worldMap(){
        return this.#worldMap;
    }
}

export default HexWorld;