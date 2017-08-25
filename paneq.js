//
// paneq
// pdv
//

'use strict';

const $ = (id) => document.getElementById(id);

// Graphics

const canvas = $("canvas");
const gctx = canvas.getContext('2d');
const w = canvas.width;
const h = canvas.height;

// Audio

const actx = new window.AudioContext();


function drawCenterLine() {
    gctx.strokeStyle = 'black';
    gctx.lineWidth = 2;
    gctx.beginPath();
    gctx.moveTo(w / 2, 0);
    gctx.lineTo(w / 2, h);
    gctx.stroke();
}

function draw() {
    drawCenterLine();
}

function main() {
    draw();
}

window.onload = main;
