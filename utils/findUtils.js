import {expect} from "@playwright/test";

export class FindtUtils {
    constructor(page, lokator) {
        this.page = page;
        this.lokator = lokator;
    }


    async nastaviLetoIzdajeInIsciF(){
        await this.lokator.letoInput.waitFor({state: 'visible', timeout: 5000});
        await this.lokator.letoInput.clear();
        await this.lokator.letoInput.fill("2018");

        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            this.lokator.gumbIsci.click()
        ]);

        await this.page.waitForTimeout(1000);

        const prvaVrstica = this.page.locator('table#results tr[resultrow="true"]').first();
        await prvaVrstica.waitFor({state: 'visible', timeout: 10000});
    }

    async nastaviParcelnoStevilkoInIsciF() {
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

        await Promise.all([
            this.page.waitForLoadState('domcontentloaded').catch(() => {}),
            this.lokator.gumbIsci.click()
        ]);

        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({
            state: 'visible',
            timeout: 10000
        });
    }

    async nastaviKatastrskoObcinoInIsciF() {
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

        await Promise.all([
            this.page.waitForLoadState('domcontentloaded').catch(() => {}),
            this.lokator.gumbIsci.click()
        ]);

        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({
            state: 'visible',
            timeout: 10000
        });
    }

    async nastaviFiltreInIsciF() {
        if (await this.lokator.napredniMeni.isVisible()) {
            await this.lokator.napredniMeni.click();
        }

        const pocistiVir = this.lokator.virDropdown.locator('.select2-selection__clear');
        if (await pocistiVir.isVisible().catch(() => false)) {
            await pocistiVir.click({force: true});
        }

        await this.lokator.virDropdown.click({force: true});
        await this.lokator.opcijaeGraditev.waitFor({state: 'visible', timeout: 5000});
        await this.lokator.opcijaeGraditev.click();

        await Promise.all([
            this.page.waitForLoadState('domcontentloaded').catch(() => {
            }),
            this.lokator.gumbIsci.click()
        ]);

        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({
            state: 'visible',
            timeout: 10000
        });
    }

    async nastaviLetoPrijaveInIsciF() {
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

        await Promise.all([
            this.page.waitForLoadState('domcontentloaded').catch(() => {}),
            this.lokator.gumbIsci.click()
        ]);

        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({
            state: 'visible',
            timeout: 10000
        });
    }

    async nastaviInvestitorjaInIsciF() {
        if (await this.lokator.napredniMeni.isVisible()) {
            await this.lokator.napredniMeni.click();
        }

        const izberiSelect2 = async (containerId, tekstZaIskanje, regexOpcije) => {
            await this.page.locator('span.select2-selection--single').filter({
                has: this.page.locator(`#${containerId}`)
            }).click();

            await this.lokator.vnosnoPolje.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.vnosnoPolje.clear();
            await this.lokator.vnosnoPolje.fill(tekstZaIskanje);

            const opcija = this.lokator.dobiOpcijoPoRegexu(regexOpcije);
            await opcija.waitFor({state: 'visible', timeout: 5000});
            await opcija.click();
        };

        await izberiSelect2('select2-investitorInput-container', 'BOŠTJAN ZALETELJ', 'BOŠTJAN ZALETELJ');

        await this.lokator.gumbIsci.click();
        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({
            state: 'visible',
            timeout: 10000
        });
    }

    async nastaviNosilcaInIsciF() {
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

    async nastaviOznakoGradbeneParceleInIsciF() {
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

        await izberiSelect2('select2-oznakaGPInput-container', 'GP_2000000_1', /^GP_2000000_1$/i);

        await Promise.all([
            this.page.waitForLoadState('domcontentloaded').catch(() => {}),
            this.lokator.gumbIsci.click()
        ]);

        await this.page.locator('table#results tr[resultrow="true"]:visible').first().waitFor({
            state: 'visible',
            timeout: 10000
        });
    }

    async iskanjePoViruF(){
        const vrsticeVstabeli = this.page.locator('table#results tr[resultrow="true"]:visible');
        await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

        const steviloNajdenih = await vrsticeVstabeli.count();
        const mejaZaPreverjanje = Math.min(steviloNajdenih, 2);
        console.log(`Najdenih ${steviloNajdenih} aktov. Preverjam prvih ${mejaZaPreverjanje}.`);

        const seznamIdjev = [];
        for (let i = 0; i < mejaZaPreverjanje; i++) {
            const rawId = await vrsticeVstabeli.nth(i).locator('td:visible').first().innerText();
            seznamIdjev.push(rawId.trim());
        }

        for (let i = 0; i < seznamIdjev.length; i++) {
            const idUA = seznamIdjev[i];
            try {
                console.log(`Preverjam akt [${i + 1}/${mejaZaPreverjanje}] z ID: ${idUA}`);

                if (i > 0) {
                    await this.page.goBack();
                    await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });
                }

                const trenutnaVrstica = vrsticeVstabeli.nth(i);

                const prvaCelica = trenutnaVrstica.locator('td:visible').first();
                await prvaCelica.waitFor({ state: 'visible', timeout: 10000 });
                await prvaCelica.click();

                const tabOsnovniPodatki = this.page.locator('#tab_tab-podatki');
                await tabOsnovniPodatki.waitFor({ state: 'visible', timeout: 10000 });
                await tabOsnovniPodatki.click();

                const poljeVir = this.page.locator('#virNaziv');
                await poljeVir.waitFor({ state: 'visible', timeout: 10000 });

                const vrednostVira = await poljeVir.inputValue();
                const cistaVrednostVira = vrednostVira ? vrednostVira.trim() : '';

                if (cistaVrednostVira === "eGraditev") {
                    console.log(`✅ Akt ${idUA}: Vir OK (eGraditev).`);
                } else {
                    console.log(`⚠️ Opozorilo: Akt ${idUA} ima napačen vir (${cistaVrednostVira}).`);
                }

            } catch (aktError) {
                console.log(`❌ Napaka pri obdelavi akta ${i + 1} (${idUA}): ${aktError.message}`);
                try {
                    await this.page.goBack();
                    await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
                } catch (e) {}
            }
        }
    }

    async iskanjePoKatastrskiObciniF() {
        const vrsticeVstabeli = this.page.locator('table#results tr[resultrow="true"]:visible');
        await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

        const steviloNajdenih = await vrsticeVstabeli.count();
        const mejaZaPreverjanje = Math.min(steviloNajdenih, 2);
        console.log(`Najdenih ${steviloNajdenih} aktov. Preverjam prvih ${mejaZaPreverjanje}.`);

        const seznamIdjev = [];
        for (let i = 0; i < mejaZaPreverjanje; i++) {

            const rawId = await vrsticeVstabeli.nth(i).locator('td:visible').first().innerText();
            seznamIdjev.push(rawId.trim());
        }

        for (let i = 0; i < seznamIdjev.length; i++) {
            const idUA = seznamIdjev[i];
            try {
                console.log(`Preverjam akt [${i + 1}/${mejaZaPreverjanje}] z ID: ${idUA}`);

                const trenutnaVrstica = this.page.locator('table#results tr[resultrow="true"]:visible')
                    .filter({
                        has: this.page.locator('td:visible').first().filter({ hasText: new RegExp(`^${idUA}$`) })
                    })
                    .first();

                const prvaCelica = trenutnaVrstica.locator('td:visible').first();
                await prvaCelica.waitFor({ state: 'visible', timeout: 10000 });
                await prvaCelica.click();

                await this.lokator.zemljiscaZaGradnjo.waitFor({ state: 'visible', timeout: 10000 });
                await this.lokator.zemljiscaZaGradnjo.click();

                try {
                    await this.lokator.vrsticeZemljisca.first().waitFor({ state: 'attached', timeout: 6000 });
                    const stVrstic = await this.lokator.vrsticeZemljisca.count();

                    if (stVrstic === 0) {
                        console.log(`   ℹ️ Akt ${idUA}: Nima vnesenih zemljišč.`);
                    } else {
                        let vseOk = true;

                        for (let k = 0; k < stVrstic; k++) {
                            const vrstica = this.lokator.vrsticeZemljisca.nth(k);
                            const sifraObcine = (await vrstica.locator('td').first().innerText()).trim();

                            if (sifraObcine !== "676") {
                                vseOk = false;
                                console.log(`❌ NAPAKA pri aktu ${idUA}: Najdena šifra '${sifraObcine}' namesto '676'.`);
                            }
                        }

                        if (vseOk) {
                            console.log(`✅ Akt ${idUA}: Vse vrstice (${stVrstic}) imajo ustrezno šifro 676.`);
                        }
                    }

                } catch (err) {
                    console.log(`ℹ️ Akt ${idUA}: Nima vnesenih zemljišč ali pa se tabela ni pravočasno naložila.`);
                }

                await this.page.goBack();
                await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

            } catch (aktError) {
                console.log(`❌ Napaka pri obdelavi akta ${i + 1} (${idUA}): ${aktError.message}`);

                try {
                    await this.page.goBack();
                    await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
                } catch (e) {}
            }
        }
    }

    async iskanjePoParcelniStevilkiF(){
        const vrsticeVstabeli = this.page.locator('table#results tr[resultrow="true"]:visible');
        await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

        const steviloNajdenih = await vrsticeVstabeli.count();
        const mejaZaPreverjanje = Math.min(steviloNajdenih, 2);
        console.log(`Najdenih ${steviloNajdenih} aktov. Preverjam prvih ${mejaZaPreverjanje}.`);

        const seznamIdjev = [];
        for (let i = 0; i < mejaZaPreverjanje; i++) {
            const rawId = await vrsticeVstabeli.nth(i).locator('td:visible').first().innerText();
            seznamIdjev.push(rawId.trim());
        }

        for (let i = 0; i < seznamIdjev.length; i++) {
            const idUA = seznamIdjev[i];
            try {
                console.log(`Preverjam akt [${i + 1}/${mejaZaPreverjanje}] z ID: ${idUA}`);

                const trenutnaVrstica = this.page.locator('table#results tr[resultrow="true"]:visible')
                    .filter({
                        has: this.page.locator('td:visible').first().filter({ hasText: new RegExp(`^${idUA}$`) })
                    })
                    .first();

                const prvaCelica = trenutnaVrstica.locator('td:visible').first();
                await prvaCelica.waitFor({ state: 'visible', timeout: 10000 });
                await prvaCelica.click();

                await this.lokator.zemljiscaZaGradnjo.waitFor({ state: 'visible', timeout: 10000 });
                await this.lokator.zemljiscaZaGradnjo.click();

                try {
                    await this.lokator.vrsticeZemljisca.first().waitFor({ state: 'attached', timeout: 6000 });
                    const stVrstic = await this.lokator.vrsticeZemljisca.count();
                    let najdenoUjemanje = false;

                    for (let k = 0; k < stVrstic; k++) {
                        const celice = this.lokator.vrsticeZemljisca.nth(k).locator('td');
                        const sifraObcine = (await celice.nth(0).innerText()).trim();
                        const parcelnaSt = (await celice.nth(2).innerText()).trim();

                        if (sifraObcine === "676" && parcelnaSt === "7/1") {
                            najdenoUjemanje = true;
                            break;
                        }
                    }

                    if (najdenoUjemanje) {
                        console.log(`✅ Akt ${idUA}: Najdeno ustrezno zemljišče (676 - 7/1).`);
                    } else {
                        console.log(`❌ Akt ${idUA}: Nima ustreznega zemljišča (676 - 7/1).`);
                    }

                } catch (err) {
                    console.log(`ℹ️ Akt ${idUA}: Nima vnesenih zemljišč.`);
                }

                await this.page.goBack();
                await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

            } catch (aktError) {
                console.log(`❌ Napaka pri obdelavi akta ${i + 1} (${idUA}): ${aktError.message}`);
                try {
                    await this.page.goBack();
                    await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
                } catch (e) {}
            }
        }
    }

    async iskanjePoLetuPrijaveF(){
        const vrsticeVstabeli = this.page.locator('table#results tr[resultrow="true"]:visible');
        await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

        const steviloNajdenih = await vrsticeVstabeli.count();
        const mejaZaPreverjanje = Math.min(steviloNajdenih, 2);
        console.log(`Najdenih ${steviloNajdenih} aktov. Preverjam prvih ${mejaZaPreverjanje}.`);

        const seznamIdjev = [];
        for (let i = 0; i < mejaZaPreverjanje; i++) {
            const rawId = await vrsticeVstabeli.nth(i).locator('td:visible').first().innerText();
            seznamIdjev.push(rawId.trim());
        }

        for (let i = 0; i < seznamIdjev.length; i++) {
            const idUA = seznamIdjev[i];
            try {
                console.log(`Preverjam akt [${i + 1}/${mejaZaPreverjanje}] z ID: ${idUA}`);

                const trenutnaVrstica = vrsticeVstabeli
                    .filter({
                        has: this.page.locator('td:visible').first().filter({ hasText: new RegExp(`^${idUA}$`) })
                    })
                    .first();

                const prvaCelica = trenutnaVrstica.locator('td:visible').first();
                await prvaCelica.waitFor({ state: 'visible', timeout: 10000 });
                await prvaCelica.click();
                await this.page.waitForLoadState('domcontentloaded').catch(() => {});

                try {
                    const datumInput = this.page.locator('#datum_prijave_zacetka');
                    await datumInput.waitFor({ state: 'attached', timeout: 5000 });

                    const polnaVrednost = await datumInput.inputValue();

                    if (polnaVrednost.includes('2018')) {
                        console.log(`   ✅ Akt ${idUA}: Datum vsebuje leto 2018 (${polnaVrednost}).`);
                    } else {
                        console.log(`   ❌ NAPAKA pri aktu ${idUA}: Datum '${polnaVrednost}' ne vsebuje leta 2018.`);
                    }

                } catch (err) {
                    console.log(`   ❌ NAPAKA pri aktu ${idUA}: Polje #datum_prijave_zacetka se ni naložilo ali je prazno.`);
                }

                await this.page.goBack();
                await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

            } catch (aktError) {
                console.log(`   ❌ Napaka pri obdelavi akta ${i + 1} (${idUA}): ${aktError.message}`);
                try {
                    await this.page.goBack();
                    await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
                } catch (e) {}
            }
        }
    }

    async iskanjePoLetuIzdajeF(){
        const vrsticeVstabeli = this.page.locator('table#results tr[resultrow="true"]:visible');
        await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

        const steviloNajdenih = await vrsticeVstabeli.count();
        const mejaZaPreverjanje = Math.min(steviloNajdenih, 5);
        console.log(`Najdenih ${steviloNajdenih} aktov. Preverjam prvih ${mejaZaPreverjanje}.`);

        for (let i = 0; i < mejaZaPreverjanje; i++) {
            try {
                if (i > 0) {
                    const isVisible = await vrsticeVstabeli.first().isVisible().catch(() => false);
                    if (!isVisible) {
                        await this.nastaviLetoIzdajeInIsciF();
                    } else {
                        await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });
                    }
                }

                const trenutnaVrstica = this.page.locator('table#results tr[resultrow="true"]:visible').nth(i);
                await trenutnaVrstica.waitFor({ state: 'visible', timeout: 10000 });

                const rawIdUA = await trenutnaVrstica.locator('td:visible').first().innerText();
                const idUA = rawIdUA ? rawIdUA.trim() : '';
                console.log(`Preverjam akt [${i + 1}/${mejaZaPreverjanje}] z ID: ${idUA}`);

                await trenutnaVrstica.locator('td:visible').first().click();
                await this.page.waitForLoadState('domcontentloaded');

                const poljeDatum = this.page.locator('#datum_zacetka');
                await poljeDatum.waitFor({ state: 'attached', timeout: 5000 });

                const vrednostDatuma = await poljeDatum.inputValue();
                const cistaVrednostDatuma = vrednostDatuma ? vrednostDatuma.trim() : '';

                if (cistaVrednostDatuma.includes('2018')) {
                    console.log(`   ✅ Akt ${idUA}: Datum OK (${cistaVrednostDatuma}).`);
                } else {
                    console.log(`   ⚠️ Opozorilo: Akt ${idUA} napačen datum (${cistaVrednostDatuma}).`);
                }

            } catch (aktError) {
                console.log(`   ❌ Napaka pri obdelavi akta ${i + 1}: ${aktError.message}`);
            } finally {
                await this.lokator.homeGumb.click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForTimeout(500);
            }
        }
    }

    async iskanjePoInvestitorjuF(){
        const vrsticeVstabeli = this.page.locator('table#results tr[resultrow="true"]:visible');
        await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

        const steviloNajdenih = await vrsticeVstabeli.count();
        const mejaZaPreverjanje = Math.min(steviloNajdenih, 2);
        console.log(`Najdenih ${steviloNajdenih} aktov. Preverjam prvih ${mejaZaPreverjanje}.`);

        const seznamIdjev = [];
        for (let i = 0; i < mejaZaPreverjanje; i++) {
            const rawId = await vrsticeVstabeli.nth(i).locator('td:visible').first().innerText();
            seznamIdjev.push(rawId.trim());
        }

        for (let i = 0; i < seznamIdjev.length; i++) {
            const idUA = seznamIdjev[i];
            try {
                console.log(`Preverjam akt [${i + 1}/${mejaZaPreverjanje}] z ID: ${idUA}`);

                const trenutnaVrstica = this.page.locator('table#results tr[resultrow="true"]:visible')
                    .filter({
                        has: this.page.locator('td:visible').first().filter({ hasText: new RegExp(`^${idUA}$`) })
                    })
                    .first();

                const prvaCelica = trenutnaVrstica.locator('td:visible').first();
                await prvaCelica.waitFor({ state: 'visible', timeout: 10000 });
                await prvaCelica.click();
                await this.page.waitForLoadState('domcontentloaded').catch(() => {});

                if (await this.lokator.podatkiOInvestitorju.isVisible()) {
                    await this.lokator.podatkiOInvestitorju.click();
                }

                try {
                    const celicaInvestitorja = this.page.locator('table#tab-investitor_results tr[resultrow="true"] td, table.tabela-investitorjev tr[resultrow="true"] td').nth(1).first();
                    await celicaInvestitorja.waitFor({ state: 'visible', timeout: 6000 });

                    const prebranInvestitor = (await celicaInvestitorja.innerText()).trim();

                    if (prebranInvestitor.toLowerCase().includes("boštjan zaletelj".toLowerCase())) {
                        console.log(`   ✅ Akt ${idUA}: Najden ustrezno vnesen investitor (${prebranInvestitor}).`);
                    } else {
                        console.log(`   ❌ NAPAKA pri aktu ${idUA}: Najden investitor "${prebranInvestitor}", pričakovano: "BOŠTJAN ZALETELJ".`);
                    }
                } catch (err) {
                    console.log(`   ❌ NAPAKA pri aktu ${idUA}: Tabela investitorjev se ni naložila ali pa je prazna.`);
                }

                await this.page.goBack();
                await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

            } catch (aktError) {
                console.log(`   ❌ Napaka pri obdelavi akta ${i + 1} (${idUA}): ${aktError.message}`);
                try {
                    await this.page.goBack();
                    await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
                } catch (e) {}
            }
        }
    }

    async iskanjePoOznakiGradbeneParceleF(){
        const vrsticeVstabeli = this.page.locator('table#results tr[resultrow="true"]:visible');
        await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });

        const steviloNajdenih = await vrsticeVstabeli.count();
        const mejaZaPreverjanje = Math.min(steviloNajdenih, 2);
        console.log(`Najdenih ${steviloNajdenih} aktov. Preverjam prvih ${mejaZaPreverjanje}.`);

        const seznamIdjev = [];
        for (let i = 0; i < mejaZaPreverjanje; i++) {
            const rawId = await vrsticeVstabeli.nth(i).locator('td:visible').first().innerText();
            seznamIdjev.push(rawId.trim());
        }

        for (let i = 0; i < seznamIdjev.length; i++) {
            const idUA = seznamIdjev[i];
            try {
                console.log(`Preverjam akt [${i + 1}/${mejaZaPreverjanje}] z ID: ${idUA}`);

                if (i > 0) {
                    await this.page.goBack();
                    await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 10000 });
                }

                const trenutnaVrstica = vrsticeVstabeli.nth(i);

                const prvaCelica = trenutnaVrstica.locator('td:visible').first();
                await prvaCelica.waitFor({ state: 'visible', timeout: 10000 });
                await prvaCelica.click();

                await this.lokator.objekti.waitFor({ state: 'visible', timeout: 10000 });
                await this.lokator.objekti.click();

                try {
                    await this.lokator.gpHeaders.first().waitFor({ state: 'visible', timeout: 10000 });
                    const steviloHeaderjev = await this.lokator.gpHeaders.count();
                    let najdenoUjemanje = false;

                    for (let j = 0; j < steviloHeaderjev; j++) {
                        const tekstHeaderja = await this.lokator.gpHeaders.nth(j).textContent() || "";
                        if (tekstHeaderja.includes('GP_2000000_1')) {
                            najdenoUjemanje = true;
                            break;
                        }
                    }

                    if (najdenoUjemanje) {
                        console.log(`   ✅ Akt ${idUA}: Oznaka 'GP_2000000_1' je bila uspešno najdena.`);
                    } else {
                        console.log(`   ❌ NAPAKA pri aktu ${idUA}: Oznaka 'GP_2000000_1' ni bila najdena v headerjih.`);
                    }

                } catch (err) {
                    console.log(`   ❌ NAPAKA pri aktu ${idUA}: Objekti/GP headerji se niso naložili ali pa so prazni.`);
                }

            } catch (aktError) {
                console.log(`⚠️ Napaka pri obdelavi akta ${i + 1} (${idUA}): ${aktError.message}`);
                try {
                    await this.page.goBack();
                    await vrsticeVstabeli.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
                } catch (e) {}
            }
        }
    }
}