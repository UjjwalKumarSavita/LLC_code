import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import {
  ComparisonMode,
  Difficulty,
  Visibility
} from "../../generated/prisma/enums";
import { ProblemExampleDto } from "./create-problem.dto";

export class UpdateProblemDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  statement?: string;

  @IsOptional()
  @IsString()
  inputFormat?: string;

  @IsOptional()
  @IsString()
  outputFormat?: string;

  @IsOptional()
  @IsString()
  constraints?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  points?: number;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(30_000)
  timeLimitMs?: number;

  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(2048)
  memoryLimitMb?: number;

  @IsOptional()
  @IsEnum(ComparisonMode)
  comparisonMode?: ComparisonMode;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ProblemExampleDto)
  examples?: ProblemExampleDto[];
}
