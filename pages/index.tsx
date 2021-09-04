import * as React from 'react';
import type { NextPage } from 'next';
import useSWR from 'swr';
import Head from 'next/head';
import Image from 'next/image';
import CommentsContainer from '../components/CommentsContainer';
import Post from '../components/Post';
import { CommentDetails, IPost } from '../interfaces/reddit';
import styles from '../styles/Home.module.css';
import { fetchFromUrl } from '../helpers/fetchData';
import { getAllPrompts } from '../helpers/cleanData';

// TODO: Add scroll restoration when going back from pages

const Home: NextPage = () => {

  const { data } = useSWR("/r/WritingPrompts/hot", fetchFromUrl)
  const [postsData, setPostsData] = React.useState<IPost[]>();
  const [selectedPost, setSelectedPost] = React.useState<IPost>();
  const [scrollPosition, setScrollPosition] = React.useState<number>(0);

  React.useEffect(() => {
    if (data) {
      setPostsData(getAllPrompts(data));
    }
  }, [data])

  const selectPost = (id: string) => {
    if (postsData) {
      let postWithId = postsData.find((val) => val.id === id);
      if (postWithId) {
        setSelectedPost(postWithId);
      }
    }
  }

  React.useEffect(() => {
    window.scrollTo({ top: scrollPosition })
  }, [])

  React.useEffect(() => {
    window.addEventListener('scroll', () => {
      setScrollPosition(window.scrollY);
    })

    return () => {
      window.removeEventListener('scroll', () => {
        setScrollPosition(window.scrollY);
      })
    }
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Reddit Stories</title>
        <meta name="description" content="PWA to read r/WritingPrompts Stories" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.mainContainer}>
        <div className={styles.postsContainer}>
          {postsData ? postsData?.map((prompt) => {
            return <Post key={prompt.id} title={prompt.title} author={prompt.author} id={prompt.id} permalink={prompt.permalink} score={prompt.score} stories={prompt.stories} created={prompt.created} selectPost={selectPost} />
          }) : <p>Loading...</p>}
        </div>

      </div>


    </div>
  )
}

export default Home
