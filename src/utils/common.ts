import { extendTailwindMerge, ClassNameValue } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'border-style': [{ border: ['b-solid', 't-solid', 'l-solid', 'r-solid', 'solid', 'y-solid', 'x-solid'] }],
    },
  },
});

export const cn = (...args: ClassNameValue[]) => {
  return customTwMerge(...args);
};

type MaybeFunction<T> = T | ((...args: any[]) => any);

type MaybeFunctionValue<T extends MaybeFunction<any>> = T extends (...args: any[]) => any ? ReturnType<T> : T;

type ParametersType<T extends MaybeFunction<any>> = Parameters<T extends (...args: any[]) => any ? T : never>;

export const access = <T extends MaybeFunction<any>>(value: T, ...args: ParametersType<T>): MaybeFunctionValue<T> => {
  if (typeof value === 'function') {
    return value(...args);
  }

  return value as MaybeFunctionValue<T>;
};
