/**
 * AI-->TO-->YOU Technologies — Neural Network Data Node Canvas Background
 * 
 * Creates a lightweight, high-performance HTML5 Canvas animation featuring
 * drifting data nodes (particles) with dynamic neural connection links and mouse proximity interaction.
 */

(function () {
    'use strict';

    const canvas = document.getElementById('neural-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrameId = null;

    // Mouse coordinates tracking
    const mouse = {
        x: null,
        y: null,
        radius: 160
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    /**
     * Resizes canvas to match viewport dimensions
     */
    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    }

    /**
     * Particle Class representing an individual Neural Data Node
     */
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slow, subtle drift velocity
            this.vx = (Math.random() - 0.5) * 0.45;
            this.vy = (Math.random() - 0.5) * 0.45;
            // Radius 1.0px to 2.0px
            this.radius = Math.random() * 1.0 + 1.0;
            // Muted Amber (#f59e0b) or Slate (#94a3b8) tones
            const isAmber = Math.random() > 0.45;
            this.color = isAmber ? 'rgba(245, 158, 11, 0.45)' : 'rgba(148, 163, 184, 0.35)';
            this.lineColor = isAmber ? '245, 158, 11' : '148, 163, 184';
        }

        update() {
            // Bounce off viewport boundaries
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            this.x += this.vx;
            this.y += this.vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    /**
     * Initialize particle count proportionally based on screen dimensions
     */
    function initParticles() {
        particles = [];
        // Calculate particle count: ~1 particle per 18,000 pixels (min 35, max 75)
        const count = Math.min(Math.max(Math.floor((width * height) / 18000), 35), 75);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    /**
     * Connect nearby particles with thin neural link lines
     */
    function connectParticles() {
        const maxDistance = 115;

        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const alpha = (1 - distance / maxDistance) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.strokeStyle = `rgba(${particles[a].lineColor}, ${alpha})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }

            // Connect to mouse cursor if within interactive radius
            if (mouse.x !== null && mouse.y !== null) {
                const mdx = particles[a].x - mouse.x;
                const mdy = particles[a].y - mouse.y;
                const mouseDistance = Math.sqrt(mdx * mdx + mdy * mdy);

                if (mouseDistance < mouse.radius) {
                    const mouseAlpha = (1 - mouseDistance / mouse.radius) * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(245, 158, 11, ${mouseAlpha})`;
                    ctx.lineWidth = 0.85;
                    ctx.stroke();
                }
            }
        }
    }

    /**
     * Main Animation Render Loop (60 FPS)
     */
    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        connectParticles();
        animationFrameId = requestAnimationFrame(animate);
    }

    // Debounced window resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 150);
    });

    // Start canvas system
    resizeCanvas();
    animate();

})();
