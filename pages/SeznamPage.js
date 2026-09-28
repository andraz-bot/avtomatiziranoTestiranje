import { expect } from '@playwright/test';
import { izbrisStavbe } from '../utils/dbUtils.js';
import { poskusi } from '../tests/poskusi.js';
import { SeznamLokatorjev } from '../locators/locators.js';
import { TestUtils } from '../utils/testUtils.js';
import { FindtUtils } from "../utils/findUtils";

export class SeznamPage {
    constructor(page) {
        this.page = page;
        this.napake = [];
        this.lokator = new SeznamLokatorjev(page);
        this.testUtils = new TestUtils(this.page, this.lokator);
        this.findUtils = new FindtUtils(this.page, this.lokator);
    }

    async Odjava() {
        await this.lokator.odjavaBtn.click();
        await this.page.waitForLoadState('networkidle');
        expect(this.page.url()).toContain('https://pis.s-test.eprostor.si/');
    }

    async OdpiranjeGrafike() {
        await this.lokator.globusBtn.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.grafikaNaslov).toBeVisible();

        await expect(this.lokator.grafikaNaslov).toHaveText('GRAFIKA');

        console.log("✅ Grafika je odprta.");
    }

    async OdpiranjePomoci() {
        const [noviZavihek] = await Promise.all([
            this.page.context().waitForEvent('page', {timeout: 10000}),
            this.lokator.vprasajBtn.first().click()
        ]);

        await noviZavihek.waitForLoadState('networkidle');

        expect(noviZavihek.url()).toContain('osnovna_stran.htm');
    }

    async OdpiranjeAktov() {
        await this.lokator.prviaktBtn.click();

        await this.page.waitForLoadState('networkidle');

        expect(this.page.url()).toContain('upravni-akt.html?id=');
    }

    async AktiTest() {
        await this.lokator.prviaktBtn.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.podatkiOInvestitorju.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.podatkiOInvestitorjuHeader).toBeVisible();

        await expect(this.lokator.podatkiOInvestitorjuHeader).toContainText('Podatki o investitorju');

        await this.lokator.osnovniPodatki.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.osnovniPodatkiHeader).toBeVisible();

        await expect(this.lokator.osnovniPodatkiHeader).toContainText('Osnovni podatki');

        await this.lokator.zemljiscaZaGradnjo.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.zemljiscaZaGradnjoHeader).toBeVisible();

        await expect(this.lokator.zemljiscaZaGradnjoHeader).toContainText('objekti in ureditve površin');
    }

    async sortID_UA() {
        const idStart = (await this.page.locator('td.pis-datatable-cell').nth(0).innerText()).trim();

        await this.lokator.headerID.click();

        await expect(this.page.locator('td.pis-datatable-cell').nth(0)).not.toHaveText(idStart, {timeout: 8000});

        const idPoPrvem = (await this.page.locator('td.pis-datatable-cell').nth(0).innerText()).trim();

        await this.lokator.headerID.click();

        await expect(this.page.locator('td.pis-datatable-cell').nth(0)).not.toHaveText(idPoPrvem, {timeout: 8000});

        const idPoDrugem = (await this.page.locator('td.pis-datatable-cell').nth(0).innerText()).trim();

        expect(idPoDrugem).not.toBe(idPoPrvem);
    }

    async sortUpravniOrgan() {
        await this.lokator.header.click();

        await this.page.waitForLoadState('networkidle');

        const textPred = (await this.lokator.celica.innerText()).trim();

        await this.lokator.header.click();

        await expect(this.lokator.celica).not.toHaveText(textPred, {timeout: 5000});

        const textPo = (await this.lokator.celica.innerText()).trim();

        expect(textPo).not.toBe(textPred);
    }

    async sortStZadeve() {
        const zadevaStart = (await this.lokator.stevilkaZadeve.innerText()).trim();

        await this.lokator.header2.click();

        await expect(this.lokator.stevilkaZadeve).not.toHaveText(zadevaStart, { timeout: 5000 });

        const zadevaPoPrvem = (await this.lokator.stevilkaZadeve.innerText()).trim();
        await this.lokator.header2.click();

        await expect(this.lokator.stevilkaZadeve).not.toHaveText(zadevaPoPrvem, { timeout: 5000 });

        const zadevaPoDrugem = (await this.lokator.stevilkaZadeve.innerText()).trim();

        expect(zadevaPoDrugem).not.toBe(zadevaPoPrvem);
        expect(zadevaPoDrugem).not.toBe(zadevaStart);
    }

    async sortPostopek() {
        await expect(this.lokator.header3).toBeVisible();
        await this.lokator.header3.click();

        await this.lokator.postopek.first().waitFor({state: 'visible', timeout: 5000});

        const prvaVrednost = (await this.lokator.postopek.first().innerText()).trim();

        await this.lokator.header3.click();

        await expect(this.lokator.postopek.first()).not.toHaveText(prvaVrednost, { timeout: 5000 });

        const zadnjaVrednost = (await this.lokator.postopek.first().innerText()).trim();

        expect(zadnjaVrednost).not.toBe(prvaVrednost);
    }

    async sortNaziv() {
        const getNazivi = async () => {
            const count = await this.lokator.nazivCelice.count();
            const texts = [];
            for (let i = 0; i < count; i++) {

                const el = this.lokator.nazivCelice.nth(i);
                const val = await el.getAttribute('title') || await el.textContent();
                texts.push(val.trim());
            }
            return texts;
        };

        const zacetniSeznam = await getNazivi();

        await this.lokator.header4.click();

        await expect(async () => {
            const novSeznam = await getNazivi();

            const jeRazlicno = JSON.stringify(novSeznam) !== JSON.stringify(zacetniSeznam);
            expect(jeRazlicno).toBe(true);
        }).toPass({timeout: 15000});
    }

    async sortDatumIzd() {
        await expect(this.lokator.header5).toBeVisible();
        await this.lokator.header5.click();

        const prviDatum = (await this.lokator.datumIzd.first().innerText()).trim();

        await this.lokator.header5.click();

        await expect(this.page.locator('td.pis-datatable-cell:nth-child(6)').first())
            .not.toHaveText(prviDatum, {timeout: 5000});

        const zadnjiDatum = (await this.lokator.datumIzd.first().innerText()).trim();

        expect(zadnjiDatum).not.toBe(prviDatum);
    }

    async sortDatPrav() {
        const DatumIzd = this.page.locator('td.pis-datatable-cell:nth-child(6)');
        const header6 = this.page.locator('th').filter({hasText: 'Dat. prav.'});
    }

    async IskanjeAktaPoID(idAkta) {
        await this.lokator.IDUpravnegaAkta.click();

        await this.lokator.IDUpravnegaAkta.fill(String(idAkta));
        await this.page.keyboard.press('Tab');

        await this.lokator.IDUpravnegaAkta.press('Enter');

        await expect(this.lokator.tabela).toContainText(String(idAkta), {timeout: 10000});

        await this.page.waitForTimeout(1000);

        await this.lokator.clearBtn.click();
    }

    async VpisCrk() {
        await this.lokator.IDUpravnegaAkta.click();

        await this.lokator.IDUpravnegaAkta.pressSequentially("test", {delay: 100});

        await expect(this.lokator.IDUpravnegaAkta).toHaveValue("");

        await this.lokator.clearBtn.click();
    }

    async IskanjePoLetuIzdaje() {
        await this.findUtils.nastaviLetoIzdajeInIsciF();

        await this.findUtils.iskanjePoLetuIzdajeF();
    }

    async VnosStZadeve2() {
        await this.testUtils.odpriAktzID('302040');

        await expect(this.lokator.stevilkaZadeveInput).toHaveValue("351-85/2023-6220");
    }

    async VrstaUpravnegaAkta() {
        await this.lokator.vrstaUpravnegaAkta.click().catch(() => this.lokator.vrstaUpravnegaAkta.dispatchEvent('click'));

        await this.page.waitForLoadState('networkidle');

        await this.lokator.opcijaGradbenoDovoljenje.waitFor({state: 'visible'});
        await this.lokator.opcijaGradbenoDovoljenje.click();

        await expect(this.lokator.vrstaUpravnegaAkta).toContainText("Gradbeno dovoljenje");

        await this.lokator.gumbIsci.click();
        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.prvaCelicaVrstaUpravnegaAkta).toBeVisible();

        if (await this.lokator.clearDropdownBtn.count() > 0 && await this.lokator.clearDropdownBtn.isVisible()) {
            await this.lokator.clearDropdownBtn.click();
        }
    }

    async VrstaUpravnegaOrgana() {
        await this.lokator.vrstaUpravnegaOrgana.click().catch(() => this.lokator.vrstaUpravnegaOrgana.dispatchEvent('click'));

        await this.page.waitForLoadState('networkidle');

        await this.lokator.opcijaUEDomzale.waitFor({state: 'visible'});
        await this.lokator.opcijaUEDomzale.click();

        await this.lokator.gumbIsci.click();
        await this.page.waitForLoadState('networkidle');

        const tabela = this.page.locator("#results");

        await expect(this.lokator.vrstaUpravnegaOrgana).toContainText("UE Domžale", {ignoreCase: true});
    }

    async NaprednoIskanje() {
        await expect(this.lokator.napredniMeni).toBeVisible();
        await this.lokator.napredniMeni.click();

        await expect(this.page.getByText("Vir")).toBeVisible();
        await expect(this.page.getByText("Katastrska občina")).toBeVisible();
        await expect(this.page.getByText("Parcelna številka")).toBeVisible();
        await expect(this.page.getByText("Leto prijave pričetka gradnje")).toBeVisible();
        await expect(this.page.getByText("Investitor")).toBeVisible();
        await expect(this.page.getByText("Nosilec")).toBeVisible();
        await expect(this.page.getByText("Oznaka gradbene parcele")).toBeVisible();

        await this.lokator.gumbSkrci.click();
    }

    async iskanjePoViru() {
        await this.findUtils.nastaviFiltreInIsciF();

        await this.findUtils.iskanjePoViruF();
    }

    async iskanjePoKatastrskiObcini() {
        await this.findUtils.nastaviKatastrskoObcinoInIsciF();

        await this.findUtils.iskanjePoKatastrskiObciniF();

    }

    async iskanjePoParcelniStevilki() {
        await this.findUtils.nastaviParcelnoStevilkoInIsciF();

        await this.findUtils.iskanjePoParcelniStevilkiF();
    }

    async iskanjePoLetuPrijave() {
        await this.findUtils.nastaviLetoPrijaveInIsciF();

        await this.findUtils.iskanjePoLetuPrijaveF();
    }

    async iskanjePoInvestitorju() {
        await this.findUtils.nastaviInvestitorjaInIsciF();

        await this.findUtils.iskanjePoInvestitorjuF();
    }

