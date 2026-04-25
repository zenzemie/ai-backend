import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { RoutingService } from '../orchestrator/routing.service';
import { KnowledgeService } from '../knowledge/knowledge.service';

@Injectable()
export class StrategistAgent extends BaseAgent {
  constructor(
    private routingService: RoutingService,
    private knowledgeService: KnowledgeService,
  ) {
    super('strategist');
  }

  async setupSubscriptions() {}

  async processTask(data: any) {
    return this.tracer.startActiveSpan('agent.strategist.process', async (span) => {
        this.logger.log(`Strategist ${this.id} selecting strategy...`);
        this.logThought(span, 'Analyzing context and searching for similar past successes.');

        const successes = await this.knowledgeService.findSimilarSuccesses(data.industry || '');
        this.logThought(span, `Found ${successes.length} similar past successes.`);

        const strategy = await this.routingService.selectModel({ ...data, pastSuccesses: successes });
        this.setStrategy(span, strategy.id);
        
        return { ...data, strategy };
    });
  }
}
