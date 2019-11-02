import postcss from "postcss";
import PathUtils from "path";
import { sh } from "sh-thunk";
import { promises as fs } from "fs";
import { createPlugin } from "../src/postcss/plugin";
import { ClassNameCollector } from "../src/postcss/class-name-collector";

function css(literals: TemplateStringsArray, ...placeholders: string[]) {
    let result = "";

    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
        result += literals[i];
        result += placeholders[i];
    }

    // add the last literal
    result += literals[literals.length - 1];
    return result;
}

async function run(collector: ClassNameCollector, cssString: string) {
    await postcss([createPlugin(collector)]).process(cssString, {
        from: "test.css",
    });
}

test("single class", async () => {
    const collector = new ClassNameCollector({});

    await run(
        collector,
        css`
            .foo {
                color: red;
            }
        `,
    );

    expect(collector.getClassNames()).toEqual(["foo"]);
});

test(":hover", async () => {
    const collector = new ClassNameCollector({});

    await run(
        collector,
        css`
            .foo:hover {
                color: red;
            }
        `,
    );

    expect(collector.getClassNames()).toEqual(["foo"]);
});

test("media query nesting", async () => {
    const collector = new ClassNameCollector({});

    await run(
        collector,
        css`
            @media (min-width: 640px) {
                .foo {
                    color: red;
                }
            }
        `,
    );

    expect(collector.getClassNames()).toEqual(["foo"]);
});

test("single two classes", async () => {
    const collector = new ClassNameCollector({});

    await run(
        collector,
        css`
            .foo {
                color: red;
            }
            .bar {
                color: green;
            }
        `,
    );

    expect(collector.getClassNames()).toEqual(["bar", "foo"]);
});

test("nested classes", async () => {
    const collector = new ClassNameCollector({});

    await run(
        collector,
        css`
            .foo .bar .baz {
                color: red;
            }
        `,
    );

    expect(collector.getClassNames()).toEqual(["bar", "baz", "foo"]);
});

test("nested classes under other selectors", async () => {
    const collector = new ClassNameCollector({});

    await run(
        collector,
        css`
            p .foo {
                color: red;
            }
        `,
    );

    expect(collector.getClassNames()).toEqual(["foo"]);
});

test("comma separated classes", async () => {
    const collector = new ClassNameCollector({});

    await run(
        collector,
        css`
            .foo,
            .bar,
            .baz {
                color: red;
            }
        `,
    );

    expect(collector.getClassNames()).toEqual(["bar", "baz", "foo"]);
});

test("multiple files", async () => {
    const collector = new ClassNameCollector({});

    const post = postcss([createPlugin(collector)]);

    await post.process(
        css`
            .foo {
                color: red;
            }
        `,
        {
            from: "foo-file.css",
        },
    );

    await post.process(
        css`
            .bar {
                color: red;
            }
        `,
        {
            from: "bar-file.css",
        },
    );

    expect(collector.getClassNames()).toEqual(["bar", "foo"]);
});

test("can remove classes", async () => {
    const collector = new ClassNameCollector({});

    const post = postcss([createPlugin(collector)]);

    await post.process(
        css`
            .foo {
                color: red;
            }
            .bar {
                color: green;
            }
        `,
        {
            from: "foo-file.css",
        },
    );

    expect(collector.getClassNames()).toEqual(["bar", "foo"]);

    await collector.waitForWrite();

    await post.process(
        css`
            .foo {
                color: red;
            }
        `,
        {
            from: "foo-file.css",
        },
    );

    expect(collector.getClassNames()).toEqual(["foo"]);
});

describe("files", () => {
    let dir = "___noope";

    beforeEach(async () => {
        dir = await fs.mkdtemp(".ts-classnames-test");
    });

    afterEach(async () => {
        await sh`rm -r ${dir}`();
    });

    test("can write the type file", async () => {
        console.log("dir", dir);
        const dest = PathUtils.join(dir, "types.d.ts");

        const collector = new ClassNameCollector({
            dest,
        });

        await run(
            collector,
            css`
                .foo,
                .bar,
                .baz {
                    color: red;
                }
            `,
        );

        await collector.waitForWrite();

        const content = await fs.readFile(dest);

        expect(content.toString()).toEqual(
            `type ClassNames = "bar" | "baz" | "foo";`,
        );
    });
});
