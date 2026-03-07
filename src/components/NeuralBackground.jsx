import React, { useRef, useEffect } from 'react';

const COLORS = ['#00E5FF', '#8B5CF6', '#3B82F6']; // cyan, violet, electric blue

class Particle {
    constructor(width, height, colors, mouse, repelRadius) {
        this.width = width;
        this.height = height;
        this.colors = colors;
        this.mouse = mouse;
        this.repelRadius = repelRadius;

        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Natural movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > this.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.height) this.vy *= -1;

        // Mouse repel effect
        const dx = this.mouse.x - this.x;
        const dy = this.mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.repelRadius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (this.repelRadius - distance) / this.repelRadius;

            // Repel particles
            this.x -= forceDirectionX * force * 3;
            this.y -= forceDirectionY * force * 3;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}

const NeuralBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuration
        const particles = [];
        const particleCount = 80;
        const connectionDistance = 150;
        const mouseRepelRadius = 150;
        const colors = COLORS;

        let mouse = { x: -1000, y: -1000 };

        const resizeBoundary = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeBoundary();


        const init = () => {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(canvas.width, canvas.height, colors, mouse, mouseRepelRadius));
            }
        };

        const drawConnections = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    // Bend lines slightly near mouse
                    const mouseDx = mouse.x - ((particles[a].x + particles[b].x) / 2);
                    const mouseDy = mouse.y - ((particles[a].y + particles[b].y) / 2);
                    const distToMouse = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();

                        // Line bending effect via Quadratic Curve
                        if (distToMouse < mouseRepelRadius) {
                            const bendForce = (mouseRepelRadius - distToMouse) / mouseRepelRadius;
                            const controlX = ((particles[a].x + particles[b].x) / 2) - (mouseDx * bendForce * 0.5);
                            const controlY = ((particles[a].y + particles[b].y) / 2) - (mouseDy * bendForce * 0.5);
                            ctx.moveTo(particles[a].x, particles[a].y);
                            ctx.quadraticCurveTo(controlX, controlY, particles[b].x, particles[b].y);
                        } else {
                            ctx.moveTo(particles[a].x, particles[a].y);
                            ctx.lineTo(particles[b].x, particles[b].y);
                        }

                        // Opacity based on distance
                        const opacity = 1 - (distance / connectionDistance);
                        ctx.strokeStyle = `rgba(0, 229, 255, ${opacity * 0.4})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawConnections();

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw(ctx);
            }

            // Soft neon glow ripple following cursor
            if (mouse.x > 0 && mouse.y > 0) {
                const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, mouseRepelRadius);
                gradient.addColorStop(0, 'rgba(0, 229, 255, 0.05)');
                gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
                gradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, mouseRepelRadius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseOut = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        window.addEventListener('resize', resizeBoundary);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeBoundary);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <React.Fragment>
            {/* Base Background + Gradient Overlay + Geometric Pattern Overlay inside CSS */}
            <div className="dynamic-bg-layers" />
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: -1, /* Behinds components, above base layers */
                    pointerEvents: 'none'
                }}
            />
        </React.Fragment>
    );
};

export default NeuralBackground;
