import createSelectorParser from "postcss-selector-parser";
import { Rule, Root } from "postcss";
import debounce from "lodash.debounce";

export class ClassNameCollector {
    classNames: Map<string, undefined | Set<string>>;

    constructor(options: { dest?: string }) {
        this.classNames = new Map();
    }

    debouncedWrite = debounce(() => {
        console.log("write!!!!!!!!!!!!!!!!!!!!!!!!", this.getClassNames());
    }, 100);

    addClassName(file: string, className: string) {
        let classNames = this.classNames.get(file);

        if (!classNames) {
            classNames = new Set();
            this.classNames.set(file, classNames);
        }

        classNames.add(className);
        this.debouncedWrite();
    }

    getClassNames() {
        const allUniq = new Set<string>();

        for (const names of Array.from(this.classNames.values())) {
            if (names) {
                names.forEach(n => allUniq.add(n));
            }
        }

        return Array.from(allUniq).sort();
    }

    process(root: Root) {
        if (!root.source) {
            return;
        }

        const file = root.source.input.file;

        if (!file) {
            return;
        }

        const parser = createSelectorParser(selectors => {
            selectors.each(selector => {
                if (selector.type !== "selector") {
                    return;
                }

                for (const node of selector.nodes) {
                    if (node.type === "class") {
                        this.addClassName(file, node.toString().slice(1));
                    }
                }
            });
        });

        root.walkRules(rule => {
            parser.process(rule, { lossless: false });
        });
    }
}
