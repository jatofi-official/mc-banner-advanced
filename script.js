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

// List your filenames here (ensure these exist in patterns/vanilla/ as .png)
const patterns = ['none', "base","border","bricks","circle","creeper","cross","curly_border","diagonal_left","diagonal_right","diagonal_up_left","diagonal_up_right","flower","flow","globe","gradient","gradient_up","guster","half_horizontal_bottom","half_horizontal","half_vertical","half_vertical_right","mojang","piglin","rhombus","skull","small_stripes","square_bottom_left","square_bottom_right","square_top_left","square_top_right","straight_cross","stripe_bottom","stripe_center","stripe_downleft","stripe_downright","stripe_left","stripe_middle","stripe_right","stripe_top","triangle_bottom","triangles_bottom","triangles_top","triangle_top"];

const extraPatterns = ["anchor","blam","castle","chequered","circle_tiles","clubs","cogs","companion","crown","curtains","diamonds","double_bars","double_gradient","emoji","eye","fancy","ghast","hammer","hearts","horn","knot","moon","palace","peace","pillager","pumpkin","pyramid","revolution","ribs","shield","spades","sun","sword","tattered","tower","trident","villager","yin_yang","fleur"];

// State management
let currentPatternSet = patterns; 
let currentPath = 'patterns/vanilla/';

/**
 * Triggered by the HTML switch. 
 * Combines Vanilla + Extra when checked.
 */
function togglePatterns() {
    const isExtra = document.getElementById('patternToggle').checked;
    
    // Merge the arrays if extra is checked
    currentPatternSet = isExtra ? [...patterns, ...extraPatterns] : patterns;
    
    // Refresh the UI for all 7 layers
    for (let i = 1; i <= 7; i++) {
        const container = document.getElementById(`p-${i}`).parentElement;
        const color = document.getElementById(`c-${i}`).value;
        container.innerHTML = createPatternPicker(i, color);
    }
}

/**
 * Initializes the application, creates the UI rows, and performs the first render.
 */
function init() {
    const container = document.getElementById('layerContainer');
    const baseSelector = document.getElementById('baseColorContainer');

    // 1. Setup Base Color Selector
    // We create a hidden input 'c-base' so the render loop can find the base color easily.
    baseSelector.innerHTML = `
        <span style="display:block; margin-bottom:5px; font-weight:bold;">Base Color</span> 
        <div class="color-picker-container" style="margin: 0 auto;">
            ${createColorPicker('base', '#F9FFFE')}
        </div>
    `;

    // 2. Create the 7 Layer Rows
    container.innerHTML = ''; 
    for (let i = 1; i <= 7; i++) {
        const div = document.createElement('div');
        div.className = 'layer-row';
        
        // Layer 1 defaults to Black, others to White for better visibility
        const startColor = (i === 1) ? '#3C44AA' : '#F9FFFE';
        
        div.innerHTML = `
            <span class="layer-number">${i}</span>
            <div class="pattern-picker-container">
                ${createPatternPicker(i, startColor)}
            </div>
            <div class="color-picker-container">
                ${createColorPicker(i, startColor)}
            </div>
        `;
        container.appendChild(div);
    }

    render();
}

/**
 * Creates the HTML for the pattern icons.
 * Now dynamically detects the correct folder for each icon in the list.
 */
function createPatternPicker(layerId, color) {
    const items = currentPatternSet.map(p => {
        if (p === 'none') {
            return `<div class="pattern-item active" onclick="setLayerPattern('${layerId}', 'none', this)">NO</div>`;
        }
        
        // Determine path icon-by-icon
        const folder = patterns.includes(p) ? 'patterns/vanilla/' : 'patterns/mmb/';
        const fullPath = `${folder}${p}.png`;

        return `
        <div class="pattern-item" onclick="setLayerPattern('${layerId}', '${p}', this)">
            <div class="pattern-icon" style="
                background-color: ${color}; 
                -webkit-mask-image: url('${fullPath}'); 
                mask-image: url('${fullPath}');">
            </div>
        </div>`;
    }).join('');

    return `
        <div class="pattern-list" id="group-p-${layerId}">${items}</div>
        <input type="hidden" id="p-${layerId}" value="none">
    `;
}

/**
 * Creates the HTML for the color swatches.
 */
function createColorPicker(layerId, defaultHex) {
    const swatches = mcPalette.map(c => `
        <div class="swatch ${c.hex === defaultHex ? 'active' : ''}" 
             style="background-color: ${c.hex}" 
             onclick="setLayerColor('${layerId}', '${c.hex}', this)"
             title="${c.name}">
        </div>`).join('');

    return `
        <div class="color-grid-4x4" id="group-c-${layerId}">${swatches}</div>
        <input type="hidden" id="c-${layerId}" value="${defaultHex}">
    `;
}


/**
 * Updates the color for a specific layer and reflects it in the UI icons.
 */
function setLayerColor(id, hex, el) {
    document.getElementById(`c-${id}`).value = hex;
    
    // Update active swatch state
    const group = el.parentElement;
    group.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');

    // Update the color of the icons in the pattern list for this layer
    const patternGroup = document.getElementById(`group-p-${id}`);
    if (patternGroup) {
        patternGroup.querySelectorAll('.pattern-icon').forEach(icon => {
            icon.style.backgroundColor = hex;
        });
    }
    render();
}

/**
 * Sets the pattern for a specific layer.
 */
function setLayerPattern(id, name, el) {
    document.getElementById(`p-${id}`).value = name;
    
    // Update active pattern state
    const group = el.parentElement;
    group.querySelectorAll('.pattern-item').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    
    render();
}

/**
 * Render Function: Handles mixed folders.
 */
async function render() {
    const canvas = document.getElementById('bannerCanvas');
    const ctx = canvas.getContext('2d');
    
    const baseInput = document.getElementById('c-base');
    const baseColor = baseInput ? baseInput.value : '#F9FFFE';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 1; i <= 7; i++) {
        const pName = document.getElementById(`p-${i}`).value;
        const pHex = document.getElementById(`c-${i}`).value;
        
        if (pName !== 'none') {
            let folder = patterns.includes(pName) ? 'patterns/vanilla/' : 'patterns/mmb/';
            await drawPattern(`${folder}${pName}.png`, pHex, ctx);
        }
    }
}

/**
 * Tints a pattern PNG and draws it onto the main canvas.
 */
function drawPattern(url, color, mainCtx) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = 160; 
            tempCanvas.height = 320;

            // Draw color and mask with pattern
            tempCtx.fillStyle = color;
            tempCtx.fillRect(0, 0, 160, 320);
            tempCtx.globalCompositeOperation = "destination-in";
            tempCtx.drawImage(img, 0, 0, 160, 320);

            // Layer onto main banner
            mainCtx.drawImage(tempCanvas, 0, 0);
            resolve();
        };
        img.onerror = () => {
            console.warn("Could not load pattern:", url);
            resolve();
        };
    });
}

/**
 * Saves the current canvas as a PNG file.
 */
function downloadBanner() {
    const canvas = document.getElementById('bannerCanvas');
    const link = document.createElement('a');
    link.download = 'minecraft_banner.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Fire it up!
init();