# Use an official Node.js runtime as the base image
FROM node:18

COPY ./src .
WORKDIR /app


# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your application listens on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]