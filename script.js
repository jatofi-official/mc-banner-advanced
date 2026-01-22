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

function init() {
    const container = document.getElementById('layerContainer');
    const baseSelector = document.getElementById('baseColorContainer');
    
    if (!container || !baseSelector) {
        console.error("Required HTML elements not found!");
        return;
    }

    // 1. Create Base Color Selector
    baseSelector.innerHTML = `
        <label>Base Color: </label>
        <select id="baseColor">
            ${mcPalette.map(c => `<option value="${c.hex}">${c.name}</option>`).join('')}
        </select>
    `;

    // 2. Create 7 layer controls
    for (let i = 1; i <= 7; i++) {
        const div = document.createElement('div');
        div.className = 'layer-row';
        div.innerHTML = `
            <span class="layer-number">${i}</span>
            <select id="p-${i}" class="pattern-select">
                ${patterns.map(p => `<option value="${p}">${p.replace(/_/g, ' ')}</option>`).join('')}
            </select>
            <select id="c-${i}" class="color-select">
                ${mcPalette.map(c => `<option value="${c.hex}">${c.name}</option>`).join('')}
            </select>
        `;
        container.appendChild(div);
    }

    // 3. Add a single Event Listener to the whole container (more efficient)
    container.addEventListener('change', render);
    baseSelector.addEventListener('change', render);

    render();
}

async function render() {
    const canvas = document.getElementById('bannerCanvas');
    const ctx = canvas.getContext('2d');
    const baseColor = document.getElementById('baseColor').value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Base
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Layers
    for (let i = 1; i <= 7; i++) {
        const patternName = document.getElementById(`p-${i}`).value;
        const color = document.getElementById(`c-${i}`).value;

        if (patternName !== 'none') {
            // Ensure path matches: patterns/vanilla/filename.png
            await drawPattern(`patterns/vanilla/${patternName}.png`, color, ctx);
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
            tempCanvas.width = 160;
            tempCanvas.height = 320;

            tempCtx.fillStyle = color;
            tempCtx.fillRect(0, 0, 160, 320);

            tempCtx.globalCompositeOperation = "destination-in";
            tempCtx.drawImage(img, 0, 0, 160, 320);

            mainCtx.drawImage(tempCanvas, 0, 0);
            resolve();
        };
        img.onerror = () => {
            console.warn("Failed to load:", url);
            resolve();
        };
    });
}

function downloadBanner() {
    const canvas = document.getElementById('bannerCanvas');
    const link = document.createElement('a');
    link.download = 'my_banner.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Start the app
init();