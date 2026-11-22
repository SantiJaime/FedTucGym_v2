export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
        full_name: string;
        exp?: number;
      };
    }
  }
}
