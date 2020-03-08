const {addComment, addPost, clear} = require('./tasks/db')

module.exports = (on) => {
  on('task', {
    'db:clear': clear,
    'db:posts:add': addPost,
    'db:comments:add': addComment,
  })
}
