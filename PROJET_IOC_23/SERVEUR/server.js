const {readFileSync, writeFileSync} = require('fs');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//Variable pour la luminosité
var lum = -1;
var lum2 = -1;

//Variable pour l etat de la checkbox
var led1_status = `<input type="checkbox" name="checkbox" value="dark" onclick="clickFn1(event)">`
var led2_status = `<input type="checkbox" name="checkbox" value="dark" onclick="clickFn2(event)">`

//ROUTE PAGE PRINCIPALE
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

//ROUTE CSS
app.get('/style.css',(req,res) => {
	res.sendFile(__dirname + "/" + "style.css");
});


//ROUTE DEMANDE DE LUMINOSITE
app.get('/LUM',(req,res) => {

  //Lecture dans lum1 ou lum2 en fonction du corps de la requete
  var val = readFileSync(req.query.send,'utf-8');
	
  //Si ESP 1
  if (req.query.send == "../CAPTEUR/lum1.txt") lum = val
  else lum2 = val //Sinon

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

//ROUTE MESSAGE SUR ECRAN ESP
app.get('/LCD',(req,res) => {

    //Biblio pour creer process
	const { spawn } = require('child_process');

    // Chemin vers le script sendMQTT
    const scriptPath = '../MQTT/sendMQTT.py';

    // Creer un processus pour lancer le script avec en argument le topic et le message
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

//ROUTE ALLUMER OU ETEINDRE LED
app.post('/LED',(req,res) => {

    //Biblio pour creer process
	const { spawn } = require('child_process');

    //Chemin du script sendMQTT
    const scriptPath = '../MQTT/sendMQTT.py';

    //Lancement du script python avec le topic et le message LED ON ou LED OFF
    const pythonProcess = spawn('python3', [scriptPath,req.body.send,req.body.led]);


    //Changement de l etat de la checkbox en fonction du topic et de la requete
    if (req.body.send == "esp1/led"){
        if (req.body.led == "LED ON") led1_status = `<input type="checkbox" name="checkbox" checked value="dark" onclick="clickFn1(event)">`
        else led1_status = `<input type="checkbox" name="checkbox" value="dark" onclick="clickFn1(event)">`
    }
    else {
        if (req.body.led == "LED ON") led2_status = `<input type="checkbox" name="checkbox" checked value="dark" onclick="clickFn2(event)">`
        else led2_status = `<input type="checkbox" name="checkbox" value="dark" onclick="clickFn2(event)">`
    }
    

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
