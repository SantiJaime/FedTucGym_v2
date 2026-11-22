import { useCallback, useState } from "react";
import {
  login,
  getUsers,
  createUser,
  deleteUser,
  logout,
  getOneUser,
} from "../helpers/userQueries";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./useUserContext";
import type { LoginFormData } from "../validation/loginValidatorSchema";
import type { RegisterFormData } from "../validation/registerValidatorSchema";

const useUsers = () => {
  const navigate = useNavigate();
  const { user, setUser, isLoggedIn, isInitializing } = useUserContext();

  const [loading, setLoading] = useState(false);
  const [logOutLoading, setLogOutLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Estable entre renders: useGyms y useTournaments la usan como dependencia de efectos.
  const handleLogout = useCallback(async () => {
    try {
      setLogOutLoading(true);
      await logout();
      setUser(null);
      navigate("/");
    } catch (err) {
      const error = err as ErrorResponse;
      toast.error(error.error, { id: error.error });
    } finally {
      setLogOutLoading(false);
    }
  }, [navigate, setUser]);

  const handleLogin = async (
    data: LoginFormData
  ): Promise<LoginResponse | undefined> => {
    setLoading(true);
    try {
      const res = await login(data);
      setUser(res.userInfo);

      return res;
    } catch (err) {
      const error = err as ErrorResponse;
      toast.error(error.error, { id: error.error });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.users);
    } catch (err) {
      const error = err as ErrorResponse;
      toast.error(error.error, { id: error.error });
      if (error.redirect) {
        await handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOneUser = async (id: number) => {
    setLoading(true);
    try {
      const res = await getOneUser(id);
      return res;
    } catch (err) {
      const error = err as ErrorResponse;
      toast.error(error.error, { id: error.error });
      if (error.redirect) {
        await handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const res = await createUser(data);
      return res;
    } catch (err) {
      const error = err as ErrorResponse;
      toast.error(error.error, { id: error.error });
      if (error.redirect) {
        await handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      const res = await deleteUser();
      toast.success(res.message);
    } catch (err) {
      const error = err as ErrorResponse;
      toast.error(error.error, { id: error.error });
      if (error.redirect) {
        await handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    users,
    user,
    isLoggedIn,
    isInitializing,
    handleLogin,
    handleLogout,
    fetchUsers,
    fetchOneUser,
    handleCreateUser,
    handleDeleteUser,
    logOutLoading
  };
};

export default useUsers;
