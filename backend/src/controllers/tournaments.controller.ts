import { Role } from "../constants/const";
import type { Request, Response } from "express";
import { CreateTournamentDTO } from "../schemas/tournaments.schema";
import {
  formatDateForDaterange,
  gymScope,
  subtractDays,
  validateDates,
} from "../utils/utils";
import { IdDTO } from "../schemas/id.schema";
import {
  DeleteMemberFromTournamentDTO,
  GetMembersTournamentsByGymDTO,
  GetMembersTournamentsDTO,
} from "../schemas/members_tournaments.schema";
import { env } from "../config/env";
import { sheetsService, tournamentService } from "../services/index.service";
import { PageDTO } from "../schemas/page.schema";

export const getTournamentsByDate = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const tournaments = await tournamentService.getByDate();
  res
    .status(200)
    .json({ message: "Torneos obtenidos correctamente", tournaments });
};

export const getPastTournamentsByDate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedPage = PageDTO.parse(Number(req.query.page));
  const { tournaments, totalCount, hasMore } =
    await tournamentService.getPastByDate(parsedPage);
  res.status(200).json({
    message: "Torneos obtenidos correctamente",
    tournaments,
    paginationInfo: {
      totalCount,
      hasMore,
      page: parsedPage,
    },
  });
};

export const getOneTournament = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedId = IdDTO.parse(Number(req.params.id));

  const tournament = await tournamentService.getById(parsedId);
  if (!tournament) {
    res.status(404).json({ error: "Torneo no encontrado" });
    return;
  }
  res
    .status(200)
    .json({ message: "Torneo obtenido correctamente", tournament });
};
export const createTournament = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedTournament = CreateTournamentDTO.parse(req.body);

  const { name, startDate, endDate, inscription_date_end } =
    parsedTournament;

  const areDatesValid = validateDates(
    startDate,
    endDate,
    inscription_date_end,
  );
  if (!areDatesValid) {
    res.status(400).json({
      error:
        "Las fechas no son válidas. La fecha de finalización debe ser igual o posterior a la fecha de inicio y el último día de inscripción menor al inicio",
    });
    return;
  }

  const tournament = await tournamentService.create({
    name,
    startDate,
    endDate,
    inscription_date_end,
  });
  res
    .status(201)
    .json({ message: "Torneo creado correctamente", tournament });
};

export const updateTournament = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedId = IdDTO.parse(Number(req.params.id));

  const parsedTournament = CreateTournamentDTO.parse(req.body);

  const { name, startDate, endDate } = parsedTournament;

  const parsedDate = formatDateForDaterange({ startDate, endDate });
  const inscriptionDateEnd = subtractDays(startDate);
  const tournament = await tournamentService.update(parsedId, {
    name,
    date_range: parsedDate,
    inscriptionDateEnd,
  });

  if (!tournament) {
    res.status(404).json({ error: "Torneo no encontrado" });
    return;
  }
  res
    .status(200)
    .json({ message: "Torneo actualizado correctamente", tournament });
};

export const deleteTournament = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedId = IdDTO.parse(Number(req.params.id));
  const deletedTournament = await tournamentService.delete(parsedId);
  if (!deletedTournament) {
    res.status(404).json({ error: "Torneo no encontrado" });
    return;
  }

  res.status(200).json({ message: "Torneo eliminado correctamente" });
};

export const getMembersTournamentsByGym = async (
  req: Request,
  res: Response,
) => {
  const parsedData = GetMembersTournamentsByGymDTO.parse({
    id_gym: Number(req.params.gid),
    id_tournament: Number(req.params.tid),
    id_level: Number(req.params.lid),
    id_category: Number(req.params.cid),
    page: Number(req.query.page),
  });
  if (
    parsedData.id_gym !== req.user?.userId &&
    req.user?.role !== Role.ADMIN
  ) {
    res.status(403).json({
      error:
        "No tienes permiso para ver los alumnos registrados a este torneo",
    });
    return;
  }
  const offset = (parsedData.page - 1) * 20;
  const membersTournaments =
    await tournamentService.getMembersTournamentByGym(
      parsedData,
      offset,
    );
  const total =
    membersTournaments.length > 0 ? membersTournaments[0].total_count : 0;
  res.status(200).json({
    message: "Alumnos registrados al torneo obtenidos correctamente",
    membersTournaments,
    pagination: {
      total,
      page: parsedData.page,
      perPage: 20,
      totalPages: Math.ceil(total / 20),
    },
  });
};

