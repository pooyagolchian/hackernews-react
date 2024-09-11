import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useInfiniteQuery } from 'react-query'
import { useUIStore } from './store'
import axios from 'axios'
import dayjs from 'dayjs'
import debounce from 'debounce'
import './index.scss'

interface Story {
  id: number
  title: string
  url: string
  score: number
  by: string
  time: number
}

// Fetch top story IDs from Hacker News
const fetchTopStoriesIds = async () => {
  const { data } = await axios.get(
    'https://hacker-news.firebaseio.com/v0/topstories.json',
  )
  return data
}

// Fetch paginated stories using top story IDs
const fetchStories = async ({
  pageParam = 1,
  queryKey,
}: {
  pageParam?: number
  queryKey: any[]
}) => {
  const storyIds: number[] = queryKey[1]
  const startIndex = (pageParam - 1) * 20
  const endIndex = startIndex + 20
  const currentStoryIds = storyIds.slice(startIndex, endIndex)

  const storyPromises = currentStoryIds.map(async (id: number) => {
    const { data } = await axios.get(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
    )
    return {
      id: data.id,
      title: data.title,
      url: data.url,
      score: data.score,
      by: data.by,
      time: data.time,
    }
  })

  const stories = await Promise.all(storyPromises)
  return {
    stories,
    nextPage: pageParam + 1,
    hasMore: currentStoryIds.length > 0,
  }
}

const fetchSearchResults = async ({
  pageParam = 0,
  queryKey,
}: {
  pageParam?: number
  queryKey: any[]
}) => {
  const query = queryKey[1]
  const { data } = await axios.get(
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&page=${pageParam}`,
  )
  const stories = data.hits.map((hit: any) => ({
    id: hit.objectID,
    title: hit.title,
    url: hit.url,
    score: hit.points,
    by: hit.author,
    time: hit.created_at_i,
  }))
  return {
    stories,
    nextPage: pageParam + 1,
    hasMore: pageParam + 1 < data.nbPages,
  }
}

const App: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    stories,
    addStories,
    searchStories,
    addSearchStories,
  } = useUIStore()

  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null) // Reference for the observer

  const {
    data: storyIds,
    isLoading: idsLoading,
    isError: idsError,
  } = useQuery('topStories', fetchTopStoriesIds, {
    onError: () =>
      setErrorMessage('Failed to fetch top stories. Please try again.'),
  })

  const {
    data: topStoriesData,
    fetchNextPage: fetchNextTopStoriesPage,
    hasNextPage: hasNextTopStoriesPage,
    isFetchingNextPage: isFetchingNextTopStoriesPage,
    isLoading: storiesLoading,
  } = useInfiniteQuery(['stories', storyIds], fetchStories, {
    enabled: !isSearching && !!storyIds,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    onSuccess: (data) => {
      const newStories = data.pages.flatMap((page) => page.stories)
      addStories(newStories)
    },
    onError: () =>
      setErrorMessage('Failed to fetch stories. Please try again.'),
  })

  const {
    data: searchData,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    isLoading: searchLoading,
  } = useInfiniteQuery(['search', searchQuery], fetchSearchResults, {
    enabled: isSearching && searchQuery.trim() !== '',
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    onSuccess: (data) => {
      const newStories = data.pages.flatMap((page) => page.stories)
      addSearchStories(newStories)
    },
    onError: () =>
      setErrorMessage('Failed to fetch search results. Please try again.'),
  })

  // Debounced search handler
  const handleSearchChange = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
      setIsSearching(query.trim() !== '')
    }, 700),
    [],
  )

  const storiesToRender = isSearching ? searchStories : stories

  const hasNextPage = isSearching ? hasNextSearchPage : hasNextTopStoriesPage
  const fetchNextPage = isSearching
    ? fetchNextSearchPage
    : fetchNextTopStoriesPage
  const isFetchingNextPage = isSearching
    ? isFetchingNextSearchPage
    : isFetchingNextTopStoriesPage

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          console.log('Fetching next page...')
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [fetchNextPage, hasNextPage])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-500 to-black bg-clip-text text-transparent">
        Hacker News Stories
      </h1>

      <div className="mb-8 flex justify-center">
        <input
          type="text"
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full max-w-lg"
          placeholder="Search for stories..."
        />
      </div>

      {errorMessage && (
        <p className="text-center text-red-500">{errorMessage}</p>
      )}

      {storiesToRender.length === 0 &&
        !idsLoading &&
        !storiesLoading &&
        !searchLoading &&
        !errorMessage && <p className="text-center">No stories found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!storiesLoading &&
          !searchLoading &&
          storiesToRender.map((story: Story) => (
            <div
              key={story.id}
              className="group bg-gradient-to-r from-gray-100 via-orange-200 to-red-300 p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105"
            >
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="p-4">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2 text-gray-800 group-hover:text-orange-800 transition-colors">
                    {story.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">
                    {story.score} points by {story.by}
                  </p>
                  <p className="text-sm text-gray-500">
                    {dayjs.unix(story.time).format('MMMM D, YYYY h:mm A')}
                  </p>
                </div>
              </a>
            </div>
          ))}
      </div>

      <div
        ref={loadMoreRef}
        className="h-50 d-flex justify-center align-middle my-36"
      />

      {isFetchingNextPage && (
        <p className="text-center my-10">Loading more stories...</p>
      )}
    </div>
  )
}

export default App
