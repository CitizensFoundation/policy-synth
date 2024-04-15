FROM node:20

LABEL maintainer="Robert Vidar Bjarnason <robert@citizens.is>"

RUN echo 'version 1.2'

# Create app directory and give permissions to node user
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

# Copy your package.json file to the WORKDIR
COPY --chown=node:node ./sdk/projects/ecasEric/webApi/package.json ./

USER node

# Install npm dependencies
RUN npm install

# Copy the rest of your application code from api directory
COPY --chown=node:node ./sdk/projects/ecasEric/webApi .

# Copy your webApps directory to the WORKDIR
COPY --chown=node:node ./sdk/projects/ecasEric/webApp ./webApp

ENV PORT=4078

EXPOSE 4078

CMD [ "node", "ts-out/server.js" ]
