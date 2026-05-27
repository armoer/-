/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Weather } from '../types';

interface WeatherCanvasProps {
  weather: Weather | null;
}

export const WeatherCanvas: React.FC<WeatherCanvasProps> = ({ weather }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 200);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Particle Classes inside Weather Canvas
    class RainDrop {
      x: number;
      y: number;
      speed: number;
      length: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height;
        this.speed = 4 + Math.random() * 5;
        this.length = 6 + Math.random() * 8;
      }

      update() {
        this.y += this.speed;
        this.x += 1; // drift right
        if (this.y > height) {
          this.y = Math.random() * -20;
          this.x = Math.random() * width;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.fillStyle = '#60a5fa'; // Blue-400
        c.fillRect(this.x, this.y, 2, this.length);
      }
    }

    class SnowFlake {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = 3 + Math.floor(Math.random() * 3); // square pixels
        this.speedY = 1 + Math.random() * 2;
        this.speedX = -1.5 + Math.random() * 1;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y > height) {
          this.y = -10;
          this.x = Math.random() * width;
        }
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
      }

      draw(c: CanvasRenderingContext2D) {
        c.fillStyle = '#ffffff';
        c.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
      }
    }

    class WindLine {
      x: number;
      y: number;
      length: number;
      speed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.length = 40 + Math.random() * 60;
        this.speed = 8 + Math.random() * 6;
      }

      update() {
        this.x -= this.speed;
        if (this.x + this.length < 0) {
          this.x = width + 20;
          this.y = Math.random() * height;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.fillStyle = 'rgba(255, 255, 255, 0.15)';
        c.fillRect(this.x, this.y, this.length, 2);
      }
    }

    // Initialize particles
    const rainDrops: RainDrop[] = Array.from({ length: 60 }, () => new RainDrop());
    const snowFlakes: SnowFlake[] = Array.from({ length: 45 }, () => new SnowFlake());
    const windLines: WindLine[] = Array.from({ length: 12 }, () => new WindLine());
    let sunAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const type = weather?.name;

      if (type === '大晴天') {
        // Drawing rotating sunbeams (retro yellow lines)
        ctx.save();
        ctx.translate(width / 2, -20);
        sunAngle += 0.004;

        ctx.fillStyle = 'rgba(234, 179, 8, 0.04)';
        ctx.beginPath();
        ctx.arc(0, 0, 160, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 12; i++) {
          const angle = sunAngle + (i * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle - 0.1) * 600, Math.sin(angle - 0.1) * 600);
          ctx.lineTo(Math.cos(angle + 0.1) * 600, Math.sin(angle + 0.1) * 600);
          ctx.closePath();
          ctx.fillStyle = 'rgba(253, 224, 71, 0.06)';
          ctx.fill();
        }
        ctx.restore();
      } else if (type === '雨天') {
        // Draw rain
        rainDrops.forEach((drop) => {
          drop.update();
          drop.draw(ctx);
        });
      } else if (type === '暴风雪') {
        // Draw snow
        snowFlakes.forEach((flake) => {
          flake.update();
          flake.draw(ctx);
        });
      } else if (type === '台风') {
        // Draw heavy swirling gale wind lines and stormy tint
        ctx.fillStyle = 'rgba(16, 12, 28, 0.1)';
        ctx.fillRect(0, 0, width, height);

        windLines.forEach((line) => {
          line.update();
          line.draw(ctx);
        });

        // Add some flying debris "leaves"
        ctx.fillStyle = '#854d0e'; // dark yellow wood debris
        for (let i = 0; i < 4; i++) {
          const rx = (Math.random() * width) % width;
          const ry = (Math.random() * height) % height;
          ctx.fillRect(rx, ry, 6, 4);
        }
      } else if (type === '阴天') {
        // Draw thick grey moving pixel cloud bands
        ctx.fillStyle = 'rgba(100, 116, 139, 0.08)';
        for (let i = 0; i < 4; i++) {
          const ox = (Date.now() / 80 + i * 200) % (width + 300) - 200;
          ctx.fillRect(ox, 20 + i * 25, 240, 30);
          ctx.fillRect(ox + 40, 15 + i * 25, 160, 40);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [weather]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      id="weather-particles-canvas"
    />
  );
};
