import { Role } from "../constants/const";
import type { Request, Response } from "express";
import { IdDTO } from "../schemas/id.schema";
import {
  buildCountMembersQuery,
  buildMembersQuery,
  gymScope,
  toNumberOrUndefined,
} from "../utils/utils";
import { CreateMemberDTO, FilterMembersDTO } from "../schemas/members.shema";
import { calcularEdadYCategoriaAl31Dic } from "../utils/categories";
import { RegisterMembersTournamentsDTO } from "../schemas/members_tournaments.schema";
import { membersService } from "../services/index.service";

export const getMembersByGym = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedId = IdDTO.parse(Number(req.params.gid));
  const parsedFilters = FilterMembersDTO.parse({
    ...req.query,
    id_category: toNumberOrUndefined(req.query.id_category),
    id_level: toNumberOrUndefined(req.query.id_level),
    dni: toNumberOrUndefined(req.query.dni),
    page: Number(req.query.page),
  });
  if (
    req.user?.role !== Role.ADMIN &&
    parsedId !== req.user?.userId
  ) {
    res.status(403).json({
      error: "No tienes permiso para ver los miembros de este gimnasio",
    });
    return;
  }

  const { query, values } = buildMembersQuery(
    parsedFilters,
    parsedId,
    parsedFilters.page,
  );
  const { countQuery, values: countValues } = buildCountMembersQuery(
    parsedFilters,
    parsedId,
  );
  const { data: members, total } = await membersService.getByGymId(
    query,
    values,
    countQuery,
    countValues,
  );
  if (members.length === 0) {
    res.status(404).json({
      error:
        "No se encontraron alumnos alumnos con los parámetros ingresados",
    });
    return;
  }
  res.status(200).json({
    message: "Alumnos obtenidos correctamente",
    members,
    pagination: {
      total,
      page: parsedFilters.page || 1,
      perPage: 20,
      totalPages: Math.ceil(total / 20),
    },
  });
};

export const getOneMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedId = IdDTO.parse(Number(req.params.mid));

  const member = await membersService.getById(parsedId, gymScope(req));
  if (!member) {
    res.status(404).json({ error: "Alumno no encontrado" });
    return;
  }
  res.status(200).json({ message: "Alumno obtenido correctamente", member });
};

export const createMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedMember = CreateMemberDTO.parse(req.body);

  const scope = gymScope(req);
  if (scope !== null && parsedMember.id_gym !== scope) {
    res.status(403).json({
      error: "No tienes permiso para crear alumnos en este gimnasio",
    });
    return;
  }

  const { age, id_category } = calcularEdadYCategoriaAl31Dic(
    parsedMember.birth_date,
  );

  if (age < 2 || id_category === null) {
    res.status(400).json({
      error: "El alumno debe tener al menos 2 años para poder ser registrado",
    });
    return;
  }

  const member = await membersService.create({
    ...parsedMember,
    age,
    id_category,
  });
  res.status(201).json({ message: "Alumno creado correctamente", member });
};

export const updateMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedId = IdDTO.parse(Number(req.params.id));

  const parsedMember = CreateMemberDTO.parse(req.body);

  const member = await membersService.update(
    parsedId,
    parsedMember,
    gymScope(req),
  );
  if (!member) {
    res.status(404).json({ error: "Alumno no encontrado" });
    return;
  }
  res
    .status(200)
    .json({ message: "Alumno actualizado correctamente", member });
};

export const deleteMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedId = IdDTO.parse(Number(req.params.id));

  const deletedMember = await membersService.delete(
    parsedId,
    gymScope(req),
  );
  if (!deletedMember) {
    res.status(404).json({ error: "Alumno no encontrado" });
    return;
  }
  res.status(200).json({ message: "Alumno eliminado correctamente" });
};

export const registerMemberToTournament = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedIds = RegisterMembersTournamentsDTO.parse({
    id_member: Number(req.params.mid),
    id_tournament: Number(req.params.tid),
  });

  const member = await membersService.registerToTournament(
    parsedIds.id_member,
    parsedIds.id_tournament,
    gymScope(req),
  );
  if (!member) {
    res.status(404).json({
      error: "Alumno y/o torneo no encontrado, o la inscripción ya cerró",
    });
    return;
  }
  res
    .status(200)
    .json({ message: "Alumno registrado correctamente", member });
};

export const updateMembersCategory = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  await membersService.updateCategory();
  res.status(200).json({ message: "Categorías actualizadas correctamente" });
};
