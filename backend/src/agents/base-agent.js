const natsClient = require('../core/mesh/nats-client');
const { v4: uuidv4 } = require('uuid');

class BaseAgent {
    constructor(type) {
        this.id = `${type}-${uuidv4()}`;
        this.type = type;
        this.nats = natsClient;
    }

    async start() {
        console.log(`Starting agent: ${this.id}`);
        await this.nats.init();
        this.startHeartbeat();
        await this.setupSubscriptions();
    }

    startHeartbeat() {
        setInterval(async () => {
            try {
                await this.nats.publish(`nexus.system.heartbeat.${this.id}`, {
                    id: this.id,
                    type: this.type,
                    timestamp: new Date().toISOString(),
                    status: 'UP'
                });
            } catch (err) {
                console.error(`Heartbeat failed for ${this.id}: ${err.message}`);
            }
        }, 5000);
    }

    async setupSubscriptions() {
        // To be implemented by subclasses
    }

    async logEvent(subSubject, data) {
        return await this.nats.publish(`nexus.events.${subSubject}`, {
            ...data,
            agentId: this.id,
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = BaseAgent;
