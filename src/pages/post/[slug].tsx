import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { useMemo } from 'react';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import IsPreviewData from '../../components/IsPreviewData';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  timeToReading: string;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps) {
  const router = useRouter();
  const timeToReading = useMemo(() => {
    const wordsSize: number = post.data.content.reduce(
      (accumulator, currentValue) => {
        const headingLenght = currentValue.heading.split(' ').length;
        const bodyLenght = RichText.asText(currentValue.body).split(' ').length;
        return accumulator + headingLenght + bodyLenght;
      },
      0
    );

    return Math.ceil(wordsSize / 200);
  }, [post]);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <main className={styles.container}>
        <h1>{post.data.title}</h1>
        <div className={styles.info}>
          <span>
            <FiCalendar />
            <time>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
          </span>
          <span>
            <FiUser />
            <span>{post.data.author}</span>
          </span>
          <span>
            <FiClock />
            <span>{timeToReading} min</span>
          </span>
        </div>
        {post.data.content.map(item => (
          <div key={item.heading} className={styles.group}>
            <strong>{item.heading}</strong>
            <div
              dangerouslySetInnerHTML={{ __html: RichText.asHtml(item.body) }}
              className={styles.postContent}
            />
          </div>
        ))}
        <Comments />
        <IsPreviewData isPreview={preview} />
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const slugs = posts.results.map(result => ({
    params: {
      slug: result.uid,
    },
  }));

  return {
    paths: slugs,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const { preview = false, previewData } = context;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  });
  return {
    props: { post: response, preview },
  };
};
