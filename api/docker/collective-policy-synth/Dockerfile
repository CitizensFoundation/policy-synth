FROM node:18

LABEL maintainer="Robert Vidar Bjarnason <robert@citizens.is>"

RUN echo 'version 1.2'

# Create app directory and give permissions to node user
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

# Copy your package.json file to the WORKDIR
COPY --chown=node:node ./api/package.json ./

USER node

# Install npm dependencies
RUN npm install

# Copy the rest of your application code from api directory
COPY --chown=node:node ./api .

# Copy your webApps directory to the WORKDIR
COPY --chown=node:node ./webApps ./webApps

ENV PORT=9080

EXPOSE 9080

CMD [ "node", "dist/server.js" ]
