import postcss from "postcss";
import {
    ClassNameCollector,
    ClassNameCollectorOptions,
} from "./class-name-collector";

export function getSingleton(): ClassNameCollector {
    const key = "ts-classname-collector";
    const anyGlobal = global as any;

    let instance: ClassNameCollector = anyGlobal[key];

    if (!instance) {
        instance = anyGlobal[key] = new ClassNameCollector({
            dest: "src/classnames.d.ts",
        });
    }

    return instance;
}

export function createPlugin(collector: ClassNameCollector) {
    return postcss.plugin("postcss-ts-classnames", _userOptions => {
        const userOptions = _userOptions as
            | Partial<ClassNameCollectorOptions>
            | undefined;

        if (userOptions && userOptions.dest) {
            collector.dest = userOptions.dest;
        }
        if (userOptions && userOptions.isModule) {
            collector.isModule = userOptions.isModule;
        }

        return root => {
            collector.process(root);
        };
    });
}

export default createPlugin(getSingleton());
