export class ErrorResponseDto {
  /** HTTP status code */
  statusCode!: number;

  /** Error message, or a list of validation messages */
  message!: string | string[];

  /** Short name of the error, e.g. "Not Found" */
  error?: string;
}
