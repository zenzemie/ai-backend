class ThompsonSampling {
    constructor(arms) {
        this.arms = arms; // Array of strategy IDs
        this.stats = {}; // strategyId -> { alpha (successes), beta (failures) }
        
        for (const arm of arms) {
            this.stats[arm] = { alpha: 1, beta: 1 }; // Uniform prior
        }
    }

    // Sample from a Beta distribution
    // Simplified Beta sampler
    sampleBeta(alpha, beta) {
        // Approximate Beta sampling using Gamma distributions if available, 
        // but for now a simpler approximation or a known library would be better.
        // Let's use a simple normal approximation for demonstration if alpha/beta are large
        // Or just a simple implementation.
        
        let x = this.sampleGamma(alpha);
        let y = this.sampleGamma(beta);
        return x / (x + y);
    }

    sampleGamma(alpha) {
        // Simple Gamma sampler (Marsaglia and Tsang)
        if (alpha < 1) return this.sampleGamma(1 + alpha) * Math.pow(Math.random(), 1 / alpha);
        const d = alpha - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);
        while (true) {
            let x, v;
            do {
                x = this.normalRandom();
                v = 1 + c * x;
            } while (v <= 0);
            v = v * v * v;
            const u = Math.random();
            if (u < 1 - 0.0331 * x * x * x * x) return d * v;
            if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
        }
    }

    normalRandom() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    select() {
        let bestArm = null;
        let maxSample = -1;

        for (const arm of this.arms) {
            const sample = this.sampleBeta(this.stats[arm].alpha, this.stats[arm].beta);
            if (sample > maxSample) {
                maxSample = sample;
                bestArm = arm;
            }
        }
        return bestArm;
    }

    update(arm, reward) {
        // reward should be between 0 and 1
        if (reward > 0.5) {
            this.stats[arm].alpha += 1;
        } else {
            this.stats[arm].beta += 1;
        }
    }
}

module.exports = ThompsonSampling;
