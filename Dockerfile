FROM node:22-alpine

RUN npm i -g @profullstack/threatcrush

ENTRYPOINT ["threatcrush"]
CMD ["monitor"]
