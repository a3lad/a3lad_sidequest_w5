/*
Week 5 — Example 1: Top-Down Camera Follow (Centered, No Bounds)

Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
Date: Feb. 12, 2026

Move: WASD/Arrows

Goal:
- Keep player position in world space
- Compute a camera offset from the player (view state)
- Draw world using translate(-cam.x, -cam.y)
- Draw HUD in screen space (no translate)
*/

let player = { x: 300, y: 300, s: 1.2 };
let cam = { x: 0, y: 0 };

const WORLD_W = 2400;
const WORLD_H = 1600;

const VIEW_W = 800;
const VIEW_H = 480;

let vx = 0;
let vy = 0;

let mood = 0; // smoothed day → night value

let memories = [
  { x: 500, y: 400, text: "I remember the quiet." },
  { x: 1200, y: 700, text: "It felt warmer then." },
  { x: 1800, y: 300, text: "I stayed longer than I should have." },
  { x: 2100, y: 1200, text: "Some things never return." },
];

function setup() {
  createCanvas(VIEW_W, VIEW_H);
  textFont("serif");
  textSize(18);
  noStroke();
}

function draw() {
  // ---------- 1) UPDATE PLAYER (WORLD SPACE) ----------

  const dx =
    (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) -
    (keyIsDown(LEFT_ARROW) || keyIsDown(65));

  const dy =
    (keyIsDown(DOWN_ARROW) || keyIsDown(83)) -
    (keyIsDown(UP_ARROW) || keyIsDown(87));

  // soft acceleration
  vx += dx * 0.2;
  vy += dy * 0.2;

  // friction (gliding stop)
  vx *= 0.92;
  vy *= 0.92;

  player.x += vx;
  player.y += vy;

  // ---------- 2) UPDATE CAMERA (VIEW STATE) ----------

  let targetX = player.x - width / 2;
  let targetY = player.y - height / 2;

  cam.x += (targetX - cam.x) * 0.05;
  cam.y += (targetY - cam.y) * 0.05;

  // ---------- 3) DRAW GRADIENT (SCREEN SPACE) ----------

  let d = dist(player.x, player.y, 300, 300);
  let targetMood = map(d, 0, 2000, 0, 1, true);
  mood = lerp(mood, targetMood, 0.02);

  let lightTop = color(200, 230, 255);
  let lightBottom = color(160, 200, 255);

  let darkTop = color(20, 40, 90);
  let darkBottom = color(5, 10, 40);

  let topColor = lerpColor(lightTop, darkTop, mood);
  let bottomColor = lerpColor(lightBottom, darkBottom, mood);

  drawGradient(topColor, bottomColor);

  // ---------- 4) DRAW WORLD (SCROLLING LAYER) ----------

  push();
  translate(-cam.x, -cam.y);

  noStroke();

  // drifting particles
  for (let i = 0; i < 40; i++) {
    let px = (frameCount * 0.2 + i * 200) % WORLD_W;
    let py = (i * 130) % WORLD_H;
    fill(200, 220, 255, 25);
    ellipse(px, py, 4);
  }

  for (let m of memories) {
    let md = dist(player.x, player.y, m.x, m.y);

    // fade text in when near
    let textAlpha = map(md, 300, 0, 0, 255, true);

    // pulse animation
    let pulse = sin(frameCount * 0.05) * 10;

    // circle gets stronger when closer
    let circleAlpha = map(md, 600, 0, 0, 80, true);

    noFill();
    stroke(200, 220, 255, circleAlpha);
    strokeWeight(2);

    ellipse(m.x, m.y, 60 + pulse);

    // second softer outer ring
    stroke(200, 220, 255, circleAlpha * 0.4);
    ellipse(m.x, m.y, 120 + pulse * 1.5);

    noStroke();
    fill(255, textAlpha);
    textAlign(CENTER);
    text(m.text, m.x, m.y);
  }

  // player
  fill(100, 160, 255);
  ellipse(player.x, player.y, 20);

  pop();

  // ---------- 5) HUD (SCREEN SPACE) ----------

  fill(255);
  textAlign(LEFT);
  text("Drifting Through Memory — WASD / Arrows to move", 20, 30);
}

// ---------- GRADIENT FUNCTION ----------

function drawGradient(topColor, bottomColor) {
  for (let y = 0; y < height; y++) {
    let t = y / height;
    let c = lerpColor(topColor, bottomColor, t);
    stroke(c);
    line(0, y, width, y);
  }
}
