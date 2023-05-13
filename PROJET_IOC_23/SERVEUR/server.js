const {readFileSync, writeFileSync} = require('fs');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var lum = -1;
var lum2 = -1;
var led1_status = `<input type="checkbox" name="checkbox" value="dark" onclick="clickFn1(event)">`
var led2_status = `<input type="checkbox" name="checkbox" value="dark" onclick="clickFn2(event)">`

app.get('/',(req,res) => {
        
        
        res.send(`
                <!DOCTYPE html>
                <html lang=fr>
                <head>
                        <meta charset="uft-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>IOC</title>
			            <link rel="stylesheet" href="style.css">		
			            <script>
                            function clickFn1(event) {
                                const checkbox = event.currentTarget;
                                const led = document.getElementById("led1");
                                led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
                                led.closest('form').submit()          				
                            }
                            function clickFn2(event) {
                                const checkbox = event.currentTarget;
                                const led = document.getElementById("led2");
                                led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
                                led.closest('form').submit()          				
                            }
			            </script>	
                </head>
                <body>
                    <div class="ESP">
                        <div class="Conteneur">
                            ESP 1 : 
                            <div class="sep">
                                <form method="GET" action="/LUM">
                                        <span class="val">LUM : ${lum}</span>
                                        <button name="send" type="submit" value="../CAPTEUR/lum1.txt">VAL</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form methode="POST" action="/LCD">
                                    <input id="lcdSEND" name="lcd" type="text" placeholder="LCD MESSAGE">
                                    <button name="send" type="submit" value="esp1/lcd">SEND</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form>
                                    <span class="val">LED </span>
                                    <label class="switch">
                                    <input type="checkbox" name="checkbox" value="dark" onclick="clickFn1(event)"> 
                                    <span class="slider round"></span>
                                </form>
                                <form method="post" action="/LED">
                                    <input type="hidden" id="led1" name="led" value="test">
                                    <input type="hidden" name="send" value="esp1/led">
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="ESP">
                        <div class="Conteneur">
                            ESP 2 :
                            <div class="sep">
                                <form method="GET" action="/LUM">
                                    <span class="val">LUM : ${lum2}</span>
                                    <button name="send" type="submit" value="../CAPTEUR/lum2.txt">VAL</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form methode="POST" action="/LCD">
                                    <input id="lcdSEND2" name="lcd" type="text" placeholder="LCD MESSAGE">
                                    <button name="send" type="submit" value="esp2/lcd">SEND</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form>
                                    <span class="val">LED </span>
                                    <label class="switch">
                                    <input type="checkbox" name="checkbox" value="dark" onclick="clickFn2(event)"> 
                                    <span class="slider round"></span>
                                </form>
                                <form method="post" action="/LED">
                                    <input type="hidden" id="led2" name="led" value="test">
                                    <input type="hidden" name="send" value="esp2/led">
                                </form>
                            </div>
                        </div>
                    </div>
		        </body>
            </html>
    `);
});

app.get('/style.css',(req,res) => {
	res.sendFile(__dirname + "/" + "style.css");
});

