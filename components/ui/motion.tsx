"use client";

import { motion, useInView, useAnimation, Variants, useReducedMotion } from "framer-motion";
import { useRef, useEffect, ReactNode, useMemo } from "react";

// Check for reduced motion preference
function useOptimizedAnimation() {
    const prefersReducedMotion = useReducedMotion();
    return prefersReducedMotion;
}

// Optimized spring transition for smoother animations
const smoothSpring = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 0.5,
};

// Fade In Up Animation Component - Optimized with will-change
interface FadeInUpProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function FadeInUp({ children, delay = 0, duration = 0.5, className = "" }: FadeInUpProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const prefersReducedMotion = useOptimizedAnimation();

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
            transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
            style={{ willChange: isInView ? "auto" : "transform, opacity" }}
        >
            {children}
        </motion.div>
    );
}

// Fade In Animation Component
interface FadeInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.5, className = "" }: FadeInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
            style={{ willChange: isInView ? "auto" : "opacity" }}
        >
            {children}
        </motion.div>
    );
}

// Scale In Animation Component - Optimized
interface ScaleInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function ScaleIn({ children, delay = 0, duration = 0.4, className = "" }: ScaleInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const prefersReducedMotion = useOptimizedAnimation();

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
            transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
            style={{ willChange: isInView ? "auto" : "transform, opacity" }}
        >
            {children}
        </motion.div>
    );
}

// Stagger Children Container - Optimized with reduced stagger delay
interface StaggerContainerProps {
    children: ReactNode;
    staggerDelay?: number;
    className?: string;
}

export function StaggerContainer({ children, staggerDelay = 0.08, className = "" }: StaggerContainerProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const container: Variants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: 0.1,
            },
        },
    }), [staggerDelay]);

    return (
        <motion.div
            ref={ref}
            variants={container}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Stagger Item - Optimized
interface StaggerItemProps {
    children: ReactNode;
    className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
    const item: Variants = useMemo(() => ({
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    }), []);

    return (
        <motion.div variants={item} className={className}>
            {children}
        </motion.div>
    );
}

// Floating Animation Component - Optimized with CSS animation fallback
interface FloatingProps {
    children: ReactNode;
    duration?: number;
    distance?: number;
    className?: string;
}

export function Floating({ children, duration = 4, distance = 8, className = "" }: FloatingProps) {
    const prefersReducedMotion = useOptimizedAnimation();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            animate={{
                y: [-distance / 2, distance / 2, -distance / 2],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "loop",
            }}
            className={className}
            style={{ willChange: "transform" }}
        >
            {children}
        </motion.div>
    );
}

// Slide In From Left - Optimized
interface SlideInLeftProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function SlideInLeft({ children, delay = 0, duration = 0.5, className = "" }: SlideInLeftProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const prefersReducedMotion = useOptimizedAnimation();

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReducedMotion ? 0 : -40 }}
            transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
            style={{ willChange: isInView ? "auto" : "transform, opacity" }}
        >
            {children}
        </motion.div>
    );
}

// Slide In From Right - Optimized
interface SlideInRightProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function SlideInRight({ children, delay = 0, duration = 0.5, className = "" }: SlideInRightProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const prefersReducedMotion = useOptimizedAnimation();

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReducedMotion ? 0 : 40 }}
            transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
            style={{ willChange: isInView ? "auto" : "transform, opacity" }}
        >
            {children}
        </motion.div>
    );
}

// Animated Counter Component - Optimized with throttled updates
interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    duration?: number;
    className?: string;
}

export function AnimatedCounter({ value, suffix = "", duration = 1.5, className = "" }: AnimatedCounterProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <span ref={ref} className={className}>
            {isInView ? (
                <>
                    <Counter from={0} to={value} duration={duration} />
                    {suffix}
                </>
            ) : (
                <>0{suffix}</>
            )}
        </span>
    );
}

// Counter helper component - Optimized with reduced frame updates
function Counter({ from, to, duration }: { from: number; to: number; duration: number }) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const startTime = performance.now();
        let animationId: number;

        const updateCounter = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);

            // Optimized easing function
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(from + (to - from) * easeOutCubic);

            if (ref.current) {
                ref.current.textContent = current.toLocaleString();
            }

            if (progress < 1) {
                animationId = requestAnimationFrame(updateCounter);
            }
        };

        animationId = requestAnimationFrame(updateCounter);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [from, to, duration]);

    return <span ref={ref}>{from}</span>;
}

// Glow Pulse Button Animation - Simplified for better performance
interface GlowPulseProps {
    children: ReactNode;
    className?: string;
}

export function GlowPulse({ children, className = "" }: GlowPulseProps) {
    const prefersReducedMotion = useOptimizedAnimation();

    return (
        <motion.div
            className={`relative ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            {!prefersReducedMotion && (
                <div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-400 opacity-30 animate-pulse-soft"
                    style={{ filter: "blur(12px)" }}
                />
            )}
            <div className="relative">{children}</div>
        </motion.div>
    );
}

// Hover Card Animation - Optimized with CSS transitions
interface HoverCardProps {
    children: ReactNode;
    className?: string;
}

export function HoverCard({ children, className = "" }: HoverCardProps) {
    return (
        <motion.div
            className={`${className} transition-shadow duration-300`}
            whileHover={{
                y: -6,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ willChange: "transform" }}
        >
            {children}
        </motion.div>
    );
}

// Text Reveal Animation - Optimized
interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
}

export function TextReveal({ text, className = "", delay = 0 }: TextRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const prefersReducedMotion = useOptimizedAnimation();

    const words = useMemo(() => text.split(" "), [text]);

    if (prefersReducedMotion) {
        return <span className={className}>{text}</span>;
    }

    return (
        <span ref={ref} className={className}>
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                    transition={{
                        duration: 0.3,
                        delay: delay + index * 0.04,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="inline-block mr-[0.25em]"
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}

// Parallax Scroll Effect - Simplified
interface ParallaxProps {
    children: ReactNode;
    speed?: number;
    className?: string;
}

export function Parallax({ children, speed = 0.3, className = "" }: ParallaxProps) {
    const prefersReducedMotion = useOptimizedAnimation();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial={{ y: 0 }}
            whileInView={{ y: -20 * speed }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
        >
            {children}
        </motion.div>
    );
}

// Bouncing Arrow - Optimized with CSS animation
export function BouncingArrow({ className = "" }: { className?: string }) {
    return (
        <div className={`${className} animate-bounce-slow`}>
            <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
        </div>
    );
}
