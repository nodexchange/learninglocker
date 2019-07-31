1.) - build ==============================: 
λ C:\Users\wojtalam\AppData\Roaming\npm\yarn build-all

2.) - Run db and redis ===================: 

* USE DOCKER COMPOSE *
docker-compose up
(if need the volume, please create it first)
docker-compose down

3.) - Run all services ===================:
Then run all services: 
C:\Users\wojtalam\AppData\Roaming\npm\pm2 start pm2/all.json
C:\Users\wojtalam\AppData\Roaming\npm\pm2 restart all

4.) Fire up the xAPI service (seperate folder also via pm2)

5.) Optional (on new DB) =================:
Create user: 
node cli/dist/server createSiteAdmin [email] [organisation] [password]
node cli/dist/server createSiteAdmin marcin.wojtala@oup.com oup malebiale21!L


*** YOU ARE DONE ***
UI: localhost:3000
API: localhost:8080
Worker: localhost:?

========= STOP AND DELETE DOCKER instances =========== 
(IN BASH TERMINAL)
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)

=====================================================

(---------- IGNORE BELOW --------------)
Run mongo (of docker optional):
docker run -d -p 27017:27017 -v mongodata:/data/db --name=mymongo mongo:4
(OPTIONAL) docker volume create mongodata
docker run --name my-redis-container -d -p 6379:6379 redis
