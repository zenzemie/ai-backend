import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { OpenAI } from 'openai';

@Injectable()
export class ScoutAgent extends BaseAgent {
  private openai: OpenAI;

  constructor() {
    super('scout');
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async setupSubscriptions() {
    // Implement NATS subscriptions here if needed
  }

  async processTask(rawData: any) {
    return this.tracer.startActiveSpan('agent.scout.process', async (span) => {
        this.logger.log(`Scout ${this.id} processing raw data...`);
        this.logThought(span, 'Ingesting raw lead data and generating embeddings.');

        const contextString = `${rawData.name} ${rawData.industry} ${rawData.title || ''} ${rawData.companyDesc || ''}`;
        const embedding = await this.getEmbedding(contextString);

        const event = {
            ...rawData,
            context_vector: embedding,
            source: 'scout-ingestion'
        };

        span.setAttribute('agent.output.source', event.source);
        return event;
    });
  }

  private async getEmbedding(text: string) {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      });
      return response.data[0].embedding;
    } catch (err) {
      this.logger.error(`Embedding failed: ${err.message}`);
      return new Array(1536).fill(0);
    }
  }
}
