import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';

@Injectable()
export class ReviewerAgent extends BaseAgent {
  constructor() {
    super('reviewer');
  }

  async setupSubscriptions() {}

  async processTask(data: any) {
    this.logger.log(`Reviewer ${this.id} analyzing results...`);
    
    // In a real scenario, this would call an LLM to evaluate the output.
    // We'll simulate a more robust check here.
    const hasQualityContent = data.result && data.result.length > 20;
    const hasNoForbiddenWords = !data.result?.toLowerCase().includes('spam') && 
                                !data.result?.toLowerCase().includes('buy now');
    const isSuccessful = hasQualityContent && hasNoForbiddenWords && !data.errors?.length;
    
    if (!isSuccessful) {
        this.logger.warn(`Reviewer detected issues in the output.`);
        return { 
          ...data, 
          needsRevision: true,
          reviewFeedback: !hasQualityContent ? 'Content too short' : 'Forbidden words detected'
        };
    }

    return { ...data, needsRevision: false };
  }
}
