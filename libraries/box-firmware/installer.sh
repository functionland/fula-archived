#! /bin/bash

# Update apt get
sudo apt-get -y update
sudo apt --fix-broken -y install
sudo apt-get -y upgrade

# Install dependencies
sudo apt-get install -y nodejs
sudo apt-get install -y git
sudo apt-get install -y build-essential
sudo apt-get install -y libudev-dev
sudo apt-get install -y hostapd
sudo apt-get install -y dnsmasq
sudo apt-get install -y iw
sudo apt-get install -y npm

# Install pm2
sudo npm install -g pm2
sudo npm install -g node-gyp

# Activate rf interfaces
sudo rfkill unblock wifi
sudo rfkill unblock all

# Setup project
npm install

# Start pm2
sudo pm2 start ./index.js --name=Box
sudo pm2 startup
sudo pm2 save
