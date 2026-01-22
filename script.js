const mcPalette = [
    { name: "White", hex: "#F9FFFE" },
    { name: "Light Gray", hex: "#9D9D97" },
    { name: "Gray", hex: "#474F52" },
    { name: "Black", hex: "#1D1D21" },
    { name: "Brown", hex: "#835432" },
    { name: "Red", hex: "#B02E26" },
    { name: "Orange", hex: "#F9801D" },
    { name: "Yellow", hex: "#FED83D" },
    { name: "Lime", hex: "#80C71F" },
    { name: "Green", hex: "#5E7C16" },
    { name: "Cyan", hex: "#169C9C" },
    { name: "Light Blue", hex: "#3AB3DA" },
    { name: "Blue", hex: "#3C44AA" },
    { name: "Purple", hex: "#8932B8" },
    { name: "Magenta", hex: "#C74EBD" },
    { name: "Pink", hex: "#F38BAA" }
];

const canvas = document.getElementById('bannerCanvas');
const ctx = canvas.getContext('2d');

// List your filenames here (without .png)
const patterns = ['none', 'border', 'bricks', 'creeper', 'cross', 'mojang', 'skull', 'stripe_bottom'];

let activeLayer = null;

// ... keep mcPalette and patterns array as is ...

function init() {
    const container = document.getElementById('layerContainer');
    const baseSelector = document.getElementById('baseColorContainer');

    // 1. Base Color
    baseSelector.innerHTML = `<span>Base Color:</span> <div class="color-picker-container">${createColorPicker('base', '#F9FFFE')}</div>`;

    // 2. Create 7 Layers
    for (let i = 1; i <= 7; i++) {
        const div = document.createElement('div');
        div.className = 'layer-row';
        div.innerHTML = `
            <span class="layer-number">${i}</span>
            <div class="pattern-picker-container">
                ${createPatternPicker(i)}
            </div>
            <div class="color-picker-container">
                ${createColorPicker(i, i === 1 ? '#1D1D21' : '#F9FFFE')}
            </div>
        `;
        container.appendChild(div);
    }
    render();
}

function createColorPicker(layerId, defaultHex) {
    const swatches = mcPalette.map(c => `
        <div class="swatch ${c.hex === defaultHex ? 'active' : ''}" 
             style="background-color: ${c.hex}" 
             onclick="setLayerColor('${layerId}', '${c.hex}', this)">
        </div>`).join('');
    return `
        <div class="swatch-group" id="group-c-${layerId}">${swatches}</div>
        <input type="hidden" id="c-${layerId}" value="${defaultHex}">
    `;
}

function createPatternPicker(layerId) {
    const items = patterns.map(p => `
        <div class="pattern-item ${p === 'none' ? 'active' : ''}" onclick="setLayerPattern('${layerId}', '${p}', this)">
            <img src="patterns/vanilla/${p}.png">
        </div>`).join('');
    return `
        <div class="pattern-list" id="group-p-${layerId}">${items}</div>
        <input type="hidden" id="p-${layerId}" value="none">
    `;
}

function setLayerColor(id, hex, el) {
    document.getElementById(`c-${id}`).value = hex;
    const group = el.parentElement;
    group.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    render();
}

function setLayerPattern(id, name, el) {
    document.getElementById(`p-${id}`).value = name;
    const group = el.parentElement;
    group.querySelectorAll('.pattern-item').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    render();
}

async function render() {
    const canvas = document.getElementById('bannerCanvas');
    const ctx = canvas.getContext('2d');
    const baseColor = document.getElementById('c-base').value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 1; i <= 7; i++) {
        const pName = document.getElementById(`p-${i}`).value;
        const pHex = document.getElementById(`c-${i}`).value;
        if (pName !== 'none') {
            await drawPattern(`patterns/vanilla/${pName}.png`, pHex, ctx);
        }
    }
}

function drawPattern(url, color, mainCtx) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = 160; tempCanvas.height = 320;
            tempCtx.fillStyle = color;
            tempCtx.fillRect(0, 0, 160, 320);
            tempCtx.globalCompositeOperation = "destination-in";
            tempCtx.drawImage(img, 0, 0, 160, 320);
            mainCtx.drawImage(tempCanvas, 0, 0);
            resolve();
        };
        img.onerror = () => resolve();
    });
}

init();