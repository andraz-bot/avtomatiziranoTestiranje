export class SeznamLokatorjev {
    constructor(page) {
        this.page = page;
        this.napake = [];

        // 1. Osnovni elementi in tabele/rezultati (morajo biti definirani na vrhu, ker jih drugi lokatorji uporabljajo)
        this.rezultati = page.locator('#results');
        this.vseVrstice = page.locator('tr.pis-datatable-row');
        this.prvaVrstica = page.locator('tr.pis-datatable-row').first();
        this.PrviAkt = page.locator('tr.pis-datatable-row').nth(0);
        this.drugiAkt = page.locator('tr.pis-datatable-row').nth(1);
        this.odjavaBtn = page.locator('#odjava-button');
        this.globusBtn = page.locator('i.icon-globus.header-icon');
        this.vprasajBtn = page.locator('i.fas.fa-question-circle');
        this.prviaktBtn = page.locator('td.pis-datatable-cell').first();
        this.podatkiOInvestitorju = page.locator('#tab_tab-investitor');
        this.tabelaInvestitorjev = page.locator('#tab-investitor_results');
        this.vrsticeInvestitor = page.locator('#tab-investitor_results tr[resultrow="true"]');
        this.podatkiOInvestitorjuHeader = page.locator('div.card-header').filter({hasText: 'Podatki o investitorju'});
        this.zavihekPodatkiOInvestitorju = page.locator('#tab_tab-investitor, [role="tab"]:has-text("investitor")').first();
        this.editInvestitor = page.getByText('Spreminjanje podatkov o investitorjih');
        this.DeleteInvestitor = page.locator('span.page-title-text21crn-bold', {hasText: 'Brisanje podatkov o investitorjih'});
        this.osnovniPodatki = page.locator('#tab_tab-podatki');
        this.osnovniPodatkiHeader = page.locator('div.card-header').filter({hasText: 'Osnovni podatki'});
        this.zemljiscaZaGradnjo = page.locator('#tab_tab-zemljisca');
        this.vrsticeZemljisca = page.locator('#tab-zemljisca_results tr[resultrow="true"]');
        this.prvaVrsticaZemljisca = page.locator('#tab-zemljisca_results tr[resultrow="true"]').first();
        this.celicaPrveVrsticeZemljisca = page.locator('#tab-zemljisca_results tr[resultrow="true"]').first().locator('td.pis-datatable-cell').first();
        this.vseVrsticeZemljisc = page.locator('#tab-zemljisca_results tr[resultrow="true"]').all();
        this.zemljiscaZaGradnjoHeader = page.locator('div.card-header').filter({
            hasText: 'Zemljišča za gradnjo',
            visible: true
        });
        this.iskano = this.page.locator('input.form-control.form-control-sm.input-text14crn[value="302040"]');
        this.pravaVrstica = this.page.locator('tr[resultrow="true"]').filter({ hasText: '302040' });
        this.textPrveVrsticeZemljisca = this.page.locator('tr.pis-datatable-row[resultrow="true"]');
        this.tabelaRezultatovPoizvedbe = this.page.locator('table#results tr[resultrow="true"]');
        this.DodajanjeZemljisce = page.locator('span.page-title-text21crn-bold').filter({hasText: /Dodajanje.*zemljišč za gradnjo/s});
        this.deleteZemljisce = page.locator('span.page-title-text21crn-bold', {hasText: 'Brisanje zemljišč za gradnjo'});
        this.objekti = page.locator('#tab_tab-objekti');
        this.objektiHeader = page.locator('div.card-header').filter({hasText: 'Objekti', visible: true});
        this.tabelaObjektov = page.locator('#tab-objekti_results');
        this.zavihekObjekti = page.locator('#tab_tab-objekti, [role="tab"]:has-text("Objekti")').first();
        this.dokumenti = page.locator('#tab_tab-dokumenti');
        this.zapriDokumente = this.page.locator('#close');
        this.dokumenti2 = page.locator('#tab-dokumenti');
        this.dokumentiHeader = page.locator('div.card-header').filter({hasText: 'Upravni akti'});
        this.ID_UAsort = page.locator('th').filter({hasText: 'ID UA'});
        this.prvaCelica = page.locator('td.pis-datatable-cell').first();
        this.sifko = page.locator("span[aria-labelledby='select2-zemljisce_obcina-container']");
        this.parcela = page.locator("span[aria-labelledby='select2-zemljisce_parcelna_st-container']");
        this.KatastrskaObcinaHeaderBefore = page.locator('#zemlj_none_0');
        this.KatastrskaObcinaHeaderDown = page.locator('#zemlj_down_0');
        this.KatastrskaObcinaHeaderUp = page.locator('#zemlj_up_0');
        this.katastrskaObcinaHeader = page.locator('#tab-zemljisca_results th').filter({hasText: 'Katastrska občina'}).first();
        this.katastrskaObcinaImeHeader = page.locator('#tab-zemljisca_results th').filter({hasText: 'Katastrska občina (ime)'}).first();
        this.parcelnaStevilkaHeader = page.locator('#tab-zemljisca_results th').filter({hasText: 'Parcelna številka'}).first();
        this.errorContainer = page.locator('#objekt_error_text');
        this.grafikaNaslov = page.locator('.overlay-header span');
        this.headerID = page.locator('th').filter({hasText: 'ID UA'});
        this.celica = page.locator('td.pis-datatable-cell').nth(1);
        this.header = page.locator('th').filter({hasText: 'Upravni organ'});
        this.stevilkaZadeve = page.locator('td.pis-datatable-cell').nth(2);
        this.vnosStevilkeZadeve = page.locator('#stevilkaZadeve');
        this.gpHeaders = this.page.locator('div.card-header.bg-subsection');
        this.header2 = page.locator('th').filter({hasText: 'Št. zadeve'});
        this.postopek = page.locator('td.pis-datatable-cell:nth-child(4)');
        this.header3 = page.locator('th').filter({hasText: 'Postopek'});
        this.nazivCelice = page.locator('td.pis-clamp-naziv');
        this.header4 = page.locator('th').filter({hasText: 'Naziv'});
        this.datumIzd = page.locator('td.pis-datatable-cell:nth-child(6)');
        this.header5 = page.locator('th').filter({hasText: 'Datum izd.'});
        this.gumbIsci = page.locator("#searchButton");
        this.celicaDatum = page.locator('#tab-dokumenti_results tr[resultrow="true"] td').nth(1);
        this.prvaVrsticaObjekta = page.locator('#tab-objekti_results .pis-datatable-row').first();
        this.opozoriloPremikCentroida = this.page.locator('.messenger-message-inner').filter({ hasText: 'Za nastavljanje centroida' });
        this.opozoriloPremikCentroida2 = this.page.locator('.messenger-message-inner').filter({ hasText: 'Centroid uspešno nastavljen.' });
        this.opozoriloNiIzbranegaSloja = this.page.locator('.messenger-message-inner').filter({ hasText: 'Izbran ni noben sloj.' });
        this.opozoriloNiIzbranegaSlojaIzberite = this.page.locator('div.messenger-message-inner', { hasText: 'Izbran ni noben sloj. Izberite sloj iz legende' })
        this.opozoriloIzbiraObjektaInVrsteGradnje = this.page.locator('.messenger-message.message.alert.error.message-error.alert-error');
        this.tarcaIzbiraStavbe = this.page.locator('i.fas.fa-crosshairs.pull-right');
        this.tarcaUrejanjeStavb1026 = this.page.locator('#BUILDING-676-1026 > .fas.fa-crosshairs');
        this.menu = this.page.locator('div.map-menu.open');
        this.naborStavbMenu = this.page.locator('div.section.naborParcels');
        this.urejanjeStavb = this.page.locator('div.section.editParcels');
        this.naborObjektovMenu = this.page.locator('#menuNaborObjects');
        this.urejanjeParcelMenu = this.page.locator('#menuEditObjects');
        this.naborParcelMenu = this.page.locator('#menuNaborObjects');
        this.pobrisiParcelo = this.page.locator('a.nabor-objects:has(i.fas.fa-trash-alt)');
        this.shraniIzbor = this.page.locator('a.btn.btn-light.w-100:has(i.far.fa-save)');
        this.shraniIzborParcele = this.page.locator('div.section.editParcels a.btn.btn-light.w-100:has(i.far.fa-save)');
        this.pobrisiIzborParcele = this.page.locator('div.section.editParcels a.btn.btn-light.w-100:has(i.fas.fa-trash-alt)');
        this.prekiniParcele = this.page.locator('div.section.editParcels a.btn.btn-light.w-100.nabor-objects:has(i.far.fa-window-close)');
        this.shraniIzborStavbe = this.page.locator('div.section.editParcels:has(div.title:text("Urejanje stavb")) a.btn.btn-light.w-100:has(i.far.fa-save)')
        this.pobrisiIzborStavbe = this.page.locator('div.section.editParcels a.btn.btn-light.w-100:has(i.fas.fa-trash-alt)');
        this.prekiniIzborStavbe = this.page.locator('div.section.editParcels a.btn.btn-light.w-100.nabor-objects:has(i.far.fa-window-close)');
        this.deliStavbGumb = this.page.locator('i.deli-stavbe').nth(1);
        this.deliStavbMenu = this.page.locator('.deli-stavbe-list');
        

        // 2. Opcije in selektorji (ki uporabljajo this.rezultati)
        this.opcijaGradbenoDovoljenje = page.locator(".select2-results__option").filter({hasText: "Gradbeno dovoljenje"});
        this.opcijaUEDomzale = page.locator(".select2-results__option").filter({hasText: "UE Domžale"});
        this.opcijaeGraditev = page.locator('.select2-results__option').filter({hasText: "eGraditev"});
        this.opcijaObcine = page.locator('.select2-results__option', {hasText: "676 PEKRE"});
        this.opcijaObcine2 = page.locator('.select2-results__option').filter({ hasText: '676 PEKRE' });
        this.opcijaNosilec = page.locator('.select2-results__option', {hasText: "KOS TANJA (VIŠJI SVETOVALEC)"});
        this.opcijaParcele = page.locator('.select2-results__option', {hasText: /^7\/1\s/});
        this.opcijaParcele2 = page.getByRole('option', { name: '7/1', exact: true });
        this.opcijaStZadeve = page.locator('tr[resultrow="true"]').filter({ hasText: "351-85/2023-6220" }).nth(0);
        this.opcijaRekonstrukcije = this.rezultati.locator('tr[resultrow="true"]').filter({ hasText: /rekonstrukcija/i });
        this.opcijaRekonstrukcije2 = page.locator('table#tab-objekti_results tr[resultrow="true"]').filter({ hasText: 'rekonstrukcija' });
        this.rekonstrukcijaElement = page.locator('.vrste-gradenj-list span[data-vrstagradnjeid="3"]');
        this.opcijaKlasifikacijeStavbe = page.locator('.select2-results__option').filter({ hasText: '11100-Enostanovanjske stavbe' });
        this.klasifikacijaStavbeContainer = page.locator('[aria-labelledby="select2-objekt_cc_si-container"]');
        this.preverbaVrsticeObjekti = this.page.locator('table#tab-objekti_results tr[resultrow="true"]').filter({ hasText: '11100' });
        this.opcijaKlasifikacijeStavbe3 = page.locator('.select2-results__option').filter({ hasText: '11210-Dvostanovanjske stavbe' });
        this.opcijaKlasifikacijeStavbe4 = page.locator('.select2-results__option').filter({ hasText: '11220-Tri- in večstanovanjske stavbe' });
        this.opcijaKlasifikacijeStavbe2 = this.rezultati.locator('tr.pis-datatable-row').filter({ hasText: '11100' });
        this.opcijaUpravniOrgan = page.locator('.select2-results__option:visible').filter({ hasText: 'UPRAVNA ENOTA RUŠE' }).first();
        this.opcijaVrstaPostopka = page.locator('.select2-results__option:visible').filter({ hasText: 'Gradbeno dovoljenje' }).first();
        this.opcijaNacinResitve = page.locator('.select2-results__option:visible').filter({ hasText: 'ZAHTEVI UGODENO' }).first();
        this.opcijaUpravnegaOrgana = page.locator('.select2-results__option:visible').filter({ hasText: 'Enotno dovoljenje - MOP-DP012-P2' }).first();
        this.opcijaInvestitor = page.locator('#tab-investitor_results tr[resultrow="true"]').filter({ hasText: 'Janez' });
        this.spustniMeni = page.locator('select', { hasText: '... izberi objekt ...' });
        this.prvaCelicaVrstaUpravnegaAkta = page.locator("td.pis-datatable-cell").filter({hasText: "GD"}).first();
        this.opcijaZemljiscaZaGradnjo = page.locator('#tab-zemljisca_results #zemljisceRow_676_7_1');
        this.vrstice = page.locator('tr[resultrow="true"]:visible td:first-child').all();
        this.gpHeaders = page.locator('.card-header.bg-subsection');
        this.aktivnaStran = page.locator("li.page-item.active").first();
        this.modalObjekt = page.locator('#modal_confirmation_objekt');
        this.panelIzbraneStavbe = page.locator('.section.has-filter.izbira-parcel');
        this.vidnaSekcija = page.locator('.section:not([style*="display: none"])');
        this.prvaVrsticaDokumenta = page.locator('#tab-dokumenti_results .pis-datatable-row').first();

        // 3. Modalna okna (definirana pred njihovimi otroškimi lokatorji)
        this.vsebinaModalnegaOkna = page.locator('div.modal-content').filter({
            has: page.locator('#modal_add_objekt:visible')
        });
        this.vsebinaModalnegaOkna2 = page.locator('div.modal-content').filter({
            has: page.locator('#editObjektForm')
        }).locator('visible=true');
        this.shraniInvestitorjaModalnoOkno = page.locator('.modal-content')
            .filter({ has: page.locator('#saveinvestitor') });
        this.zapriUrejanjeDokumenta = this.page.locator('button[data-dismiss="modal"]:has-text("Zapri")');
        this.modalUrejanjaDokumenta = this.page.locator('span.page-title-text21crn-bold:has-text("dokumentov v zadevi")');

        // Otroški lokatorji modalnih oken
        this.urejanjeObrazcaObjekta = this.vsebinaModalnegaOkna.locator('#editObjektForm');
        this.poljeNaslov = this.shraniInvestitorjaModalnoOkno.locator('#investitor_naslov');
        this.nazivInvestitorja = this.shraniInvestitorjaModalnoOkno.locator('#investitor_naziv');
        this.naslovDodajanja = this.shraniInvestitorjaModalnoOkno.locator('#modal_add_investitor');
        this.naslovSpreminjanja = this.shraniInvestitorjaModalnoOkno.locator('#modal_edit_investitor');
        this.naslovModala = this.vsebinaModalnegaOkna.locator('#modal_add_objekt');
        this.brutoProstorninaInput = this.vsebinaModalnegaOkna.locator('#objekt_bruto_prostornina');
        this.strosekInput = this.vsebinaModalnegaOkna.locator('#objekt_strosek');
        this.ogrevanjeSelect = this.vsebinaModalnegaOkna.locator('#objekt_ogrevanje');
        this.enosobnaStStanovanjInput = this.vsebinaModalnegaOkna.locator('#objekt_1_st');
        this.enosobnaPovrsinaInput = this.vsebinaModalnegaOkna.locator('#objekt_1_up');
        this.dejavnostPovrsinaInput = this.vsebinaModalnegaOkna.locator('#objekt_uporabna_povrsina');
        this.potrdiGumbModalnoOkno = this.vsebinaModalnegaOkna.locator('#saveobjekt');
        this.lokatorNaslova = page.locator('.modal-header').getByText('Brisanje objektov', { exact: true });
        this.naslovModala2 = this.vsebinaModalnegaOkna2.locator('span.page-title-text21crn-bold');
        this.naslovModala3 = this.vsebinaModalnegaOkna.locator('span.page-title-text21crn-bold');
        this.errorBoxModalnegaOkna = page.locator('#modal_wrong_input_objekt .modal-body');
        this.znakXVErrorBoxuModalnegaOkna = page.locator('#modal_wrong_input_objekt button.close[data-dismiss="modal"]');
        this.dodajanjeHeader = page.locator('.modal-header:visible .page-title-text21crn-bold');
        this.zapriModalnoOkno = page.locator('.modal-header:visible button.close');
        this.izbiraUpravnegaOrgana = page.locator('#select2-upravniOrgan-container');
        this.izbiraVrstePostopka = page.locator('span.select2-selection[aria-labelledby="select2-vrstaUA-container"]');
        this.izbiraVrstePostopka2 = page.locator('#select2-vrstaUA-container');
        this.izbiraDatumaIzvoza = page.locator('#datum_izvoza');
        this.izbiraDatumaZacetka = page.locator('#datum_zacetka');
        this.izbiraNacinaResitve = page.locator('span.select2-selection[aria-labelledby="select2-nacin-container"]');
        this.izbiraNacinaResitve2 = page.locator('#select2-nacin-container');
        this.izbiraDatumaPrijave = page.locator('#datum_prijave_zacetka');
        this.izbiraNazivaGradnje = page.locator('#objekt');
        this.izbiraUpravnegaPostopka = page.locator('span.select2-selection[aria-labelledby="select2-upravniPostopek-container"]');
        this.prikazovalnikUpravnegaPostopka = page.locator('#select2-upravniPostopek-container');
        this.izbiraStevilkeSpisa = page.locator('#StSpis');
        this.opozorilnoOkno = page.locator('#missingParameterWarning');
        this.izbiranjeParcelNiMogoce = this.page.locator('div.messenger-message-inner:has-text("Izbiranje parcel iz grafike ni mogoče")');
        this.shraniInvestitorja = this.shraniInvestitorjaModalnoOkno.locator('#saveinvestitor');
        this.dodajZemljisceGumbModalnoOkno = page.locator('button[onclick*="modal_add_zemljisce"]');
        this.potrdiZemljisceGumbModalnoOkno = page.locator('button[onclick*="modal_save_zemljisce"]');
        this.modalBrisanjaInvestitorja = this.page.locator('.modal-content', {hasText: 'Brisanje podatkov o investitorjih'});

        // 4. Gumbi
        this.zapriVidnoSekcijoGumb = this.vidnaSekcija.locator('a.nabor-objects:has(i.fa-window-close)');
        this.shraniGumb = page.locator('.overlay-content a.btn').filter({ has: page.locator('i.fa-save') }).first();
        this.shraniGumb2 = page.locator('#save');
        this.shraniGumb3 = page.locator('button#save');
        this.dodajObjektGumb = page.locator("a#_addButton[onclick*=\"'objekt'\"]");
        this.dodajStavboGumb = page.locator('#addBuildingsBtn');
        this.zapriGumb = page.locator('#close');
        this.zapri2Gumb = page.locator('a.closebtn');
        this.zapriGumb3 = page.locator('button#close');
        this.gumbMeni = page.locator('a.toolbar-dropdown:has(i.fa-inbox)');
        this.isciGumb = page.locator('#searchButton');
        this.clearBtn = page.locator('#clearButton');
        this.clearDropdownBtn = page.locator(".select2-selection__clear");
        this.dodajGumb = page.locator('#addNewButton');
        this.shraniZemljisce = this.page.locator('#savezemljisce').first();
        this.potrdiZemljisce = this.page.locator('#savezemljisce', { hasText: 'Potrdi' });
        this.napredniMeni = page.locator('#advancedButton');
        this.urediGumb = page.locator('#edit');
        this.brisiGumb = page.locator('button#delete');
        this.dodajObjektiGumb = page.locator('a[onclick*="addEntryClick(\'objekt\')"]');
        this.HiskaGumb = page.locator('a.reg-naslov:has-text("home")');
        this.BrisiGumbInvestitor = this.page.locator('#tab-investitor a#_deleteButton');
        this.brisiGumbZemljisce = page.locator('#tab-zemljisca i.fa-trash-alt.table-icon');
        this.brisiGumbObjekti = page.locator('#tab-objekti i.fa-trash-alt.table-icon').first();
        this.brisiObjektGumb = this.vidnaSekcija.locator('a.nabor-objects:has(i.fa-trash-alt)');
        this.urediDokument = page.locator('#tab-dokumenti i.fa-edit.table-icon').first();
        this.urediDokumentVelik = this.page.locator('button#edit');
        this.brisiDokument = page.locator('#tab-dokumenti i.fa-trash-alt.table-icon').first();
        this.dodajZemljisceGumb = page.locator('#tab-zemljisca i.fa-plus.table-icon');
        this.brisiZemljisce = page.locator('#tab-zemljisca i.fa-trash-alt.table-icon').first();
        this.dodajGumbInvestitor = page.locator('#tab-investitor i.fa-plus.table-icon');
        this.DodajGumbObjekti = page.locator('#tab-objekti i.fa-plus.table-icon');
        this.dodajDokument = page.locator('#tab-dokumenti i.fa-plus.table-icon').first();
        this.dodajProjektnoDokumentacijo = page.locator('#tab-dokumenti i.fa-plus.table-icon').nth(0);
        this.shraniProjektnoDokumentacijo = this.saveDokumentButton = this.page.locator('button#savedokument');
        this.urediProjektnoDokumentacijo = page.locator('#tab-dokumenti i.fa-edit.table-icon').nth(1);
        this.brisiProjetnoDokumentacijo = page.locator('#tab-dokumenti i.fa-trash-alt.table-icon').nth(1);
        this.GumbShraniZemljisce = page.getByRole('button', {name: 'Dodaj'});
        this.GumbPotrdiZemljisce = page.getByRole('button', {name: 'Potrdi'});
        this.shraniObjekt = page.locator('#saveobjekt');
        this.gumbZapri = page.getByRole('button', { name: 'Zapri' }).filter({ state: 'visible' });
        this.potrdiGumb = page.locator('.modal-content:visible #saveobjekt');
        this.tabela = page.locator("#results");
        this.lokatorVidnih = page.locator('tr[resultrow="true"]:visible');
        this.homeGumb = page.locator('a.reg-naslov.material-icons', {hasText: 'home'});
        this.gumbSkrci = page.locator("#basicButton");
        this.prejsniGumbi = page.locator('li.page-item.first').first();
        this.naslednjiGumb = page.locator("a.page-link i.material-icons:has-text('chevron_right')").first();
        this.prejsniGumb = page.locator("a.page-link i.material-icons:has-text('chevron_left')").first();
        this.zadnjiGumb = page.locator("a.page-link i.material-icons:has-text('last_page')").first();
        this.prviGumb = page.locator("a.page-link i.material-icons:has-text('first_page')").first();
        this.dodajanjeAktaGumb = page.locator('#addNewButton:visible').first();
        this.izbrisZemljiscaGumb = page.locator('button#saveCountry[onclick*="delete_zemljisce"]');
        this.prijaviGumb = page.getByRole('button', { name: 'Prijavi' });
        this.izbraneVsebine = page.locator('div.card-header[data-target="#cloud_vrstniRedSlojev"] a.accordion-toggle').first();
        this.vsebinaIzbranihVsebin = this.page.locator('#vrstniRedSlojev li.list div.text');
        this.vrsticeSlojev = this.page.locator('#vrstniRedSlojev li.list:visible');
        this.aktivniCheckboxiIzbranihVsebin = this.page.locator('#vrstniRedSlojev li.list:visible i.checkbox.fas.fa-check-square');
        this.zapriParceleGumb = this.page.locator('xpath=//*[contains(@class, "text") and contains(text(), "Parcele") and contains(text(), "Kataster nepremičnin")]/..//i[contains(@class, "fa-times-circle")]');
        this.stavbaSloj = this.page.locator('xpath=//span[@id="POS_OBJ_STAVBE"]/ancestor::li[1]');
        this.obcinskiProstorskiNacrt = this.page.locator('xpath=//span[@id="PLAN_EVT_OBMOCJA_NPA_OPPN"]/ancestor::li[1]')
        this.parceleSloj = this.page.locator('xpath=//span[@id="PARCELE"]/ancestor::li[1]');
        this.DOF5Sloj = this.page.locator('xpath=//span[@id="DOF5"]/ancestor::li[1]//i[contains(@class, "list-checkbox")]');
        this.zoomInGumb = this.page.locator('button.ol-zoom-in');
        this.oknoLegende = this.page.locator('.card.legenda-card');
        this.zoomOutGumb = this.page.locator('button.ol-zoom-out');
        this.puscicaGor = this.page.locator('i.fa-chevron-up.nav-up');
        this.puscicaDol = this.page.locator('i.fa-chevron-down.nav-down');
        this.puscicaLevo = this.page.locator('i.fa-chevron-left.nav-left');
        this.puscicaDesno = this.page.locator('i.fa-chevron-right.nav-right');
        this.privzetiPogled = this.page.locator('i.fa-globe.nav-middle');
        this.miniMap = this.page.locator('button:has(i.fa-angle-double-right)');
        this.AParcele = this.page.locator('i.PARCELE_label');
        this.zapiranjeLegende = this.page.locator('i.legenda-close');
        this.legendaParcele = this.page.locator('li').filter({ has: this.page.locator('span, a, label', { hasText: /^Parcele$/ }) }).locator('i[title="Legenda"]').first();
        this.oknoLegendeParcele = this.page.locator('.modal-dialog, .popover, .card, div[role="dialog"], .legenda-card').filter({ hasText: /Legenda|Parcele/i }).first();
        this.premikLegende = this.page.locator('#legendaDrag');
        this.drsnikParceleArhiv = this.page.locator('#history-slider-handleparceleh');
        this.progaDrsnika = this.page.locator('#history-sliderparceleh');
        this.prejsniPogled = this.page.locator('i.fas.fa-arrow-left.faa-ring.animated-hover');
        this.naslednjiPogled = this.page.locator('i.fas.fa-arrow-right.faa-ring.animated-hover');
        this.izbiranje = this.page.locator('a.toolbar-dropdown.nav-link.dropdown-toggle').filter({ has: this.page.locator('i.fas.fa-inbox.faa-ring.animated-hover') })
        this.dodajParcelo = this.page.locator('a#addParcelsBtn');
        this.izbrani = this.page.locator('button#menuSelectedObjects');
        this.objektiUreditvePovrsin = this.page.locator('span.text', { hasText: 'Objekti in zunanja ureditev objekta' })
        this.urediIzbraneParcelegumb = this.page.locator('#editParcelsBtn');
        this.urediIzbraneStavbe = this.page.locator('#editBuildingsBtn');
        this.izbraneStavbeMenu = this.page.locator('.section.has-filter.izbira-parcel select');
        this.tarcaGumb = this.page.locator('i.fas.fa-crosshairs.pull-right').first();
        this.premakniCentroidGumb = this.page.locator('#moveParcelsCentroidBtn');
        this.poizvedovanjeVidniSloji = this.page.locator('div.dropdown-menu.show a.dropdown-item', { hasText: 'Poizvedovanje po vidnih slojih' });
        this.poizvedovanjeVsiSloji = this.page.locator('div.dropdown-menu.show a.dropdown-item', { hasText: 'Poizvedovanje po vseh slojih' });
        this.poizvedovanjeIzbraniSloj = this.page.locator('div.dropdown-menu.show a.dropdown-item', { hasText: 'Poizvedovanje po izbranem sloju' });
        this.opozoriloPraznePoizvedbe = this.page.locator('div.messenger-message-inner').filter({ hasText: 'Poizvedba nima rezultata' });
        this.opozoriloNapacnegaSloja = this.page.locator('.messenger-message-inner', { hasText: 'Poizvedba nima rezultata.' }).first();
        this.oknoPoizvedbe = this.page.locator('div.card.pis-card.identify-card');
        this.naslovOknaPoizvedbe = this.page.locator('h4.modal-title', { hasText: 'Poizvedovanje po vseh slojih' });
        this.oknoPoizvedbe2 = this.page.locator('#identifyDiv');
        this.oknoModalnegaOkna = this.page.locator('.modal', { has: this.page.locator('h4.modal-title', { hasText: 'Poizvedovanje po vseh slojih' }) });
        this.celotnaVsebina = this.page.locator('#cloud_legenda');
        this.vsiSlojiVVsebini = this.page.locator('#cloud_legenda li.list');
        this.lokacijskiFaktor = this.page.locator('#identifyDiv span.identifyTitle').filter({ hasText: 'Lokacijski faktor' });
        this.gumbZapriOkno = this.page.locator('i.icon-x.btn-close');
        this.kulturnaDediscina = this.page.locator('button[data-target="#varstvoKulturneDediscineCardCollapse"]');
        this.oznaciObjektItem = this.page.locator('.dropdown-item:has-text("Označi objekt")');
        this.nastavitveObmocja = this.page.locator('.dropdown-item:has-text("Nastavitve območja")');
        this.oknoNastavitveObmocja = this.page.locator('div.modal-dialog.ui-draggable:has(h4.modal-title:has-text("Nastavitve območja"))');
        this.gumbPotrdi = this.page.locator('button#btnDownload.btn.btn-primary:has-text("Potrdi")');
        this.pobrisiObmocje = this.page.locator('.dropdown-item:has-text("Pobriši območje")');
        this.zadnjiElementVsebnika = this.page.locator('#identifyDiv .list-group:last-child .list-group-item').last();
        this.rezultatnaTabelaDokumentov = this.page.locator('#tab-dokumenti_results tr[resultrow="true"]');

        // 5. Input polja
        this.vnosnoPolje = page.locator('.select2-search__field');
        this.vnosnoPolje2 = page.locator('input.select2-search__field');
        this.CCSI_objekti = page.locator('#select2-objekt_cc_si-container');
        this.VnosStZadeve = page.locator('input#stInput');
        this.stevilkaZadeveInput = page.locator('#stInput');
        this.IDUpravnegaAkta = page.locator('#idInput');
        this.letoInput = page.locator('input#letoIzdajeInput');
        this.vrstaUpravnegaAkta = page.locator("span[aria-labelledby='select2-vrstaAktaInput-container']");
        this.vrstaUpravnegaOrgana = page.locator("span[aria-labelledby='select2-upravniOrganInput-container']");
        this.poljeVir = page.locator('#virNaziv');
        this.datumPrijInput = page.locator('#datum_prijave_zacetka');
        this.parcelnaStInput = page.locator('#select2-zemljisce_parcelna_st-container');
        this.brutoPovrsinaInput = page.locator('#objekt_bruto_povrsina');
        this.vrstaPostopkaInput = page.locator('#vrstaPostopka');
        this.CsvInput = page.locator('#zemljiscaFileUpload');
        this.uporabniskoImeInput = page.locator('input[name="j_username"]');
        this.gesloInput = page.locator('input[name="j_password"]');
        this.iskalnik = this.page.locator('div.filter:has(fa-search), div.filter:has(.fa-search)').locator('input[type="text"]');
        this.iskalnikUrejanjeParcel = this.page.locator('div.section.editParcels div.filter input[type="text"]');
        this.iskalnik2 = this.page.locator('div.filter:has(i.fas.fa-search) input[type="text"]').filter({ visible: true }).first();
        this.inputBuffer = this.page.locator('input#highlightBufferInputField');
        this.stevilkaZadeveInput = page.locator('#stevilkaZadeve');
        this.stevilkaDokumenta = this.page.locator('#dokument_st');


        // 6. Dropdowni
        this.virDropdown = page.locator('span.select2-selection--single').filter({
            has: page.locator('#select2-virInput-container')
        });
        this.obcinaDropdown = page.locator('span.select2-selection--single').filter({
            has: page.locator('#select2-obcinaInput-container')
        });
        this.obcina2Dropdown = page.locator('#select2-zemljisce_obcina-container');
        this.nosilecDropdown = page.locator('span.select2-selection--single').filter({
            has: page.locator('#select2-nosilecInput-container')
        });
        this.oznakaDropdown = page.locator('span.select2-selection--single').filter({
            has: page.locator('#select2-oznakaGPInput-container')
        });
        this.meniDropdown = page.locator('.select2-dropdown:visible');
        this.statusDropdown = this.shraniInvestitorjaModalnoOkno.locator('#investitor_status');
        this.meriloDropdown = this.page.locator('i.fa-caret-up[data-toggle="dropdown"]');
        this.opcijaMerilo = this.page.getByText('1 : 1 500 000', { exact: true });
        this.merjeje = this.page.locator('a.toolbar-dropdown.nav-link.dropdown-toggle').filter({ has: this.page.locator('i.fas.fa-ruler.faa-ring.animated-hover') })
        this.merjenjeDropdown = this.page.locator('div.dropdown-menu.show');
        this.izbiranjeDropdown = this.page.locator('li.nav-item.dropdown:has(i.fas.fa-inbox) a.dropdown-toggle');
        this.poizvedovanjeDropdown = this.page.locator('li.nav-item.dropdown:has(i.fas.fa-info) a.dropdown-toggle');
        this.meritveDropdown = this.page.locator('a.toolbar-dropdown.nav-link.dropdown-toggle:has(i.fas.fa-ruler.faa-ring.animated-hover)');
        this.merjenjeRazdaljeGumb = this.page.locator('a.dropdown-item:has-text("Merjenje razdalje")');
        this.merjenjePovrsineGumb = this.page.locator('a.dropdown-item:has-text("Merjenje površine")');
        this.pobrisiMeritveGumb = this.page.locator('a.dropdown-item.active:has-text("Pobriši meritve")');
        this.oznaciObjektDropdown = this.page.locator('.toolbar-dropdown.nav-link.dropdown-toggle:has(i.fas.fa-hand-pointer)')
        this.objektDropdown = this.page.locator('select').filter({ hasText: '... izberi objekt ...' });


        // 7. Tabela in rezultati
        this.vrsteTabele = page.locator('tbody tr');
        this.tabelaZemljisc = page.locator('#tab-zemljisca_results');

        // 8. Checkboxi
        this.checkboxObrisStavbe = page.locator('*').filter({ hasText: 'Obris stavbe' }).locator('i.list-checkbox').first();
        this.checkboxObrisVPostopku = page.locator('*').filter({ hasText: 'Obris stavbe (v postopku)' }).locator('i.list-checkbox').first();
        this.checkboxIkona = page.locator('xpath=//span[text()="rekonstrukcija"]/preceding-sibling::i[contains(@class, "checkbox")]');
        this.ikonaCheckboxAlternativa = page.locator('xpath=//span[text()="rekonstrukcija"]/following-sibling::i[contains(@class, "checkbox")]');
        this.checkboxNovogradnja = page.locator('input#vrsta_del_1');
        this.checkboxStavbe = this.page.locator('li', { hasText: 'Stavbe' }).locator('i.list-checkbox').first();
        this.checkboxParcele = this.page.locator('xpath=//span[@id="PARCELE"]/ancestor::li[1]//i[contains(@class, "list-checkbox")]');
        this.checkboxArhivParcel = this.page.locator('xpath=//span[contains(text(), "Parcele Arhiv") or @id="PARCELE_ARHIV"]/ancestor::li[1]//i[contains(@class, "list-checkbox")]');
        this.checkboxObjekti = this.page.locator('xpath=//span[contains(text(), "Objekti in zunanja ureditev objekta")]/ancestor::li[1]//i[contains(@class, "list-checkbox")]');

        // 9. Paginacija (strani)
        this.naslednjaStranBtn = page.locator('a.page-link i.material-icons:has-text("chevron_right")');
        this.prejsnjaStranBtn = page.locator('a.page-link i.material-icons:has-text("chevron_left")');
        this.zadnjaStranBtn = page.locator('a.page-link i.material-icons:has-text("last_page")');
        this.prvaStranBtn = page.locator('a.page-link i.material-icons:has-text("first_page")');

        // 10. V grafiki
        this.gumbIskanjePoObmocju = page.locator('i[title="Iskanje po območju"]');
        this.opcijaNaSeznamu = page.locator('.ui-menu-item').filter({ hasText: "Gorenjska (Statistična Regija)" }).first();
        this.vnosnoPoljeIskanjePoObmocju = page.locator('input[placeholder="Vnesite ime območja"]');
        this.drsnikThumb = page.locator('.ol-zoomslider-thumb');
        this.drsnikParent = page.locator('.ol-zoomslider');
        this.posamezniObjekti = this.page.locator('li', { hasText: 'Posamezni objekti' }).locator('i.list-checkbox').first();
        this.stavbe = page.locator('li').filter({ hasText: "Stavbe" }).locator('i.root-checkbox').first();
        this.mapa = page.locator('canvas.ol-unselectable').first();
        this.mapa2 = page.locator('.ol-viewport').first();
    }

    dobiVrsticoPoID(trenutniID) {
        return this.page.locator('tr[resultrow="true"]').filter({
            has: this.page.locator('td').first().filter({ hasText: new RegExp(`^${trenutniID}$`) })
        }).first();
    }

    dobiOpcijoPoRegexu(regexOpcije) {
        return this.page.locator('.select2-results__option', { hasText: regexOpcije });
    }
}