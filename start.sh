#!/bin/bash

auth_save=$(awk 'NR==1' tokens.poo)
tk_save=$(awk 'NR==2' tokens.poo)

if [ -z "$auth_save" ]; then
    echo "$1" >> tokens.poo
fi

if [ -z "$tk_save" ]; then
    echo "$2" >> tokens.poo
fi

echo $auth_save
echo $tk_save

echo "Is this correct? (Y/n)"
read inp

inp=$(echo "$inp" | tr '[:upper:]' '[:lower:]')

if [ "$inp" = "y" ] || [ -z "$inp" ]; then
    export AUTH_TOKEN=$auth_save
    export DEFAULT_TOKEN=$tk_save
    node server.js
else
    echo "Cancelled."
fi


