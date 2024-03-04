import { isDev } from 'solid-js/web';
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

const LOG_ICONS: Record<LogType, string> = {
  log: '',
  info: 'ℹ',
  error: '❌',
  warn: '⚠',
  debug: '🐛',
};
type LogType = keyof Pick<Console, 'log' | 'info' | 'warn' | 'error' | 'debug'>;
export const log = (type: LogType, ...msg: any[]) => {
  if (!isDev) return;

  console[type](`%c[${LOG_ICONS[type]} tavern-tales]: `, 'color:lightblue', ...msg);
};
