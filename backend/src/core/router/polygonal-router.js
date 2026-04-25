const ThompsonSampling = require('../../ml/bandit-pool');

class PolygonalRouter {
    constructor() {
        this.strategies = [
            { id: 'gpt4o_professional', model: 'gpt-4o', template: 'professional_v1' },
            { id: 'claude35_creative', model: 'claude-3-5-sonnet', template: 'creative_v2' },
            { id: 'llama3_aggressive', model: 'llama-3-70b', template: 'aggressive_v1' },
            { id: 'gemini_analytical', model: 'gemini-1.5-pro', template: 'analytical_v1' }
        ];
        
        this.bandit = new ThompsonSampling(this.strategies.map(s => s.id));
    }

    async selectStrategy(contextVector) {
        // In a more advanced version, the bandit could be contextual (Contextual Bandits)
        // using the contextVector to parameterize the selection.
        // For this architecture, we'll use the Thompson Sampling on the pool.
        
        const strategyId = this.bandit.select();
        return this.strategies.find(s => s.id === strategyId);
    }

    recordFeedback(strategyId, reward) {
        this.bandit.update(strategyId, reward);
        console.log(`Updated bandit for ${strategyId} with reward ${reward}`);
    }

    getMetrics() {
        return this.strategies.map(s => ({
            ...s,
            stats: this.bandit.stats[s.id]
        }));
    }
}

module.exports = new PolygonalRouter();
