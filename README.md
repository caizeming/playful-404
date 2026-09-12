# playful-404

一个可玩的 404 页面组件 —— 「404」数字会跟随鼠标做视差位移，而「返回」按钮则会躲着你的鼠标跑，被逼到屏幕边缘时还会气得发抖。

A playful 404 page component — the "404" digits follow your cursor with a parallax effect, while the "返回 (Go back)" button runs away from your cursor and trembles when cornered at the screen edge.

## 特性 / Features

- ✨ 「404」数字随鼠标做分层视差位移
- 🏃 「返回」按钮带「磁铁相斥」效果：鼠标靠近会自动躲开，并约束在视口内
- 😤 被逼到屏幕边缘时按钮会高频抖动
- ♿ 自动遵循 `prefers-reduced-motion`，减少动态效果
- 📱 响应式，适配移动端

## 依赖 / Dependencies

- [motion](https://motion.dev/)（即 framer-motion 的 `motion` 包）
- [@fontsource/space-grotesk](https://www.npmjs.com/package/@fontsource/space-grotesk)
- [Tailwind CSS](https://tailwindcss.com/)（用到了任意值类名）

```bash
npm install motion @fontsource/space-grotesk
```

## 使用 / Usage

### Next.js（最简）

把 `Playful404.tsx` 放到你的 `app/` 目录，然后在 `app/not-found.tsx` 里导出它：

```tsx
// app/not-found.tsx
export { default } from './Playful404'
```

> 注意：`Playful404.tsx` 开头有 `'use client'` 指令，因为它依赖浏览器的鼠标事件。

### 其他 React 项目

直接引入并渲染即可：

```tsx
import Playful404 from './Playful404'

export default function App() {
  return <Playful404 />
}
```

## 效果预览

- 背景色：`#F2F0ED`
- 数字字体：Space Grotesk（400 / 500）

## License

[MIT](./LICENSE)