const ScoutAgent = require('./agents/scout-agent');
const StrategistAgent = require('./agents/strategist-agent');
const ExecutionAgent = require('./agents/execution-agent');
const AnalystAgent = require('./agents/analyst-agent');
const GuardianAgent = require('./agents/guardian-agent');

class NexusSwarm {
    constructor() {
        this.scout = new ScoutAgent();
        this.strategist = new StrategistAgent();
        this.execution = new ExecutionAgent();
        this.analyst = new AnalystAgent();
        this.guardian = new GuardianAgent();
    }

    async init() {
        console.log('Initializing Singularity Outreach Nexus Swarm...');
        await this.guardian.start();
        await this.analyst.start();
        await this.execution.start();
        await this.strategist.start();
        await this.scout.start();
        console.log('Nexus Swarm is fully operational.');
    }

    async triggerScout(data) {
        return await this.scout.processIngestedData(data);
    }
}

module.exports = new NexusSwarm();
