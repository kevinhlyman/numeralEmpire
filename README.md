# Numeral Empire
Repository for the Numeral Empire game
This is a game that will be like 'Slay' by Sean O'Connor: A very simple Civilization style game. But instead of units it will just be numbers and basic math. There will be specific 'buildings', just not specific units. 

## Maintenance
- Maintenance only applies to soldiers. Buildings have no maintentance cost.
- Each hex will be able to hold a number of soliders. The maintenance cost of that is half the number. So if a hex has 10 soldiers in it then that will cost the player 5 at the beginning of their turn. 10/2=5.
- The maintenance cost is cumulative with all the hexagons. So if the player has 10 soldiers in one hex and 4 soldiers in the other then that's a maintenance cost of 7. (10+4)/2=7.
- The maintenance cost is floored. So if the player has a 10 in one hex and a 5 in the other then that's a maintence cost of 7 as well. (10+5)/2=Floor(7.5)=7. But if they have an 11 in one hex and a 5 in the other then that's a maintence cost of 8. (11+5)/2=8.

## Income
- Each hex is worth 1 money at the beginning of the turn. If the player has 10 hexagons then that's an income of 10. 10*1=10.
- The maintenance costs is subtracted from the income. So if the player has 10 hexagons and they have 10 soldiers in one hex and 4 soldiers in the other then that's a net positive of 3. (10*1)-(10+4)/2=3.
- Any extra income is put into the Home hex. This is storage and does not incur a maintenance cost.
- Any negative is taken from the smallest army first. The negative takes away from that single army (soldiers in a single hex) until it is gone, then it moves to the next smallest army and continues. So a hex with 5 soldiers and a hex with 10 soldiers and a negative income of -6 will completely whipe out the army of 5 and then take one away from the army of 10.

## Hexagon upgrades
- Home. This is the home location that is determined at the start of the game. If your home is taken over it will move to a random hex that you already own. You do not lose.
- Farm. A farm can be purchased and placed on any hexagon you own without an upgrade already on it. A Farm is +1. So a hexagon with a farm will generate 2 money a turn. Farm Costs 3 to buy.
- Market. Like a Farm but +2. Cost 9.
- Bank. Like a Farm but +3. Cost 12.
- Highrise. Like a Farm but +4. Cost 15.
- Archology. Like a Farm but +5. Cost 20. 
- Tower. A Tower allows the hexagon to provide defense to the hexagons next to it as if whatever amount of soldiers in the tower were in any of those hexagons. So if the player has a hexagon with a tower and an army of 10 soldiers in it, then if an enemy player tries to attack a hexagon next to the tower the tower will come to it's defence and those soldiers will be attacked like they were in the hex being attacked. It's a way to try and keep enemies from sneaking through. A tower can be purchased and placed on any hexagon without an upgrade already on it. A tower keeps the hexagon from generating any income. A hex with a tower generates 0 money a turn. Tower costs 15 to buy.

## Battling & movement
- Battling is just math. If a hexagon that has 10 soldiers attacks a hexagon that has 9 soldiers then 1 soldier lives and takes over the hexagon that had the 9. 10-9=1. That's all that's left of the army of 10. 
- You need at least 1 soldier left to take the hexagon. If a 10 attacks a 10 both armies die and no hexagons switch ownership.
- The soldiers/storage at your Home will defend it when attacked. If the player has 10 soldiers in their home hexagon and a 5 attacks it. The 5 will go to 0, the hexagon will remain owned by whatever player owned it. The Home hexagon of the attacked player will now be 5. 10-5=5.
- An army can only move 1 hexagon a turn.
- A soldier can be added to any owned hexagon anywhere in the world even if there is no direct line from the home hexagon to the hexagon in question.

## Turns, Rounds, and Phases
- Turns do not mean a single move. If it is a player's turn and it is the 'Placing' phase then the player can place any/all of their units/buildings. If it is their turn and it is the 'Attacking' Phase then they get to attack with any/all of their units.
- Phases come in two flavors. There is the 'Placing' phase where players place down their units/buildings and there is the 'Attacking' phase wehre players move their units to another Hex. Each player takes ther turn in a phase and then the phase will move on to the next phase. 
- Rounds. A round consists of two phases. Each player takes their turn in the active phase and when done it moves to the next player.

## Winning
- The last player with a Home hexagon is the winner.
- You can also set a rounds limit of N rounds. If you chose 100 rounds whatever player has the most soldiers at the end of 100 rounds wins.