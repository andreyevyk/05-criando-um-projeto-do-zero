import Link from 'next/link';
import styles from './styles.module.scss';

const IsPreviewData = ({ isPreview }) => {
  if (isPreview) {
    return (
      <aside className={styles.container}>
        <Link href="/api/exit-preview">
          <a>Sair do modo Preview</a>
        </Link>
      </aside>
    );
  }

  return null;
};

export default IsPreviewData;
