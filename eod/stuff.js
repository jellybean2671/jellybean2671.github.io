var a = new node(100,200,20,4, [],"red")


var nodes = []

let camera = {
    x: 0,
    y: 0,
    zoom: 1
};


const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
function drawCircle(x,y,r,c) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}
function drawArrow(from, to, ) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.beginPath();
    ctx.moveTo(from.x+from.r*Math.cos(angle), from.y+from.r*Math.sin(angle));
    ctx.lineTo(to.x-1.25*to.r*Math.cos(angle), to.y-1.25*to.r*Math.sin(angle));
    const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
    gradient.addColorStop(0, from.color);
    gradient.addColorStop(1, to.color);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 5;
    ctx.stroke();

    const arrowSize = 40;

    ctx.beginPath();
    ctx.moveTo(to.x-to.r*Math.cos(angle), to.y-to.r*Math.sin(angle));
    ctx.lineTo(
        to.x - arrowSize * Math.cos(angle - Math.PI / 6)-to.r*Math.cos(angle),
        to.y - arrowSize * Math.sin(angle - Math.PI / 6)-to.r*Math.sin(angle)
    );
    ctx.lineTo(
        to.x - arrowSize * Math.cos(angle + Math.PI / 6)-to.r*Math.cos(angle),
        to.y - arrowSize * Math.sin(angle + Math.PI / 6)-to.r*Math.sin(angle)
    );
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
}


function node(x,y,r,ID,parents,color,name,image,comment) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.r = r;
    this.id = ID;
    this.parents = parents;
    this.color = color;
    this.name = name;
    this.image = image;
    this.comment = comment;
}
node.prototype.draw = function() {
    this.parents.forEach(parent => {
        drawArrow(parent,this)
    });
    drawCircle(this.x,this.y,this.r,this.color)
    ctx.fillStyle = "white";
    return this;
}
function applyConnections() {
    const strength = strength2;

    for (const node of nodes) {
        for (const parent of node.parents) {
            const dx = node.x - parent.x;
            const dy = node.y - parent.y;

            const distance = Math.hypot(dx, dy);

            if (distance === 0) continue;

            const force = (distance - desiredDistance) * strength;

            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            node.vx -= fx;
            node.vy -= fy;

            parent.vx += fx;
            parent.vy += fy;
        }
    }
}
function applyRepulsion(nodes) {

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];

            const dx = a.x - b.x;
            const dy = a.y - b.y;

            const distance = Math.max(Math.hypot(dx, dy), 1);

            const force = strength / (distance * distance);

            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            a.vx += fx;
            a.vy += fy;

            b.vx -= fx;
            b.vy -= fy;
        }
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Background gradient
    const gradient = ctx.createLinearGradient(
        0, 0,
        canvas.width, canvas.height
    );

    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#253663");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    nodes.forEach(e => {
        e.draw();
    });

    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";

    nodes.forEach(e => {
        ctx.fillText(e.name, e.x, e.y + e.r + 8);
    });

    ctx.restore();
}
function updateNodes() {
    applyConnections(nodes);
    applyRepulsion(nodes);

    for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        n.vx *= 0.6;
        n.vy *= 0.6;
    }
    draw();
}
canvas.addEventListener("wheel", (event) => {
    event.preventDefault();

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;

    camera.zoom *= zoomFactor;

    camera.zoom = Math.max(
        0.1,
        Math.min(camera.zoom, 5)
    );
});
function screenToWorld(screenX, screenY) {
    return {
        x: (screenX - canvas.width / 2) / camera.zoom + camera.x,
        y: (screenY - canvas.height / 2) / camera.zoom + camera.y
    };
}
canvas.addEventListener("click", (event) => {
    console.log("CLICKED", event.clientX, event.clientY);
});
function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
}
canvas.addEventListener("click", (event) => {
    const screen = getMousePosition(event);
    const mouse = screenToWorld(
        screen.x,screen.y
    );

    for (const n of nodes) {
        const distance = Math.hypot(
            mouse.x - n.x,
            mouse.y - n.y
        );

        if (distance <= n.r) {
            console.log("Clicked node:", n.id);
            document.getElementById("header").textContent = n.name + " #" + n.id
            document.getElementById("comment").textContent = "Comment: " + n.comment
        }

    }
});
let dragging = false;
let lastMouseX;
let lastMouseY;

canvas.addEventListener("mousedown", (event) => {
    dragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

canvas.addEventListener("mouseup", () => {
    dragging = false;
});

canvas.addEventListener("mousemove", (event) => {
    if (!dragging) return;

    const dx = event.clientX - lastMouseX;
    const dy = event.clientY - lastMouseY;

    camera.x -= dx / camera.zoom;
    camera.y -= dy / camera.zoom;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});
function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateNodes()
    requestAnimationFrame(run);
}





const fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();
reader.onload = (event) => {
    const data = JSON.parse(event.target.result);

    nodes.length = 0; // clear existing nodes
    
    // Create nodes
    for (const [id, info] of Object.entries(data)) {
        nodes.push(new node(
            Math.random() * 10000-5000,
            Math.random() * 10000-5000,
            30,
            Number(id),
            [],
            "#" + Number(info.color).toString(16).slice(-6).padStart(6, "0"),
            info.name,
            info.image.split("?")[0],
            info.comment
        ));
    }

    // Connect parents
    for (const [id, info] of Object.entries(data)) {
        const currentNode = nodes.find(n => n.id === Number(id));

        currentNode.parents = info.parents
            .map(parentID =>
                nodes.find(n => n.id === parentID)
            )
            .filter(parent => parent !== undefined);
    }
};
    reader.readAsText(file);})
function intToHex(color) {
    return "#" + Number(color).toString(16).padStart(6, "0");
}

    requestAnimationFrame(run);








var strength = 5000
var strength2 = .0001
var desiredDistance = 200
var slider = document.getElementById("repulsion");
var slider2 = document.getElementById("distance");
var slider3 = document.getElementById("strength");
strength = Math.pow(slider.value,2);
  desiredDistance  = slider2.value;
slider.oninput = function() {
  strength  = Math.pow(slider.value,2) ;
}
slider2.oninput = function() {
  desiredDistance  = slider2.value;
}
slider3.oninput = function() {
  strength2  = slider3.value / 10000;
}