# Use an official Node.js runtime as a parent image
FROM node:20 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# ================================
# 🚀 Production Stage — Node + serve
# ================================
FROM node:20-alpine AS production

# Set the working directory inside the container
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built static files
COPY --from=build /app/dist ./dist

# Copy package.json so "npm run start" works
COPY package*.json ./

# Expose the port the app runs on
EXPOSE 3009

# Start static server on port 3001
CMD ["npm", "run", "start"]


# FROM node:20 AS npst-frontend
# WORKDIR /app
# COPY package.json .
# RUN npm install --force
# COPY . .
# # RUN npm run build
# EXPOSE 3001
# CMD ["npm", "next", "build"]