import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class ExternalApiRequestDto {
  @IsNotEmpty()
  @IsString()
  insurance: string;

  @IsNotEmpty()
  @IsString()
  method: string;

  @IsNotEmpty()
  @IsObject()
  data: Record<string, any>;
}
