# **name**

## Getting Started

1. Add this code to db/schema.prisma:

```
model Project {
  id      Int      @default(autoincrement()) @id
  name    String
}
```

2. DB migrate

```
blitz db migrate
```

3. Start the dev server

```
blitz start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
