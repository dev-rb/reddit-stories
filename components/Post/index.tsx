import Link from 'next/link';
import styles from './post.module.css';
import { CommentDetails, IPost } from '../../interfaces/reddit';

const Post = ({ title, id, score, author, permalink, stories, created }: IPost) => {
    // href={`https://www.reddit.com${permalink}`}

    return (
        <Link scroll={false} href={`/posts/${id}`}>
            <div className={styles.postContainer}>

                <p> u/{author} </p>
                <div className={styles.title}>
                    <p> {title.replace('[WP]', '').trim()} </p>
                </div>
                <div className={styles.details}>
                    <p> {score} </p>
                    <p> {created.hoursAgo == 0 ? `${created.minutesAgo} minutes ago` : `${created.hoursAgo} hours ago`} </p>
                </div>
            </div>
        </Link >
    );
}

export default Post;