import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateTemplateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  languageSlug!: string;

  @IsString()
  @MinLength(5)
  starterCode!: string;

  @IsOptional()
  @IsString()
  functionSignature?: string;
}
