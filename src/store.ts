import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

const EXPIRATION_TIME = 24 * 60 * 60 * 1000 

interface Story {
  id: number
  title: string
  url: string
  score: number
  by: string
  time: number 
}

interface UIState {
  searchQuery: string
  stories: Story[]
  searchStories: Story[] 
  page: number
  searchPage: number 
  setSearchQuery: (query: string) => void
  addStories: (stories: Story[]) => void
  addSearchStories: (stories: Story[]) => void
  resetStories: () => void
  resetSearchStories: () => void
  setPage: (page: number) => void
  setSearchPage: (page: number) => void
}


const customStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name)
    if (!item) return null

    const { value, timestamp } = JSON.parse(item)
    const now = new Date().getTime()

    
    if (now - timestamp > EXPIRATION_TIME) {
      localStorage.removeItem(name) 
      return null
    }
    return value
  },
  setItem: (name: string, value: any) => {
    const now = new Date().getTime()
    localStorage.setItem(name, JSON.stringify({ value, timestamp: now }))
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
  },
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        searchQuery: '',
        stories: [],
        searchStories: [],
        page: 1,
        searchPage: 1,

        setSearchQuery: (query: string) => {
          if (query !== get().searchQuery) {
            set(() => ({ searchQuery: query, searchPage: 1, searchStories: [] }))
          }
        },

        addStories: (newStories: Story[]) => {
          const existingStories = get().stories
          const updatedStories = [...existingStories, ...newStories]
            .filter((story, index, self) => self.findIndex(s => s.id === story.id) === index)
            .sort((a, b) => b.time - a.time) 

          set(() => ({ stories: updatedStories }))
        },

        addSearchStories: (newStories: Story[]) => {
          const existingStories = get().searchStories
          const updatedStories = [...existingStories, ...newStories]
            .filter((story, index, self) => self.findIndex(s => s.id === story.id) === index)
            .sort((a, b) => b.time - a.time) 

          set(() => ({ searchStories: updatedStories }))
        },

        resetStories: () => set(() => ({ stories: [] })),
        resetSearchStories: () => set(() => ({ searchStories: [] })),
        setPage: (page: number) => set(() => ({ page })),
        setSearchPage: (page: number) => set(() => ({ searchPage: page })),
      }),
      {
        name: 'ui-store',
        storage: customStorage, 
      }
    )
  )
)
