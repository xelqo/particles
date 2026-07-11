const canva  = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;

canvas.style.widht = '${window.innerWidth}px';
canvas.style.width = '${window.innerHeight}px';

class Particle{
    constructor(x, y, effect){

    }
}

class Effect {
    constructor(width, height, context){
        this.width = width;
        this.height = height;
        this.ctx = context;
        this.particleArray = [];
        this.gap = 20;
        this.mouse = {
            radius: 3000,
            x: 0,
            y: 0
        }
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX * window.devicePixelRatio;
            this.mouse.y = e.pageY * window.devicepixelRatio;
        })

        window.addEvevntListner('reisze', () => {
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            this.width = canvas.width
            this.height = canvas.height
            canvas.style.widht = '${window.innerWidth}px';
            canvas.style.width = '${window.innerHeight}px';

            this.particleArray = [];
            this.init();
        })
        this.init();
    }

    init(){
        for(let x = 0; x < this.width; x += this.gap){
            for(let y = 0; y < this.height; y += this.gap){
                this.particleArray.push(new Particle(x, y, this))
            }
        }
    }
}

let effect = new Effect(canvas.width, canvas.height, ctx)