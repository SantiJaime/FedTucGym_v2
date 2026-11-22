import { z } from "zod";

export const PageDTO = z
  .number()
  .int("La página debe ser un número entero")
  .min(1, "La página debe ser mayor o igual a 1");
