import {useEffect, useRef} from "react";


class Pixel {

    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    color: string;
    speed: number;
    size: number;
    sizeStep: number;
    minSize: number;
    maxSizeInteger: number;
    maxSize: number;
    delay: number;
    counter: number;
    counterStep: number;
    isIdle: boolean;
    isReverse: boolean;
    isShimmer: boolean;

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, x: number, y: number, color: string, speed: number, delay: number) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = context;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = this.getRandomValue(0.1, 0.9) * speed;
        this.size = 0;
        this.sizeStep = Math.random() * 0.4;
        this.minSize = 0.5;
        this.maxSizeInteger = 2;
        this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
        this.delay = delay;
        this.counter = 0;
        this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
        this.isIdle = false;
        this.isReverse = false;
        this.isShimmer = false;
    }

    getRandomValue(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    draw() {
        const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(
            this.x + centerOffset,
            this.y + centerOffset,
            this.size,
            this.size
        );
    }

    appear() {
        this.isIdle = false;
        if (this.counter <= this.delay) {
            this.counter += this.counterStep;
            return;
        }
        if (this.size >= this.maxSize) {
            this.isShimmer = true;
        }
        if (this.isShimmer) {
            this.shimmer();
        } else {
            this.size += this.sizeStep;
        }
        this.draw();
    }

    disappear() {
        this.isShimmer = false;
        this.counter = 0;
        if (this.size <= 0) {
            this.isIdle = true;
            return;
        } else {
            this.size -= 0.1;
        }
        this.draw();
    }

    shimmer() {
        if (this.size >= this.maxSize) {
            this.isReverse = true;
        } else if (this.size <= this.minSize) {
            this.isReverse = false;
        }
        if (this.isReverse) {
            this.size -= this.speed;
        } else {
            this.size += this.speed;
        }
    }
}

function getEffectiveSpeed(value: any, reducedMotion: any) {
    const min = 0;
    const max = 100;
    const throttle = 0.001;
    const parsed = parseInt(value, 10);

    if (parsed <= min || reducedMotion) {
        return min;
    } else if (parsed >= max) {
        return max * throttle;
    } else {
        return parsed * throttle;
    }
}

const VARIANTS = {
    default: {
        activeColor: null,
        gap: 5,
        speed: 35,
        colors: "#f8fafc,#f1f5f9,#cbd5e1",
        noFocus: false
    },
    astro: {
        activeColor: "#ff5d01",
        gap: 6,
        speed: 30,
        colors: "#ff5d01,#ff8a3d,#fffaf0",
        noFocus: false
    },
    tailwind: {
        activeColor: "#38bdf8",
        gap: 5,
        speed: 25,
        colors: "#38bdf8,#0ea5e9,#0369a1",
        noFocus: false
    },
    preact: {
        activeColor: "#673ab8",
        gap: 4,
        speed: 28,
        colors: "#b3a4ff,#673ab8,#2d1e5f",
        noFocus: true
    },
    react: {
        activeColor: "#61dafb",
        gap: 5,
        speed: 35,
        colors: "#b3ecff,#61dafb,#0c87b8",
        noFocus: false
    },
    html: {
        activeColor: "#e34c26",
        gap: 3,
        speed: 20,
        colors: "#f16529,#e34c26,#c13d1b",
        noFocus: false
    },
    css: {
        activeColor: "#264de4",
        gap: 3,
        speed: 20,
        colors: "#264de4,#2965f1,#3c99dc",
        noFocus: false
    },
    js: {
        activeColor: "#f7df1e",
        gap: 4,
        speed: 22,
        colors: "#f7df1e,#ffe033,#e4c700",
        noFocus: false
    },
    ts: {
        activeColor: "#3178c6",
        gap: 4,
        speed: 22,
        colors: "#3178c6,#2c6eb2,#1f487e",
        noFocus: false
    }
};


interface PixelCardProps {
    variant?: string;
    gap?: number;
    speed?: number;
    colors?: string;
    noFocus?: boolean;
    className?: string;
    children: React.ReactNode;
}

interface VariantConfig {
    activeColor: string | null
    gap: number
    speed: number
    colors: string
    noFocus: boolean
}

