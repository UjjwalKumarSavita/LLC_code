import { IsUUID } from "class-validator";
import { TestCaseDto } from "./create-problem.dto";

export class CreateTestCaseDto extends TestCaseDto {}

export class TestCaseParamsDto {
  @IsUUID()
  problemId!: string;

  @IsUUID()
  testCaseId!: string;
}
