import { QueryResult } from "pg";
import pool from "../database/db.config";
import {
  GetMembersTournamentByGym,
  GetMembersTournaments,
  MembersTournamentsView,
  ScoresMembersTournaments,
} from "../schemas/members_tournaments.schema";
import type {
  CreateTournament,
  Tournament,
} from "../schemas/tournaments.schema";

interface PaginatedTournaments {
  tournaments: Tournament[];
  totalCount: number;
  hasMore: boolean;
}

export default class TournamentService {
  public async getByDate(): Promise<Tournament[]> {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
    });
    const { rows }: QueryResult<Tournament> = await pool.query(
      "SELECT * FROM tournaments WHERE inscription_date_end >= $1 ORDER BY inscription_date_end ASC, id ASC",
      [formattedDate],
    );
    return rows;
  }

  public async getPastByDate(
    page = 1,
    limit = 10,
  ): Promise<PaginatedTournaments> {
    const offset = (page - 1) * limit;
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
    });
    const [tournamentResult, countResult]: [
      QueryResult<Tournament>,
      QueryResult<{ total: number }>,
    ] = await Promise.all([
      pool.query(
        `SELECT * FROM tournaments 
       WHERE inscription_date_end < $1
       ORDER BY LOWER(date_range) DESC, id DESC
       LIMIT $2 OFFSET $3`,
        [formattedDate, limit, offset],
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM tournaments 
       WHERE inscription_date_end < $1`,
        [formattedDate],
      ),
    ]);

    const tournaments = tournamentResult.rows;
    const totalCount = Number(countResult.rows[0].total);
    const hasMore = page * limit < totalCount;

    return {
      tournaments,
      totalCount,
      hasMore,
    };
  }

  public async getById(id: number): Promise<Tournament | undefined> {
    const { rows }: QueryResult<Tournament> = await pool.query(
      "SELECT name FROM tournaments WHERE id = $1",
      [id],
    );
    return rows[0];
  }

  public async create(tournamentData: CreateTournament): Promise<Tournament> {
    const { name, startDate, endDate, inscription_date_end } = tournamentData;

    const { rows }: QueryResult<Tournament> = await pool.query(
      "INSERT INTO tournaments (name, date_range, inscription_date_end) VALUES ($1, daterange($2, $3, '[]'), $4) RETURNING *",
      [name, startDate, endDate, inscription_date_end],
    );
    return rows[0];
  }

  public async update(
    id: number,
    tournamentData: Omit<Tournament, "id">,
  ): Promise<Tournament | undefined> {
    const { name, date_range, inscriptionDateEnd } = tournamentData;
    const { rows } = await pool.query(
      "UPDATE tournaments SET name = $1, date_range = $2, inscription_date_end = $3 WHERE id = $4 RETURNING *",
      [name, date_range, inscriptionDateEnd, id],
    );
    return rows[0];
  }

  public async delete(id: number): Promise<boolean> {
    const { rowCount } = await pool.query(
      "DELETE FROM tournaments WHERE id = $1",
      [id],
    );
    return !!rowCount && rowCount > 0;
  }
  public async getMembersTournamentByGym(
    parsedIds: GetMembersTournamentByGym,
    offset: number,
  ): Promise<MembersTournamentsView[]> {
    const { id_tournament, id_category, id_level, id_gym } = parsedIds;
    const { rows }: QueryResult<MembersTournamentsView> = await pool.query(
      "SELECT * FROM get_members_tournaments_by_gym($1, $2, $3, $4, $5, $6);",
      [id_tournament, id_category, id_level, id_gym, 20, offset],
    );
    return rows;
  }

  public async getAllMembersByTournament(id_tournament: number): Promise<{
    membersTournaments: ScoresMembersTournaments[];
    tournamentName: string;
  }> {
    const [tournamentNameResult, membersResult]: [
      QueryResult<{ name: string }>,
      QueryResult<ScoresMembersTournaments>,
    ] = await Promise.all([
      pool.query("SELECT name FROM tournaments WHERE id = $1", [
        id_tournament,
      ]),
      pool.query("SELECT * FROM get_members_tournaments($1)", [
        id_tournament,
      ]),
    ]);

    const tournamentName = tournamentNameResult.rows[0].name || "";
    return {
      tournamentName,
      membersTournaments: membersResult.rows,
    };
  }
  public async getAllRegisteredMembersByTournament(
    id_tournament: number,
  ): Promise<{
    membersTournaments: ScoresMembersTournaments[];
    tournamentName: string;
  }> {
    const [tournamentNameResult, membersResult]: [
      QueryResult<{ name: string }>,
      QueryResult<ScoresMembersTournaments>,
    ] = await Promise.all([
      pool.query("SELECT name FROM tournaments WHERE id = $1", [
        id_tournament,
      ]),
      pool.query("SELECT * FROM get_registered_members_by_tournament($1)", [
        id_tournament,
      ]),
    ]);

    const tournamentName = tournamentNameResult.rows[0].name;
    return {
      tournamentName,
      membersTournaments: membersResult.rows,
    };
  }

  public async getMembersTournamentByCategoryAndLevel(
    parsedIds: GetMembersTournaments,
    offset: number,
  ): Promise<MembersTournamentsView[]> {
    const { id_tournament, id_category, id_level } = parsedIds;
    const { rows }: QueryResult<MembersTournamentsView> = await pool.query(
      "SELECT * FROM get_members_tournaments_by_category_and_level($1, $2, $3, $4, $5);",
      [id_tournament, id_category, id_level, 20, offset],
    );
    return rows;
  }

  public async getMembersNotInTournament(
    parsedIds: GetMembersTournamentByGym,
    offset: number,
  ): Promise<FullMemberInfo[]> {
    const { id_tournament, id_gym, id_category, id_level } = parsedIds;
    const { rows }: QueryResult<FullMemberInfo> = await pool.query(
      "SELECT * FROM get_available_members_for_tournament($1, $2, $3, $4, $5, $6);",
      [id_tournament, id_category, id_level, id_gym, 20, offset],
    );
    return rows;
  }

  public async deleteMemberFromTournament(
    id_member: number,
    id_tournament: number,
    gymId: number | null,
  ): Promise<boolean> {
    const { rowCount } = await pool.query(
      `DELETE FROM members_tournaments mt USING members m, tournaments t
       WHERE mt.id_member = m.id AND t.id = mt.id_tournament
         AND mt.id_member = $1 AND mt.id_tournament = $2
         AND ($3::int IS NULL OR (
           m.id_gym = $3
           AND t.inscription_date_end >= (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date
         ))`,
      [id_member, id_tournament, gymId],
    );
    return !!rowCount && rowCount > 0;
  }
}
