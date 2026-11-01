/** An API call that came back with an error status, carrying the server's message. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/** The `message` of an ErrorResponseDto body (validation errors arrive as a list). */
function messageOf(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error;
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
  }
  return undefined;
}

/** Throws ApiError for error responses. */
export function ensureOk(result: FetchResult<unknown>): void {
  const { status, ok } = result.response;
  if (!ok) throw new ApiError(messageOf(result.error) ?? `Request failed (${status})`, status);
}

/** The response body, or throws ApiError. */
export function unwrap<T>(result: FetchResult<T>): T {
  ensureOk(result);
  if (result.data === undefined) throw new ApiError('Empty response', result.response.status);
  return result.data;
}

/** A readable message for a thrown ApiError or an openapi-react-query error body. */
export function errorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (error instanceof Error) return error.message;
  return messageOf(error) ?? 'Something went wrong';
}
