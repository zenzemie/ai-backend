const BaseAgent = require('./base-agent');
const OpenAI = require('openai');

class ExecutionAgent extends BaseAgent {
    constructor() {
        super('execution');
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async setupSubscriptions() {
        await this.nats.subscribe('nexus.tasks.outreach', async (data, msg) => {
            await this.executeOutreach(data);
            msg.ack();
        }, { durable_name: 'execution_durable' });
    }

    async executeOutreach(task) {
        console.log(`Execution ${this.id} performing outreach for lead: ${task.lead.name}`);

        const { strategy, lead } = task;

        try {
            // 1. Generate content using the selected strategy
            const content = await this.generateContent(strategy, lead);

            // 2. Perform actual outreach (mocked)
            console.log(`Sending message via ${strategy.model} with template ${strategy.template}:`);
            console.log(`Content: ${content.substring(0, 50)}...`);

            // 3. Log success
            await this.logEvent('executed', {
                taskId: task.eventId,
                strategyId: strategy.id,
                status: 'sent',
                channel: 'email'
            });

        } catch (err) {
            console.error(`Execution failed: ${err.message}`);
            await this.logEvent('failed', {
                taskId: task.eventId,
                error: err.message
            });
        }
    }

    async generateContent(strategy, lead) {
        // Mocking LLM call based on strategy
        const response = await this.openai.chat.completions.create({
            model: strategy.model === 'gpt-4o' ? 'gpt-4o' : 'gpt-3.5-turbo', // Fallback for demo
            messages: [
                { role: 'system', content: `You are an AI sales expert using the ${strategy.template} strategy.` },
                { role: 'user', content: `Create a personalized outreach message for ${lead.name} in the ${lead.industry} industry.` }
            ]
        });

        return response.choices[0].message.content;
    }
}

module.exports = ExecutionAgent;
