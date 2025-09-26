// server.js
// Simple Express server to pair with the provided front-end script.
// - Serves static files from /public
// - Persists data to data.json in project root
// - Provides APIs for auth (simulated), users, relationships, friend requests, posts and profile image upload
// - Adds simple chat endpoints to persist and retrieve messages and simulate a bot reply

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static front-end files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads dir exists
fs.ensureDirSync(UPLOADS_DIR);

// File upload config for profile pictures
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `${Date.now()}-${uuidv4()}${ext}`);
    }
});
const upload = multer({ storage });

// ---------- Helper: read/write data.json ----------
async function readData() {
    try {
        const exists = await fs.pathExists(DATA_FILE);
        if (!exists) {
            // If file doesn't exist, initialize with defaults
            const defaultData = initializeDefaultData();
            await writeData(defaultData);
            return defaultData;
        }
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        // Ensure structure exists
        if (!parsed.users) parsed.users = [];
        if (!parsed.relationships) parsed.relationships = {};
        if (!parsed.posts) parsed.posts = [];
        if (!parsed.chats) parsed.chats = [];
        return parsed;
    } catch (err) {
        console.error('Error reading data file:', err);
        const fallback = initializeDefaultData();
        await writeData(fallback);
        return fallback;
    }
}

async function writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ---------- Default data ----------
function initializeDefaultData() {
    // default initialCurrentUser as in front-end
    const initialCurrentUser = {
        fullName: "Kai General",
        username: "KaiGeneral",
        userId: "EG1001",
        email: "kai.general@example.com",
        dob: "1990-07-30",
        country: "USA",
        profilePic: "https://via.placeholder.com/150/0000FF/FFFFFF?text=User",
    };

    // sample all users (keep same usernames/userIds as front-end for easier integration)
    const allUsers = [
        { username: "TravelerJoe", userId: "TJ001", avatar: "https://via.placeholder.com/50/FF0000/FFFFFF?text=TJ", fullName: "Joe Traveler" },
        { username: "CodeMaster", userId: "CM002", avatar: "https://via.placeholder.com/50/00FF00/FFFFFF?text=CM", fullName: "Master Code" },
        { username: "ArtisticSoul", userId: "AS003", avatar: "https://via.placeholder.com/50/0000FF/FFFFFF?text=AS", fullName: "Soul Artist" },
        { username: "FoodieFan", userId: "FF004", avatar: "https://via.placeholder.com/50/FFFF00/000000?text=FF", fullName: "Fan Foodie" },
        { username: "FitnessGuru", userId: "FG005", avatar: "https://via.placeholder.com/50/FF00FF/FFFFFF?text=FG", fullName: "Guru Fitness" },
        { username: "BookWorm", userId: "BW006", avatar: "https://via.placeholder.com/50/00FFFF/FFFFFF?text=BW", fullName: "Worm Book" },
        { username: "TechGeek", userId: "TG007", avatar: "https://via.placeholder.com/50/800080/FFFFFF?text=TG", fullName: "Geek Tech" },
        { username: "NatureLover", userId: "NL008", avatar: "https://via.placeholder.com/50/008080/FFFFFF?text=NL", fullName: "Lover Nature" },
        { username: "CityExplorer", userId: "CE009", avatar: "https://via.placeholder.com/50/FF4500/FFFFFF?text=CE", fullName: "Explorer City" },
        { username: "MusicMaestro", userId: "MM010", avatar: "https://via.placeholder.com/50/DAA520/FFFFFF?text=MM", fullName: "Maestro Music" },
        { username: "EverGlowUser", userId: "EG1002", avatar: "https://via.placeholder.com/50/123456/FFFFFF?text=EU", fullName: "E. G. User" },
        { username: "AnotherUser", userId: "AU011", avatar: "https://via.placeholder.com/50/654321/FFFFFF?text=AU", fullName: "Another User" },
        { username: "TestUser", userId: "TEST001", avatar: "https://via.placeholder.com/50/789ABC/FFFFFF?text=TU", fullName: "Test User" },
        { username: "SampleUser", userId: "SAMPLE02", avatar: "https://via.placeholder.com/50/ABCDEF/000000?text=SU", fullName: "Sample User" },
    ];

    // create users array and include bot user
    const users = [
        // include initialCurrentUser as a full user object
        { ...initialCurrentUser },
        // convert allUsers array to full user objects
        ...allUsers.map(u => ({
            username: u.username,
            userId: u.userId,
            fullName: u.fullName || u.username,
            profilePic: u.avatar || `https://via.placeholder.com/150/CCCCCC/000000?text=${u.username}`,
            email: `${u.username.toLowerCase()}@example.com`,
            dob: null,
            country: null
        })),
        // bot user (server-side simulated)
        {
            username: "EverGlowBot",
            userId: "bot",
            fullName: "EverGlow Bot",
            profilePic: "https://via.placeholder.com/150/FF66CC/000000?text=Bot",
            email: "bot@everglow.local",
            dob: null,
            country: null
        }
    ];

    // relationships: mapping userId => { friends: [], pendingRequests: [], sentRequests: [] }
    const relationships = {};
    users.forEach(u => {
        relationships[u.userId] = { friends: [], pendingRequests: [], sentRequests: [] };
    });

    // posts and chats
    const posts = [];
    const chats = []; // each message: { id, fromId, toId, text, timestamp, read }

    return { users, relationships, posts, chats };
}

