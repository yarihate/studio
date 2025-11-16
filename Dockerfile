# 1. Base Image
FROM node:20-slim

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the application code
COPY . .

# 5. Set the default command
CMD ["npm", "run", "dev"]
