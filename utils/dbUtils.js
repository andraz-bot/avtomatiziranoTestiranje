import dotenv from 'dotenv';
import oracledb from 'oracledb';

dotenv.config();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
  user          : process.env.DB_USER,
  password      : process.env.DB_PASS,
  connectString : process.env.DB_CONN
};

/**
 * Preveri in izbriše stavbo s specifično številko iz baze.
 * @param {string|number} stevilkaStavbe
 */
export async function izbrisStavbe(katastrskaObcinaId) {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // Poiščemo absolutno zadnjo vnešeno stavbo za to katastrsko občino (po ID-ju)
    const selectSql = `SELECT * FROM (
                                       SELECT STAVBA_EGR_ID, STAVBA_EGR_STEVILKA
                                       FROM PIS_GRAD_POS.STAVBE_EGRADITEV
                                       WHERE KATASTRSKA_OBCINA_ID = :ko
                                       ORDER BY STAVBA_EGR_ID DESC
                                     ) WHERE ROWNUM = 1`;

    const selectResult = await connection.execute(selectSql, { ko: katastrskaObcinaId });

    if (selectResult.rows.length === 0) {
      console.log(`[OPOZORILO] V KO ${katastrskaObcinaId} ni nobene stavbe za brisanje.`);
      return false;
    }

    const stavbaId = selectResult.rows[0].STAVBA_EGR_ID;
    const stavbaStevilka = selectResult.rows[0].STAVBA_EGR_STEVILKA;

    console.log(`[BRISANJE] Najdena zadnja dinamična stavba (Št: ${stavbaStevilka}, ID: ${stavbaId}). Čistim...`);

    // 1. Brišemo iz prve podrejene tabele
    await connection.execute(
        `DELETE FROM PIS_GRAD_POS.DELI_STAVB_EGRADITEV WHERE STAVBA_EGR_ID = :id`,
        { id: stavbaId },
        { autoCommit: true }
    );

    // 2. Brišemo iz druge podrejene tabele
    await connection.execute(
        `DELETE FROM PIS_GRAD_POS.OBSTOJECI_OBJEKTI_EGRADITEV WHERE STAVBA_EGR_ID = :id`,
        { id: stavbaId },
        { autoCommit: true }
    );

    // 3. Brišemo glavno stavbo
    await connection.execute(
        `DELETE FROM PIS_GRAD_POS.STAVBE_EGRADITEV WHERE STAVBA_EGR_ID = :id`,
        { id: stavbaId },
        { autoCommit: true }
    );

    console.log(`[USPEH] Zadnja stavba (ID: ${stavbaId}) uspešno očiščena iz baze.`);
    return true;

  } catch (err) {
    console.error("Napaka pri brisanju zadnje stavbe:", err);
    return false;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}