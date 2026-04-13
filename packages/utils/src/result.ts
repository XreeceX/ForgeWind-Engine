export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/** Wraps a value in a successful Result. */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/** Wraps an error in a failed Result. */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/** Type guard: narrows a Result to the success variant. */
export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

/** Type guard: narrows a Result to the error variant. */
export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}
