import * as React from 'react';
import { ActionIcon, Affix, Transition } from '@mantine/core';
import { BsChevronDoubleUp } from 'react-icons/bs';
import { useWindowScroll } from '@mantine/hooks';

const ScrollToTopButton = () => {
  const ref = React.useRef<HTMLButtonElement>(null);

  const [scroll, scrollTo] = useWindowScroll();

  const scrollToTop = () => {
    scrollTo({ y: 0 });
  };

  return (
    <Affix position={{ bottom: 100, right: 20 }}>
      <Transition transition="slide-up" mounted={scroll.y > 0}>
        {(transitionStyles) => (
          <ActionIcon
            ref={ref}
            variant="filled"
            radius="xl"
            size="xl"
            onClick={scrollToTop}
            sx={{ zIndex: 100 }}
            style={transitionStyles}
          >
            <BsChevronDoubleUp size={24} />
          </ActionIcon>
        )}
      </Transition>
    </Affix>
  );
};

export default ScrollToTopButton;