export const getMembersNotInTournaments = async (
  req: Request,
  res: Response,
) => {
  const parsedData = GetMembersTournamentsByGymDTO.parse({
    id_gym: Number(req.params.gid),
    id_tournament: Number(req.params.tid),
    id_level: Number(req.params.lid),
    id_category: Number(req.params.cid),
    page: Number(req.query.page),
  });
  if (
    parsedData.id_gym !== req.user?.userId &&
    req.user?.role !== Role.ADMIN
  ) {
    res.status(403).json({
      error:
        "No tienes permiso para ver los alumnos registrados a este torneo",
    });
    return;
  }
  const offset = (parsedData.page - 1) * 20;
  const members = await tournamentService.getMembersNotInTournament(
    parsedData,
    offset,
  );

  const total = members.length > 0 ? members[0].total_count : 0;
  res.status(200).json({
    message: "Alumnos NO registrados al torneo obtenidos correctamente",
    members,
    pagination: {
      total,
      page: parsedData.page,
      perPage: 20,
      totalPages: Math.ceil(total / 20),
    },
  });
};

export const redirectToGoogleSheets = async (req: Request, res: Response) => {
  const parsedId = IdDTO.parse(Number(req.params.tid));
  const tournament = await tournamentService.getById(parsedId);
  if (!tournament) {
    res.status(404).json({ error: "Torneo no encontrado" });
    return;
  }
  const encodedName = encodeURIComponent(tournament.name);
  const scriptUrl = `${env.SHEETS_SCRIPT_URL}?sheet=${encodedName}`;

  res.status(200).json({ scriptUrl });
};

export const postDataOnSheets = async (req: Request, res: Response) => {
  const parsedId = IdDTO.parse(Number(req.params.tid));
  const url = await sheetsService.exportTournamentToSheet(parsedId);

  res.status(200).json({ message: "Datos enviados correctamente", url });
};

export const getMembersTournamentByCategoryAndLevel = async (
  req: Request,
  res: Response,
) => {
  const parsedData = GetMembersTournamentsDTO.parse({
    id_category: Number(req.params.cid),
    id_level: Number(req.params.lid),
    id_tournament: Number(req.params.tid),
    page: Number(req.query.page ?? 1),
  });
  const offset = (parsedData.page - 1) * 20;
  const membersTournaments =
    await tournamentService.getMembersTournamentByCategoryAndLevel(
      parsedData,
      offset,
    );

  if (membersTournaments.length === 0) {
    res.status(404).json({
      error:
        "No se encontraron alumnos registrados a este torneo con los parámetros ingresados",
    });
    return;
  }
  const total = membersTournaments[0].total_count;
  res.status(200).json({
    message: "Alumnos registrados al torneo obtenidos correctamente",
    membersTournaments,
    pagination: {
      total: total,
      page: parsedData.page,
      perPage: 20,
      totalPages: Math.ceil(total / 20),
    },
  });
};

export const deleteMemberFromTournament = async (
  req: Request,
  res: Response,
) => {
  const parsedData = DeleteMemberFromTournamentDTO.parse({
    id_member: Number(req.params.mid),
    id_tournament: Number(req.params.tid),
  });

  const deletedMemberTournament = await tournamentService.deleteMemberFromTournament(
    parsedData.id_member, parsedData.id_tournament, gymScope(req)
  );
  if (!deletedMemberTournament) {
    res.status(404).json({
      error: "Torneo y/o alumno no encontrado(s), o la inscripción ya cerró",
    });
    return;
  }

  res.status(200).json({
    message: "Alumno y torneo actualizados correctamente",
  });
};
