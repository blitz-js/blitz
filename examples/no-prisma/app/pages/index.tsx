import { Suspense, useState } from "react"
import { useQuery } from "blitz"
import getGIFs from "app/queries/getGIFs"
import addRating from "app/mutations/addRating"
import addGIF from "app/mutations/addGIF"
import styles from "./index.module.css"

function GIFRater() {
  const [gifs, gifsQuery] = useQuery(getGIFs, {})

  const [gifTitle, setGifTitle] = useState<string>()

  return (
    <main className={styles.main}>
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
        >
          Submit
        </button>
      </form>

      <ul className={styles.gif_list}>
        {gifs.map((gif) => (
          <li key={gif.url}>
            <img src={gif.url} alt="GIF" />
            <span>
              Rating: {gif.rating.toFixed(1)}
              <select
                placeholder="Change"
                defaultValue="title"
                onBlur={async (evt) => {
                  const rating = +evt.target.value as 1 | 2 | 3 | 4 | 5
                  evt.target.value = "title"

                  await addRating({
                    gif_url: gif.url,
                    rating,
                  })

                  await gifsQuery.refetch()
                }}
              >
                <option disabled value="title">
                  Add Rating
                </option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </span>
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
