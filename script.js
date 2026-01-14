// All proteases use the same red color
const PROTEASE_COLOR = '#dc3545';

const enzymes = {
    'Trypsin': { residues: ['K', 'R'], description: 'Cleaves after K, R' },
    'Lys-C': { residues: ['K'], description: 'Cleaves after K' },
    'Arg-C': { residues: ['R'], description: 'Cleaves after R' },
    'Glu-C': { residues: ['E'], description: 'Cleaves after E' },
    'Asp-N': { residues: ['D'], description: 'Cleaves before D' },
    'Chymotrypsin': { residues: ['F', 'Y', 'W'], description: 'Cleaves after F, Y, W' },
    'Pepsin': { residues: ['F', 'L'], description: 'Cleaves after F, L' },
    'Elastase': { residues: ['A', 'V', 'S', 'G'], description: 'Cleaves after A, V, S, G' },
    'Thermolysin': { residues: ['L', 'I', 'V'], description: 'Cleaves before L, I, V' },
    'Caspase-3': { residues: ['D'], description: 'Cleaves after D (DEVD motif)' },
    'Thrombin': { residues: ['R'], description: 'Cleaves after R' },
    'Factor Xa': { residues: ['R'], description: 'Cleaves after R (IEGR motif)' }
};

// PTMs with distinct colors (avoiding red/orange/pink)
const ptms = {
    'N-Glycosylation': { residues: ['N'], color: '#0066cc', description: 'N-glycosylation site' },
    'O-Glycosylation': { residues: ['S', 'T'], color: '#00cc99', description: 'O-glycosylation site' },
    'Acetylation (K)': { residues: ['K'], color: '#9933ff', description: 'Lysine acetylation' },
    'Methylation (K)': { residues: ['K'], color: '#6600cc', description: 'Lysine methylation' },
    'Methylation (R)': { residues: ['R'], color: '#3366ff', description: 'Arginine methylation' },
    'Ubiquitination (K)': { residues: ['K'], color: '#0099cc', description: 'Lysine ubiquitination' },
    'Sumoylation (K)': { residues: ['K'], color: '#00aa88', description: 'Lysine sumoylation' }
};

// Phosphorylation uses purple for all sites
const PHOSPHO_COLOR = '#8b00ff';

const enzymeGrid = document.getElementById('enzymeGrid');
const ptmGrid = document.getElementById('ptmGrid');
const sequenceInput = document.getElementById('sequence');
const customPositionsInput = document.getElementById('customPositions');
const resultDiv = document.getElementById('result');
const statsDiv = document.getElementById('stats');
const legendDiv = document.getElementById('legend');

// Create enzyme checkboxes
Object.keys(enzymes).forEach(name => {
    const div = document.createElement('div');
    div.className = 'enzyme-option';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `enzyme_${name}`;
    checkbox.value = name;
    checkbox.className = 'enzyme-checkbox';
    checkbox.addEventListener('change', highlightSequence);
    
    const label = document.createElement('label');
    label.htmlFor = `enzyme_${name}`;
    label.textContent = name;
    
    div.appendChild(checkbox);
    div.appendChild(label);
    enzymeGrid.appendChild(div);
});

// Create PTM checkboxes (excluding phosphorylation)
Object.keys(ptms).forEach(name => {
    const div = document.createElement('div');
    div.className = 'enzyme-option';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `ptm_${name}`;
    checkbox.value = name;
    checkbox.className = 'ptm-checkbox';
    checkbox.addEventListener('change', highlightSequence);
    
    const label = document.createElement('label');
    label.htmlFor = `ptm_${name}`;
    label.textContent = name;
    
    div.appendChild(checkbox);
    div.appendChild(label);
    ptmGrid.appendChild(div);
});

// Add event listeners for phosphorylation checkboxes
document.querySelectorAll('.ptm-phos-checkbox').forEach(cb => {
    cb.addEventListener('change', highlightSequence);
});

