import { create } from 'zustand'

export interface Notice {
  id: number
  title: string
  body?: string
}

interface NotificationStore {
  notices: Notice[]
  push: (title: string, body?: string) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useNotifications = create<NotificationStore>((set, get) => ({
  notices: [],
  push: (title, body) => {
    const id = nextId++
    set({ notices: [...get().notices, { id, title, body }] })
    // auto-dismiss after a while; manual dismiss stays available
    setTimeout(() => get().dismiss(id), 7000)
  },
  dismiss: (id) => set({ notices: get().notices.filter((n) => n.id !== id) }),
}))
