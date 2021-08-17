import Link from 'next/link';
import styles from './post.module.css';
import { CommentDetails } from '../../interfaces/reddit';

interface PostData {
    title: string,
    id: string,
    score: number,
    author: string,
    permalink: string,
    stories: CommentDetails[],
    created: number,
    selectPost: (id: string) => void
}

const Post = ({ title, id, score, author, permalink, stories, created, selectPost }: PostData) => {
    // href={`https://www.reddit.com${permalink}`}

    return (
        <Link href={`/posts/${id}`}>
            <div onClick={() => selectPost(id)} className={styles.postContainer}>

                <p> {(new Date(created * 1000).toLocaleString('en-US'))} </p>
                <div className={styles.title}>
                    <p> {title.replace('[WP]', '').trim()} </p>
                </div>
                <div className={styles.details}>
                    <p> {score} </p>
                    <p> u/{author} </p>
                </div>
            </div>
        </Link >
    );
}

export default Post;