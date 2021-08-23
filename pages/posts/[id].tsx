import { useRouter } from 'next/router';
import * as React from 'react';
import CommentsContainer from '../../components/CommentsContainer';
import { storiesForPostWithId } from '../../helpers/cleanData';

const CommentsOfPostId = () => {
    const router = useRouter()
    const { id } = router.query;

    return (
        <CommentsContainer postId={id} />
    );
}

export default CommentsOfPostId;