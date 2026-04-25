import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { OpenAI } from 'openai';

@Injectable()
export class ReviewerAgent extends BaseAgent {
  private openai: OpenAI;

  constructor() {
    super('reviewer');
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async setupSubscriptions() {}

  async processTask(data: any) {
    return this.tracer.startActiveSpan('agent.reviewer.process', async (span) => {
        this.logger.log(`Reviewer ${this.id} analyzing results...`);
        this.logThought(span, 'Evaluating the quality of the generated outreach message using GPT-4o.');

        if (!data.result) {
            this.logThought(span, 'No result found in data, requesting revision.');
            return { ...data, needsRevision: true };
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Quality Assurance Agent. Evaluate if the following outreach message is personalized, professional, and clear. Respond with JSON: { "isSuccessful": boolean, "feedback": string }'
                    },
                    {
                        role: 'user',
                        content: `Message: "${data.result}"\nContext: ${JSON.stringify(data.data)}`
                    }
                ],
                response_format: { type: 'json_object' }
            });

            const evaluation = JSON.parse(response.choices[0].message.content);
            this.logThought(span, `Evaluation result: ${evaluation.isSuccessful ? 'PASS' : 'FAIL'}. Feedback: ${evaluation.feedback}`);
            
            span.setAttribute('agent.evaluation.success', evaluation.isSuccessful);

            return { 
                ...data, 
                needsRevision: !evaluation.isSuccessful,
                reviewFeedback: evaluation.feedback
            };
        } catch (error) {
            this.logger.error(`Review failed: ${error.message}`);
            return { ...data, needsRevision: false }; // Default to pass on error to avoid infinite loop
        }
    });
  }
}
