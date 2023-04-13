const {readFileSync, writeFileSync} = require('fs');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

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
        			function clickFn(event) {
          				const checkbox = event.currentTarget;
					const led = document.getElementById("ledToggle");
          				led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
					led.closest('form').submit()          				
					//document.getElementById("btn").click()
        			}
			</script>	
                </head>
                <body>
                        <h1>IOC</h1>
                        <form method="GET" action="/LUM">
                          <button id='button'>LUM</button>
                        </form>

                        <form methode="POST" action="/LCD">
                                <input id="team_name" name="lcd" type="text" value="LCD">
                                <input name="send"  type="submit" value="Submit">
                        </form>

                        <div>
			LED : 
        			<label class="switch">
          				<input type="checkbox" name="checkbox" value="dark" onclick="clickFn(event)"> 
          				<span class="slider round"></span>
        			</label>
			</div>
			<form method="post" action="/LED">
                		<input type="hidden" id="ledToggle" name="led" value="test">
				</form>
		</body>
                </html>
                `);
});

app.get('/style.css',(req,res) => {
	res.sendFile(__dirname + "/" + "style.css");
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
                        <div>LUM : ${lum}</div>
                        <form method="GET" action="/LUM">
                          <button id='button'>REFRESH</button>
                        </form>
                </body>
                </html>
                `);
})

app.get('/LCD',(req,res) => {

        console.log(req.query.lcd);
	const { spawn } = require('child_process');

// Définir le chemin vers le script Python
const scriptPath = 'sendMQTT.py';

// Créer un processus enfant pour exécuter le script Python
const pythonProcess = spawn('python3', [scriptPath,'esp1/lcd','LCD '+ req.query.lcd]);	

        res.send(`<!DOCTYPE html>
        <html lang=fr>
        <head>
                <meta charset="uft-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>IOC</title>
        </head>
        <body>
                LCD PRINT : ${req.query.lcd}
        </body>
        </html>`)
})

app.post('/LED',(req,res) => {

        console.log(req.body.led);
	//console.log(req);
       // var spawn = require("child_process").spawn;
       // var process = spawn('python3',["../sendMQTT.py"]);
	
	//var spawn = require('child_process').spawn;

	//const { spawn } = require('child_process');
	//const ls = spawn('ls', ['-lh', '/usr']);

	
	const { spawn } = require('child_process');

// Définir le chemin vers le script Python
const scriptPath = 'sendMQTT.py';

// Créer un processus enfant pour exécuter le script Python
const pythonProcess = spawn('python3', [scriptPath,'esp1/led',req.body.led]);
// Écouter la sortie du script Python
pythonProcess.stdout.on('data', (data) => {
  console.log(`Sortie du script Python : ${data}`);
});

// Écouter les erreurs du script Python
pythonProcess.stderr.on('data', (data) => {
  console.error(`Erreur du script Python : ${data}`);
});

// Écouter la fin du processus Python
pythonProcess.on('close', (code) => {
  console.log(`Processus Python terminé avec le code de sortie ${code}`);
});
	/*res.send(
        res.send(`<!DOCTYPE html>
        <html lang=fr>
        <head>
                <meta charset="uft-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>IOC</title>
        </head>
        <body>
                LED PRINT : ${req.body.led}
        </body>
        </html>`)
	*/
	console.log(req.body.led == "LED ON");
	if (req.body.led == "LED ON"){
		res.send(`
                <!DOCTYPE html>
                <html lang=fr>
                <head>
                        <meta charset="uft-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>IOC</title>
                        <link rel="stylesheet" href="style.css">                
                        <script>
                                function clickFn(event) {
                                        const checkbox = event.currentTarget;
                                        const led = document.getElementById("ledToggle");
                                        led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
                                        led.closest('form').submit()
                                }
                        </script>       
                </head>
                <body>
                        <h1>IOC</h1>
                        <form method="GET" action="/LUM">
                          <button id='button'>LUM</button>
                        </form>

                        <form methode="POST" action="/LCD">
                                <input id="team_name" name="lcd" type="text" value="LCD">
                                <input name="send"  type="submit" value="Submit">
                        </form>

                        <div>LED : 
                                        <label class="switch">
                                        <input type="checkbox" checked  name="checkbox" value="dark" onclick="clickFn(event)"> 
                                        <span class="slider round"></span>
                                </label>
			</div>
                        <form method="post" action="/LED">
                                <input type="hidden" id="ledToggle" name="led" value="test">
                        </form>
                </body>
                </html>
                `);
	}
	else {

		res.send(`
                <!DOCTYPE html>
                <html lang=fr>
                <head>
                        <meta charset="uft-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>IOC</title>
                        <link rel="stylesheet" href="style.css">                
                        <script>
                                function clickFn(event) {
                                        const checkbox = event.currentTarget;
                                        const led = document.getElementById("ledToggle");
                                        led.value = checkbox.checked ? 'LED ON' : 'LED OFF';
                                        led.closest('form').submit()
                                }
                        </script>       
                </head>
                <body>
                        <h1>IOC</h1>
                        <form method="GET" action="/LUM">
                          <button id='button'>LUM</button>
                        </form>

                        <form methode="POST" action="/LCD">
                                <input id="team_name" name="lcd" type="text" value="LCD">
                                <input name="send"  type="submit" value="Submit">
                        </form>

                        <div> LED : 
                                        <label class="switch">
                                        <input type="checkbox" name="checkbox" value="dark" onclick="clickFn(event)"> 
                                        <span class="slider round"></span>
                                </label>
			</div>
                        <form method="post" action="/LED">
                                <input type="hidden" id="ledToggle" name="led" value="test">
                        </form>
                </body>
                </html>
                `);
	}
	
	res.status(200);
})

app.listen(8000,() => console.log('172.20.10.2'));