app.get('/LUM',(req,res) => {

  var val = readFileSync(req.query.send,'utf-8');
	
  
  if (req.query.send == "../CAPTEUR/lum1.txt") lum = val
  else lum2 = val
  res.send(`
                <!DOCTYPE html>
                <html lang=fr>
                <head>
                        <meta charset="uft-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>IOC</title>
			            <link rel="stylesheet" href="style.css">		
			            <script>
                            function clickFn1(event) {
                                const checkbox = event.currentTarget;
                                const led = document.getElementById("led1");
                                led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
                                led.closest('form').submit()          				
                            }
                            function clickFn2(event) {
                                const checkbox = event.currentTarget;
                                const led = document.getElementById("led2");
                                led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
                                led.closest('form').submit()          				
                            }
			            </script>	
                </head>
                <body>
                    <div class="ESP">
                        <div class="Conteneur">
                            ESP 1 : 
                            <div class="sep">
                                <form method="GET" action="/LUM">
                                        <span class="val">LUM : ${lum}</span>
                                        <button name="send" type="submit" value="../CAPTEUR/lum1.txt">VAL</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form methode="POST" action="/LCD">
                                    <input id="lcdSEND" name="lcd" type="text" placeholder="LCD MESSAGE">
                                    <button name="send" type="submit" value="esp1/lcd">SEND</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form>
                                    <span class="val">LED </span>
                                    <label class="switch">
                                    ${led1_status}
                                    <span class="slider round"></span>
                                </form>
                                <form method="post" action="/LED">
                                    <input type="hidden" id="led1" name="led" value="test">
                                    <input type="hidden" name="send" value="esp1/led">
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="ESP">
                        <div class="Conteneur">
                            ESP 2 :
                            <div class="sep">
                                <form method="GET" action="/LUM">
                                    <span class="val">LUM : ${lum2}</span>
                                    <button name="send" type="submit" value="../CAPTEUR/lum2.txt">VAL</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form methode="POST" action="/LCD">
                                    <input id="lcdSEND2" name="lcd" type="text" placeholder="LCD MESSAGE">
                                    <button name="send" type="submit" value="esp2/lcd">SEND</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form>
                                    <span class="val">LED </span>
                                    <label class="switch">
                                    ${(led2_status)}
                                    <span class="slider round"></span>
                                </form>
                                <form method="post" action="/LED">
                                    <input type="hidden" id="led2" name="led" value="test">
                                    <input type="hidden" name="send" value="esp2/led">
                                </form>
                            </div>
                        </div>
                    </div>
		        </body>
            </html>
    `);
})

app.get('/LCD',(req,res) => {

        console.log(req);
	const { spawn } = require('child_process');

// Définir le chemin vers le script Python
const scriptPath = '../MQTT/sendMQTT.py';

// Créer un processus enfant pour exécuter le script Python
const pythonProcess = spawn('python3', [scriptPath,req.query.send,'LCD '+ req.query.lcd]);	

res.send(`
                <!DOCTYPE html>
                <html lang=fr>
                <head>
                        <meta charset="uft-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>IOC</title>
			            <link rel="stylesheet" href="style.css">		
			            <script>
                            function clickFn1(event) {
                                const checkbox = event.currentTarget;
                                const led = document.getElementById("led1");
                                led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
                                led.closest('form').submit()          				
                            }
                            function clickFn2(event) {
                                const checkbox = event.currentTarget;
                                const led = document.getElementById("led2");
                                led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
                                led.closest('form').submit()          				
                            }
			            </script>	
                </head>
                <body>
                    <div class="ESP">
                        <div class="Conteneur">
                            ESP 1 : 
                            <div class="sep">
                                <form method="GET" action="/LUM">
                                        <span class="val">LUM : ${lum}</span>
                                        <button name="send" type="submit" value="../CAPTEUR/lum1.txt">VAL</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form methode="POST" action="/LCD">
                                    <input id="lcdSEND" name="lcd" type="text" placeholder="LCD MESSAGE">
                                    <button name="send" type="submit" value="esp1/lcd">SEND</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form>
                                    <span class="val">LED </span>
                                    <label class="switch">
                                    ${(led1_status)}
                                    <span class="slider round"></span>
                                </form>
                                <form method="post" action="/LED">
                                    <input type="hidden" id="led1" name="led" value="test">
                                    <input type="hidden" name="send" value="esp1/led">
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="ESP">
                        <div class="Conteneur">
                            ESP 2 :
                            <div class="sep">
                                <form method="GET" action="/LUM">
                                    <span class="val">LUM : ${lum2}</span>
                                    <button name="send" type="submit" value="../CAPTEUR/lum2.txt">VAL</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form methode="POST" action="/LCD">
                                    <input id="lcdSEND2" name="lcd" type="text" placeholder="LCD MESSAGE">
                                    <button name="send" type="submit" value="esp2/lcd">SEND</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form>
                                    <span class="val">LED </span>
                                    <label class="switch">
                                    ${led2_status}
                                    <span class="slider round"></span>
                                </form>
                                <form method="post" action="/LED">
                                    <input type="hidden" id="led2" name="led" value="test">
                                    <input type="hidden" name="send" value="esp2/led">
                                </form>
                            </div>
                        </div>
                    </div>
		        </body>
            </html>
    `);
})

