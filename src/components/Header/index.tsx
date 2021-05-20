import { useRouter } from 'next/router';
import styles from './header.module.scss';

export default function Header() {
  const router = useRouter();
  return (
    <header className={styles.headerContainer}>
      <button type="button" onClick={() => router.push('/', {}, {})}>
        <img src="/images/logo.svg" alt="logo" />
      </button>
    </header>
  );
}
