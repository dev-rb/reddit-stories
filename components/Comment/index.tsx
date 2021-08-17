import * as React from 'react';
import styles from './comment.module.css';
import ReactHTMLParser from 'react-html-parser'
import sanitize from 'sanitize-html';

interface Props {
    body: string,
    body_html: string,
    author: string,
    id: string,
    created: number,
    score: number
}

const CommentDisplay = ({ body, body_html, author, created, id, score }: Props) => {

    return (
        <div className={styles.commentContainer}>
            <div className={styles.bodyText}> {ReactHTMLParser(sanitize(body_html))} </div>

            <div className={styles.commentDetails}>
                <div className={styles.commentAuthorScore}>
                    <p> {score} </p>
                    <p> {author} </p>
                </div>
                <p> {(new Date(created * 1000).toLocaleString('en-US'))} </p>
            </div>
        </div>
    );
}

export default CommentDisplay;