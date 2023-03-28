FROM node:14

COPY --chown=node:node . /usr/src/app/

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${PORT}

CMD [ "node", "index.js" ]