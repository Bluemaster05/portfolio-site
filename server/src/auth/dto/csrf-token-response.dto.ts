export class CsrfTokenResponseDto {
  /** Send this value in the `X-CSRF-Token` header of non-GET requests */
  token!: string;
}
