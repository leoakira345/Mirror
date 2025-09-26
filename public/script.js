// script.js

// --- Global Elements ---
const authSection = document.getElementById('auth-section');
const mainApp = document.getElementById('main-app');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const appContent = document.getElementById('app-content');
// Update navButtons to include the new 'explore' button
const navButtons = document.querySelectorAll('.nav-button');
const chatBotContainer = document.getElementById('chat-bot-container');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const navProfilePic = document.getElementById('nav-profile-pic');

// NEW: Global element for the close chat button (requires HTML update)
const closeChatButton = document.querySelector('.close-chat-button');
// NEW: Global element for the chat partner name display (requires HTML update)
const chatPartnerNameDisplay = document.getElementById('chat-partner-name');
// NEW: Global element for the friend request notification badge
const friendRequestCountBadge = document.getElementById('friend-request-count');


// --- User Data (Simulated) ---
// Define an initial default user
const initialCurrentUser = {
    fullName: "Kai General",
    username: "KaiGeneral", // This username will be verified
    userId: "EG1001",
    email: "kai.general@example.com",
    dob: "1990-07-30", // Using today's date as a placeholder for DOB
    country: "USA",
    profilePic: "https://via.placeholder.com/150/0000FF/FFFFFF?text=User"
};

// This variable will hold the current user's data, loaded from localStorage or default
let currentUser = { ...initialCurrentUser };

// --- All Users Data (Simulated for Add Friends Search) ---
// This list intentionally does NOT include currentUser initially.
// We will add currentUser to the search pool dynamically when searching.
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

// Filter out the current user from the list of all users for suggestions/search
// This list is used when the search bar is empty.
// This will be dynamically generated after currentUser is loaded.
let suggestedFriends = [];

// NEW: Global variable to store all users' relationship data (friends, pending requests, sent requests)
// Structure: { userId: { friends: [], pendingRequests: [], sentRequests: [] } }
let allUsersRelationships = {};

// NEW: Global variable to track the current chat partner
let currentChatPartner = { id: 'bot', name: 'EverGlow Bot' };


// --- Data for Random Posts ---
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

const profilePicColors = [
    "FF5733", "33FF57", "3357FF", "FF33A1", "A133FF", "33FFF5", "FFC300", "C70039", "900C3F", "581845"
];

// --- Helper to generate a random integer ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Helper to generate a random post HTML ---
function generatePostHTML(post) {
    let commentsHtml = '';
    post.comments.forEach((comment, index) => {
        // Determine if the comment username should have a verified tick
        const isCommenterVerified = comment.username === "KaiGeneral"; // Check if the username is "KaiGeneral"
        const verifiedCommentIconHtml = isCommenterVerified ? '<i class="fas fa-check-circle verified-icon"></i>' : ''; // Add icon if verified

        commentsHtml += `
            <div class="comment-wrapper"> <!-- New wrapper for comment and its reply input -->
                <div class="comment-item" data-comment-id="${comment.id || 'comment-' + index}">
                    <img src="${comment.avatar}" alt="User Avatar" class="comment-avatar">
                    <div class="comment-content-wrapper">
                        <span class="comment-username">${comment.username}${verifiedCommentIconHtml}</span>
                        <p class="comment-text">${comment.text}</p>
                        <div class="comment-actions">
                            <button class="comment-action-button comment-like-button">
                                <i class="fas fa-heart"></i> Like (<span class="comment-like-count">${comment.likes || 0}</span>)
                            </button>
                            <button class="comment-action-button comment-reply-button">
                                <i class="fas fa-reply"></i> Reply
                            </button>
                        </div>
                    </div>
                </div>
                <div class="reply-input-area hidden">
                    <input type="text" placeholder="Reply to ${comment.username}..." class="reply-input">
                    <button class="send-reply-button" data-original-username="${comment.username}">Send</button>
                </div>
            </div>
        `;
    });

    return `
        <div class="post">
            <div class="post-header">
                <img src="${post.avatar}" alt="User Avatar" class="post-avatar">
                <span class="post-username">${post.username}</span>
            </div>
            <p class="post-content">${post.content}</p>
            <img src="${post.image}" alt="Post Image" class="post-image">
            <div class="post-actions">
                <button class="post-action-button like-button">
                    <i class="fas fa-heart"></i> Like (<span class="like-count">${post.likes}</span>)
                </button>
                <button class="post-action-button comment-toggle-button">
                    <i class="fas fa-comment"></i> Comment
                </button>
            </div>

            <div class="post-comments hidden">
                <div class="comments-list">
                    ${commentsHtml}
                </div>
                <div class="comment-input-area">
                    <input type="text" placeholder="Write a comment..." class="comment-input">
                    <button class="send-comment-button">Post</button>
                </div>
            </div>
        </div>
    `;
}

// --- Persistence Functions ---
function loadUserData() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            console.log("Loaded user data from localStorage:", currentUser);
        } catch (e) {
            console.error("Error parsing stored user data:", e);
            currentUser = { ...initialCurrentUser }; // Fallback to default if parsing fails
        }
    } else {
        console.log("No user data found in localStorage, using initial default.");
        // If no user data is found, save the initial default user to localStorage
        // so it's available for subsequent loads.
        saveUserData(); // This will also initialize allUsersRelationships
    }

    // Load all users' relationship data
    const storedRelationships = localStorage.getItem('allUsersRelationships');
    if (storedRelationships) {
        try {
            allUsersRelationships = JSON.parse(storedRelationships);
        } catch (e) {
            console.error("Error parsing stored relationships data:", e);
            initializeAllUsersRelationships(); // Re-initialize if corrupted
        }
    } else {
        initializeAllUsersRelationships(); // Initialize if not found
    }

    // Ensure currentUser's relationship data is loaded into currentUser object
    // This is crucial for the active user's friend/request lists
    const currentUserRel = allUsersRelationships[currentUser.userId];
    if (currentUserRel) {
        currentUser.friends = currentUserRel.friends || [];
        currentUser.pendingRequests = currentUserRel.pendingRequests || [];
        currentUser.sentRequests = currentUserRel.sentRequests || [];
    } else {
        // This should ideally not happen if initializeAllUsersRelationships is called correctly
        // but as a fallback, ensure these properties exist
        currentUser.friends = [];
        currentUser.pendingRequests = [];
        currentUser.sentRequests = [];
    }

    // Re-filter suggested friends based on the loaded currentUser
    suggestedFriends = allUsers.filter(user => user.userId !== currentUser.userId);
}

