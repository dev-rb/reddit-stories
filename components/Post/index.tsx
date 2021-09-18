import * as React from 'react';
import Link from 'next/link';
import styles from './post.module.css';
import { CommentDetails, IPost } from '../../interfaces/reddit';
import { MdFileDownload } from 'react-icons/md';
import { BsClockHistory } from 'react-icons/bs';

const Post = ({ title, id, score, author, permalink, stories, created }: IPost) => {
    // href={`https://www.reddit.com${permalink}`}

    const [dragTimer, setDragTimer] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const [mousePos, setMousePos] = React.useState(0);
    const timerRef = React.useRef<NodeJS.Timer>();

    const postRef = React.useRef<HTMLDivElement>(null);
    const swipeOptionsRef = React.useRef<HTMLDivElement>(null);

    const onDragPost = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        timerRef.current = setInterval(() => {
            setDragTimer((prev) => prev + 1);
        }, 50);
    }

    const stopDragging = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        if (isDragging) {
            resetDrag();
        }
    }

    const onDragging = (e: React.MouseEvent<HTMLDivElement>) => {
        setMousePos(Math.min(Math.max(-100, e.clientX - 960), 100));
    }

    const handleSwipeOptions = (setTo: boolean, childIndex?: number, changeBoth: boolean = false) => {
        let swipeOptions = swipeOptionsRef.current;

        if (swipeOptions) {
            if (!changeBoth) {
                if (childIndex !== undefined) {
                    swipeOptions.children[childIndex].toggleAttribute('visible', setTo);
                }
            } else {
                swipeOptions.children[0].toggleAttribute('visible', setTo);
                swipeOptions.children[1].toggleAttribute('visible', setTo);
            }
        }
    }

    const resetDrag = () => {
        let post = postRef.current;
        let timer = timerRef.current;

        if (timer) {
            clearInterval(timer);
        }
        setIsDragging(false);
        handleSwipeOptions(false, undefined, true);

        if (post) {
            post.style.transform = 'none';
            post.style.boxShadow = 'none';
            setTimeout(() => { setDragTimer(0); }, 500)
        }

    }

    React.useEffect(() => {
        let timer = timerRef.current;
        let post = postRef.current;
        if (dragTimer == 2 && timer) {
            clearInterval(timer);
            setIsDragging(true);
            if (post) {
                post.style.boxShadow = '0px 10px 6px black';
            }
        }
    }, [dragTimer])

    React.useEffect(() => {
        let post = postRef.current;

        if (isDragging) {
            if (post) {
                if (mousePos <= -60) {
                    handleSwipeOptions(true, 0);
                } else if (mousePos >= 60) {
                    handleSwipeOptions(true, 1);
                } else {
                    handleSwipeOptions(false, undefined, true);
                }
                post.style.transform = `translateX(${mousePos}px)`;
            }
        }
    }, [mousePos])

    React.useEffect(() => {
        if (!isDragging) {
            resetDrag();
        }
    }, [isDragging])

    return (
        <Link scroll={false} href={`/posts/${id}`}>
            <div className={styles.postParent}>
                <div ref={swipeOptionsRef} className={styles.swipeOptions}>
                    <div className={styles.swipeDownload}> <MdFileDownload size={30} color="white" /> </div>
                    <div className={styles.swipeReadLater}> <BsClockHistory size={30} color="white" /> </div>
                </div>
                <div ref={postRef} onClick={(e) => isDragging || dragTimer > 0 ? e.stopPropagation() : ''} onMouseDown={onDragPost} onMouseUp={stopDragging} onMouseLeave={stopDragging} onMouseMove={onDragging} className={styles.postContainer}>

                    <p> u/{author} </p>
                    <div className={styles.title}>
                        <p> {title.replace('[WP]', '').trim()} </p>
                    </div>
                    <div className={styles.details}>
                        <p> {score} </p>
                        <p> {created.daysAgo == 0 ? created.hoursAgo == 0 ? `${created.minutesAgo} minutes ago` : `${created.hoursAgo} hours ago` : `${created.daysAgo} days ago`} </p>
                    </div>
                </div>
            </div>
        </Link >
    );
}

export default Post;