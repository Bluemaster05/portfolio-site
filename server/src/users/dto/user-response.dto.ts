export class UserResponseDto {
  id!: number;
  email!: string;
  name!: string;
  createdAt!: Date;
  lastLoginAt?: Date;
}
