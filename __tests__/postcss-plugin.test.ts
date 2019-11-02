import postcss from "postcss";
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