// ---------- Chat helpers ----------
function formatTimestamp(ts) {
    return new Date(ts).toISOString();
}

function generateBotReplyText(userMessage) {
    const text = (userMessage || '').toLowerCase();
    if (text.includes('hello') || text.includes('hi')) {
        return "Hello there! How can I help you today?";
    } else if (text.includes('how are you')) {
        return "I'm a bot, so I don't have feelings, but I'm ready to help!";
    } else if (text.includes('features')) {
        return "I can help you navigate the app, find friends, or just chat!";
    } else if (text.includes('name')) {
        return "I am EverGlow Bot, your friendly assistant.";
    } else if (text.includes('help')) {
        return "Sure — tell me what you need help with and I'll try to assist.";
    }
    // Default fallback
    return "I'm just a simple bot. How can I assist you further?";
}

// ---------- API Endpoints ----------

// Get server status / initialize
app.get('/api/status', async (req, res) => {
    const data = await readData();
    res.json({ ok: true, usersCount: data.users.length });
});

// Authentication (simulated)
// POST /api/login { username } -> returns user object (no real password/auth)
app.post('/api/login', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'username required' });

    const data = await readData();
    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.userId === username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    // In real app you'd return a token. For demo, return user object.
    res.json({ ok: true, user });
});

// POST /api/signup { fullName, username, email, dob, country, password? }
app.post('/api/signup', async (req, res) => {
    const { fullName, username, email, dob, country } = req.body;
    if (!fullName || !username || !email) {
        return res.status(400).json({ error: 'fullName, username and email are required' });
    }

    const data = await readData();
    const exists = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) return res.status(409).json({ error: 'Username already taken' });

    const newUserId = `USER${Date.now().toString().slice(-6)}`;
    const newUser = {
        fullName,
        username,
        userId: newUserId,
        email,
        dob: dob || null,
        country: country || null,
        profilePic: `https://via.placeholder.com/150/CCCCCC/000000?text=${encodeURIComponent(username)}`
    };

    data.users.push(newUser);
    data.relationships[newUserId] = { friends: [], pendingRequests: [], sentRequests: [] };
    await writeData(data);

    res.json({ ok: true, user: newUser });
});

// Get user by id
app.get('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const data = await readData();
    const user = data.users.find(u => u.userId === id || u.username === id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, user });
});

// Search users
// GET /api/users?q=term
app.get('/api/users', async (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    const data = await readData();
    let results = data.users;
    if (q) {
        results = results.filter(u =>
            (u.username || '').toLowerCase().includes(q) ||
            (u.userId || '').toLowerCase().includes(q) ||
            (u.fullName || '').toLowerCase().includes(q)
        );
    }
    // For client display, return avatar/profilePic and username/userId
    const formatted = results.map(u => ({
        username: u.username,
        userId: u.userId,
        avatar: u.profilePic,
        fullName: u.fullName
    }));
    res.json({ ok: true, users: formatted });
});

// Update user profile
// PUT /api/users/:id  (body contains fields to update)
app.put('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const data = await readData();
    const idx = data.users.findIndex(u => u.userId === id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    // Basic update: allow fullName, email, dob, country, profilePic, username (with uniqueness check)
    if (updates.username && updates.username !== data.users[idx].username) {
        const exists = data.users.find(u => u.username.toLowerCase() === updates.username.toLowerCase());
        if (exists) return res.status(409).json({ error: 'Username already taken' });
    }

    const allowed = ['fullName', 'email', 'dob', 'country', 'profilePic', 'username'];
    allowed.forEach(k => { if (Object.prototype.hasOwnProperty.call(updates, k)) data.users[idx][k] = updates[k]; });

    await writeData(data);
    res.json({ ok: true, user: data.users[idx] });
});

