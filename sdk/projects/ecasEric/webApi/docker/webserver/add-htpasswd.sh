#!/bin/sh
# Check if the .htpasswd file exists and copy it if it does
if [ -f /tmp/.htpasswd ]; then
    cp /tmp/.htpasswd /etc/nginx/.htpasswd
fi

