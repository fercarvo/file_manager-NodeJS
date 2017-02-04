# File manager

To run this server you have to install node.js 6.9.4 LTS

Open the shell in this folder and execute
 ```bash
  
npm install
npm start

```
This server allows you to upload, download, change and delete files with an easy to use REST API
For this you'll use HTTP methods and send files in form-data forms.

To upload one or multiple files use
 ```bash
  
POST /files
``` 
You'll get something like this
 ```bash
[
  {
    "__v": 0,
    "original_name": "icon.png",
    "new_name": "1485640770925_icon.png",
    "_id": "588d14427c6fdc3949c5b7b2"
  },
  {
    "__v": 0,
    "original_name": "brazilian.png",
    "new_name": "1485640770970_brazilian.png",
    "_id": "588d14427c6fdc3949c5b7b3"
  }
]
```
To download a file you'll have to use the _id you got in the POST response.
 ```bash
  
GET /files/id

```
To delete a file
 ```bash
  
DELETE /files/id

```
To get a list of all files
 ```bash
  
GET /files

```
To depure the database.
 ```bash

POST /files/depure 
```
To change a file you'll use
 ```bash

PUT /files/id 
```

