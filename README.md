# postcss-ts-classnames

[PostCSS][] plugin to generate TypeScript types from **your** CSS class names.

[postcss]: https://postcss.org/

It generates a global `ClassNames` type which is a union of all classes
used in your project whether written by you or from a framework such as
Bootstrap or Tailwind (can get slow...).

Ex. for css

```css
.button {
    background: green;
}

.button-danger {
    background: red;
}
```

you'll get

```ts
type ClassNames = "button" | "button-danger";
```

With it you can create a helper function like

```ts
function cn(...args: ClassNames[]) {
    return args.join(" ");
}
```

and have your editor autocomplete and validate the class names:

![vscode demo](.demos/autocomplete.gif?raw=true "VSCode demo")

## Setup

Install the plugin

    npm install postcss-ts-classnames

In your PostCSS config add it close to the end before optimizing plugins such
as cssnano or purgecss:

```js
module.exports = {
    plugins: [
        require("postcss-import"),
        require("tailwindcss"),

        require("postcss-ts-classnames")({
            dest: "src/classnames.d.ts",
            // Set isModule if you want to import ClassNames from another file
            isModule: true,
        }),

        require("@fullhuman/postcss-purgecss")({
            content: ["./src/**/*.html"],
        }),
    ],
};
```

## ts-classnames

There's also a `ts-classnames` module which is re-exported version of the
original [classnames][] which uses the generated `ClassNames` type to
validate the class names

[classnames]: https://www.npmjs.com/package/classnames

Install

    npm install ts-classnames

Import

```ts
import { cn } from "ts-classnames";
```

## Vanilla JavaScript

If you don't use TypeScript you can still leverage this as VSCode can pick up
TypeScript types from JSDoc comments so you can do

```js
/**
 * @param {ClassNames[]} args
 */
function cn(...args) {
    return args.join(" ");
}
```

This will give the autocomplete but if you want the class names checking you
can add [`// @ts-check`][js] to the top of the file.

The `ts-classnames` will work with Vanilla JS too.

[js]: https://github.com/microsoft/TypeScript/wiki/Type-Checking-JavaScript-Files
