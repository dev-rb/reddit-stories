import * as React from 'react';
import { CommentDetails, IPost, Post, Posts } from '../../interfaces/reddit';
import { MdKeyboardBackspace } from 'react-icons/md';
import CommentDisplay from '../Comment';
import styles from './commentsContainer.module.css';
import { useRouter } from 'next/router';
import useFixedNavbar from '../../hooks/useFixedNavbar';

interface Props {
    post?: IPost,
    postId: string | string[] | undefined
}
const CommentsContainer = ({ post, postId }: Props) => {

    const headerRef = React.useRef(null);
    const [stories, setStories] = React.useState<CommentDetails[]>();
    const router = useRouter();

    useFixedNavbar(headerRef, true);

    React.useEffect(() => {

    }, [])

    return (
        <div className={styles.commentsContainer}>
            <div ref={headerRef} className={styles.navigationBar}>
                <MdKeyboardBackspace size={30} color="white" onClick={() => { router.back() }} />
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