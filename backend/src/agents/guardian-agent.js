const BaseAgent = require('./base-agent');

class GuardianAgent extends BaseAgent {
    constructor() {
        super('guardian');
        this.activeAgents = new Map();
    }

    async setupSubscriptions() {
        // Monitor heartbeats
        await this.nats.subscribe('nexus.system.heartbeat.*', (data, msg) => {
            this.activeAgents.set(data.id, {
                ...data,
                lastSeen: new Date()
            });
        });

        // Periodically check for dead agents
        setInterval(() => this.checkHealth(), 10000);
    }

    checkHealth() {
        const now = new Date();
        for (const [id, info] of this.activeAgents.entries()) {
            if (now - info.lastSeen > 15000) {
                console.error(`Guardian ${this.id} detected failure in agent: ${id}`);
                this.handleFailure(id, info);
                this.activeAgents.delete(id);
            }
        }
    }

    handleFailure(id, info) {
        console.log(`Triggering recovery for ${info.type} agent ${id}...`);
        // In a real environment, this would call Kubernetes API or Docker API to restart containers
        this.nats.publish('nexus.system.recovery', {
            targetAgentId: id,
            targetAgentType: info.type,
            action: 'RESTART_REQUIRED'
        });
    }
}

module.exports = GuardianAgent;
