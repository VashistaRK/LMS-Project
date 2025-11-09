FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ARG VITE_API_URL_CMR
ARG VITE_SOCKET_URL
RUN npm run build