/*
    async iskanjePoNosilcu() {
        await this.findUtils.nastaviNosilcaInIsciF();

        await this.findUtils.iskanje;
    }
*/

    async iskanjePoOznakiGradbeneParcele() {
        await this.findUtils.nastaviOznakoGradbeneParceleInIsciF();

        await this.findUtils.iskanjePoOznakiGradbeneParceleF();
    }

    async GumbIsci() {
        await this.testUtils.odpriAktzID('302040');

        await expect(this.page).toHaveURL('https://pis.intra.igea.si/pis-ua/upravni-akt.html?id=302040');
    }

    async GumbPonastavi() {
        await this.lokator.IDUpravnegaAkta.waitFor({state: 'visible', timeout: 10000});
        await this.lokator.IDUpravnegaAkta.fill('302040');

        await this.lokator.gumbIsci.click({force: true});

        await this.page.waitForTimeout(1000);

        await this.lokator.clearBtn.click();

        await this.page.waitForTimeout(1000);

        await expect(this.lokator.rezultati).toContainText("2000000", {timeout: 10000});
    }

    async GumbSkrci() {
        const dropdowns = [
            this.page.locator('span.select2-selection--single').filter({has: this.page.locator('#select2-virInput-container')}),
            this.page.locator('span.select2-selection--single').filter({has: this.page.locator('#select2-obcinaInput-container')}),
            this.page.locator('span.select2-selection--single').filter({has: this.page.locator('#select2-parcelaInput-container')}),
            this.page.locator('#letoPrijaveInput'),
            this.page.locator('span.select2-selection--single').filter({has: this.page.locator('#select2-investitorInput-container')}),
            this.page.locator('span.select2-selection--single').filter({has: this.page.locator('#select2-nosilecInput-container')}),
            this.page.locator('span.select2-selection--single').filter({has: this.page.locator('#select2-oznakaGPInput-container')})
        ];

        if (await this.lokator.napredniMeni.isVisible()) {
            await this.lokator.napredniMeni.click();
        }

        for (const locator of dropdowns) {
            await expect(locator).toBeVisible({timeout: 2000});
        }
    }

    async PrehodMedStranmi() {
        await expect(this.lokator.prejsniGumbi).toHaveClass(/disabled/);

        const zacetnaStran = parseInt(await this.lokator.aktivnaStran.innerText());

        await this.lokator.naslednjiGumb.click();
        await this.page.waitForLoadState('networkidle');

        const stranNaprej = parseInt(await this.page.locator("li.page-item.active").first().innerText());
        expect(stranNaprej).toBeGreaterThan(zacetnaStran);

        await this.lokator.prejsniGumb.click();
        await this.page.waitForLoadState('networkidle');

        const stranNazaj = parseInt(await this.page.locator("li.page-item.active").first().innerText());
        expect(stranNazaj).toBe(zacetnaStran);

        await this.lokator.zadnjiGumb.click();
        await this.page.waitForLoadState('networkidle');

        const zadnjaStran = parseInt(await this.page.locator("li.page-item.active").first().innerText());
        expect(zadnjaStran).toBeGreaterThan(1);

        await this.lokator.prviGumb.click();
        await this.page.waitForLoadState('networkidle');

        const končnaStran = parseInt(await this.page.locator("li.page-item.active").first().innerText());
        expect(končnaStran).toBe(1);
    }

    async GumbDomov() {
        await this.testUtils.odpriAktzID('302040');

        await expect(this.page).toHaveURL('https://pis.intra.igea.si/pis-ua/upravni-akt.html?id=302040');

        await this.lokator.homeGumb.click();

        await expect(this.page).toHaveURL('https://pis.intra.igea.si/pis-ua/seznam.html');
    }

    async IzborIzZbirkeObjektov() {
        await this.lokator.IDUpravnegaAkta.click();
        await this.lokator.IDUpravnegaAkta.fill("248477");
        await this.page.keyboard.press('Tab');
        await this.lokator.IDUpravnegaAkta.press('Enter');

        await expect(this.lokator.rezultati).toContainText("248477", {timeout: 10000});

        await this.page.waitForTimeout(1000);

        await this.lokator.clearBtn.click();
    }

    async PodatkiOInvestitorjuT() {
        await this.lokator.prvaCelica.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.podatkiOInvestitorju.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.podatkiOInvestitorjuHeader).toBeVisible();

        await expect(this.lokator.podatkiOInvestitorjuHeader).toContainText('Podatki o investitorju');
    }

    async OsnovniPodatkiT() {
        await this.lokator.prvaCelica.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.osnovniPodatki.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.osnovniPodatkiHeader).toBeVisible();

        await expect(this.lokator.osnovniPodatkiHeader).toContainText('Osnovni podatki');
    }

    async ZemljiscaZaGradnjoT() {
        await this.lokator.prvaCelica.click();

        await this.page.waitForLoadState('domcontentloaded');

        await this.lokator.zemljiscaZaGradnjo.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.zemljiscaZaGradnjoHeader).toBeVisible();

        await expect(this.lokator.zemljiscaZaGradnjoHeader).toContainText('Zemljišča za gradnjo');
    }

    async ObjektiT() {
        await this.lokator.prvaCelica.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.objekti.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.objektiHeader).toBeVisible();

        await expect(this.lokator.objektiHeader).toContainText('Objekti');
    }

    async DokumentiT() {
        await this.lokator.prvaCelica.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.dokumenti.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.dokumentiHeader).toBeVisible();

        await expect(this.lokator.dokumentiHeader).toContainText('Upravni akti');
    }

    async GumbZapri() {
        await this.lokator.prvaCelica.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.zapriGumb.click();

        await expect(this.page).toHaveURL('https://pis.intra.igea.si/pis-ua/seznam.html');
    }

    async BarvanjeStevilkeZadeve() {
        const stevilkaZadeveCelica = this.lokator.prvaVrstica.locator('td').nth(2);
        const zelenaRGB = 'rgb(80, 195, 59)';

        await stevilkaZadeveCelica.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.zavihekObjekti.click({force: true});

        await this.page.waitForTimeout(1000);

        const vsebinaTabele = await this.lokator.tabelaObjektov.innerText();
        const imaObjekt1 = vsebinaTabele.includes('Objekt 1');

        console.log(imaObjekt1 ? "Pričakujem zeleno barvo." : "Pričakujem, da ni zeleno.");

        await this.lokator.homeGumb.click();
        await this.page.waitForLoadState('networkidle');

        if (imaObjekt1) {
            await expect(stevilkaZadeveCelica).toHaveCSS('color', zelenaRGB);
            console.log('Zaznana zelena barva.')
        } else {
            const dejanskaBarva = await stevilkaZadeveCelica.evaluate(el => window.getComputedStyle(el).color);
            expect(dejanskaBarva).not.toBe(zelenaRGB);
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async GumbUredi() {
        await this.lokator.drugiAkt.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.urediGumb.click();

        await this.page.waitForLoadState('networkidle');

        const trenutniUrl = this.page.url();

        await expect(trenutniUrl).toContain('uredi.html?id');
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async GumbDodajanjeInvestitorja() {
        await this.lokator.drugiAkt.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.zavihekPodatkiOInvestitorju.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.urediGumb.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.dodajGumbInvestitor.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.page.locator('.modal-header').filter({visible: true}))
            .toContainText('podatkov o investitorjih');
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async UrejanjeInvestitorja() {
        await this.lokator.VnosStZadeve.fill("351-146/2017");
        await this.lokator.gumbIsci.click();

        const prvaVrstica = this.page.locator('table#results tr[resultrow="true"]:visible').first();
        await prvaVrstica.waitFor({ state: 'visible', timeout: 10000 });

        await prvaVrstica.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.podatkiOInvestitorju.waitFor({ state: 'visible', timeout: 5000 });
        await this.lokator.podatkiOInvestitorju.click();

        await this.lokator.urediGumb.waitFor({ state: 'visible', timeout: 5000 });
        await this.lokator.urediGumb.click();
        await this.page.waitForLoadState('networkidle');

        const vrsticaInv = this.lokator.vrsticeInvestitor.first();
        await vrsticaInv.waitFor({ state: 'visible', timeout: 5000 });
        await vrsticaInv.dblclick();

        await this.lokator.editInvestitor.waitFor({ state: 'visible', timeout: 7000 });
        await expect(this.lokator.editInvestitor).toBeVisible();
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async BrisanjeInvestitorja() {
        await this.lokator.VnosStZadeve.fill("351-146/2017");

        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            this.lokator.gumbIsci.click()
        ]);

        await this.lokator.tabelaRezultatovPoizvedbe.first().waitFor({ state: 'visible', timeout: 10000 });

        await this.lokator.tabelaRezultatovPoizvedbe.first().click();
        await this.page.waitForLoadState('domcontentloaded');

        await this.lokator.podatkiOInvestitorju.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.podatkiOInvestitorju.click();

        await this.lokator.urediGumb.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.urediGumb.click();
        await this.page.waitForLoadState('domcontentloaded');

        await this.lokator.vrsticeInvestitor.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.vrsticeInvestitor.click();

        await this.lokator.BrisiGumbInvestitor.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.BrisiGumbInvestitor.click();

        await this.lokator.modalBrisanjaInvestitorja.waitFor({ state: 'visible', timeout: 10000 });
        await expect(this.lokator.modalBrisanjaInvestitorja).toBeVisible();
    }
//------------------------------------------------------------------------------------------------------------------------------------
    async DodajanjeZemljiscaZaGradnjo() {
        await this.testUtils.dodajanjeZemljiscaZaGradnjo();

        await this.page.waitForTimeout(1000);

        await this.testUtils.brisanjeZemljiscaZaGradnjo('676', '7/1');
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async BarvanjeAktaNe() {
        await this.lokator.vseVrstice.first().waitFor({state: 'visible', timeout: 10000});
        const rdecaRGB = 'rgb(249, 19, 72)';
        const stVrstic = await this.lokator.vseVrstice.count();

        for (let i = 0; i < stVrstic; i++) {
            const TrenutnaVrstica = this.lokator.vseVrstice.nth(i);
            const prviElement = TrenutnaVrstica.locator('td').first();

            const stevilkaAkta = await prviElement.innerText();

            let jeRdec = true;
            try {
                await expect(prviElement).toHaveCSS('color', rdecaRGB, {timeout: 1000});
            } catch (e) {
                jeRdec = false;
            }

            if (!jeRdec) {
                console.log(`Akt št. ${stevilkaAkta.trim()} ni rdeč.`);
                continue;
            } else {
                console.log(`Akt št. ${stevilkaAkta.trim()} je rdeč. Preverjam zemljišča...`);

                await TrenutnaVrstica.click();
                await this.page.waitForLoadState('networkidle');

                await this.lokator.zemljiscaZaGradnjo.click();
                await this.page.waitForLoadState('networkidle');

                await this.lokator.vrsticeZemljisca.first().waitFor({state: 'attached', timeout: 1000}).catch(() => {
                });
                const stevilkaZemljisc = await this.lokator.vrsticeZemljisca.count();

                if (stevilkaZemljisc > 0) {
                    expect.soft(stevilkaZemljisc, `Akt ${stevilkaAkta.trim()} je rdeč, vendar ima zemljišča!`).toBe(0);
                    await this.lokator.homeGumb.click();
                    await this.page.waitForLoadState('networkidle');
                    continue;
                } else {
                    console.log(`Akt ${stevilkaAkta.trim()} je rdeč in brez zemljišč.`);
                    await this.lokator.homeGumb.click();
                    await this.page.waitForLoadState('networkidle');
                    return;
                }
            }
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async BarvanjeAktaJa() {
        await this.lokator.vseVrstice.first().waitFor({state: 'visible', timeout: 10000});
        const crnaRGB = 'rgb(33, 37, 41)';
        const zelenaRGB = 'rgb(80, 195, 59)';
        const stVrstic = await this.lokator.vseVrstice.count();

        for (let i = 0; i < stVrstic; i++) {
            const TrenutnaVrstica = this.lokator.vseVrstice.nth(i);

            const prviElement = TrenutnaVrstica.locator('td').first();
            const stevilkaAkta = await prviElement.innerText();

            let jeCrn = true;
            try {
                await expect(prviElement).toHaveCSS('color', crnaRGB, {timeout: 500});
            } catch (e) {
                jeCrn = false;
            }

            if (!jeCrn) {
                continue;
            }

            await TrenutnaVrstica.click();
            await this.page.waitForLoadState('networkidle');
            await this.lokator.zemljiscaZaGradnjo.click();
            await this.page.waitForLoadState('networkidle');

            await this.lokator.vrsticeZemljisca.first().waitFor({state: 'attached', timeout: 2000}).catch(() => {
            });
            const stevilkaZemljisc = await this.lokator.vrsticeZemljisca.count();

            if (stevilkaZemljisc === 0) {
                console.log(`Akt ${stevilkaAkta.trim()} je črn, a nima zemljišč. Iščem dalje...`);
                await this.lokator.homeGumb.click();
                await this.page.waitForLoadState('networkidle');
                continue;
            } else {
                console.log(`Akt ${stevilkaAkta.trim()} je črn in ima zemljišča.`);

                expect(stevilkaZemljisc).toBeGreaterThan(0);

                await this.lokator.homeGumb.click();
                return;
            }
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async SortiranjeZemljiscaZaGradnjo() {
        await this.lokator.IDUpravnegaAkta.fill('301905')

        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            this.lokator.gumbIsci.click()
        ]);

        await this.lokator.tabelaRezultatovPoizvedbe.first().waitFor({ state: 'visible', timeout: 10000 });

        await this.lokator.tabelaRezultatovPoizvedbe.first().click();
        await this.page.waitForLoadState('domcontentloaded');

        await this.lokator.zemljiscaZaGradnjo.click();

        await this.lokator.katastrskaObcinaHeader.click();
        await this.page.waitForTimeout(2000);
        
        const vrednost1raw = await this.page.locator('#tab-zemljisca_results tr[resultrow="true"]').first().locator('td.pis-datatable-cell').nth(0).innerText();
        const vrednost1 = Number(vrednost1raw.trim());
        console.log('Vrednost 1:', vrednost1);

        await this.lokator.katastrskaObcinaHeader.click();
        await this.page.waitForTimeout(1000);

        const vrednost2raw = await this.page.locator('#tab-zemljisca_results tr[resultrow="true"]').first().locator('td.pis-datatable-cell').nth(0).innerText();
        const vrednost2 = Number(vrednost2raw.trim());
        console.log('Vrednost 2:', vrednost2);

        expect(vrednost2).toBeGreaterThan(vrednost1);

        // Katastrska občina ime
        await this.lokator.katastrskaObcinaImeHeader.click();
        await this.page.waitForLoadState('networkidle');
        const vrednost3 = await this.page.locator('#tab-zemljisca_results tr[resultrow="true"]').first().locator('td.pis-datatable-cell').nth(1).innerText();
        console.log('Vrednost 3:', vrednost3);

        await this.lokator.katastrskaObcinaImeHeader.click();
        await this.page.waitForLoadState('networkidle');
        const vrednost4 = await this.page.locator('#tab-zemljisca_results tr[resultrow="true"]').first().locator('td.pis-datatable-cell').nth(1).innerText();
        console.log('Vrednost 4:', vrednost4);

        expect(vrednost3).not.toBe(vrednost4);

        // Parcelna številka
        await this.lokator.parcelnaStevilkaHeader.click();
        await this.page.waitForLoadState('networkidle');
        const vrednost5 = await this.page.locator('#tab-zemljisca_results tr[resultrow="true"]').first().locator('td.pis-datatable-cell').nth(2).innerText();
        console.log('Vrednost 5:', vrednost5);

        await this.lokator.parcelnaStevilkaHeader.click();
        await this.page.waitForLoadState('networkidle');
        const vrednost6 = await this.page.locator('#tab-zemljisca_results tr[resultrow="true"]').first().locator('td.pis-datatable-cell').nth(2).innerText();
        console.log('Vrednost 6:', vrednost6);

        expect(vrednost5).not.toBe(vrednost6);
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async BrisanjeZemljiscaZaGradnjo() {
        await this.testUtils.dodajanjeZemljiscaZaGradnjo();

        await this.page.waitForTimeout(1000);

        await this.testUtils.brisanjeZemljiscaZaGradnjo('676', '7/1');
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async VGrafiki() {
        await this.testUtils.navigirajDoGrafike('301905');

        await this.testUtils.vGrafiki();
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async ZapriDodajanjeStavbe() {
        await this.testUtils.navigirajDoGrafike('301905')

        await this.lokator.izbiranjeDropdown.click();

        await this.lokator.dodajStavboGumb.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.zapriVidnoSekcijoGumb.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.panelIzbraneStavbe).toBeHidden({timeout: 5000});
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async BrisiDodaneStavbe() {
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike('302040');

        await this.page.keyboard.press('Minus');
        await this.page.keyboard.press('Minus');
        await this.page.waitForTimeout(1000);

        await this.page.keyboard.press('Equal');
        await this.page.keyboard.press('Equal');
        await this.page.waitForTimeout(1000);

        await this.testUtils.nastaviMeriloMape('500');

        await this.lokator.izbiranjeDropdown.click();
        await this.lokator.dodajStavboGumb.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.mapa.waitFor({state: 'visible', timeout: 5000});

        await this.page.mouse.click(630, 187);

        await this.page.waitForTimeout(1000);

        await this.lokator.brisiObjektGumb.click({ force: true });
        await this.page.waitForLoadState('networkidle');

        const seznamStavb = this.lokator.vidnaSekcija.locator('div.body ul');
        await expect(seznamStavb).toBeEmpty({timeout: 5000});

        console.log("Stavba je bila uspešno izbrisana iz seznama (seznam je prazen)!");

        await this.page.waitForTimeout(3000);
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async SpreminjanjeVsebineVnosnihPoljObjekti() {
        await this.testUtils.odpriAktzID('302040');

        await this.lokator.objekti.first().click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.urediGumb.click();
        await this.page.waitForLoadState('networkidle');

        await expect(this.page).toHaveURL(/.*uredi\.html/);

        await expect(this.lokator.shraniGumb3).toBeVisible({timeout: 5000});
        await expect(this.lokator.brisiGumb).toBeVisible({timeout: 5000});

        await this.lokator.dodajObjektGumb.waitFor({state: 'attached', timeout: 10000});

        await this.lokator.dodajObjektGumb.click({force: true, timeout: 5000});

        await expect(this.lokator.vsebinaModalnegaOkna).toBeVisible({timeout: 10000});

        await expect(this.lokator.naslovModala).toHaveText('Dodajanje');

        console.log("Modal za dodajanje objektov se je uspešno odprl!");
    }

//------------------------------------------------------------------------------------------------------------------------------------
    async ZapriUrejanjeZapisaObjekti() {
        await this.testUtils.odpriAktzID('302040');

        await this.lokator.objekti.first().click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.urediGumb.click();
        await this.page.waitForLoadState('networkidle');

        await expect(this.page).toHaveURL(/.*uredi\.html/);

        await this.lokator.zapriGumb3.click();
        await this.page.waitForLoadState('networkidle');

        await expect(this.page).not.toHaveURL(/.*uredi/);
    }

    async ShranjevanjeSpremembObjekti() {
        await this.testUtils.odpriAktzID('302040');

        await this.lokator.objekti.first().click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.urediGumb.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.dodajObjektGumb.waitFor({state: 'attached', timeout: 10000});
        await this.lokator.dodajObjektGumb.click({force: true, timeout: 5000});

        await expect(this.lokator.urejanjeObrazcaObjekta).toBeVisible({timeout: 3000});
    }

    async dodajanjeObjektov() {
        await this.testUtils.odpriAktzID('302040');

        await this.lokator.objekti.first().click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.urediGumb.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.dodajObjektGumb.waitFor({state: 'attached', timeout: 10000});
        await this.lokator.dodajObjektGumb.click({force: true, timeout: 5000});

        await this.lokator.klasifikacijaStavbeContainer.click();
        await this.lokator.opcijaKlasifikacijeStavbe.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.checkboxNovogradnja.click();

        await this.lokator.brutoPovrsinaInput.click();
        await this.lokator.brutoPovrsinaInput.fill('67');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.brutoProstorninaInput.click();
        await this.lokator.brutoProstorninaInput.fill('80');
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
        await this.lokator.enosobnaPovrsinaInput.fill('7');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.dejavnostPovrsinaInput.click();
        await this.lokator.dejavnostPovrsinaInput.fill('77');
        await this.page.waitForLoadState('networkidle');

        await this.lokator.potrdiGumbModalnoOkno.click();
        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.preverbaVrsticeObjekti).toBeVisible();
        await this.lokator.preverbaVrsticeObjekti.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.brisiGumbObjekti.waitFor({state: 'attached'});
        await this.lokator.brisiGumbObjekti.click();
        await this.page.waitForLoadState('networkidle');
    }

    async pogojiEnostavni() {
        await this.testUtils.odpriAktzID('302040');

        await this.lokator.osnovniPodatki.click();
        await this.page.waitForLoadState('networkidle');

        const trenutnaVrednost = await this.lokator.vrstaPostopkaInput.inputValue();

        const jeVeljavno = trenutnaVrednost.includes('MOP-UE0006-P1') || trenutnaVrednost.includes('MOP-UE0040-P2');

        if (jeVeljavno) {

            console.log("objekt spada med enostavne ==> je MOP-UE0006-P1 ali MOP-UE0040-P2");
            console.log("Bruto prostornina in stroški gradnje nesmejo biti obvezni!")
            await this.lokator.objekti.first().click();
            await this.page.waitForLoadState('networkidle');
            await this.lokator.urediGumb.click();
            await this.page.waitForLoadState('networkidle');

            await this.lokator.dodajObjektiGumb.waitFor({state: 'attached', timeout: 10000});
            await this.lokator.dodajObjektiGumb.click({force: true, timeout: 5000});

            await this.lokator.shraniObjekt.click();
            await this.page.waitForLoadState('networkidle');

            const besediloNapake = await this.lokator.errorContainer.innerText();

            expect(besediloNapake).not.toContain('Bruto prostornina je obvezen podatek.');
            expect(besediloNapake).not.toContain('Stroški gradnje ne morejo biti manjši od 50 EUR/m2.');
            expect(besediloNapake).not.toContain('Bruto prostornina mora biti večja od bruto površine.');

        } else {

            console.log("objekt ne spada med enostavne ==> ni MOP-UE0006-P1 ali MOP-UE0040-P2");
            console.log("Bruto prostornina in stroški gradnje sta obvezna!")

            await this.lokator.objekti.first().click();
            await this.page.waitForLoadState('networkidle');

            await this.lokator.urediGumb.click();
            await this.page.waitForLoadState('networkidle');

            await this.lokator.dodajObjektiGumb.waitFor({state: 'attached', timeout: 10000});
            await this.lokator.dodajObjektiGumb.click({force: true, timeout: 5000});

            await this.lokator.shraniObjekt.click();
            await this.page.waitForLoadState('networkidle');

            await this.lokator.errorContainer.waitFor({state: 'visible', timeout: 5000});
            const besediloNapake = await this.lokator.errorContainer.innerText();

            expect(besediloNapake).toContain('Stroški gradnje ne morejo biti manjši od 50 EUR/m2.');
            expect(besediloNapake).toContain('Bruto površina je obvezen podatek.');
            expect(besediloNapake).toContain('Bruto prostornina mora biti večja od bruto površine');

        }
    }

    async pogojiPriVpisuObjekta() {
        await this.testUtils.odpriAktzID('302040');

        await this.lokator.objekti.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.urediGumb.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.prvaVrsticaObjekta.waitFor({state: 'visible', timeout: 5000});

        await this.lokator.prvaVrsticaObjekta.click();

        await this.page.waitForLoadState('networkidle');

        await this.lokator.brisiGumbObjekti.click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.lokator.lokatorNaslova).toBeVisible();
    }

    async urediObjekte() {
        await this.testUtils.odpriAktzID('302040');

        await this.lokator.objekti.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.urediGumb.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.dodajObjektGumb.click();

        await expect(this.lokator.naslovModala2).toBeVisible();

        await this.lokator.shraniObjekt.click();

        await expect(this.page.getByText('Napačni podatki')).toBeVisible();

        await expect(this.lokator.errorContainer).toContainText('CC-SI je obvezen podatek.');
        await expect(this.lokator.errorContainer).toContainText('Vrsta del je obvezen podatek.');
        await expect(this.lokator.errorContainer).toContainText('Bruto površina je obvezen podatek.');
    }

    async drugiPogojiPriVpisuObjekta() {
        await this.testUtils.odpriAktzID('302040');

        await this.testUtils.drugiPogojiPriVpisuObjektaF();
    }

    async projektnaDokumentacija() {
        await this.testUtils.zapiranjeProjektneDokumentacije();

        await this.testUtils.preveriZapisVTabeli('rezultatnaTabelaDokumentov', '10');
    }

    async dokumenti3() {
        await this.testUtils.odpriAktzID('302040');

        await this.lokator.dokumenti.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.urediGumb.click();
        await this.page.waitForLoadState('networkidle');

        await this.lokator.prvaVrsticaDokumenta.click({force: true});

        await this.page.waitForLoadState('networkidle');

        await this.lokator.dodajDokument.click();

        await expect.soft(this.lokator.dodajanjeHeader).toContainText(/Dodajanje.*dokumentov v zadevi/s);

        await this.lokator.zapriModalnoOkno.click();

        await this.lokator.urediDokument.click();

        await expect.soft(this.lokator.dodajanjeHeader).toContainText(/Spreminjanje.*dokumentov v zadevi/s);

        await this.lokator.zapriModalnoOkno.click();

        await this.lokator.brisiDokument.click();

        await expect.soft(this.lokator.dodajanjeHeader).toContainText(/Brisanje.*dokumentov v zadevi/s);

        await this.lokator.zapriModalnoOkno.click();

        await this.lokator.gumbZapri.click();

        await expect(this.page).toHaveURL('https://pis.intra.igea.si/pis-ua/seznam.html');
    }

    async dodajanjaAkta() {
        this.napake = [];

        const poskusi = async (imeKoraka, akcija) => {
            try {
                await akcija();
                console.log(`✅ USPEŠNO: ${imeKoraka}`);
            } catch (error) {
                console.error(`❌ NAPAKA pri: ${imeKoraka} ->`, error.message);
                this.napake.push(`${imeKoraka}: ${error.message}`);
            }
        };

        // --- 1. GUMB ZA DODAJANJE ---
        await poskusi('Klik na gumb za dodajanje', async () => {
            await this.lokator.dodajanjeAktaGumb.click();
            await this.page.waitForLoadState('networkidle');
            await expect(this.page).toHaveURL('https://pis.intra.igea.si/pis-ua/upravni-akt/uredi.html?id=0');
        });

        // --- 2. UPRAVNI ORGAN ---
        await poskusi('Izbira upravnega organa', async () => {
            await this.lokator.izbiraUpravnegaOrgana.click();
            await this.page.waitForLoadState('networkidle');
            await this.lokator.opcijaUpravniOrgan.click();
            await expect(this.lokator.izbiraUpravnegaOrgana).toHaveAttribute('title', 'UPRAVNA ENOTA RUŠE');
        });

        // --- 3. ŠTEVILKA ZADEVE ---
        await poskusi('Vnos številke zadeve', async () => {
            await this.lokator.vnosStevilkeZadeve.fill('351-85/2023-6220');
            await this.lokator.vnosStevilkeZadeve.press('Enter');
            await expect(this.lokator.vnosStevilkeZadeve).toHaveValue('351-85/2023-6220');
        });

        // --- 4. VRSTA POSTOPKA ---
        await poskusi('Izbira vrste postopka', async () => {
            await this.page.keyboard.press('Escape');
            await this.lokator.izbiraVrstePostopka.click();
            await this.lokator.opcijaVrstaPostopka.click();
            await expect(this.lokator.izbiraVrstePostopka2.toHaveAttribute('title', 'Gradbeno dovoljenje'));
        });

        // --- 5. DATUM IZVOZA (SURS) ---
        await poskusi('Vnos datuma izvoza', async () => {
            await this.page.evaluate(() => document.getElementById('datum_izvoza').removeAttribute('readonly'));
            await this.lokator.izbiraDatumaIzvoza.fill('02.07.2026');
            await expect(this.lokator.izbiraDatumaIzvoza).toHaveValue('02.07.2026');
        });

        // --- 6. DATUM ZAČETKA ---
        await poskusi('Vnos datuma začetka', async () => {
            await this.lokator.izbiraDatumaZacetka.fill('02.07.2026');
            await expect(this.lokator.izbiraDatumaZacetka).toHaveValue('02.07.2026');
        });

        // --- 7. DATUM POPOLNOSTI ---
        await poskusi('Vnos datuma popolnosti', async () => {
            await this.lokator.izbiraDatumaPopolnosti.fill('02.07.2026');
            await expect(this.lokator.izbiraDatumaPopolnosti).toHaveValue('02.07.2026');
        });

        // --- 8. NAČIN REŠITVE ---
        await poskusi('Izbira načina rešitve', async () => {
            await this.page.keyboard.press('Escape');
            await this.lokator.izbiraNacinaResitve.click();
            await this.lokator.opcijaNacinResitve.click();
            await expect(this.lokator.izbiraNacinaResitve2).toHaveAttribute('title', 'ZAHTEVI UGODENO');
        });

        // --- 9. DATUM PRIJAVE ---
        await poskusi('Vnos datuma prijave', async () => {
            await this.lokator.izbiraDatumaPrijave.fill('02.07.2026');
            await expect(this.lokator.izbiraDatumaPrijave).toHaveValue('02.07.2026');
        });

        // --- 10. NAZIV GRADNJE ---
        await poskusi('Vnos naziva gradnje', async () => {
            await this.lokator.izbiraNazivaGradnje.fill('Testni vnos podatkov');
            await expect(this.lokator.izbiraNazivaGradnje).toHaveValue('Testni vnos podatkov');
        });

        // --- 11. UPRAVNI POSTOPEK ---
        await poskusi('Vnos upravnega postopka z neposrednim klikom', async () => {
            await this.lokator.izbiraUpravnegaPostopka.click();

            await this.lokator.meniDropdown.waitFor({state: 'visible', timeout: 4000});

            await this.lokator.opcijaUpravnegaOrgana.scrollIntoViewIfNeeded();
            await this.lokator.opcijaUpravnegaOrgana.click();
            await this.page.waitForLoadState('networkidle');

            try {
                await expect(this.lokator.prikazovalnikUpravnegaPostopka).toHaveAttribute('title', 'Enotno dovoljenje - MOP-DP012-P2', {timeout: 3000});
            } catch {
                await expect(this.lokator.prikazovalnikUpravnegaPostopka).toHaveText(/Enotno dovoljenje - MOP-DP012-P2/, {timeout: 3000});
            }
        });

        // --- 12. ŠTEVILKA SPISA ---
        await poskusi('Vnos številke spisa', async () => {
            await this.lokator.izbiraStevilkeSpisa.fill('Številka-Spisa-123/2026');
            await expect(this.lokator.izbiraStevilkeSpisa).toHaveValue('Številka-Spisa-123/2026');
        });

        // --- 13. GUMB SHRANI ---
        await poskusi('Klik na gumb Shrani', async () => {
            await this.lokator.shraniGumb2.scrollIntoViewIfNeeded();
            await this.lokator.shraniGumb2.click();
            await this.page.waitForLoadState('networkidle');
        });

        // --- 14. GUMB ZAPRI ---
        await poskusi('Klik na gumb Zapri', async () => {
            if (this.page.url().includes('seznam.html')) {
                console.log("ℹ️ Stran je že preusmerjena na seznam, korak Zapri se preskoči.");
                return;
            }

            if (await this.lokator.opozorilnoOkno.isVisible().catch(() => false)) {
                console.log("⚠️ Zaznano opozorilno okno o manjkajočih podatkih. Zapiram opozorilo...");
                await this.lokator.opozorilnoOkno.locator('button').first().click().catch(() => {
                });
                await this.page.waitForTimeout(500);
            }

            // DODANO: Najprej zavrtimo stran do gumba, če obstaja v DOM-u
            if (await this.lokator.zapriGumb.count() > 0) {
                console.log("Pomikam stran do gumba Zapri...");
                await this.lokator.zapriGumb.scrollIntoViewIfNeeded().catch(() => {
                });
                await this.page.waitForTimeout(300); // Kratek premor, da se premik stabilizira
            }

            if (await this.lokator.zapriGumb.isVisible().catch(() => false)) {
                console.log("Klikam gumb Zapri s pravo miško...");
                await this.lokator.zapriGumb.click({force: true});

                console.log("Čakam na preusmeritev na seznam.html...");
                await this.page.waitForURL('**/seznam.html', {timeout: 7000}).catch(() => {
                    console.log("⚠️ Opozorilo: Preusmeritev na seznam.html je trajala dlje kot običajno.");
                });

                await this.page.waitForLoadState('networkidle').catch(() => {
                });
            } else {
                console.log("ℹ️ Gumb Zapri po scrollu ni viden ali pa je stran že začela preusmeritev.");
            }
        });
    }


    async podatkiOInvestitorju2() {
        this.napake = [];

        // --- 1. KORAK: ISKANJE ZADEVE IN ODPRTJE MODALA ---
        await poskusi('Iskanje zadeve in odprtje modala za investitorje', async () => {
            await this.lokator.IDUpravnegaAkta.waitFor({state: 'visible', timeout: 10000});
            await this.lokator.IDUpravnegaAkta.click({force: true});
            await this.lokator.IDUpravnegaAkta.clear();
            await this.lokator.IDUpravnegaAkta.fill("302040");

            await this.lokator.isciGumb.click({force: true});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });
            await this.page.waitForTimeout(500);

            await this.lokator.opcijaStZadeve.waitFor({state: 'visible', timeout: 10000});
            await this.lokator.opcijaStZadeve.click({force: true});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });
            await this.page.waitForTimeout(1000);

            await this.lokator.podatkiOInvestitorju.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.podatkiOInvestitorju.click({force: true});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            await this.lokator.urediGumb.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.urediGumb.click({force: true});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            await this.lokator.dodajGumbInvestitor.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.dodajGumbInvestitor.click({force: true});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            await this.lokator.shraniInvestitorjaModalnoOkno.waitFor({state: 'visible', timeout: 7000});

            await expect(this.lokator.naslovDodajanja).toBeVisible({message: "Naslov modala ne prikazuje načina 'Dodajanje'."});
            await expect((this.lokator.naslovSpreminjanja).toBeHidden({message: "Naslov modala bi moral imeti skrit način 'Spreminjanje'."}));

            console.log("✅ Modal za investitorje je uspešno potrjen v načinu Dodajanje.");
        }, this);

        // --- 2. KORAK: VNOS PODATKOV V OBRAZEC IN POTRDITEV ---
        await poskusi('Vnos podatkov in potrditev investitorja', async () => {
            const praviModal = this.page.locator('.modal-content')
                .filter({has: this.page.locator('#saveinvestitor')});

            // Vnos v polje Naziv (Janez)
            await this.lokator.nazivInvestitorja.waitFor({state: 'visible', timeout: 3000});
            await this.lokator.nazivInvestitorja.click({force: true});
            await this.lokator.nazivInvestitorja.clear();
            await this.lokator.nazivInvestitorja.fill('Janez');

            // Vnos v polje Naslov (Rovte 1)
            await this.lokator.poljeNaslov.click({force: true});
            await this.lokator.poljeNaslov.clear();
            await this.lokator.poljeNaslov.fill('Rovte 1');

            // Izbira iz spustnega seznama Status (value="0" je Fizična oseba)
            await this.lokator.statusDropdown.selectOption('0');

            // Lociramo gumb Potrdi
            await this.lokator.shraniInvestitorja.waitFor({state: 'visible', timeout: 3000});
            await this.lokator.shraniInvestitorja.click();

            await this.page.waitForTimeout(1500);
            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            console.log("✅ Gumb Potrdi je bil uspešno kliknjen.");
        }, this);

        // --- 3. KORAK: PREVERJANJE ZAPISA V TABELI INVESTITORJEV ---
        await poskusi('Preverjanje vnesenih podatkov v tabeli', async () => {
            await expect(this.lokator.opcijaInvestitor).toBeVisible({
                timeout: 7000,
                message: "V tabeli investitorjev ni mogoče najti vrstice z imenom 'Janez'."
            });

            // Preverimo pravilnost vseh vnesenih vrednosti
            await expect(this.lokator.opcijaInvestitor).toContainText('Rovte 1', {
                message: "Naslov investitorja v tabeli se ne ujema z 'Rovte 1'."
            });

            await expect(this.lokator.opcijaInvestitor).toContainText('Fizična oseba', {
                message: "Status investitorja v tabeli se ne ujema s 'Fizična oseba'."
            });

            console.log("Podatki v tabeli investitorjev so bili uspešno preverjeni.");
        }, this);
    }


    async dodajanjeZemljiscaZaGradnjo() {
        this.napake = [];

        await poskusi('Dodajanje zemljisca za gradnjo', async () => {
            await this.lokator.IDUpravnegaAkta.waitFor({state: 'visible', timeout: 10000});
            await this.lokator.IDUpravnegaAkta.click({force: true});
            await this.lokator.IDUpravnegaAkta.clear();
            await this.lokator.IDUpravnegaAkta.fill("302040");

            await this.lokator.isciGumb.click({force: true});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });
            await this.page.waitForTimeout(500);

            await this.lokator.opcijaStZadeve.waitFor({state: 'visible', timeout: 10000});
            await this.lokator.opcijaStZadeve.click({force: true});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });
            await this.page.waitForTimeout(1000);

            await this.lokator.zemljiscaZaGradnjo.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.zemljiscaZaGradnjo.click({force: true});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            await this.lokator.urediGumb.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.urediGumb.click({force: true});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            const obstaja = await this.lokator.opcijaZemljiscaZaGradnjo.isVisible();

            if (obstaja) {
                console.log("Zemljišče 676 PEKRE 7/1 obstaja. Zaganjam postopek brisanja...");

                await this.lokator.opcijaZemljiscaZaGradnjo.click({force: true, delay: 100});
                await this.page.waitForTimeout(500);

                await this.lokator.brisiZemljisce.waitFor({state: 'visible', timeout: 3000});
                await this.lokator.brisiZemljisce.click({force: true, delay: 100});

                await this.lokator.izbrisZemljiscaGumb.waitFor({state: 'visible', timeout: 5000});
                await this.lokator.izbrisZemljiscaGumb.click({force: true, delay: 100});

                await this.page.waitForLoadState('networkidle').catch(() => {
                });
                await this.page.waitForTimeout(2000);

                await this.lokator.shraniGumb2.waitFor({state: 'visible', timeout: 5000});
                await this.lokator.shraniGumb2.click({force: true, delay: 150});

                await this.page.waitForLoadState('networkidle').catch(() => {
                });
                await this.page.waitForTimeout(1500);

                console.log("✅ Glavni obrazec je bil uspešno shranjen.");

                await expect(this.lokator.opcijaZemljiscaZaGradnjo).not.toBeVisible({timeout: 10000});
                await this.page.waitForLoadState('networkidle').catch(() => {
                });

                console.log("Zemljišče uspešno izbrisano iz tabele.");
            } else {
                console.log("Zemljišče 676 PEKRE 7/1 ni bilo najdeno v tabeli, zato brisanje ni potrebno.");
            }

            await this.lokator.dodajZemljisceGumb.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.dodajZemljisceGumb.click({force: true});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            await this.lokator.obcina2Dropdown.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.obcina2Dropdown.click({force: true});
            await this.page.waitForTimeout(500);

            await this.lokator.vnosnoPolje2.waitFor({state: 'visible', timeout: 3000});
            await this.lokator.vnosnoPolje2.fill('676');
            await this.page.waitForTimeout(500);

            await this.lokator.opcijaObcine.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.opcijaObcine.click({force: true});

            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            await this.lokator.parcelnaStInput.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.parcelnaStInput.click({force: true});
            await this.page.waitForTimeout(500);

            await this.lokator.vnosnoPolje2.waitFor({state: 'visible', timeout: 3000});
            await this.lokator.vnosnoPolje2.fill('7/1');
            await this.page.waitForTimeout(500);

            await this.lokator.opcijaParcele2.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.opcijaParcele2.click({force: true});

            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            await this.lokator.dodajZemljisceGumbModalnoOkno.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.dodajZemljisceGumbModalnoOkno.click({force: true, delay: 100});

            await this.page.waitForTimeout(1500);
            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            await this.lokator.potrdiZemljisceGumbModalnoOkno.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.potrdiZemljisceGumbModalnoOkno.click({force: true, delay: 100});

            await this.page.waitForTimeout(1500);
            await this.page.waitForLoadState('networkidle').catch(() => {
            });
        }, this);

        await poskusi('Preverjanje in klik na dodano zemljišče v tabeli', async () => {
            await expect(this.lokator.opcijaZemljiscaZaGradnjo).toBeVisible({
                timeout: 7000,
                message: "V tabeli zemljišč ni mogoče najti vrstice za PEKRE 7/1."
            });

            await expect(this.lokator.opcijaZemljiscaZaGradnjo).toContainText('676', {message: "Številka občine se ne ujema s 676."});
            await expect(this.lokator.opcijaZemljiscaZaGradnjo).toContainText('PEKRE', {message: "Ime občine se ne ujema s PEKRE."});
            await expect(this.lokator.opcijaZemljiscaZaGradnjo).toContainText('7/1', {message: "Parcelna številka se ne ujema s 7/1."});

            await this.lokator.opcijaZemljiscaZaGradnjo.click({force: true, delay: 100});
            await this.page.waitForLoadState('networkidle').catch(() => {
            });
        }, this);
    }

    async uvozCsv() {
        this.napake = [];

        await poskusi('Uvoz csv', async () => {
            await this.lokator.VnosStZadeve.waitFor({state: 'visible', timeout: 10000});
            await this.lokator.VnosStZadeve.click({force: true});
            await this.lokator.VnosStZadeve.clear();
            await this.lokator.VnosStZadeve.fill("302040");

            await this.lokator.gumbIsci.click({force: true});

            await this.lokator.opcijaStZadeve.waitFor({state: 'visible', timeout: 10000});
            await this.lokator.opcijaStZadeve.click({force: true});

            await this.lokator.zemljiscaZaGradnjo.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.zemljiscaZaGradnjo.click({force: true});

            await this.lokator.urediGumb.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.urediGumb.click({force: true});

            const obstaja = await this.lokator.opcijaZemljiscaZaGradnjo.isVisible().catch(() => false);

            if (obstaja) {
                console.log("Zemljišče 676 PEKRE 7/1 obstaja. Zaganjam postopek brisanja...");

                await this.lokator.opcijaZemljiscaZaGradnjo.click({force: true});

                await this.page.waitForTimeout(2000);

                await this.lokator.brisiZemljisce.waitFor({state: 'visible', timeout: 3000});
                await this.lokator.brisiZemljisce.click({force: true});

                await this.page.waitForTimeout(2000);

                await this.lokator.izbrisZemljiscaGumb.waitFor({state: 'visible', timeout: 5000});
                await this.lokator.izbrisZemljiscaGumb.click({force: true});

                await this.page.waitForTimeout(2000);

                await this.lokator.shraniGumb2.waitFor({state: 'visible', timeout: 5000});
                await this.lokator.shraniGumb2.click({force: true});

                await this.page.waitForTimeout(2000);

                console.log("✅ Glavni obrazec je bil uspešno shranjen.");

                await expect(this.lokator.opcijaZemljiscaZaGradnjo).not.toBeVisible({timeout: 10000});
                console.log("Zemljišče uspešno izbrisano iz tabele.");

                await this.lokator.urediGumb.waitFor({state: 'visible', timeout: 5000});
                await this.lokator.urediGumb.click({force: true});
            } else {
                console.log("Zemljišče 676 PEKRE 7/1 ni bilo najdeno v tabeli, zato brisanje ni potrebno.");
            }

            await this.lokator.dodajZemljisceGumb.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.dodajZemljisceGumb.click({force: true});

            // 5. Izbira občine v modalnem oknu
            await this.lokator.obcina2Dropdown.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.obcina2Dropdown.click({force: true});

            await this.lokator.vnosnoPolje2.waitFor({state: 'visible', timeout: 3000});
            await this.lokator.vnosnoPolje2.fill('676');

            await this.lokator.opcijaObcine2.waitFor({state: 'visible', timeout: 5000});
            await this.lokator.opcijaObcine2.click({force: true});

            // 6. Uvoz CSV datoteke
            await this.lokator.CsvInput.waitFor({state: 'attached', timeout: 5000});
            console.log("⏳ Nalagam CSV datoteko...");
            await this.lokator.CsvInput.setInputFiles('testApp/parcele.csv');
            console.log("✅ CSV datoteka je bila uspešno poslana v sistem.");

            // 7. Shranjevanje znotraj modalnega okna
            await this.lokator.dodajZemljisceGumbModalnoOkno.waitFor({state: 'attached', timeout: 5000});
            await this.lokator.dodajZemljisceGumbModalnoOkno.click({force: true});

            // 8. Potrditev celotnega vnosnega okna
            await this.lokator.potrdiZemljisceGumbModalnoOkno.waitFor({state: 'attached', timeout: 5000});
            await this.lokator.potrdiZemljisceGumbModalnoOkno.click({force: true});
        }, this);
    }



    async pregledGraf1() {
        this.napake = [];

        await poskusi('Iskanje po naslovu', async () => {
            await this.testUtils.navigirajDoGrafike("302040");

            this.gumbIskanjePoNaslovu = this.page.locator('i.search-button[title="Iskanje po naslovu"]');

            await this.gumbIskanjePoNaslovu.waitFor({state: 'visible', timeout: 5000});

            await this.gumbIskanjePoNaslovu.click({force: true, delay: 100});

            await this.page.waitForLoadState('domcontentloaded');

            this.vnosNaslov = this.page.locator('input#addressSearchFilter');

            await this.vnosNaslov.waitFor({state: 'visible', timeout: 5000});
            await this.vnosNaslov.click({force: true});
            await this.vnosNaslov.clear();

            await this.vnosNaslov.pressSequentially("Tržaška cesta 20, 1000 Ljublj", {delay: 50});

            await this.page.keyboard.press('Enter');

            await this.page.waitForLoadState('networkidle').catch(() => {
            });
            await this.page.waitForTimeout(1000);

            console.log("✅ Naslov je bil uspešno vnesen in potrjen.");

            this.zavihekIzbraneVsebine = this.page.locator('div.card-header[data-target="#cloud_vrstniRedSlojev"]');

            await this.zavihekIzbraneVsebine.waitFor({state: 'visible', timeout: 5000});

            await this.zavihekIzbraneVsebine.click({force: true});

            await this.page.waitForTimeout(3000);
            await this.page.waitForLoadState('networkidle').catch(() => {
            });

            console.log("✅ Zavihek 'Izbrane vsebine' je bil uspešno razširjen.");

        }, this);
    }

    async pregledGraf2() {
        await poskusi('Iskanje po parceli', async () => {
            await this.testUtils.navigirajDoGrafike("302040");

            this.gumbIskanjePoParceli = this.page.locator('i.search-button.icon-po_parceli[title="Iskanje po parcelah"]');

            await this.gumbIskanjePoParceli.waitFor({state: 'visible', timeout: 5000});

            await this.gumbIskanjePoParceli.click({force: true, delay: 100});

            await this.page.waitForLoadState('domcontentloaded');

            this.vnosObcina = this.page.locator('input#parcelCadSearchFilter');

            await this.vnosObcina.waitFor({state: 'visible', timeout: 5000});
            await this.vnosObcina.click({force: true});
            await this.vnosObcina.clear();
            await this.vnosObcina.pressSequentially("Gradišče ||", {delay: 100});

            const opcija = this.page.locator('.ui-menu-item').filter({hasText: 'Gradišče'}).first();

            await opcija.waitFor({state: 'visible', timeout: 5000});
            await opcija.click({force: true});

            console.log("✅ Katastrska občina 'Gradišče' je bila uspešno izbrana.");

            this.vnosParcela = this.page.locator('input#parcelSearchFilter');

            await this.vnosParcela.waitFor({state: 'visible', timeout: 5000});
            await this.vnosParcela.click({force: true});

            await this.vnosParcela.pressSequentially("124/26", {delay: 100});

            const predlogParcela = this.page.locator('.ui-menu-item').filter({hasText: '124/26'}).first();

            if (await predlogParcela.isVisible({timeout: 2000})) {
                await predlogParcela.click({force: true});
            } else {
                await this.page.keyboard.press('Enter');
            }

            await this.page.waitForLoadState('networkidle').catch(() => {
            });
            await this.page.waitForTimeout(1000);

            console.log("✅ Parcelna številka '124/26' je bila uspešno vnesena.");

            await this.page.waitForLoadState('networkidle').catch(() => {
            });
            await this.page.waitForTimeout(500);

        }, this);
    }


    async pregledGraf3() {
        await this.testUtils.navigirajDoGrafike("302040");

        /*await this.lokator.gumbIskanjePoObmocju.click();
        await this.lokator.vnosnoPoljeIskanjePoObmocju.click();
        await this.lokator.vnosnoPoljeIskanjePoObmocju.fill("Gorenjska");
        await this.lokator.opcijaNaSeznamu.click();

        const thumb = this.page.locator('.ol-zoomslider-thumb');
        const parent = this.page.locator('.ol-zoomslider');

        const thumbBox = await thumb.boundingBox();
        const parentBox = await parent.boundingBox();

        if (thumbBox && parentBox) {
            const targetX = thumbBox.x + thumbBox.width / 2;
            const startY = thumbBox.y + thumbBox.height / 2;

            const targetY = parentBox.y + parentBox.height - (thumbBox.height / 2);

            await this.page.mouse.move(targetX, startY);
            await this.page.mouse.down();
            await this.page.mouse.move(targetX, targetY);
            await this.page.mouse.up();
        }

        await this.page.setViewportSize({width: 2539, height: 1252});

        await expect(this.page).toHaveScreenshot('gorenjskaRegija.png', {
            animations: 'disabled',
            timeout: 10000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });

        await this.page.waitForTimeout(2000);

        // ==========================================
        // --- 1. ZAVIHEK: Izbrane vsebine (Odpiranje) ---
        // ==========================================


        console.log("--- 1. Zavihek: Izbrane vsebine ---");
        const zavihek1 = this.page.locator('div.card-header[data-target="#cloud_vrstniRedSlojev"] a.accordion-toggle').first();
        const div1 = this.page.locator('div.card-header[data-target="#cloud_vrstniRedSlojev"]').first();

        console.log("⏱️ Čakam 2 sekundi PRED preverjanjem 1. zavihka...");
        await this.page.waitForTimeout(2000);

        const status1 = await div1.getAttribute('aria-expanded');
        console.log("Status 1. zavihka (aria-expanded):", status1);

        if (status1 !== 'true') {
            console.log("1. zavihek je zaprt, ga odpiram...");
            await zavihek1.click({force: true});

            try {
                const vsebina1 = this.page.locator('#cloud_vrstniRedSlojev');
                await expect(this.page.locator('#cloud_vrstniRedSlojev')).toBeVisible({timeout: 5000});
                console.log("⏱️ Čakam 2 sekundi PO odprtju 1. zavihka...");
                await this.page.waitForTimeout(2000);
                console.log("✅ 1. zavihek se je uspešno odprl.");
            } catch (e) {
                throw new Error("❌ 1. zavihek se kljub kliku ni odprl!");
            }
        } else {
            console.log("ℹ️ 1. zavihek je bil že odprt.");
        }


        // ==========================================
        // --- 2. ZAVIHEK: Vsebina (Zapiranje) ---
        // ==========================================
        console.log("--- 2. Zavihek: Vsebina ---");
        const zavihek2 = this.page.locator('div.card-header[data-target="#cloud_legenda"] a.accordion-toggle').first();
        const div2 = this.page.locator('div.card-header[data-target="#cloud_legenda"]').first();

        console.log("⏱️ Čakam 2 sekundi PRED preverjanjem 2. zavihka...");
        await this.page.waitForTimeout(2000);

        const status2 = await div2.getAttribute('aria-expanded');
        console.log("Status 2. zavihka (aria-expanded):", status2);

        if (status2 === 'true') {
            console.log("2. zavihek je bil odprt, ga zapiram...");
            await zavihek2.click({force: true});

            try {
                const vsebina2 = this.page.locator('#cloud_legenda');
                await vsebina2.waitFor({state: 'hidden', timeout: 5000});
                console.log("⏱️ Čakam 2 sekundi PO zaprtju 2. zavihka...");
                await this.page.waitForTimeout(2000);
                console.log("✅ 2. zavihek se je uspešno zaprl.");
            } catch (e) {
                throw new Error("❌ 2. zavihek se kljub kliku ni zaprl!");
            }
        } else {
            console.log("ℹ️ 2. zavihek je bil zaprt, ga zdaj odpiram...");
        }

        await zavihek2.click({force: true});

        try {
            const vsebina2 = this.page.locator('#cloud_legenda');
            await vsebina2.waitFor({state: 'visible', timeout: 5000});
            console.log("⏱️ Čakam 2 sekundi PO odprtju 2. zavihka...");
            await this.page.waitForTimeout(2000);
            console.log("✅ 2. zavihek se je uspešno odprl.");
        } catch (e) {
            throw new Error("❌ 2. zavihek se kljub kliku ni odprl!");
        }

        // ==========================================
        // --- 3. KORAK: Klik na "Posamezni objekti" in preverjanje podmenijev ---
        // ==========================================
        console.log("--- 3. Korak: posamezni objekti ---");

        console.log("⏱️ Čakam 2 sekundi PRED iskanjem elementa...");
        await this.page.waitForTimeout(2000);

        await zavihek1.click({force: true});
        await zavihek2.click({force: true});

        try {
            await this.lokator.posamezniObjekti.scrollIntoViewIfNeeded();

            console.log("Razpiram posamezne objekte...");
            await this.lokator.posamezniObjekti.click({ force: true });

            // 1. Prvi klik ODSTRANI kljukico (ker je bila privzeto vklopljena)
            console.log("Klikam na checkbox Stavbe za IZKLOP...");
            await this.lokator.checkboxStavbe.scrollIntoViewIfNeeded();
            await this.lokator.checkboxStavbe.click({ force: true });

            await expect(this.lokator.posamezniObjekti).toHaveClass(/fa-square/);
            console.log("  ✓ Kljukica je uspešno izklopljena (fa-square).");

            // 2. Drugi klik PONOVNO VKLOPi kljukico
            console.log("Klikam na checkbox Stavbe za ponovni VKLOP...");
            await this.lokator.checkboxStavbe.click({ force: true });

            await expect(this.lokator.posamezniObjekti).toHaveClass(/fa-check-square/);
            console.log("  ✓ Kljukica je ponovno vklopljena (fa-check-square).");

        } catch (e) {
            throw new Error(`❌ Napaka pri infrastrukturi / preverjanju kljukice: ${e.message}`);
        }*/

        // =========================================================
        // --- 4. KORAK: Vklop sloja Parcele in primerjava slike ---
        // =========================================================
        console.log("--- 4. Korak: Vklop sloja Parcele in primerjava slike ---");

        try {
            // 1. Nastavitev dimenzije zaslona (Viewport)
            await this.page.setViewportSize({ width: 1904, height: 902 });

            console.log("Izklapljam privzeto obkljukan sloj Parcele (1. klik)...");
            await this.lokator.checkboxParcele.scrollIntoViewIfNeeded();
            await this.lokator.checkboxParcele.click({ force: true });
            await this.page.waitForTimeout(500);

            // 5. DRUGI KLIK: Ponovni vklop sloja Parcele
            console.log("Ponovno vklapljam sloj Parcele (2. klik)...");
            await this.lokator.checkboxParcele.click({ force: true });

            // 6. Nastavitev drsnika zemljevida na točno višino (top: 41.9913px)
            const sliderParent = this.page.locator('.ol-zoomslider').first();
            const sliderThumb = this.page.locator('.ol-zoomslider-thumb').first();

            if (await sliderParent.isVisible()) {
                const parentBox = await sliderParent.boundingBox();
                const thumbBox = await sliderThumb.boundingBox();

                if (thumbBox && parentBox) {
                    console.log("Premikam drsnik na določeno višino (top: 41.99px)...");

                    const targetX = thumbBox.x + thumbBox.width / 2;
                    const startY = thumbBox.y + thumbBox.height / 2;

                    const targetY = parentBox.y + 41.9913 + (thumbBox.height / 2);

                    await this.page.mouse.move(targetX, startY);
                    await this.page.mouse.down();
                    await this.page.mouse.move(targetX, targetY, { steps: 10 });
                    await this.page.mouse.up();

                    console.log("  ✓ Drsnik je uspešno premaknjen na ciljno pozicijo.");
                }
            } else {
                console.warn("⚠️ Bounding box za drsnik ali vodilo ni bil najden.");
            }

            const canvas = this.page.locator('canvas.ol-unselectable').first();

            const box = await canvas.boundingBox();

            if (box) {
                const targetX = box.width * 0.5;
                const targetY = box.height * 0.5;

                console.log(`Klikam na canvas na pozicijo X: ${targetX}px, Y: ${targetY}px...`);

                await canvas.click({
                    position: { x: targetX, y: targetY }
                });
            }

            // 7. Preverjanje vidnosti v vrstnem redu slojev
            await this.lokator.izbraneVsebine.click();

            const vrstniRedParcele = this.page
                .locator('#cloud_vrstniRedSlojev .text', { hasText: '\n' +
                        'Parcele (Podporne vsebine,Kataster nepremičnin)' });

            await expect(vrstniRedParcele).toBeVisible({ timeout: 7000 });
            console.log("  ✓ Sloj Parcele se je prikazal v vrstnem redu slojev.");

            console.log("Primerjam posnetek zaslona s 'slikaParcel.png'...");
            await expect(this.page).toHaveScreenshot('slikaParcel.png', {
                animations: 'disabled',
                timeout: 15000,
                maxDiffPixelRatio: 0.05,
                threshold: 0.3,
            });
            console.log("  ✓ Posnetek zaslona se uspešno ujema s slikaParcel.png.");

        } catch (e) {
            throw new Error(`❌ Napaka pri vklopu Parcele ali primerjavi slike: ${e.message}`);
        }
    }

    async pregledGraf4(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.izbraneVsebine.click();

        const vrstniRedParcele = this.page
            .locator('#cloud_vrstniRedSlojev .text', { hasText: '\n' +
                    'Parcele (Podporne vsebine,Kataster nepremičnin)' });

        await expect(vrstniRedParcele).toBeVisible({ timeout: 7000 });
        console.log("  ✓ Sloj Parcele se je prikazal v vrstnem redu slojev.");

        await this.lokator.zapriParceleGumb.click();

        await expect(vrstniRedParcele).not.toBeVisible({ timeout: 7000 });
        console.log("  ✓ Sloj Parcele ni viden med sloji.");


    } catch (e) {
        throw new Error(`❌ Napaka pri brisanju Parcele iz izbranih vsebin: ${e.message}`);
    }

    async pregledGraf5() {
        await this.testUtils.navigirajDoGrafike("302040");

        console.log("Klikam na sloj Stavbe...");

        const spanStavbe = this.page.locator('span.text', { hasText: /^Stavbe$/ });
        const liStavbe = this.page.locator('li.list', { has: spanStavbe });

        await spanStavbe.scrollIntoViewIfNeeded();

        const box = await spanStavbe.boundingBox();
        if (box) {
            // Dvojni klik z nativno miško
            await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { clickCount: 2 });
        }

        // Preverjanje
        await expect(liStavbe).toHaveClass(/active/, { timeout: 7000 });
        console.log("  ✓ Sloj Stavbe je sedaj aktiven (ima razred 'active').");
    }

    async spreminjanjeDrsnika(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa2.waitFor({ state: 'visible' });
        await this.page.waitForTimeout(1000);

        const zacetniPosnetek = await this.lokator.mapa2.screenshot();

        // 2. Klik na POVEČAJ (+)
        await this.lokator.zoomInGumb.click();
        await this.page.waitForTimeout(1000); // počakamo na animacijo in re-render

        // Preverimo, da se je slika SPREMENILA (ni več enaka začetni)
        const zoomInPosnetek = await this.lokator.mapa2.screenshot();
        expect(zoomInPosnetek).not.toEqual(zacetniPosnetek);
        console.log("  ✓ Zemljevid se je po kliku na (+) uspešno povečal.");

        // 3. Klik na POMANJŠAJ (-)
        await this.lokator.zoomOutGumb.click();
        await this.page.waitForTimeout(1000);

        const zoomOutPosnetek = await this.lokator.mapa2.screenshot();
        expect(zoomOutPosnetek).not.toEqual(zoomInPosnetek);
        console.log("  ✓ Zemljevid se je po kliku na (-) uspešno pomanjšal nazaj.");
    }

    async spreminjanjeMerila(){
        await this.testUtils.navigirajDoGrafike("302040");

        const zacetniPosnetek = await this.lokator.mapa2.screenshot();

        if (await this.lokator.drsnikParent.isVisible()) {
            console.log("Klikam neposredno na drsnik na višino ~42px...");

            const parentBox = await this.lokator.drsnikParent.boundingBox();

            if (parentBox) {
                await this.lokator.drsnikParent.click({
                    position: {
                        x: parentBox.width / 2,
                        y: 41.99
                    }
                });
                console.log("  ✓ Uspešen klik na drsnik.");

                const koncniPosnetek = await this.lokator.mapa2.screenshot();
                expect(koncniPosnetek).not.toEqual(zacetniPosnetek);
            }
        } else {
            console.warn("⚠️ Drsnik ni vidne narave ali ni bil najden.");
        }
    }

    async spreminjanjeMerilaZMisko(){
        await this.testUtils.navigirajDoGrafike("302040");

        const zacetniPosnetek = await this.lokator.mapa2.screenshot();

        await this.page.mouse.wheel(0, 300);  // Zoom OUT

        const koncniPosnetek = await this.lokator.mapa2.screenshot();

        expect(koncniPosnetek).not.toEqual(zacetniPosnetek);
    }

    async spreminjanjeMerilaZSeznamom(){
        await this.testUtils.navigirajDoGrafike("302040");

        const zacetniPosnetek = await this.lokator.mapa2.screenshot();

        await this.lokator.meriloDropdown.click();

        await this.lokator.opcijaMerilo.click();

        const koncniPosnetek = await this.lokator.mapa2.screenshot();

        expect(koncniPosnetek).not.toEqual(zacetniPosnetek);
    }

    async premikSPuscicami(){
        await this.testUtils.navigirajDoGrafike("302040");

        const zacetniPosnetek = await this.lokator.mapa2.screenshot();

        await this.lokator.puscicaGor.click();

        const korak1 = await this.lokator.mapa2.screenshot();

        expect(korak1).not.toEqual(zacetniPosnetek);

        await this.lokator.puscicaDol.click();

        const korak2 = await this.lokator.mapa2.screenshot();

        expect(korak2).not.toEqual(zacetniPosnetek);

        await this.lokator.puscicaLevo.click();

        const korak3 = await this.lokator.mapa2.screenshot();

        expect(korak3).not.toEqual(zacetniPosnetek);

        await this.lokator.puscicaDesno.click();

        const korak4 = await this.lokator.mapa2.screenshot();

        expect(korak4).not.toEqual(zacetniPosnetek);
    }

    async premikSTipkami(){
        await this.testUtils.navigirajDoGrafike("302040");

        const zacetniPosnetek = await this.lokator.mapa2.screenshot();

        await this.page.keyboard.press('ArrowUp');

        const korak1 = await this.lokator.mapa2.screenshot();

        expect(korak1).not.toEqual(zacetniPosnetek);

        await this.page.keyboard.press('ArrowDown');

        const korak2 = await this.lokator.mapa2.screenshot();

        expect(korak2).not.toEqual(zacetniPosnetek);

        await this.page.keyboard.press('ArrowLeft');

        const korak3 = await this.lokator.mapa2.screenshot();

        expect(korak3).not.toEqual(zacetniPosnetek);

        await this.page.keyboard.press('ArrowRight');

        const korak4 = await this.lokator.mapa2.screenshot();

        expect(korak4).not.toEqual(zacetniPosnetek);
    }

    async privzetiPogled(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.privzetiPogled.click();

        await expect(this.page).toHaveScreenshot('privzetiPogled.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async odpiranjeMiniMapa(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.miniMap.click();

        await expect(this.page).toHaveScreenshot('miniMap.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async metapodatkovniOpis(){

    }

    async oznakeLegende(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.AParcele.click();

        await expect(this.page).toHaveScreenshot('parceleLegenda.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async oknoLegendeF() {
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike('302040');

        await this.testUtils.odpiranjeLegende('Stavbe');
    }

    async premikanjeLegende() {
        await this.oknoLegendeF();

        await this.testUtils.premakniOkno(this.lokator.oknoLegende,150, 100);
    }

    async povecanjeLegende(){
        await this.oknoLegendeF();

        await this.testUtils.povecajOkno(this.lokator.oknoLegende, 200, 200);
    }

    async drugaLegenda(){
        await this.oknoLegendeF();

        await this.testUtils.odpiranjeLegende('Objekti in zunanja ureditev objekta');
    }

    async zapiranjeLegendeF(){
        await this.oknoLegendeF();

        await this.testUtils.zapiranjeLegende();
    }


    async premikSkoziCas(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.checkboxParcele.scrollIntoViewIfNeeded();

        await this.lokator.checkboxParcele.click({ force: true });

        await this.page.waitForTimeout(1000);

        const zacetniPosnetek = await this.lokator.mapa2.screenshot();

        await this.lokator.checkboxArhivParcel.scrollIntoViewIfNeeded();

        await this.lokator.checkboxArhivParcel.click({ force: true });

        const progaBox = await this.lokator.progaDrsnika.boundingBox();
        const handleBox = await this.lokator.drsnikParceleArhiv.boundingBox();

        if (!progaBox || !handleBox) {
            throw new Error("❌ Drsnik zgodovine nima določenih dimenzij (boundingBox).");
        }

        await this.page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
        await this.page.mouse.down();

        await this.page.mouse.move(progaBox.x + progaBox.width - 5, handleBox.y + handleBox.height / 2, { steps: 15 });
        await this.page.mouse.up();

        await this.page.waitForTimeout(500);

        const koncniPosnetek = await this.lokator.mapa2.screenshot();

        expect(koncniPosnetek).not.toEqual(zacetniPosnetek);
    }


    async premikPogleda(){
        await this.testUtils.navigirajDoGrafike("302040");

        const mapa = this.lokator.mapa2;

        await mapa.hover();

        await this.page.mouse.wheel(0, -600);

        await this.page.waitForLoadState('domcontentloaded');

        await this.lokator.prejsniPogled.click();


        const zacetniPosnetek = await this.lokator.mapa2.screenshot();

        await this.lokator.naslednjiPogled.click();

        await this.page.waitForLoadState('domcontentloaded');


        const koncniPosnetek = await this.lokator.mapa2.screenshot();

        expect(koncniPosnetek).not.toEqual(zacetniPosnetek);
    }

    async prikazSeznama(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.merjeje.click();

        await this.page.waitForLoadState('domcontentloaded');

        await expect(this.lokator.merjenjeDropdown).toBeVisible();
    }

    async dodajanjeParcel(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.izbiranje.click();

        await expect(this.lokator.izbiranjeDropdown).toBeVisible();

        await this.lokator.dodajParcelo.click();

        await expect(this.page.locator('text=Izbran ni noben sloj. Izberite sloj iz legende.')).toBeVisible();
    }

    async objektiSloj() {
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.objektiUreditvePovrsin.click( { force: true} );

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.lokator.izbiranjeDropdown.click({ force: true });

        const jeKlikabilen = await this.lokator.dodajParcelo.isVisible() && await this.lokator.dodajParcelo.isEnabled();

        if (jeKlikabilen) {
            await this.lokator.dodajParcelo.click({ force: true });
        } else {
            console.log("Gumb ni viden ali pa je onemogočen.");
        }
    }

    async izbiraParcele(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.objektiUreditvePovrsin.click( { force: true} );

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.lokator.dodajParcelo.click({ force: true });

        await this.page.locator('canvas.ol-unselectable').first().click({
            position: { x: 729, y: 505 }
        });

        await expect(this.page).toHaveScreenshot('parcela.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });

        const parcelaElement = this.page.locator('div.body li[id="PARCEL-676-*338"]');
        await expect(parcelaElement).toBeVisible();

        await this.page.locator('canvas.ol-unselectable').first().click({
            position: { x: 729, y: 505 }
        });

        await expect(this.page).toHaveScreenshot('parcelaPo.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async pogojDodajanjaParcele(){
        await this.lokator.IDUpravnegaAkta.waitFor({state: 'visible', timeout: 10000});
        await this.lokator.IDUpravnegaAkta.click({force: true});
        await this.lokator.IDUpravnegaAkta.clear();
        await this.lokator.IDUpravnegaAkta.fill("302203");

        await this.lokator.gumbIsci.click({force: true})

        await this.page.waitForTimeout(500);

        const pravaVrstica = this.page.locator('tr[resultrow="true"]')
            .filter({hasText: "302203"});

        await pravaVrstica.waitFor({state: 'visible', timeout: 10000});
        await pravaVrstica.click({force: true});

        await this.page.waitForLoadState('domcontentloaded');

        await this.lokator.osnovniPodatki.click();

        await this.lokator.urediGumb.click();

        await this.OdpiranjeGrafike();

        await expect(this.lokator.izbiranjeParcelNiMogoce).toBeVisible();
    }


    async iskanjePoParcelniStevilkiIzbraneParcele(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.objektiUreditvePovrsin.click( { force: true} );

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.lokator.urediIzbraneParcelegumb.click({ force: true });

        await this.lokator.iskalnikUrejanjeParcel.click();

        await this.lokator.iskalnikUrejanjeParcel.fill('676 12/2');

        const parcelaElement = this.page.locator('div.body li[id="PARCEL-676-12/2"]');
        await expect(parcelaElement).toBeVisible();
    }

    async urediIzbraneParcele(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.objektiUreditvePovrsin.click( { force: true} );

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.lokator.urediIzbraneParcelegumb.waitFor({ state: 'visible' });

        await this.lokator.urediIzbraneParcelegumb.click();

        await expect(this.page.locator('div.header div.title').filter({ hasText: 'Urejanje parcel' })).toBeVisible();
    }

    async gumbTarca(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.objektiUreditvePovrsin.click( { force: true} );

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.lokator.tarcaGumb.waitFor({ state: 'visible' });

        await this.lokator.tarcaGumb.click();

        await expect(this.page).toHaveScreenshot('tarca.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async naborParcel(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.objektiUreditvePovrsin.click( { force: true} );

        await expect(this.page.locator('div.header div.title').filter({ hasText: 'Nabor parcel' })).toBeVisible();
    }

    async iskanjeNaborParcel(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.objektiUreditvePovrsin.click( { force: true} );

        await this.lokator.iskalnik2.waitFor({ state: 'visible' });

        await this.lokator.iskalnik2.click();

        await this.lokator.iskalnik2.fill('676 12/2');

        const parcelaElement = this.page.locator('div.body li').filter({ hasText: '676 12/2' });
        await expect(parcelaElement).toBeVisible();
    }

    async gumbTarcaNaborParcel(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.objektiUreditvePovrsin.click( { force: true} );

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.lokator.tarcaGumb.waitFor({ state: 'visible' });

        await this.lokator.tarcaGumb.click();

        await expect(this.page).toHaveScreenshot('tarca.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async varenKlik(lokator, maxPoskusov = 3) {
        for (let i = 0; i < maxPoskusov; i++) {
            try {
                await lokator.waitFor({ state: 'visible', timeout: 5000 });
                await lokator.click({ force: true });
                return;
            } catch (error) {
                if (i === maxPoskusov - 1) throw error;
                console.log(`Poskus ${i + 1} ni uspel, ponavljam klik...`);
                await this.page.waitForTimeout(1000);
            }
        }
    }

    async obvestiloPremakniCentroid(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 3000 });

        await this.lokator.stavbaSloj.click( { force: true } );

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        await this.lokator.premakniCentroidGumb.click({ force: true });

        await expect(this.lokator.opozoriloPremikCentroida).toBeVisible();
    }

    async omogocenPremakniCentroid(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 3000 });

        await this.varenKlik(this.lokator.objektiUreditvePovrsin);

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        const jeKlikabilen = await this.lokator.premakniCentroidGumb.isVisible() && await this.lokator.premakniCentroidGumb.isEnabled();

        if (jeKlikabilen) {
            await this.lokator.premakniCentroidGumb.click();
        } else {
            console.log("Gumb ni viden ali pa je onemogočen.");
        }
    }

    async premikCentroida(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 3000 });

        await this.varenKlik(this.lokator.objektiUreditvePovrsin);

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        await this.varenKlik(this.lokator.premakniCentroidGumb);

        await this.page.locator('canvas.ol-unselectable').first().click({
            position: { x: 729, y: 505 }
        });

        await expect(this.lokator.opozoriloPremikCentroida2).toBeVisible();
    }

    async obvestiloObDodajanjuStavbe(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.varenKlik(this.lokator.stavbaSloj);

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 3000 });

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        await this.varenKlik(this.lokator.dodajStavboGumb);

        await expect(this.lokator.opozoriloNiIzbranegaSloja).toBeVisible();
    }

    async omogocenDodajStavbo(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 3000 });

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        const jeKlikabilen = await this.lokator.dodajStavboGumb.isVisible() && await this.lokator.dodajStavboGumb.isEnabled();

        if (jeKlikabilen) {
            await this.lokator.dodajStavboGumb.click();
        } else {
            console.log("Gumb ni viden ali pa je onemogočen.");
        }
    }

    async dodajStavbo(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 3000 });

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        await this.varenKlik(this.lokator.dodajStavboGumb);
    }

    async iskanjeStevilkeStavbe(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });
        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await this.lokator.iskalnik2.fill('676-1804');

        const stavbaElement = this.page.locator('div.section.editParcels li').filter({ hasText: '676-1804' });

        await expect(stavbaElement).toBeVisible();
    }

    async izbiraObjektaVrsteGradnje(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        const buildingElement = this.page.locator('div.section.editParcels li').filter({ hasText: '676-1026' });
        const deliStavbGumb = buildingElement.locator('i.deli-stavbe');
        await this.varenKlik(deliStavbGumb);

        const deliStavbMenu = buildingElement.locator('.deli-stavbe-list');
        await expect(deliStavbMenu).toBeVisible();

        const checkboxDva = this.page.locator('div.deli-stavbe-list div.list:has(span[data-stdelastavbe="2"]) i.checkbox');
        await checkboxDva.waitFor({ state: 'visible' });
        const classDva = await checkboxDva.getAttribute('class');
        if (classDva && classDva.includes('fa-check-square')) {
            await checkboxDva.click({ force: true });
            await this.page.waitForTimeout(300);
        }
        await checkboxDva.click({ force: true });

        const dropdown = buildingElement.locator('select');
        await dropdown.selectOption({ label: 'Objekt 2' });

        const checkboxRekonstrukcija = buildingElement.locator('span[data-vrstagradnjeid="3"]').locator('xpath=preceding-sibling::i[contains(@class, "checkbox")]');

        await checkboxRekonstrukcija.waitFor({ state: 'visible' });
        const classRekonstrukcija = await checkboxRekonstrukcija.getAttribute('class');
        if (classRekonstrukcija && classRekonstrukcija.includes('fa-check-square')) {
            await checkboxRekonstrukcija.click({ force: true });
            await this.page.waitForTimeout(300);
        }
        await checkboxRekonstrukcija.click({ force: true });

        await expect(checkboxRekonstrukcija).toHaveClass(/fa-check-square/);

        await this.varenKlik(this.lokator.shraniIzborParcele);
    }

    async urejanjeStavb2(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 3000 });
        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible' });
        await this.lokator.izbiranjeDropdown.click({ force: true });


        //await this.varenKlik(this.lokator.dodajStavboGumb);

        //await this.page.mouse.click(1083, 205);

        await expect(this.lokator.urediIzbraneStavbe, "KRITIČNA NAPAKA: Gumb za urejanje izbranih stavb ni viden!").toBeVisible({ timeout: 5000 });
        await expect(this.lokator.urediIzbraneStavbe, "KRITIČNA NAPAKA: Gumb za urejanje izbranih stavb je onemogočen!").toBeEnabled();

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await expect(this.lokator.urejanjeStavb).toBeVisible({ timeout: 10000 });
    }

    async tarcaIzbraneStavbe(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });
        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await this.varenKlik(this.lokator.tarcaUrejanjeStavb1026);

        await expect(this.page).toHaveScreenshot('tarca4.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async podmeniNaborStavb(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await expect(this.lokator.naborStavbMenu).toBeVisible();
    }

    async iskanjeStevilkeStavbeNaborStavb(){
        await this.utils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await expect(this.lokator.naborStavbMenu).toBeVisible();

        await this.lokator.iskalnik2.fill('676-1804');

        const stavbaElement = this.page.locator('div.section.naborParcels li').filter({ hasText: '676-1804' });

        await expect(stavbaElement).toBeVisible();
    }

    async tarcaNaborStavb(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await expect(this.lokator.naborStavbMenu).toBeVisible();

        const buildingElement = this.page.locator('div.section.naborParcels li').filter({ hasText: '676-1804' });
        const crosshairsGumb = buildingElement.locator('i.fas.fa-crosshairs');

        await crosshairsGumb.click();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.page.waitForTimeout(1000);

        await expect(this.page).toHaveScreenshot('tarca5.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async niIzbranegaSlojaUrejanjeParcel(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.stavbaSloj.click( { force: true} );

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await expect(this.lokator.opozoriloNiIzbranegaSlojaIzberite).toBeVisible();
    }

    async vidnostUrejanjaParcel(){
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.objektiUreditvePovrsin.click();

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });

        await this.varenKlik(this.lokator.izbiranjeDropdown);

        await this.varenKlik(this.lokator.urediIzbraneParcelegumb);

        await expect(this.lokator.urejanjeParcelMenu).toBeVisible();
    }

    async izborInTarcaParcele(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.objektiUreditvePovrsin.click();

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.lokator.urediIzbraneParcelegumb.waitFor({ state: 'visible', timeout: 10000 });
        await this.varenKlik(this.lokator.urediIzbraneParcelegumb);

        const parcelElement = this.page.locator('div.section.editParcels li').filter({ hasText: '676 12/2' });

        await parcelElement.waitFor({ state: 'visible', timeout: 10000 });
        await this.varenKlik(parcelElement);

        await expect(this.page).toHaveScreenshot('klikParcela2.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });

        await parcelElement.locator('i.fas.fa-crosshairs').click();

        await expect(this.page).toHaveScreenshot('tarca6.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }


    async pobrisiIzborParcel(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.objektiUreditvePovrsin.click();

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.lokator.urediIzbraneParcelegumb.waitFor({ state: 'visible', timeout: 10000 });
        await this.varenKlik(this.lokator.urediIzbraneParcelegumb);

        const parcelElement = this.page.locator('div.section.editParcels li').filter({ hasText: '676 12/2' });

        await parcelElement.waitFor({ state: 'visible', timeout: 10000 });
        await this.varenKlik(parcelElement);

        await this.lokator.pobrisiParcelo.click();

        const stavbaElement = this.page.locator('div.body').first().locator('li').filter({ hasText: '676 12/2' });

        await expect(stavbaElement).not.toBeVisible();
    }

    async prikazUrejanjaStavb(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await expect(this.lokator.urejanjeStavb).toBeVisible();
    }

    async izborInTarcaUrejanjeStavb(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        const parcelElement = this.page.locator('div.section.editParcels li').filter({ hasText: '676-1026' });

        await parcelElement.waitFor({ state: 'visible', timeout: 10000 });

        await parcelElement.locator('i.fas.fa-crosshairs').click();

        await expect(this.page).toHaveScreenshot('tarca7.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async shraniIzbraneParcele(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.objektiUreditvePovrsin.click();

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.lokator.urediIzbraneParcelegumb.waitFor({ state: 'visible', timeout: 10000 });
        await this.varenKlik(this.lokator.urediIzbraneParcelegumb);

        await this.lokator.shraniIzborParcele.click();

        await expect(this.lokator.naborStavbMenu).toBeVisible();
    }

    async pobrisiIzborIzbranihParcele(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.objektiUreditvePovrsin.click();

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.lokator.urediIzbraneParcelegumb.waitFor({ state: 'visible', timeout: 10000 });
        await this.varenKlik(this.lokator.urediIzbraneParcelegumb);

        await this.lokator.pobrisiIzborParcele.click();

        await expect(this.page.locator('div.section.editParcels li')).toHaveCount(0);
    }

    async prekiniIzbranihParcele(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.objektiUreditvePovrsin.click();

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.lokator.urediIzbraneParcelegumb.waitFor({ state: 'visible', timeout: 10000 });
        await this.varenKlik(this.lokator.urediIzbraneParcelegumb);

        await this.lokator.prekiniParcele.click();

        await expect(this.lokator.naborParcelMenu).toBeVisible();
    }

    async shraniIzbraneStavbe(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await this.lokator.shraniIzborStavbe.click();

        await expect(this.lokator.naborStavbMenu).toBeVisible();
    }

    async pobrisiIzborIzbraneStavbe(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await this.lokator.pobrisiIzborStavbe.click();

        await expect(this.page.locator('div.section.editParcels li')).toHaveCount(0);
    }

    async prekiniStavbe(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await this.lokator.prekiniIzborStavbe.click();

        await expect(this.lokator.naborStavbMenu).toBeVisible();
    }

    async shraniIzborParcel(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.objektiUreditvePovrsin.click();

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.varenKlik(this.lokator.urediIzbraneParcelegumb);

        await this.lokator.shraniIzborParcele.click();

        await expect(this.lokator.naborParcelMenu).toBeVisible();
    }

    async pobrisiIzborParcel(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.objektiUreditvePovrsin.click();

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.varenKlik(this.lokator.urediIzbraneParcelegumb);

        await this.varenKlik(this.lokator.pobrisiIzborParcele);

        await expect(this.page.locator('div.section.editParcels li')).toHaveCount(0);
    }

    async prekiniIzborParcel(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.objektiUreditvePovrsin.click();

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.varenKlik(this.lokator.urediIzbraneParcelegumb);

        await this.varenKlik(this.lokator.prekiniParcele);

        await expect(this.lokator.naborParcelMenu).toBeVisible();
    }

    async pobrisiIzborIzbranihStavb(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.page.waitForTimeout(2000);

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click();

        await this.page.waitForTimeout(2000);

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await this.varenKlik(this.lokator.pobrisiIzborStavbe);

        await expect(this.page.locator('div.section.editParcels li')).toHaveCount(0);
    }

    async shraniIzborIzbranihStavb(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.utils.navigirajDoGrafike("302040");

        await this.utils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await this.varenKlik(this.lokator.shraniIzborStavbe);

        await expect(this.lokator.naborStavbMenu).toBeVisible();
    }

    async prekiniIzbranihStavb(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.izbiranjeDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.izbiranjeDropdown.click({ force: true });

        await this.varenKlik(this.lokator.urediIzbraneStavbe);

        await this.varenKlik(this.lokator.prekiniIzborStavbe);

        await expect(this.lokator.naborStavbMenu).toBeVisible();
    }

    async merjenjeRazdaljeInPovrsine(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.meritveDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.meritveDropdown.click({ force: true });

        await this.lokator.merjenjeRazdaljeGumb.click();

        await this.page.mouse.click(711, 187);

        await this.page.mouse.click(694, 584);

        await this.page.mouse.click(1416, 572);

        await this.page.mouse.click(710, 185);

        await expect(this.page).toHaveScreenshot('meritevRazdalje.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });

        await this.lokator.meritveDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.meritveDropdown.click({ force: true });

        await this.lokator.pobrisiMeritveGumb.click();

        await this.lokator.merjenjePovrsineGumb.click();

        await this.page.mouse.click(711, 187);

        await this.page.mouse.click(694, 584);

        await this.page.mouse.click(1416, 572);

        await this.page.mouse.click(710, 185);

        await expect(this.page).toHaveScreenshot('meritevPovrsine.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async pobrisiMeritve(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.testUtils.navigirajDoGrafike("302040");

        await this.testUtils.izklopiDOF();

        await this.lokator.mapa.waitFor({ state: 'visible', timeout: 15000 });

        await this.lokator.meritveDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.lokator.meritveDropdown.click({ force: true });

        await this.lokator.pobrisiMeritveGumb().click();

        await expect(this.page).toHaveScreenshot('pobrisiMeritve.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async omogocenoPoizvedovanje(){
        await this.testUtils.navigirajDoGrafike('302040');
        await this.lokator.poizvedovanjeDropdown.click();

        await expect(this.lokator.poizvedovanjeVidniSloji).toBeEnabled();
        await expect(this.lokator.poizvedovanjeVsiSloji).toBeEnabled();
        await expect(this.lokator.poizvedovanjeIzbraniSloj).toBeEnabled();
    }

    async izpisObvestilaPoizvedovanje(){
        console.log('potrebno najti lokator za pricakovano napako');
        /*await this.utils.navigirajDoGrafike('302040');
        await this.lokator.stavbaSloj.click();
        await this.lokator.poizvedovanjeDropdown.click();

        await expect(this.lokator); potrebno najti lokator za pricakovano napako


        Ob neizbranem sloju se ob kliku v spustnem seznamu podmenija »Poizvedovanje«
        na »Poizvedovanje po vidnih slojih« izpiše obvestilo o potrebi izbire sloja
        */
    }

    async obvestiloSlojNeomogocaPoizvedovanja(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev(['Občinski podrobni prostorski načrt']);

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeVidniSloji')

        await this.page.waitForTimeout(2000);

        await this.page.mouse.click(821, 271);

        await expect(this.lokator.opozoriloPraznePoizvedbe.first()).toBeVisible();
    }

    async pojavitevOknaPoizvedbePoVidnihSlojih(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev( ['Parcele']);

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeVidniSloji')

        await this.page.mouse.click(1248, 491);

        await expect(this.lokator.oknoPoizvedbe).toBeVisible();
    }

    async drsnikVOknuPoizvedovanjaPoVidnihSlojih(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev(['Parcele', 'Lokacijski faktor']);

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeVidniSloji');

        await this.page.mouse.click(817, 581);

        await this.lokator.oknoPoizvedbe2.hover();

        await this.page.mouse.wheel(0, 400);
        await this.page.waitForTimeout(300);

        await this.lokator.lokacijskiFaktor.scrollIntoViewIfNeeded();
        await expect(this.lokator.lokacijskiFaktor).toBeVisible();
    }

    async povecavaOknaZaPoizvedovanjePoVidnihSlojih(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev(['Parcele', 'Lokacijski faktor']);

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeVidniSloji');

        await this.page.mouse.click(817, 581);

        await this.testUtils.povecajOkno(this.lokator.oknoPoizvedbe, 200, 200);
    }

    async premikOknaZaPoizvedovanjePoVidnihSlojih(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev(['Parcele', 'Lokacijski faktor']);

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeVidniSloji');

        await this.page.mouse.click(817, 581);

        await this.testUtils.premakniOkno(this.lokator.oknoPoizvedbe, 150, 100);
    }

    async zapriOknoZaPoizvedovanjePoVidnihSlojih(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev(['Parcele', 'Lokacijski faktor']);

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeVidniSloji');

        await this.page.mouse.click(817, 581);

        await this.testUtils.zapriOkno(this.lokator.oknoPoizvedbe);
    }

    async pojavitevOknaPoizvedovanjaPoVsehSlojih(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev(['Parcele']);

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeVsiSloji');

        await this.page.mouse.click(817, 581);

        await expect(this.lokator.naslovOknaPoizvedbe).toBeVisible();
    }

    async drsnikVOknuPoizvedovanjaPoVsehSlojih(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev(['Parcele', 'Lokacijski faktor']);

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeVsiSloji');

        await this.page.mouse.click(817, 581);

        await expect(this.lokator.oknoModalnegaOkna).toBeVisible({ timeout: 10000 });

        await this.lokator.oknoModalnegaOkna.hover();
        await this.page.mouse.wheel(0, 400);
        await this.page.waitForTimeout(300);

        await this.lokator.kulturnaDediscina.scrollIntoViewIfNeeded();
        await expect(this.lokator.kulturnaDediscina).toBeVisible();
    }

    async dodatneInformacijePoizvedovanjaPoVsehSlojih(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev(['Parcele', 'Lokacijski faktor']);

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeVsiSloji');

        await this.page.mouse.click(817, 581);

        await expect(this.lokator.oknoModalnegaOkna).toBeVisible({ timeout: 10000 });

        await this.testUtils.odpiranjeDodatnihInformacij();
    }

    async zapriOknoZaPoizvedovanjePoVsehSlojih(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev(['Parcele']);

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeVsiSloji');

        await this.page.mouse.click(817, 581);

        await this.page.waitForTimeout(1000);

        await this.testUtils.zapriOkno(this.lokator.oknoModalnegaOkna);

        await this.page.waitForTimeout(1000);
    }

    async obvestiloOPotrebniIzbiriSloja(){
        console.log('potrebno najti lokator za pricakovano napako');
        /*await this.utils.navigirajDoGrafike('302040');
        await this.lokator.stavbaSloj.click();
        await this.lokator.poizvedovanjeDropdown.click();

        await expect(this.lokator); potrebno najti lokator za pricakovano napako


        Ob neizbranem sloju se ob kliku v spustnem seznamu podmenija »Poizvedovanje«
        na »Poizvedovanje po vidnih slojih« izpiše obvestilo o potrebi izbire sloja
        */
    }

    async obvestiloSlojNeOmogocaPoizvedbe(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.lokator.obcinskiProstorskiNacrt.click({ force: true });

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeIzbraniSloj');

        await this.page.mouse.click(817, 581);

        await expect(this.lokator.opozoriloNapacnegaSloja).toBeVisible({ timeout: 10000 });
    }

    async pojavitevOknaPoizvedovanjaPoIzbranemSloju(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.lokator.parceleSloj.click();

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeIzbraniSloj');

        await this.page.mouse.click(817, 581);

        await expect(this.lokator.oknoPoizvedbe).toBeVisible(({ timeout: 10000 }));
    }

    async drsnikVOknuPoizvedovanjaPoIzbranemSloju(){
        await this.testUtils.pripravaPoizvedovanja();

        await this.testUtils.izbiraSlojev(['Parcele']);

        await this.lokator.parceleSloj.click();

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeIzbraniSloj');

        await this.page.mouse.click(867, 665);

        await this.lokator.oknoPoizvedbe2.hover();

        await this.page.mouse.wheel(0, 400);
        await this.page.waitForTimeout(300);

        await this.lokator.zadnjiElementVsebnika.scrollIntoViewIfNeeded();
        await expect(this.lokator.zadnjiElementVsebnika).toBeVisible();
    }

    async povecavaOknaZaPoizvedovanjePoIzbranemSloju(){
        await this.testUtils.pripravaPoizvedovanja();
        await this.testUtils.izbiraSlojev(['Parcele', 'Lokacijski faktor']);

        await this.lokator.izbraneVsebine.click();
        await this.lokator.parceleSloj.locator('span.text').first().click();

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeIzbraniSloj');
        await this.page.mouse.click(817, 581);
        await this.testUtils.povecajOkno(this.lokator.oknoPoizvedbe, 200, 200);
    }

    async premikOknaZaPoizvedovanjePoIzbranemSloju(){
        await this.testUtils.pripravaPoizvedovanja();
        await this.testUtils.izbiraSlojev(['Parcele', 'Lokacijski faktor']);

        await this.lokator.izbraneVsebine.click();
        await this.lokator.parceleSloj.locator('span.text').first().click();

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeIzbraniSloj');
        await this.page.mouse.click(817, 581);
        await this.testUtils.premakniOkno(this.lokator.oknoPoizvedbe, 150, 100);
    }

    async zapriOknoZaPoizvedovanjePoIzbranemSloju(){
        await this.testUtils.pripravaPoizvedovanja();
        await this.testUtils.izbiraSlojev(['Parcele', 'Lokacijski faktor']);

        await this.lokator.izbraneVsebine.click();
        await this.lokator.parceleSloj.locator('span.text').first().click();

        await this.testUtils.vklopPoizvedovanja('poizvedovanjeIzbraniSloj');
        await this.page.mouse.click(817, 581);
        await expect(this.lokator.oknoPoizvedbe).toBeVisible({ timeout: 10000 });
        await this.testUtils.zapriOkno(this.lokator.oknoPoizvedbe);
    }

    async oznaciObjekt(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });

        await this.testUtils.navigirajDoGrafike('302040');
        await this.testUtils.izklopiDOF();

        await this.lokator.oznaciObjektDropdown.click();
        await this.lokator.oznaciObjektItem.click();

        await this.page.waitForTimeout(800);

        await this.page.mouse.click(1238, 294);

        await this.page.waitForTimeout(1000);

        await expect(this.page).toHaveScreenshot('oznaciObjekt.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async nastavitveObmocjaF(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });

        await this.testUtils.navigirajDoGrafike('302040');
        await this.testUtils.izklopiDOF();

        await this.lokator.oznaciObjektDropdown.click();
        await this.lokator.oznaciObjektItem.click();

        await this.page.waitForTimeout(800);

        await this.lokator.oznaciObjektDropdown.click();
        await this.lokator.nastavitveObmocja.click();

        await this.testUtils.nastavitevObmocja();
        await this.page.waitForTimeout(2000);

        await this.lokator.oznaciObjektDropdown.click();
        await this.lokator.oznaciObjektItem.click();

        await this.page.mouse.click(1238, 294);

        await this.page.waitForTimeout(1000);

        await expect(this.page).toHaveScreenshot('nastavitveObmocja.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }

    async pobrisiObmocjeF(){
        await this.page.setViewportSize({ width: 1920, height: 1080 });

        await this.testUtils.navigirajDoGrafike('302040');
        await this.testUtils.izklopiDOF();

        await this.lokator.oznaciObjektDropdown.click();
        await this.lokator.oznaciObjektItem.click();

        await this.page.waitForTimeout(800);

        await this.lokator.oznaciObjektDropdown.click();
        await this.lokator.nastavitveObmocja.click();

        await this.testUtils.nastavitevObmocja();
        await this.page.waitForTimeout(2000);

        await this.lokator.oznaciObjektDropdown.click();
        await this.lokator.oznaciObjektItem.click();

        await this.page.mouse.click(1238, 294);

        await this.page.waitForTimeout(1000);

        await expect(this.page).toHaveScreenshot('nastavitveObmocja.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });

        await this.lokator.oznaciObjektDropdown.click();
        await this.lokator.pobrisiObmocje.waitFor({ state: 'visible', timeout: 5000 });
        await this.lokator.pobrisiObmocje.click();

        await this.page.waitForTimeout(800);

        await expect(this.page).toHaveScreenshot('pobrisiObmocje.png', {
            animations: 'disabled',
            timeout: 15000,
            maxDiffPixelRatio: 0.05,
            threshold: 0.3,
        });
    }











}

