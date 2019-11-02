import debounce from "lodash.debounce";

export class EndDetector {
    private onEnd: VoidFunction;
    private jobs: Record<string, boolean | undefined>;
    private allJobsDone?: Promise<void>;
    private resolveAll?: VoidFunction;
    private debouncedEnd: {
        (): void;
        cancel(): void;
    };

    constructor(options: { onEnd: VoidFunction }) {
        this.onEnd = options.onEnd;
        this.jobs = {};
        this.allJobsDone = undefined;

        this.debouncedEnd = debounce(() => {
            if (!this.isAllDone()) {
                console.log("de not all done");
                return;
            }

            if (this.resolveAll) {
                this.resolveAll();
            } else {
                console.log("de not all done");
            }
        }, 100);
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
        this.debouncedEnd.cancel();
        const id = Math.random();
        console.log("start", id);
        this.jobs[id] = false;

        return () => {
            console.log("end", id);
            this.jobs[id] = true;
            this.debouncedEnd();
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

        await new Promise(r => setTimeout(r, 100));

        await this.allJobsDone;
    }

    isAllDone() {
        return Object.values(this.jobs).every(Boolean);
    }
}
