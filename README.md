# Raspberry Pi Tools
A collection of scripts to use for the park smart gateway node

# Installation
1.) Checkout this repo to the pi's home directory
2.) run `npm install` in parking-tools/server-conf
3.) Install forever `sudo npm install -g forever`

# Running the App
Add the following to the Pi's /etc/rc.local
```
startTS=`date +"%m-%d-%Y-%T"`
cd /home/pi/parking-tools/server-conf
sudo forever -o logs/out-$startTS.log -e logs/err-$startTS.log start app.js
```
