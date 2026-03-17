const startBtn = document.getElementById("startBtn");
const music = document.getElementById("bgMusic");

/* Slot elements */
const spinBtn = document.getElementById("spinBtn");
const lever = document.getElementById("lever");
const reelsEl = document.getElementById("reels");
const slotMachine = document.getElementById("slotMachine");
const winText = document.getElementById("winText");
const sparkLayer = document.getElementById("sparkLayer");
const floatLayer = document.getElementById("floatLayer");

/* FULL PAGE overlay elements */
const goldPopLayer = document.getElementById("goldPopLayer");
const flashLayer = document.getElementById("flashLayer");
const pageFade = document.getElementById("pageFade");
const page1 = document.getElementById("page1");

// Quiz elements
const quizOverlay = document.getElementById("quizOverlay");
const quizStartBtn = document.getElementById("quizStartBtn");
const quizCloseBtn = document.getElementById("quizCloseBtn");
const quizStartScreen = document.getElementById("quizStartScreen");
const quizQuestionsScreen = document.getElementById("quizQuestionsScreen");
const quizResultScreen = document.getElementById("quizResultScreen");
const quizBeginBtn = document.getElementById("quizBeginBtn");
const questionContainer = document.getElementById("questionContainer");
const currentQSpan = document.getElementById("currentQ");
const quizNameInput = document.getElementById("quizName");
const resultHeading = document.getElementById("resultHeading");
const resultImage = document.getElementById("resultImage");
const resultDescription = document.getElementById("resultDescription");
const resultAudio = document.getElementById("resultAudio");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const backToInviteBtn = document.getElementById("backToInviteBtn");

/* Symbols (dice, cards, neon hearts + XO) */
const XO_SYMBOL = "XO";
const SYMBOLS = ["🎲", "♥", "♦", "♠", "♣", "★", XO_SYMBOL];

let musicStarted = false;
let spinning = false;
let won = false;

/* Spin limit logic:
   If they DON'T win in 5 spins, then next spin forces XO XO XO
*/
let spinCount = 0;
const MAX_FAIL_SPINS = 5;

// Quiz state
let currentQuestion = 0;
let userName = "";
let answers = [];
let quizActive = false;
let musicPausedForQuiz = false;
let musicCurrentTime = 0;

// Song data for After Hours
const songs = {
    "afterhours-quiz": {
        name: "After Hours",
        image: "afterhours-quiz.jpg",
        audio: "afterhours-quiz.mp3",
        description: "You're the devoted romantic. Passionate, intense, and willing to risk everything for love. You live for the late-night moments.",
        lyric: "I'll risk it all for you"
    },
    "blinding-lights": {
        name: "Blinding Lights",
        image: "blinding-lights.jpg",
        audio: "blinding-lights.mp3",
        description: "You're the main character. Smooth, confident, and a little dangerous. You own every room you enter and leave everyone wanting more.",
        lyric: "I can't see clearly when you're gone"
    },
    "faith": {
        name: "Faith",
        image: "faith.jpg",
        audio: "faith.mp3",
        description: "You're the soulful seeker. Deep, introspective, and in touch with your emotions. You feel everything from the highest highs to the lowest lows.",
        lyric: "I feel everything from my body to my soul"
    },
    "heartless": {
        name: "Heartless",
        image: "heartless.jpg",
        audio: "heartless.mp3",
        description: "You're the mysterious loner. Cold on the outside but complex underneath. You've been hurt before, and now you guard your heart carefully.",
        lyric: "I lost my heart and my mind"
    },
    "save-your-tears": {
        name: "Save Your Tears",
        image: "save-your-tears.jpg",
        audio: "save-your-tears.mp3",
        description: "You're the regretful romantic. You know you've made mistakes and you carry that weight. But you're learning to be better.",
        lyric: "I broke your heart like someone did to mine"
    }
};

