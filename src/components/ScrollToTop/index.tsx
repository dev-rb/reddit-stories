import * as React from 'react';
import { ActionIcon } from '@mantine/core';
import { BsChevronDoubleUp } from 'react-icons/bs';
import useScrollDownHide from 'src/hooks/useScrollDownHide';

const ScrollToTopButton = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useScrollDownHide({ ref, animateOut: true, hideAtTop: true })

    const scrollToTop = () => {
        document.scrollingElement?.scrollTo({ top: 0 });
    }

    return (
        <ActionIcon ref={ref} variant="filled" radius='xl' size='xl' onClick={scrollToTop} sx={{ position: 'fixed', bottom: 100, right: 20, zIndex: 100, transition: '0.5s ease' }}>
            <BsChevronDoubleUp size={24} />
        </ActionIcon>
    );
}

export default ScrollToTopButton;