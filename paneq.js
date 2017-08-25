//
// paneq
// pdv
//

'use strict';

const $ = (id) => document.getElementById(id);

const NUM_DOTS = 10;
const DOT_RADIUS = 5;

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

// hi to low, yeah whatever
const lFilters = createFilters();
const rFilters = createFilters();


// Really these filters should be at octaves, but the visualizer is linear so ¯\_(ツ)_/¯
function createFilters() {
    const filters = [];
    let freq = 16000;
    console.log(freq);
    const highShelf = actx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = freq;
    filters[0] = highShelf;
    for (let i = 1; i < NUM_DOTS - 1; i++) {
        freq -= (16000 - 20) / NUM_DOTS;
        console.log(freq);
        const filter = actx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filters[i - 1].connect(filter);
        filters[i] = filter;
    }
    freq -= (16000 - 20) / NUM_DOTS;
    console.log(freq);
    const lowShelf = actx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = freq;
    filters[NUM_DOTS - 2].connect(lowShelf);
    filters[NUM_DOTS - 1] = lowShelf;
    return filters;
}

splitter.connect(lFilters[0], 0, 0);
splitter.connect(rFilters[0], 1, 0);
lFilters[NUM_DOTS - 1].connect(lAnalyser);
rFilters[NUM_DOTS - 1].connect(rAnalyser);
lAnalyser.connect(merger, 0, 0);
rAnalyser.connect(merger, 0, 1);
merger.connect(actx.destination);


// Filters


const filters = initFilters();

function initFilters() {
    const filters = [];
    for (let i = 0; i < NUM_DOTS; i++) {
        filters.push(0);
    }
    return filters;
}

function getDotLocations() {
    const dots = [];
    const useableHeight = h - (DOT_RADIUS * 2);
    const gap = useableHeight / (NUM_DOTS - 1);
    for (let i = 0; i < NUM_DOTS; i++) {
        dots.push([(w/2) + (filters[i] * (w/2)), i * gap + DOT_RADIUS]);
    }
    return dots;
}


// Mouse

let selectedFilter = null;

function dist(a, b) {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x, y];
}

function mousedown(e) {
    const dots = getDotLocations();
    const mousePos = getMousePos(canvas, e);
    for (let i = 0; i < dots.length; i++) {
        if (dist(mousePos, dots[i]) < (DOT_RADIUS * 2)) {
            selectedFilter = i;
        }
    }
}

function mouseup(e) {
    selectedFilter = null;
}

function mousemove(e) {
    if (selectedFilter != null) {
        const mousePos = getMousePos(canvas, e);
        const normalized = (mousePos[0] - (w/2)) / (w/2);
        filters[selectedFilter] = normalized;
        lFilters[selectedFilter].gain.value = -(normalized * 20);
        rFilters[selectedFilter].gain.value = normalized * 20;
    }
}

document.addEventListener('mousedown', mousedown, false);
document.addEventListener('mousemove', mousemove, false);
document.addEventListener('mouseup', mouseup, false);


// Draw

function drawCurve() {
    const dots = getDotLocations();

    gctx.strokeStyle = 'rgb(211, 8, 4)';
    gctx.lineWidth = 3;
    gctx.beginPath();
    gctx.moveTo(dots[0][0], dots[0][1]);
    for (var i = 1; i < dots.length - 2; i++) {
        const xc = (dots[i][0] + dots[i + 1][0]) / 2;
        const yc = (dots[i][1] + dots[i + 1][1]) / 2;
        gctx.quadraticCurveTo(dots[i][0], dots[i][1], xc, yc);
    }
    gctx.quadraticCurveTo(dots[i][0], dots[i][1], dots[i+1][0], dots[i+1][1]);
    gctx.stroke();

    gctx.fillStyle = 'rgb(211, 8, 4)';
    for (let i = 0; i < dots.length; i++) {
        gctx.beginPath();
        gctx.arc(dots[i][0], dots[i][1], DOT_RADIUS, 0, 2 * Math.PI);
        gctx.fill();
    };
}

function drawBars() {
    const barCount = lAnalyser.frequencyBinCount;
    const barHeight = (h / barCount) * 1.26;

    lAnalyser.getByteFrequencyData(lArray);
    for (let i = 0; i < barCount; i++) {
        const lBarWidth = lArray[i] / 2;
        gctx.fillStyle = 'rgb(50,' + (lBarWidth + 100) + ',50)';
        gctx.fillRect((w / 2) - lBarWidth, h - (i * barHeight), lBarWidth, barHeight);
    }

    rAnalyser.getByteFrequencyData(rArray);
    for (let i = 0; i < barCount; i++) {
        const rBarWidth = rArray[i] / 2;
        gctx.fillStyle = 'rgb(50, 50,' + (rBarWidth + 100) + ')';
        gctx.fillRect(w / 2, h - (i * barHeight), rBarWidth, barHeight);
    }
}

function draw() {
    gctx.clearRect(0, 0, w, h);
    drawBars();
    drawCurve();
    requestAnimationFrame(draw);
}

window.onload = draw;
