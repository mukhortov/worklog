import styles from './OnlineStatus.sass'
import { Modal } from 'renderer/ui/Modal/Modal'

export const OnlineStatus = () => {
  return (
    <Modal open>
      <div className={styles.message}>Make sure you are online</div>
    </Modal>
  )
}
