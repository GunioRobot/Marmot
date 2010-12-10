# Marmot

Marmot is a simple app that allows you to import your mp3s into couchdb and serve them up using Node using the Express framework.

## Things not included in this project (yet)

* The Ruby parser that greps through your mp3s and adds them to couch

## Things not done 

* Streaming of mp3s
* User auth
* A useable interface (as well as a mobile one)
* More to come...     

## Requirements

* npm
* underscore.js
* node.js
* couch-client
* couchdb

Ruby and a slew of gems are required for the parser, but as stated above the parser isn't yet in this project. (Currently lives in a different project). 

## Things of interest

Probably the most fascinating file to look at is the [boot.js](https://github.com/antrover/Marmot/blob/master/boot.js) file.

## Why am I building Marmot?

I'm fascinated with node.js, couchdb, and sharing music. I previously built, and still run a Rails app called "Hushh" that accomplishes the same idea as Marmot, however it's a bloated app and needs a rewrite. 