// main.js
// author: Shayne Winn


//       /=====================\
//      |  VV  SETUP            |
//       \=====================/


// Consts
const SVGNS = "http://www.w3.org/2000/svg";

// Get Elements
const HexField = document.getElementById("HexField");
const HexFieldSvg = document.getElementById("HexFieldSvg");
const HexFieldWidth = HexField.offsetWidth;
const HexFieldHeight = HexField.offsetHeight;
const HexFieldPosition = [HexField.offsetLeft, HexField.offsetTop];
const SidePanel = document.getElementById("SidePanel");

// Update Elements
HexFieldSvg.setAttribute("height", `${HexFieldHeight}`);
HexFieldSvg.setAttribute("width", `${HexFieldWidth}`);

// Set Events
HexFieldSvg.onmousedown = (e) => test_handler_down(e);
HexFieldSvg.onmousemove = (e) => test_handler_drag(e);
HexFieldSvg.onmouseup = (e) => test_handler_up(e);

// Create test polygon
create_polygon("test", [[15, 15], [20, -15], [-20, -15], [-15, 15], [0, 20]], 40, 40, HexFieldSvg);


//       /=====================\
//      |  ɅɅ  SETUP            |
//       >---------------------<
//      |  VV  STATE MACHINE    |
//       \=====================/

const stateMachine = new StateMachine({
    init: 'none',
    transitions: [
        // start
        {name: 'init',        from: 'none',   to: 'ready'},

        // drawing
        {name: 'drawWall',    from: 'ready',  to: 'drawingWalls'},                  // drawing new walls
        {name: 'eraseWall',   from: 'ready',  to: 'erasingWalls'},                  // erasing walls
        {name: 'dragStart',   from: 'ready',  to: 'draggingStart'},                 // moving the start node
        {name: 'dragEnd',     from: 'ready',  to: 'draggingEnd'},                   // moving the end node
        {name: 'finishDraw',  from:['drawingWalls', 'erasingWalls', 'draggingStart', 'draggingEnd'], to: 'ready'},  // done drawing, ready to visualize

        // pathfinding
        {name: 'start',       from: 'ready',                                to: 'visualizing'},     // the algorithm is running
        {name: 'pause',       from: 'visualizing',                          to: 'paused'},          // the visualization is paused
        {name: 'cancel',      from: ['paused', 'finished'],                 to: 'ready'},           // cancel the search
        {name: 'resume',      from: 'paused',                               to: 'visualizing'},     // the visualization is resumed
        {name: 'finish',      from: 'visualizing',                          to: 'finished'},        // the program has vinished visualizing
        {name: 'restart',     from: ['finished', 'paused', 'visualizing'],  to: 'visualizing'},     // the program is restarting the visualization
        {name: 'clear',       from: ['ready', 'visualizing', 'paused', 'finished'],   to: 'ready'}

    ],
    methods: {
        onAfterTransition: (lifecycle) => after_transition(lifecycle),
    }
})

function after_transition(lifecycle) {
    console.log("after_transition", lifecycle);
    SidePanel.innerHTML = lifecycle.to;
}

//stateMachine.init();

//       /=====================\
//      |  ɅɅ  STATE MACHINE    |
//       >---------------------<
//      |  VV  FUNCTIONS        |
//       \=====================/


function create_polygon(id, points, x, y, element) {
    // create new polygon
    let new_poly = document.createElementNS(SVGNS, "polygon");
    // set new polygon's attributes
    new_poly.setAttribute("id", `${id}`);
    new_poly.setAttribute("style", `transform-origin: ${x}px ${y}px`);
    new_poly.setAttribute("transform", `translate(${x}, ${y})`);
    let points_s = "";
    for(i = 0; i < points.length; i++) {
        points_s += `${points[i][0]},${points[i][1]},`;
    }
    new_poly.setAttribute("points", points_s);
    new_poly.setAttribute("fill", "#5cceee");
    // append it to the element
    element.appendChild(new_poly);
}


//       /=====================\
//      |  ɅɅ  FUNCTIONS        |
//       >---------------------<
//      |  VV  EVENT HANDLERS   |
//       \=====================/


function test_handler_down(e) {
    if(e.target === document.getElementById("test")){
        if(stateMachine.can('dragStart')){
            stateMachine.dragStart();
        }
    }
};

function test_handler_drag(e) {
    if(stateMachine.is('draggingStart')){
        document.getElementById("test").setAttribute("transform", `translate(${e.layerX}, ${e.layerY})`);
    }
}

function test_handler_up(e) {
    if(stateMachine.can('finishDraw')){
        stateMachine.finishDraw();
    }
}


//       /=====================\
//      |  ɅɅ  EVENT HANDLERS   |
//       \=====================/


// TEMPLATES
//      new section
//      |  VV  NEW|
//       \=====================/

//       /=====================\
//      |  ɅɅ  NEW|
//       >---------------------<