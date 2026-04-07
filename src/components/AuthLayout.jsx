import styles from './AuthLayout.module.css'

export default function AuthLayout({ children, title }) {
  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <p className={styles.tagline}>Keep your network safe with HISN</p>
        <div className={styles.illustration}>
          <img src="/hisn-logo.png" alt="حصن HISN" className={styles.hisnLogo} />
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.formCard}>
          {title && <h1 className={styles.formTitle}>{title}</h1>}
          {children}
        </div>
      </div>
    </div>
  )
}
