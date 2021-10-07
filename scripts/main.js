// main.js
// author: Shayne Winn

// Consts
const SVGNS = "http://www.w3.org/2000/svg";

// Get Elements
const HexField = document.getElementById("HexField");
const HexFieldSvg = document.getElementById("HexFieldSvg");
const HexFieldWidth = HexField.offsetWidth;
const HexFieldHeight = HexField.offsetHeight;
const HexFieldPosition = [HexField.offsetLeft, HexField.offsetTop];

// Update Elements
HexFieldSvg.setAttribute("height", `${HexFieldHeight}`);
HexFieldSvg.setAttribute("width", `${HexFieldWidth}`);

// Set Events
HexFieldSvg.onmousedown = (e) => test_handler(e);

// Create test polygon
create_polygon("test", [[10, 10], [10, -10], [-10, -10], [-10, 10]], 40, 40, HexFieldSvg);

// Functions
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

// Event Handlers
function test_handler(e) {
    console.log('test_handler', e);
    let rect = document.getElementById("test");
    if(rect){
        rect.setAttribute("transform", `translate(${e.layerX}, ${e.layerY})`);
    }
};
