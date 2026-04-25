import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';

@Injectable()
export class ExecutionAgent extends BaseAgent {
  constructor() {
    super('execution');
  }

  async setupSubscriptions() {}

  async processTask(data: any) {
    this.logger.log(`Execution ${this.id} executing strategy ${data.strategy.id}...`);
    return { ...data, result: `Generated message using ${data.strategy.model}` };
  }
}
