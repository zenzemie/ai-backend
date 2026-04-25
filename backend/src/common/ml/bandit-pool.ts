export class ThompsonSampling {
    private arms: string[];
    private stats: Record<string, { alpha: number; beta: number }>;

    constructor(arms: string[]) {
        this.arms = arms;
        this.stats = {};
        
        for (const arm of arms) {
            this.stats[arm] = { alpha: 1, beta: 1 };
        }
    }

    private sampleBeta(alpha: number, beta: number): number {
        const x = this.sampleGamma(alpha);
        const y = this.sampleGamma(beta);
        return x / (x + y);
    }

    private sampleGamma(alpha: number): number {
        if (alpha < 1) return this.sampleGamma(1 + alpha) * Math.pow(Math.random(), 1 / alpha);
        const d = alpha - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);
        while (true) {
            let x: number, v: number;
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

    private normalRandom(): number {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    select(): string {
        let bestArm: string = null;
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

    update(arm: string, reward: number): void {
        if (reward > 0.5) {
            this.stats[arm].alpha += 1;
        } else {
            this.stats[arm].beta += 1;
        }
    }

    getStats() {
        return this.stats;
    }
}
