import crypto from "crypto";
import jwt, { type SignOptions, type JwtPayload } from "jsonwebtoken";

interface Payload {
  userId: number;
  role: string;
  full_name: string;
}
type CustomJwtPayload = JwtPayload & Payload;

export const generateToken = (payload: Payload, secret: string, expiration: number = 60 * 60): string => {
    const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: expiration,
    // Sin jti, dos tokens del mismo usuario en el mismo segundo serían idénticos.
    jwtid: crypto.randomUUID(),
  };
  const token = jwt.sign(payload, secret, options);
  return token;
};

export const verifyToken = (token: string, secret: string): CustomJwtPayload => {
  try {
    
    const verify = jwt.verify(token, secret, { algorithms: ["HS256"] });
    
    if (typeof verify === "string") {
      throw new Error("Token payload inválido");
    }

    return verify as CustomJwtPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw error;
    }
    throw new Error("Error desconocido de JWT", { cause: error });
  }
};
