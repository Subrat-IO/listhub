import styles from "./hero-banner.module.css";

export function HeroBanner() {
  return (
    <div className={styles.hero} role="banner">
      <div className={styles.inner}>
        <div>
          <div className={styles.kicker}>Marketplace</div>
          <div className={styles.title}>Buy &amp; sell anything — your price, your terms.</div>
        </div>
        <div className={styles.ctaRow}>
          <a className={styles.primary} href="/explore">
            Browse listings
          </a>
          <a className={styles.secondary} href="/sell">
            List an item
          </a>
        </div>
      </div>
    </div>
  );
}
