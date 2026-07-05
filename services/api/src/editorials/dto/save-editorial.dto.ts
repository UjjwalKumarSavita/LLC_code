import { IsOptional, IsString, MaxLength } from "class-validator";

export class SaveEditorialDto {
  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  intuition?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  bruteForce?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30_000)
  optimizedApproach?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  dryRun?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  complexity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  commonMistakes?: string;
}
