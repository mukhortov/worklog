import styles from './LoadingIndicator.sass'

export const LoadingIndicator = () => {
  return (
    <svg width="24px" height="30px" viewBox="0 0 24 30" className={styles.svg}>
      <rect x="0" y="0" width="4" height="10" fill="#79A0E0">
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="10" y="0" width="4" height="10" fill="#79A0E0">
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0.2s"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="20" y="0" width="4" height="10" fill="#79A0E0">
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0.4s"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  )
}
