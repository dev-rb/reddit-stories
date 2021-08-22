import * as React from 'react';
import { IPost } from '../../interfaces/reddit';

import CommentDisplay from '../Comment';
import styles from './commentsContainer.module.css';

interface Props {
    post?: IPost,
    postId: string | string[] | undefined
}

const CommentsContainer = ({ post, postId }: Props) => {

    return (
        <div className={styles.commentsContainer}>
            {post?.stories.map((story) => {
                return <CommentDisplay key={story.id} body={story.body} body_html={story.body_html} author={story.author} created={story.created} id={story.id} score={story.score} />
            })}
        </div>
    );

}

export default CommentsContainer;