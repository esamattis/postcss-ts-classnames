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

/**
 * Using user defined ClassNames type
 */
export const cn: ClassNamesFunction<ClassNames>;
export const classNames: ClassNamesFunction<ClassNames>;
export default cn;
