import React from "react"
import {BsArrowRight} from "react-icons/bs"

// Video player component we can pass a url to using the react-player library.
// control prop determinse whether video player controls will be displayed.
const NewsletterForm = ({className, hasDarkMode}) => {
  return (
    <form
      action="https://design.us4.list-manage.com/subscribe/post?u=aeb422edfecb0e2dcaf70d12d&amp;id=1a028d02ce"
      method="post"
      className={`relative ${className} border ${
        hasDarkMode ? "border-blue-light dark:border-white" : "border-white"
      } border-opacity-50 rounder-sm font-secondary`}
    >
      <input
        aria-label="Email Address"
        name="EMAIL"
        type="email"
        required
        placeholder="Enter Your Email Address"
        className={`w-[90%] p-2 text-base placeholder-current bg-transparent outline-none`}
      />
      <button className="absolute right-0 mt-2 mr-2" type="submit">
        <BsArrowRight size="1.5rem" className="justify-self-end" />
      </button>
    </form>
  )
}

export {NewsletterForm}
