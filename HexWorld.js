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
    let middle = Math.floor(desiredColumns / 2.0);
    let center = Math.floor(desiredRows / 2.0);

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
    this.#roundsToPlay = this.calculateRoundsToPlay(roundsToPlay);

    // Define starting positions based on number of players
    let startingPositions;
    switch (players.length) {
      case 2:
        startingPositions = [
          { r: top, q: left },      // Player 1 (Human)
          { r: bottom, q: right },   // Player 2 (opposite corner)
        ];
        break;
      case 3:
        startingPositions = [
          { r: top, q: left },      // Player 1
          { r: bottom, q: right },   // Player 2
          { r: top, q: right },      // Player 3
        ];
        break;
      case 4:
        startingPositions = [
          { r: top, q: left },      // Player 1
          { r: top, q: right },     // Player 2
          { r: bottom, q: left },   // Player 3
          { r: bottom, q: right },  // Player 4
        ];
        break;
      case 5:
        startingPositions = [
          { r: top, q: left },      // Player 1
          { r: top, q: right },     // Player 2
          { r: bottom, q: left },   // Player 3
          { r: bottom, q: right },  // Player 4
          { r: center, q: middle }, // Player 5
        ];
        break;
      case 6:
        startingPositions = [
          { r: top, q: left },      // Player 1
          { r: top, q: right },     // Player 2
          { r: center, q: left },   // Player 3
          { r: center, q: right },  // Player 4
          { r: bottom, q: left },   // Player 5
          { r: bottom, q: right },  // Player 6
        ];
        break;
      case 7:
        startingPositions = [
          { r: top, q: left },      // Player 1
          { r: top, q: right },     // Player 2
          { r: center, q: left },   // Player 3
          { r: center, q: right },  // Player 4
          { r: bottom, q: left },   // Player 5
          { r: bottom, q: right },  // Player 6
          { r: center, q: middle }, // Player 7
        ];
        break;
    }

    // Assign starting positions
    players.forEach((player, index) => {
      const pos = startingPositions[index];
      console.log(`player${index + 1}`, `${pos.r}, ${pos.q}`);
      console.log(index);
      
      // Assign the main home hex
      this.#worldMap[pos.r][pos.q].playerOwner = player;
      this.#worldMap[pos.r][pos.q].hexImprovement = hexImprovementType.HOME;
      
      // Add two adjacent hexes for each player
      // Get adjacent hexes and assign the first two valid ones to the player
      const mainHex = this.#worldMap[pos.r][pos.q];
      const adjacentHexes = this.getAdjacentHexes(mainHex);
      let assignedCount = 0;
      
      for (let i = 0; i < adjacentHexes.length && assignedCount < 2; i++) {
        const adjHex = adjacentHexes[i];
        // Only assign if the hex isn't already owned by another player
        if (!adjHex.playerOwner) {
          adjHex.playerOwner = player;
          //adjHex.soldierCount = 1; // Start with 1 soldier in each adjacent hex
          assignedCount++;
        }
      }
    });

    // Create some holes
    // We'll make this user configurable later
    const holeCount = Math.floor(desiredRows * desiredColumns * 0.1);
    console.log('holeCount', holeCount);
    for (let i = 0; i < holeCount; i++) {
      let r = Math.floor(Math.random() * desiredRows);
      let q = Math.floor(Math.random() * desiredColumns);
      let hex = this.#worldMap[r][q];
      if (hex.playerOwner) {
        continue; // Skip if the hex is owned by a player
      }
      hex.isHole = true;
    }
  }

  calculateRoundsToPlay(roundsToPlay) {
    roundsToPlay = parseInt(roundsToPlay);
    if (roundsToPlay === 0) {
      return 0; // No limit
    }
    // What we want is to not set the turn count limit to exactly what the user said.
    // But to instead set it to something random that's relatively close to what they said.
    // This way the player doesn't actually know when the game ends, but does have a general idea.
    // Think kind of like a jack in the box. It could be any turn now....
    let k = Math.ceil(roundsToPlay * 0.1);
    let min = roundsToPlay - k;
    let max = roundsToPlay + k;
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    // Only clear soldiers for non-tower improvements
    if (improvementType !== hexImprovementType.TOWER) {
      hexagon.soldierCount = 0;
    }
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
        let initialDefendingSoldierCount = defendingHex.soldierCount;
        defendingHex.soldierCount += attackingHex.playerOwner.storage;
        attackingHex.playerOwner.zeroOutStorage();

        if (initialDefendingSoldierCount <= 0) {
            // If there aren't any soldiers in the hex we're moving to then we need to mark the hex as moved.
            defendingHex.hasMovedThisTurn = true;
        }
        
        // Preserve tower improvement, clear other improvements
        if (defendingHex.hexImprovement !== hexImprovementType.TOWER) {
          defendingHex.hexImprovement = hexImprovementType.NONE;
        }

      } else {
        // They're moving from one regular hex to another. Combine soldier counts and clear out any improvements.
        let initialDefendingSoldierCount = defendingHex.soldierCount;
        defendingHex.soldierCount += attackingHex.soldierCount;
        
        // Preserve tower improvement, clear other improvements
        if (defendingHex.hexImprovement !== hexImprovementType.TOWER) {
          defendingHex.hexImprovement = hexImprovementType.NONE;
        }
        
        attackingHex.soldierCount = 0;

        if (initialDefendingSoldierCount <= 0) {
            // If there aren't any soldiers in the hex we're moving to then we need to mark the hex as moved.
            defendingHex.hasMovedThisTurn = true;
        }
        
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

      // Find friendly towers adjacent to the defending hex
      let friendlyTowers = [];
      if (defendingHex.playerOwner) {
        const adjacentHexes = this.getAdjacentHexes(defendingHex);
        adjacentHexes.forEach(adjacentHex => {
          if (adjacentHex.playerOwner === defendingHex.playerOwner && 
              adjacentHex.hexImprovement === hexImprovementType.TOWER &&
              adjacentHex.soldierCount > 0) {
            friendlyTowers.push(adjacentHex);
          }
        });
      }

      //we're going to do a while loop to subtract from the friendlyTowers until we run out of soldiersAttacking or friendlyTowers run out.
      //Each loop will check to see if there are any soldiers left in the friendly tower and if not then remove it from the list
      while (soldiersAttacking > 0 && friendlyTowers.length > 0) {
        friendlyTowers.forEach(friendlyTower => {
          if (friendlyTower.soldierCount > 0 && soldiersAttacking > 0) {
            friendlyTower.soldierCount--;
            soldiersAttacking--;
          } else {
            friendlyTowers = friendlyTowers.filter(tower => tower !== friendlyTower);
          }
        });
      }
      
      
      // Now that we've run out of tower soldiers or we have no more soldiers attacking we can figure out who won.
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
            defendingHex.playerOwner.setStorageTo(-soldiersLeftOver);//Update the storage to how many soldiers are left
          } else {
            // They tied
            attackingHex.soldierCount = 0;
            defendingHex.playerOwner.zeroOutStorage();
          }
        } else {
          // For now we're clearing out anything and just moving in.
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
          defendingHex.hasMovedThisTurn = true;
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

  // Add a new method to reset all hexes' movement for a specific player
  resetMovementForPlayer(player) {
    this.#worldMap.forEach(row => {
      row.forEach(hex => {
        if (hex.playerOwner === player) {
          hex.resetMovement();
        }
      });
    });
  }
}

export default HexWorld;
