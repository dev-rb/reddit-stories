import * as React from 'react';

const useScrollDownHide = (ref: React.RefObject<HTMLDivElement | HTMLButtonElement>, animateOut?: boolean) => {

    React.useEffect(() => {
        let pageYOffset = window.pageYOffset;
        let element = ref.current;
        window.addEventListener("scroll", () => {
            let currentOffset = window.pageYOffset;
            if (pageYOffset > currentOffset) {
                if (element && animateOut) {
                    element.removeAttribute('style')
                }
            } else {
                if (element && animateOut) {
                    element.style.display = 'none'
                }
            }
            pageYOffset = currentOffset;
        });

        return () => {
            window.removeEventListener("scroll", () => {
                let currentOffset = window.pageYOffset;
                if (pageYOffset > currentOffset) {
                    if (element && animateOut) {
                        element.removeAttribute('style')
                    }
                } else {
                    if (element && animateOut) {
                        element.style.display = 'none'
                    }
                }
            });
        }
    }, [])


}

export default useScrollDownHide;