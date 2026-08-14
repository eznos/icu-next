import type { MoviesResponseType } from '../../../server/types/moviesTypes'

export async function fetchMovieList(): Promise<MoviesResponseType> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/movies`, {
  headers: {
   Accept: 'application/json',
  },
  cache: 'no-store',
 })

 if (!response.ok) {
  throw new Error('Unable to fetch movie list')
 }

 return response.json() as Promise<MoviesResponseType>
}
