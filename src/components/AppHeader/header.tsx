import { ThemeToggle } from './theme';

export const AppHeader = () => {
  return (
    <div class="mb-4 h-full w-full flex justify-between px-4 pt-4">
      <div class="flex flex-col text-xl color-white">
        <span class="font-bold">Tavern</span>
        <span>Tales</span>
      </div>
      <ThemeToggle />
    </div>
  );
};
