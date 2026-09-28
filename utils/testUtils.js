import {expect} from "@playwright/test";

export class TestUtils {
    constructor(page, lokator) {
        this.page = page;
        this.lokator = lokator;
    }

    async odpiranjeGrafike() {
        await this.lokator.globusBtn.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.lokator.grafikaNaslov).toBeVisible();
        await expect(this.lokator.grafikaNaslov).toHaveText('GRAFIKA');
        console.log("✅ Grafika je odprta.");
    }

    async navigirajDoGrafike(IDakta) {
        await this.page.reload({waitUntil: 'domcontentloaded'});
        await this.page.waitForTimeout(1000);

        await this.lokator.IDUpravnegaAkta.waitFor({state: 'visible', timeout: 10000});
        await this.lokator.IDUpravnegaAkta.click({force: true});
        await this.lokator.IDUpravnegaAkta.clear();
        await this.lokator.IDUpravnegaAkta.fill(IDakta);

        await this.lokator.gumbIsci.click({force: true});

        const pravaVrstica = this.page.locator('tr[resultrow="true"]')
            .filter({hasText: IDakta})
            .first();

        await pravaVrstica.waitFor({state: 'visible', timeout: 15000});
        await pravaVrstica.click({force: true});

        await this.page.waitForLoadState('domcontentloaded');

        await this.lokator.objekti.waitFor({state: 'visible', timeout: 5000});
        await this.lokator.objekti.click({force: true});
        await this.page.waitForLoadState('networkidle').catch(() => {
        });

        await this.lokator.urediGumb.waitFor({state: 'visible', timeout: 5000});
        await this.lokator.urediGumb.click({force: true});
        await this.page.waitForLoadState('networkidle').catch(() => {
        });

        await this.odpiranjeGrafike();
    }

    async izklopiDOF() {
        await this.lokator.DOF5Sloj.waitFor({state: 'visible', timeout: 5000});
        await this.lokator.DOF5Sloj.click({force: true});

        console.log("✅ Sloj DOF5 je izklopljen.");
    }

    async nastaviMeriloMape(meriloId) {
        const odpriMeniGumb = this.page.locator('i.fas.fa-caret-up[data-toggle="dropdown"]');
        await odpriMeniGumb.waitFor({state: 'visible', timeout: 5000});
        await odpriMeniGumb.click({force: true});

        const meni = this.page.locator('ul.dropdown-menu.show');
        await meni.waitFor({state: 'visible', timeout: 5000});

        const izbiraMerila = meni.locator('span', { hasText: new RegExp(`^1\\s*:\\s*${meriloId}$`) });

        await izbiraMerila.waitFor({state: 'visible', timeout: 5000});
        await izbiraMerila.click();

        await this.page.waitForLoadState('networkidle');
        console.log(`✅ Merilo mape uspešno nastavljeno na 1 : ${meriloId}`);
    }

    async odpriAktzID(IDakta){
        await this.page.reload({waitUntil: 'domcontentloaded'});
        await this.page.waitForTimeout(1000);

        await this.lokator.IDUpravnegaAkta.waitFor({state: 'visible', timeout: 10000});
        await this.lokator.IDUpravnegaAkta.click({force: true});
        await this.lokator.IDUpravnegaAkta.clear();
        await this.lokator.IDUpravnegaAkta.fill(IDakta);

        await this.lokator.gumbIsci.click({force: true});


        const pravaVrstica = this.page.locator('tr[resultrow="true"]')
            .filter({hasText: IDakta})
            .first();

        await pravaVrstica.waitFor({state: 'visible', timeout: 15000});
        await pravaVrstica.click({force: true});
    }

    async nastaviParcelnoStevilkoInIsci(){
        if (await this.lokator.napredniMeni.isVisible()) {
            await this.lokator.napredniMeni.click();
        }

        const izberiSelect2 = async (containerId, tekstZaIskanje, regexOpcije) => {
            await this.page.locator('span.select2-selection--single').filter({
                has: this.page.locator(`#${containerId}`)
            }).click();

            await this.lokator.vnosnoPolje.waitFor({ state: 'visible', timeout: 5000 });
            await this.lokator.vnosnoPolje.clear();
            await this.lokator.vnosnoPolje.fill(tekstZaIskanje);

            const opcija = this.lokator.dobiOpcijoPoRegexu(regexOpcije);
            await opcija.waitFor({ state: 'visible', timeout: 5000 });
            await opcija.click();
        };

        await izberiSelect2('select2-obcinaInput-container', '676', '676 PEKRE');
        await this.page.waitForTimeout(500);
        await izberiSelect2('select2-parcelaInput-container', '7/1', /^7\/1$/);

        await this.lokator.gumbIsci.click();
        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async nastaviKatastrskoObcinoInIsci(){
        if (await this.lokator.napredniMeni.isVisible()) {
            await this.lokator.napredniMeni.click();
        }

        await this.lokator.obcinaDropdown.click();

        await this.lokator.vnosnoPolje.waitFor({ state: 'visible' });
        await this.lokator.vnosnoPolje.click();
        await this.page.keyboard.type("676");

        await this.lokator.opcijaObcine.waitFor({ state: 'visible' });
        await this.lokator.opcijaObcine.click();

        await this.page.waitForTimeout(1000);

        await this.lokator.gumbIsci.click();
        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async nastaviFiltreInIsci() {
        if (await this.lokator.napredniMeni.isVisible()) {
            await this.lokator.napredniMeni.click();
        }

        const pocistiVir = this.lokator.virDropdown.locator('.select2-selection__clear');
        if (await pocistiVir.isVisible().catch(() => false)) {
            await pocistiVir.click({ force: true });
        }

        await this.lokator.virDropdown.click({force: true});
        await this.lokator.opcijaeGraditev.waitFor({ state: 'visible', timeout: 5000 });
        await this.lokator.opcijaeGraditev.click();

        await Promise.all([
            this.page.waitForLoadState('domcontentloaded').catch(() => {}),
            this.lokator.gumbIsci.click()
        ]);

        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async nastaviLetoPrijaveInIsci(){
        const letoPrijave = this.page.locator('#letoPrijaveInput');
        const gumbNapredno = this.page.locator('#advancedButton');

        if (!(await letoPrijave.isVisible())) {
            await gumbNapredno.waitFor({ state: 'visible', timeout: 5000 });
            await gumbNapredno.click();
            await letoPrijave.waitFor({ state: 'visible', timeout: 5000 });
        }

        await letoPrijave.click();
        await letoPrijave.clear();
        await letoPrijave.fill('2018');

        await this.lokator.gumbIsci.click();
        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async nastaviInvestitorjaInIsci() {
        if (await this.lokator.napredniMeni.isVisible()) {
            await this.lokator.napredniMeni.click();
        }

        const izberiSelect2 = async (containerId, tekstZaIskanje, regexOpcije) => {
            await this.page.locator('span.select2-selection--single').filter({
                has: this.page.locator(`#${containerId}`)
            }).click();

            await this.lokator.vnosnoPolje.waitFor({ state: 'visible', timeout: 5000 });
            await this.lokator.vnosnoPolje.clear();
            await this.lokator.vnosnoPolje.fill(tekstZaIskanje);

            const opcija = this.lokator.dobiOpcijoPoRegexu(regexOpcije);
            await opcija.waitFor({ state: 'visible', timeout: 5000 });
            await opcija.click();
        };

        await izberiSelect2('select2-investitorInput-container', 'BOŠTJAN ZALETELJ', 'BOŠTJAN ZALETELJ');

        await this.lokator.gumbIsci.click();
        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async nastaviNosilcaInIsci() {
        if (await this.lokator.napredniMeni.isVisible()) {
            await this.lokator.napredniMeni.click();
        }

        await this.lokator.nosilecDropdown.click();

        await this.lokator.vnosnoPolje.waitFor({state: 'visible', timeout: 5000});

        await this.lokator.vnosnoPolje.pressSequentially("KOS TANJA", {delay: 100});

        await this.lokator.opcijaNosilec.waitFor({state: 'visible'});
        await this.lokator.opcijaNosilec.click();

        await this.lokator.gumbIsci.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.locator('tr[resultrow="true"]').first().waitFor({state: 'visible', timeout: 10000});
    }

    async nastaviOznakoGradbeneParceleInIsci() {
        await this.lokator.napredniMeni.click();
        const izberiSelect2 = async (containerId, tekstZaIskanje, regexOpcije) => {
            await this.page.locator('span.select2-selection--single').filter({
                has: this.page.locator(`#${containerId}`)
            }).click();

            await this.lokator.vnosnoPolje.waitFor({ state: 'visible', timeout: 5000 });
            await this.lokator.vnosnoPolje.clear();
            await this.lokator.vnosnoPolje.fill(tekstZaIskanje);

            const opcija = this.lokator.dobiOpcijoPoRegexu(regexOpcije);
            await opcija.waitFor({ state: 'visible', timeout: 5000 });
            await opcija.click();
        };

        await izberiSelect2('select2-oznakaGPInput-container', 'GP_2000000_1', /^GP_2000000_1$/i);

        await this.lokator.gumbIsci.click();
        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async izbiraSlojev(vhodniSloji) {
        const ciljniSloji = Array.isArray(vhodniSloji) ? vhodniSloji : [vhodniSloji];

        await this.lokator.izbraneVsebine.waitFor({ state: 'visible', timeout: 10000 });

        await this.lokator.izbraneVsebine.scrollIntoViewIfNeeded();

        await this.lokator.izbraneVsebine.click({ force: true });

        await this.lokator.celotnaVsebina.waitFor({ state: 'visible', timeout: 5000 });

        let zaprteMape = this.page.locator('#cloud_legenda span.fas.fa-chevron-right');
        while (await zaprteMape.count() > 0) {
            const stZaprtih = await zaprteMape.count();
            let kliknil = false;

            for (let j = 0; j < stZaprtih; j++) {
                const mapa = zaprteMape.nth(j);
                if (await mapa.isVisible()) {
                    await mapa.scrollIntoViewIfNeeded().catch(() => {});
                    await mapa.click({ force: true });
                    kliknil = true;
                    await this.page.waitForTimeout(20);
                }
            }

            if (!kliknil) break;
            zaprteMape = this.page.locator('#cloud_legenda span.fas.fa-chevron-right');
        }

        const vrsticeSlojev = this.lokator.vsiSlojiVVsebini;
        const stVrstic = await vrsticeSlojev.count();
        console.log(`Skupaj najdenih vrstic slojev: ${stVrstic}`);

        const obdelaniSloji = new Set();

        for (let i = 0; i < stVrstic; i++) {
            const vrstica = vrsticeSlojev.nth(i);
            const besediloElement = vrstica.locator('span.text').first();

            if (!(await besediloElement.isVisible().catch(() => false))) continue;
            const besediloSloja = await besediloElement.textContent().catch(() => "");
            const trimmedBesedilo = besediloSloja ? besediloSloja.trim() : "";

            if (!trimmedBesedilo) continue;

            await vrstica.scrollIntoViewIfNeeded().catch(() => {});

            const checkbox = vrstica.locator('i.list-checkbox');
            if (!(await checkbox.isVisible().catch(() => false))) continue;

            const razredi = await checkbox.getAttribute('class').catch(() => "") || "";
            const jeObkljukan = razredi.includes('fa-check-square');

            const jeTargetSloj = ciljniSloji.includes(trimmedBesedilo);

            if (jeTargetSloj) {
                if (!obdelaniSloji.has(trimmedBesedilo)) {
                    if (!jeObkljukan) {
                        await checkbox.scrollIntoViewIfNeeded().catch(() => {});
                        await checkbox.click({ force: true });
                        console.log(`✅ Označujem ciljni sloj: ${trimmedBesedilo}`);
                    } else {
                        console.log(`🛡️ Ciljni sloj je že označen: ${trimmedBesedilo}`);
                    }
                    obdelaniSloji.add(trimmedBesedilo);
                } else {
                    console.log(`ℹ️ Preskakujem kasnejšo ponovitev sloja: ${trimmedBesedilo}`);
                }
            } else {
                if (jeObkljukan) {
                    await checkbox.scrollIntoViewIfNeeded().catch(() => {});
                    await checkbox.click({ force: true });
                    console.log(`☑️ Odznačujem sloj: ${trimmedBesedilo}`);
                }
            }
        }

        console.log(`✅ Stanje vsebine urejeno: Samo sloji [${ciljniSloji.join(', ')}] so aktivni.`);

        await this.page.locator('#cloud_legenda').evaluate(el => el.scrollTop = 0).catch(() => {});
        await this.page.waitForTimeout(100);
        await this.lokator.izbraneVsebine.click();
        await this.page.waitForTimeout(300);
    }

    async vklopPoizvedovanja(vrstaPoizvedovanja){
        await this.lokator.poizvedovanjeDropdown.waitFor({state: 'visible', timeout: 5000});

        await this.lokator.poizvedovanjeDropdown.scrollIntoViewIfNeeded();
        await this.lokator.poizvedovanjeDropdown.click();

        const izbraniSloj = this.lokator[vrstaPoizvedovanja];

        if (!izbraniSloj) {
            throw new Error(`Neznana vrsta poizvedovanja: "${vrstaPoizvedovanja}" ne obstaja v lokatorjih!`);
        }

        await izbraniSloj.waitFor({state: 'visible', timeout: 5000});

        await izbraniSloj.scrollIntoViewIfNeeded();
        await izbraniSloj.click();
    }

    async povecajOkno(oknoLokator, dodajSirino, dodajVisino){
        await expect(oknoLokator).toBeVisible();
        await this.page.waitForTimeout(300); // Počakamo, da se okno umiri

        const zacetnaVelikost = await oknoLokator.boundingBox();
        if (!zacetnaVelikost) {
            throw new Error("Okna ni mogoče najti na zaslonu.");
        }

        console.log(`Začetna velikost okna - Širina: ${zacetnaVelikost.width}, Višina: ${zacetnaVelikost.height}`);

        const resizerRocaj = oknoLokator.locator('.ui-resizable-se').first();
        let x, y;

        let resizerBox = null;
        try {
            if (await resizerRocaj.isVisible()) {
                resizerBox = await resizerRocaj.boundingBox();
            }
        } catch (e) {}

        if (resizerBox) {
            x = resizerBox.x + resizerBox.width / 2;
            y = resizerBox.y + resizerBox.height / 2;
        } else {
            x = zacetnaVelikost.x + zacetnaVelikost.width - 5;
            y = zacetnaVelikost.y + zacetnaVelikost.height - 5;
        }

        await this.page.mouse.move(x, y);
        await this.page.mouse.down();
        await this.page.mouse.move(x + dodajSirino, y + dodajVisino, { steps: 15 });
        await this.page.mouse.up();

        await this.page.waitForTimeout(500);

        const koncnaVelikost = await oknoLokator.boundingBox();
        if (!koncnaVelikost) {
            throw new Error("Končne velikosti okna ni mogoče prebrati.");
        }

        console.log(`Končna velikost okna - Širina: ${koncnaVelikost.width}, Višina: ${koncnaVelikost.height}`);

        expect(koncnaVelikost.width).toBeGreaterThan(zacetnaVelikost.width);
        expect(koncnaVelikost.height).toBeGreaterThan(zacetnaVelikost.height);

        console.log("✅ Okno je bilo uspešno povečano.");
    }

    async premakniOkno(oknoLokator, premakniX, premakniY){
        await expect(oknoLokator).toBeVisible();
        await this.page.waitForTimeout(300);

        const zacetniBox = await oknoLokator.boundingBox();
        if (!zacetniBox) {
            throw new Error("Okna ni mogoče najti na zaslonu.");
        }

        console.log(`Začetna pozicija okna - X: ${zacetniBox.x}, Y: ${zacetniBox.y}`);

        const rocaj = oknoLokator.locator('i.icon-smeri.drag-icon');
        await expect(rocaj).toBeVisible();

        const rocajBox = await rocaj.boundingBox();
        if (!rocajBox) {
            throw new Error("Ročaja za premikanje okna ni mogoče najti.");
        }

        const startX = rocajBox.x + rocajBox.width / 2;
        const startY = rocajBox.y + rocajBox.height / 2;

        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();
        await this.page.mouse.move(startX + premakniX, startY + premakniY, { steps: 15 });
        await this.page.mouse.up();

        // Počakamo, da se premik zaključi
        await this.page.waitForTimeout(500);

        const koncniBox = await oknoLokator.boundingBox();
        if (!koncniBox) {
            throw new Error("Končne pozicije okna ni mogoče prebrati.");
        }

        console.log(`Končna pozicija okna - X: ${koncniBox.x}, Y: ${koncniBox.y}`);

        expect(koncniBox.x).not.toBe(zacetniBox.x);
        expect(koncniBox.y).not.toBe(zacetniBox.y);

        console.log("✅ Okno je bilo uspešno premaknjeno.");
    }

    async zapriOkno(oknoLokator) {
        await expect(oknoLokator).toBeVisible();

        const zacetniBox = await oknoLokator.boundingBox();
        if (!zacetniBox) {
            throw new Error("Okna ni mogoče najti na zaslonu.");
        }

        const gumbZapri = oknoLokator.locator('button.close[data-dismiss="modal"]')
            .or(oknoLokator.locator('i.icon-x.btn-close'))
            .first();

        await expect(gumbZapri).toBeVisible();

        await gumbZapri.click({ force: true });

        await this.page.waitForTimeout(400);

        await expect(oknoLokator).not.toBeVisible();

        console.log("✅ Okno je bilo uspešno zaprto.");
    }

    async pripravaPoizvedovanja(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });

        await this.page.waitForTimeout(500);

        await this.navigirajDoGrafike('302040');

        await this.izklopiDOF();

        await this.nastaviMeriloMape('500');
    }

    async odpiranjeDodatnihInformacij(){
        await expect(this.lokator.oknoModalnegaOkna).toBeVisible({ timeout: 10000 });

        const imenaSklopov = ['Zemljišča za gradnjo', 'Priključki infrastrukture'];

        for (const nazivSklopa of imenaSklopov) {
            const gumb = this.lokator.oknoModalnegaOkna.locator('.card-header button.btn.btn-link', { hasText: nazivSklopa });

            await gumb.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(200);

            console.log(`Klikam na sklop: ${nazivSklopa}`);

            await gumb.click({ force: true });

            const targetSelector = await gumb.getAttribute('data-target');
            const vsebinaSklopa = this.lokator.oknoModalnegaOkna.locator(targetSelector);

            await expect(vsebinaSklopa).toHaveClass(/collapse show/);

            console.log(`✅ Sklop "${nazivSklopa}" se je uspešno odprl.`);

            await this.page.waitForTimeout(300);
        }
    }

    async izberiSlojVarno(slojLokator) {
        const jeVsebinaOdprta = await this.lokator.vsiSlojiVVsebini.first().isVisible().catch(() => false);

        if (!jeVsebinaOdprta) {
            await this.lokator.izbraneVsebine.click();
            await this.page.waitForTimeout(300);
        }

        const besediloSloja = slojLokator.locator('span.text').first();

        await besediloSloja.scrollIntoViewIfNeeded();
        await expect(besediloSloja).toBeVisible({ timeout: 5000 });

        await besediloSloja.hover();
        await besediloSloja.click({ force: true });

        console.log("☑️ Uspešno kliknjen tekst izbranega sloja.");
        await this.page.waitForTimeout(300);
    }

    async nastavitevObmocja(){
        await expect(this.lokator.oknoNastavitveObmocja).toBeVisible({ timeout: 10000 });

        await this.lokator.inputBuffer.fill('10');

        await this.lokator.gumbPotrdi.click();
    }

    async odpiranjeLegende(imeSloja) {
        let slojElement;

        if (imeSloja.toLowerCase() === 'stavbe' || imeSloja === 'Stavbe') {
            slojElement = this.lokator.stavbaSloj;
        } else {
            slojElement = this.page.locator('li').filter({
                has: this.page.locator('span, label, a', { hasText: new RegExp(`^${imeSloja}$`, 'i') })
            }).first();
        }

        const ikonaLegende = slojElement.locator('i.icon-legend[title="Legenda"]').first();

        await ikonaLegende.waitFor({ state: 'visible', timeout: 10000 });
        await ikonaLegende.scrollIntoViewIfNeeded();

        await ikonaLegende.hover();
        await ikonaLegende.click({ force: true });

        const oknoLegende = this.page.locator('.card.legenda-card');

        try {
            await expect(oknoLegende).toBeVisible({ timeout: 10000 });
        } catch (error) {
            throw new Error(`❌ Koda je obstala pri odpiranju legende za sloj: "${imeSloja}"!`);
        }
    }

    async zapiranjeLegende(){
        const zadnjaLegenda = this.page.locator('.card.legenda-card').last();

        await this.lokator.zapiranjeLegende.waitFor({ state: 'visible', timeout: 5000 });
        await this.lokator.zapiranjeLegende.click();

        await expect(zadnjaLegenda).not.toBeVisible({ timeout: 5000 });
    }

    async dodajanjeZemljiscaZaGradnjo(){
        await this.lokator.IDUpravnegaAkta.fill('301905')

        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            this.lokator.gumbIsci.click()
        ]);

        await this.lokator.tabelaRezultatovPoizvedbe.first().waitFor({ state: 'visible', timeout: 10000 });

        await this.lokator.tabelaRezultatovPoizvedbe.first().click();
        await this.page.waitForLoadState('domcontentloaded');

        await this.lokator.zemljiscaZaGradnjo.click();

        await this.lokator.urediGumb.click();
        await this.lokator.dodajZemljisceGumb.click();

        await expect(this.page.locator('#modal_add_zemljisce')).toBeVisible();

        await this.lokator.obcina2Dropdown.click();
        await this.lokator.vnosnoPolje.waitFor({ state: 'visible' });
        await this.lokator.vnosnoPolje.pressSequentially('676', { delay: 50 });

        await this.lokator.opcijaObcine.waitFor({ state: 'visible' });
        await this.lokator.opcijaObcine.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.parcelnaStInput.click();
        await this.lokator.vnosnoPolje.waitFor({ state: 'visible' });
        await this.lokator.vnosnoPolje.pressSequentially('7/1', { delay: 50 });

        await this.lokator.opcijaParcele.waitFor({ state: 'visible' });
        await this.lokator.opcijaParcele.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.shraniZemljisce.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.potrdiZemljisce.click();
        await this.page.waitForLoadState('networkidle');
    }

    async brisanjeZemljiscaZaGradnjo(katastrskaObcina, parcelnaSt) {
        try {
            const vrsticeZemljisca = this.lokator.vrsticeZemljisca;
            await vrsticeZemljisca.first().waitFor({ state: 'attached', timeout: 8000 });

            const stVrstic = await vrsticeZemljisca.count();
            console.log(`🔍 Najdenih je ${stVrstic} vrstic zemljišč. Iščem KO: ${katastrskaObcina}, Parcela: ${parcelnaSt}`);

            let ciljnaVrstica = null;

            for (let k = 0; k < stVrstic; k++) {
                const vrstica = vrsticeZemljisca.nth(k);
                const celice = vrstica.locator('td');

                const sifraObcine = (await celice.nth(0).textContent() || "").trim();
                const parcelnaStTekst = (await celice.nth(2).textContent() || "").trim();

                console.log(`   [Vrstica ${k}] Prebrano -> Šifra KO: '${sifraObcine}', Parcela: '${parcelnaStTekst}'`);

                if (sifraObcine === katastrskaObcina && parcelnaStTekst === parcelnaSt) {
                    ciljnaVrstica = vrstica;
                    console.log(`🎯 Najdena ujemajočo vrstico `);
                    break;
                }
            }

            if (!ciljnaVrstica) {
                console.log(`ℹ️ Zemljišče (KO: ${katastrskaObcina}, Parcela: ${parcelnaSt}) ne obstaja ali je že izbrisano.`);
                return;
            }

            console.log(`Začenjam brisanje izbranega zemljišča...`);

            await ciljnaVrstica.click();
            await this.lokator.brisiGumbZemljisce.click();

            const potrditveniGumb = this.page.locator('#modal_confirmation_zemljisce #saveCountry');
            await potrditveniGumb.waitFor({ state: 'visible', timeout: 5000 });
            await potrditveniGumb.click();

            await potrditveniGumb.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
            console.log('✅ Vrstica uspešno izbrisana. Sistem je očiščen.');

            await this.page.waitForTimeout(1000);

        } catch (error) {
            console.log('❌ Prišlo je do napake pri brisanju zemljišča:', error.message);
        }
    }


    async vGrafiki(){
        await this.lokator.izbiranjeDropdown.click();

        await this.lokator.dodajStavboGumb.click();
        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.checkboxObrisStavbe).toHaveClass(/fa-check-square\s+fas/);
        await expect(this.lokator.checkboxObrisVPostopku).toHaveClass(/fa-check-square\s+fas/);
        console.log(`Oba checkboxa ("Obris stavbe" in "(v postopku)") sta pravilno označena!`);

        await this.lokator.mapa.waitFor({state: 'visible', timeout: 5000});

        await this.lokator.mapa.click({
            position: {
                x: 673,
                y: 200
            },
            force: true
        });

        const aktivnaStavbaElement = this.page.locator('.map-menu .body li span.search');
        await aktivnaStavbaElement.waitFor({ state: 'visible', timeout: 10000 });
        const izbranaStavba = (await aktivnaStavbaElement.innerText()).trim();
        console.log(`Zajemana izbrana stavba: ${izbranaStavba}`);

        await this.page.waitForTimeout(1000);

        await this.lokator.spustniMeni.waitFor({state: 'visible', timeout: 10000});
        await this.lokator.spustniMeni.selectOption({label: 'Dodaj nov objekt'});
        await this.page.waitForLoadState('networkidle');

        await this.lokator.shraniGumb.click();
        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.opozoriloIzbiraObjektaInVrsteGradnje).toBeVisible();

        if (await this.lokator.checkboxIkona.count() > 0) {
            await this.lokator.checkboxIkona.first().click({force: true});
        } else {
            await this.lokator.ikonaCheckboxAlternativa.first().click({force: true});
        }

        await this.lokator.shraniGumb.click();
        await this.page.waitForLoadState('networkidle');

        await this.page.locator('#save').waitFor({ state: 'visible', timeout: 5000 });
        await this.page.locator('#save').click();
        await this.page.waitForLoadState('networkidle');

        console.log("Objekt uspešno dodan, rekonstrukcija označena in shranjena!");
        await this.page.waitForTimeout(3000);

        await this.lokator.zapri2Gumb.click();
        await this.page.waitForLoadState('networkidle');

        console.log("Mapa uspešno zaprta in podatki osveženi!");

        const izbranaVrsticaStavbe = this.page.locator('#tab-stavbe_results tr[resultrow="true"]')
            .filter({ hasText: izbranaStavba })
            .first();

        if (await izbranaVrsticaStavbe.count() > 0) {
            console.log("Vrstica najdena, brišem...");

            await izbranaVrsticaStavbe.click();

            await this.page.locator('a#_deleteButton i.fa-trash-alt').click();

            await this.page.locator('#saveCountry').waitFor({ state: 'visible', timeout: 5000 });
            await this.page.locator('#saveCountry').click();

            await this.page.waitForLoadState('networkidle');

            const preveritevObstoja = await this.page.locator('#tab-stavbe_results tr[resultrow="true"]')
                .filter({ hasText: izbranaStavba })
                .count();

            if (preveritevObstoja === 0) {
                console.log("Izbris uspešno potrjen - vrstica je bila odstranjena!");
            } else {
                console.warn("OPOZORILO: Vrstica kljub izbrisu še vedno obstaja v tabeli!");
            }
        } else {
            console.warn("OPOZORILO: Vrstica s stavbo ni bila najdena v tabeli.");
        }
        return;
    }

    async drugiPogojiPriVpisuObjektaF(){
        await this.testUtils.odpriAktzID('302040');

        await this.lokator.objekti.first().click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.urediGumb.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.dodajObjektiGumb.waitFor({state: 'attached', timeout: 10000});
        await this.lokator.dodajObjektiGumb.click({force: true, timeout: 5000});

        await this.lokator.klasifikacijaStavbeContainer.click();
        await this.lokator.opcijaKlasifikacijeStavbe.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.checkboxNovogradnja.click();

        await this.lokator.brutoPovrsinaInput.click();
        await this.lokator.brutoPovrsinaInput.fill('4');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.brutoProstorninaInput.click();
        await this.lokator.brutoProstorninaInput.fill('3');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.strosekInput.click();
        await this.lokator.strosekInput.fill('65756');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.ogrevanjeSelect.click();
        await this.lokator.ogrevanjeSelect.selectOption({value: '0'});
        await this.page.waitForLoadState('networkidle');

        await this.lokator.enosobnaStStanovanjInput.click();
        await this.lokator.enosobnaStStanovanjInput.fill('1');
        await this.page.waitForLoadState('networkidle')

        await this.lokator.enosobnaPovrsinaInput.click();
        await this.lokator.enosobnaPovrsinaInput.fill('5');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.potrdiGumbModalnoOkno.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.errorBoxModalnegaOkna.waitFor({state: 'visible', timeout: 5000});
        const besediloNapake = await this.lokator.errorBoxModalnegaOkna.innerText();

        await expect.soft(besediloNapake).toContain('Bruto prostornina mora biti večja od bruto površine.');
        await expect.soft(besediloNapake).toContain('Uporabna površina - skupaj stanovanja ne more biti manjša od 6 m2. (Enosobna)');
        await expect.soft(besediloNapake).toContain('Uporabna površina stanovanj presega bruto površino.');

        await this.lokator.znakXVErrorBoxuModalnegaOkna.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.brutoPovrsinaInput.click();
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');
        await this.lokator.brutoPovrsinaInput.fill('4.5');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.brutoProstorninaInput.click();
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');
        await this.lokator.brutoProstorninaInput.fill('3');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(500);

        await this.lokator.potrdiGumbModalnoOkno.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.errorBoxModalnegaOkna.waitFor({state: 'visible', timeout: 5000});

        await expect.soft(this.lokator.errorBoxModalnegaOkna).toContainText('Bruto prostornina mora biti večja od bruto površine.');
        await expect.soft(this.lokator.errorBoxModalnegaOkna).toContainText('Uporabna površina - skupaj stanovanja ne more biti manjša od 6 m2. (Enosobna)');
        await expect.soft(this.lokator.errorBoxModalnegaOkna).toContainText('Uporabna površina stanovanj presega bruto površino.');
        await expect.soft(this.lokator.errorBoxModalnegaOkna).toContainText('Potrebno uporabiti zapis celih vrednosti EUR, m2. (Brez pike ali vejice)');

        await this.lokator.znakXVErrorBoxuModalnegaOkna.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.enosobnaPovrsinaInput.click();
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.enosobnaPovrsinaInput.press('Enter');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.potrdiGumbModalnoOkno.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.errorBoxModalnegaOkna.waitFor({state: 'visible', timeout: 5000});

        await expect.soft(this.lokator.errorBoxModalnegaOkna).toContainText('Manjka uporabna površina - skupaj. (Enosobna)');

        await this.lokator.znakXVErrorBoxuModalnegaOkna.click();
        await this.page.waitForLoadState('networkidle');

        // 1. Preverjanje za 1 stanovanje (osnovna klasifikacija)
        await this.lokator.klasifikacijaStavbeContainer.click();
        await this.lokator.opcijaKlasifikacijeStavbe.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.enosobnaStStanovanjInput.click();
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');
        await this.lokator.enosobnaStStanovanjInput.fill('1');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.potrdiGumbModalnoOkno.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.errorBoxModalnegaOkna.waitFor({state: 'visible', timeout: 5000});
        await expect.soft(this.lokator.errorBoxModalnegaOkna).not.toContainText('Nepravilno število stanovanj. Vseh stanovanj mora biti natanko 1.');

        await this.lokator.znakXVErrorBoxuModalnegaOkna.click();
        await this.page.waitForLoadState('networkidle');

        // 2. Preverjanje za 2 stanovanji (opcijaKlasifikacijeStavbe3)
        await this.lokator.klasifikacijaStavbeContainer.click();
        await this.lokator.opcijaKlasifikacijeStavbe3.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.enosobnaStStanovanjInput.click();
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');
        await this.lokator.enosobnaStStanovanjInput.fill('2');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.potrdiGumbModalnoOkno.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.errorBoxModalnegaOkna.waitFor({state: 'visible', timeout: 5000});
        await expect.soft(this.lokator.errorBoxModalnegaOkna).not.toContainText('Nepravilno število stanovanj. Vseh stanovanj mora biti natanko 2.');

        await this.lokator.znakXVErrorBoxuModalnegaOkna.click();
        await this.page.waitForLoadState('networkidle');

        // 3. Preverjanje za 3 ali več stanovanj (opcijaKlasifikacijeStavbe4)
        await this.lokator.klasifikacijaStavbeContainer.click();
        await this.lokator.opcijaKlasifikacijeStavbe4.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.enosobnaStStanovanjInput.click();
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');
        await this.lokator.enosobnaStStanovanjInput.fill('3');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.potrdiGumbModalnoOkno.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.errorBoxModalnegaOkna.waitFor({state: 'visible', timeout: 5000});
        await expect.soft(this.lokator.errorBoxModalnegaOkna).not.toContainText('Nepravilno število stanovanj. Vseh stanovanj mora biti vsaj 3 ali več');
    }

    async zapiranjeProjektneDokumentacije(){
        const pravaVrstica = this.page.locator('tr[resultrow="true"]')
            .filter({hasText: 302040})
            .first();

        await this.odpriAktzID('302040');

        await this.lokator.dokumenti.click();

        await this.lokator.zapriDokumente.click();

        await expect(this.page).toHaveURL('https://pis.intra.igea.si/pis-ua/seznam.html');

        await pravaVrstica.click({force: true});

        await this.lokator.dokumenti.click();

        await this.lokator.urediDokumentVelik.click();

        await this.lokator.zapriUrejanjeDokumenta.click();

        await expect(this.lokator.modalUrejanjaDokumenta).not.toBeVisible();

        await this.lokator.dodajProjektnoDokumentacijo.click();

        await this.lokator.stevilkaDokumenta.click();

        await this.lokator.stevilkaDokumenta.fill('10');

        await this.lokator.shraniProjektnoDokumentacijo.click();
    }

    async preveriZapisVTabeli(vrsticeLokator, iskanoBesedilo) {
        try {
            // Počakamo, da se vrstice naložijo v DOM
            await vrsticeLokator.first().waitFor({ state: 'attached', timeout: 8000 });
            const stVrstic = await vrsticeLokator.count();

            // Pretvorimo v tabelo, tudi če je podan samo en niz
            const iskaniPogoji = Array.isArray(iskanoBesedilo) ? iskanoBesedilo : [iskanoBesedilo];

            for (let k = 0; k < stVrstic; k++) {
                const vrstica = vrsticeLokator.nth(k);
                const celice = vrstica.locator('td');
                const stCelic = await celice.count();

                let vsaCeliceUjemajo = true;
                let vrsticaBesediloCelotno = "";

                // Preverimo vsak iskani pogoj glede na celice
                for (let pogoj of iskaniPogoji) {
                    let pogojNajdenVCelici = false;

                    for (let c = 0; c < stCelic; c++) {
                        const vsebinaCelice = (await celice.nth(c).textContent() || "").trim();
                        vrsticaBesediloCelotno += ` | ${vsebinaCelice}`;

                        if (vsebinaCelice === pogoj || vsebinaCelice.includes(pogoj)) {
                            pogojNajdenVCelici = true;
                            break;
                        }
                    }

                    if (!pogojNajdenVCelici) {
                        vsaCeliceUjemajo = false;
                        break;
                    }
                }

                if (vsaCeliceUjemajo) {
                    console.log(`✅ Uspešno najdeno ujemanje za [${iskaniPogoji.join(', ')}] v vrstici ${k}.`);
                    return true;
                }
            }

            console.log(`❌ Iskani zapis [${iskaniPogoji.join(', ')}] ni bil najden v tabeli.`);
            return false;

        } catch (error) {
            console.log(`❌ Napaka pri branju tabele: ${error.message}`);
            return false;
        }
    }
}
