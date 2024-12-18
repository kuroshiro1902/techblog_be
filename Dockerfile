FROM node:20-alpine3.20

# Cài đặt OpenSSL
RUN apk add --no-cache openssl

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Sao chép thư mục prisma vào container (bao gồm cả schema.prisma)
COPY prisma ./prisma

# Generate Prisma database
RUN npx prisma generate

# Bundle app source
COPY . .

# Expose port 4537
EXPOSE 4537

# Start the app
CMD npm start
