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

/* ---------------- “BLINDED BY THE LIGHTS” SEQUENCE ----------------
   - Gold pops start sparse then get insanely dense
   - Camera flash flickers
   - Subtle bloom on the whole page content
*/
function blindedByLightsSequence(){
    if(page1) page1.classList.add("blooming");
    if(goldPopLayer) goldPopLayer.classList.add("on");

    // 3 waves: sparse -> medium -> dense
    // total ~1500ms, feels like a build & drop
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

        // Spread over a window so it feels like “popping everywhere”
        const delay = rand(0, spreadDuration);
        dot.style.animationDelay = delay + "ms";

        goldPopLayer.appendChild(dot);
        setTimeout(() => dot.remove(), 1200 + delay);
    }
}

/* Camera flash flickers:
   quick random white flashes with a “paparazzi” feel */
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
