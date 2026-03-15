import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

const codeSymbols = ['0', '1', '10', '01', '101', '110', '001', '1001', '0101', '0000', '1111'];

const CodingBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const elements = containerRef.current.querySelectorAll('.code-symbol');

        elements.forEach((el, i) => {
            // Anime.js random float animation
            anime({
                targets: el,
                translateY: [anime.random(0, 100), anime.random(-1000, -200)],
                translateX: [anime.random(-50, 50), anime.random(-100, 100)],
                opacity: [0, { value: anime.random(0.05, 0.15), duration: 2000 }, { value: 0, duration: 2000 }],
                scale: [0.5, anime.random(0.8, 1.2)],
                rotate: [0, anime.random(-90, 90)],
                duration: anime.random(10000, 20000),
                delay: anime.random(0, 10000) + i * 100,
                loop: true,
                easing: 'linear',
            });
        });

        // Cleanup function for hot-reloads
        return () => {
            anime.remove(elements);
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]"
            style={{ 
                // We use CSS variables so the symbols instantly change color upon theme toggle without React rerender
                color: 'var(--theme-primary, #3b82f6)' 
            }}
        >
            {Array.from({ length: 45 }).map((_, i) => (
                <div
                    key={i}
                    className="code-symbol absolute font-mono font-bold whitespace-nowrap"
                    style={{
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                        fontSize: Math.random() * 1.5 + 0.8 + 'rem',
                        opacity: 0,
                        willChange: 'transform, opacity'
                    }}
                >
                    {codeSymbols[Math.floor(Math.random() * codeSymbols.length)]}
                </div>
            ))}
        </div>
    );
};

export default CodingBackground;
