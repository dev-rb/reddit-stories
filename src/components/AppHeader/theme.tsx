import { DropdownMenu } from '@kobalte/core';

export const ThemeToggle = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger class="min-w-4 w-auto h-min flex-center aspect-square cursor-pointer bg-transparent">
        <span class="i-material-symbols:light-mode-outline inline-block text-xl color-white" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="w-auto py-2 bg-dark-6 rounded-lg">
          <DropdownMenu.RadioGroup class="w-full h-full flex flex-col" value="light">
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
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
