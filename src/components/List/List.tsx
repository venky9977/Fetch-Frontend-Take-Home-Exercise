// src/components/List/List.tsx
import React, { useEffect, createRef, useState } from 'react'
import {
  VStack,
  Box,
  Image,
  Text,
  Spinner,
  Button,
  HStack,
} from '@chakra-ui/react'
import type { Dog, Location } from '../../api/dogs'

interface ListProps {
  dogs: Dog[]
  locations: Record<string, Location>
  loading: boolean
  favorites: Set<string>
  toggleFav: (id: string) => void
  childClicked: string | null
}

export default function List({
  dogs,
  locations,
  loading,
  favorites,
  toggleFav,
  childClicked,
}: ListProps) {
  const [elRefs, setElRefs] = useState<React.RefObject<HTMLDivElement>[]>([])

  useEffect(() => {
    setElRefs((refs) =>
      dogs.map((_, i) => refs[i] || createRef<HTMLDivElement>())
    )
  }, [dogs])

  useEffect(() => {
    if (!childClicked) return
    const idx = dogs.findIndex((d) => d.id === childClicked)
    if (idx >= 0 && elRefs[idx]?.current) {
      elRefs[idx]!.current!.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [childClicked, dogs, elRefs])

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    )
  }
  if (dogs.length === 0) {
    return (
      <Text textAlign="center" mt={10}>
        No pups found in this area 🐶
      </Text>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      {dogs.map((dog, i) => {
        const loc = locations[dog.zip_code]
        return (
          <Box
            key={dog.id}
            ref={elRefs[i]}
            boxShadow="sm"
            borderRadius="md"
            overflow="hidden"
            bg="gray.50"
          >
            <Image
              src={dog.img}
              alt={dog.name}
              objectFit="cover"
              w="100%"
              h="200px"             /* increased height */
            />
            <Box p={3}>
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                  {dog.name}
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFav(dog.id)}
                >
                  {favorites.has(dog.id) ? '💖' : '🤍'}
                </Button>
              </HStack>
              <Text fontSize="sm">Breed: {dog.breed}</Text>
              <Text fontSize="sm">Age: {dog.age}</Text>
              {loc && (
                <Box mt={2} fontSize="sm" lineHeight="1.3">
                  <Text>City: {loc.city}</Text>
                  <Text>State: {loc.state}</Text>
                  <Text>County: {loc.county}</Text>
                  <Text>Zipcode: {loc.zip_code}</Text>
                </Box>
              )}
            </Box>
          </Box>
        )
      })}
    </VStack>
  )
}
