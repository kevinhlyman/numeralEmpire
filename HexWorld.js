import Hex from "./Hex.js";
import { hexImprovementType } from "./Types/HexImprovementType.js";

class HexWorld {
  #worldMap = [];
  #players = [];
  #roundsToPlay = 0;

  constructor(columns, rows, players, roundsToPlay = 0) {
    let desiredRows = rows;
    let desiredColumns = columns;
    let left = 0;
    let right = desiredColumns - 1;
    let top = 0;
    let bottom = desiredRows - 1;

    // Cycle through and make our 'world'
    // I think the for loops will need to change based on the hex type, flat or pointy
    // This is for pointy and odd row indent
    for (let r = top; r <= bottom; r++) {
      /** @type {Hex[]} */
      let row = [];
      let r_offset = Math.floor(r / 2.0);
      for (let q = left - r_offset; q <= right - r_offset; q++) {
        let newHex = new Hex(q, r, -q - r);
        row.push(newHex);
      }
      this.#worldMap.push(row);
    }

    this.#players = players;
    roundsToPlay = roundsToPlay * 1;
    // Figure out how many rounds to play. If rounds to play is 0 then that means ther is no limit.
    if (roundsToPlay !== 0) {
      // What we want is to not set the turn count limit to exactly what the user said.
      // But to instead set it to something random that's relatively close to what they said.
      // This way the player doesn't actually know when the game ends, but does have a general idea.
      // Think kind of like a jack in the box. It could be any turn now....
      let k = Math.ceil(roundsToPlay * 0.1);
      let min = roundsToPlay - k;
      let max = roundsToPlay + k;
      let randomRoundsToPlay =
        Math.floor(Math.random() * (max - min + 1)) + min;
      this.#roundsToPlay = randomRoundsToPlay;
    }

    // This is just baked in and hard coded for now, for 4 players too.
    this.#worldMap[top][left].playerOwner = players[0];
    this.#worldMap[top][left].hexImprovement = hexImprovementType.HOME;

    this.#worldMap[top][right].playerOwner = players[1];
    this.#worldMap[top][right].hexImprovement = hexImprovementType.HOME;

    this.#worldMap[bottom][left].playerOwner = players[2];
    this.#worldMap[bottom][left].hexImprovement = hexImprovementType.HOME;

    this.#worldMap[bottom][right].playerOwner = players[3];
    this.#worldMap[bottom][right].hexImprovement = hexImprovementType.HOME;
  }

  get roundsToPlay() {
    return this.#roundsToPlay;
  }
  get players() {
    return this.#players;
  }

  get worldMap() {
    return this.#worldMap;
  }

  getHex(r, q) {
    let adjustedIndex = q + Math.floor(r / 2.0);
    let hex = this.#worldMap[r] && this.#worldMap[r][adjustedIndex];
    return hex || null;
  }

  playerOwnsANeighboringHexagon(player, hexagon) {
    for (let h = 0; h < 6; h++) {
      let aNeighborHex = hexagon.neighbor(h);
      aNeighborHex = this.getHex(aNeighborHex.r, aNeighborHex.q);
      if (aNeighborHex && aNeighborHex.playerOwner == player) {
        return true;
      }
    }
    return false;
  }

  changeImprovementTypeTo(improvementType, hexagon) {
    hexagon.soldierCount = 0;
    hexagon.hexImprovement = improvementType;
  }

