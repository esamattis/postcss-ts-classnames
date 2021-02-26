import createSelectorParser from "postcss-selector-parser";
import { promises as fs } from "fs";
import { Rule, Root } from "postcss";
import debounce from "lodash.debounce";

export interface ClassNameCollectorOptions {
    dest?: string;
    isModule?: boolean;
    exportAsDefault?: boolean;
}

export class ClassNameCollector {
    classNames: Map<string, undefined | Set<string>>;
    dest?: string;
    isModule?: boolean;
    exportAsDefault?: boolean;

    waiters = [] as VoidFunction[];

    constructor(options: ClassNameCollectorOptions) {
        this.dest = options.dest;
        this.isModule = options.isModule;
        this.exportAsDefault = options.exportAsDefault;
        this.classNames = new Map();
    }

    debouncedWrite = debounce(async () => {
        if (this.dest) {
            await fs.writeFile(this.dest, this.getTypeScriptFileContent());
        }

        this.waiters.forEach(resolve => resolve());
        this.waiters = [];
    }, 100);

    async waitForWrite() {
        return new Promise(resolve => {
            this.waiters.push(resolve);
        });
    }

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

    getTypeScriptFileContent() {
        const comment = '// This file is auto-generated with postcss-ts-classnames.';
        const prefix = '  | ';
        const names = this.getClassNames()
            .map(n => `"${n}"`)
            .join(`\n${prefix}`);

        if (this.isModule) {
           const result = `${comment}\n\nexport type ClassNames =\n${prefix}${names};`;
           return (this.exportAsDefault)
             ? result + '\n\nexport default ClassNames;'
             : result;
        }
        return `${comment}\n\ntype ClassNames =\n${prefix}${names};`;
    }

    process(root: Root) {
        if (!root.source) {
            return;
        }

        const file = root.source.input.file;

        if (!file) {
            return;
        }

        // clear classes from previous file version
        this.classNames.delete(file);

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
