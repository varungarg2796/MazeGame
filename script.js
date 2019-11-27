const { Engine, Render, Runner, World, Bodies } = Matter;

const width = 600;
const height = 600;
const cells = 3;

const unitLength = height / cells;
const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: true, //for colours (false)
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(),engine);


const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0){
        const index = Math.floor(Math.random() * counter);
        counter --;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}

// Walls
const walls = [
    Bodies.rectangle(width/2 , 0, width, 40, { isStatic : true}),
    Bodies.rectangle(width/2 , height , width, 40, { isStatic : true}),
    Bodies.rectangle(0, height/2 , 40, height, { isStatic : true}),
    Bodies.rectangle(width, height/2, 40, height, { isStatic : true})
];
World.add(world, walls);

// Generating grid
const grid = Array(cells) // increase 3 for increasing columns
    .fill(null)
    .map( ()=> Array(cells).fill(false)); // increase 3 for increasing rows

const verticals = Array(cells)
    .fill(null)
    .map( () => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
    .fill(null)
    .map( () => Array(cells).fill(false));


const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {

    // IF I have visited the cell at [row, column] , then return

    if(grid[row][column]){
        return;
    }

    // Mark this cell as being visited

    grid[row][column] = true;

    // Assemble randomly ordered list of neighbors

    const neighbors = shuffle([
        [row - 1, column, 'up'], 
        [row, column + 1, 'right'], 
        [row + 1, column, 'down'], 
        [row, column - 1, 'left'] 
    ]);

    // For each neighbor

    for (let neighbor of neighbors){

        const [nextRow, nextColumn, direction] = neighbor //array destructuring
        
        // See if that neighbor is out of bounds
        if (nextRow < 0 || nextRow >=cells || nextColumn < 0 || nextColumn >= cells){
            continue;
        }
        // See If we have visited the neighbor, continue to the next neighbor
        if(grid[nextRow][nextColumn]){
            continue;
        }
        // Remove a wall from horizontal or verticals
        if( direction === 'left'){
            verticals[row][column - 1] = true;
        } else if ( direction === 'right'){
            verticals[row][column] = true;
        } else if ( direction === 'up'){
            horizontals[row - 1][column] = true;
        } else if ( direction === 'down'){
            horizontals[row][column] = true;
        }
        stepThroughCell(nextRow, nextColumn);
    }
        // visit the next cell

}

stepThroughCell(startRow, startColumn);


// Drawing the walls

horizontals.forEach((row, rowIndex) => {
    row.forEach( (open, columnIndex) =>{
        if(open){
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength / 2,
            rowIndex * unitLength + unitLength,
            unitLength,
            5, 
            {
                isStatic:true
            }
        );
        World.add( world, wall);
    })
})

verticals.forEach((row, rowIndex) => {
    row.forEach( (open, columnIndex) =>{
        if(open){
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength,
            rowIndex * unitLength + unitLength / 2,
            5,
            unitLength, 
            {
                isStatic:true
            }
        );
        World.add( world, wall);
    })
})
// console.log(grid);
// console.log({verticals});
// console.log({horizontals});
// console.log(startRow, startColumn);