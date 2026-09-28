/**
 * Pomožna funkcija za izvajanje korakov z ulovom napak (soft assertions)
 * @param {string} imeKoraka - Opis koraka, ki se izvaja
 * @param {Function} akcija - Asinhrona funkcija (korak testa)
 * @param {Object} kontekst - Objekt strani (npr. SeznamPage), ki vsebuje polje napake
 */
export async function poskusi(imeKoraka, akcija, kontekst) {
    try {
        await akcija();
        console.log(`✅ USPEŠNO: ${imeKoraka}`);
    } catch (error) {
        console.error(`❌ NAPAKA pri: ${imeKoraka} ->`, error.message);

        // Če ima Page Object inicializirano tabelo napak, jo napolnimo
        if (kontekst && Array.isArray(kontekst.napake)) {
            kontekst.napake.push(`${imeKoraka}: ${error.message}`);
        }
    }
}