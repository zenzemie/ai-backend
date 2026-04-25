import { Module } from '@nestjs/common';
import { ScoutAgent } from './scout.agent';
import { StrategistAgent } from './strategist.agent';
import { ExecutionAgent } from './execution.agent';
import { AgentController } from './agent.controller';

@Module({
  providers: [ScoutAgent, StrategistAgent, ExecutionAgent],
  controllers: [AgentController],
  exports: [ScoutAgent, StrategistAgent, ExecutionAgent],
})
export class AgentModule {}
