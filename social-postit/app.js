const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

function loadUsers() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json')));
}

function loadPosts() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'posts.json')));
}

function savePosts(posts) {
    fs.writeFileSync(path.join(__dirname, 'posts.json'), JSON.stringify(posts, null, 2));
}

// Rimuovi post scaduti
function cleanExpiredPosts() {
    let posts = loadPosts();
    const now = Date.now();
    posts = posts.filter(post => post.expiryTime === null || post.expiryTime > now);
    savePosts(posts);
}

setInterval(cleanExpiredPosts, 5000); // Pulisce i post scaduti ogni 5 secondi

app.get('/', (req, res) => {
    cleanExpiredPosts();
    const posts = loadPosts();
    res.render('index', { posts });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();

    if (users.find(user => user.username === username)) {
        return res.redirect('/register'); // Username già esistente
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    users.push({ username, password: hashedPassword });
    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));

    res.redirect('/login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    const user = users.find(user => user.username === username);

    if (user && bcrypt.compareSync(password, user.password)) {
        res.redirect('/');
    } else {
        res.redirect('/login'); // Credenziali errate
    }
});

app.post('/post', (req, res) => {
    const { username, content, timer } = req.body;
    const expiryTime = timer === "unlimited" ? null : Date.now() + parseInt(timer);
    const posts = loadPosts();
    posts.push({ username, content, date: new Date().toISOString(), expiryTime });
    savePosts(posts);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
