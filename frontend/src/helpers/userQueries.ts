import type { LoginFormData } from "../validation/loginValidatorSchema";
import type { RegisterFormData } from "../validation/registerValidatorSchema";
import { request } from "./authQueries";

const URL = `${import.meta.env.VITE_URL_BACK_DEPLOY}/users`;

const toUserInfo = (
  raw: MeResponse["user"] | UserInfo
): UserInfo | null => {
  const userId = "userId" in raw ? raw.userId : raw.id;
  if (!userId || !raw.full_name || !raw.role) return null;
  return {
    userId: Number(userId),
    role: raw.role as UserRole,
    full_name: raw.full_name,
    category: raw.category ?? "",
    id_category: (raw.id_category ?? 1) as 1 | 2 | 3,
  };
};

export const login = (data: LoginFormData): Promise<LoginResponse> =>
  request(`${URL}/login`, { method: "POST", body: data, auth: false });

export const getMe = async (): Promise<UserInfo | null> => {
  try {
    const res = await request<MeResponse & { userInfo?: UserInfo }>(`${URL}/me`);
    const raw = res.userInfo ?? res.user;
    return raw ? toUserInfo(raw) : null;
  } catch {
    return null;
  }
};

export const getUsers = (): Promise<GetAllUsersResponse> =>
  request(`${URL}/`);

export const getOneUser = (id: number): Promise<GetOneUserResponse> =>
  request(`${URL}/${id}`);

export const getUsersByRole = (id: number): Promise<GetAllUsersResponse> =>
  request(`${URL}/role/${id}`);

export const createUser = (
  user: RegisterFormData
): Promise<CreateUserResponse> =>
  request(URL, { method: "POST", body: user });

export const deleteUser = (): Promise<{ message: string }> =>
  request(`${URL}/`, { method: "DELETE" });

export const logout = async (): Promise<void> => {
  await request(`${URL}/logout`, { method: "POST", auth: false });
};
