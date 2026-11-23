import { request } from "./authQueries";

const URL = `${import.meta.env.VITE_URL_BACK_DEPLOY}/tournaments`;

export const getTournaments = (): Promise<GetTournamentsResponse> =>
  request(`${URL}/date`);

export const getPastTournaments = (
  page: number = 1
): Promise<GetTournamentsResponse> => request(`${URL}/date/past?page=${page}`);

export const createTournament = (
  tournament: CreateTournament
): Promise<CreateTournamentResponse> =>
  request(URL, { method: "POST", body: tournament });

export const deleteTournament = (id: number): Promise<{ message: string }> =>
  request(`${URL}/${id}`, { method: "DELETE" });

export const getMembersTournaments = (
  { id_tournament, id_category, id_level }: FilterScoresData & { id_tournament: number },
  page: number
): Promise<GetMembersTournamentsResponse> =>
  request(
    `${URL}/${id_tournament}/category/${id_category}/level/${id_level}?page=${page}`
  );

export const getMembersTournamentsByGym = (
  { id_tournament, id_gym, id_category, id_level }: FilterScoresData & { id_gym: number; id_tournament: number },
  page: number
): Promise<GetMembersTournamentsResponse> =>
  request(
    `${URL}/${id_tournament}/category/${id_category}/level/${id_level}/gym/${id_gym}?page=${page}`
  );

export const getMembersNotInTournament = (
  { id_tournament, id_gym, id_category, id_level }: FilterScoresData & { id_gym: number; id_tournament: number },
  page: number
): Promise<GetMembersByGymResponse> =>
  request(
    `${URL}/not-in/${id_tournament}/category/${id_category}/level/${id_level}/gym/${id_gym}?page=${page}`
  );

export const deleteMemberFromTournament = ({
  id_tournament,
  id_member,
}: DeleteMemberFromTournamentData): Promise<{ message: string }> =>
  request(`${URL}/${id_tournament}/member/${id_member}`, { method: "DELETE" });
