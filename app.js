const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

class Particle {
    constructor(x, y, color, radius, effect) {
        this.originX = x;
        this.originY = y;
        this.color = color;
        this.raidus = radius;
        this.effect = effect;
        this.x = Math.floor(x) * this.effect.width;
        this.y = Math.floor(y) * this.effect.height;
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
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.Pi * 2);
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
    constructor(width, height, context) {
        this.width = width;
        this.height = height;
        this.ctx = context;
        this.particleArray = [];
        this.gap = 9;
        this.threshold = 22;
        this.coreFocus = 0.55;
        this.edgeFocus = 1.0;
        this.mouse = {
            radius: 20000,
            x: 0,
            y: 0
        };

        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX * window.devicePixelRatio;
            this.mouse.y = e.clientY * window.devicePixelRatio;
        });

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            this.width = canvas.width;
            this.height = canvas.height;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            if (this.image) this.init(this.image);
        });

        this.init();
    }

    init(image) {
        this.image = image;
        this.particleArray = [];
 
        // Scale image to fit the canvas while keeping aspect ratio (max ~70% of screen)
        const maxW = this.width * 0.7;
        const maxH = this.height * 0.7;
        const scale = Math.min(maxW / image.width, maxH / image.height);
        const drawW = image.width * scale;
        const drawH = image.height * scale;
        const offsetX = (this.width - drawW) / 2;
        const offsetY = (this.height - drawH) / 2;
 
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(image, offsetX, offsetY, drawW, drawH);
 
        const pixels = this.ctx.getImageData(0, 0, this.width, this.height).data;
        this.ctx.clearRect(0, 0, this.width, this.height);
 
        const maxRadius = this.gap * 0.55;
        // Center of the drawn image + its half-extents, for the radial focus mask
        const cx = offsetX + drawW / 2;
        const cy = offsetY + drawH / 2;
        const halfW = drawW / 2;
        const halfH = drawH / 2;
 
        for (let y = 0; y < this.height; y += this.gap) {
            for (let x = 0; x < this.width; x += this.gap) {
                const index = (y * this.width + x) * 4;
                const alpha = pixels[index + 3];
                if (alpha > 0) {
                    const r = pixels[index];
                    const g = pixels[index + 1];
                    const b = pixels[index + 2];
                    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                    if (brightness > this.threshold) {
                        const nx = (x - cx) / halfW;
                        const ny = (y - cy) / halfH;
                        const dist = Math.sqrt(nx * nx + ny * ny);
                        const focus = Math.min(1, Math.max(0,
                            (this.edgeFocus - dist) / (this.edgeFocus - this.coreFocus)));
                        if (focus <= 0) continue;
                        if (Math.random() > focus) continue;
 
                        const t = brightness / 255;
                        const variance = 0.55 + Math.random() * 0.9;
                        const radius = (1.5 + t * maxRadius) * variance * (0.4 + 0.6 * focus);
                        const tone = Math.pow(t, 0.7);
                        const shade = Math.round(55 + tone * 200); // 55–255 grey
                        const color = `rgb(${shade},${shade},${shade})`;
                        this.particleArray.push(new Particle(x, y, color, radius, this));
                    }
                }
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

const effect = new Effect(canvas.width, canvas.height, ctx);

function animate() {
    effect.update();
    requestAnimationFrame(animate);
}
animate();