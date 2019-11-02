import createSelectorParser from "postcss-selector-parser";
import { Rule } from "postcss";
import { EndDetector } from "./end-detector";

export class ClassNameCollector {
    classNames: Map<string, undefined | Set<string>>;
    parser: ReturnType<typeof createSelectorParser>;
    endDetector: EndDetector;

    constructor() {
        this.classNames = new Map();
        this.endDetector = new EndDetector({
            onEnd() {
                console.log("END!!!");
            },
        });

        this.parser = createSelectorParser(selectors => {
            selectors.each(selector => {
                if (selector.type !== "root") {
                    return;
                }

                for (const node of selector.nodes) {
                    if (node.type === "class") {
                        this.addClassName("", node.toString());
                        console.log("class", node.toString());
                    }
                }
            });
        });
    }

    addClassName(file: string, className: string) {
        let classNames = this.classNames.get(file);

        if (!classNames) {
            classNames = new Set();
            this.classNames.set(file, classNames);
        }

        classNames.add(className);
    }

    process(rule: Rule) {
        this.parser.process(rule);
    }
}