function saveUserData() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    // Also update and save the current user's relationships in the global relationships object
    allUsersRelationships[currentUser.userId] = {
        friends: currentUser.friends,
        pendingRequests: currentUser.pendingRequests,
        sentRequests: currentUser.sentRequests
    };
    localStorage.setItem('allUsersRelationships', JSON.stringify(allUsersRelationships));
    console.log("Saved user data and relationships to localStorage.");
}

// NEW: Function to initialize all users' relationship data
function initializeAllUsersRelationships() {
    const allKnownUsers = [
        ...allUsers,
        { // Add initialCurrentUser to the list of all known users for relationship tracking
            username: initialCurrentUser.username,
            userId: initialCurrentUser.userId,
            avatar: initialCurrentUser.profilePic,
            fullName: initialCurrentUser.fullName
        }
    ];
    // Ensure uniqueness based on userId
    const uniqueKnownUsers = Array.from(new Map(allKnownUsers.map(user => [user.userId, user])).values());

    allUsersRelationships = {};
    uniqueKnownUsers.forEach(user => {
        if (!allUsersRelationships[user.userId]) {
            allUsersRelationships[user.userId] = {
                friends: [],
                pendingRequests: [],
                sentRequests: []
            };
        }
    });
    localStorage.setItem('allUsersRelationships', JSON.stringify(allUsersRelationships));
    console.log("Initialized all users' relationship data.");
}


// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    loadUserData(); // Load user data at startup

    // Set initial profile picture in navbar based on loaded data
    navProfilePic.src = currentUser.profilePic;

    // Update friend request notification badge
    updateFriendRequestNotification();

    // Add event listeners for auth tabs
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    signupTab.addEventListener('click', () => switchAuthTab('signup'));

    // Add event listeners for post actions (delegation for dynamic content)
    appContent.addEventListener('click', (event) => {
        if (event.target.closest('.comment-toggle-button')) {
            toggleComments(event.target.closest('.comment-toggle-button'));
        } else if (event.target.closest('.like-button')) {
            likePost(event.target.closest('.like-button'));
        } else if (event.target.closest('.send-comment-button')) {
            sendComment(event.target.closest('.send-comment-button'));
        }
        // NEW: Comment actions
        else if (event.target.closest('.comment-like-button')) {
            likeComment(event.target.closest('.comment-like-button'));
        } else if (event.target.closest('.comment-reply-button')) {
            toggleReplyInput(event.target.closest('.comment-reply-button'));
        } else if (event.target.closest('.send-reply-button')) {
            sendReply(event.target.closest('.send-reply-button'));
        }
        // NEW: Friend request actions (delegated from appContent)
        else if (event.target.closest('.accept-request-button')) {
            const senderId = event.target.closest('.accept-request-button').dataset.senderId;
            acceptFriendRequest(senderId);
        } else if (event.target.closest('.decline-request-button')) {
            const senderId = event.target.closest('.decline-request-button').dataset.senderId;
            declineFriendRequest(senderId);
        } else if (event.target.closest('.cancel-request-button')) {
            const receiverId = event.target.closest('.cancel-request-button').dataset.receiverId;
            cancelFriendRequest(receiverId);
        }
    });

    // NEW: Add event listener for the chat close button
    if (closeChatButton) {
        closeChatButton.addEventListener('click', closeChat);
    }

    // NEW: Allow sending message with Enter key (updated to call sendMessage)
    chatInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Initial navigation to home if already "logged in" (for demo purposes)
    // In a real app, you'd check for a session/token
    // For this demo, we start at auth, then navigate to home after login
});

