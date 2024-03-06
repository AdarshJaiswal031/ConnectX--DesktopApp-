const { app, BrowserWindow } = require('electron');
const dgram = require('dgram');
const os = require('os');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile('index.html');
}

app.on('ready', () => {
    createWindow();
    startDiscovery();
});

function startDiscovery() {
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
        console.log(`Server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {
        console.log(`Received discovery message from ${rinfo.address}:${rinfo.port}`);
        logDiscoveredIP(rinfo.address);
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`Discovery server listening on ${address.address}:${address.port}`);
    });

    server.bind(5000); // Use any available port for UDP broadcast

    // Broadcast a discovery message to find other instances of the app
    const broadcastAddress = getBroadcastAddress();
    const message = Buffer.from('discover');
    server.send(message, 0, message.length, 5000, broadcastAddress);
}

function getBroadcastAddress() {
    const interfaces = os.networkInterfaces();
    let broadcastAddress;

    for (const key in interfaces) {
        interfaces[key].forEach((iface) => {
            if (!iface.internal && iface.family === 'IPv4') {
                broadcastAddress = iface.broadcast;
            }
        });
    }

    return broadcastAddress;
}

function logDiscoveredIP(ip) {
    // You can perform any logging or processing of the discovered IP addresses here
    console.log(`Discovered IP: ${ip}`);
}
