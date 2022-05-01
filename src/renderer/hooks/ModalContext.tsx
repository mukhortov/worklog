import React, { useState, createContext, useContext, useMemo } from 'react'
import { Modal } from 'renderer/ui/Modal/Modal'
import { Profile } from 'renderer/ui/Profile/Profile'
import { AddWorklog } from 'renderer/ui/AddWorklog/AddWorklog'
import { Login } from 'renderer/ui/Login/Login'
import { WorklogCreate } from 'model/Worklog'
import { OnlineStatus } from 'renderer/ui/OnlineStatus/OnlineStatus'

interface AddWorklogModalData {
  open: boolean
  worklog?: WorklogCreate
}

export interface ModalSession {
  toggleLoginModal: React.Dispatch<React.SetStateAction<boolean>>
  toggleAccountModal: React.Dispatch<React.SetStateAction<boolean>>
  toggleAddWorklogModal: React.Dispatch<React.SetStateAction<AddWorklogModalData>>
  toggleOnlineStatusModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const ModalContext = createContext<ModalSession | null>(null)

export const useModalContext = () => {
  const session = useContext(ModalContext)

  if (session === null) {
    throw new Error('useModalContext has to be used inside of ModalContextProvider')
  }

  return session
}

interface ModalContextProviderProps {
  children: React.ReactNode
}

export const ModalContextProvider = ({ children }: ModalContextProviderProps) => {
  const [openLoginModal, toggleLoginModal] = useState(false)
  const [openAccountModal, toggleAccountModal] = useState(false)
  const [openAddWorklogModal, toggleAddWorklogModal] = useState<AddWorklogModalData>({ open: false })
  const [openOnlineStatusModal, toggleOnlineStatusModal] = useState(false)

  const memoizedValue = useMemo(
    () => ({ toggleLoginModal, toggleAccountModal, toggleAddWorklogModal, toggleOnlineStatusModal }),
    [toggleLoginModal, toggleAccountModal, toggleAddWorklogModal, toggleOnlineStatusModal],
  )

  return (
    <ModalContext.Provider value={memoizedValue}>
      {children}
      <Modal title="Log in" open={openLoginModal}>
        <Login />
      </Modal>
      <Modal title="Account" open={openAccountModal} onClose={() => toggleAccountModal(false)} width={430}>
        <Profile />
      </Modal>
      <Modal
        title={openAddWorklogModal?.worklog?.id ? 'Edit worklog' : 'Add worklog'}
        open={openAddWorklogModal.open}
        onClose={() => toggleAddWorklogModal({ open: false })}
      >
        <AddWorklog onClose={() => toggleAddWorklogModal({ open: false })} worklog={openAddWorklogModal?.worklog} />
      </Modal>
      {openOnlineStatusModal && <OnlineStatus />}
    </ModalContext.Provider>
  )
}
