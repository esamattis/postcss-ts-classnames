export class EndDetector {
    private onEnd: VoidFunction;
    private jobs: Record<string, boolean | undefined>;
    private allJobsDone?: Promise<void>;
    private resolveAll?: VoidFunction;

    constructor(options: { onEnd: VoidFunction }) {
        this.onEnd = options.onEnd;
        this.jobs = {};
        this.allJobsDone = undefined;
    }

    private initialize() {
        if (this.allJobsDone) {
            return;
        }

        this.allJobsDone = new Promise(resolve => {
            this.resolveAll = resolve;
        }).then(() => {
            this.onEnd();
            this.reset();
        });
    }

    start() {
        this.initialize();
        const id = Math.random();
        this.jobs[id] = false;

        return () => {
            this.jobs[id] = true;
            if (this.isAllDone()) {
                if (this.resolveAll) {
                    this.resolveAll();
                }
            }
        };
    }

    private reset() {
        this.jobs = {};
        this.allJobsDone = undefined;
    }

    async waitForEnd() {
        if (!this.allJobsDone) {
            throw new Error("nothing to wait for?");
        }

        await this.allJobsDone;
    }

    isAllDone() {
        return Object.values(this.jobs).every(Boolean);
    }
}
