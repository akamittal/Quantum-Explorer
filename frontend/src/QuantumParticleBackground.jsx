/**
 * High-Performance Quantum Fluid & Particle Superposition Canvas Background
 * Path: /frontend/src/QuantumParticleBackground.jsx
 */
import React, { useEffect, useRef } from 'react';

export default function QuantumParticleBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Strict High-DPI Display Scaling configuration to eliminate blurring on Retina displays
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Model an array of particles simulating a coherent atomic probability cloud
        const particleCount = 70;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: Math.random() * 2 + 0.5,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.3 + 0.08,
                waveAmplitude: Math.random() * 25 + 5,
                waveFrequency: Math.random() * 0.015 + 0.003,
                baseY: 0
            });
            particles[i].baseY = particles[i].y;
        }

        // The core real-time render loop
        const animate = (timestamp) => {
            // Asymptotic decay color overlay creates elegant, performance-friendly trailing particle glows
            ctx.fillStyle = 'rgba(3, 7, 18, 0.06)'; 
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            // 1. Render Underlying Wave Interferometry Curves (Superposition Lines)
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.025)'; // Faint Quantum Emerald Trace
            ctx.lineWidth = 1;
            for (let j = 0; j < 3; j++) {
                ctx.beginPath();
                for (let x = 0; x < window.innerWidth; x += 15) {
                    const y = window.innerHeight / 2 + 
                              Math.sin(x * 0.003 + timestamp * 0.0008 + j) * 90 * 
                              Math.cos(x * 0.0008 - timestamp * 0.0003);
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // 2. Compute Non-Linear Probability Amplitudes for the Qubit Nodes
            particles.forEach(p => {
                p.angle += p.waveFrequency;
                p.x += p.speed;
                p.y = p.baseY + Math.sin(p.angle) * p.waveAmplitude;

                // Screen boundary recycling check
                if (p.x > window.innerWidth) {
                    p.x = 0;
                    p.baseY = Math.random() * window.innerHeight;
                }

                // Render the discrete physical node
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.5)'; // Electric Cyan Coherence Accent
                ctx.fill();

                // Compute local proximity linkages to simulate quantum entanglement
                particles.forEach(target => {
                    const dist = Math.hypot(p.x - target.x, p.y - target.y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(target.x, target.y);
                        ctx.strokeStyle = `rgba(16, 185, 129, ${0.06 * (1 - dist / 100)})`;
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate(0);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 1,
                pointerEvents: 'none'
            }}
        />
    );
}
