# numeralEmpire
Repository for the Numeral Empire game
This is a game that will be like 'Slay'. A very simply Civilization style game. But instead of units it will just be numbers and basic math. 

Costs
- Each hex will be able to hold a number of soliders. The maintenance cost of that is half the number. So if a hex has a 10 in it then that will cost the player 5 at the beginning of their turn. 10/2=5.
- The maintenance cost is cumulative will all the hexagons. So if the player has a 10 in one hex and a 4 in the other then that's a maintenance cost of 7. (10+4)/2=7.
- The maintenance cost is floored. So if the player has a 10 in one hex and a 5 in the other then that's a maintence cost of 7 as well. (10+5)/2=Floor(7.5)=7. But if they have an 11 in one hex and a 5 in the other then that's a maintence cost of 8. (11+5)/2=8.

Income
- Each hex is worth 1 money at the beginning of the turn. If the player has 10 hexagons then that's an income of 10. 10*1=10.
- The maintenance costs is subtracted from the income. So if the player has 10 hexagons and they have a 10 in one hex and a 4 in the other then that's a net positive of 3. (10*1)-(10+4)/2=3.
- Any extra income is put into the Home hex as like a storage.
- Any negative is taken from the largets army first. If there is no army then it's taken from the Home hex.

Hexagon upgrades
- Home. This is the home location that is determined at the start of the game. If your home is taken over you're dead. You lose.
- Farm. A farm can be purchased and placed on any hexagon without an upgrade already. A Farm is +1. So a hexagon with a garm will generate 2 money a turn. Farm Costs 3.
- Tower. A Tower allows the hexagon to provide defense to the hexagons next to it as if whatever amount of soldiers in the tower were in any of those hexagons. So if the player has a hexagon with  tower and an army of 10 soldiers in it, then if an enemy player tries to attack a hexagon next to the tower the tower will come to it's defence and those soldiers will be attacked like they were in the hex being attacked. It's a way to try and keep enemies from sneaking through. A tower can be purchased and placed on any hexagon without an upgrade already. A tower keeps the hexagon from generating any income. A hex with a tower generates 0 money a turn. Tower costs 5.

Battling & movement
- Battling is just math. If a hexagon that is an 10 attacks a hexagon that is a 9 then 1 soldier lives and takes over the hexagon that had the 9. 10-9=1. That's all that's left of the 10 army. 
- You need at least 1 soldier left to take the hexagon. If a 10 attacks a 10 both armies die and no hexagons switch ownership.
- The soldiers at your Home will defend it when attacked. If the player has 10 soldiers in their home hexagon and a 5 attacks it. The 5 will go to 0, the hexagon will remain owned by whatever player owned it. The Home hexagon of the attacked player will now be 5. 10-5=5.
- An army can only move 1 hexagon a turn.
- A soldier can be added to any owned hexagon anywhere in the world even if there is no direct line from the home hexagon to the hexagon in question.

Winning
- The last player with a Home hexagon is the winner.
- You can also set a rounds limit of N rounds. If you chose 100 rounds whatever player has the most soldiers at the end of 100 rounds wins.