import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { OpenAI } from 'openai';

@Injectable()
export class MetaOptimizerService implements OnModuleInit {
  private readonly logger = new Logger(MetaOptimizerService.name);
  private openai: OpenAI;

  constructor(
    private routingService: RoutingService,
    private knowledgeService: KnowledgeService,
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  onModuleInit() {
    // Run optimization every 6 hours
    setInterval(() => {
      this.optimizeStrategies().catch(err => this.logger.error('Meta-optimization failed', err));
    }, 6 * 3600 * 1000);
  }

  async optimizeStrategies() {
    this.logger.log('Starting meta-optimization loop...');
    
    const strategies = this.routingService.getStrategies();
    const stats = this.routingService.getPerformanceData();
    const successfulExamples = await this.knowledgeService.getSuccessfulExamples(10);

    for (const strategy of strategies) {
      const armStats = stats[strategy.id];
      if (!armStats) continue;
      
      const successRate = armStats.alpha / (armStats.alpha + armStats.beta);

      if (successRate < 0.3 && (armStats.alpha + armStats.beta) > 5) {
        this.logger.log(`Strategy ${strategy.id} is underperforming (${successRate.toFixed(2)}). Mutating...`);
        
        const newPrompt = await this.generateMutatedPrompt(strategy, successfulExamples);
        const newStrategyId = `${strategy.id}-v${Math.floor(Date.now() / 1000)}`;
        
        this.routingService.addStrategy({
          ...strategy,
          id: newStrategyId,
          promptVariant: newPrompt
        });
      }
    }
  }

  private async generateMutatedPrompt(strategy: any, successfulExamples: any[]) {
    try {
      const examplesText = successfulExamples
        .map(e => `Context: ${JSON.stringify(e.metadata?.context)}\nStrategy: ${e.entity}`)
        .join('\n\n');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI Meta-Optimizer. Your goal is to evolve agent strategies based on successful outcomes.'
          },
          {
            role: 'user',
            content: `
              Current Strategy: ${JSON.stringify(strategy)}
              
              Successful Examples from Knowledge Graph:
              ${examplesText}
              
              Generate a new, improved prompt variant for this strategy that incorporates learnings from the successful examples.
            `
          }
        ]
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error(`Failed to generate mutated prompt: ${error.message}`);
      return strategy.promptVariant || 'Default prompt';
    }
  }
}
