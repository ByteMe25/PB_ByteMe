# Compilazione
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

#Web Server
FROM nginx:alpine

# Copia il risultato della build nella cartella di Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la configurazione personalizzata per gestire il routing di React
COPY nginx.conf /etc/nginx/conf.d/default.conf