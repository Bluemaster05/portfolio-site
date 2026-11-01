export class MediaAssetResponseDto {
  id!: number;

  /** Random file name, e.g. "3f2b…c1.png" */
  key!: string;

  /** Site-relative URL to store in content, e.g. "/media/3f2b…c1.png" */
  url!: string;

  /** Name of the file that was uploaded */
  originalName!: string;

  mimeType!: string;

  /** Size in bytes */
  size!: number;

  createdAt!: Date;
}
