import { z } from "zod";
import { analyzeRequestSchema, analyzeResponseSchema } from "./schema";

export const api = {
  analyze: {
    method: "POST" as const,
    path: "/api/analyze" as const,
    input: analyzeRequestSchema,
    responses: {
      200: analyzeResponseSchema,
      400: z.object({ message: z.string() }),
      500: z.object({ message: z.string() })
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