// --- Authentication Functions ---
function switchAuthTab(tab) {
    loginTab.classList.remove('active');
    signupTab.classList.remove('active');
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');

    if (tab === 'login') {
        loginTab.classList.add('active');
        loginForm.classList.remove('hidden');
    } else {
        signupTab.classList.add('active');
        signupForm.classList.remove('hidden');
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (username && password) {
        // Simulate successful login
        alert('Login successful! Welcome back, ' + username + '!');
        authSection.classList.add('hidden');
        mainApp.classList.remove('hidden');

        // Ensure the nav profile pic is updated based on the current user data
        // (which would have been loaded from localStorage on DOMContentLoaded)
        navProfilePic.src = currentUser.profilePic;

        navigate('home'); // Navigate to home page after login
    } else {
        alert('Please enter both username and password.');
    }
}

function signup() {
    const fullName = document.getElementById('signup-fullname').value;
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const dob = document.getElementById('signup-dob').value;
    const country = document.getElementById('signup-country').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (!fullName || !username || !email || !dob || !country || !password || !confirmPassword) {
        alert('Please fill in all fields.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    // Simulate successful signup
    alert('Sign Up successful! You can now log in.');

    // NEW: Add new user to allUsers and initialize their relationships
    const newUserId = `USER${Date.now().toString().slice(-6)}`; // Simple unique ID
    const newUser = {
        fullName: fullName,
        username: username,
        userId: newUserId,
        email: email,
        dob: dob,
        country: country,
        profilePic: "https://via.placeholder.com/150/CCCCCC/000000?text=NewUser" // Default pic for new users
    };

    // Add to allUsers (for search purposes)
    allUsers.push({
        username: newUser.username,
        userId: newUser.userId,
        avatar: newUser.profilePic,
        fullName: newUser.fullName
    });

    // Initialize relationships for the new user
    allUsersRelationships[newUser.userId] = {
        friends: [],
        pendingRequests: [],
        sentRequests: []
    };
    localStorage.setItem('allUsersRelationships', JSON.stringify(allUsersRelationships)); // Save immediately

    // Clear signup form
    document.getElementById('signup-fullname').value = '';
    document.getElementById('signup-username').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-dob').value = '';
    document.getElementById('signup-country').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';

    switchAuthTab('login'); // Switch back to login tab
}

// --- Placeholder Social Login Functions ---
function continueWithGoogle() {
    alert('Initiating Google login... (In a real application, this would redirect to Google for authentication and then handle the callback.)');
    // Here you would typically initiate the OAuth 2.0 flow for Google
    // e.g., window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?...';
}

function continueWithFacebook() {
    alert('Initiating Facebook login... (In a real application, this would redirect to Facebook for authentication and then handle the callback.)');
    // Here you would typically initiate the OAuth 2.0 flow for Facebook
    // e.g., window.location.href = 'https://www.facebook.com/v12.0/dialog/oauth?...';
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        mainApp.classList.add('hidden');
        authSection.classList.remove('hidden');
        // Clear login fields for next login
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        switchAuthTab('login'); // Ensure login tab is active
        // We don't clear localStorage.currentUser here,
        // so the user's profile data persists for their next login.

        // NEW: Reset chat state on logout
        currentChatPartner = { id: 'bot', name: 'EverGlow Bot' };
        chatBotContainer.classList.add('hidden'); // Ensure chat is closed
        chatMessages.innerHTML = ''; // Clear chat history
        updateChatHeader(); // Reset chat header
    }
}

// --- Navigation Functions ---
function navigate(page, data = {}) { // Add data parameter
    // Remove active class from all nav buttons
    navButtons.forEach(button => button.classList.remove('active'));

    // Add active class to the clicked button
    // Note: This assumes direct onclick calls. For dynamic navigation,
    // you might need a more robust way to highlight the active button.
    const activeButton = document.querySelector(`.nav-button[onclick*="navigate('${page}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Clear current content
    appContent.innerHTML = '';

    // Load content based on page
    switch (page) {
        case 'home':
            loadHomePage();
            break;
        case 'explore': // New case for Explore page
            loadExplorePage();
            break;
        case 'trending':
            loadTrendingVideos();
            break;
        case 'friends':
            loadAddFriendsPage();
            break;
        case 'friendRequests': // NEW: Case for Friend Requests page
            loadFriendRequestsPage();
            break;
        case 'profile':
            loadProfilePage(data.userId); // Pass userId to loadProfilePage
            break;
        default:
            loadHomePage(); // Default to home
    }
    // Scroll content to top
    appContent.scrollTop = 0;
}

// --- Content Loading Functions ---

function loadHomePage() {
    let postsHtml = '';
    const numberOfPosts = 10; // Generate 10 random posts for the home page

    for (let i = 0; i < numberOfPosts; i++) {
        const username = randomUsernames[getRandomInt(0, randomUsernames.length - 1)];
        const postContent = randomPostContents[getRandomInt(0, randomPostContents.length - 1)];
        const avatarColor = profilePicColors[getRandomInt(0, profilePicColors.length - 1)];
        const avatarText = username.substring(0, 2).toUpperCase();
        const avatarUrl = `https://via.placeholder.com/50/${avatarColor}/FFFFFF?text=${avatarText}`;
        const imageUrl = `https://picsum.photos/seed/${Math.random()}/600/400`; // Random image
        const likes = getRandomInt(5, 200);

        const comments = [];
        const numberOfComments = getRandomInt(0, 3); // 0 to 3 comments per post
        for (let j = 0; j < numberOfComments; j++) {
            const commentUsername = randomUsernames[getRandomInt(0, randomUsernames.length - 1)];
            const commentAvatarColor = profilePicColors[getRandomInt(0, profilePicColors.length - 1)];
            const commentAvatarText = commentUsername.substring(0, 2).toUpperCase();
            const commentAvatarUrl = `https://via.placeholder.com/30/${commentAvatarColor}/FFFFFF?text=${commentAvatarText}`;
            const commentText = randomCommentTexts[getRandomInt(0, randomCommentTexts.length - 1)];
            comments.push({
                id: `comment-${i}-${j}`, // Unique ID for demo
                username: commentUsername,
                avatar: commentAvatarUrl,
                text: commentText,
                likes: getRandomInt(0, 20) // Random likes for comments
            });
        }

        postsHtml += generatePostHTML({
            username: username,
            avatar: avatarUrl,
            content: postContent,
            image: imageUrl,
            likes: likes,
            comments: comments
        });
    }
    appContent.innerHTML = postsHtml;
}

function loadExplorePage() {
    let postsHtml = '';
    const numberOfPosts = 15; // Generate more posts for the explore page

    for (let i = 0; i < numberOfPosts; i++) {
        const username = randomUsernames[getRandomInt(0, randomUsernames.length - 1)];
        const postContent = randomPostContents[getRandomInt(0, randomPostContents.length - 1)];
        const avatarColor = profilePicColors[getRandomInt(0, profilePicColors.length - 1)];
        const avatarText = username.substring(0, 2).toUpperCase();
        const avatarUrl = `https://via.placeholder.com/50/${avatarColor}/FFFFFF?text=${avatarText}`;
        const imageUrl = `https://picsum.photos/seed/${Math.random()}/600/400`; // Random image
        const likes = getRandomInt(10, 300);

        const comments = [];
        const numberOfComments = getRandomInt(0, 5); // 0 to 5 comments per post
        for (let j = 0; j < numberOfComments; j++) {
            const commentUsername = randomUsernames[getRandomInt(0, randomUsernames.length - 1)];
            const commentAvatarColor = profilePicColors[getRandomInt(0, profilePicColors.length - 1)];
            const commentAvatarText = commentUsername.substring(0, 2).toUpperCase();
            const commentAvatarUrl = `https://via.placeholder.com/30/${commentAvatarColor}/FFFFFF?text=${commentAvatarText}`;
            const commentText = randomCommentTexts[getRandomInt(0, randomCommentTexts.length - 1)];
            comments.push({
                id: `comment-${i}-${j}`, // Unique ID for demo
                username: commentUsername,
                avatar: commentAvatarUrl,
                text: commentText,
                likes: getRandomInt(0, 20) // Random likes for comments
            });
        }

        postsHtml += generatePostHTML({
            username: username,
            avatar: avatarUrl,
            content: postContent,
            image: imageUrl,
            likes: likes,
            comments: comments
        });
    }
    appContent.innerHTML = postsHtml;
}


function loadTrendingVideos() {
    const videos = [
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', description: 'A classic hit by Rick Astley.' },
        { id: 'LXb3EKWsInQ', title: 'Lo-fi Hip Hop Radio', description: 'Beats to relax/study to.' },
        { id: 'JGwWNGJdvx8', title: 'Shape of You', description: 'Ed Sheeran - Official Music Video.' },
        { id: 'kXYiU_JCYtU', title: 'The Kiffness - Alugalug Cat', description: 'Catchy cat song.' },
        { id: 'V_fM-g_000Q', title: 'How to Make a Website', description: 'A beginner-friendly tutorial.' },
        { id: 'xvFZjo5PgG0', title: 'Top 10 Travel Destinations', description: 'Explore the world with us!' },
        { id: 'tgbNymZ7vqY', title: 'Epic Nature Scenery', description: 'Breathtaking views from around the world.' },
        { id: 'M7lc1UVf-VE', title: 'Relaxing Rain Sounds', description: 'Perfect for sleep or focus.' },
        { id: 'q_q6g_D_P_A', title: 'Funny Animal Compilation', description: 'Laugh out loud with these hilarious animals.' },
        { id: 'N_q_q_q_q_q', title: 'Science Explained in 5 Minutes', description: 'Complex topics made simple.' }
    ];

    let videosHtml = `
        <div class="trending-videos-section">
            <h2>Trending Videos</h2>
            <div class="video-list-container">
    `;
    videos.forEach(video => {
        videosHtml += `
            <div class="video-item">
                <iframe src="https://www.youtube.com/embed/${video.id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p>${video.description}</p>
                </div>
            </div>
        `;
    });
    videosHtml += `
            </div>
        </div>
    `;
    appContent.innerHTML = videosHtml;
}

function loadAddFriendsPage() {
    appContent.innerHTML = `
        <div class="add-friends-section">
            <h2>Find Users</h2>
            <div class="search-bar">
                <input type="text" placeholder="Search by Username or User ID..." id="friend-search-input">
            </div>
            <div class="friends-list-container" id="search-results-container">
                <!-- Users will be loaded here by JavaScript -->
            </div>
        </div>
    `;

    const searchInput = document.getElementById('friend-search-input');
    searchInput.addEventListener('input', handleFriendSearch);

    // Display initial suggested friends (excluding current user)
    displayFriends(suggestedFriends);
}

function displayFriends(friendsArray) {
    const searchResultsContainer = document.getElementById('search-results-container');
    if (!searchResultsContainer) return; // Ensure element exists

    let friendsHtml = '';
    if (friendsArray.length === 0) {
        friendsHtml = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No users found.</p>';
    } else {
        friendsArray.forEach(friend => {
            let buttonHtml = '';
            // Check if the current friend item is the current logged-in user
            if (friend.userId === currentUser.userId) {
                // Button to navigate to your own profile
                buttonHtml = `<button class="profile-nav-button your-profile-button" onclick="navigate('profile')">Your Profile</button>`;
            } else {
                // Button to navigate to another user's profile
                buttonHtml = `<button class="profile-nav-button view-profile-button" data-user-id="${friend.userId}" onclick="navigate('profile', { userId: '${friend.userId}' })">View Profile</button>`;
            }

            // Determine if the username should have a verified tick
            const isVerified = friend.username === "KaiGeneral"; // Check if the username is "KaiGeneral"
            const verifiedIconHtml = isVerified ? '<i class="fas fa-check-circle verified-icon"></i>' : ''; // Add icon if verified

            friendsHtml += `
                <div class="friend-item">
                    <div class="friend-info">
                        <img src="${friend.avatar}" alt="${friend.username} Avatar" class="friend-avatar">
                        <div>
                            <span class="friend-name">${friend.username}${verifiedIconHtml}</span>
                            <span class="friend-id">${friend.userId}</span>
                        </div>
                    </div>
                    ${buttonHtml}
                </div>
            `;
        });
    }
    searchResultsContainer.innerHTML = friendsHtml;
}

function handleFriendSearch() {
    const searchInput = document.getElementById('friend-search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm === '') {
        displayFriends(suggestedFriends); // Show suggestions if search is empty (excludes current user)
        return;
    }

    // Create a combined list for searching that includes allUsers and the currentUser
    const combinedUsersForSearch = [
        ...allUsers,
        {
            username: currentUser.username,
            userId: currentUser.userId,
            avatar: currentUser.profilePic,
            fullName: currentUser.fullName // Include fullName for consistency
        }
    ];

    // Filter out any potential duplicates if currentUser was somehow already in allUsers
    // This creates a unique list based on userId
    const uniqueCombinedUsers = Array.from(new Map(combinedUsersForSearch.map(user => [user.userId, user])).values());

    const filteredUsers = uniqueCombinedUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.userId.toLowerCase().includes(searchTerm)
    );

    displayFriends(filteredUsers);
}

// NEW: Friend Request Page Functions
function updateFriendRequestNotification() {
    const count = currentUser.pendingRequests.length;
    if (friendRequestCountBadge) { // Check if the badge element exists
        if (count > 0) {
            friendRequestCountBadge.textContent = count;
            friendRequestCountBadge.classList.remove('hidden');
        } else {
            friendRequestCountBadge.classList.add('hidden');
        }
    }
}

function loadFriendRequestsPage() {
    appContent.innerHTML = `
        <div class="friend-requests-section">
            <h2>Friend Requests</h2>
            <div class="incoming-requests-container">
                <h3>Incoming Requests</h3>
                <div id="incoming-requests-list" class="friends-list-container">
                    <!-- Incoming requests will be loaded here -->
                </div>
            </div>
            <div class="sent-requests-list-container">
                <h3>Sent Requests</h3>
                <div id="sent-requests-list" class="friends-list-container">
                    <!-- Sent requests will be loaded here -->
                </div>
            </div>
        </div>
    `;
    displayIncomingRequests();
    displaySentRequests();
}

function displayIncomingRequests() {
    const incomingRequestsList = document.getElementById('incoming-requests-list');
    if (!incomingRequestsList) return;

    let requestsHtml = '';
    if (currentUser.pendingRequests.length === 0) {
        requestsHtml = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No incoming friend requests.</p>';
    } else {
        currentUser.pendingRequests.forEach(senderId => {
            // Find the sender's full profile data from allUsers or currentUser if it's KaiGeneral
            const sender = allUsers.find(u => u.userId === senderId) || (senderId === currentUser.userId ? currentUser : null);
            if (sender) {
                const isVerified = sender.username === "KaiGeneral";
                const verifiedIconHtml = isVerified ? '<i class="fas fa-check-circle verified-icon"></i>' : '';
                requestsHtml += `
                    <div class="friend-item">
                        <div class="friend-info">
                            <img src="${sender.avatar || sender.profilePic}" alt="${sender.username} Avatar" class="friend-avatar">
                            <div>
                                <span class="friend-name">${sender.username}${verifiedIconHtml}</span>
                                <span class="friend-id">${sender.userId}</span>
                            </div>
                        </div>
                        <div class="request-actions">
                            <button class="accept-request-button" data-sender-id="${sender.userId}">Accept</button>
                            <button class="decline-request-button" data-sender-id="${sender.userId}">Decline</button>
                        </div>
                    </div>
                `;
            }
        });
    }
    incomingRequestsList.innerHTML = requestsHtml;
}

function displaySentRequests() {
    const sentRequestsList = document.getElementById('sent-requests-list');
    if (!sentRequestsList) return;

    let requestsHtml = '';
    if (currentUser.sentRequests.length === 0) {
        requestsHtml = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No sent friend requests.</p>';
    } else {
        currentUser.sentRequests.forEach(receiverId => {
            // Find the receiver's full profile data
            const receiver = allUsers.find(u => u.userId === receiverId) || (receiverId === currentUser.userId ? currentUser : null);
            if (receiver) {
                const isVerified = receiver.username === "KaiGeneral";
                const verifiedIconHtml = isVerified ? '<i class="fas fa-check-circle verified-icon"></i>' : '';
                requestsHtml += `
                    <div class="friend-item">
                        <div class="friend-info">
                            <img src="${receiver.avatar || receiver.profilePic}" alt="${receiver.username} Avatar" class="friend-avatar">
                            <div>
                                <span class="friend-name">${receiver.username}${verifiedIconHtml}</span>
                                <span class="friend-id">${receiver.userId}</span>
                            </div>
                        </div>
                        <div class="request-actions">
                            <span class="request-status">Pending...</span>
                            <button class="cancel-request-button" data-receiver-id="${receiver.userId}">Cancel</button>
                        </div>
                    </div>
                `;
            }
        });
    }
    sentRequestsList.innerHTML = requestsHtml;
}


function loadProfilePage(targetUserId = currentUser.userId) { // Default to current user's ID
    let userToDisplay;
    let isMyProfile = (targetUserId === currentUser.userId);

    if (isMyProfile) {
        userToDisplay = currentUser;
    } else {
        // Find the user in allUsers or currentUser if it's the current user being searched
        const combinedUsersForSearch = [
            ...allUsers,
            {
                username: currentUser.username,
                userId: currentUser.userId,
                avatar: currentUser.profilePic,
                fullName: currentUser.fullName // Include fullName for consistency
            }
        ];
        const uniqueCombinedUsers = Array.from(new Map(combinedUsersForSearch.map(user => [user.userId, user])).values());
        userToDisplay = uniqueCombinedUsers.find(user => user.userId === targetUserId);

        if (!userToDisplay) {
            appContent.innerHTML = `<div class="error-message">User not found.</div>`;
            return;
        }
    }

    // Determine if the displayed user's username should have a verified tick
    const isVerified = userToDisplay.username === "KaiGeneral"; // Check if the username is "KaiGeneral"
    const verifiedIconHtml = isVerified ? '<i class="fas fa-check-circle verified-icon"></i>' : ''; // Add icon if verified

    let profileActionsHtml = '';
    if (isMyProfile) {
        profileActionsHtml = `
            <button class="edit-profile-btn" onclick="editProfile()">Edit Profile</button>
            <button class="save-profile-btn hidden" onclick="saveProfile()">Save Changes</button>
            <button class="cancel-profile-btn hidden" onclick="cancelEditProfile()">Cancel</button>
        `;
    } else {
        // NEW: Determine relationship status for the friend button
        const currentUserRel = allUsersRelationships[currentUser.userId];
        const targetUserRel = allUsersRelationships[targetUserId];

        let friendButtonText = 'Add Friend';
        let friendButtonClass = 'add-friend-button';
        let friendButtonDisabled = false;
        let friendButtonOnClick = `sendFriendRequest(this)`; // Default action

        if (currentUserRel && targetUserRel) {
            if (currentUserRel.friends.includes(targetUserId)) {
                friendButtonText = 'Friends';
                friendButtonClass = 'friends-status-button'; // New class for styling
                friendButtonDisabled = true;
                friendButtonOnClick = ''; // No action
            } else if (currentUserRel.sentRequests.includes(targetUserId)) {
                friendButtonText = 'Request Sent';
                friendButtonClass = 'request-sent-button'; // New class for styling
                friendButtonDisabled = true;
                friendButtonOnClick = ''; // No action
            } else if (currentUserRel.pendingRequests.includes(targetUserId)) {
                friendButtonText = 'Accept Request';
                friendButtonClass = 'accept-request-button'; // Use existing accept class
                friendButtonDisabled = false; // Can be clicked to accept
                friendButtonOnClick = `acceptFriendRequest('${userToDisplay.userId}')`;
            }
        }

        profileActionsHtml = `
            <button class="${friendButtonClass}" data-user-id="${userToDisplay.userId}" ${friendButtonDisabled ? 'disabled' : ''} onclick="${friendButtonOnClick}">${friendButtonText}</button>
            <button class="chat-user-button" data-user-id="${userToDisplay.userId}" data-username="${userToDisplay.username}">Chat</button>
        `;
    }

    appContent.innerHTML = `
        <div class="user-profile-section">
            <h2>${isMyProfile ? 'My Profile' : userToDisplay.username + "'s Profile"}</h2>
            <div class="profile-picture-container">
                <img src="${userToDisplay.profilePic || userToDisplay.avatar}" alt="Profile Picture" id="profile-pic-display">
                ${isMyProfile ? `
                <label for="profile-pic-upload">
                    <i class="fas fa-camera"></i>
                </label>
                <input type="file" id="profile-pic-upload" accept="image/*" class="hidden">
                ` : ''}
            </div>
            <div class="profile-info">
                <p><strong>Full Name:</strong> <span id="profile-fullname">${userToDisplay.fullName || 'N/A'}</span></p>
                <p><strong>Username:</strong> <span id="profile-username">${userToDisplay.username}</span>${verifiedIconHtml}</p>
                <p><strong>User ID:</strong> <span id="profile-userId">${userToDisplay.userId}</span></p>
                ${isMyProfile ? `
                <p><strong>Email:</strong> <span id="profile-email">${userToDisplay.email}</span></p>
                <p><strong>Date of Birth:</strong> <span id="profile-dob">${userToDisplay.dob}</span></p>
                <p><strong>Country:</strong> <span id="profile-country">${userToDisplay.country}</span></p>
                ` : ''}
            </div>
            <div class="profile-actions">
                ${profileActionsHtml}
            </div>
        </div>
    `;

    if (isMyProfile) {
        // Add event listener for profile picture upload only if it's my profile
        document.getElementById('profile-pic-upload').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('profile-pic-display').src = e.target.result;
                    navProfilePic.src = e.target.result; // Update navbar pic too
                    currentUser.profilePic = e.target.result; // Update user data
                    // No need to call saveUserData here, it will be called when saveProfile() is clicked
                };
                reader.readAsDataURL(file);
            }
        });
    } else {
        // Add event listener for chat button if it's another user's profile
        const chatButton = document.querySelector('.chat-user-button');
        if (chatButton) {
            chatButton.addEventListener('click', () => {
                startChatWithUser(chatButton.dataset.userId, chatButton.dataset.username);
            });
        }
    }
}

