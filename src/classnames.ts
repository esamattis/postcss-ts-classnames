const originalClassNames = require("classnames");

type ClassNameRecord<T extends string> = Partial<
    Record<T, boolean | undefined | null>
>;

type Variants<T extends string> =
    | T
    | ClassNameRecord<T>
    | (T | ClassNameRecord<T> | null | undefined | boolean)[]
    | null
    | undefined
    | boolean;

export interface ClassNamesFunction<T extends string> {
    (...args: Variants<T>[]): string;
}

export function createClassNames<T extends string>() {
    return function classNames(...args: Variants<T>[]): string {
        return originalClassNames(...args);
    };
}
