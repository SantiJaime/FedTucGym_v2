import env from "../config/env";
import { request } from "./authQueries";

const URL = `${env.URL_BACK_DEPLOY}/puntajes`;
const T_URL = `${env.URL_BACK_DEPLOY}/tournaments`;

export const redirectToGoogleSheets = (
  id: number
): Promise<{ scriptUrl: string }> => request(`${T_URL}/${id}/sheets`);

export const getScoresByLevelAndCategory = (
  { id_category, id_level, id_tournament }: FilterScoresData,
  page: number
): Promise<GetScoresByLevelAndCategoryResponse> =>
  request(
    `${URL}/tournament/${id_tournament}/category/${id_category}/level/${id_level}?page=${page}`
  );

export const getScoresByLevelCategoryAndGym = (
  { id_category, id_level, id_tournament, id_gym }: FilterScoresData,
  page: number
): Promise<GetScoresByLevelAndCategoryResponse> =>
  request(
    `${URL}/tournament/${id_tournament}/category/${id_category}/level/${id_level}/gym/${id_gym}?page=${page}`
  );

export const createScore = (
  data: CreateScoreData
): Promise<CreateScoreResponse> =>
  request(`${URL}/${data.id_member}/tournament/${data.id_tournament}`, {
    method: "POST",
    body: { puntaje: data.puntaje },
  });
