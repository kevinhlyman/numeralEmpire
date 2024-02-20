class Player{
    constructor(name, color){
        this.name = name;
        this.color = color;
        this.storage = 0;
        this.alive = true;
    }

    addToStorage(amount = 1){
        console.log(`Adding ${amount} to storage`);
        this.storage += amount;
    }
    subtractFromStorage(amount = 1){
        console.log(`Subtracting ${amount} from storage`);
        this.storage -= amount;
    }
}

class HumanPlayer extends Player{
    constructor(name, color){
        super(name, color);
    }
}

class ComputerPlayer extends Player{
    constructor(name, color){
        super(name, color);
    }

    
}

export {HumanPlayer, ComputerPlayer}