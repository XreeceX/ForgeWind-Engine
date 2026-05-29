import { serviceEnvSchema, validateEnv } from '@forgewind-engine/config';
import { createLogger } from './logger.js';

/**
 * Validates environment variables and returns a structured logger for the service.
 */
export function bootstrapService(serviceName: string, schema = serviceEnvSchema) {
  validateEnv(schema);
  return createLogger(serviceName);
}