// Quiz questions
const questions = [
    {
        question: "If you had to pick one guilty-pleasure snack at midnight, what is it?",
        choices: [
            { text: "Chips + something spicy", song: "afterhours-quiz" },
            { text: "Ice cream straight from the tub", song: "blinding-lights" },
            { text: "Chocolate/Sweets", song: "faith" },
            { text: "A sweet pastry / dessert", song: "heartless" },
            { text: "None of the above...I'm trying to be healthy", song: "save-your-tears" }
        ]
    },
    {
        question: "Which language would you love to learn just for fun?",
        choices: [
            { text: "French", song: "afterhours-quiz" },
            { text: "Spanish", song: "blinding-lights" },
            { text: "Italian", song: "faith" },
            { text: "Japanese", song: "heartless" },
            { text: "German", song: "save-your-tears" }
        ]
    },
    {
        question: "Favorite genre of music",
        choices: [
            { text: "Pop", song: "afterhours-quiz" },
            { text: "R&B", song: "blinding-lights" },
            { text: "80's and 90's", song: "faith" },
            { text: "Rap", song: "heartless" },
            { text: "Amapiano", song: "save-your-tears" }
        ]
    },
    {
        question: "Which one of these places would you like to go to for vacation?",
        choices: [
            { text: "Tokyo", song: "afterhours-quiz" },
            { text: "New York", song: "blinding-lights" },
            { text: "Rio", song: "faith" },
            { text: "Paris", song: "heartless" },
            { text: "Italy", song: "save-your-tears" }
        ]
    },
    {
        question: "Pick a colour",
        choices: [
            { text: "Black", song: "afterhours-quiz" },
            { text: "White", song: "blinding-lights" },
            { text: "Red", song: "faith" },
            { text: "Blue", song: "heartless" },
            { text: "Yellow", song: "save-your-tears" }
        ]
    },
    {
        question: "Pick a After Hours lyric",
        choices: [
            { text: "After Hours – \"I'll risk it all for you\"", song: "afterhours-quiz" },
            { text: "Blinding Lights – \"I can't see clearly when you're gone\"", song: "blinding-lights" },
            { text: "Faith – \"I feel everything from my body to my soul\"", song: "faith" },
            { text: "Heartless – \"I lost my heart and my mind\"", song: "heartless" },
            { text: "Save Your Tears – \"I broke your heart like someone did to mine\"", song: "save-your-tears" }
        ]
    }
];

// Prevent touch scrolling while locked (mobile)
function preventScroll(e){
    if(document.body.classList.contains("locked")){
        e.preventDefault();
    }
}
window.addEventListener("touchmove", preventScroll, { passive: false });

/* ---------------- PAGE NAV ---------------- */
function showOnlyPage(pageNumber){
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const el = document.getElementById("page" + pageNumber);
    if(el) el.classList.add("active");
}

startBtn?.addEventListener("click", () => {
    showOnlyPage(1);
    startMusic();
    setReels([randSym(), randSym(), randSym()]);
});

/* ---------------- MUSIC ---------------- */
function startMusic(){
    if(musicStarted || !music) return;

    music.volume = 0;
    music.play().catch(() => {});
    musicStarted = true;

    const fade = setInterval(() => {
        if(music.volume < 0.65){
            music.volume = Math.min(0.65, music.volume + 0.05);
        } else {
            clearInterval(fade);
        }
    }, 160);
}

function pauseMusicForQuiz() {
    if (music && !music.paused) {
        musicCurrentTime = music.currentTime;
        music.pause();
        musicPausedForQuiz = true;
    }
}

function resumeMusicFromQuiz() {
    if (music && musicPausedForQuiz) {
        music.currentTime = musicCurrentTime;
        music.play().catch(() => {});
        musicPausedForQuiz = false;
    }
}

/* ---------------- SLOT GAME ---------------- */
function getReelNodes(){
    if(!reelsEl) return [];
    return Array.from(reelsEl.querySelectorAll(".reel"));
}

function applySymbolStyle(symbolSpan, value){
    if(!symbolSpan) return;
    symbolSpan.textContent = value;

    if(value === XO_SYMBOL){
        symbolSpan.classList.add("xo");
    } else {
        symbolSpan.classList.remove("xo");
    }
}

function setReels(values){
    const reels = getReelNodes();
    reels.forEach((r, i) => {
        const s = r.querySelector(".symbol");
        applySymbolStyle(s, values[i] ?? randSym());
    });
}

function randSym(){
    return SYMBOLS[rand(0, SYMBOLS.length - 1)];
}

function pullLever(){
    if(spinning || won) return;
    spin();
}

