import * as React from 'react';

export const useSwipeControls = (postRef: React.RefObject<HTMLDivElement>, updateForRequest: (requestType: string, setTo?: boolean) => void) => {
    const [postWidth, setPostWidth] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startDrag, setStartDrag] = React.useState(false);
    const [mousePos, setMousePos] = React.useState(0);

    const [downloadRequest, setDownloadRequest] = React.useState(false);
    const [readLaterRequest, setReadLaterRequest] = React.useState(false);

    const onDragPost = (e: React.TouchEvent<HTMLDivElement>) => {
        setStartDrag(true);
    }

    const onDragStop = (e: React.TouchEvent<HTMLDivElement>) => {
        let post = postRef.current;
        if (isDragging && post) {
            if (downloadRequest) {
                post.style.transform = `translateX(-100vw)`;
            } else if (readLaterRequest) {
                post.style.transform = `translateX(100vw)`;
            }
            updateForRequest('pending')

            setTimeout(() => {
                resetDrag();
            }, downloadRequest || readLaterRequest ? 1000 : 0)
        }
    }

    const onDragging = (e: React.TouchEvent<HTMLDivElement>) => {
        setMousePos((prev) => Math.min(Math.max(-100, e.touches[0].clientX - postWidth), 100));
    }

    const handleSwipeOptions = (download: boolean = false, readLater: boolean = false) => {
        let post = postRef.current;

        if (post) {
            post.toggleAttribute('downloadRequest', download);
            setDownloadRequest(download);

            post.toggleAttribute('readLaterRequest', readLater);
            setReadLaterRequest(readLater);
        }
    }

    const resetDrag = () => {
        let post = postRef.current;

        setIsDragging(false);
        setStartDrag(false);
        handleSwipeOptions();
        updateForRequest(downloadRequest ? 'download' : readLaterRequest ? 'readLater' : '')

        if (post) {
            post.style.transform = 'none';
        }
    }

    React.useEffect(() => {
        if (startDrag) {
            setIsDragging(true);
        }
    }, [startDrag])

    React.useEffect(() => {
        let post = postRef.current;

        if (isDragging) {
            if (post) {
                if (mousePos <= -100) {
                    handleSwipeOptions(true);
                } else if (mousePos >= 100) {
                    handleSwipeOptions(undefined, true);
                } else {
                    handleSwipeOptions();
                }
                post.style.transform = `translateX(${mousePos}px)`;
            }
        }
    }, [mousePos])


    React.useEffect(() => {
        let post = postRef.current;

        if (post) {
            setPostWidth((post.getBoundingClientRect().left + (post.getBoundingClientRect().width / 2)));
        }
    }, [postRef.current])

    return { onDragPost, onDragging, onDragStop, isDragging, startDrag, downloadRequest, readLaterRequest }
}