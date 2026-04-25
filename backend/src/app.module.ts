import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { HealthCheckService, TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './infra/prisma/prisma.module';
import { NatsModule } from './infra/nats/nats.module';
import { AuthModule } from './modules/auth/auth.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AgentModule } from './modules/agent/agent.module';
import { OrchestratorModule } from './modules/orchestrator/orchestrator.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TerminusModule,
    HttpModule,
    PrismaModule,
    NatsModule,
    AuthModule,
    KnowledgeModule,
    AgentModule,
    OrchestratorModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
