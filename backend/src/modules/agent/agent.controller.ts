import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { ScoutAgent } from './scout.agent';
import { StrategistAgent } from './strategist.agent';
import { ExecutionAgent } from './execution.agent';

@ApiTags('AI')
@Controller('ai')
@ApiBearerAuth()
export class AgentController {
  constructor(
    private readonly orchestrator: OrchestratorService,
    private readonly scout: ScoutAgent,
    private readonly strategist: StrategistAgent,
    private readonly execution: ExecutionAgent,
  ) {
    this.setupGraph();
  }

  private setupGraph() {
    this.orchestrator.registerAgent('scout', this.scout);
    this.orchestrator.registerAgent('strategist', this.strategist);
    this.orchestrator.registerAgent('execution', this.execution);

    this.orchestrator.addEdge('scout', 'strategist');
    this.orchestrator.addEdge('strategist', 'execution');
  }

  @Post('nexus/trigger')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Trigger the Nexus swarm' })
  async triggerNexus(@Body() body: any) {
    const result = await this.orchestrator.runGraph('scout', body);
    return { status: 'Accepted', message: 'Nexus swarm has been triggered', result };
  }
}
