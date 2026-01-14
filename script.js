        const enzymes = {
            'Trypsin': { residues: ['K', 'R'], color: '#ff6b6b', description: 'Cleaves after K, R' },
            'Lys-C': { residues: ['K'], color: '#e74c3c', description: 'Cleaves after K' },
            'Arg-C': { residues: ['R'], color: '#c0392b', description: 'Cleaves after R' },
            'Glu-C': { residues: ['E'], color: '#e67e22', description: 'Cleaves after E' },
            'Asp-N': { residues: ['D'], color: '#d35400', description: 'Cleaves before D' },
            'Chymotrypsin': { residues: ['F', 'Y', 'W'], color: '#4ecdc4', description: 'Cleaves after F, Y, W' },
            'Pepsin': { residues: ['F', 'L'], color: '#45b7d1', description: 'Cleaves after F, L' },
            'Elastase': { residues: ['A', 'V', 'S', 'G'], color: '#f9ca24', description: 'Cleaves after A, V, S, G' },
            'Thermolysin': { residues: ['L', 'I', 'V'], color: '#6c5ce7', description: 'Cleaves before L, I, V' },
            'Caspase-3': { residues: ['D'], color: '#fd79a8', description: 'Cleaves after D (DEVD motif)' },
            'Thrombin': { residues: ['R'], color: '#a29bfe', description: 'Cleaves after R' },
            'Factor Xa': { residues: ['R'], color: '#74b9ff', description: 'Cleaves after R (IEGR motif)' }
        };

        const ptms = {
            'Phosphorylation (S)': { residues: ['S'], color: '#ff1744', description: 'Phosphoserine', symbol: 'pS' },
            'Phosphorylation (T)': { residues: ['T'], color: '#d500f9', description: 'Phosphothreonine', symbol: 'pT' },
            'Phosphorylation (Y)': { residues: ['Y'], color: '#651fff', description: 'Phosphotyrosine', symbol: 'pY' },
            'Phosphorylation (S/T)': { residues: ['S', 'T'], color: '#ff6d00', description: 'Phosphoserine/Threonine', symbol: 'pS/T' },
            'Phosphorylation (S/T/Y)': { residues: ['S', 'T', 'Y'], color: '#00bfa5', description: 'All phosphosites', symbol: 'pSTY' },
            'N-Glycosylation (N)': { residues: ['N'], color: '#2979ff', description: 'N-glycosylation site', symbol: 'gN' },
            'O-Glycosylation (S/T)': { residues: ['S', 'T'], color: '#00b8d4', description: 'O-glycosylation site', symbol: 'gS/T' },
            'Acetylation (K)': { residues: ['K'], color: '#ffd600', description: 'Lysine acetylation', symbol: 'acK' },
            'Methylation (K)': { residues: ['K'], color: '#ffab00', description: 'Lysine methylation', symbol: 'meK' },
            'Methylation (R)': { residues: ['R'], color: '#ff6f00', description: 'Arginine methylation', symbol: 'meR' },
            'Ubiquitination (K)': { residues: ['K'], color: '#dd2c00', description: 'Lysine ubiquitination', symbol: 'ubK' },
            'Sumoylation (K)': { residues: ['K'], color: '#c51162', description: 'Lysine sumoylation', symbol: 'suK' }
        };

        const enzymeGrid = document.getElementById('enzymeGrid');
        const ptmGrid = document.getElementById('ptmGrid');
        const sequenceInput = document.getElementById('sequence');
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

        // Create PTM checkboxes
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

        sequenceInput.addEventListener('input', highlightSequence);

        function highlightSequence() {
            const sequence = sequenceInput.value.toUpperCase().replace(/\s/g, '');
            const selectedEnzymes = Array.from(document.querySelectorAll('.enzyme-checkbox:checked'))
                .map(cb => cb.value);
            const selectedPTMs = Array.from(document.querySelectorAll('.ptm-checkbox:checked'))
                .map(cb => cb.value);

            if (!sequence || (selectedEnzymes.length === 0 && selectedPTMs.length === 0)) {
                resultDiv.innerHTML = '<div class="empty-state">Enter a sequence and select enzymes/PTMs to see cleavage sites</div>';
                statsDiv.innerHTML = '';
                legendDiv.innerHTML = '';
                return;
            }

            // Create a map of position to modifications
            const positionColors = {};
            const cleavageCounts = {};
            const ptmCounts = {};

            // Process enzymes
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
                                color: enzyme.color,
                                type: 'enzyme'
                            });
                            cleavageCounts[enzymeName]++;
                        }
                    }
                });
            });

            // Process PTMs
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
                                type: 'ptm',
                                symbol: ptm.symbol
                            });
                            ptmCounts[ptmName]++;
                        }
                    }
                });
            });

            // Build highlighted sequence
            let html = '';
            for (let i = 0; i < sequence.length; i++) {
                const char = sequence[i];
                if (positionColors[i]) {
                    // Prioritize PTMs over enzymes if both present
                    const ptmMods = positionColors[i].filter(m => m.type === 'ptm');
                    const enzymeMods = positionColors[i].filter(m => m.type === 'enzyme');
                    
                    if (ptmMods.length > 0) {
                        const color = ptmMods[0].color;
                        html += `<span class="highlight" style="background-color: ${color}; color: white;" title="${ptmMods.map(m => m.name).join(', ')}">${char}</span>`;
                    } else {
                        const color = enzymeMods[0].color;
                        html += `<span class="highlight" style="background-color: ${color}; color: white;" title="${enzymeMods.map(m => m.name).join(', ')}">${char}</span>`;
                    }
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
            
            if (selectedPTMs.length > 0) {
                statsHtml += '<div class="stats-item" style="margin-top: 10px;"><strong>PTM Sites:</strong></div>';
                selectedPTMs.forEach(name => {
                    statsHtml += `<div class="stats-item" style="margin-left: 15px;">${name}: ${ptmCounts[name]} site(s)</div>`;
                });
            }
            
            statsHtml += '</div>';
            statsDiv.innerHTML = statsHtml;

            // Show legend
            let legendHtml = '<div class="color-legend">';
            legendHtml += '<div class="legend-title">Color Legend:</div>';
            legendHtml += '<div class="legend-items">';
            
            selectedEnzymes.forEach(name => {
                const enzyme = enzymes[name];
                legendHtml += `
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: ${enzyme.color};"></div>
                        <span><strong>${name}:</strong> ${enzyme.residues.join(', ')}</span>
                    </div>
                `;
            });
            
            selectedPTMs.forEach(name => {
                const ptm = ptms[name];
                legendHtml += `
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: ${ptm.color};"></div>
                        <span><strong>${name}:</strong> ${ptm.residues.join(', ')}</span>
                    </div>
                `;
            });
            
            legendHtml += '</div></div>';
            legendDiv.innerHTML = legendHtml;
        }
