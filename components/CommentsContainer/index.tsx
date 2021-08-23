import * as React from 'react';
import useSWR from 'swr';
import { storiesForPostWithId } from '../../helpers/cleanData';
import { fetchFromUrl } from '../../helpers/fetchData';
import { CommentDetails, IPost } from '../../interfaces/reddit';
import { MdKeyboardBackspace } from 'react-icons/md';
import CommentDisplay from '../Comment';
import styles from './commentsContainer.module.css';

interface Props {
    post?: IPost,
    postId: string | string[] | undefined
}
const CommentsContainer = ({ post, postId }: Props) => {
    let { data } = useSWR(`/r/WritingPrompts/comments/${postId}`, fetchFromUrl)
    const [stories, setStories] = React.useState<CommentDetails[]>();

    React.useEffect(() => {
        if (data) {
            let fetchedStories = storiesForPostWithId(data);
            setStories(fetchedStories);
        }
    }, [data])

    React.useEffect(() => {
        let pageYOffset = window.pageYOffset;

        window.addEventListener("scroll", () => {
            let currentOffset = window.pageYOffset;
            let navBar = document.getElementById('navBar');
            if (pageYOffset > currentOffset) {
                if (navBar) {
                    navBar.style.top = "0px";
                }
            } else {
                if (navBar) {
                    navBar.style.top = `-${currentOffset}px`;
                }
            }
            pageYOffset = currentOffset;
        });


        return () => {
            window.removeEventListener("scroll", () => {
                let currentOffset = window.pageYOffset;
                let navBar = document.getElementById('navBar');
                if (pageYOffset > currentOffset) {
                    if (navBar) {
                        navBar.style.top = "0px";
                    }
                } else {
                    if (navBar) {
                        navBar.style.top = `-${currentOffset}px`;
                    }
                }
            });
        }
    }, [])

    return (
        <div className={styles.commentsContainer}>
            <div id="navBar" className={styles.navigationBar}>
                <MdKeyboardBackspace size={30} color="white" />
            </div>
            <div className={styles.stories}>
                {stories?.map((story) => {
                    return <CommentDisplay key={story.id} body={story.body} body_html={story.body_html} author={story.author} created={story.created} id={story.id} score={story.score} />
                })}
            </div>
        </div>
    );

}

export default CommentsContainer;