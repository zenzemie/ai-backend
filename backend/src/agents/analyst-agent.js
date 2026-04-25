const BaseAgent = require('./base-agent');
const polygonalRouter = require('../core/router/polygonal-router');

class AnalystAgent extends BaseAgent {
    constructor() {
        super('analyst');
    }

    async setupSubscriptions() {
        // In a real system, this would listen for webhooks from email providers (SendGrid, etc.)
        // or LinkedIn reply notifications.
        // For now, we'll listen to NEXUS_ROI signals (simulated).
        await this.nats.subscribe('nexus.roi.signal', async (data, msg) => {
            await this.processROI(data);
            msg.ack();
        }, { durable_name: 'analyst_durable' });
    }

    async processROI(signal) {
        console.log(`Analyst ${this.id} processing ROI signal for strategy: ${signal.strategyId}`);

        const reward = this.calculateReward(signal);

        // Update the Polygonal Router (Collective Intelligence)
        polygonalRouter.recordFeedback(signal.strategyId, reward);

        // Publish updated performance metrics to the system stream
        await this.nats.publish('nexus.system.metrics_update', {
            strategyId: signal.strategyId,
            newReward: reward,
            metrics: polygonalRouter.getMetrics()
        });
    }

    calculateReward(signal) {
        // Convert various signals into a 0-1 reward scalar
        switch (signal.type) {
            case 'REPLY': return 0.8;
            case 'OPEN': return 0.2;
            case 'MEETING_BOOKED': return 1.0;
            case 'BOUNCE': return 0.0;
            case 'UNSUBSCRIBE': return -0.5;
            default: return 0.1;
        }
    }
}

module.exports = AnalystAgent;
