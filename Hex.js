import {hexTypes} from './Types/HexType.js';
class Hex {
    #active = false;
    #hexType = hexTypes.BASIC;
    playerOwner = null;
    soldierCount = 0;

    constructor(q, r, s ){
        if (q + r + s !== 0){
            throw new Error("Invalid coordinates.");
        }

        this.q = q;
        this.r = r;
        this.s = s; // RedBlobGames says you can calculate this as -q-r. If you leave this out then it's called Axial Coordinates instead of Cube Coordinates.
    }

    get active(){
        return this.#active;
    }

    // Setter for active
    /**
     * @param {boolean} newActive
     */
    set active(newActive){
        this.#active = newActive
    }

    get hexType(){
        //console.log(`Returning HexType of ${this.#hexType}`)
        return this.#hexType;
    }

    set hexType(hexType){
        //console.log(`Setting HexType to ${hexType}`);
        this.#hexType = hexType;//probably should do some type checking here to make sure it's actually a valid hexType.
    }

    // Add another Hex to this one
    add(other) {
        return new Hex(this.q + other.q, this.r + other.r, this.s + other.s);
    }

    // Find the distance to another hex
    distanceTo(other) {
        return (Math.abs(this.q - other.q) + Math.abs(this.r - other.r) + Math.abs(this.s - other.s)) / 2;
    }

    // Find the neighboring hex in a specific direction
    // Directions are from 0 to 5 starting at the 1 O'Clock position
    neighbor(direction) {
        const hexDirections = [
            new Hex(1, -1, 0), new Hex(1, 0, -1), new Hex(0, 1, -1),
            new Hex(-1, 1, 0), new Hex(-1, 0, 1), new Hex(0, -1, 1)
        ];

        return this.add(hexDirections[direction]);
    }

    // String representation of the Hex
    toString() {
        return `q:${this.q}, r:${this.r}, s:${this.s}`;
    }
}

// Export the class
export default Hex;