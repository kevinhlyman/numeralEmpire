class Hex {
    constructor(q, r, s ){
        if (q + r + s !== 0){
            throw new Error("Invalid coordinates.");
        }

        this.q = q;
        this.r = r;
        this.s = s; // RedBlobGames says you can calculate this as -q-r. If you leave this out then it's called Axial Coordinates instead of Cube Coordinates
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
    // Directions are from 0 to 5
    neighbor(direction) {
        const hexDirections = [
            new Hex(1, -1, 0), new Hex(1, 0, -1), new Hex(0, 1, -1),
            new Hex(-1, 1, 0), new Hex(-1, 0, 1), new Hex(0, -1, 1)
        ];

        return this.add(hexDirections[direction]);
    }

    // String representation of the Hex
    toString() {
        return `Hex: q:${this.q}, r:${this.r}, s:${this.s}`;
    }
}

// Export the class
export default Hex;