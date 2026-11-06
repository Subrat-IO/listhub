import Link from "next/link";
import { POPULAR_LOCATIONS, TRENDING_LOCATIONS } from "@/lib/catalog";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <h3>Popular Locations</h3>
          <ul>
            {POPULAR_LOCATIONS.map((c) => (
              <li key={c}>
                <Link href={`/explore?location=${encodeURIComponent(c)}`}>{c}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Trending Locations</h3>
          <ul>
            {TRENDING_LOCATIONS.map((c) => (
              <li key={c}>
                <Link href={`/explore?location=${encodeURIComponent(c)}`}>{c}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>About Us</h3>
          <ul>
            <li>
              <Link href="/explore">About ListHub</Link>
            </li>
            <li>
              <Link href="/settings">Careers</Link>
            </li>
            <li>
              <Link href="/account">Press</Link>
            </li>
            <li>
              <Link href="/settings">Investor Relations</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3>Help</h3>
          <ul>
            <li>
              <Link href="/notifications">Help Center</Link>
            </li>
            <li>
              <Link href="/settings">Safety Tips</Link>
            </li>
            <li>
              <Link href="/settings">Terms of Use</Link>
            </li>
            <li>
              <Link href="/settings">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/messages">Contact Us</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3>Get the ListHub App</h3>
          <p>Buy, sell and manage your ads on the go.</p>
          <div className={styles.stores}>
            <span>Download on the App Store</span>
            <span>Get it on Google Play</span>
          </div>
          <img src="/listhub-logo.jpg" alt="" className={styles.mark} />
        </div>
      </div>
      <div className={styles.legal}>© {new Date().getFullYear()} ListHub. Sell anything at your own price.</div>
    </footer>
  );
}
