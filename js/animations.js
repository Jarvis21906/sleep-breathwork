// js/animations.js

const starfield = document.getElementById('starfield');
const ctx = starfield.getContext('2d');
let stars = [];

function createStars() {
    stars = [];
    const starCount = Math.floor((starfield.width * starfield.height) / 5000);
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * starfield.width,
            y: Math.random() * starfield.height,
            radius: Math.random() * 1.2,
            alpha: Math.random() * 0.5 + 0.5,
            dAlpha: (Math.random() * 0.001) + 0.0005,
        });
    }
}

function drawStars() {
    if (starfield.width !== window.innerWidth || starfield.height !== window.innerHeight) {
        starfield.width = window.innerWidth;
        starfield.height = window.innerHeight;
        createStars();
    }

    ctx.clearRect(0, 0, starfield.width, starfield.height);
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
        
        star.alpha += star.dAlpha;
        if (star.alpha > 1 || star.alpha < 0.2) {
            star.dAlpha *= -1;
        }
    });
    requestAnimationFrame(drawStars);
}

export function initStarfield() {
    starfield.width = window.innerWidth;
    starfield.height = window.innerHeight;
    createStars();
    drawStars();
}