// Get relationships for user
// GET /api/relationships/:userId
app.get('/api/relationships/:userId', async (req, res) => {
    const userId = req.params.userId;
    const data = await readData();
    const rel = data.relationships[userId];
    if (!rel) return res.status(404).json({ error: 'Relationships not found for user' });
    res.json({ ok: true, relationships: rel });
});

// Send friend request
// POST /api/friend-request { fromId, toId }
app.post('/api/friend-request', async (req, res) => {
    const { fromId, toId } = req.body;
    if (!fromId || !toId) return res.status(400).json({ error: 'fromId and toId required' });
    if (fromId === toId) return res.status(400).json({ error: 'Cannot send request to yourself' });

    const data = await readData();
    const fromRel = data.relationships[fromId];
    const toRel = data.relationships[toId];
    if (!fromRel || !toRel) return res.status(404).json({ error: 'One or both users not found' });

    if (fromRel.friends.includes(toId)) return res.status(400).json({ error: 'Already friends' });
    if (fromRel.sentRequests.includes(toId)) return res.status(400).json({ error: 'Request already sent' });

    // If toId already sent a request to fromId, accept it automatically (optional behavior)
    if (fromRel.pendingRequests.includes(toId)) {
        // accept
        fromRel.pendingRequests = fromRel.pendingRequests.filter(id => id !== toId);
        fromRel.friends.push(toId);
        toRel.sentRequests = toRel.sentRequests.filter(id => id !== fromId);
        toRel.friends.push(fromId);
        await writeData(data);
        return res.json({ ok: true, accepted: true, message: 'Mutual request accepted', relationships: { [fromId]: fromRel, [toId]: toRel } });
    }

    // normal send
    fromRel.sentRequests.push(toId);
    toRel.pendingRequests.push(fromId);
    await writeData(data);
    res.json({ ok: true, message: 'Friend request sent', relationships: { [fromId]: fromRel, [toId]: toRel } });
});

// Accept friend request
// POST /api/friend-request/accept { userId, senderId }  (userId accepts senderId)
app.post('/api/friend-request/accept', async (req, res) => {
    const { userId, senderId } = req.body;
    if (!userId || !senderId) return res.status(400).json({ error: 'userId and senderId required' });

    const data = await readData();
    const userRel = data.relationships[userId];
    const senderRel = data.relationships[senderId];
    if (!userRel || !senderRel) return res.status(404).json({ error: 'One or both users not found' });

    // Remove pending and sent entries, add to friends
    userRel.pendingRequests = userRel.pendingRequests.filter(id => id !== senderId);
    if (!userRel.friends.includes(senderId)) userRel.friends.push(senderId);

    senderRel.sentRequests = senderRel.sentRequests.filter(id => id !== userId);
    if (!senderRel.friends.includes(userId)) senderRel.friends.push(userId);

    await writeData(data);
    res.json({ ok: true, message: 'Friend request accepted', relationships: { [userId]: userRel, [senderId]: senderRel } });
});

// Decline friend request
// POST /api/friend-request/decline { userId, senderId }
app.post('/api/friend-request/decline', async (req, res) => {
    const { userId, senderId } = req.body;
    if (!userId || !senderId) return res.status(400).json({ error: 'userId and senderId required' });

    const data = await readData();
    const userRel = data.relationships[userId];
    const senderRel = data.relationships[senderId];
    if (!userRel || !senderRel) return res.status(404).json({ error: 'One or both users not found' });

    userRel.pendingRequests = userRel.pendingRequests.filter(id => id !== senderId);
    senderRel.sentRequests = senderRel.sentRequests.filter(id => id !== userId);

    await writeData(data);
    res.json({ ok: true, message: 'Friend request declined', relationships: { [userId]: userRel, [senderId]: senderRel } });
});

// Cancel friend request (sender cancels)
// POST /api/friend-request/cancel { fromId, toId }
app.post('/api/friend-request/cancel', async (req, res) => {
    const { fromId, toId } = req.body;
    if (!fromId || !toId) return res.status(400).json({ error: 'fromId and toId required' });

    const data = await readData();
    const fromRel = data.relationships[fromId];
    const toRel = data.relationships[toId];
    if (!fromRel || !toRel) return res.status(404).json({ error: 'One or both users not found' });

    fromRel.sentRequests = fromRel.sentRequests.filter(id => id !== toId);
    toRel.pendingRequests = toRel.pendingRequests.filter(id => id !== fromId);

    await writeData(data);
    res.json({ ok: true, message: 'Friend request cancelled', relationships: { [fromId]: fromRel, [toId]: toRel } });
});

