import { z } from "zod";

export const IdDTO = z.coerce
  .number({
    error: "El valor total debe ser un número",
  })
  .int("El ID debe ser un número entero")
  .nonnegative("El ID no puede ser negativo");
