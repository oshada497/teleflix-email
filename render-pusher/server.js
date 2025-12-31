const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store connected clients by email
const users = new Map();

io.on('connection', (socket) => {
    socket.on('join', (email) => {
        if (email) {
            socket.join(email);
            console.log(`User joined: ${email}`);
        }
    });

    socket.on('disconnect', () => {
        // Socket.io handles leaving rooms automatically
    });
});

// Admin/System endpoint to trigger notification
app.post('/notify', (req, res) => {
    const { to, secret } = req.body;

    // Basic security check (Optional: Set this in Render environment variables)
    const appSecret = process.env.PUSH_SECRET || "default_secret";
    if (secret !== appSecret) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (to) {
        console.log(`Notifying user: ${to}`);
        io.to(to).emit('new_email', { timestamp: Date.now() });
        return res.json({ success: true });
    }

    res.status(400).json({ error: "No recipient specified" });
});

// Keep-alive/health check endpoint
app.get('/ping', (req, res) => {
    res.send('pong');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Pusher server listening on port ${PORT}`);
});
