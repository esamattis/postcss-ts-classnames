const _cn = require("classnames");

type Variants<T extends string> = T | Record<T, boolean | undefined | null>;

export interface ClassNamesFunction<T extends string> {
    (...args: Variants<T>[]): string;
}

export function createClassNames<T extends string>() {
    return function classNames(...args: Variants<T>[]): string {
        return _cn(...args);
    };
}
