import { request } from "./authQueries";

const URL_API = `${(import.meta.env.VITE_URL_BACK_DEPLOY ?? "/api")}/members`;

export const getMembersByGym = (
  paramsPayload: Params,
  gymId: number,
  page: number = 1
): Promise<GetMembersByGymResponse> => {
  const params = new URLSearchParams({ page: page.toString() });

  Object.entries(paramsPayload).forEach(([key, value]) => {
    if (typeof value === "number" && value > 0)
      params.append(key, value.toString());
    else if (value) params.append(key, value);
  });
  return request(`${URL_API}/${gymId}?${params}`);
};

export const createMember = (
  member: CreateMember
): Promise<CreateMemberResponse> =>
  request(URL_API, { method: "POST", body: member });

export const updateMember = (
  id: number,
  member: CreateMember
): Promise<CreateMemberResponse> =>
  request(`${URL_API}/${id}`, { method: "PATCH", body: member });

export const deleteMember = (id: number): Promise<{ message: string }> =>
  request(`${URL_API}/${id}`, { method: "DELETE" });

export const registerToTournament = ({
  id_member,
  id_tournament,
}: RegisterToTournamentData): Promise<RegisterToTournamentResponse> =>
  request(`${URL_API}/${id_member}/tournament/${id_tournament}`, {
    method: "POST",
  });
