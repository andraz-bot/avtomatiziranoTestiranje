const fs = require('fs');
const path = require('path');

async function generirajPorocila() {
    const korenPorocil = path.join(__dirname, '../reports');
    const jsonDir = path.join(korenPorocil, 'json-reports');
    const htmlDir = path.join(korenPorocil, 'html-reports');

    [korenPorocil, jsonDir, htmlDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    const logPath = path.join(__dirname, '../rezultati.txt');
    const timestamp = new Date().toLocaleString('sl-SI').replace(/[:\s]/g, '-');

    if (!fs.existsSync(logPath)) {
        console.log("Ni podatkov za poročilo (rezultati.txt manjka).");
        return;
    }

    try {
        const vsebina = fs.readFileSync(logPath, 'utf-8');
        const rawLines = vsebina.split('\n').filter(line => line.trim().length > 0);

        const podatki = {
            meta: {
                datum: new Date().toLocaleString('sl-SI'),
                projekt: "PIS-UA Avtomatizacijsko testiranje"
            },
            statistika: { skupaj: 0, uspesni: 0, napak: 0, skupniCas: 0 },
            rezultati: []
        };

        rawLines.forEach(line => {
            const deli = line.split(';');
            if (deli.length < 4) return;

            const id = deli[0]?.trim();
            const skupina = deli[1]?.trim();
            const funkcionalnost = deli[2]?.trim();
            const statusRaw = (deli[3] || "NAPAKA").trim().toUpperCase();
            const napakaRaw = deli[4] || "";
            const screenshotRaw = deli[5]?.trim() || "";
            const trajanje = parseFloat(deli[6]) || 0;

            const jeUspel = statusRaw === 'USPEL';

            podatki.rezultati.push({
                id,
                skupina,
                funkcionalnost,
                status: jeUspel ? "USPEL" : "NAPAKA",
                napaka: napakaRaw.trim(),
                screenshot: screenshotRaw,
                trajanje: trajanje
            });

            podatki.statistika.skupaj++;
            podatki.statistika.skupniCas += trajanje;
            if (jeUspel) {
                podatki.statistika.uspesni++;
            } else {
                podatki.statistika.napak++;
            }
        });

        const jsonPath = path.join(jsonDir, `POROČILO_${timestamp}.json`);
        const jsonVsebina = JSON.stringify(podatki, (key, value) => {
            if (key === 'screenshot') return undefined;
            return value;
        }, 2);
        fs.writeFileSync(jsonPath, jsonVsebina, 'utf-8');

        const htmlVsebina = generirajHtml(podatki);
        const htmlPath = path.join(htmlDir, `VIZUALNO_POROČILO_${timestamp}.html`);
        fs.writeFileSync(htmlPath, htmlVsebina, 'utf-8');

        console.log(`JSON shranjen v: /JSON/`);
        console.log(`HTML shranjen v: /VizualnaPoročila/`);

        if (fs.existsSync(logPath)) fs.unlinkSync(logPath);

    } catch (err) {
        console.error("Kritična napaka pri obdelavi:", err.message);
    }
}

function generirajHtml(d) {
    const totalSec = d.statistika.skupniCas;
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = (totalSec % 60).toFixed(1);
    const formatiranSkupniCas = `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;

    const vsebinaTabele = d.rezultati.map(r => {
        const korakiHtml = r.podrobnostiKorakov ? `
        <ul style="margin: 5px 0; padding-left: 20px; font-size: 11px; color: #475569;">
            ${r.podrobnostiKorakov.split('|').map(k => `<li>${k.trim()}</li>`).join('')}
        </ul>
    ` : '';

        return `
        <tr class="test-row ${r.status === 'USPEL' ? 'uspeh' : 'napaka'}">
            <td class="id-cell"><strong>${r.id}</strong></td>
            <td class="group-cell">${r.skupina}</td>
            <td class="func-cell">${r.funkcionalnost}</td>
            <td class="status-cell"><span class="status-badge">${r.status}</span></td>
            <td class="error-cell">
                <div class="error-text">${r.napaka ? r.napaka : '<span class="no-error">/</span>'}</div>
                ${korakiHtml} ${r.screenshot ? `
                    <div class="screenshot-container">
                        <a href="../../${r.screenshot}" target="_blank" class="btn-screenshot">
                            📸 Slika zaslona ob napaki
                        </a>
                    </div>
                ` : ''}
            </td>
            <td class="duration-cell" style="font-weight: 600; color: #64748b; white-space: nowrap;">${r.trajanje}s</td>
        </tr>
    `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html lang="sl">
    <head>
        <meta charset="UTF-8">
        <style>
            :root {
                --igea-navy: #1a4b69;
                --igea-blue: #0ea5e9;
                --bg-main: #f3f4f6;
                --success: #10b981;
                --error: #ef4444;
                --text-dark: #1e293b;
                --time-gray: #64748b;
            }

            body {
                font-family: 'Segoe UI', system-ui, sans-serif;
                background-color: var(--bg-main);
                color: var(--text-dark);
                margin: 0;
                padding: 40px 20px;
            }

            .container {
                max-width: 1400px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                border-top: 6px solid var(--igea-navy);
            }

            h1 { color: var(--igea-navy); margin: 0 0 8px 0; font-size: 28px; }
            .meta-info { color: #64748b; font-size: 14px; margin-bottom: 35px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }

            .stats { display: flex; gap: 20px; margin-bottom: 40px; }
            .stat-box {
                flex: 1;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                color: white;
                cursor: pointer;
                transition: 0.2s;
            }
            .stat-box:hover { transform: translateY(-3px); opacity: 0.9; }

            .total { background: var(--igea-navy); }
            .pass { background: var(--success); }
            .fail { background: var(--error); }
            .time { background: var(--time-gray); cursor: default; }
            .time:hover { transform: none; opacity: 1; }

            .stat-value { font-size: 32px; font-weight: 800; display: block; }
            .stat-label { font-size: 11px; text-transform: uppercase; font-weight: 700; opacity: 0.9; }

            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 12px 15px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #f1f5f9; }

            .test-row td { padding: 18px 15px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; vertical-align: top; }
            .test-row:hover td { background-color: #fcfdfe; }

            .id-cell { color: var(--igea-navy); width: 80px; }
            .group-cell { width: 150px; color: #64748b; font-weight: 500; }
            .func-cell { width: 250px; font-weight: 600; }
            .status-cell { width: 100px; }

            .status-badge { font-weight: 700; font-size: 10px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
            .uspeh .status-badge { background: #dcfce7; color: #166534; }
            .napaka .status-badge { background: #fee2e2; color: #991b1b; }

            .screenshot-container { margin-top: 10px; }
            .btn-screenshot {
                display: inline-block;
                padding: 6px 12px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                color: var(--igea-navy);
                text-decoration: none;
                font-size: 11px;
                font-weight: 600;
            }
            .btn-screenshot:hover { border-color: var(--igea-blue); background: #f8fafc; }

            .error-text { font-family: 'Consolas', monospace; font-size: 12px; color: #475569; white-space: pre-wrap; word-break: break-all; }
            .no-error { color: #cbd5e1; }
            .hidden { display: none !important; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Poročilo Avtomatskega Testiranja</h1>
            <div class="meta-info"><strong>Projekt:</strong> ${d.meta.projekt} | <strong>Datum:</strong> ${d.meta.datum}</div>

            <div class="stats">
                <div class="stat-box total" onclick="filtriraj('vse')">
                    <span class="stat-label">Vsi testi</span>
                    <span class="stat-value">${d.statistika.skupaj}</span>
                </div>
                <div class="stat-box pass" onclick="filtriraj('uspeh')">
                    <span class="stat-label">Uspešno</span>
                    <span class="stat-value">${d.statistika.uspesni}</span>
                </div>
                <div class="stat-box fail" onclick="filtriraj('napaka')">
                    <span class="stat-label">Napake</span>
                    <span class="stat-value">${d.statistika.napak}</span>
                </div>
                <div class="stat-box time">
                    <span class="stat-label">Skupni čas testiranja</span>
                    <span class="stat-value">${formatiranSkupniCas}</span>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Skupina</th>
                        <th>Funkcionalnost</th>
                        <th>Status</th>
                        <th>Podrobnosti/napake</th>
                        <th>Čas testiranja</th>
                    </tr>
                </thead>
                <tbody>
                    ${vsebinaTabele}
                </tbody>
            </table>
        </div>

        <script>
            function filtriraj(f) {
                document.querySelectorAll('.test-row').forEach(r => {
                    if (f === 'vse' || r.classList.contains(f)) r.classList.remove('hidden');
                    else r.classList.add('hidden');
                });
            }
        </script>
    </body>
    </html>`;
}

generirajPorocila();