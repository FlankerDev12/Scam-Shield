import { useMutation } from "@tanstack/react-query";
import { api, type AnalyzeRequest, type AnalyzeResponse } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useAnalyze() {
  return useMutation({
    mutationFn: async (payload: AnalyzeRequest): Promise<AnalyzeResponse> => {
      const validated = api.analyze.input.parse(payload);

      const res = await fetch(api.analyze.path, {
        method: api.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.analyze.responses[400], await res.json(), "analyze.400");
          throw new Error(err.message);
        }
        if (res.status === 500) {
          const err = parseWithLogging(api.analyze.responses[500], await res.json(), "analyze.500");
          throw new Error(err.message);
        }
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      return parseWithLogging(api.analyze.responses[200], await res.json(), "analyze.200");
    },
  });
}
