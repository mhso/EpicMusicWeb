FROM node:26-alpine AS builder
WORKDIR /epic_music

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy code and runtime files 
COPY vite.config.ts tsconfig.json ./
COPY epic-music ./epic-music

RUN npm run build

FROM busybox:1.38 AS runner
WORKDIR /epic_music

COPY --from=builder /epic_music/epic-music/dist ./epic-music

CMD busybox httpd -f -v -p ${PORT}
