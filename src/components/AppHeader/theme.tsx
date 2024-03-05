import { DropdownMenu } from '@kobalte/core';
import { createSignal } from 'solid-js';
import { checkForDarkPreference, getCurrentTheme } from '~/utils/theme';

export const ThemeToggle = () => {
  const [theme, setTheme] = createSignal(getCurrentTheme());

  const onThemeChange = (theme: string) => {
    switch (theme) {
      case 'light': {
        localStorage.setItem('theme', 'light');
        setTheme('light');
        document.documentElement.classList.remove('dark');
        break;
      }
      case 'dark': {
        localStorage.setItem('theme', 'dark');
        setTheme('dark');
        document.documentElement.classList.add('dark');
        break;
      }
      case 'system': {
        localStorage.removeItem('theme');
        setTheme('system');
        if (checkForDarkPreference()) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        break;
      }
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger class="min-w-4 w-auto h-min flex-center aspect-square cursor-pointer bg-transparent">
        <span class="i-material-symbols:light-mode-outline inline-block text-xl color-dark-7 dark:color-white" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content class="z-9999 w-auto py-2 bg-neutral-1 border-1 border-solid border-neutral-2 dark:(bg-dark-6 border-none) rounded-lg">
        <DropdownMenu.RadioGroup class="w-full h-full flex flex-col" value={theme()} onChange={onThemeChange}>
          <DropdownMenu.RadioItem
            class="w-full h-fit flex items-center gap-2 p-2 text-sm color-neutral-4 ui-checked:color-blue-5 hover:(ui-checked:color-blue-4 color-neutral-2 bg-blue-7/20)"
            value="light"
          >
            <span class="i-material-symbols:light-mode-outline text-base" />
            Light
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem
            class="w-full h-fit flex items-center gap-2 p-2 text-sm color-neutral-4 ui-checked:color-blue-5 hover:(ui-checked:color-blue-4 color-neutral-2 bg-blue-7/20)"
            value="dark"
          >
            <span class="i-material-symbols:dark-mode-outline text-base" />
            Dark
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem
            class="w-full h-fit flex items-center gap-2 p-2 text-sm color-neutral-4 ui-checked:color-blue-5 hover:(ui-checked:color-blue-4 color-neutral-2 bg-blue-7/20)"
            value="system"
          >
            <span class="i-material-symbols:computer-outline text-base" />
            System
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