// --- Post Interaction Functions ---
function toggleComments(button) {
    const postComments = button.closest('.post').querySelector('.post-comments');
    postComments.classList.toggle('hidden');
}

function likePost(button) {
    const likeCountSpan = button.querySelector('.like-count');
    let currentLikes = parseInt(likeCountSpan.textContent);

    if (button.classList.contains('liked')) {
        // Unlike
        button.classList.remove('liked');
        likeCountSpan.textContent = currentLikes - 1;
    } else {
        // Like
        button.classList.add('liked');
        likeCountSpan.textContent = currentLikes + 1;
    }
}

function sendComment(button) {
    const commentInput = button.closest('.comment-input-area').querySelector('.comment-input');
    const commentsList = button.closest('.post-comments').querySelector('.comments-list');
    const commentText = commentInput.value.trim();

    if (commentText) {
        // Determine if the current user is verified for the comment
        const isCurrentUserVerified = currentUser.username === "KaiGeneral";
        const verifiedIconHtml = isCurrentUserVerified ? '<i class="fas fa-check-circle verified-icon"></i>' : '';

        const newCommentHtml = `
            <div class="comment-wrapper">
                <div class="comment-item">
                    <img src="${currentUser.profilePic}" alt="User Avatar" class="comment-avatar">
                    <div class="comment-content-wrapper">
                        <span class="comment-username">${currentUser.username}${verifiedIconHtml}</span>
                        <p class="comment-text">${commentText}</p>
                        <div class="comment-actions">
                            <button class="comment-action-button comment-like-button">
                                <i class="fas fa-heart"></i> Like (<span class="comment-like-count">0</span>)
                            </button>
                            <button class="comment-action-button comment-reply-button">
                                <i class="fas fa-reply"></i> Reply
                            </button>
                        </div>
                    </div>
                </div>
                <div class="reply-input-area hidden">
                    <input type="text" placeholder="Reply to ${currentUser.username}..." class="reply-input">
                    <button class="send-reply-button" data-original-username="${currentUser.username}">Send</button>
                </div>
            </div>
        `;
        commentsList.insertAdjacentHTML('beforeend', newCommentHtml);
        commentInput.value = ''; // Clear input
        commentsList.scrollTop = commentsList.scrollHeight; // Scroll to bottom
    }
}

