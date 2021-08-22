import { useRouter } from 'next/router';
import * as React from 'react';
import CommentsContainer from '../../components/CommentsContainer';

const CommentsOfPostId = () => {
    const router = useRouter()
    const { pid } = router.query;

    return (
        <CommentsContainer postId={pid} />
    );
}

export default CommentsOfPostId;