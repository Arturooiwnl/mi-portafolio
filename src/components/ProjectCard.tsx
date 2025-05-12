import React, { useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface Tag {
  name: string;
  class: string;
  icon: string; // Changed to accept SVG string
}

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
  image: string;
  title: string;
  tags: Tag[]; // Fixed to use Tag interface
  description: string;
  repo?: string;
  demo?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.25)",
  image,
  title,
  tags,
  description,
  repo,
  demo
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(0.6);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <article
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative border border-transparent hover:border-gray-300/30 transition-all duration-300 w-full max-w-6xl mb-5 mx-auto flex flex-col lg:flex-row gap-6 bg-white/20 dark:bg-gray-900/20 rounded-xl shadow-lg overflow-hidden p-4 sm:p-6 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      
      <div className="relative w-full lg:w-1/2">
        <img
          src={image}
          alt={title}
          className="z-5 w-full h-auto object-cover rounded-lg group-hover:scale-99 transition-all duration-300"
        />
        <img
          src={image}
          alt={title}
          className="-z-2 group-hover:blur-2xl saturate-200 absolute top-0 w-full h-auto object-cover rounded-lg group-hover:scale-99 transition-all duration-300"
        />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${tag.class}`}>
              <div 
                dangerouslySetInnerHTML={{ __html: tag.icon }}
              />
              {tag.name}
            </span>
          ))}
        </div>
        <p className="text-pretty text-gray-800 dark:text-white">{description}</p>

        <footer className="flex flex-wrap gap-2 mt-4">
          {repo && <a href={repo} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition bg-gray-900 text-white rounded-full hover:bg-gray-800">
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            Código
          </a>}
          {demo && <a href={demo} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition bg-gray-900 text-white rounded-full hover:bg-gray-800">
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Preview
          </a>}
        </footer>
      </div>
    </article>
  );
};

export default SpotlightCard;