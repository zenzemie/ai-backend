import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { RoutingService } from '../orchestrator/routing.service';

@Injectable()
export class StrategistAgent extends BaseAgent {
  constructor(private routingService: RoutingService) {
    super('strategist');
  }

  async setupSubscriptions() {}

  async processTask(data: any) {
    this.logger.log(`Strategist ${this.id} selecting strategy...`);
    const strategy = await this.routingService.selectModel(data);
    return { ...data, strategy };
  }
}