function spin(){
    if(spinning || won) return;

    spinning = true;
    spinCount++;

    if(winText) winText.textContent = "";
    slotMachine?.classList.remove("won");

    // Lever anim
    lever?.classList.add("pulling");
    setTimeout(() => lever?.classList.remove("pulling"), 480);

    const reels = getReelNodes();
    const timers = [];

    // Start spinning visuals + rapid changes
    reels.forEach((reelNode) => {
        reelNode.classList.add("spinning");

        const t = setInterval(() => {
            const s = reelNode.querySelector(".symbol");
            applySymbolStyle(s, randSym());
        }, 70);

        timers.push(t);
    });

    // Decide final:
    // On the 6th attempt (spinCount > 5) it will force XO XO XO
    let final;
    const forceWin = (spinCount > MAX_FAIL_SPINS);

    if(forceWin){
        final = [XO_SYMBOL, XO_SYMBOL, XO_SYMBOL];
    } else {
        final = [randSym(), randSym(), randSym()];
    }

    const stopReel = (i, delay) => {
        setTimeout(() => {
            clearInterval(timers[i]);
            const reelNode = reels[i];
            reelNode.classList.remove("spinning");
            const s = reelNode.querySelector(".symbol");
            applySymbolStyle(s, final[i]);
        }, delay);
    };

    stopReel(0, 720);
    stopReel(1, 980);
    stopReel(2, 1240);

    setTimeout(() => {
        spinning = false;
        const isWin = final[0] === final[1] && final[1] === final[2];

        if(isWin){
            won = true;
            onWin(final[0]);
        } else {
            const left = Math.max(0, MAX_FAIL_SPINS - spinCount + 1);
            if(winText){
                winText.textContent = left > 0
                    ? `Not quite… pull again. (${left} more until luck hits)`
                    : "Not quite… pull again.";
            }
        }
    }, 1400);
}

function onWin(symbol){
    slotMachine?.classList.add("won");
    if(winText) winText.textContent = "JACKPOT. You're blinded by the lights…";

    // Icons fly out and float around
    flyOutIcons(symbol);

    // Build-up gold pops (sparse -> dense) + camera flash flickers + subtle bloom
    setTimeout(() => {
        blindedByLightsSequence();
    }, 520);

    // Fade to invite right after the peak
    setTimeout(() => {
        fadeIntoInvite();
    }, 2350);
}

/* Icons float from reels center */
function flyOutIcons(symbol){
    if(!floatLayer || !reelsEl) return;

    const reelsRect = reelsEl.getBoundingClientRect();
    const stageRect = floatLayer.getBoundingClientRect();

    const cx = (reelsRect.left + reelsRect.right) / 2 - stageRect.left;
    const cy = (reelsRect.top + reelsRect.bottom) / 2 - stageRect.top;

    const count = 10;
    for(let i = 0; i < count; i++){
        const el = document.createElement("div");
        el.className = "float-icon";
        el.textContent = symbol;

        if(symbol === XO_SYMBOL){
            el.classList.add("xo");
        }

        el.style.left = cx + "px";
        el.style.top = cy + "px";

        const tx = rand(-240, 240);
        const ty = rand(-170, 160);
        el.style.setProperty("--tx", tx + "px");
        el.style.setProperty("--ty", ty + "px");

        floatLayer.appendChild(el);
        setTimeout(() => el.remove(), 1400);
    }
}

/* "BLINDED BY THE LIGHTS" SEQUENCE */
function blindedByLightsSequence(){
    if(page1) page1.classList.add("blooming");
    if(goldPopLayer) goldPopLayer.classList.add("on");

    // 3 waves: sparse -> medium -> dense
    popWave(35, 0, 520);     // sparse
    popWave(70, 420, 600);   // medium
    popWave(140, 900, 650);  // dense peak

    // Flash flickers layered over the build
    startFlashFlickers(1550);

    // Cleanup bloom shortly after peak (but before fade completes)
    setTimeout(() => {
        if(page1) page1.classList.remove("blooming");
        if(goldPopLayer) goldPopLayer.classList.remove("on");
    }, 1750);
}

/* Make a wave of pops that appear across the entire page */
function popWave(count, startDelay, duration){
    setTimeout(() => {
        fullPageGoldPop(count, duration);
    }, startDelay);
}

