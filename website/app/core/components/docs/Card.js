import clsx from "clsx"

import styles from "./Card.module.css"

/**
 * @param {{type: 'caution' | 'info' | 'note', title: string, children: any}}
 * @returns
 */
export function Card({type, title, children}) {
  const defaultTitle = type[0].toUpperCase() + type.substr(1)

  return (
    <div
      className={clsx(
        styles.container,
        type === "caution"
          ? "bg-[#fdea69]"
          : type === "info"
          ? "bg-[#69c6fd]"
          : type === "note"
          ? "bg-blue-primary"
          : undefined,
      )}
    >
      <h5 className={styles.heading}>
        <span className={styles.icon}>
          <InfoIcon />
        </span>
        {title || defaultTitle}
      </h5>
      <div className={styles.content}>{children}</div>
    </div>
  )
}

const InfoIcon = () => (
  <svg width={15} height={15} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx={7.5} cy={7.5} r={6.75} stroke="black" strokeWidth={1.5} strokeLinecap="round" />
    <path
      d="M6.81226 4.27344H8.18774V5.91699L7.83179 8.94043H7.177L6.81226 5.91699V4.27344ZM6.84302 9.45898H8.15259V10.729H6.84302V9.45898Z"
      fill="black"
    />
  </svg>
)
