FROM node:20 AS npst-backend
RUN npm install -g typescript 
RUN npm install -g nodemon
WORKDIR /app
COPY package.json .
RUN npm install
COPY .  /app
EXPOSE 5009 
CMD ["npm", "start"]

RUN npm install


