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

let musicStarted = false;
let spinning = false;
let won = false;

/* Spin limit logic */
let spinCount = 0;
const MAX_FAIL_SPINS = 5;

/* Symbols */
const XO_SYMBOL = "XO";
const SYMBOLS = ["🎲", "♥", "♦", "♠", "♣", "★", XO_SYMBOL];

// Quiz elements
const openQuizBtn = document.getElementById("openQuizBtn");
const quizBackBtn = document.getElementById("quizBackBtn");
const quizCloseBtn = document.getElementById("quizCloseBtn");
const quizFinishBtn = document.getElementById("quizFinishBtn");
const quizRetryBtn = document.getElementById("quizRetryBtn");

const quizScreen = document.getElementById("pageQuiz");
const quizForm = document.getElementById("quizForm");
const quizResult = document.getElementById("quizResult");
const quizResultInner = document.getElementById("quizResultInner");
const quizOverlay = document.getElementById("quizOverlay");
const resultCover = document.getElementById("resultCover");
const resultBlurb = document.getElementById("resultBlurb");
const guestNameInput = document.getElementById("guestName");
const resultAudio = document.getElementById("resultAudio");

const SONG_KEYS = [
    "afterhours",
    "blinding-lights",
    "faith",
    "heartless",
    "save-your-tears"
];

const SONG_PRETTY = {
    "afterhours": "After Hours",
    "blinding-lights": "Blinding Lights",
    "faith": "Faith",
    "heartless": "Heartless",
    "save-your-tears": "Save Your Tears"
};

const SONG_BLURB = {
    "afterhours": "You're the devoted romantic. Passionate, intense, and willing to risk everything for love. You live for the late-night moments.",
    "blinding-lights": "You're the main character. Smooth, confident, and a little dangerous. You own every room you enter and leave everyone wanting more.",
    "faith": "You're the soulful seeker. Deep, introspective, and in touch with your emotions. You feel everything from the highest highs to the lowest lows.",
    "heartless": "You're the mysterious loner. Cold on the outside but complex underneath. You've been hurt before, and now you guard your heart carefully.",
    "save-your-tears": "You're the regretful romantic. You know you've made mistakes and you carry that weight. But you're learning to be better."
};

let _inviteWasPlaying = false;
let _inviteTime = 0;
let _scrollYBeforeQuiz = 0;

// Prevent touch scrolling while locked
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

function stopResultAudio() {
    if (!resultAudio) return;
    resultAudio.pause();
    resultAudio.currentTime = 0;
    resultAudio.removeAttribute("src");
}

function enterQuizAudioMode() {
    stopResultAudio();

    if (!music) return;
    _inviteWasPlaying = !music.paused;
    _inviteTime = music.currentTime || 0;
    music.pause();
}