// NEW: Comment Interaction Functions
function likeComment(button) {
    const likeCountSpan = button.querySelector('.comment-like-count');
    let currentLikes = parseInt(likeCountSpan.textContent);

    if (button.classList.contains('liked')) {
        button.classList.remove('liked');
        likeCountSpan.textContent = currentLikes - 1;
    } else {
        button.classList.add('liked');
        likeCountSpan.textContent = currentLikes + 1;
    }
}

function toggleReplyInput(button) {
    // Find the closest .comment-wrapper to the clicked reply button
    const commentWrapper = button.closest('.comment-wrapper');
    if (!commentWrapper) return;

    // Find the reply input area within that wrapper
    const replyInputArea = commentWrapper.querySelector('.reply-input-area');
    if (replyInputArea) {
        // Hide all other reply input areas first
        document.querySelectorAll('.reply-input-area').forEach(area => {
            if (area !== replyInputArea) {
                area.classList.add('hidden');
            }
        });

        replyInputArea.classList.toggle('hidden');
        if (!replyInputArea.classList.contains('hidden')) {
            replyInputArea.querySelector('.reply-input').focus();
        }
    }
}

function sendReply(button) {
    const originalUsername = button.dataset.originalUsername;
    const replyInputArea = button.closest('.reply-input-area');
    const replyInput = replyInputArea.querySelector('.reply-input');
    const replyText = replyInput.value.trim();

    if (replyText) {
        // Determine if the current user is verified for the reply
        const isCurrentUserVerified = currentUser.username === "KaiGeneral";
        const verifiedIconHtml = isCurrentUserVerified ? '<i class="fas fa-check-circle verified-icon"></i>' : '';

        const commentsList = button.closest('.post-comments').querySelector('.comments-list');
        const newCommentHtml = `
            <div class="comment-wrapper">
                <div class="comment-item">
                    <img src="${currentUser.profilePic}" alt="User Avatar" class="comment-avatar">
                    <div class="comment-content-wrapper">
                        <span class="comment-username">${currentUser.username}${verifiedIconHtml}</span>
                        <p class="comment-text"><strong>@${originalUsername}</strong> ${replyText}</p>
                        <div class="comment-actions">
                            <button class="comment-action-button comment-like-button">
                                <i class="fas fa-heart"></i> Like (<span class="comment-like-count">0</span>)
                            </button>
                            <button class="comment-action-button comment-reply-button">
                                <i class="fas fa-reply"></i> Reply
                            </button>
                        </div>
                    </div>
                </div>
                <div class="reply-input-area hidden">
                    <input type="text" placeholder="Reply to ${currentUser.username}..." class="reply-input">
                    <button class="send-reply-button" data-original-username="${currentUser.username}">Send</button>
                </div>
            </div>
        `;
        commentsList.insertAdjacentHTML('beforeend', newCommentHtml);
        replyInput.value = ''; // Clear input
        replyInputArea.classList.add('hidden'); // Hide the reply input area
        commentsList.scrollTop = commentsList.scrollHeight; // Scroll to bottom
    }
}
// --- Profile Editing Functions ---
let originalProfileData = {}; // To store data before editing

