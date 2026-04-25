import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { OpenAI } from 'openai';

@Injectable()
export class ExecutionAgent extends BaseAgent {
  private openai: OpenAI;

  constructor() {
    super('execution');
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async setupSubscriptions() {}

  async processTask(data: any) {
    return this.tracer.startActiveSpan('agent.execution.process', async (span) => {
        this.logger.log(`Execution ${this.id} executing strategy ${data.strategy.id}...`);
        this.logThought(span, `Using model ${data.strategy.model} to generate outreach message.`);

        try {
            const response = await this.openai.chat.completions.create({
                model: data.strategy.model === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an Expert Outreach Specialist. Generate a personalized message based on the provided lead context.'
                    },
                    {
                        role: 'user',
                        content: `Lead Context: ${JSON.stringify(data)}`
                    }
                ]
            });

            const result = response.choices[0].message.content;
            span.setAttribute('agent.result.length', result.length);
            return { ...data, result };
        } catch (error) {
            this.logger.error(`Execution failed: ${error.message}`);
            return { ...data, result: `Failed to generate message using ${data.strategy.model}` };
        }
    });
  }
}
