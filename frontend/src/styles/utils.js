/**
 * CSS 工具函数
 * 用于类名合并、条件样式等
 */

/**
 * 合并类名 - 简单的cn函数实现
 * 支持条件类名、数组、对象等格式
 */
export function cn(...classes) {
  return classes
    .flat()
    .reduce((acc, val) => {
      if (!val) return acc;
      if (typeof val === 'string') return acc + ' ' + val;
      if (typeof val === 'object') {
        return (
          acc +
          ' ' +
          Object.entries(val)
            .filter(([, active]) => active)
            .map(([key]) => key)
            .join(' ')
        );
      }
      return acc;
    }, '')
    .trim();
}

/**
 * 创建样式对象（用于 CSS-in-JS）
 */
export function createStyles(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = value;
    } else {
      // 处理伪类或媒体查询
      acc[key] = Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
    }
    return acc;
  }, {});
}

/**
 * 生成渐变色
 */
export function gradient(direction, colors) {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
}

/**
 * 生成径向渐变
 */
export function radialGradient(colors, stops) {
  const colorStops = colors
    .map((color, i) => {
      const stop = stops?.[i] ?? `${(i / (colors.length - 1)) * 100}%`;
      return `${color} ${stop}`;
    })
    .join(', ');
  return `radial-gradient(circle, ${colorStops})`;
}

/**
 * 生成投影
 */
export function boxShadow(x, y, blur, spread, color) {
  return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

/**
 * 生成多层投影
 */
export function multiBoxShadow(...shadows) {
  return shadows.join(', ');
}

/**
 * 调整颜色透明度
 */
export function rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 十六进制转RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * RGB转十六进制
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * 条件CSS类名
 */
export function conditionalClass(baseClass, conditions, classMap) {
  let result = baseClass;
  Object.entries(conditions).forEach(([key, active]) => {
    if (active && classMap[key]) {
      result += ' ' + classMap[key];
    }
  });
  return result;
}

/**
 * 响应式类名生成
 */
export function responsiveClass(classes) {
  return cn(classes.mobile, `md:${classes.tablet}`, `lg:${classes.desktop}`, `xl:${classes.wide}`);
}
