const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const width = 700;
const height = 700;
const cells = 10;

const unitLength = height / cells;
const engine = Engine.create();
engine.world.gravity.y = 0;
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
    Bodies.rectangle(width/2 , 0, width, 2, { isStatic : true}),
    Bodies.rectangle(width/2 , height , width, 2, { isStatic : true}),
    Bodies.rectangle(0, height/2 , 2, height, { isStatic : true}),
    Bodies.rectangle(width, height/2, 2, height, { isStatic : true})
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
            2, 
            {
                label: 'wall',
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
            2,
            unitLength, 
            {
                label: 'wall',
                isStatic:true
            }
        );
        World.add( world, wall);
    })
})

// Adding the goal 

const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength * .6,
    unitLength * .6, 
    {
        label: 'goal',
        isStatic:true
    }
)
World.add ( world, goal);


// Drawing the ball 

const ball = Bodies.circle(
    unitLength / 2,
    unitLength / 2,
    unitLength / 4,
    {
        label: 'ball'
    }
)
World.add ( world, ball);


document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if (event.keyCode === 87){
        Body.setVelocity(ball, { x, y: y-5 });
    }
    if (event.keyCode === 68){
        Body.setVelocity(ball, { x: x+5 , y } )
    }
    if (event.keyCode === 83){
        Body.setVelocity(ball, { x, y: y+5 })
    }
    if (event.keyCode === 65){
        Body.setVelocity(ball, { x: x-5, y} )
    }
})

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const label = ['ball', 'goal'];
        if(label.includes(collision.bodyA.label) && label.includes(collision.bodyB.label)){
            world.gravity.y = 1;
            world.bodies.forEach( body => {
                if(body.label === 'wall'){
                    Body.setStatic (body, false);
                }
            })
        }
    })
})
// console.log(grid);
// console.log({verticals});
// console.log({horizontals});
// console.log(startRow, startColumn);