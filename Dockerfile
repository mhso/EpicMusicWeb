FROM node:26-alpine AS builder
WORKDIR /epic_music

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy code and runtime files 
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src

RUN npm run build

FROM busybox:1.38 AS runner
WORKDIR /epic_music

COPY --from=builder /epic_music/dist .

CMD busybox httpd -f -v -p ${PORT}
