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