  combineTwoHexagons(attackingHex, defendingHex) {
    let attackingPlayer = attackingHex.playerOwner;
    let defendingPlayer = defendingHex.playerOwner;

    if (attackingPlayer == defendingPlayer) {
      // They're moving soldiers from one of their own hexes to another of their own hexes
      // just combine the soldiers or storage.
      if (defendingHex.hexImprovement === hexImprovementType.HOME) {
        // If they're moving to storage make sure we put it there
        defendingHex.playerOwner.addToStorage(attackingHex.soldierCount);
        attackingHex.soldierCount = 0;
      } else if (attackingHex.hexImprovement === hexImprovementType.HOME) {
        // If they're moving from storage make sure we pull it from there.
        defendingHex.soldierCount += attackingHex.playerOwner.storage;
        attackingHex.playerOwner.zeroOutStorage();
      } else {
        // They're moving from one regular hex to another. Combine soldier counts and clear out any improvements.
        defendingHex.soldierCount += attackingHex.soldierCount;
        defendingHex.hexImprovement = hexImprovementType.NONE;
        attackingHex.soldierCount = 0;
      }
    } else {
      // They are attacking a hexagon they do not own.
      // Get the soldier or storage amounts of each hex.
      let soldiersAttacking =
        attackingHex.hexImprovement === hexImprovementType.HOME
          ? attackingHex.playerOwner.storage
          : attackingHex.soldierCount;
      let soldiersDefending =
        defendingHex.hexImprovement === hexImprovementType.HOME
          ? defendingHex.playerOwner.storage
          : defendingHex.soldierCount;
      let soldiersLeftOver = soldiersAttacking - soldiersDefending;

      if (defendingHex.hexImprovement !== hexImprovementType.NONE) {
        // They're attacking a place with an improvement

        if (defendingHex.hexImprovement === hexImprovementType.HOME) {
          if (soldiersLeftOver > 0) {
            // Attackers won
            defendingHex.playerOwner.zeroOutStorage();
            defendingHex.soldierCount = soldiersLeftOver;
            defendingHex.playerOwner = attackingHex.playerOwner;
            defendingHex.hexImprovement = hexImprovementType.NONE;
            attackingHex.soldierCount = 0;

            // Need to move player home somewhere
            let playerHexes = this.findAllHexesForPlayer(defendingPlayer);
            if (playerHexes.length > 0) {
              // For now randomly select a hex to make the home.
              let newHomeHex =
                playerHexes[Math.floor(Math.random() * playerHexes.length)];
              newHomeHex.hexImprovement = hexImprovementType.HOME;
              newHomeHex.soldierCount = 0;
            }
          } else if (soldiersLeftOver < 0) {
            // Defending won
            attackingHex.soldierCount = 0;
            defendingHex.playerOwner.setStorageTo(-soldiersLeftOver);
          } else {
            // They tied
            attackingHex.soldierCount = 0;
            defendingHex.playerOwner.zeroOutStorage();
          }
        } else {
          // For now we're clearing out anything and just moving in. This will need to change as the Tower gets implemented
          defendingHex.soldierCount = soldiersAttacking;
          defendingHex.playerOwner = attackingPlayer;
          defendingHex.hexImprovement = hexImprovementType.NONE;
          attackingHex.soldierCount = 0;
        }
      } else {
        if (soldiersLeftOver > 0) {
          // Attackers won
          if (attackingHex.hexImprovement === hexImprovementType.HOME) {
            attackingHex.playerOwner.zeroOutStorage();
          } else {
            attackingHex.soldierCount = 0;
          }
          defendingHex.soldierCount = soldiersLeftOver;
          defendingHex.playerOwner = attackingHex.playerOwner;
        } else if (soldiersLeftOver < 0) {
          // Defending won
          if (attackingHex.hexImprovement === hexImprovementType.HOME) {
            attackingHex.playerOwner.zeroOutStorage();
          } else {
            attackingHex.soldierCount = 0;
          }
          defendingHex.soldierCount = -soldiersLeftOver;
        } else {
          // They tied
          if (attackingHex.hexImprovement === hexImprovementType.HOME) {
            attackingHex.playerOwner.zeroOutStorage();
          } else {
            attackingHex.soldierCount = 0;
          }
          defendingHex.soldierCount = 0;
        }
      }
    }
  }

  /**
   * This function takes a player and returns a list of hexes they own.
   *
   * @param {Player} player The player whos hexes we want to know.
   * @returns {Hex[]} An array of Hex tiles owned by the player.
   */
  findAllHexesForPlayer(player) {
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

    getAdjacentHexes(hexagon) {
        let adjacentHexes = [];
        // Check all 6 directions
        for (let direction = 0; direction < 6; direction++) {
            let neighborHex = hexagon.neighbor(direction);
            let hex = this.getHex(neighborHex.r, neighborHex.q);
            if (hex) {
                adjacentHexes.push(hex);
            }
        }
        return adjacentHexes;
    }
}

export default HexWorld;
