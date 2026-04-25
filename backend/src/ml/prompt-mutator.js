const OpenAI = require('openai');

class PromptMutator {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async mutate(basePrompt, performanceData) {
        console.log('Mutating prompt based on performance data...');
        
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a Genetic Prompt Optimizer. Your goal is to improve outreach prompts based on historical ROI.' 
                },
                { 
                    role: 'user', 
                    content: `Current Prompt: "${basePrompt}"\nPerformance: ${JSON.stringify(performanceData)}\n\nGenerate a mutated version of this prompt that might perform better.` 
                }
            ]
        });

        return response.choices[0].message.content;
    }
}

module.exports = new PromptMutator();
