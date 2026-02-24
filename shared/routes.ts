import { z } from "zod";
import { analyzeRequestSchema, analyzeResponseSchema, insertConversationSchema, insertMessageSchema } from "./schema";

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
  },
  chat: {
    createConversation: {
      method: "POST" as const,
      path: "/api/conversations" as const,
      input: z.object({ title: z.string() }),
      responses: {
        201: z.any(),
        500: z.object({ message: z.string() })
      }
    },
    sendMessage: {
      method: "POST" as const,
      path: "/api/conversations/:id/messages" as const,
      input: z.object({ content: z.string() }),
      responses: {
        200: z.any(),
        500: z.object({ message: z.string() })
      }
    },
    getHistory: {
      method: "GET" as const,
      path: "/api/conversations/:id/messages" as const,
      responses: {
        200: z.array(z.any()),
        500: z.object({ message: z.string() })
      }
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
