# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Make port 9002 available to the world outside this container
EXPOSE 9002

# Define the command to run your app
CMD ["npm", "run", "dev"]
