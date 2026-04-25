import { Module, Global, forwardRef } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { LangGraphService } from './langgraph.service';
import { RoutingService } from './routing.service';
import { SelfHealingService } from './self-healing.service';
import { MetaOptimizerService } from './meta-optimizer.service';
import { DashboardController } from './dashboard.controller';
import { EvolutionModule } from '../evolution/evolution.module';

@Global()
@Module({
  imports: [forwardRef(() => EvolutionModule)],
  providers: [OrchestratorService, LangGraphService, RoutingService, SelfHealingService, MetaOptimizerService],
  controllers: [DashboardController],
  exports: [OrchestratorService, LangGraphService, RoutingService, SelfHealingService, MetaOptimizerService],
})
export class OrchestratorModule {}
