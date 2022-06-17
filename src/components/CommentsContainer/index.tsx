import * as React from 'react';
import { CommentDetails, IPost, Post, Posts } from '../../interfaces/reddit';
import { MdKeyboardBackspace } from 'react-icons/md';
import CommentDisplay from '../Comment';
import styles from './commentsContainer.module.css';
import { useRouter } from 'next/router';
import useFixedNavbar from '../../hooks/useFixedNavbar';
import { useGetCommentsForPostQuery } from '../../redux/services';
import { formatStoriesData } from '../../helpers/cleanData';

interface Props {
    post?: IPost,
    postId: string
}
const CommentsContainer = ({ post, postId }: Props) => {

    const headerRef = React.useRef(null);
    const [stories, setStories] = React.useState<CommentDetails[]>();
    const router = useRouter();

    const { data } = useGetCommentsForPostQuery(postId);

    useFixedNavbar(headerRef, true);

    React.useEffect(() => {
        if (data) {
            // console.log(data)
            setStories(data);
        }
    }, [data])

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