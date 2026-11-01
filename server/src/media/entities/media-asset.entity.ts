import { type Opt } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';

/** An uploaded image. The file lives in UPLOAD_DIR under `key`; content points to `/media/<key>`. */
@Entity()
export class MediaAsset {
  @PrimaryKey()
  id!: number;

  /** Random file name, e.g. "3f2b…c1.png"; also the public URL segment */
  @Unique()
  @Property({ length: 64 })
  key!: string;

  /** Name of the file the admin uploaded, for display only */
  @Property({ length: 255 })
  originalName!: string;

  @Property({ length: 40 })
  mimeType!: string;

  /** Size in bytes */
  @Property()
  size!: number;

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();
}
