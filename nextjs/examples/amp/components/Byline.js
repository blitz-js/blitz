export default function Byline({ author }) {
  return (
    <>
      <div className="byline">By {author}</div>
      <style jsx>{`
        .byline {
          color: green;
          font-weight: bolder;
        }
      `}</style>
    </>
  )
}