function editProfile() {
    const profileInfo = document.querySelector('.user-profile-section .profile-info');
    const spans = profileInfo.querySelectorAll('span:not(#profile-userId)');
    const editBtn = document.querySelector('.edit-profile-btn');
    const saveBtn = document.querySelector('.save-profile-btn');
    const cancelBtn = document.querySelector('.cancel-profile-btn');

    originalProfileData = { ...currentUser }; // Save current state

    spans.forEach(span => {
        const id = span.id.replace('profile-', '');
        const value = span.textContent;
        let inputType = 'text';
        if (id === 'email') inputType = 'email';
        if (id === 'dob') inputType = 'date';

        const input = document.createElement('input');
        input.type = inputType;
        input.value = value;
        input.id = `edit-${id}`;
        span.replaceWith(input);
    });

    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
}

function saveProfile() {
    const profileInfo = document.querySelector('.user-profile-section .profile-info');
    const inputs = profileInfo.querySelectorAll('input[id^="edit-"]');
    const editBtn = document.querySelector('.edit-profile-btn');
    const saveBtn = document.querySelector('.save-profile-btn');
    const cancelBtn = document.querySelector('.cancel-profile-btn');

    inputs.forEach(input => {
        const id = input.id.replace('edit-', '');
        const newValue = input.value;
        currentUser[id] = newValue;

        const span = document.createElement('span');
        span.id = `profile-${id}`;
        span.textContent = newValue;
        input.replaceWith(span);
    });

    navProfilePic.src = currentUser.profilePic;

    saveUserData();

    alert('Profile updated successfully!');
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
}

