const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { Server } = require('ws');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// ---------------- USERS ----------------

function loadUsers() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json')));
}

// ---------------- POSTS ----------------

function loadPosts() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'posts.json')));
}

function savePosts(posts) {
    fs.writeFileSync(path.join(__dirname, 'posts.json'), JSON.stringify(posts, null, 2));
}

function cleanExpiredPosts() {
    let posts = loadPosts();
    const now = Date.now();
    posts = posts.filter(post => post.expiryTime === null || post.expiryTime > now);
    savePosts(posts);
}

setInterval(cleanExpiredPosts, 5000);

// ---------------- LOGIN PROTECTION ----------------

function requireLogin(req, res, next) {
    if (!req.cookies.username) {
        return res.redirect('/login');
    }
    next();
}

// ---------------- ROUTES ----------------

app.get('/', requireLogin, (req, res) => {
    cleanExpiredPosts();
    const posts = loadPosts();
    res.render('index', { posts, username: req.cookies.username });
});

app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();

    if (users.find(u => u.username === username)) return res.redirect('/register');

    const hashed = bcrypt.hashSync(password, 8);
    users.push({ username, password: hashed });

    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
    res.redirect('/login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    const user = users.find(u => u.username === username);

    if (user && bcrypt.compareSync(password, user.password)) {
        res.cookie("username", username);
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.post('/post', requireLogin, (req, res) => {
    const username = req.cookies.username;
    const { content, timer } = req.body;

    const expiryTime = timer === "unlimited" ? null : Date.now() + parseInt(timer);

    const posts = loadPosts();
    posts.push({
        id: Date.now(),   // ID UNICO
        username,
        content,
        date: new Date().toISOString(),
        expiryTime
    });

    savePosts(posts);
    res.redirect('/');
});

// ---------------- DELETE POST ----------------

app.get('/delete-post/:id', requireLogin, (req, res) => {
    const id = parseInt(req.params.id);
    let posts = loadPosts();

    posts = posts.filter(p => p.id !== id);

    savePosts(posts);
    res.redirect('/');
});

// ---------------- SERVER + WEBSOCKET ----------------

const server = app.listen(PORT, () =>
    console.log(`Server attivo su http://localhost:${PORT}`)
);

const wsServer = new Server({ server });

let chat = [];

wsServer.on('connection', ws => {
    ws.send(JSON.stringify(chat));

    ws.on('message', msg => {
        const data = JSON.parse(msg);

        const riga = {
            username: data.username,
            text: data.text,
            time: new Date().toLocaleTimeString()
        };

        chat.push(riga);

        wsServer.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(chat));
            }
        });
    });
});
