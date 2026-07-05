import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateSubmissionDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(180)
  problemSlug!: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(50)
  languageSlug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(65_536)
  code!: string;
}
