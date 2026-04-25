const axios = require('axios');

class PinotClient {
    constructor() {
        this.controllerUrl = process.env.PINOT_CONTROLLER_URL || 'http://localhost:9000';
        this.brokerUrl = process.env.PINOT_BROKER_URL || 'http://localhost:8099';
    }

    async query(sql) {
        try {
            const response = await axios.post(`${this.brokerUrl}/query/sql`, { sql });
            return response.data;
        } catch (err) {
            console.error(`Pinot query error: ${err.message}`);
            throw err;
        }
    }

    async findSimilar(vector, limit = 5) {
        // Mocking HNSW similarity search logic for Pinot
        // In reality, this would be a SQL query using vector similarity functions if available or custom UDFs
        const vectorStr = `[${vector.join(',')}]`;
        const sql = `SELECT *, cosine_similarity(context_vector, ${vectorStr}) as score FROM nexus_events ORDER BY score DESC LIMIT ${limit}`;
        // Since we don't have a real Pinot cluster here, this is illustrative of the integration
        return this.query(sql);
    }

    async ingestEvent(event) {
        // Typically Pinot ingests from Kafka/NATS directly via a Real-time Table
        // But we can also push via HTTP for small scale or testing
        try {
            await axios.post(`${this.controllerUrl}/ingest`, event);
        } catch (err) {
            // Pinot ingestion via controller is not always the preferred way for real-time
            // console.warn(`Direct Pinot ingestion failed: ${err.message}. Assuming stream-based ingestion.`);
        }
    }
}

module.exports = new PinotClient();