sequenceInput.addEventListener('input', highlightSequence);
customPositionsInput.addEventListener('input', highlightSequence);

function highlightSequence() {
    const sequence = sequenceInput.value.toUpperCase().replace(/\s/g, '');
    const selectedEnzymes = Array.from(document.querySelectorAll('.enzyme-checkbox:checked'))
        .map(cb => cb.value);
    const selectedPTMs = Array.from(document.querySelectorAll('.ptm-checkbox:checked'))
        .map(cb => cb.value);
    const selectedPhospho = Array.from(document.querySelectorAll('.ptm-phos-checkbox:checked'))
        .map(cb => cb.value);
    
    // Parse custom positions
    const customPositionsText = customPositionsInput.value.trim();
    const customPositions = new Set();
    if (customPositionsText) {
        customPositionsText.split(',').forEach(pos => {
            const parsed = parseInt(pos.trim());
            if (!isNaN(parsed) && parsed > 0) {
                customPositions.add(parsed - 1); // Convert to 0-based index
            }
        });
    }

    if (!sequence || (selectedEnzymes.length === 0 && selectedPTMs.length === 0 && selectedPhospho.length === 0 && customPositions.size === 0)) {
        resultDiv.innerHTML = '<div class="empty-state">Enter a sequence and select enzymes/PTMs to see cleavage sites</div>';
        statsDiv.innerHTML = '';
        legendDiv.innerHTML = '';
        return;
    }

    // Create a map of position to modifications
    const positionColors = {};
    const cleavageCounts = {};
    const ptmCounts = {};
    let phosphoCount = 0;

    // Process enzymes (all use red)
    selectedEnzymes.forEach(enzymeName => {
        const enzyme = enzymes[enzymeName];
        cleavageCounts[enzymeName] = 0;
        
        enzyme.residues.forEach(residue => {
            for (let i = 0; i < sequence.length; i++) {
                if (sequence[i] === residue) {
                    if (!positionColors[i]) {
                        positionColors[i] = [];
                    }
                    positionColors[i].push({
                        name: enzymeName,
                        color: PROTEASE_COLOR,
                        type: 'enzyme'
                    });
                    cleavageCounts[enzymeName]++;
                }
            }
        });
    });

    // Process phosphorylation (all use purple)
    if (selectedPhospho.length > 0) {
        selectedPhospho.forEach(residue => {
            for (let i = 0; i < sequence.length; i++) {
                if (sequence[i] === residue) {
                    if (!positionColors[i]) {
                        positionColors[i] = [];
                    }
                    positionColors[i].push({
                        name: `Phosphorylation (${residue})`,
                        color: PHOSPHO_COLOR,
                        type: 'phospho'
                    });
                    phosphoCount++;
                }
            }
        });
    }

    // Process other PTMs
    selectedPTMs.forEach(ptmName => {
        const ptm = ptms[ptmName];
        ptmCounts[ptmName] = 0;
        
        ptm.residues.forEach(residue => {
            for (let i = 0; i < sequence.length; i++) {
                if (sequence[i] === residue) {
                    if (!positionColors[i]) {
                        positionColors[i] = [];
                    }
                    positionColors[i].push({
                        name: ptmName,
                        color: ptm.color,
                        type: 'ptm'
                    });
                    ptmCounts[ptmName]++;
                }
            }
        });
    });

    // Build highlighted sequence with UniProt-style formatting (groups of 10)
    let html = '';
    for (let i = 0; i < sequence.length; i++) {
        const char = sequence[i];
        
        // Add space every 10 amino acids
        if (i > 0 && i % 10 === 0) {
            html += ' ';
        }
        
        const isCustomPosition = customPositions.has(i);
        const hasColor = positionColors[i];
        
        if (hasColor || isCustomPosition) {
            let style = '';
            let cssClass = 'highlight';
            let title = '';
            
            if (hasColor) {
                // Prioritize PTMs over enzymes if both present
                const ptmMods = positionColors[i].filter(m => m.type === 'ptm' || m.type === 'phospho');
                const enzymeMods = positionColors[i].filter(m => m.type === 'enzyme');
                
                if (ptmMods.length > 0) {
                    style = `background-color: ${ptmMods[0].color}; color: white;`;
                } else {
                    style = `background-color: ${PROTEASE_COLOR}; color: white;`;
                }
                
                title = [...new Set(positionColors[i].map(m => m.name))].join(', ');
            }
            
            if (isCustomPosition) {
                cssClass += ' boxed';
                if (title) {
                    title += `, Position ${i + 1}`;
                } else {
                    title = `Position ${i + 1}`;
                }
            }
            
            html += `<span class="${cssClass}" style="${style}" title="${title}">${char}</span>`;
        } else {
            html += char;
        }
    }

    resultDiv.innerHTML = html;

    // Show statistics
    let statsHtml = '<div class="stats">';
    statsHtml += `<div class="stats-item"><strong>Sequence Length:</strong> ${sequence.length} amino acids</div>`;
    
    if (selectedEnzymes.length > 0) {
        statsHtml += '<div class="stats-item" style="margin-top: 10px;"><strong>Protease Cleavage Sites:</strong></div>';
        selectedEnzymes.forEach(name => {
            statsHtml += `<div class="stats-item" style="margin-left: 15px;">${name}: ${cleavageCounts[name]} site(s)</div>`;
        });
    }
    
    if (selectedPhospho.length > 0 || selectedPTMs.length > 0) {
        statsHtml += '<div class="stats-item" style="margin-top: 10px;"><strong>PTM Sites:</strong></div>';
        
        if (selectedPhospho.length > 0) {
            statsHtml += `<div class="stats-item" style="margin-left: 15px;">Phosphorylation (${selectedPhospho.join('/')}): ${phosphoCount} site(s)</div>`;
        }
        
        selectedPTMs.forEach(name => {
            statsHtml += `<div class="stats-item" style="margin-left: 15px;">${name}: ${ptmCounts[name]} site(s)</div>`;
        });
    }
    
    if (customPositions.size > 0) {
        const sortedPositions = Array.from(customPositions).sort((a, b) => a - b).map(p => p + 1);
        statsHtml += '<div class="stats-item" style="margin-top: 10px;"><strong>Custom Positions:</strong></div>';
        statsHtml += `<div class="stats-item" style="margin-left: 15px;">${customPositions.size} position(s): ${sortedPositions.join(', ')}</div>`;
    }
    
    statsHtml += '</div>';
    statsDiv.innerHTML = statsHtml;

    // Show legend
    let legendHtml = '<div class="color-legend">';
    legendHtml += '<div class="legend-title">Color Legend:</div>';
    legendHtml += '<div class="legend-items">';
    
    if (selectedEnzymes.length > 0) {
        legendHtml += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${PROTEASE_COLOR};"></div>
                <span><strong>All Proteases</strong></span>
            </div>
        `;
    }
    
    if (selectedPhospho.length > 0) {
        legendHtml += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${PHOSPHO_COLOR};"></div>
                <span><strong>Phosphorylation (${selectedPhospho.join('/')})</strong></span>
            </div>
        `;
    }
    
    selectedPTMs.forEach(name => {
        const ptm = ptms[name];
        legendHtml += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${ptm.color};"></div>
                <span><strong>${name}:</strong> ${ptm.residues.join(', ')}</span>
            </div>
        `;
    });
    
    if (customPositions.size > 0) {
        legendHtml += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: white; border: 3px solid #FFD700; box-shadow: 0 0 8px rgba(255, 215, 0, 0.8);"></div>
                <span><strong>Custom Positions</strong> (gold border with glow)</span>
            </div>
        `;
    }
    
    legendHtml += '</div></div>';
    legendDiv.innerHTML = legendHtml;
}