// Get posts (generate random posts or return stored posts array if present)
// GET /api/posts?count=10
app.get('/api/posts', async (req, res) => {
    const count = parseInt(req.query.count || '10', 10);
    // For simplicity, generate random posts (the front-end code already generates posts client-side).
    // Here we return a shaped response with username, avatar, content, image, likes, comments similar to front-end generatePostHTML.
    const randomUsernames = [
        "TravelerJoe", "CodeMaster", "ArtisticSoul", "FoodieFan", "FitnessGuru",
        "BookWorm", "TechGeek", "NatureLover", "CityExplorer", "MusicMaestro",
        "GamerPro", "CreativeMind", "StarGazer", "OceanDreamer", "MountainHiker"
    ];
    const randomPostContents = [
        "Just enjoying the beautiful sunset today! #EverGlow #SunsetVibes",
        "Hiking through the mountains today! So refreshing. #Adventure #Mountains",
        "Coding late night, fueled by coffee! 💻☕ #DeveloperLife #Code",
        "New art piece finished! What do you think? #Art #Creative",
        "Delicious homemade pasta for dinner! 🍝 #Foodie #Cooking",
        "Morning workout done! Feeling energized. 💪 #Fitness #HealthyLife",
        "Lost in a good book. Any recommendations? #Reading #Books",
        "Exploring the city streets. So much to see! #CityLife #Wanderlust",
        "Jamming to some new tunes. Music is life! 🎶 #MusicLover",
        "Just won a match! GG! #Gaming #Victory",
        "Brainstorming new ideas for my next project. #Innovation #Ideas",
        "Clear skies tonight, perfect for stargazing. ✨ #Astronomy #NightSky",
        "Dreaming of the ocean and sandy beaches. 🌊 #BeachVibes #Travel",
        "Another beautiful day to be alive! #Gratitude #GoodVibes",
        "Learning something new every day. Never stop growing! #Learning #Knowledge"
    ];
    const randomCommentTexts = [
        "Wow, stunning view!", "Absolutely gorgeous!", "Looks amazing! Which trail is this?",
        "So inspiring!", "Yum! Recipe please?", "Keep up the great work!",
        "Love this!", "So true!", "Wish I was there!", "Fantastic!",
        "This made my day!", "Pure talent!", "Tell me more!", "Incredible!",
        "You're awesome!"
    ];

    function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    const posts = [];
    for (let i = 0; i < count; i++) {
        const username = randomUsernames[rnd(0, randomUsernames.length - 1)];
        const avatar = `https://via.placeholder.com/50/${(Math.floor(Math.random()*16777215)).toString(16)}/FFFFFF?text=${username.substring(0,2).toUpperCase()}`;
        const content = randomPostContents[rnd(0, randomPostContents.length - 1)];
        const image = `https://picsum.photos/seed/${Math.random()}/600/400`;
        const likes = rnd(0, 500);
        const comments = [];
        const commentsN = rnd(0,3);
        for (let j=0;j<commentsN;j++){
            comments.push({
                id: `p${i}-c${j}`,
                username: randomUsernames[rnd(0, randomUsernames.length - 1)],
                avatar: `https://via.placeholder.com/30/${(Math.floor(Math.random()*16777215)).toString(16)}/FFFFFF?text=${'C'}`,
                text: randomCommentTexts[rnd(0, randomCommentTexts.length - 1)],
                likes: rnd(0,20)
            });
        }
        posts.push({ username, avatar, content, image, likes, comments });
    }
    res.json({ ok: true, posts });
});

// Upload profile pic
// POST /api/upload-profile-pic (form-data) file field: profilePic, body: userId
app.post('/api/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
    const file = req.file;
    const { userId } = req.body;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const data = await readData();
    const idx = data.users.findIndex(u => u.userId === userId);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    // Update user's profilePic to the uploaded relative URL
    const relativeUrl = `/uploads/${path.basename(file.path)}`;
    data.users[idx].profilePic = relativeUrl;
    await writeData(data);

    res.json({ ok: true, profilePicUrl: relativeUrl, user: data.users[idx] });
});

// ---------- Chat endpoints ----------

