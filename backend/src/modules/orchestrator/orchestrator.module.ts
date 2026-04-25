import { Module, Global } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { RoutingService } from './routing.service';
import { SelfHealingService } from './self-healing.service';

@Global()
@Module({
  providers: [OrchestratorService, RoutingService, SelfHealingService],
  exports: [OrchestratorService, RoutingService, SelfHealingService],
})
export class OrchestratorModule {}