function exitQuizAudioMode() {
    stopResultAudio();

    if (!music) return;
    if (_inviteWasPlaying) {
        try { music.currentTime = _inviteTime || 0; } catch (e) {}
        music.play().catch(() => {});
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

    // Decide final
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

    flyOutIcons(symbol);

    setTimeout(() => {
        blindedByLightsSequence();
    }, 520);

    setTimeout(() => {
        fadeIntoInvite();
    }, 2350);
}

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

function blindedByLightsSequence(){
    if(page1) page1.classList.add("blooming");
    if(goldPopLayer) goldPopLayer.classList.add("on");

    popWave(35, 0, 520);
    popWave(70, 420, 600);
    popWave(140, 900, 650);

    startFlashFlickers(1550);

    setTimeout(() => {
        if(page1) page1.classList.remove("blooming");
        if(goldPopLayer) goldPopLayer.classList.remove("on");
    }, 1750);
}

function popWave(count, startDelay, duration){
    setTimeout(() => {
        fullPageGoldPop(count, duration);
    }, startDelay);
}

function fullPageGoldPop(bursts = 120, spreadDuration = 600){
    if(!goldPopLayer) return;

    const rect = goldPopLayer.getBoundingClientRect();

    for(let i = 0; i < bursts; i++){
        const dot = document.createElement("div");
        dot.className = "gold-pop";

        const x = rand(0, Math.floor(rect.width));
        const y = rand(0, Math.floor(rect.height));

        dot.style.left = x + "px";
        dot.style.top = y + "px";

        const delay = rand(0, spreadDuration);
        dot.style.animationDelay = delay + "ms";

        goldPopLayer.appendChild(dot);
        setTimeout(() => dot.remove(), 1200 + delay);
    }
}

function startFlashFlickers(totalMs = 1200){
    if(!flashLayer) return;

    let start = performance.now();

    const tick = (now) => {
        const t = now - start;

        if(t > totalMs){
            flashLayer.style.opacity = "0";
            return;
        }

        const progress = Math.min(1, t / totalMs);
        const chance = 0.08 + progress * 0.18;

        if(Math.random() < chance){
            const strength = 0.12 + Math.random() * (0.55 + progress * 0.25);
            flashLayer.style.opacity = String(strength);

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

function finishGame(){
    document.body.classList.remove("locked");
    document.body.classList.add("scroll-mode");

    const page2 = document.getElementById("page2");
    setTimeout(() => {
        page2?.scrollIntoView({ behavior: "smooth" });
    }, 220);
}

/* ---------------- INPUTS ---------------- */
spinBtn?.addEventListener("click", spin);
lever?.addEventListener("click", pullLever);
lever?.addEventListener("keydown", (e) => {
    if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        pullLever();
    }
});

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

function rand(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ---------------- QUIZ FUNCTIONS (Kiss Land Style) ---------------- */
function resetQuizUI() {
    quizForm?.reset();

    if (quizResult) quizResult.style.display = "none";
    if (quizResultInner) {
        quizResultInner.classList.remove("show");
        quizResultInner.innerHTML = "";
    }
    if (resultCover) {
        resultCover.classList.remove("show");
        resultCover.removeAttribute("src");
    }
    if (resultBlurb) resultBlurb.textContent = "";
    quizOverlay?.classList.remove("on");
}

function openQuiz() {
    _scrollYBeforeQuiz = window.scrollY || 0;
    enterQuizAudioMode();
    resetQuizUI();

    document.body.classList.add("quiz-open");
    quizScreen?.setAttribute("aria-hidden", "false");

    setTimeout(() => {
        if (quizScreen) quizScreen.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: "auto" });
    }, 0);
}

function closeQuiz() {
    document.body.classList.remove("quiz-open");
    quizScreen?.setAttribute("aria-hidden", "true");
    stopResultAudio();

    setTimeout(() => {
        window.scrollTo({ top: _scrollYBeforeQuiz, behavior: "auto" });
    }, 0);

    exitQuizAudioMode();
}

function computeQuizResult() {
    if (!quizForm) return { error: "Quiz not found." };

    const guestName = (guestNameInput?.value || "").trim();
    if (!guestName) return { error: "Enter your name first." };

    const data = new FormData(quizForm);

    for (let i = 1; i <= 6; i++) {
        if (!data.get("q" + i)) return { error: "Answer all 6 questions first." };
    }

    const scores = Object.fromEntries(SONG_KEYS.map(k => [k, 0]));

    for (const [key, value] of data.entries()) {
        if (key === "guestName") continue;
        if (scores[value] !== undefined) scores[value] += 1;
    }

    const max = Math.max(...Object.values(scores));
    const top = Object.keys(scores).filter(k => scores[k] === max);
    const chosen = top[Math.floor(Math.random() * top.length)];

    return { chosen, guestName };
}

function playResultSong(songKey) {
    music?.pause();

    if (resultCover) {
        resultCover.src = `${songKey}.jpg`;
        resultCover.classList.add("show");
    }

    if (resultAudio) {
        resultAudio.pause();
        resultAudio.currentTime = 0;
        resultAudio.src = `${songKey}.mp3`;
        resultAudio.load();
        resultAudio.play().catch(() => {});
    }
}

function revealQuizResult(songKey, guestName) {
    if (!quizResult || !quizResultInner) return;

    quizResult.style.display = "block";

    quizResultInner.classList.remove("show");
    quizResultInner.innerHTML = `
        <h2>${guestName}, you are <span>${SONG_PRETTY[songKey] || "a Mystery Track"}</span></h2>
    `;

    if (resultBlurb) resultBlurb.textContent = SONG_BLURB[songKey] || "";

    if (quizOverlay) {
        quizOverlay.classList.add("on");
        setTimeout(() => quizOverlay.classList.remove("on"), 900);
    }

    requestAnimationFrame(() => quizResultInner.classList.add("show"));

    playResultSong(songKey);

    const scrollToFullResult = () => {
        quizResult.scrollIntoView({ behavior: "smooth", block: "start" });

        setTimeout(() => {
            window.scrollBy({ top: 140, left: 0, behavior: "smooth" });
        }, 350);

        setTimeout(() => {
            window.scrollBy({ top: 80, left: 0, behavior: "smooth" });
        }, 900);
    };

    setTimeout(scrollToFullResult, 180);

    if (resultCover) {
        resultCover.onload = () => setTimeout(scrollToFullResult, 80);
    }
}

/* ---------------- QUIZ EVENT LISTENERS ---------------- */
openQuizBtn?.addEventListener("click", openQuiz);
quizBackBtn?.addEventListener("click", closeQuiz);
quizCloseBtn?.addEventListener("click", closeQuiz);

quizRetryBtn?.addEventListener("click", () => {
    resetQuizUI();
    stopResultAudio();
    if (quizScreen) quizScreen.scrollTop = 0;
});

quizFinishBtn?.addEventListener("click", () => {
    const res = computeQuizResult();

    if (res.error) {
        if (!quizResult || !quizResultInner) return;
        quizResult.style.display = "block";
        quizResultInner.classList.remove("show");
        quizResultInner.innerHTML = `<h2>Hold up</h2><p>${res.error}</p>`;
        if (resultBlurb) resultBlurb.textContent = "";
        requestAnimationFrame(() => quizResultInner.classList.add("show"));
        setTimeout(() => quizResult.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
        return;
    }

    revealQuizResult(res.chosen, res.guestName);
});