// Get conversation between two participants
// GET /api/chats/:userId/:partnerId
// returns messages sorted by timestamp ascending
app.get('/api/chats/:userId/:partnerId', async (req, res) => {
    const { userId, partnerId } = req.params;
    if (!userId || !partnerId) return res.status(400).json({ error: 'userId and partnerId required' });

    const data = await readData();
    const userExists = data.users.some(u => u.userId === userId);
    const partnerExists = data.users.some(u => u.userId === partnerId);
    if (!userExists || !partnerExists) return res.status(404).json({ error: 'One or both users not found' });

    const messages = (data.chats || []).filter(m =>
        (m.fromId === userId && m.toId === partnerId) || (m.fromId === partnerId && m.toId === userId)
    ).sort((a, b) => a.timestamp - b.timestamp);

    res.json({ ok: true, messages });
});

// Send a message
// POST /api/chats/message  { fromId, toId, text }
// returns stored message and optionally bot reply if toId === 'bot'
app.post('/api/chats/message', async (req, res) => {
    const { fromId, toId, text } = req.body;
    if (!fromId || !toId || typeof text === 'undefined') return res.status(400).json({ error: 'fromId, toId and text required' });

    const data = await readData();
    const fromExists = data.users.some(u => u.userId === fromId);
    const toExists = data.users.some(u => u.userId === toId);
    if (!fromExists || !toExists) return res.status(404).json({ error: 'One or both users not found' });

    const msg = {
        id: uuidv4(),
        fromId,
        toId,
        text: String(text),
        timestamp: Date.now(),
        read: false
    };

    data.chats = data.chats || [];
    data.chats.push(msg);

    // If sending to the bot, generate a bot reply immediately (server-side simulation).
    let botReply = null;
    if (toId === 'bot') {
        const replyText = generateBotReplyText(text);
        botReply = {
            id: uuidv4(),
            fromId: 'bot',
            toId: fromId,
            text: replyText,
            timestamp: Date.now() + 500, // slightly later timestamp
            read: false
        };
        data.chats.push(botReply);
    }

    await writeData(data);

    res.json({ ok: true, message: msg, botReply });
});

// Get conversation summaries for a user
// GET /api/chats/conversations/:userId
// returns array of { partnerId, lastMessage, unreadCount, partnerUser }
app.get('/api/chats/conversations/:userId', async (req, res) => {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const data = await readData();
    const userExists = data.users.some(u => u.userId === userId);
    if (!userExists) return res.status(404).json({ error: 'User not found' });

    const chats = data.chats || [];
    const partnerMap = {}; // partnerId -> { lastMessage, unreadCount }

    chats.forEach(m => {
        if (m.fromId === userId || m.toId === userId) {
            const partnerId = m.fromId === userId ? m.toId : m.fromId;
            const existing = partnerMap[partnerId];
            if (!existing || m.timestamp >= existing.lastMessage.timestamp) {
                partnerMap[partnerId] = {
                    partnerId,
                    lastMessage: m
                };
            }
            // unread messages: messages to me (toId === userId) and read === false
            if (m.toId === userId && !m.read) {
                partnerMap[partnerId].unreadCount = (partnerMap[partnerId].unreadCount || 0) + 1;
            }
        }
    });

    // convert map to array and attach partner user info
    const result = Object.values(partnerMap).map(item => {
        const partnerUser = data.users.find(u => u.userId === item.partnerId) || null;
        return { partnerId: item.partnerId, partnerUser, lastMessage: item.lastMessage, unreadCount: item.unreadCount || 0 };
    }).sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

    res.json({ ok: true, conversations: result });
});

// Mark messages as read in a conversation (from partner -> user)
// POST /api/chats/mark-read { userId, partnerId }
app.post('/api/chats/mark-read', async (req, res) => {
    const { userId, partnerId } = req.body;
    if (!userId || !partnerId) return res.status(400).json({ error: 'userId and partnerId required' });

    const data = await readData();
    const userExists = data.users.some(u => u.userId === userId);
    const partnerExists = data.users.some(u => u.userId === partnerId);
    if (!userExists || !partnerExists) return res.status(404).json({ error: 'One or both users not found' });

    let changed = 0;
    data.chats = data.chats || [];
    data.chats.forEach(m => {
        if (m.fromId === partnerId && m.toId === userId && !m.read) {
            m.read = true;
            changed++;
        }
    });

    await writeData(data);
    res.json({ ok: true, marked: changed });
});

// Fallback for SPA routes (must be after all API routes)
app.get(/^\/(?!api).*/, (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Not found');
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});