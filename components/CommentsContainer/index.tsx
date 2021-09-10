import * as React from 'react';
import useSWR from 'swr';
import { storiesForPostWithId } from '../../helpers/cleanData';
import { fetchFromUrl } from '../../helpers/fetchData';
import { CommentDetails, IPost, Post, Posts } from '../../interfaces/reddit';
import { MdKeyboardBackspace } from 'react-icons/md';
import CommentDisplay from '../Comment';
import styles from './commentsContainer.module.css';
import { useRouter } from 'next/router';
import useFixedNavbar from '../../hooks/useFixedNavbar';
import { QueryClient, QueryKey, useQueryClient } from 'react-query';

interface Props {
    post?: IPost,
    postId: string | string[] | undefined
}
const CommentsContainer = ({ post, postId }: Props) => {
    let { data } = useSWR(`/r/WritingPrompts/comments/${postId}`, fetchFromUrl)
    let query = useQueryClient();

    const headerRef = React.useRef(null);
    const [stories, setStories] = React.useState<CommentDetails[]>();
    const router = useRouter();

    useFixedNavbar(headerRef, true);

    React.useEffect(() => {
        if (data) {
            let queryData: IPost[] | undefined = query.getQueryData("mainData", { exact: false });

            if (queryData) {
                console.log(queryData)
            }


            if (queryData !== undefined) {
                // let newData = queryData.find((v) => v.id === postId);
                // // let fetchedStories = storiesForPostWithId();
                // setStories(newData?.stories);
            }
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