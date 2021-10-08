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
create_polygon("test", "test", [[15, 15], [20, -15], [-20, -15], [-15, 15], [0, 20]], 40, 40, HexFieldSvg);

// Globals
var HexArray;


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
        onInit: () => init(),
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


function init() {
    console.log("---==/ Initialization started \\==---");

// Generate hexagons:
    // calculate hex size
    const hexSize = Math.max(Math.floor(HexFieldWidth / (50 * Math.sqrt(3))), 15);
    console.log(`\tHexSize = ${hexSize}`);

    // calculate how many hexagons fit horizontally and vertically
    const hexWidth = Math.ceil(HexFieldWidth / (Math.sqrt(3) * hexSize));
    const hexHeight = Math.ceil(HexFieldHeight / (0.75 * 2 * hexSize));

    console.log(`\tHexField dimentions = (${hexWidth} hex's wide, ${hexHeight} hex's tall)`);

    // pre-calculate points
    const w = Math.sqrt(3) * hexSize;
    const h = 2 * hexSize;
    const points = [
        [         0,  (0.5  * h)],
        [-(0.5 * w),  (0.25 * h)],
        [-(0.5 * w), -(0.25 * h)],
        [         0, -(0.5  * h)],
        [ (0.5 * w), -(0.25 * h)],
        [ (0.5 * w),  (0.25 * h)],
    ];

    // generate a rectangle of hexagons
    HexArray = Array.from(Array(hexHeight), () => new Array(hexWidth));
    let hexCount = 0;
    for(let r = 0; r < hexHeight; r++){
      let r_off = Math.floor(r/2);
      for(let q = -r_off; q < hexWidth - r_off; q++){
        const x = hexSize * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
        const y = hexSize * (3/2 * r);
        create_polygon(
            `${[q, r, -q-r]}`,
            "hex-cell",
            points,
            x, y,
            HexFieldSvg
        );
        hexCount++;
        HexArray[r][q + Math.floor(r/2)] = new Hex(q, r);
      }
    }
    console.log(`\tFinished generating ${hexCount} hex's`);

// Generate boarder
    create_polygon(
        "boarder", "boarder",
        [[0, 0],[HexFieldWidth, 0],[HexFieldWidth, HexFieldHeight],[0, HexFieldHeight]],
        0, 0,
        HexFieldSvg
    );

    console.log("---==\\ Initialization finished /==---")
}


function create_polygon(id, cls, points, x, y, element) {
    // create new polygon
    let new_poly = document.createElementNS(SVGNS, "polygon");
    // set new polygon's attributes
    new_poly.setAttribute("id", `${id}`);
    new_poly.setAttribute("class", `${cls}`);
    new_poly.setAttribute("style", `transform-origin: ${x}px ${y}px`);
    new_poly.setAttribute("transform", `translate(${x}, ${y})`);
    let points_s = "";
    for(i = 0; i < points.length; i++) {
        points_s += `${points[i][0]},${points[i][1]},`;
    }
    new_poly.setAttribute("points", points_s);
    // append it to the element
    element.appendChild(new_poly);
}


//       /=====================\
//      |  ɅɅ  FUNCTIONS        |
//       >---------------------<
//      |  VV  EVENT HANDLERS   |
//       \=====================/


function test_handler_down(e) {
    console.log(e.target.id.split(",").map(Number));
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
    let [q, r, s] = e.target.id.split(",").map(Number);
    SidePanel.innerHTML = `id = ${[q, r, s]}\n\narray[${r}][${q + Math.floor(r/2)}] = ${HexArray[r][q + Math.floor(r/2)].type}`;
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