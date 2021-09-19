import * as React from 'react';
import Link from 'next/link';
import styles from './post.module.css';
import { CommentDetails, IPost } from '../../interfaces/reddit';
import { MdFileDownload } from 'react-icons/md';
import { BsClockHistory } from 'react-icons/bs';
import { useSwipeControls } from '../../hooks/useSwipeControls';

const Post = ({ title, id, score, author, permalink, stories, created }: IPost) => {
    // href={`https://www.reddit.com${permalink}`}

    const postRef = React.useRef<HTMLDivElement>(null);

    const [requests, setRequests] = React.useState({ download: false, readLater: false, pending: false });

    const updateForRequest = (typeOfRequest: string, setTo: boolean = false) => {
        if (typeOfRequest === 'download') {
            setRequests((prev) => ({ ...prev, download: true, pending: false }));
        } else if (typeOfRequest === 'readLater') {
            setRequests((prev) => ({ ...prev, readLater: true, pending: false }));
        } else if (typeOfRequest === 'pending') {
            setRequests((prev) => ({ ...prev, pending: true }));
        }
    }

    const { onDragPost, onDragging, onDragStop, downloadRequest, readLaterRequest } = useSwipeControls(postRef, updateForRequest);

    return (
        <Link scroll={false} href={`/posts/${id}`}>
            <div className={styles.postParent}>
                {requests.pending &&
                    <div className={styles.pendingRequest}>
                        <h1> Loading... </h1>
                    </div>
                }

                {requests.pending != true ?
                    <div className={styles.typeOfRequestBeingMade}>
                        {downloadRequest ? <MdFileDownload size={40} color={'white'} /> : readLaterRequest ? <BsClockHistory size={40} color={'white'} /> : ''}
                    </div>
                    : ''
                }

                <div ref={postRef} onTouchStart={onDragPost} onTouchEnd={onDragStop} onTouchCancel={onDragStop} onTouchMove={onDragging} className={styles.postContainer}>

                    <div className={styles.postHeaderInformation}>
                        <p> u/{author} </p>
                        <div className={styles.informationBadges}>
                            <MdFileDownload size={16} color={requests.download ? '#3079F8' : '#313131'} />
                            <BsClockHistory size={16} color={requests.readLater ? '#3079F8' : '#313131'} />
                        </div>
                    </div>
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