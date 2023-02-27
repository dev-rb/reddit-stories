import { Center, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import * as React from 'react';
import CommentsContainer from '../../components/CommentsContainer';

const CommentsOfPostId = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id || Array.isArray(id)) {
    return (
      <Center>
        <Text> Nothing here </Text>
      </Center>
    );
  }

  return <CommentsContainer postId={id} />;
};

export default CommentsOfPostId;
