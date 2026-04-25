import { Injectable, Logger } from '@nestjs/common';
import { ThompsonSampling } from '../../common/ml/bandit-pool';

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private bandit: any;
  private strategies = [
    { id: 'gpt4o', model: 'gpt-4o', cost: 10, latency: 2000 },
    { id: 'claude35', model: 'claude-3-5-sonnet', cost: 8, latency: 1500 },
    { id: 'llama3', model: 'llama-3-70b', cost: 1, latency: 500 },
  ];

  constructor() {
    // Porting the ThompsonSampling logic to a more robust implementation if needed
    // For now, let's assume we can use the existing one or a similar one.
    this.bandit = new ThompsonSampling(this.strategies.map(s => s.id));
  }

  async selectModel(context: any) {
    const strategyId = this.bandit.select();
    const strategy = this.strategies.find(s => s.id === strategyId);
    
    this.logger.log(`Selected model: ${strategy.model} (Strategy: ${strategyId})`);
    return strategy;
  }

  recordFeedback(strategyId: string, success: boolean, metrics: { latency: number, tokens: number }) {
    const reward = success ? 1 : 0;
    this.bandit.update(strategyId, reward);
    // Here we could also store cost/latency metrics for more advanced routing
  }
}
