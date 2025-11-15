import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import './MagicSuggestionCard.css'; // We will create this next

const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_GLOW_COLOR = '132, 0, 255'; // Purple glow

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute; width: 3px; height: 3px; border-radius: 50%;
    background: rgba(${color}, 1); box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none; z-index: 100; left: ${x}px; top: ${y}px;
  `;
  return el;
};

const MagicSuggestionCard = ({ icon, title, description }) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: DEFAULT_PARTICLE_COUNT }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, DEFAULT_GLOW_COLOR)
    );
    particlesInitialized.current = true;
  }, []);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)',
        onComplete: () => particle.parentNode?.removeChild(particle)
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);
        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(clone, { x: (Math.random() - 0.5) * 80, y: (Math.random() - 0.5) * 80, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true });
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
      }, index * 100);
      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const updateGlow = (e) => {
      const rect = element.getBoundingClientRect();
      const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
      const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
      element.style.setProperty('--glow-x', `${relativeX}%`);
      element.style.setProperty('--glow-y', `${relativeY}%`);
      element.style.setProperty('--glow-intensity', '1');
    };

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      element.addEventListener('mousemove', updateGlow);
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      element.removeEventListener('mousemove', updateGlow);
      element.style.setProperty('--glow-intensity', '0');
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', updateGlow);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles]);

  const IconComponent = icon;
  return (
    <div ref={cardRef} className="magic-suggestion-card">
      <div className="magic-suggestion-card-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="magic-suggestion-card-icon">
        <IconComponent />
      </div>
    </div>
  );
};

export default MagicSuggestionCard;