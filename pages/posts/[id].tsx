import { useRouter } from 'next/router';
import * as React from 'react';
import CommentsContainer from '../../components/CommentsContainer';

const CommentsOfPostId = () => {
    const router = useRouter()
    const { id } = router.query;

    return (
        <CommentsContainer postId={id} />
    );
}

export default CommentsOfPostId;