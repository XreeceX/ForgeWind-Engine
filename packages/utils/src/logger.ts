import pino from "pino";

/**
 * Creates a structured pino logger bound to a specific service name.
 * Uses LOG_LEVEL from env (defaults to "info") and enables pretty-printing in development.
 */
export function createLogger(service: string): pino.Logger {
  const isDev = process.env["NODE_ENV"] !== "production";
  const level = process.env["LOG_LEVEL"] ?? "info";

  return pino({
    name: service,
    level,
    ...(isDev && {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    }),
  });
}
