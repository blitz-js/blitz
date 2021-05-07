export default function Avatar({ author }) {
  const name = author
    ? author.firstName && author.lastName
      ? `${author.firstName} ${author.lastName}`
      : author.name
    : null

  return (
    <>
      {author && (
        <div className="flex items-center">
          <img
            src={author.avatar.url}
            className="w-12 h-12 rounded-full mr-4"
            alt={name}
          />
          <div className="text-xl font-bold">{name}</div>
        </div>
      )}
    </>
  )
}
