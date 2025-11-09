# Stage 1: Build frontend
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund --legacy-peer-deps

COPY . .
RUN npm run build   # build static files into /app/dist

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/lms.conf /etc/nginx/conf.d/lms.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