/* Create gold pops across entire viewport (covers everything) */
function fullPageGoldPop(bursts = 120, spreadDuration = 600){
    if(!goldPopLayer) return;

    const rect = goldPopLayer.getBoundingClientRect();

    for(let i = 0; i < bursts; i++){
        const dot = document.createElement("div");
        dot.className = "gold-pop";

        // random placement across ENTIRE viewport
        const x = rand(0, Math.floor(rect.width));
        const y = rand(0, Math.floor(rect.height));

        dot.style.left = x + "px";
        dot.style.top = y + "px";

        // Spread over a window so it feels like "popping everywhere"
        const delay = rand(0, spreadDuration);
        dot.style.animationDelay = delay + "ms";

        goldPopLayer.appendChild(dot);
        setTimeout(() => dot.remove(), 1200 + delay);
    }
}

/* Camera flash flickers */
function startFlashFlickers(totalMs = 1200){
    if(!flashLayer) return;

    let start = performance.now();

    const tick = (now) => {
        const t = now - start;

        if(t > totalMs){
            flashLayer.style.opacity = "0";
            return;
        }

        // Probability increases toward the end (more chaos at peak)
        const progress = Math.min(1, t / totalMs);
        const chance = 0.08 + progress * 0.18; // ramp up

        if(Math.random() < chance){
            // short flash pulse
            const strength = 0.12 + Math.random() * (0.55 + progress * 0.25);
            flashLayer.style.opacity = String(strength);

            // drop it quickly
            setTimeout(() => {
                flashLayer.style.opacity = "0";
            }, 40 + Math.random() * 70);
        }

        requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
}

function fadeIntoInvite(){
    if(!pageFade) {
        finishGame();
        return;
    }

    pageFade.classList.remove("on");
    void pageFade.offsetWidth;
    pageFade.classList.add("on");

    setTimeout(() => {
        finishGame();
        pageFade.classList.remove("on");
    }, 680);
}

/* ---------------- FINISH: enable scroll from Show Up to end ---------------- */
function finishGame(){
    document.body.classList.remove("locked");
    document.body.classList.add("scroll-mode");

    const page2 = document.getElementById("page2");
    setTimeout(() => {
        page2?.scrollIntoView({ behavior: "smooth" });
    }, 220);
}

/* ---------------- INPUTS: Lever + Spin button ---------------- */
spinBtn?.addEventListener("click", spin);
lever?.addEventListener("click", pullLever);
lever?.addEventListener("keydown", (e) => {
    if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        pullLever();
    }
});

/* Smooth mobile pull: drag down to trigger */
let dragStartY = null;
let dragging = false;

function pointerDown(e){
    if(spinning || won) return;
    dragging = true;
    dragStartY = (e.touches ? e.touches[0].clientY : e.clientY);
}

function pointerMove(e){
    if(!dragging || dragStartY == null) return;
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    const dy = y - dragStartY;

    if(dy > 40){
        dragging = false;
        dragStartY = null;
        pullLever();
    }
}

function pointerUp(){
    dragging = false;
    dragStartY = null;
}

lever?.addEventListener("touchstart", pointerDown, { passive: true });
lever?.addEventListener("touchmove", pointerMove, { passive: true });
lever?.addEventListener("touchend", pointerUp, { passive: true });

lever?.addEventListener("mousedown", pointerDown);
window.addEventListener("mousemove", pointerMove);
window.addEventListener("mouseup", pointerUp);

