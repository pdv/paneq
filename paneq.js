//
// paneq
// pdv
//

'use strict';

const $ = (id) => document.getElementById(id);

// Graphics

const canvas = $('canvas');
const gctx = canvas.getContext('2d');
const w = canvas.width;
const h = canvas.height;

// Audio

const actx = new window.AudioContext();

const loadSound = (url, cb) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
        actx.decodeAudioData(
            request.response,
            cb,
            () => { alert("error loading audio"); }
        );
    };
    request.send();
    console.log("Loading: " + url);
};

const playSound = (buffer) => {
    let src = actx.createBufferSource();
    src.buffer = buffer;
    src.connect(actx.destination);
    src.start(start, 0, 1);
};

$('')


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
