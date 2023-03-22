FROM ubuntu:18.04 as base

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y && apt-get install -y \
    software-properties-common \
    apt-transport-https \
    curl \
    # Only needed to build indy-sdk
    build-essential 

# libindy
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys CE7709D068DB5E88
RUN add-apt-repository "deb https://repo.sovrin.org/sdk/deb bionic stable"

# nodejs
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash

# install depdencies
RUN apt-get update -y && apt-get install -y --allow-unauthenticated \
    libindy \
    libnullpay \
    libvcx \
    nodejs

RUN groupadd -r developer && useradd -r -g developer developer

RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install -g yarn

ADD src /app

WORKDIR /app

RUN chown developer:developer /app

USER developer

RUN yarn install

EXPOSE 5555 8282 7777

ENTRYPOINT [ "ts-node", "index.ts"]
