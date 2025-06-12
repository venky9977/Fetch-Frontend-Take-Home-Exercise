// src/components/HeartFireworks.tsx
import React, { useEffect, useState } from 'react'
import { Box, Icon, usePrefersReducedMotion } from '@chakra-ui/react'
import { FaHeart } from 'react-icons/fa'
import { keyframes } from '@emotion/react'

const floatUp = keyframes`
  0% { transform: translateY(0) scale(0.5); opacity: 1; }
  25% { transform: translateY(-20px) scale(0.7); opacity: 0.8; }
  50% { transform: translateY(-50px) scale(0.9); opacity: 0.6; }
  75% { transform: translateY(-80px) scale(1.1); opacity: 0.4; }
  100% { transform: translateY(-120px) scale(1.3); opacity: 0; }
`

interface HeartProps {
  left: number
  size: number
  delay: number
  color: string
}

export default function HeartFireworks() {
  const [hearts, setHearts] = useState<HeartProps[]>([])
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    // Generate 20 hearts with random props
    const newHearts: HeartProps[] = Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,          // percent from left
      size: 16 + Math.random() * 16,      // 16–32px
      delay: Math.random() * 0.8,         // 0–0.8s
      color: ['#ed8936','#dd6b20','#f6ad55','#fbd38d'][Math.floor(Math.random()*4)],
    }))
    setHearts(newHearts)
  }, [prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <Box position="absolute" top={0} left={0} width="100%" height="100%" pointerEvents="none">
      {hearts.map((h, i) => (
        <Icon
          as={FaHeart}
          key={i}
          color={h.color}
          boxSize={`${h.size}px`}
          position="absolute"
          left={`${h.left}%`}
          bottom="0"
          animation={`${floatUp} 1.5s ease-out ${h.delay}s forwards`}
        />
      ))}
    </Box>
  )
}
