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
import { MdSettings } from 'react-icons/md';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

const count = 100;

const filterMap: { [key: string]: string } = {
  "Popular": "hot",
  "New": "new",
  "Rising": "rising",
};

// TODO: Add scroll restoration when going back from pages
const Home: NextPage = () => {

  const [selectedFilter, setSelectedFilter] = React.useState("Popular");
  const { data } = useQuery(selectedFilter, () => fetchFromUrl(`/r/WritingPrompts/${filterMap[selectedFilter]}/`, count));
  const [postsData, setPostsData] = React.useState<IPost[]>();

  React.useEffect(() => {
    if (data) {
      setPostsData(getAllPrompts(data, filterMap[selectedFilter]));
    }
  }, [data])

  return (

    <div className={styles.container}>
      <Head>
        <title>Reddit Stories</title>
        <meta name="description" content="PWA to read r/WritingPrompts Stories" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.mainContainer}>
        <div className={styles.homeHeader}>
          <div className={styles.headerNameSettings}>
            <p> Explore <span> Stories </span> </p>
            <MdSettings size={30} color="white" />
          </div>
          <div className={styles.postsFilters}>
            <div className={selectedFilter === "Popular" ? styles.selectedFilter : ''} onClick={() => setSelectedFilter("Popular")}> <p> Popular </p> </div>
            <div className={selectedFilter === "New" ? styles.selectedFilter : ''} onClick={() => setSelectedFilter("New")}> <p> New </p> </div>
            <div className={selectedFilter === "Rising" ? styles.selectedFilter : ''} onClick={() => setSelectedFilter("Rising")}> <p> Rising </p> </div>
          </div>
        </div>
        <div className={styles.postsContainer}>
          {postsData ? postsData?.map((prompt) => {
            return <Post key={prompt.id} title={prompt.title} author={prompt.author} id={prompt.id} permalink={prompt.permalink} score={prompt.score} stories={prompt.stories} created={prompt.created} />
          }) : <p>Loading...</p>}
        </div>

      </div>


    </div>

  )
}

export default Home
