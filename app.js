const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;

const SIZES = {
    small:  { w: 420, h: 500 },
    medium: { w: 520, h: 620 },
    large:  { w: 640, h: 760 }
};

let currentImage = null;

function setCanvasSize(w, h) {
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
}

class Particle {
    constructor(x, y, color, radius, effect) {
        this.originX = x;
        this.originY = y;
        this.color = color;
        this.radius = radius;
        this.effect = effect;
        this.x = Math.random() * this.effect.width;
        this.y = Math.random() * this.effect.height;
        this.ctx = this.effect.ctx;
        this.vx = 0;
        this.vy = 0;
        this.ease = 0.05 + Math.random() * 0.05;
        this.friction = 0.90;
        this.dx = 0;
        this.dy = 0;
        this.distance = 0;
        this.force = 0;
        this.angle = 0;
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    update() {
        this.dx = this.effect.mouse.x - this.x;
        this.dy = this.effect.mouse.y - this.y;
        this.distance = this.dx * this.dx + this.dy * this.dy;
        this.force = -this.effect.mouse.radius / this.distance * 8;

        if (this.distance < this.effect.mouse.radius) {
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
        }

        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
        this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
        this.draw();
    }
}

class Effect {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.width = canvas.width;
        this.height = canvas.height;
        this.particleArray = [];
        this.image = null;
        this.gap = 5;
        this.threshold = 40
        this.coreFocus = 0.55;
        this.edgeFocus = 1.0; 
        this.mouse = { radius: 2000, x: -9999, y: -9999 };

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (this.width / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (this.height / rect.height);
        });
        canvas.addEventListener('mouseleave', () => {
            this.mouse.x = -9999;
            this.mouse.y = -9999;
        });
    }

    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        if (this.image) this.init(this.image);
    }

    init(image) {
        this.image = image;
        this.particleArray = [];
        const scale = Math.min(this.width * 0.9 / image.width, this.height * 0.9 / image.height);
        const drawW = image.width * scale;
        const drawH = image.height * scale;
        const offsetX = (this.width - drawW) / 2;
        const offsetY = (this.height - drawH) / 2;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(image, offsetX, offsetY, drawW, drawH);

        const pixels = this.ctx.getImageData(0, 0, this.width, this.height).data;
        this.ctx.clearRect(0, 0, this.width, this.height);

        const maxRadius = this.gap * 0.55;
        const cx = offsetX + drawW / 2;
        const cy = offsetY + drawH / 2;
        const halfW = drawW / 2;
        const halfH = drawH / 2;

        for (let y = 0; y < this.height; y += this.gap) {
            for (let x = 0; x < this.width; x += this.gap) {
                const index = (y * this.width + x) * 4;
                const alpha = pixels[index + 3];
                if (alpha === 0) continue;

                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];
                const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

                if (brightness < this.threshold) continue;

                // Radial focus mask keeps the center, drop edges
                const nx = (x - cx) / halfW;
                const ny = (y - cy) / halfH;
                const dist = Math.sqrt(nx * nx + ny * ny);
                const focus = Math.min(1, Math.max(0,
                    (this.edgeFocus - dist) / (this.edgeFocus - this.coreFocus)));
                if (focus <= 0) continue;
                if (Math.random() > focus) continue;

                const t = brightness / 255;      // 0 = black, 1 = white
                const variance = 0.55 + Math.random() * 0.9;
                const radius = (0.6 + t * maxRadius) * variance * (0.4 + 0.6 * focus);
                const shade = Math.round(70 + Math.pow(t, 0.7) * 185);
                const color = `rgb(${shade},${shade},${shade})`;

                this.particleArray.push(new Particle(x, y, color, radius, this));
            }
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < this.particleArray.length; i++) {
            this.particleArray[i].update();
        }
    }
}

setCanvasSize(SIZES.medium.w, SIZES.medium.h);
const effect = new Effect(canvas, ctx);

function animate() {
    effect.update();
    requestAnimationFrame(animate);
}
animate();

// Controls
const uploadEl = document.querySelector('#upload');
const filenameEl = document.querySelector('#filename');
const goEl = document.querySelector('#go');
const sizeEl = document.querySelector('#size');

uploadEl.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    filenameEl.textContent = file.name;
    const img = new Image();
    img.onload = () => {
        currentImage = img;
        URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
});

goEl.addEventListener('click', () => {
    if (currentImage) effect.init(currentImage);
});

sizeEl.addEventListener('change', () => {
    const s = SIZES[sizeEl.value];
    setCanvasSize(s.w, s.h);
    effect.resize();
});