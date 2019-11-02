type ClassNameRecord<K extends string> = {
    [P in K]?: boolean | null | undefined;
};

type Variants<T extends string> =
    | T
    | ClassNameRecord<T>
    | null
    | undefined
    | boolean;

export interface ClassNamesFunction<T extends string> {
    (...args: Variants<T>[]): string;
}

/**
 * Using user defined ClassNames type
 */
export const cn: ClassNamesFunction<ClassNames>;
export const classNames: ClassNamesFunction<ClassNames>;
export default cn;
