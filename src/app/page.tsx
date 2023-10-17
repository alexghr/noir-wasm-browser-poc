import styles from './page.module.css'
import dynamic from 'next/dynamic';

// I think we need to skip SSR for this component
// otherwise the wasm gets confused?
const Compile = dynamic(() => import('../components/Compile'), {
  ssr: false
});

export default function Home() {
  return (
    <main className={styles.main}>
      <Compile />
    </main>
  )
}
