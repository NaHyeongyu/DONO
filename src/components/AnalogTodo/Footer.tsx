import styles from './Footer.module.css';

export default function Footer({ note }: { note: string }) {
  return (
    <footer className={styles.footer}>
      <p>{note}</p>
    </footer>
  );
}
