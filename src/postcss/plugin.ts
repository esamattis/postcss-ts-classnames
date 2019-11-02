import postcss from "postcss";
import { ClassNameCollector } from "./class-name-collector";

type ConstructorParameters<T> = T extends new (...args: infer U) => any
    ? U
    : never;

function getSingleton<T extends { new (...args: any[]): any }>(
    key: string,
    klass: T,
    options: ConstructorParameters<T>[0],
): InstanceType<T> {
    const anyGlobal = global as any;

    let instance: InstanceType<T> = anyGlobal[key];

    if (!instance) {
        instance = anyGlobal[key] = new klass(options);
    }

    return instance;
}

export function createPlugin(collector: ClassNameCollector) {
    return postcss.plugin("ts-classnames/postcss", _options => {
        const options = _options as Partial<{
            dest: string;
        }>;

        if (options.dest) {
            collector.dest = options.dest;
        }

        return function(root) {
            collector.process(root);
        };
    });
}

export default createPlugin(
    getSingleton("ts-classname-instance", ClassNameCollector, {
        dest: "src/classnames.d.ts",
    }),
);
