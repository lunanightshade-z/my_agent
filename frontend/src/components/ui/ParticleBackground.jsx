/**
 * 粒子背景组件 - 神经网络效果
 * Canvas 绘制，支持交互模式切换
 * 性能优化：
 * - 使用空间分割加速连接线查询
 * - 帧率限制（60fps）
 * - 减少粒子数量
 */
import React, { useEffect, useRef, useMemo } from 'react';
import { colors } from '../../styles/tokens.js';

const ParticleBackground = ({
  isDeepThinking = false,
  intensity = 'medium',
  className = '',
}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const gridRef = useRef(null);

  // 根据模式配置粒子参数（已优化）
  const config = useMemo(() => {
    const intensityMap = {
      light: 20,      // 从40减少到20
      medium: 35,     // 从60减少到35
      heavy: 50,      // 从100减少到50
    };

    return {
      particleCount: intensityMap[intensity],
      connectionDistance: isDeepThinking ? 180 : 130,
      baseSpeed: isDeepThinking ? 0.12 : 0.3,
      particleColor: isDeepThinking
        ? colors.accent.gold // 深度思考模式：金色
        : '#00ffff', // 普通模式：青色（cyan）
      lineColor: isDeepThinking
        ? 'rgba(255, 215, 0, 0.3)'
        : 'rgba(0, 255, 255, 0.2)',
      particleOpacity: isDeepThinking ? 0.6 : 0.4,
      gridSize: 200, // 空间分割网格大小
    };
  }, [isDeepThinking, intensity]);

  // 空间分割网格：加速连接线查询
  const buildGrid = (particles, gridSize, width, height) => {
    const grid = {};
    particles.forEach((particle, index) => {
      const gridX = Math.floor(particle.x / gridSize);
      const gridY = Math.floor(particle.y / gridSize);
      const key = `${gridX},${gridY}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push(index);
    });
    return grid;
  };

  // 获取网格中的邻近粒子
  const getNearbyParticles = (particle, gridSize, grid, width, height) => {
    const gridX = Math.floor(particle.x / gridSize);
    const gridY = Math.floor(particle.y / gridSize);
    const nearby = [];
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${gridX + dx},${gridY + dy}`;
        if (grid[key]) {
          nearby.push(...grid[key]);
        }
      }
    }
    return nearby;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // 设置画布尺寸
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // 初始化粒子
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < config.particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * config.baseSpeed,
          vy: (Math.random() - 0.5) * config.baseSpeed,
          size: Math.random() * 1.2 + 0.5,
          opacity: Math.random() * 0.4 + 0.3,
        });
      }
    };

    // 更新粒子位置
    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 边界反弹
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // 缓慢变化透明度（降低更新频率）
        if (Math.random() > 0.7) {
          particle.opacity += (Math.random() - 0.5) * 0.08;
          particle.opacity = Math.max(0.15, Math.min(0.8, particle.opacity));
        }
      });
    };

    // 使用颜色缓存
    let cachedColor = null;
    let cachedGlowColor = null;

    // 绘制帧
    const draw = () => {
      // 清空画布
      ctx.fillStyle = 'rgba(10, 14, 39, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 构建空间网格
      const grid = buildGrid(particlesRef.current, config.gridSize, canvas.width, canvas.height);

      // 绘制连接线（使用网格加速）
      for (let i = 0; i < particlesRef.current.length; i++) {
        const particle = particlesRef.current[i];
        const nearby = getNearbyParticles(particle, config.gridSize, grid, canvas.width, canvas.height);

        for (const j of nearby) {
          if (i >= j) continue; // 避免重复连接

          const other = particlesRef.current[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distSq = dx * dx + dy * dy;
          const connectionDistSq = config.connectionDistance * config.connectionDistance;

          if (distSq < connectionDistSq) {
            const distance = Math.sqrt(distSq);
            const alpha = (1 - distance / config.connectionDistance) * 0.4;
            ctx.strokeStyle = isDeepThinking
              ? `rgba(255, 215, 0, ${alpha})`
              : `rgba(0, 255, 255, ${alpha * 0.6})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      // 绘制粒子
      const colorStr = String(config.particleColor || '#00ffff');
      const rgbMatch = colorStr.match(/^#(.{6})$/);
      let r, g, b;
      
      if (rgbMatch) {
        const hex = rgbMatch[1];
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else {
        r = g = b = 0;
      }

      particlesRef.current.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`;
        ctx.fill();

        // 简化光晕效果
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.15})`;
        ctx.lineWidth = 0.1;
        ctx.stroke();
      });
    };

    // 帧率限制的动画循环（60fps）
    const FPS = 60;
    const frameDuration = 1000 / FPS;

    const animate = (currentTime) => {
      if (currentTime - lastFrameTimeRef.current >= frameDuration) {
        lastFrameTimeRef.current = currentTime;
        updateParticles();
        draw();
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // 初始化
    window.addEventListener('resize', resize);
    resize();
    initParticles();
    animationFrameRef.current = requestAnimationFrame(animate);

    // 清理
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDeepThinking, config]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-0 pointer-events-none ${className}`}
      style={{
        opacity: 0.8,
      }}
    />
  );
};

export default ParticleBackground;
