import { Type } from "class-transformer";
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
import {
  ComparisonMode,
  Difficulty,
  TestCaseType,
  TestCaseVisibility,
  Visibility
} from "../../generated/prisma/enums";

export class ProblemExampleDto {
  @IsString()
  @MinLength(1)
  input!: string;

  @IsString()
  output!: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  displayOrder?: number;
}

export class HintDto {
  @IsInt()
  @Min(1)
  @Max(10)
  level!: number;

  @IsString()
  @MinLength(3)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unlockCondition?: string;
}

export class TestCaseDto {
  @IsOptional()
  @IsString()
  input?: string;

  @IsOptional()
  @IsString()
  expectedOutput?: string;

  @IsEnum(TestCaseVisibility)
  visibility!: TestCaseVisibility;

  @IsOptional()
  @IsEnum(TestCaseType)
  testType?: TestCaseType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateProblemDto {
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  slug!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsString()
  @MinLength(20)
  statement!: string;

  @IsOptional()
  @IsString()
  inputFormat?: string;

  @IsOptional()
  @IsString()
  outputFormat?: string;

  @IsOptional()
  @IsString()
  constraints?: string;

  @IsEnum(Difficulty)
  difficulty!: Difficulty;

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

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => HintDto)
  hints?: HintDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases?: TestCaseDto[];
}
