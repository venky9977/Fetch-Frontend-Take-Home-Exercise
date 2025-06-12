// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

// rainbow‐gradient background animation
const gradientShift = keyframes`
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
`

// falling paw‐print animation
const fall = keyframes`
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0;
  }
`

// renders a handful of drifting 🐾
const PawRain: React.FC = () => {
  const paws = Array.from({ length: 12 })
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
        const duration = 6 + Math.random() * 6
        const left = Math.random() * 100
        const size = 24 + Math.random() * 24
        return (
          <Box
            key={i}
            as="span"
            position="absolute"
            fontSize={`${size}px`}
            opacity={0.6}
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

export default function LoginPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/auth/login', { name, email })
      navigate('/search')
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err.response?.data || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  return (
    <Box
      w="100vw"
      minH="100vh"
      position="relative"
      bgGradient="linear(to-r, #FF9A9E, #FAD0C4, #FFD1FF)"
      bgSize="400% 400%"
      animation={`${gradientShift} 12s ease infinite`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <PawRain />

      <Box
        position="relative"
        zIndex={1}
        w="full"
        maxW="md"
        bg="whiteAlpha.900"
        p={8}
        boxShadow="2xl"
        borderRadius="xl"
      >
        <Heading mb={6} textAlign="center" color="gray.700">
          🐶 Fetch Shelter Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                focusBorderColor="brand.500"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                focusBorderColor="brand.500"
              />
            </FormControl>
            <Button
              colorScheme="brand"
              type="submit"
              width="full"
              isDisabled={!name || !email}
            >
              Log In
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  )
}
