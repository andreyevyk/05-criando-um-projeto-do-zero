import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import IsPreviewData from '../components/IsPreviewData';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState<PostPagination>(postsPagination);

  const handleLoadMore = async () => {
    const response = await fetch(postsPagination.next_page);
    const { next_page, results } = (await response.json()) as PostPagination;
    const data = results.map(result => ({
      ...result,
      first_publication_date: format(
        new Date(result.first_publication_date),
        'dd MMM yyyy',
        { locale: ptBR }
      ),
    }));

    setPosts({
      next_page,
      results: [...posts.results, ...data],
    });
  };

  return (
    <>
      <div className={styles.container}>
        <header>
          <img src="/images/logo.svg" alt="logo" />
        </header>
        <main className={styles.posts}>
          {posts.results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <span>{post.data.subtitle}</span>
                <div className={styles.info}>
                  <span>
                    <FiCalendar />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        { locale: ptBR }
                      )}
                    </time>
                  </span>
                  <span>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </span>
                </div>
              </a>
            </Link>
          ))}
          {posts.next_page && (
            <button
              type="button"
              onClick={handleLoadMore}
              className={styles.loadMore}
            >
              Carregar mais posts
            </button>
          )}
        </main>
        <IsPreviewData isPreview={preview} />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: [
        'post.title',
        'post.subtitle',
        'post.first_publication_date',
        'post.author',
      ],
      pageSize: 5,
      ref: previewData?.ref ?? null,
    }
  );

  const postsPagination = {
    results: postsResponse.results,
    next_page: postsResponse.next_page,
  };
  return {
    props: {
      postsPagination,
      preview,
    },
  };
};
