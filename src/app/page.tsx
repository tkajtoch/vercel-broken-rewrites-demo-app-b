import styles from './page.module.css'
import Link from 'next/link';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Application B</h1>
      <Link href="/demo">Go to /demo</Link>
    </main>
  )
}
