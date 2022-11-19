FROM node:18 as builder
WORKDIR /app

# Install dev dependencies
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Build application
COPY tsconfig.json ./
COPY src ./src
RUN yarn build


FROM node:18 as runner
WORKDIR /app

# Installs prod dependencies

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

# Copy compiled from builder

COPY --from=builder /app/dist ./dist

EXPOSE 8080
VOLUME ["/app/store"]

# Run application

CMD ["yarn", "deploy"]
