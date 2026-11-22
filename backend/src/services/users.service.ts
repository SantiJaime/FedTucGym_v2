import { DatabaseError, type QueryResult } from "pg";
import pool from "../database/db.config";
import type { User } from "../schemas/users.schema";

const MAX_ATTEMPTS_PER_ACCOUNT = 5;
const MAX_ATTEMPTS_PER_IP = 20;
const ATTEMPTS_WINDOW = "15 minutes";

// shortcut: sin la tabla el login sigue funcionando sin límite; quitar tras aplicar el SQL en todos los entornos.
const ignoreMissingAttemptsTable = (error: unknown) => {
  if (error instanceof DatabaseError && error.code === "42P01") {
    console.error("Falta la tabla login_attempts: límite de login inactivo");
    return;
  }
  throw error;
};

export default class UserService {
  public async getAll(): Promise<UserResponse[]> {
    const { rows } = await pool.query("SELECT * FROM users_view");
    return rows;
  }

  public async getByName(
    full_name: string
  ): Promise<(UserResponse & { password: string }) | undefined> {
    const { rows }: QueryResult<UserResponse & { password: string }> =
      await pool.query("SELECT * FROM get_users_by_full_name($1)", [
        full_name,
      ]);
    return rows[0];
  }

  public async getByRole(id_role: number): Promise<UserResponse[]> {
    const { rows }: QueryResult<UserResponse> = await pool.query(
      "SELECT * FROM users_view WHERE id_role = $1",
      [id_role]
    );
    return rows;
  }

  public async getById(id: number): Promise<UserResponse | undefined> {
    const { rows } = await pool.query(
      "SELECT * FROM users_view WHERE id = $1",
      [id]
    );
    return rows[0];
  }

  public async create(user: Omit<User, "id">): Promise<Omit<User, "password">> {
    const { full_name, password, id_role } = user;
    const { rows } = await pool.query(
      "INSERT INTO users (full_name, password, id_role) VALUES ($1, $2, $3) RETURNING id, full_name, id_role",
      [full_name, password, id_role]
    );
    return rows[0];
  }

  public async updateFullname(
    id: number,
    user: Pick<User, "full_name">
  ): Promise<Omit<User, "password"> | undefined> {
    const { full_name } = user;
    const { rows } = await pool.query(
      // El login busca por nombre: dos usuarios no pueden compartirlo.
      `UPDATE users SET full_name = $1::text
       WHERE id = $2::int AND NOT EXISTS (
         SELECT 1 FROM users other
         WHERE LOWER(other.full_name) = LOWER($1::text) AND other.id <> $2::int
       )
       RETURNING id, full_name, id_role`,
      [full_name, id]
    );
    return rows[0];
  }

  public async delete(id: number): Promise<boolean> {
    const { rowCount } = await pool.query(
      "DELETE FROM users WHERE id_user = $1",
      [id]
    );
    return !!rowCount && rowCount > 0;
  }

  public async saveToken(token: string, id: number): Promise<void> {
    const createdAt = new Date();
    const expiresAt = new Date(
      createdAt.getTime() + 24 * 60 * 60 * 1000
    ).toISOString();

    await pool.query(
      "DELETE FROM refresh_tokens WHERE id_user = $1 AND expires_at <= NOW()",
      [id]
    );

    await pool.query(
      "INSERT INTO refresh_tokens (token, id_user, created_at, expires_at) VALUES ($1, $2, $3, $4)",
      [token, id, createdAt, expiresAt]
    );
  }

  public async validateToken(token: string, id: number): Promise<boolean> {
    const { rowCount } = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND id_user = $2 AND expires_at > NOW()",
      [token, id]
    );

    return !!rowCount && rowCount > 0;
  }

  // El token anterior vive 30 s más para que peticiones o pestañas simultáneas no cierren la sesión.
  public async rotateToken(
    oldToken: string,
    newToken: string,
    id: number,
    expiresAt: Date,
  ): Promise<void> {
    await pool.query(
      `WITH old AS (
         UPDATE refresh_tokens
         SET expires_at = LEAST(expires_at, NOW() + interval '30 seconds')
         WHERE token = $1 AND id_user = $2
       )
       INSERT INTO refresh_tokens (token, id_user, created_at, expires_at)
       VALUES ($3, $2, NOW(), $4)`,
      [oldToken, id, newToken, expiresAt],
    );
  }

  public async revokeToken(token: string): Promise<void> {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
  }

  public async isLoginBlocked(accountKey: string, ipKey: string): Promise<boolean> {
    try {
      const { rowCount } = await pool.query(
        `SELECT 1 FROM login_attempts
         WHERE window_start > NOW() - $3::interval
           AND ((key = $1 AND attempts >= $4) OR (key = $2 AND attempts >= $5))
         LIMIT 1`,
        [accountKey, ipKey, ATTEMPTS_WINDOW, MAX_ATTEMPTS_PER_ACCOUNT, MAX_ATTEMPTS_PER_IP],
      );
      return !!rowCount;
    } catch (error) {
      ignoreMissingAttemptsTable(error);
      return false;
    }
  }

  public async recordFailedLogin(accountKey: string, ipKey: string): Promise<void> {
    try {
      await pool.query(
        "DELETE FROM login_attempts WHERE window_start <= NOW() - $1::interval",
        [ATTEMPTS_WINDOW],
      );
      await pool.query(
        `INSERT INTO login_attempts (key, attempts, window_start)
         SELECT unnest($1::text[]), 1, NOW()
         ON CONFLICT (key) DO UPDATE SET attempts = login_attempts.attempts + 1`,
        [[accountKey, ipKey]],
      );
    } catch (error) {
      ignoreMissingAttemptsTable(error);
    }
  }

  public async clearLoginAttempts(accountKey: string): Promise<void> {
    try {
      await pool.query("DELETE FROM login_attempts WHERE key = $1", [accountKey]);
    } catch (error) {
      ignoreMissingAttemptsTable(error);
    }
  }
}
