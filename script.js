const startBtn = document.getElementById("startBtn");
const music = document.getElementById("bgMusic");

/* Slot elements */
const spinBtn = document.getElementById("spinBtn");
const lever = document.getElementById("lever");
const reelsEl = document.getElementById("reels");
const slotMachine = document.getElementById("slotMachine");
const winText = document.getElementById("winText");
const goldFlash = document.getElementById("goldFlash");
const sparkLayer = document.getElementById("sparkLayer");
const floatLayer = document.getElementById("floatLayer");

/* Symbols (dice, cards, neon hearts) */
const SYMBOLS = ["🎲", "♥", "♦", "♠", "♣", "★"];

let musicStarted = false;
let spinning = false;
let won = false;

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
    // Open Page 1 (slot game)
    showOnlyPage(1);

    // Start music as soon as Page 1 opens (user gesture = allowed)
    startMusic();

    // Seed reels
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

/* ---------------- SLOT GAME ---------------- */
function getReelNodes(){
    if(!reelsEl) return [];
    return Array.from(reelsEl.querySelectorAll(".reel"));
}

function setReels(values){
    const reels = getReelNodes();
    reels.forEach((r, i) => {
        const s = r.querySelector(".symbol");
        if(s) s.textContent = values[i] ?? randSym();
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
    if(winText) winText.textContent = "";
    slotMachine?.classList.remove("won");

    // Lever anim
    lever?.classList.add("pulling");
    setTimeout(() => lever?.classList.remove("pulling"), 480);

    const reels = getReelNodes();
    const timers = [];

    // Start "spinning" visuals + rapid symbol changes
    reels.forEach((reelNode) => {
        reelNode.classList.add("spinning");

        const t = setInterval(() => {
            const s = reelNode.querySelector(".symbol");
            if(s) s.textContent = randSym();
        }, 70);

        timers.push(t);
    });

    // Stop each reel in sequence for a nicer feel
    const final = [randSym(), randSym(), randSym()];

    const stopReel = (i, delay) => {
        setTimeout(() => {
            clearInterval(timers[i]);
            const reelNode = reels[i];
            reelNode.classList.remove("spinning");
            const s = reelNode.querySelector(".symbol");
            if(s) s.textContent = final[i];
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
            if(winText) winText.textContent = "Not quite… pull again.";
        }
    }, 1400);
}

function onWin(symbol){
    slotMachine?.classList.add("won");
    if(winText) winText.textContent = "JACKPOT. You're blinded by the lights…";

    // Icons fly out and float around, then burst into gold lights
    flyOutIcons(symbol);

    setTimeout(() => {
        flashGold();
        goldSparkBurst(140);
    }, 900);

    // Reveal invite after the light moment
    setTimeout(() => {
        finishGame();
    }, 2200);
}

function flyOutIcons(symbol){
    if(!floatLayer || !reelsEl) return;

    const reelsRect = reelsEl.getBoundingClientRect();
    const stageRect = floatLayer.getBoundingClientRect();

    const cx = (reelsRect.left + reelsRect.right) / 2 - stageRect.left;
    const cy = (reelsRect.top + reelsRect.bottom) / 2 - stageRect.top;

    const count = 9;
    for(let i = 0; i < count; i++){
        const el = document.createElement("div");
        el.className = "float-icon";
        el.textContent = symbol;

        el.style.left = cx + "px";
        el.style.top = cy + "px";

        const tx = rand(-220, 220);
        const ty = rand(-160, 140);
        el.style.setProperty("--tx", tx + "px");
        el.style.setProperty("--ty", ty + "px");

        floatLayer.appendChild(el);
        setTimeout(() => el.remove(), 1400);
    }
}

function flashGold(){
    if(!goldFlash) return;
    goldFlash.classList.remove("on");
    void goldFlash.offsetWidth; // restart animation
    goldFlash.classList.add("on");
}

function goldSparkBurst(amount){
    if(!sparkLayer || !reelsEl) return;

    const reelsRect = reelsEl.getBoundingClientRect();
    const stageRect = sparkLayer.getBoundingClientRect();
    const cx = (reelsRect.left + reelsRect.right) / 2 - stageRect.left;
    const cy = (reelsRect.top + reelsRect.bottom) / 2 - stageRect.top;

    for(let i = 0; i < amount; i++){
        const s = document.createElement("div");
        s.className = "spark";
        s.style.left = cx + rand(-40, 40) + "px";
        s.style.top = cy + rand(-30, 30) + "px";

        const dx = rand(-320, 320) + "px";
        const dy = rand(-240, 240) + "px";
        s.style.setProperty("--dx", dx);
        s.style.setProperty("--dy", dy);

        sparkLayer.appendChild(s);
        setTimeout(() => s.remove(), 1100);
    }
}

/* ---------------- FINISH: enable scroll from Show Up to end ---------------- */
function finishGame(){
    document.body.classList.remove("locked");
    document.body.classList.add("scroll-mode");

    const page2 = document.getElementById("page2");
    setTimeout(() => {
        page2?.scrollIntoView({ behavior: "smooth" });
    }, 320);
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

    // pull down enough = spin (fast + smooth on phones)
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