function cancelEditProfile() {
    const profileInfo = document.querySelector('.user-profile-section .profile-info');
    const inputs = profileInfo.querySelectorAll('input[id^="edit-"]');
    const editBtn = document.querySelector('.edit-profile-btn');
    const saveBtn = document.querySelector('.save-profile-btn');
    const cancelBtn = document.querySelector('.cancel-profile-btn');

    inputs.forEach(input => {
        const id = input.id.replace('edit-', '');
        const span = document.createElement('span');
        span.id = `profile-${id}`;
        span.textContent = originalProfileData[id];
        input.replaceWith(span);
    });

    currentUser = { ...originalProfileData };
    navProfilePic.src = currentUser.profilePic;

    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
}

// --- Helper: Ensure relationship object exists ---
function ensureRelationship(userId) {
    if (!allUsersRelationships[userId]) {
        allUsersRelationships[userId] = {
            friends: [],
            sentRequests: [],
            pendingRequests: []
        };
    }
    return allUsersRelationships[userId];
}

// --- Friend Request Functions ---
function ensureRelationship(userId) {
    if (!allUsersRelationships) {
        allUsersRelationships = {};  // make sure global exists
    }
    if (!allUsersRelationships[userId]) {
        allUsersRelationships[userId] = {
            friends: [],
            sentRequests: [],
            pendingRequests: []
        };
    }
    return allUsersRelationships[userId];
}

function sendFriendRequest(button) {
    const targetUserId = button.dataset.userId;

    if (targetUserId === currentUser.userId) {
        alert("You cannot send a friend request to yourself.");
        return;
    }

    const currentUserRel = ensureRelationship(currentUser.userId);
    const targetUserRel = ensureRelationship(targetUserId);

    if (currentUserRel.friends.includes(targetUserId)) {
        alert("You are already friends with this user.");
        return;
    }

    if (currentUserRel.sentRequests.includes(targetUserId)) {
        alert("You have already sent a friend request to this user.");
        return;
    }

    if (currentUserRel.pendingRequests.includes(targetUserId)) {
        if (confirm(`This user has already sent you a friend request. Do you want to accept it now?`)) {
            acceptFriendRequest(targetUserId);
        }
        return;
    }

    currentUserRel.sentRequests.push(targetUserId);
    targetUserRel.pendingRequests.push(currentUser.userId);
    currentUser.sentRequests = currentUserRel.sentRequests;

    saveUserData();

    alert(`Friend request sent to ${targetUserId}!`);
    button.textContent = 'Request Sent';
    button.disabled = true;
    button.style.background = 'linear-gradient(45deg, #6c757d, #5a6268)';
    button.style.boxShadow = 'none';
}

