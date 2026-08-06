import { z } from "zod"

export const checkoutPlanSchema = z.enum([
  "pro",
  "agency",
])