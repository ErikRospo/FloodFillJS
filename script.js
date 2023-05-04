/** @type {HTMLCanvasElement} */
const canvas = document.querySelector('body').appendChild(document.createElement('canvas'));
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let ch = canvas.height = window.innerHeight;
let cw = canvas.width = window.innerWidth;
//todo: remove unneeded functions, variables, etc
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
function randomX() {
    return Math.random() * cw;
}
function randomY() {
    return Math.random() * ch;
}
/**
 * @param {number} shapes
 * @param {number} poly
 */
function generateImage(poly, lines) {
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;
    ctx.fillRect(0, 0, cw, ch);
    for (let i = 0; i < poly; i++) {
        ctx.strokeStyle = "white";
        ctx.beginPath();
        let x = randomX();
        let y = randomY();
        ctx.moveTo(x, y);
        for (let j = 2; j < Math.round(Math.random() * 20); j++) {
            ctx.lineTo(randomX(), randomY());

        }
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    for (let i = 0; i < lines; i++) {
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(randomX(), randomY());
        ctx.lineTo(randomX(), randomY());
        ctx.stroke();
    }
}
/**
 * @param {CanvasRenderingContext2D} ctx
 */
function getdone(ctx) {
    let imagedata = ctx.getImageData(0, 0, cw, ch);
    /**@type {Array<boolean>} */
    let done = new Array(ch * cw).fill(false);
    for (let i = 0; i < imagedata.data.length; i += 4) {
        done[i / 4] = imagedata[i] > 128 || imagedata[i + 1] > 128 || imagedata[i + 2] > 128;

    }

    return done;
}
function getNonBlackPixels(ctx) {
    // Get the width and height of the canvas
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Create a new array to store the result
    const nonBlackPixels = new Array(w * h);

    // Get the image data from the context
    const imageData = ctx.getImageData(0, 0, w, h);

    // Loop through all the pixels and check if they are not black
    for (let i = 0; i < w * h; i++) {
        // Get the red, green, and blue values of the current pixel
        const r = imageData.data[i * 4];
        const g = imageData.data[i * 4 + 1];
        const b = imageData.data[i * 4 + 2];

        // Check if the pixel is not black
        nonBlackPixels[i] = (r !== 0 || g !== 0 || b !== 0);
    }

    // Return the result
    return nonBlackPixels;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<boolean>} boolArray 
 */
function boolImageData(boolArray, ctx) {
    let imageData = ctx.createImageData(cw, ch);
    for (let i = 0; i < boolArray.length; i++) {
        let pixelIndex = i * 4;
        if (boolArray[i]) {
            // set pixel to black (all RGBA values set to 0)
            imageData.data[pixelIndex] = 0;
            imageData.data[pixelIndex + 1] = 0;
            imageData.data[pixelIndex + 2] = 0;
            imageData.data[pixelIndex + 3] = 255; // alpha channel set to opaque (255)
        } else {
            // set pixel to white (all RGBA values set to 255, except for alpha which is 255)
            imageData.data[pixelIndex] = 255;
            imageData.data[pixelIndex + 1] = 255;
            imageData.data[pixelIndex + 2] = 255;
            imageData.data[pixelIndex + 3] = 255; // alpha channel set to opaque (255)
        }
    }
    // update the canvas with the modified image data
    ctx.putImageData(imageData, 0, 0);
}
function hueToCssHex(hue) {
    // Convert hue to RGB
    let h = hue / 60;
    let c = 1;
    let x = 1 - Math.abs(h % 2 - 1);
    let rgb =
        h < 1
            ? [c, x, 0]
            : h < 2
                ? [x, c, 0]
                : h < 3
                    ? [0, c, x]
                    : h < 4
                        ? [0, x, c]
                        : h < 5
                            ? [x, 0, c]
                            : [c, 0, x];

    // Convert RGB to CSS hex
    let r = Math.round(rgb[0] * 255).toString(16).padStart(2, '0');
    let g = Math.round(rgb[1] * 255).toString(16).padStart(2, '0');
    let b = Math.round(rgb[2] * 255).toString(16).padStart(2, '0');
    let hex = `#${r}${g}${b}`;

    return hex;
}
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h 
 * @param {number} x
 * @param {number} y
 * @returns {Generator<boolean>}
 */
function* floodFill(ctx, w, h, x, y) {
    //TODO: fix the canvas using the wrong "done" values when resizing
    //TODO: get the shift direction from the url
    // let done=new Array(w*h).fill(false)
    let done = getNonBlackPixels(ctx);

    let points = [new Point(x, y)];
    function toIndex(x, y) {
        return y * w + x;
    }
    let i = 0;
    const pixelsCT = 25000;

    while (points.length > 0) {
        let p = points.pop();
        // let p=points.shift();
        if (p.x < 0 || p.x >= w || p.y < 0 || p.y >= h) {
            continue;
        }
        let index = toIndex(p.x, p.y);
        if (!done[index]) {
            points.push(new Point(p.x - 1, p.y));
            points.push(new Point(p.x, p.y - 1));
            points.push(new Point(p.x + 1, p.y));
            points.push(new Point(p.x, p.y + 1));
            done[index] = true;
            ctx.fillStyle = hueToCssHex((i / pixelsCT) / 2 * 60);
            ctx.fillRect(p.x, p.y, 1, 1);
            i++;
            //TODO: get speed from url
            //TODO: get type of speed (constant/gradient constant)
            if (i % 10 == 0) {
                yield false;
            }
        }
    }
    yield true;
}

let imgd = ctx.getImageData(0, 0, cw, ch);
generateImage(3, 5);
let floodFillFrames = floodFill(ctx, cw, ch, Math.round(randomX()), Math.round(randomY()));

function start() {
    generateImage(3, 5);
    imgd = ctx.getImageData(0, 0, cw, ch);
    floodFillFrames = floodFill(ctx, cw, ch, Math.round(randomX()), Math.round(randomY()));

}
window.onresize = () => {
    ch = canvas.height = window.innerHeight;
    cw = canvas.weight = window.innerWidth;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, cw, ch);
    start();

};
start();
let st = Date.now();
let et = Date.now();
let lastframe = { done: false };
function animate() {
    if (!lastframe.done) {
        let newframe = floodFillFrames.next();
        lastframe = newframe;
    }
    requestAnimationFrame(animate);
}
window.onload = () => {
    animate();
};