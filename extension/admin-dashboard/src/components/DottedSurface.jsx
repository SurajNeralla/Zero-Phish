import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function DottedSurface({ isDark }) {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const SEPARATION = 100;
        const AMOUNTX = 50;
        const AMOUNTY = 50;

        // Scene setup
        const scene = new THREE.Scene();
        // Adjust fog color based on theme
        const fogColor = isDark ? 0x121212 : 0xf4f6f8;
        scene.fog = new THREE.Fog(fogColor, 100, 4000);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );
        camera.position.z = 1000;
        camera.position.y = 200;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(fogColor, 1);

        // Clear previous canvas if any
        while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
        }
        containerRef.current.appendChild(renderer.domElement);

        // Create particles
        const particles = [];
        const positions = [];
        const colors = [];

        // Particle Color
        const particleColor = new THREE.Color(isDark ? 0x0d6efd : 0x666666);

        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

                positions.push(x, 0, z);
                colors.push(particleColor.r, particleColor.g, particleColor.b);
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: isDark ? 3 : 4,
            vertexColors: true,
            transparent: true,
            opacity: isDark ? 0.6 : 0.4,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        let count = 0;
        let animationId;

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            const positions = points.geometry.attributes.position.array;
            let i = 0;
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    // Waving animation
                    positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
                        (Math.sin((iy + count) * 0.5) * 50);
                    i += 3;
                }
            }
            points.geometry.attributes.position.needsUpdate = true;

            // Slow rotation
            points.rotation.y += 0.001;

            renderer.render(scene, camera);
            count += 0.1;
        };

        const handleResize = () => {
            if (!containerRef.current) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (containerRef.current) {
                // containerRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };

    }, [isDark]); // Re-run when theme changes

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                opacity: 0.6
            }}
        />
    );
}