export default function PixelCard({
    variant = "default",
    gap,
    speed,
    colors,
    noFocus,
    className = "",
    children
 }: PixelCardProps): React.ReactElement {

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pixelsRef = useRef<Pixel[]>([]);
    const animationRef = useRef<any>(null);
    const timePreviousRef = useRef(performance.now());
    const reducedMotion = useRef(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ).current;

    const variantCfg: VariantConfig = VARIANTS[variant as keyof typeof VARIANTS] || VARIANTS.default;
    const finalGap = gap ?? variantCfg.gap;
    const finalSpeed = speed ?? variantCfg.speed;
    const finalColors = colors ?? variantCfg.colors;
    const finalNoFocus = noFocus ?? variantCfg.noFocus;

    const initPixels = () => {
        if (!containerRef.current || !canvasRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);
        const ctx = canvasRef.current.getContext("2d");

        canvasRef.current.width = width;
        canvasRef.current.height = height;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;

        const colorsArray = finalColors.split(",");
        const pxs = [];
        for (let x = 0; x < width; x += parseInt(finalGap.toString(), 10)) {
            for (let y = 0; y < height; y += parseInt(finalGap.toString(), 10)) {
                const color =
                    colorsArray[Math.floor(Math.random() * colorsArray.length)];

                const dx = x - width / 2;
                const dy = y - height / 2;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const delay = reducedMotion ? 0 : distance;
                if(!ctx) return;
                pxs.push(
                    new Pixel(
                        canvasRef.current,
                        ctx,
                        x,
                        y,
                        color,
                        getEffectiveSpeed(finalSpeed, reducedMotion),
                        delay
                    )
                );
            }
        }
        pixelsRef.current = pxs;
    };

    const doAnimate = (fnName: keyof Pixel) => {
        animationRef.current = requestAnimationFrame(() => doAnimate(fnName));
        const timeNow = performance.now();
        const timePassed = timeNow - timePreviousRef.current;
        const timeInterval = 1000 / 60; // ~60 FPS

        if (timePassed < timeInterval) return;
        timePreviousRef.current = timeNow - (timePassed % timeInterval);

        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !canvasRef.current) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        let allIdle = true;
        for (let i = 0; i < pixelsRef.current.length; i++) {
            const pixel = pixelsRef.current[i];
            // @ts-ignore
            pixel[fnName]();
            if (!pixel.isIdle) {
                allIdle = false;
            }
        }
        if (allIdle) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    const handleAnimation = (name: keyof Pixel) => {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(() => doAnimate(name));
    };

    const onMouseEnter = () => handleAnimation("appear");
    const onMouseLeave = () => handleAnimation("disappear");
    const onFocus: React.FocusEventHandler<HTMLDivElement> = (e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        handleAnimation("appear");
    };
    const onBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        handleAnimation("disappear");
    };

    useEffect(() => {
        initPixels();
        const observer = new ResizeObserver(() => {
            initPixels();
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => {
            observer.disconnect();
            cancelAnimationFrame(animationRef.current);
        };
    }, [finalGap, finalSpeed, finalColors, finalNoFocus]);

    return (
        <div
            ref={containerRef}
            className={`h-[180px] w-[180px] relative overflow-hidden grid place-items-center border dark:bg-transparent border-gray-700 hover:border-gray-800 bg-gray-700/10 hover:scale-95 rounded-[15px] isolate transition-colors duration-200 ease-[cubic-bezier(0.5,1,0.89,1)] select-none ${className}`}

            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}

            onFocus={finalNoFocus ? undefined : onFocus}
            onBlur={finalNoFocus ? undefined : onBlur}
            tabIndex={finalNoFocus ? -1 : 0}
        >

<div className="-z-5 absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>

                <pattern id="field-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M0 20H40M20 0V40"
                    stroke="currentColor"
                    stroke-width="0.5"
                    className="text-white "
                  />
                </pattern>
        
                <radialGradient id="fade-gradient" cx="50%" cy="50%" r="75%">
                  <stop offset="0%" stop-color="white" />
                  <stop offset="100%" stop-color="black" />
                </radialGradient>
        
                <mask id="fade-mask">
                  <rect width="100%" height="100%" fill="url(#fade-gradient)" />
                </mask>
              </defs>
        
              <rect width="100%" height="100%" fill="url(#field-pattern)" mask="url(#fade-mask)" />
            </svg>
          </div>

            <canvas
                className="relative w-full h-full block"
                ref={canvasRef}
                />
                <div className="absolute">
                {children}
                </div>
        </div>
    );
}
