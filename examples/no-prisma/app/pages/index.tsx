import { Suspense } from "react"
import { useQuery } from "blitz"
import getGIFs from "app/queries/getGIFs"
import addRating from "app/mutations/addRating"
import addGIF from "app/mutations/addGIF"
import { useState } from "react"

function GIFRater() {
  const [gifs, gifsQuery] = useQuery(getGIFs, {})

  const [gifTitle, setGifTitle] = useState<string>()

  return (
    <main>
      <h1>The best GIFs of all time:</h1>

      <form>
        <input
          onChange={(evt) => setGifTitle(evt.target.value)}
          placeholder="Submit another GIF"
          type="url"
        ></input>
        <button
          type="submit"
          onClick={async (evt) => {
            evt.preventDefault()
            await addGIF(gifTitle)
            await gifsQuery.refetch()
          }}
        ></button>
      </form>

      <ul>
        {gifs.map((gif) => (
          <li key={gif.url}>
            <img src={gif.url} alt="GIF" />
            Rating: {gif.rating}
            <select
              placeholder="Change"
              defaultValue="title"
              onBlur={async (evt) => {
                await addRating({
                  gif_url: gif.url,
                  rating: +evt.target.value as 1 | 2 | 3 | 4 | 5,
                })

                await gifsQuery.refetch()
              }}
            >
              <option disabled value="title">
                Rate
              </option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </li>
        ))}
      </ul>
    </main>
  )
}

function Home() {
  return (
    <Suspense fallback="Loading ...">
      <GIFRater />
    </Suspense>
  )
}

export default Home
