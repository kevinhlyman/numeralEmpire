class Player{
    constructor(name, color){
        this.name = name;
        this.color = color;
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