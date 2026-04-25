const BaseAgent = require('./base-agent');
const OpenAI = require('openai');

class ScoutAgent extends BaseAgent {
    constructor() {
        super('scout');
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async setupSubscriptions() {
        // Scout might listen to external webhooks or social streams.
        // For this demo, we'll simulate an ingestion endpoint.
    }

    async processIngestedData(rawData) {
        console.log(`Scout ${this.id} processing raw data...`);
        
        // 1. Vectorize the context
        const contextString = `${rawData.name} ${rawData.industry} ${rawData.title || ''} ${rawData.companyDesc || ''}`;
        const embedding = await this.getEmbedding(contextString);

        // 2. Publish to NEXUS_RAW_EVENTS
        const event = {
            ...rawData,
            context_vector: embedding,
            source: 'scout-ingestion'
        };

        await this.logEvent('ingested', event);
        console.log(`Scout ${this.id} published event to mesh.`);
    }

    async getEmbedding(text) {
        try {
            const response = await this.openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text,
                encoding_format: "float",
            });
            return response.data[0].embedding;
        } catch (err) {
            console.error(`Embedding failed: ${err.message}`);
            // Return dummy vector if OpenAI fails for resilience
            return new Array(1536).fill(0);
        }
    }
}

module.exports = ScoutAgent;
