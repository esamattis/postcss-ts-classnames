import { createClassNames } from "../src/classnames";

test("can use objects", () => {
    const cn = createClassNames<"foo" | "bar">();

    const className = cn("foo", {
        bar: true,
    });

    expect(className).toEqual("foo bar");
});
