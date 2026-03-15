// import React, { useState, useEffect, useRef } from 'react';
// import { MousePointer2, Zap } from 'lucide-react';

// /**
//  * CustomCursor Component
//  * Core logic for the cursor movement and hover states.
//  */
// const CustomCursor = () => {
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [isHovering, setIsHovering] = useState(false);
//   const [isClicking, setIsClicking] = useState(false);
//   const [isVisible, setIsVisible] = useState(false);

//   // ✅ Fix: Add proper type to refs
//   const cursorRef = useRef<HTMLDivElement>(null);
//   const followerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const onMouseMove = (e: MouseEvent) => {
//       setPosition({ x: e.clientX, y: e.clientY });
      
//       if (!isVisible) setIsVisible(true);
      
//       // Update Main Dot Position instantly
//       if (cursorRef.current) {
//         cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
//       }

//       // Update Follower Ring Position
//       if (followerRef.current) {
//         followerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
//       }
//     };

//     const onMouseDown = () => setIsClicking(true);
//     const onMouseUp = () => setIsClicking(false);
    
//     // Check for hoverable elements
//     const onMouseOver = (e: MouseEvent) => {
//       const target = e.target as HTMLElement;
//       if (
//         target.tagName.toLowerCase() === 'button' ||
//         target.tagName.toLowerCase() === 'a' ||
//         target.closest('button') || 
//         target.closest('a') ||
//         target.classList.contains('interactive-target')
//       ) {
//         setIsHovering(true);
//       }
//     };

//     const onMouseOut = (e: MouseEvent) => {
//       const target = e.target as HTMLElement;
//       if (
//         target.tagName.toLowerCase() === 'button' ||
//         target.tagName.toLowerCase() === 'a' ||
//         target.closest('button') || 
//         target.closest('a') ||
//         target.classList.contains('interactive-target')
//       ) {
//         setIsHovering(false);
//       }
//     };

//     window.addEventListener('mousemove', onMouseMove);
//     window.addEventListener('mousedown', onMouseDown);
//     window.addEventListener('mouseup', onMouseUp);
//     document.addEventListener('mouseover', onMouseOver);
//     document.addEventListener('mouseout', onMouseOut);

//     return () => {
//       window.removeEventListener('mousemove', onMouseMove);
//       window.removeEventListener('mousedown', onMouseDown);
//       window.removeEventListener('mouseup', onMouseUp);
//       document.removeEventListener('mouseover', onMouseOver);
//       document.removeEventListener('mouseout', onMouseOut);
//     };
//   }, [isVisible]);

//   // Hide on mobile/touch devices
//   if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
//     const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
//     if (isTouch) return null;
//   }

//   return (
//     <>
//       <style>{`
//         body, a, button, input, select, textarea {
//           cursor: none !important;
//         }
//       `}</style>

//       {/* FOLLOWER RING */}
//       <div
//         ref={followerRef}
//         className={`fixed pointer-events-none z-40 rounded-full border border-indigo-500 transition-all duration-300 ease-out will-change-transform
//           ${isVisible ? 'opacity-100' : 'opacity-0'}
//           ${isHovering ? 'h-16 w-16 bg-indigo-500/10 border-indigo-400' : 'h-8 w-8 bg-transparent'}
//           ${isClicking ? 'scale-75' : 'scale-100'}
//         `}
//         style={{
//           left: -16, 
//           top: -16,
//           marginTop: isHovering ? -16 : 0, 
//           marginLeft: isHovering ? -16 : 0,
//         }}
//       />

//       {/* MAIN CURSOR */}
//       <div
//         ref={cursorRef}
//         className={`fixed pointer-events-none z-50 flex items-center justify-center transition-opacity duration-100 will-change-transform
//           ${isVisible ? 'opacity-100' : 'opacity-0'}
//         `}
//         style={{ left: 0, top: 0 }}
//       >
//         {/* Custom Icon/Image with Glow */}
//         <div className={`relative flex items-center justify-center transition-all duration-200 ${isHovering ? 'scale-0' : 'scale-100'}`}>
          
//           {/* Blue Glow Effect - Behind the icon */}
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-400 rounded-full blur-md opacity-60"></div>

//           {/* Icon or Image */}
//           <Zap 
//             size={24} 
//             className="relative z-10 text-white fill-blue-500 drop-shadow-sm"
//             style={{ minWidth: '24px', minHeight: '24px' }} 
//           />
//         </div>

//         {/* Hover Icon */}
//         <div className={`absolute text-indigo-600 transition-all duration-200 ${isHovering ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
//           <MousePointer2 size={24} fill="currentColor" className="opacity-80" />
//         </div>
//       </div>
//     </>
//   );
// };

// export default CustomCursor;


import React, { useState, useEffect, useRef } from 'react';
import Logo from './assests/logo.png'
const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });

  // Smooth lerp animation
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const lerp = 0.12;
      currentPosition.current.x += (targetPosition.current.x - currentPosition.current.x) * lerp;
      currentPosition.current.y += (targetPosition.current.y - currentPosition.current.y) * lerp;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${currentPosition.current.x}px, ${currentPosition.current.y}px, 0)`;
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
      
      if (!isVisible) setIsVisible(true);
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('interactive-target') ||
        target.classList.contains('cursor-hover')
      ) {
        setIsHovering(true);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('interactive-target') ||
        target.classList.contains('cursor-hover')
      ) {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isVisible]);

  // Hide on mobile
  if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return null;
  }

  return (
    <>
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>

      {/* SMOOTH FOLLOWER RING (NO background blur removed) */}
      {/* <div
        ref={followerRef}
        className={`fixed pointer-events-none rounded-full transition-all duration-300 ease-out will-change-transform
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${isHovering ? 'w-14 h-14' : 'w-10 h-10'}
          ${isClicking ? 'scale-75' : 'scale-100'}
        `}
        style={{
          left: -20,
          top: -20,
          marginLeft: isHovering ? -8 : 0,
          marginTop: isHovering ? -8 : 0,
          zIndex: 9998,
          border: isHovering 
            ? '2px solid rgba(251, 191, 36, 0.6)' 
            : '1.5px solid rgba(251, 191, 36, 0.3)',
          boxShadow: isHovering 
            ? '0 0 25px rgba(251, 191, 36, 0.4)'
            : '0 0 15px rgba(251, 191, 36, 0.2)',
        }}
      /> */}

      {/* MAIN CURSOR */}
      <div
        ref={cursorRef}
        className={`fixed pointer-events-none flex items-center justify-center transition-opacity duration-100 will-change-transform
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ left: 0, top: 0, zIndex: 9999 }}
      >
        {/* YOUR CUSTOM ICON/IMAGE (Normal state) */}
        <div 
          className={`absolute transition-all duration-200 ease-out ${isHovering ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
          style={{
            transform: isClicking ? 'scale(0.7)' : 'scale(1)',
          }}
        >
          {/* ✅ REPLACE THIS WITH YOUR ICON/IMAGE */}
          <img 
            src={Logo} 
            alt="cursor"
            className="w-6 h-6"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))',
            }}
          />
          
          {/* OR USE AN ICON COMPONENT */}
          {/* <YourIconComponent 
            size={24} 
            className="text-yellow-400"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))',
            }}
          /> */}
        </div>

        {/* Hover State - Small pointer */}
        <div 
          className={`absolute transition-all duration-200 ease-out ${isHovering ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
          style={{
            transform: isClicking ? 'scale(0.85)' : 'scale(1)',
          }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(36, 161, 251, 0.8))',
            }}
          >
            <path 
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" 
              fill="#FCD34D"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

      </div>
    </>
  );
};

export default CustomCursor;
