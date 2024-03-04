import { useLocation, useMatch, useNavigate, useParams } from '@solidjs/router';
import { ThemeToggle } from './theme';
import { Show } from 'solid-js';
import { Button, Image } from '@kobalte/core';
import { cn } from '~/utils/common';

export const AppHeader = () => {
  const navigate = useNavigate();
  const isPost = useMatch(() => '/post/*');

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div class={cn('mb-4 h-full w-full flex items-center justify-between px-4 pt-4')}>
      <div class="flex items-center gap-2 text-base color-white">
        <Show
          when={!isPost()}
          fallback={
            <Button.Root
              class="bg-transparent min-w-4 w-auto h-min flex-center color-white cursor-pointer"
              onClick={goBack}
            >
              <span class="i-material-symbols:arrow-back-rounded text-2xl" />
            </Button.Root>
          }
        >
          <img class="max-w-10 max-sm:max-w-8 aspect-square" src="/logo192.png" alt="logo" />
          {/* <div class="flex items-center"> */}
          {/*   <span class="font-bold">Tavern</span> */}
          {/*   <span>Tales</span> */}
          {/* </div> */}
        </Show>
      </div>
      <ThemeToggle />
    </div>
  );
};
