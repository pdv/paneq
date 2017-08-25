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

const actx = new AudioContext();
const splitter = actx.createChannelSplitter(2);
const lAnalyser = actx.createAnalyser();
const lArray = new Uint8Array(lAnalyser.frequencyBinCount);
const rAnalyser = actx.createAnalyser();
const rArray = new Uint8Array(rAnalyser.frequencyBinCount);
const merger = actx.createChannelMerger(2);

splitter.connect(lAnalyser, 0, 0);
splitter.connect(rAnalyser, 1, 0);
lAnalyser.connect(merger, 0, 0);
rAnalyser.connect(merger, 0, 1);
merger.connect(actx.destination);

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

$('play').onclick = () => {
    const url = $('sound').value;
    loadSound(url, (buffer) => {
        const src = actx.createBufferSource();
        src.buffer = buffer;
        src.connect(splitter);
        src.start();
    });
};

function drawCenterLine() {
    gctx.strokeStyle = 'black';
    gctx.lineWidth = 2;
    gctx.beginPath();
    gctx.moveTo(w / 2, 0);
    gctx.lineTo(w / 2, h);
    gctx.stroke();
}

function draw() {
    gctx.clearRect(0, 0, w, h);
    drawCenterLine();

    lAnalyser.getByteFrequencyData(lArray);
    const barCount = lAnalyser.frequencyBinCount;
    const barHeight = (h / barCount) * 1.26;
    for (let i = 0; i < barCount; i++) {
        const barWidth = lArray[i] / 2;
        gctx.fillStyle = 'rgb(50,' + (barWidth + 100) + ',50)';
        gctx.fillRect((w / 2) - barWidth, i * barHeight, barWidth, barHeight);
    }

    requestAnimationFrame(draw);
}

function main() {
    draw();
}

window.onload = main;
