import { env } from "../config/env";
import pool from "../database/db.config";
import { AppError } from "../errors/app.error";
import { tournamentService } from './index.service';

// Sheets interpreta como fórmula el texto que empieza con estos caracteres; ' lo fuerza a texto.
const escapeFormula = (value: unknown) =>
  typeof value === "string" && /^\s*[=+\-@]/.test(value) ? `'${value}` : value;

export default class GoogleSheetsService {
  // Solo marca los torneos exportados con éxito: los que fallan se reintentan al día siguiente.
  public async exportPendingTournaments(): Promise<void> {
    const { rows } = await pool.query<{ id: number }>(
      `SELECT id FROM tournaments
       WHERE exported_at IS NULL
         AND inscription_date_end < (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date
       ORDER BY id`,
    );

    for (const { id } of rows) {
      try {
        await this.exportTournamentToSheet(id);
        await pool.query("UPDATE tournaments SET exported_at = NOW() WHERE id = $1", [id]);
        console.log(`Exportación automática del torneo ${id} completada`);
      } catch (error) {
        console.error(
          `Error al exportar el torneo ${id}:`,
          error instanceof Error ? error.message : "desconocido",
        );
      }
    }
  }

  public async exportTournamentToSheet(tournamentId: number): Promise<string> {
    const { membersTournaments, tournamentName } =
      await tournamentService.getAllRegisteredMembersByTournament(tournamentId);

    const scriptUrl = env.SHEETS_SCRIPT_URL;

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Apps Script no expone los headers en doPost: el secreto va en el cuerpo.
      body: JSON.stringify({
        secret: env.SHEETS_SECRET,
        membersTournaments: membersTournaments.map((member) =>
          Object.fromEntries(
            Object.entries(member).map(([key, value]) => [key, escapeFormula(value)]),
          ),
        ),
        tournamentName,
      }),
    });

    if (!response.ok) {
      console.error("Google Sheets respondió con estado", response.status);
      throw AppError.badGateway("No se pudieron enviar los datos a Google Sheets");
    }

    const data = await response.json();

    return data.url;
  }
}
