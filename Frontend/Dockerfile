# Use Node 20 (Vite requires Node >= 20.19 or 22.12+)
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy npm config first (if provided) to tune network behavior
COPY .npmrc .npmrc

# Copy package files and install dependencies reproducibly
# Use npm ci and disable audit/optional progress to speed and stabilize builds
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund --legacy-peer-deps || npm install --no-audit --no-fund

# Copy the rest of the frontend source code
COPY . .

# Expose Vite’s default dev server port
EXPOSE 5173

# Start the frontend in dev mode
CMD ["npm", "run", "dev"]
