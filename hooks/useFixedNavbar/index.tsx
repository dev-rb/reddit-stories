import * as React from 'react';

const useFixedNavbar = (ref: React.RefObject<HTMLDivElement>, animateOut?: boolean) => {

    React.useEffect(() => {
        let pageYOffset = window.pageYOffset;

        let navBar = ref.current;
        window.addEventListener("scroll", () => {
            let currentOffset = window.pageYOffset;
            if (pageYOffset > currentOffset) {
                if (navBar && animateOut) {
                    navBar.style.top = "0px";
                }
            } else {
                if (navBar && animateOut) {
                    navBar.style.top = `-${currentOffset}px`;
                }
            }
            pageYOffset = currentOffset;
        });

        return () => {
            window.removeEventListener("scroll", () => {
                let currentOffset = window.pageYOffset;
                if (pageYOffset > currentOffset) {
                    if (navBar && animateOut) {
                        navBar.style.top = "0px";
                    }
                } else {
                    if (navBar && animateOut) {
                        navBar.style.top = `-${currentOffset}px`;
                    }
                }
            });
        }
    }, [])


}

export default useFixedNavbar;