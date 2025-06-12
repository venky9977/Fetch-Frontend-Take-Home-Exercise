// src/components/DogPawLoading.tsx
import React from 'react'
import { Box, Text } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

// Define a simple paw‐floating animation
const pawKeyframes = keyframes`
  0%   { transform: translate(0,   0)    scale(1);   opacity: 1; }
  50%  { transform: translate(40px, -60px) scale(1.2); opacity: 0.7; }
  100% { transform: translate(0px, -120px) scale(0.8); opacity: 0; }
`

export default function DogPawLoading() {
  return (
    <Box
      w="100vw"
      h="100vh"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      bg="brand.50"
    >
      <Box position="relative" w="200px" h="200px" mb={4}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Text
            key={i}
            fontSize="4xl"
            position="absolute"
            left={`${Math.random() * 100}%`}
            animation={`${pawKeyframes} 2.5s ease-in-out ${i * 0.4}s infinite`}
          >
            🐾
          </Text>
        ))}
      </Box>
      <Text fontSize="xl" color="brand.700">
        Sniffing out your area…
      </Text>
    </Box>
  )
}
