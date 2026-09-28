import { test, expect } from '@playwright/test';
import { SeznamPage } from '../pages/SeznamPage.js';
import { preveriAktVBazi } from '../utils/dbUtils.js';
import fs from 'fs';

async function zapisiRezultat(id, skupina, funkcionalnost, uspeh, napaka = "", screenshotPot = "", trajanje = "0") {
    try {
        const status = uspeh ? "USPEL" : "NAPAKA";
        const cistaNapaka = String(napaka || "").replace(/[\u001b\u009b][[()#;?]*(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d]*)*)?\u0007/g, '');
        const formatiranaNapaka = cistaNapaka.replace(/;/g, ' ').replace(/\n/g, '<br>');
        const varnaPot = String(screenshotPot || "").replace(/;/g, ' ');
        const vrstica = `${id};${skupina};${funkcionalnost};${status};${formatiranaNapaka};${varnaPot};${trajanje}\n`;
        fs.appendFileSync('rezultati.txt', vrstica, 'utf-8');
    } catch (fsErr) {
        console.error("Napaka pri pisanju v datoteko:", fsErr);
    }
}

//test.describe.configure({ mode: 'parallel' });

test.describe('PIS-UA Testiranje', () => {
    let seznam;

    test.beforeEach(async ({ page, context }) => {
        await page.addInitScript(() => {
            if (typeof window.Map !== 'function') {
                window.Map = Map;
            }
        });

        seznam = new SeznamPage(page);
        seznam.napake = [];

        page.browserErrors = [];

        page.on('console', msg => {
            if(msg.type() === 'error') {
                page.browserErrors.push(`[Napaka iz konzole brskalnika]: ${msg.text()}`);
            }
        });

        page.on('pageerror', exception => {
           page.browserErrors.push(`[Napaka na strani]: ${exception.message}`);
        });


        await page.goto('https://pis.intra.igea.si/pis-ua/');
    });

    test.afterEach(async ({ page }, testInfo) => {
        try {
            const dobiPodatek = (tip) => testInfo.annotations.find(a => a.type === tip)?.description;
            const id = dobiPodatek('id') || "??";
            const skupina = dobiPodatek('skupina') || "Splošno";
            const funkcionalnost = dobiPodatek('funkcionalnost') || testInfo.title;

            const uspeh = testInfo.status === 'passed';
            const trajanjeSekund = (testInfo.duration / 1000).toFixed(1);

            let opisNapake = "/";

            const ocistiTekstNapake = (tekst) => {
                if (!tekst) return "";

                let cist = tekst.replace(/\x1B\[[0-9;]*[mK]/g, '');

                if (cist.includes('Call log:')) cist = cist.split('Call log:')[0];
                if (cist.includes('=====')) cist = cist.split('=====')[0];
                if (cist.includes('aka getByRole')) cist = cist.split('aka getByRole')[0];
                if (cist.includes('Actual value:')) cist = cist.split('Actual value:')[0];

                cist = cist.replace(/^\s*\.\.\.\s*/, '');

                cist = cist.replace(/\s*\d+\)\s*$/, '');

                return cist.trim();
            };

            let konzolneNapake = "";
            if(page && page.browserErrors && page.browserErrors.length > 0){
                konzolneNapake = page.browserErrors.map(e => ocistiTekstNapake(e)).join(' <br> ');
            }

            if (seznam && seznam.napake && seznam.napake.length > 0) {
                opisNapake = seznam.napake
                    .map(n => ocistiTekstNapake(n))
                    .filter(n => n.length > 0)
                    .join(' <br> ');

            } else if (testInfo.error) {
                opisNapake = ocistiTekstNapake(testInfo.error.message);
            }

            if (konzolneNapake) {
                if (opisNapake === "/") {
                    opisNapake = `<b>Konzolna napaka:</b>> ${konzolneNapake}`;
                } else {
                    opisNapake += `<b>Konzolna napaka:</b> ${konzolneNapake}`;
                }
            }

            if (opisNapake.includes('\n')) {
                opisNapake = opisNapake.split('\n')
                    .map(vrstica => vrstica.trim())
                    .filter(vrstica => vrstica.length > 0 && !vrstica.startsWith('–') && !vrstica.startsWith('at '))
                    .map(vrstica => ocistiTekstNapake(vrstica))
                    .join(' <br> ');
            }

            if (testInfo.error) {
                testInfo.error.message = ocistiTekstNapake(opisNapake).replace(/<br>/g, '\n');

                if (testInfo.error.stack) {
                    testInfo.error.stack = testInfo.error.message;
                }
            }

            let screenshotPot = "";

            if (!uspeh || konzolneNapake) {
                const varnoId = id.replace(/[^a-zA-Z0-9]/g, '_');
                const ociscenNaziv = funkcionalnost.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50);
                const imeSlike = `${varnoId}_${ociscenNaziv}_error.png`;
                const mapaZaSlike = 'screens';
                screenshotPot = `${mapaZaSlike}/${imeSlike}`;

                if (!fs.existsSync(mapaZaSlike)) fs.mkdirSync(mapaZaSlike, { recursive: true });

                try {
                    if (!page.isClosed()) await page.screenshot({ path: screenshotPot, fullPage: true });
                } catch (screenErr) {
                    console.error("Ni bilo mogoče narediti screenshot-a:", screenErr.message);
                }
            }

            const koncniUspeh = uspeh;
            //const koncniUspeh = uspeh && !konzolneNapake;

            await zapisiRezultat(id, skupina, funkcionalnost, koncniUspeh, opisNapake, screenshotPot, trajanjeSekund);

            console.log(`Zapisano v poročilo: ${id} | ${koncniUspeh ? '✅ USPEŠEN' : '❌ NI USPEL (' + opisNapake.substring(0, 40) + '...)'}`);

        } catch (err) {
            console.error("Napaka v afterEach logiki:", err);
        } finally {
            if (page && !page.isClosed()) await page.context().close();
        }
    });

/*      test.describe('Pregled podatkov o obstoječih upravnih aktih' , () => {
            test.describe('Razvrščanje upravnih aktov' , () => {
                test('1.2.1: Sortiranje po ID_UA', async ({ page }) => {
                    test.info().annotations.push({ type: 'id', description: '1.2.1' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Razvrščanje po ID_UA'});
                    await page.waitForTimeout(1500);
                    await seznam.sortID_UA();
                });

                test('1.2.2: Razvrsti po Upravni organ', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.2' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Razvrščanje po Upravnem organu'});
                    await seznam.sortUpravniOrgan();
                });

                test('1.2.3: Razvrsti po Št. zadeve', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.3' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Razvrščanje po številki zadeve'});
                    await seznam.sortStZadeve();
                });

                test('1.2.4: Razvrsti po Postopek', async ({ page }) => {
                    test.info().annotations.push({ type: 'id', description: '1.2.4' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Razvrščanje po postopku'});
                    await page.waitForTimeout(1500);
                    await seznam.sortPostopek();
                });

                test('1.2.5: Razvrsti po Naziv', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.5' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Razvrščanje po nazivu'});
                    await seznam.sortNaziv();
                });

                test('1.2.6: Razvrsti po Datum izd.', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.6' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Razvrščanje po datumu izdaje'});
                    await seznam.sortDatumIzd();
                 });

                test('1.2.7: Sortiranje po Dat. prav', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.7' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Razvrščanje po datumu pravnomočnosti'});
                    await seznam.sortDatPrav();
                });
            });


            test('1.2.8: Odpiranje grafike', async () => {
                test.info().annotations.push({ type: 'id', description: '1.2.8' });
                test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Grafični pregledovalnik UA'});
                await seznam.OdpiranjeGrafike();
            });

            test.describe('Iskanje po' , () => {
                test('1.2.9: Iskanje upravnega akta', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.9' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po ID upravnega akta'});
                    await seznam.IskanjeAktaPoID(301905);
                });

                test('1.2.10: Vpis Crk', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.10' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po ID upravnega akta'});
                    await seznam.VpisCrk();
                });

                test('1.2.11: Vnos Št Zadeve', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.11' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po številki zadeve'});
                    await seznam.VnosStZadeve2();
                });

                test('1.2.12: Vnos Št. Zadeve - fullsearch', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.12' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po številki zadeve'});
                    await seznam.VnosStZadeve2();
                });

                test('1.2.13: Vrsta Upravnega Akta', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.13' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po vrsti upravnega akta'});
                    await seznam.VrstaUpravnegaAkta();
                });

                test('1.2.14: Vrsta Upravnega Organa', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.14' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po vrsti upravnega organa'});
                    await seznam.VrstaUpravnegaOrgana();
                });

                test('1.2.15: Vnos Leta Izdaje', async () => {
                    test.setTimeout(90000);
                    test.info().annotations.push({ type: 'id', description: '1.2.15' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po letu izdaje'});
                    await seznam.IskanjePoLetuIzdaje();
                });

                test('1.2.16: Napredno Iskanje', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.16' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Delovanje gumba »Napredno iskanje«'});
                    await seznam.NaprednoIskanje();
                });

                test('1.2.17: Iskanje Po Viru', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.17' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po viru (izbira možnosti iz spustnega seznama)'});
                    await seznam.iskanjePoViru();
                });

                test('1.2.18: Iskanje Po Katastrski Obcini', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.18' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po katastrski občini'});
                    await seznam.iskanjePoKatastrskiObcini();
                });

                test('1.2.19: Iskanje Po Parcelni Stevilki', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.19' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po parcelni številki'});
                    await seznam.iskanjePoParcelniStevilki();
                });

                test('1.2.20: Iskanje Po Letu Prijave', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.20' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po letu prijave pričetka gradnje'});
                    await seznam.iskanjePoLetuPrijave();
                });

                test('1.2.21: Iskanje Po Investitorju', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.21' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: '"Iskanje po investitorju (izbira možnosti iz spustnega seznama)"'});
                    await seznam.iskanjePoInvestitorju();
                });

                test('1.2.22: Iskanje Po Nosilcu', async () => {
                    test.setTimeout(90000);
                    test.info().annotations.push({ type: 'id', description: '1.2.22' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Iskanje po nosilcu (izbira možnosti iz spustnega seznama)'});
                    await seznam.iskanjePoNosilcu();
                });

                test('1.2.23: Iskanje Po Oznaki Gradbene Parcele', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.23' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Vnos oznake gradbene parcele'});
                    await seznam.iskanjePoOznakiGradbeneParcele();
                });

                test('1.2.24: Gumb Isci', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.24' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Delovanje gumba »Išči«'});
                    await seznam.GumbIsci();
                });

                test('1.2.25: Gumb Ponastavi', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.25' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Delovanje gumba »Ponastavi«'});
                    await seznam.GumbPonastavi();
                });

                test('1.2.26: Gumb Skrči', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.26' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Delovanje gumba »Skrči iskanje«'});
                    await seznam.GumbSkrci();
                });
            });

            test('1.2.27: Prehod Med Stranmi', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({ type: 'id', description: '1.2.27' });
                test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Prehajanje med stranmi seznama zbirk podatkov o graditvi objektov'});
                await seznam.PrehodMedStranmi();
            });

            test('1.2.28: Gumb Domov', async () => {
                test.info().annotations.push({ type: 'id', description: '1.2.28' });
                test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Delovanje gumba »domov« (ikona hiše)'});
                await seznam.GumbDomov();
            });

            test('1.2.29: Izbor Iz Zbirke Objektov', async () => {
                test.info().annotations.push({ type: 'id', description: '1.2.29' });
                test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Izbor iz seznama zbirke podatkov o graditvi objektov'});
                await seznam.IzborIzZbirkeObjektov();
            });

            test.describe('Prehajanje med podatki' , () => {
                test('1.2.30: Osnovni Podatki', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.30' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Klik na gumb »Osnovni podatki«'});
                    await seznam.OsnovniPodatkiT();
                });

                test('1.2.31: Podatki O Investitorju', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.31' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Klik na gumb »Podatki o investitorju«'});
                    await seznam.PodatkiOInvestitorjuT();
                });

                test('1.2.32: Zemljisca Za Gradnjo', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.32' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Klik na gumb »Zemljišča za gradnjo«'});
                    await seznam.ZemljiscaZaGradnjoT();
                });

                test('1.2.33: Objekti', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.33' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Klik na gumb »Objekti« '});
                    await seznam.ObjektiT();
                 });

                test('1.2.34: Dokumenti', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.34' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Klik na gumb »Dokument« '});
                    await seznam.DokumentiT();
                });

                test('1.2.35: Odpiranje grafike', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.35' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Prehod na grafiko UA'});
                    await seznam.OdpiranjeGrafike();
                });
            });

            test('1.2.36: Gumb Zapri', async () => {
                test.info().annotations.push({ type: 'id', description: '1.2.36' });
                test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'S klikom na gumb »Zapri« se zapre kartico postopka in uporabnika vrne na 1. stran'});
                await seznam.GumbZapri();
            });

            test.describe('Barvanje akta' ,() => {
                test('1.2.37: Barvanje Akta Ne', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.37' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Barvanje aktov na prvi strani'});
                    await seznam.BarvanjeAktaNe();
                });

                test('1.2.38: Barvanje Akta Ja', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.38' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Barvanje aktov na prvi strani'});
                    await seznam.BarvanjeAktaJa();
                });

                test('1.2.39: Barvanje Številke Zadeve', async () => {
                    test.info().annotations.push({ type: 'id', description: '1.2.39' });
                    test.info().annotations.push({ type: 'skupina', description: 'Pregled podatkov o obstoječih upravnih aktih'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Barvanje aktov na prvi strani'});
                    await seznam.BarvanjeStevilkeZadeve();
                });
            });
        });

        test.describe('Urejanje podatkov obstoječega upravnega akta' , () => {
            test('1.3.1: Gumb Uredi', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.1' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Spreminjanje vsebine vnosnih polj – osnovni podatki o upravnem aktu'});
                await seznam.GumbUredi();
            });

            test('1.3.2: Gumb Dodajanje Investitorja', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.2' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Dodajanje podatkov o investitorju'});
                await seznam.GumbDodajanjeInvestitorja();
            });

            test('1.3.3: Urejanje Investitorja', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.3' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Urejanje podatkov o investitorju'});
                await seznam.UrejanjeInvestitorja();
            });

            test('1.3.4: Brisanje Investitorja', async ({ page }) => {
                test.setTimeout(35000);
                test.info().annotations.push({ type: 'id', description: '1.3.4' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta' });
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Brisanje podatkov o investitorju' });
                await seznam.BrisanjeInvestitorja();
            });

            test('1.3.5: Dodajanje Zemljišča Za Gradnjo', async ({ page }) => {
                test.info().annotations.push({ type: 'id', description: '1.3.5' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta' });
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Dodajanje zemljišča za gradnjo'});
                await seznam.DodajanjeZemljiscaZaGradnjo();
            });

            test('1.3.6: Sortiranje Zemljišča Za Gradnjo', async () => {
                test.info().annotations.push({type: 'id', description: '1.3.6'});
                test.info().annotations.push({type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Sortiranje zemljišč za gradnjo'});
                await seznam.SortiranjeZemljiscaZaGradnjo();
            });

            test('1.3.8: Brisanje Zemljišča Za Gradnjo', async ({ page }) => {
                test.info().annotations.push({ type: 'id', description: '1.3.8' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta' });
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Brisanje zemljišč za gradnjo' });
                await seznam.BrisanjeZemljiscaZaGradnjo();
            });

          test('1.3.9: V Grafiki', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({ type: 'id', description: '1.3.9' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Dodajanje stavb v grafiki'})
                await seznam.VGrafiki();
            });

            test('1.3.12: Zapri Dodajanje Stavbe', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.12' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Preklic dodajanja novih  stavb v grafiki'});
                await seznam.ZapriDodajanjeStavbe();
            });

            test('1.3.13: Briši Dodane Stavbe', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({ type: 'id', description: '1.3.13' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Brisanje stavb v grafiki in v kartici postopka'});
                await seznam.BrisiDodaneStavbe();
            });

            test('1.3.14: Spreminjanje vsebine vnosnih polj', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.14' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Spreminjanje vsebine vnosnih polj – objekti'});
                await seznam.SpreminjanjeVsebineVnosnihPoljObjekti();
            });

            test('1.3.15: Zapri urejanje zapisa - objekti', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.15' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Preklic urejanja zapisa – objekti'});
                await seznam.ZapriUrejanjeZapisaObjekti();
            });

            test('1.3.16: Shranjevanje sprememb - objekti', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.16' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Shranjevanje sprememb - objekti'});
                await seznam.ShranjevanjeSpremembObjekti();
            });

            test('1.3.17: Dodajanje objektov', async () => {
                    test.setTimeout(40000);
                    test.info().annotations.push({ type: 'id', description: '1.3.17' });
                    test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                    test.info().annotations.push({ type: 'funkcionalnost', description: 'Dodajanje objektov'});
                    await seznam.dodajanjeObjektov();
                });
            });

            test('1.3.18 Pogoji pri vpisu objekta', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.18' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Pogoji pri vpisu objektov'});
                await seznam.pogojiPriVpisuObjekta();
            });

            test('1.3.19/20/21 Uredi objekte', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.19/20/21' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Pogoji pri vpisu objektov - obvezni podatki za shranitev objekta'});
                await seznam.urediObjekte();
            });

            test('1.3.22/23 Pogoji enostavni/neenostavni', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.22/23' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Pogoji pri vpisu objektov - obvezni podatki za shranitev objekta'});
                await seznam.pogojiEnostavni();
            });

            test('1.3.24/25/27/28/29/30/31/32/33 Drugi pogoji pri vpisu objekta', async () => {
                test.setTimeout(90000);
                test.info().annotations.push({ type: 'id', description: '1.3.24/25/27/28/29/30/31/32/33' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Pogoji pri vpisu objektov - drugi pogoji pri vnosu podatkov v obrazec stavbe'});
                await seznam.drugiPogojiPriVpisuObjekta();
            });
*/
            test('1.3.34/35/36/37/38/39/40 Projektna Dokumentacija', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.34/35/36/37/38/39/40' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Spreminjanje vsebine vnosnih polj – projektna dokumentacija'});
                await seznam.projektnaDokumentacija();
            });
/*
            test('1.3.35/41/42/43/44/45/46 Dokumenti', async () => {
                test.info().annotations.push({ type: 'id', description: '1.3.35/41/42/43/44/45/46' });
                test.info().annotations.push({ type: 'skupina', description: 'Urejanje podatkov obstoječega upravnega akta'});
                test.info().annotations.push({ type: 'funkcionalnost', description: 'Spreminjanje vsebine vnosnih polj – projektna dokumentacija'});
                await seznam.dokumenti3();
            });

      test('1.4.1/2/3/4/5/6 Dodajanje akta', async () => {
          test.info().annotations.push({ type: 'id', description: '1.4.1/2/3' });
          test.info().annotations.push({ type: 'skupina', description: 'Dodajanje novega upravnega akta'});
          test.info().annotations.push({ type: 'funkcionalnost', description: 'Omogočanje dodajanja upravnega akta'});
          await seznam.dodajanjaAkta();
      });

      test('1.4.7/8/9 Podatki o investitorju pt.2', async () => {
          test.info().annotations.push({ type: 'id', description: '1.4.4' });
          test.info().annotations.push({ type: 'skupina', description: 'Dodajanje novega upravnega akta'});
          test.info().annotations.push({ type: 'funkcionalnost', description: 'Dodajanje investitorja'});
          await seznam.podatkiOInvestitorju2();
      });

      test('1.4.10/15/16/17/18/19 Dodajanje zemljišča za gradnjo pt.2', async () => {
          test.info().annotations.push({type: 'id', description: '1.4.10/15/16/17/18/19'});
          test.info().annotations.push({type: 'skupina', description: 'Dodajanje novega upravnega akta'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Dodajanje zemljišča za gradnjo'});
          await seznam.dodajanjeZemljiscaZaGradnjo();
      });

      test('1.4.21/22 Uvoz csv', async () => {
          test.info().annotations.push({type: 'id', description: '1.4.21/22'});
          test.info().annotations.push({type: 'skupina', description: 'Dodajanje novega upravnega akta'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Avtomatski vnos'});
          await seznam.uvozCsv();
      });

      test('2.1.1/2/3 pregledGraf1', async () => {
          test.setTimeout(120000);
          test.info().annotations.push({type: 'id', description: '2.1.1/2/3'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Grafika'});
          await seznam.pregledGraf1();
      });

      test('2.1.4/5 pregledGraf2', async () => {
          test.setTimeout(120000);
          test.info().annotations.push({type: 'id', description: '2.1.4/5'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Grafika'});
          await seznam.pregledGraf2();
      });

      test('2.1.6/7/8/9/10 pregledGraf3', async () => {
          test.setTimeout(120000);
          test.info().annotations.push({type: 'id', description: '2.1.6/7/8/9/10'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Izbor slojev iz vsebine'});
          await seznam.pregledGraf3();
      });

      test('2.1.11 odstranitev sloja iz izbranih vsebin', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.11'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Izbor slojev iz vsebine'});
          await seznam.pregledGraf4();
      });

      test('2.1.12 aktivacija sloja', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.12'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Aktivacija sloja'});
          await seznam.pregledGraf5();
      });

      test('2.1.13 merilo', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.13'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Spreminjanje merila prikaza izbrane vsebine'});
          await seznam.spreminjanjeMerila();
      });

      test('2.1.14 drsnik', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.14'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Spreminjanje merila prikaza izbrane vsebine'});
          await seznam.spreminjanjeDrsnika();
      });

      test('2.1.15 spreminjanje merila z miško', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.15'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Spreminjanje merila prikaza izbrane vsebine'});
          await seznam.spreminjanjeMerilaZMisko();
      });

      test('2.1.16 spreminjanje merila z seznamom', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.16'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Spreminjanje merila prikaza izbrane vsebine'});
          await seznam.spreminjanjeMerilaZSeznamom();
      });

      test('2.1.17 premik z puščicami', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.17'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Premikanje prikaza'});
          await seznam.premikSPuscicami();
      });

      test('2.1.18 premik s tipkami', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.18'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Premikanje prikaza'});
          await seznam.premikSTipkami();
      });

      test('2.1.20 privzeti pogled', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.20'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Premikanje prikaza'});
          await seznam.privzetiPogled();
      });

      test('2.1.21 mini map', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.21'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Prikaz mini mape'});
          await seznam.odpiranjeMiniMapa();
      });

      test('2.1.22 metapodatkovni opis', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.22'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Metapodatkovni opis'});
          await seznam.metapodatkovniOpis();
      });

      test.describe('Legenda in oznake sloja' , () => {
           test('2.1.27 oznake Legende opis', async () => {
               test.info().annotations.push({type: 'id', description: '2.1.27'});
               test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
               test.info().annotations.push({type: 'funkcionalnost', description: 'Legenda in oznake sloja'});
               await seznam.oznakeLegende();
            });

           test('2.1.28 okno Legende opis', async () => {
              test.info().annotations.push({type: 'id', description: '2.1.28'});
              test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
              test.info().annotations.push({type: 'funkcionalnost', description: 'Legenda in oznake sloja'});
              await seznam.oknoLegendeF();
           });

          test('2.1.29 premikanjeLegende', async () => {
              test.info().annotations.push({type: 'id', description: '2.1.29'});
              test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
              test.info().annotations.push({type: 'funkcionalnost', description: 'Legenda in oznake sloja'});
              await seznam.premikanjeLegende();
          });

          test('2.1.30 povecanjeLegende', async () => {
              test.info().annotations.push({type: 'id', description: '2.1.30'});
              test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
              test.info().annotations.push({type: 'funkcionalnost', description: 'Legenda in oznake sloja'});
              await seznam.povecanjeLegende();
          });

          test('2.1.31 odpiranje legende cez drugo', async () => {
              test.info().annotations.push({type: 'id', description: '2.1.31'});
              test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
              test.info().annotations.push({type: 'funkcionalnost', description: 'Legenda in oznake sloja'});
              await seznam.drugaLegenda();
          });

           test('2.1.32 zapiranje legende', async () => {
              test.info().annotations.push({type: 'id', description: '2.1.32'});
              test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
              test.info().annotations.push({type: 'funkcionalnost', description: 'Legenda in oznake sloja'});
              await seznam.zapiranjeLegendeF();
           });
      });

       test('2.1.33 premikSkoziČas', async () => {
          test.setTimeout(40000);
          test.info().annotations.push({type: 'id', description: '2.1.33'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Zgodovinski pregled (Arhiv)'});
          await seznam.premikSkoziCas();
       });

       test('2.1.34 premikPogleda', async () => {
          test.info().annotations.push({type: 'id', description: '2.1.34'});
          test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
          test.info().annotations.push({type: 'funkcionalnost', description: 'Osnovni meni grafike'});
          await seznam.premikPogleda();
       });

        test('2.1.35 prikazSeznama', async () => {
           test.info().annotations.push({type: 'id', description: '2.1.35'});
           test.info().annotations.push({type: 'skupina', description: 'Iskanje lokacije, izbor in prikaz vsebine'});
           test.info().annotations.push({type: 'funkcionalnost', description: 'Osnovni meni grafike'});
           await seznam.prikazSeznama();
        });

        test.describe('Grafika - Urejanje parcel in stavb/posameznih objektov' , () => {
            test('2.2.1 dodajanjeParcel', async () => {
               test.info().annotations.push({type: 'id', description: '2.2.1'});
               test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
               test.info().annotations.push({type: 'funkcionalnost', description: 'Dodajanje parcel'});
               await seznam.dodajanjeParcel();
            });

            test('2.2.2 objektiSloj', async () => {
               test.info().annotations.push({type: 'id', description: '2.2.2'});
               test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
               test.info().annotations.push({type: 'funkcionalnost', description: 'Dodajanje parcel'});
               await seznam.objektiSloj();
            });

            test('2.2.3 izbiraParcele', async () => {
               test.info().annotations.push({type: 'id', description: '2.2.3'});
               test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
               test.info().annotations.push({type: 'funkcionalnost', description: 'Dodajanje parcel'});
               await seznam.izbiraParcele();
            });

            test('2.2.4 pogojDodajanjaParcele', async () => {
               test.info().annotations.push({type: 'id', description: '2.2.4'});
               test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
               test.info().annotations.push({type: 'funkcionalnost', description: 'Dodajanje parcel'});
               await seznam.pogojDodajanjaParcele();
            });

            test('2.2.5 iskanjePoParcelniStevilkiIzbraneParcele', async () => {
               test.setTimeout(40000);
               test.info().annotations.push({type: 'id', description: '2.2.5'});
               test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
               test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane parcele'});
               await seznam.iskanjePoParcelniStevilkiIzbraneParcele();
            });

            test('2.2.6 urediIzbraneParcele', async () => {
               test.setTimeout(40000);
               test.info().annotations.push({type: 'id', description: '2.2.6'});
               test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
               test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane parcele'});
               await seznam.urediIzbraneParcele();
            });

            test('2.2.7 gumbTarca', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.2.7'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane parcele'});
                await seznam.gumbTarca();
            });

            test('2.2.8 shraniIzbraneParcele', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.2.8'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane parcele'});
                await seznam.shraniIzbraneParcele();
            });

            test('2.2.9 pobrisiIzborIzbranihParcele', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.2.9'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane parcele'});
                await seznam.pobrisiIzborIzbranihParcele();
            });

            test('2.2.10 prekiniIzbranihParcele', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.2.10'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane parcele'});
                await seznam.prekiniIzbranihParcele();
            });

            test('2.2.11 naborParcel', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.2.10'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Nabor parcel'});
                await seznam.naborParcel();
            });

            test('2.2.12 iskanjeNaborParcel', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.2.11'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Nabor parcel'});
                await seznam.iskanjeNaborParcel();
            });

            test('2.2.13 gumbTarcaNaborParcel', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.2.13'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Nabor parcel'});
                await seznam.gumbTarcaNaborParcel();
            });

                test('2.2.14 obvestiloPremakniCentroid', async () => {
                    test.setTimeout(40000);
                    test.info().annotations.push({type: 'id', description: '2.2.14'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Premakni centroid'});
                    await seznam.obvestiloPremakniCentroid();
                });

                test('2.2.15 omogocenPremakniCentroid', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.15'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Premakni centroid'});
                    await seznam.omogocenPremakniCentroid();
                });

                test('2.2.16 premikCentroida', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.16'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Premakni centroid'});
                    await seznam.premikCentroida();
                });

                test('2.2.17 obvestiloObDodajanjuStavbe', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.17'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Dodajanje stavb oz. posameznih objektov'});
                    await seznam.obvestiloObDodajanjuStavbe();
                });

                test('2.2.18 omogocenDodajStavbo', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.18'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Dodajanje stavb oz. posameznih objektov'});
                    await seznam.omogocenDodajStavbo();
                });

                test('2.2.19 dodajStavbo', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.19'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Dodajanje stavb oz. posameznih objektov'});
                    await seznam.dodajStavbo();
                });

                test('2.2.20 iskanjeStevilkeStavbe', async () => {
                    test.setTimeout(40000);
                    test.info().annotations.push({type: 'id', description: '2.2.20'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane stavbe'});
                    await seznam.iskanjeStevilkeStavbe();
                });

                test('2.2.21 izbiraObjekta/vrsteGradnje', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.21'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane stavbe'});
                    await seznam.izbiraObjektaVrsteGradnje();
                });

                test('2.2.22 urejanjeStavb2', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.22'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane stavbe'});
                    await seznam.urejanjeStavb2();
                });


                test('2.2.23 tarcaIzbraneStavbe', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.23'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane stavbe'});
                    await seznam.tarcaIzbraneStavbe();
                });

                test('2.2.24 shraniIzbraneStavbe', async () => {
                    test.setTimeout(40000);
                    test.info().annotations.push({type: 'id', description: '2.2.24'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane stavbe'});
                    await seznam.shraniIzbraneStavbe();
                });

                test('2.2.25 pobrisiIzborIzbraneStavbe', async () => {
                    test.setTimeout(40000);
                    test.info().annotations.push({type: 'id', description: '2.2.25'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane stavbe'});
                    await seznam.pobrisiIzborIzbraneStavbe();
                });

                test('2.2.26 prekiniStavbe', async () => {
                    test.setTimeout(40000);
                    test.info().annotations.push({type: 'id', description: '2.2.26'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Izbrane stavbe'});
                    await seznam.prekiniStavbe();
                });

                test('2.2.27 podmeniNaborStavb', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.27'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Nabor stavb'});
                    await seznam.podmeniNaborStavb();
                });

                test('2.2.28 iskanjeStevilkeStavbeNaborStavb', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.28'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Nabor stavb'});
                    await seznam.iskanjeStevilkeStavbeNaborStavb();
                });

                test('2.2.29 tarcaNaborStavb', async () => {
                    test.info().annotations.push({type: 'id', description: '2.2.29'});
                    test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                    test.info().annotations.push({type: 'funkcionalnost', description: 'Nabor stavb'});
                    await seznam.tarcaNaborStavb();
                });
            });

        test.describe('Grafika - Dodajanje parcel in stavb/posameznih objektov', () => {
            test('2.3.1 niIzbranegaSlojaUrejanjeParcel', async () => {
                test.info().annotations.push({type: 'id', description: '2.3.1'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Urejanje parcel'});
                await seznam.niIzbranegaSlojaUrejanjeParcel();
            });

            test('2.3.2 vidnostUrejanjaParcel', async () => {
                test.info().annotations.push({type: 'id', description: '2.3.2'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Urejanje parcel'});
                await seznam.vidnostUrejanjaParcel();
            });

            test('2.3.3 izborInTarcaParcele', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.3.3'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Urejanje parcel'});
                await seznam.izborInTarcaParcele();
            });

            test('2.3.4 pobrisiIzborParcel', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.3.4'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Brisanje parcel'});
                await seznam.pobrisiIzborParcel();
            });

            test('2.3.5 shraniIzborParcel', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.3.5'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Shranjevanje urejanj'});
                await seznam.shraniIzborParcel();
            });

            test('2.3.6 prekiniIzborParcel', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.3.6'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Preklic sprememb'});
                await seznam.prekiniIzborParcel();
            });

            test('2.3.7 prikazUrejanjaStavb', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.3.7'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Urejanje izbranih stavb'});
                await seznam.prikazUrejanjaStavb();
            });

            test('2.3.8 izborInTarcaUrejanjeStavb', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.3.8'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Urejanje izbranih stavb'});
                await seznam.izborInTarcaUrejanjeStavb();
            });

            test('2.3.9 pobrisiIzborIzbranihStavb', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.3.9'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Brisanje stavb'});
                await seznam.pobrisiIzborIzbranihStavb();
            });

            test('2.3.10 shraniIzborIzbranihStavb', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.3.10'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Shranjevanje urejanje'});
                await seznam.shraniIzborIzbranihStavb();
            });

            test('2.3.11 prekiniIzbranihStavb', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.3.11'});
                test.info().annotations.push({type: 'skupina', description: 'Grafika - Urejanje parcel in stavb/posameznih objektov'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Preklic sprememb'});
                await seznam.prekiniIzbranihStavb();
            });
        });


        test.describe('Merjenje' , () => {
            test('2.4.1 merjenjeRazdaljeInPovrsine', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.4.1'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Merjenje'});
                await seznam.merjenjeRazdaljeInPovrsine();
            });

            test('2.4.3 pobrisiMeritve', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.4.3'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Merjenje'});
                await seznam.pobrisiMeritve();
            });
        });

        test.describe('Poizvedovanje' , () => {

            test('2.4.4 omogocenoPoizvedovanje', async () => {
                test.info().annotations.push({type: 'id', description: '2.4.4'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje'});
                await seznam.omogocenoPoizvedovanje();
            });

             test('2.4.5 izpis obvestila o potrebi izbire sloja', async () => {
                test.info().annotations.push({type: 'id', description: '2.4.5'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vidnih slojih'});
                await seznam.izpisObvestilaPoizvedovanje();
            });

            test('2.4.6 izpis obvestila o nemogocenem poizvedovanju', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.4.6'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vidnih slojih'});
                await seznam.obvestiloSlojNeomogocaPoizvedovanja();
            });

            test('2.4.7 pojavitev okna poizvedbe', async () => {
                test.setTimeout(40000);
                test.info().annotations.push({type: 'id', description: '2.4.7'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vidnih slojih'});
                await seznam.pojavitevOknaPoizvedbePoVidnihSlojih();
            });

            test('2.4.8 delovanje drsnika v oknu poizvedovanja', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.8'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vidnih slojih'});
                await seznam.drsnikVOknuPoizvedovanjaPoVidnihslojih();
            });

            test('2.4.9 povečava okna za poizvedovanje', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.9'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vidnih slojih'});
                await seznam.povecavaOknaZaPoizvedovanjePoVidnihSlojih();
            });

            test('2.4.10 premik okna za poizvedovanje', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.10'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vidnih slojih'});
                await seznam.premikOknaZaPoizvedovanjePoVidnihSlojih();
            });

            test('2.4.11 zapiranje okna za poizvedovanje', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.11'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vidnih slojih'});
                await seznam.zapriOknoZaPoizvedovanjePoVidnihSlojih();
            });

            test('2.4.12 pojavitev okna za poizvedovanje po vseh slojih', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.12'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vseh slojih'});
                await seznam.pojavitevOknaPoizvedovanjaPoVsehSlojih();
            });

            test('2.4.13 delovanje drsnika v oknu poizvedovanja po vseh slojih', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.13'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vseh slojih'});
                await seznam.drsnikVOknuPoizvedovanjaPoVsehSlojih();
            });

            test('2.4.14 vidnost dodatnih informacij ob kliku na sklop', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.14'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vseh slojih'});
                await seznam.dodatneInformacijePoizvedovanjaPoVsehSlojih();
            });

            test('2.4.15 zapiranje okna za poizvedovanje po vseh slojih', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.15'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po vseh slojih'});
                await seznam.zapriOknoZaPoizvedovanjePoVsehSlojih();
            });

            test('2.4.17 obvestilo o potrebni izbiri sloja pri poizvedovanjju po izbranem sloju', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.17'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po izbranem sloju'});
                await seznam.obvestiloOPotrebniIzbiriSloja();
            });

            test('2.4.18 obvestilo o sloju da ne omogoca poizvedbe po izbranem sloju', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.18'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po izbranem sloju'});
                await seznam.obvestiloSlojNeOmogocaPoizvedbe();
            });

            test('2.4.19 pojavitev okna za poizvedovanje po izbranem sloju', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.19'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po izbranem sloju'});
                await seznam.pojavitevOknaPoizvedovanjaPoIzbranemSloju();
            });

            test('2.4.20 delovanje drsnika v oknu poizvedovanja po izbranem sloju', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.20'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po izbranem sloju'});
                await seznam.drsnikVOknuPoizvedovanjaPoIzbranemSloju();
            });

            test('2.4.21 povečava okna za poizvedovanje po izbranem sloju', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.21'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po izbranem sloju'});
                await seznam.povecavaOknaZaPoizvedovanjePoIzbranemSloju();
            });

            test('2.4.22 premik okna za poizvedovanje', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.22'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po izbranem sloju'});
                await seznam.premikOknaZaPoizvedovanjePoIzbranemSloju();
            });

            test('2.4.23 zapiranje okna za poizvedovanje po izbranem sloju', async () => {
                test.setTimeout(60000);
                test.info().annotations.push({type: 'id', description: '2.4.23'});
                test.info().annotations.push({type: 'skupina', description: 'Merjenje in poizvedovanje'});
                test.info().annotations.push({type: 'funkcionalnost', description: 'Poizvedovanje po izbranem sloju'});
                await seznam.zapriOknoZaPoizvedovanjePoIzbranemSloju();
            });
        })

                test.describe('Označi objekt' , () => {

                    test('2.6.1 oznaci objekt', async () => {
                        test.info().annotations.push({type: 'id', description: '2.6.1'});
                        test.info().annotations.push({type: 'skupina', description: 'Oznaci objekt'});
                        test.info().annotations.push({type: 'funkcionalnost', description: 'oznaci objekt'});
                        await seznam.oznaciObjekt();
                    });

                    test('2.6.2 nastavitev obmocja', async () => {
                        test.info().annotations.push({type: 'id', description: '2.62'});
                        test.info().annotations.push({type: 'skupina', description: 'Oznaci objekt'});
                        test.info().annotations.push({type: 'funkcionalnost', description: 'nastavitev obmocja'});
                        await seznam.nastavitveObmocjaF();
                    });

                    test('2.6.3 pobrisi obmocje', async () => {
                        test.info().annotations.push({type: 'id', description: '2.6.3'});
                        test.info().annotations.push({type: 'skupina', description: 'Oznaci objekt'});
                        test.info().annotations.push({type: 'funkcionalnost', description: 'pobrisi obmocje'});
                        await seznam.pobrisiObmocjeF();
                    });
                })*/
});