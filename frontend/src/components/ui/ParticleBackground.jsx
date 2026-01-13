/**
 * 粒子背景组件 - 神经网络效果
 * Canvas 绘制，支持交互模式切换
 */
import React, { useEffect, useRef, useMemo } from 'react';
import { colors } from '../../styles/tokens.js';



const ParticleBackground= ({
  isDeepThinking = false,
  intensity = 'medium',
  className = '',
}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  // 根据模式配置粒子参数
  const config = useMemo(() => {
    const intensityMap = {
      light: 40,
      medium: 60,
      heavy: 100,
    };

    return {
      particleCount: intensityMap[intensity],
      connectionDistance: isDeepThinking ? 200 : 150,
      baseSpeed: isDeepThinking ? 0.15 : 0.35,
      particleColor: isDeepThinking
        ? colors.accent.gold // 深度思考模式：金色
        : '#00ffff', // 普通模式：青色（cyan）
      lineColor: isDeepThinking
        ? 'rgba(255, 215, 0, 0.3)'
        : 'rgba(0, 255, 255, 0.2)',
      particleOpacity: isDeepThinking ? 0.6 : 0.4,
    };
  }, [isDeepThinking, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
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
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
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

        // 缓慢变化透明度
        particle.opacity += (Math.random() - 0.5) * 0.05;
        particle.opacity = Math.max(0.1, Math.min(1, particle.opacity));
      });
    };

    // 绘制帧
    const draw = () => {
      // 清空画布（保留轨迹痕迹）
      ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制连接线
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.connectionDistance) {
            const alpha = 1 - distance / config.connectionDistance;
            ctx.strokeStyle = isDeepThinking
              ? `rgba(255, 215, 0, ${alpha * 0.3})`
              : `rgba(0, 255, 255, ${alpha * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
          }
        }
      }

      // 绘制粒子
      particlesRef.current.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // 安全处理颜色值，确保 particleColor 是字符串
        const colorStr = String(config.particleColor || '#00ffff');
        const rgbMatch = colorStr.match(/^#(.{6})$/);
        if (rgbMatch) {
          const hex = rgbMatch[1];
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`;
        } else {
          ctx.fillStyle = colorStr;
        }
        ctx.fill();

        // 粒子光晕
        ctx.strokeStyle = `rgba(0, 255, 255, ${particle.opacity * 0.3})`;
        ctx.lineWidth = 0.2;
        ctx.stroke();
      });
    };

    // 动画循环
    const animate = () => {
      updateParticles();
      draw();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // 初始化
    window.addEventListener('resize', resize);
    resize();
    initParticles();
    animate();

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
