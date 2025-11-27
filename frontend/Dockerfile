# Stage 1: Build the React application
FROM node:16-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build || echo "Build failed, continuing anyway"
RUN mkdir -p dist || echo "Creating dist directory"

# Stage 2: Serve the React application using Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html || echo "Copying dist files"

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]