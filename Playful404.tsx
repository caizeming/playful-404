'use client'

/**
 * Playful404 — 一个可玩的 404 页面组件
 *
 * 特性：
 * - "404" 数字跟随鼠标做视差位移
 * - 「返回」按钮会躲避鼠标（磁铁相斥），被逼到屏幕边缘时会高频抖动
 * - 支持 prefers-reduced-motion（减少动态效果）
 *
 * 依赖：
 * - motion (framer-motion 的 motion 包)
 * - @fontsource/space-grotesk
 * - Tailwind CSS（使用任意值类名）
 *
 * 在 Next.js 中直接放入 app/not-found.tsx 即可使用。
 */
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'

const spring = { type: 'spring', stiffness: 200, damping: 18 } as const

const digitStyle = {
	fontFamily: "'Space Grotesk', 'Arial', sans-serif",
	fontWeight: 500,
	lineHeight: 0.8
} as const

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const BTN_W = 36 // 「返回」预估宽度
const BTN_H = 30 // 「返回」预估高度

const numSize = 'text-[300px] max-[1023px]:text-[200px] max-[767px]:text-[120px]'

export default function Playful404() {
	// 数字跟随鼠标平移
	const mx = useMotionValue(0)
	const my = useMotionValue(0)
	const sx = useSpring(mx, { stiffness: 220, damping: 24 })
	const sy = useSpring(my, { stiffness: 220, damping: 24 })

	const xFar = useTransform(sx, v => v * 0.4)
	const yFar = useTransform(sy, v => v * 0.4)
	const xNear = useTransform(sx, v => v * 0.35)
	const yNear = useTransform(sy, v => v * 0.35)

	// 「返回」按钮位置（屏幕坐标）
	const bx = useMotionValue(0)
	const by = useMotionValue(0)
	const bxSpring = useSpring(bx, { stiffness: 400, damping: 42 })
	const bySpring = useSpring(by, { stiffness: 400, damping: 42 })
	// 抖动位移：直加显示值，绕过 spring，实现硬抖
	const tremY = useMotionValue(0)
	const reduceMotion = useReducedMotion()

	// 初始定位到数字下方，窗口变化时重置
	useEffect(() => {
		const place = () => {
			bx.set(window.innerWidth / 2 - BTN_W / 2)
			by.set(window.innerHeight * 0.78)
		}
		place()
		window.addEventListener('resize', place)
		return () => window.removeEventListener('resize', place)
	}, [bx, by])

	// 数字跟随 + 按钮磁铁相斥（限制在视口内）
	useEffect(() => {
		if (reduceMotion) return
		const R_FIRST = 120 // 第一次靠近半径小
		const R_AFTER = 500 // 触发一次后一直用大半径
		let armed = false
		let pinned = false
		let trembleTimer: number | null = null

		// 贴边时高速抖动
		const startTremble = () => {
			if (trembleTimer) return
			const loop = () => {
				tremY.set((Math.random() - 0.5) * 2.4)
				trembleTimer = requestAnimationFrame(loop)
			}
			trembleTimer = requestAnimationFrame(loop)
		}
		const stopTremble = () => {
			if (trembleTimer) {
				cancelAnimationFrame(trembleTimer)
				trembleTimer = null
			}
			tremY.set(0)
		}

		const onMove = (e: MouseEvent) => {
			mx.set(e.clientX - window.innerWidth / 2)
			my.set(e.clientY - window.innerHeight / 2)

			const R = armed ? R_AFTER : R_FIRST
			const cx = bx.get() + BTN_W / 2
			const cy = by.get() + BTN_H / 2
			const dx = e.clientX - cx
			const dy = e.clientY - cy
			const dist = Math.hypot(dx, dy)
			if (dist >= R) {
				if (pinned) {
					pinned = false
					stopTremble()
				}
				return
			}
			// 鼠标已贴到按钮中心，跳过本次避免抖动
			if (dist < 8) {
				if (pinned) {
					pinned = false
					stopTremble()
				}
				return
			}
			armed = true
			// 分量死区：某轴接近 0 时锁死该轴
			const ax = Math.abs(dx) < 6 ? 0 : dx
			const ay = Math.abs(dy) < 6 ? 0 : dy
			if (ax === 0 && ay === 0) {
				if (pinned) {
					pinned = false
					stopTremble()
				}
				return
			}
			const d = Math.hypot(ax, ay) || 1
			const push = (1 - d / R) * 4000
			const ux = ax / d
			const uy = ay / d
			const maxX = window.innerWidth - BTN_W - 6
			const maxY = window.innerHeight - BTN_H - 6
			const idealNx = bx.get() - ux * push
			const idealNy = by.get() - uy * push
			const nx = clamp(idealNx, 6, maxX)
			const ny = clamp(idealNy, 6, maxY)
			bx.set(nx)
			by.set(ny)
			// 被边界截断 = 贴边
			const nowPinned = nx !== idealNx || ny !== idealNy
			if (nowPinned && !pinned) {
				pinned = true
				startTremble()
			} else if (!nowPinned && pinned) {
				pinned = false
				stopTremble()
			}
		}
		window.addEventListener('mousemove', onMove)
		// 鼠标离开页面时数字回正
		const onLeave = () => {
			mx.set(0)
			my.set(0)
		}
		document.addEventListener('mouseleave', onLeave)
		return () => {
			window.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseleave', onLeave)
			stopTremble()
		}
	}, [mx, my, bx, by, tremY, reduceMotion])

	return (
		<div className='fixed inset-0 z-[100] flex select-none items-center justify-center overflow-hidden bg-[#F2F0ED]'>
			<div className='relative h-[480px] w-[480px] max-[1023px]:h-[340px] max-[1023px]:w-[340px] max-[767px]:h-[280px] max-[767px]:w-[220px]'>
				{/* 左 4 */}
				<motion.div
					style={{ x: xFar, y: yFar }}
					className='absolute bottom-[240px] left-0 max-[1023px]:bottom-[160px] max-[767px]:bottom-[100px]'>
					<motion.span
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={spring}
						style={digitStyle}
						className={`${numSize} block text-black`}>
						4
					</motion.span>
				</motion.div>

				{/* 右 4 */}
				<motion.div
					style={{ x: xFar, y: yFar }}
					className='absolute bottom-[240px] left-[308px] max-[1023px]:bottom-[160px] max-[1023px]:left-[206px] max-[767px]:bottom-[100px] max-[767px]:left-[124px]'>
					<motion.span
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ ...spring, delay: 0.08 }}
						style={digitStyle}
						className={`${numSize} block text-black`}>
						4
					</motion.span>
				</motion.div>

				{/* 0 */}
				<motion.div
					style={{ x: xNear, y: yNear }}
					className='absolute bottom-0 left-[186px] max-[1023px]:left-[120px] max-[767px]:left-[72px]'>
					<motion.span
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ ...spring, delay: 0.16 }}
						style={digitStyle}
						className={`${numSize} block text-black`}>
						0
					</motion.span>
				</motion.div>
			</div>

			<motion.a
				href='/'
				style={{ x: bxSpring, y: bySpring, position: 'fixed', left: 0, top: 0 }}
				className='cursor-pointer text-lg font-bold text-black transition-opacity hover:opacity-70 focus-visible:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40'>
				<motion.span style={{ y: tremY }} className='inline-block'>
					返回
				</motion.span>
			</motion.a>
		</div>
	)
}