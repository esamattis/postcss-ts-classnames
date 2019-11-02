import postcss from "postcss";
import { ClassNameCollector } from "./class-name-collector";

function getSingleton<T extends { new (...args: any[]): any }>(
    key: string,
    klass: T,
): InstanceType<T> {
    const anyGlobal = global as any;

    let instance: InstanceType<T> = anyGlobal[key];

    if (!instance) {
        instance = anyGlobal[key] = new klass();
    }

    return instance;
}

const collector = getSingleton("ts-classname-instance", ClassNameCollector);

export default postcss.plugin("ts-classnames/postcss", function(opts) {
    return async function(root, result) {
        if (!root.source) {
            return;
        }

        console.log("root", root.source.input.file);
        const end = collector.endDetector.start();

        root.walkRules(rule => {
            collector.process(rule);
        });

        await new Promise(r => setTimeout(r, 1000));

        end();

        await collector.endDetector.waitForEnd();
    };
});
