const {readFileSync, writeFileSync} = require('fs');

const express = require('express');
const app = express();

app.get('/',(req,res) => {
        
        
        res.send(`
                <!DOCTYPE html>
                <html lang=fr>
                <head>
                        <meta charset="uft-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>IOC</title>
                </head>
                <body>
                        <h1>IOC</h1>
                        <form method="GET" action="/LUM">
                          <button id='button'>LUM</button>
                        </form>
                </body>
                </html>
                `);
});

app.get('/LUM',(req,res) => {

  const lum = readFileSync('../lum1.txt','utf-8');


  res.send(`
                <!DOCTYPE html>
                <html lang=fr>
                <head>
                        <meta charset="uft-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>IOC</title>
                </head>
                <body>
                        <h1>IOC</h1>
                        <div>LUM : {lum}</div>
                        <form method="GET" action="/LUM">
                          <button id='button'>REFRESH</button>
                        </form>
                </body>
                </html>
                `);
})

app.listen(5000,() => console.log('http://192.168.1.146/'));