function acceptFriendRequest(senderId) {
    const currentUserRel = ensureRelationship(currentUser.userId);
    const senderUserRel = ensureRelationship(senderId);

    currentUserRel.pendingRequests = currentUserRel.pendingRequests.filter(id => id !== senderId);
    currentUserRel.friends.push(senderId);

    senderUserRel.sentRequests = senderUserRel.sentRequests.filter(id => id !== currentUser.userId);
    senderUserRel.friends.push(currentUser.userId);

    currentUser.pendingRequests = currentUserRel.pendingRequests;
    currentUser.friends = currentUserRel.friends;

    saveUserData();

    alert(`You are now friends with ${senderId}!`);
    loadFriendRequestsPage();
    updateFriendRequestNotification();
}

function declineFriendRequest(senderId) {
    const currentUserRel = ensureRelationship(currentUser.userId);
    const senderUserRel = ensureRelationship(senderId);

    currentUserRel.pendingRequests = currentUserRel.pendingRequests.filter(id => id !== senderId);
    senderUserRel.sentRequests = senderUserRel.sentRequests.filter(id => id !== currentUser.userId);

    currentUser.pendingRequests = currentUserRel.pendingRequests;

    saveUserData();

    alert(`Friend request from ${senderId} declined.`);
    loadFriendRequestsPage();
    updateFriendRequestNotification();
}

function cancelFriendRequest(receiverId) {
    const currentUserRel = ensureRelationship(currentUser.userId);
    const receiverUserRel = ensureRelationship(receiverId);

    currentUserRel.sentRequests = currentUserRel.sentRequests.filter(id => id !== receiverId);
    receiverUserRel.pendingRequests = receiverUserRel.pendingRequests.filter(id => id !== currentUser.userId);

    currentUser.sentRequests = currentUserRel.sentRequests;

    saveUserData();

    alert(`Friend request to ${receiverId} cancelled.`);
    loadFriendRequestsPage();
}


// --- Chat Bot Functions (Modified for multi-user chat simulation) ---

// NEW: Function to update the chat header with the current partner's name
function updateChatHeader() {
    if (chatPartnerNameDisplay) {
        chatPartnerNameDisplay.textContent = `Chat with ${currentChatPartner.name}`;
    }
}

// Modified: Now accepts optional targetUserId and targetUsername to switch chat partners
function toggleChatBot(targetUserId = 'bot', targetUsername = 'EverGlow Bot') {
    // If the chat is currently hidden and we are opening it,
    // or if we are explicitly starting a new chat session with a different partner
    if (chatBotContainer.classList.contains('hidden') || currentChatPartner.id !== targetUserId) {
        chatMessages.innerHTML = ''; // Clear messages when opening or switching chat partner
        currentChatPartner = { id: targetUserId, name: targetUsername };

        const initialMessageDiv = document.createElement('div');
        initialMessageDiv.classList.add('message', 'bot-message');
        if (targetUserId === 'bot') {
            initialMessageDiv.textContent = "Hello! I'm EverGlow Bot. How can I assist you today?";
        } else {
            initialMessageDiv.textContent = `You are now chatting with ${targetUsername}. Say hello!`;
        }
        chatMessages.appendChild(initialMessageDiv);
    }

    chatBotContainer.classList.toggle('hidden');
    if (!chatBotContainer.classList.contains('hidden')) {
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom when opened
        chatInput.focus();
        updateChatHeader(); // Update the chat header
    }
}

// NEW: Function to close the chat bot and reset to bot mode
function closeChat() {
    chatBotContainer.classList.add('hidden');
    // Reset to bot chat when closing
    currentChatPartner = { id: 'bot', name: 'EverGlow Bot' };
    chatMessages.innerHTML = ''; // Clear messages
    updateChatHeader(); // Update header back to bot
}

// Renamed from sendBotMessage to sendMessage, and modified logic
function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === '') return;

    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.textContent = messageText;
    chatMessages.appendChild(userMessageDiv);

    chatInput.value = ''; // Clear input

    // Check if we are chatting with the bot or a real user
    if (currentChatPartner.id === 'bot') {
        // Simulate bot response (existing logic)
        setTimeout(() => {
            const botResponseDiv = document.createElement('div');
            botResponseDiv.classList.add('message', 'bot-message');
            let botResponse = "I'm just a simple bot. How can I assist you further?";

            if (messageText.toLowerCase().includes('hello') || messageText.toLowerCase().includes('hi')) {
                botResponse = "Hello there! How can I help you today?";
            } else if (messageText.toLowerCase().includes('how are you')) {
                botResponse = "I'm a bot, so I don't have feelings, but I'm ready to help!";
            } else if (messageText.toLowerCase().includes('features')) {
                botResponse = "I can help you navigate the app, find friends, or just chat!";
            } else if (messageText.toLowerCase().includes('name')) {
                botResponse = "I am EverGlow Bot, your friendly assistant.";
            }

            botResponseDiv.textContent = botResponse;
            chatMessages.appendChild(botResponseDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
        }, 500);
    } else {
        // If chatting with a real user, no immediate bot response.
        // Just scroll to the bottom to show the sent message.
        chatMessages.scrollTop = chatMessages.scrollHeight;
        // In a real application, this message would be sent to a backend
        // to be delivered to the actual user.
        console.log(`Message sent to ${currentChatPartner.name} (${currentChatPartner.id}): "${messageText}"`);
    }
}