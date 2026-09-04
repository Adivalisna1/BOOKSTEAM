FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything else
COPY . .

# Expose port
EXPOSE 3003

# Run the dev server
CMD ["npm", "run", "dev", "--", "-p", "3003", "-H", "0.0.0.0"]
