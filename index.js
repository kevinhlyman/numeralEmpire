
const hexagonGrid = [
    [1, 1, 1, 1, 1], // Row 1
    [1, 1, 1, 1, 1], // Row 2
];

const gameBoard = document.getElementById('gameBoard');

function addMoreToGrid(){
    hexagonGrid.forEach((row, index) => {
        const rowDiv = document.createElement('div');
        // if (index === 0)
        // {
        //     rowDiv.className = `row zero`;
        // }else{
             rowDiv.className = `row ${index % 2 === 0 ? 'even' : 'odd'}`;
        // }
    
        row.forEach(hexagon => {
            const hexagonDiv = document.createElement('div');
            hexagonDiv.className = 'hexagon';
            hexagonDiv.innerHTML = hexagon; 
            rowDiv.appendChild(hexagonDiv);
        });
    
        gameBoard.appendChild(rowDiv);
    });
}