/* ---------------- HELPERS ---------------- */
function rand(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ---------------- QUIZ FUNCTIONS ---------------- */
function openQuiz() {
    pauseMusicForQuiz();
    quizOverlay.setAttribute("aria-hidden", "false");
    quizOverlay.classList.add("active");
    quizActive = true;
    
    // Reset quiz state
    currentQuestion = 0;
    answers = [];
    userName = "";
    quizNameInput.value = "";
    
    // Show start screen, hide others
    quizStartScreen.style.display = "block";
    quizQuestionsScreen.style.display = "none";
    quizResultScreen.style.display = "none";
    
    // Stop any playing result audio
    resultAudio.pause();
    resultAudio.currentTime = 0;
}

function closeQuiz() {
    quizOverlay.setAttribute("aria-hidden", "true");
    quizOverlay.classList.remove("active");
    quizActive = false;
    
    // Stop result audio
    resultAudio.pause();
    resultAudio.currentTime = 0;
    
    resumeMusicFromQuiz();
}

function beginQuiz() {
    userName = quizNameInput.value.trim() || "Guest";
    
    if (!userName) {
        alert("Please enter your name!");
        return;
    }
    
    quizStartScreen.style.display = "none";
    quizQuestionsScreen.style.display = "block";
    showQuestion(0);
}

function showQuestion(index) {
    currentQuestion = index;
    currentQSpan.textContent = index + 1;
    
    const q = questions[index];
    
    let html = `
        <div class="question-box">
            <h3 class="question-text">${q.question}</h3>
            <div class="choices-container">
    `;
    
    q.choices.forEach((choice, i) => {
        html += `
            <button class="choice-btn" data-song="${choice.song}" data-index="${i}">
                ${choice.text}
            </button>
        `;
    });
    
    html += `
            </div>
        </div>
        <div class="quiz-nav">
            ${index > 0 ? '<button class="nav-btn prev-btn" id="prevBtn">Previous</button>' : '<div></div>'}
            ${index === questions.length - 1 ? 
                '<button class="nav-btn reveal-btn" id="revealBtn" style="display: none;">Reveal my song</button>' : 
                '<button class="nav-btn next-btn" id="nextBtn" style="display: none;">Next</button>'}
        </div>
    `;
    
    questionContainer.innerHTML = html;
    
    // Add click handlers
    document.querySelectorAll(".choice-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Remove selected from all
            document.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("selected"));
            // Add selected to clicked
            e.target.classList.add("selected");
            
            // Store answer
            answers[index] = e.target.dataset.song;
            
            // Show next/reveal button
            if (index === questions.length - 1) {
                document.getElementById("revealBtn").style.display = "inline-block";
            } else {
                document.getElementById("nextBtn").style.display = "inline-block";
            }
        });
    });
    
    // Next button
    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            showQuestion(index + 1);
        });
    }
    
    // Previous button
    const prevBtn = document.getElementById("prevBtn");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            showQuestion(index - 1);
        });
    }
    
    // Reveal button
    const revealBtn = document.getElementById("revealBtn");
    if (revealBtn) {
        revealBtn.addEventListener("click", () => {
            showResult();
        });
    }
    
    // Restore previous selection if exists
    if (answers[index]) {
        const prevBtn = document.querySelector(`[data-song="${answers[index]}"]`);
        if (prevBtn) {
            prevBtn.classList.add("selected");
            if (index === questions.length - 1) {
                document.getElementById("revealBtn").style.display = "inline-block";
            } else {
                document.getElementById("nextBtn").style.display = "inline-block";
            }
        }
    }
}

function showResult() {
    // Calculate result
    const songCounts = {};
    answers.forEach(song => {
        songCounts[song] = (songCounts[song] || 0) + 1;
    });
    
    // Find song with max count
    let maxCount = 0;
    let resultSong = "";
    
    for (const [song, count] of Object.entries(songCounts)) {
        if (count > maxCount) {
            maxCount = count;
            resultSong = song;
        }
    }
    
    // If tie, pick first in answers
    if (!resultSong) resultSong = answers[0];
    
    const songData = songs[resultSong];
    
    // Update UI
    resultHeading.textContent = `${userName}, you Are ${songData.name}`;
    resultImage.src = songData.image;
    resultImage.alt = songData.name;
    resultDescription.textContent = songData.description;
    
    // Set up audio
    resultAudio.src = songData.audio;
    
    // Switch screens
    quizQuestionsScreen.style.display = "none";
    quizResultScreen.style.display = "block";
    
    // Play audio
    resultAudio.play().catch(() => {});
    
    // Scroll to show result
    setTimeout(() => {
        quizResultScreen.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
}

function tryAgain() {
    // Reset and go back to start
    currentQuestion = 0;
    answers = [];
    resultAudio.pause();
    resultAudio.currentTime = 0;
    
    quizResultScreen.style.display = "none";
    quizStartScreen.style.display = "block";
    quizNameInput.value = userName;
}

/* ---------------- QUIZ EVENT LISTENERS ---------------- */
quizStartBtn?.addEventListener("click", openQuiz);
quizCloseBtn?.addEventListener("click", closeQuiz);
quizBeginBtn?.addEventListener("click", beginQuiz);
tryAgainBtn?.addEventListener("click", tryAgain);
backToInviteBtn?.addEventListener("click", () => {
    closeQuiz();
});

// Close on overlay click
quizOverlay?.addEventListener("click", (e) => {
    if (e.target === quizOverlay) {
        closeQuiz();
    }
});
