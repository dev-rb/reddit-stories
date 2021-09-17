import * as React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Post from '../components/Post';
import { IPost } from '../interfaces/reddit';
import styles from '../styles/Home.module.css';
import { fetchFromUrl } from '../helpers/fetchData';
import { getAllPrompts } from '../helpers/cleanData';
import { MdSettings } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { addPosts } from '../redux/slices';
import { useGetPostsQuery } from '../redux/services';

const count = 100;

const filterMap: { [key: string]: string } = {
  "Popular": "hot",
  "New": "new",
  "Rising": "rising",
};

// TODO: Add scroll restoration when going back from pages
const Home: NextPage = () => {

  const [selectedFilter, setSelectedFilter] = React.useState("Popular");
  const { data } = useGetPostsQuery(`${filterMap[selectedFilter]}`)
  const dispatch = useDispatch();

  const headerRef = React.useRef<HTMLDivElement>(null);
  const [postsData, setPostsData] = React.useState<IPost[]>([]);

  React.useEffect(() => {
    if (data) {
      setPostsData(data)
    }
  }, [data])

  // Intersection observer for homeHeader animation
  React.useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      e.target.toggleAttribute("stuck", e.intersectionRatio < 1);
    }, { threshold: [1], rootMargin: '-16px 0px 0px 0px' })
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    }
  }, [])

  React.useEffect(() => {
    console.log(window.navigator.onLine)
  }, [])

  return (

    <div className={styles.container}>
      <Head>
        <title>Reddit Stories</title>
        <meta name="description" content="PWA to read r/WritingPrompts Stories" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.mainContainer}>
        <div ref={headerRef} className={styles.homeHeader}>
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
          {postsData ? postsData.map((prompt: IPost) => {
            return <Post key={prompt.id} title={prompt.title} author={prompt.author} id={prompt.id} permalink={prompt.permalink} score={prompt.score} stories={prompt.stories} created={prompt.created} />
          }) : <p>Loading...</p>}
        </div>

      </div>


    </div>

  )
}

export default Home