app.post('/LED',(req,res) => {

	const { spawn } = require('child_process');
    const scriptPath = '../MQTT/sendMQTT.py';

    const pythonProcess = spawn('python3', [scriptPath,req.body.send,req.body.led]);

    if (req.body.send == "esp1/led"){
        if (req.body.led == "LED ON") led1_status = `<input type="checkbox" name="checkbox" checked value="dark" onclick="clickFn1(event)">`
        else led1_status = `<input type="checkbox" name="checkbox" value="dark" onclick="clickFn1(event)">`
    }
    else {
        if (req.body.led == "LED ON") led2_status = `<input type="checkbox" name="checkbox" checked value="dark" onclick="clickFn2(event)">`
        else led2_status = `<input type="checkbox" name="checkbox" value="dark" onclick="clickFn2(event)">`
    }
    

    pythonProcess.stdout.on('data', (data) => {
    console.log(`Sortie du script Python : ${data}`);
    });


    pythonProcess.stderr.on('data', (data) => {
    console.error(`Erreur du script Python : ${data}`);
    });

    pythonProcess.on('close', (code) => {
    console.log(`Processus Python terminé avec le code de sortie ${code}`);
    });

		res.send(`
                <!DOCTYPE html>
                <html lang=fr>
                <head>
                        <meta charset="uft-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>IOC</title>
			            <link rel="stylesheet" href="style.css">		
			            <script>
                            function clickFn1(event) {
                                const checkbox = event.currentTarget;
                                const led = document.getElementById("led1");
                                led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
                                led.closest('form').submit()          				
                            }
                            function clickFn2(event) {
                                const checkbox = event.currentTarget;
                                const led = document.getElementById("led2");
                                led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
                                led.closest('form').submit()          				
                            }
			            </script>	
                </head>
                <body>
                    <div class="ESP">
                        <div class="Conteneur">
                            ESP 1 : 
                            <div class="sep">
                                <form method="GET" action="/LUM">
                                        <span class="val">LUM : ${lum}</span>
                                        <button name="send" type="submit" value="../CAPTEUR/lum1.txt">VAL</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form methode="POST" action="/LCD">
                                    <input id="lcdSEND" name="lcd" type="text" placeholder="LCD MESSAGE">
                                    <button name="send" type="submit" value="esp1/lcd">SEND</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form>
                                    <span class="val">LED </span>
                                    <label class="switch">
                                    ${led1_status}
                                    <span class="slider round"></span>
                                </form>
                                <form method="post" action="/LED">
                                    <input type="hidden" id="led1" name="led" value="test">
                                    <input type="hidden" name="send" value="esp1/led">
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="ESP">
                        <div class="Conteneur">
                            ESP 2 :
                            <div class="sep">
                                <form method="GET" action="/LUM">
                                    <span class="val">LUM : ${lum2}</span>
                                    <button name="send" type="submit" value="../CAPTEUR/lum2.txt">VAL</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form methode="POST" action="/LCD">
                                    <input id="lcdSEND2" name="lcd" type="text" placeholder="LCD MESSAGE">
                                    <button name="send" type="submit" value="esp2/lcd">SEND</button>
                                </form>
                            </div>
                            <div class="sep">
                                <form>
                                    <span class="val">LED </span>
                                    <label class="switch">
                                    ${led2_status} 
                                    <span class="slider round"></span>
                                </form>
                                <form method="post" action="/LED">
                                    <input type="hidden" id="led2" name="led" value="test">
                                    <input type="hidden" name="send" value="esp2/led">
                                </form>
                            </div>
                        </div>
                    </div>
		        </body>
            </html>
    `);
	
	res.status(200);
})

app.listen(8000,() => console.log('172.20.10.5'));
