const { connect, JSONCodec } = require('nats');

class NatsClient {
    constructor() {
        this.nc = null;
        this.js = null;
        this.jc = JSONCodec();
    }

    async init() {
        const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
        try {
            this.nc = await connect({ servers: natsUrl });
            this.js = this.nc.jetstream();
            console.log(`Connected to NATS at ${natsUrl}`);
            await this.setupStreams();
        } catch (err) {
            console.error(`Error connecting to NATS: ${err.message}`);
            throw err;
        }
    }

    async setupStreams() {
        const jsm = await this.nc.jetstreamManager();
        const streams = [
            { name: 'NEXUS_RAW_EVENTS', subjects: ['nexus.events.*'] },
            { name: 'NEXUS_TASKS', subjects: ['nexus.tasks.*'] },
            { name: 'NEXUS_ROI', subjects: ['nexus.roi.*'] },
            { name: 'NEXUS_SYSTEM', subjects: ['nexus.system.*'] }
        ];

        for (const stream of streams) {
            try {
                await jsm.streams.add({ name: stream.name, subjects: stream.subjects });
                console.log(`Stream ${stream.name} created/verified`);
            } catch (err) {
                // If stream already exists, it might throw an error or we can check
                if (!err.message.includes('stream name already in use')) {
                    console.error(`Error creating stream ${stream.name}: ${err.message}`);
                }
            }
        }
    }

    async publish(subject, data) {
        if (!this.js) throw new Error('NATS JetStream not initialized');
        return await this.js.publish(subject, this.jc.encode(data));
    }

    async subscribe(subject, callback, options = {}) {
        if (!this.js) throw new Error('NATS JetStream not initialized');
        const sub = await this.js.subscribe(subject, options);
        (async () => {
            for await (const m of sub) {
                try {
                    const data = this.jc.decode(m.data);
                    await callback(data, m);
                } catch (err) {
                    console.error(`Error processing message on ${subject}: ${err.message}`);
                    m.nak();
                }
            }
        })();
        return sub;
    }
}

module.exports = new NatsClient();
