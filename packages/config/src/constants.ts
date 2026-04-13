export const API_VERSION = "v1" as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** 10 MB in bytes */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const SUPPORTED_RESUME_FORMATS = ["pdf", "docx", "doc", "txt"] as const;

/** Maximum time an agent task can run before timing out (ms) */
export const AGENT_TIMEOUT_MS = 30_000;

/** Rate limiting window duration (ms) */
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** Maximum requests allowed within the rate limit window */
export const RATE_LIMIT_MAX_REQUESTS = 100;

/** Dimensions for OpenAI text-embedding-3-large */
export const EMBEDDING_DIMENSIONS = 3072;
