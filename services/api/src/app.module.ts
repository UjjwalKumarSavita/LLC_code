import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { validateEnvironment } from "./config/env.validation";
import { HealthModule } from "./health/health.module";
import { LeaderboardModule } from "./leaderboard/leaderboard.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProblemsModule } from "./problems/problems.module";
import { ProgressModule } from "./progress/progress.module";
import { SubmissionsModule } from "./submissions/submissions.module";
import { EditorialsModule } from "./editorials/editorials.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120
      }
    ]),
    PrismaModule,
    AuthModule,
    ProblemsModule,
    ProgressModule,
    SubmissionsModule,
    EditorialsModule,
    LeaderboardModule,
    HealthModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
