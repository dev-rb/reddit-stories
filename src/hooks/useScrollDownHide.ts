import * as React from 'react';

interface Options {
    ref: React.RefObject<HTMLElement>,
    exit?: (element: HTMLElement) => void,
    enter?: (element: HTMLElement) => void,
    animateOut?: boolean
}

const useScrollDownHide = ({ ref, animateOut, exit, enter }: Options) => {

    React.useEffect(() => {
        let pageYOffset = window.pageYOffset;
        let element = ref.current;
        window.addEventListener("scroll", () => {
            let currentOffset = window.pageYOffset;
            if (pageYOffset > currentOffset) {
                if (element && animateOut) {
                    if (enter) {
                        enter(element);
                    } else {
                        element.removeAttribute('style')
                    }
                }
            } else {
                if (element && animateOut) {
                    if (exit) {
                        exit(element);
                    } else {
                        element.style.display = 'none'
                    }
                }
            }
            pageYOffset = currentOffset > 0 ? currentOffset : 0;
        });

        return () => {
            window.removeEventListener("scroll", () => {
                let currentOffset = window.pageYOffset;
                if (pageYOffset > currentOffset) {
                    if (element && animateOut) {
                        if (enter) {
                            enter(element);
                        } else {
                            element.removeAttribute('style')
                        }
                    }
                } else {
                    if (element && animateOut) {
                        if (exit) {
                            exit(element);
                        } else {
                            element.style.display = 'none'
                        }
                    }
                }
            });
        }
    }, [])


}

export default useScrollDownHide;