// src/pages/LandingPage.tsx
import React, { useEffect } from 'react'
import { Box, Center, Heading, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { keyframes } from '@emotion/react'
import { FaPaw } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

// rainbow-gradient background animation
const gradientShift = keyframes`
  0%   { background-position: 0% 50% }
  50%  { background-position: 100% 50% }
  100% { background-position: 0% 50% }
`

// drifting paw-print animation
const fall = keyframes`
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 0 }
  10% { opacity: 0.6 }
  100% { transform: translateY(110vh) rotate(360deg); opacity: 0 }
`

// PawRain: randomly drifting 🐾 behind content
const PawRain: React.FC = () => {
  const paws = Array.from({ length: 15 })
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      pointerEvents="none"
      zIndex={0}
    >
      {paws.map((_, i) => {
        const delay = Math.random() * -20
        const duration = 8 + Math.random() * 6
        const left = Math.random() * 100
        const size = 20 + Math.random() * 30
        return (
          <Box
            key={i}
            as="span"
            position="absolute"
            fontSize={`${size}px`}
            opacity={0.5}
            left={`${left}%`}
            animation={`${fall} ${duration}s linear infinite`}
            sx={{ animationDelay: `${delay}s` }}
          >
            🐾
          </Box>
        )
      })}
    </Box>
  )
}

const MotionPaw = motion(FaPaw)

export default function LandingPage() {
  const navigate = useNavigate()

  // after 4s, go to /login
  useEffect(() => {
    const t = setTimeout(() => navigate('/login', { replace: true }), 4000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <Box
      w="100vw"
      h="100vh"
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-r, #FF9A9E, #FAD0C4, #FFD1FF, #FDEB71)"
      bgSize="400% 400%"
      animation={`${gradientShift} 12s ease infinite`}
    >
      <PawRain />

      <Center
        position="relative"
        zIndex={1}
        w="100%"
        h="100%"
        flexDir="column"
        textAlign="center"
        color="gray.800"
        px={4}
      >
        <MotionPaw
          size={100}
          color="#FF6B6B"
          animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Heading mt={6} fontSize={{ base: '3xl', md: '5xl' }}>
            Hang tight…
          </Heading>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <Text mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            You’re about to find your&nbsp;
            <Text as="span" fontWeight="bold" color="#FF6B6B">
              paw-fect match
            </Text>
            &nbsp;soon!
          </Text>
          <Text mt={1} color="gray.600">
            Fetching your furry friend…
          </Text>
        </motion.div>
      </Center>
    </Box>
  )
}
