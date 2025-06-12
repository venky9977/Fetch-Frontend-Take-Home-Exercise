// src/pages/LocationSearchPage.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  HStack,
  Button,
  Grid,
  useToast,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Image as ChakraImage,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

import Map from '../components/Map/Map'
import List from '../components/List/List'
import HeartFireworks from '../components/HeartFireworks'
import DogPawLoading from '../components/DogPawLoading'

import {
  searchDogs,
  fetchDogDetails,
  fetchLocations,
  generateMatch,
} from '../api/dogs'
import type { Dog, Location } from '../api/dogs'

export default function LocationSearchPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Initial loading (geolocation)
  const [initialLoading, setInitialLoading] = useState(true)
  const [coords, setCoords] = useState({ lat: 39.5, lng: -98.35 })

  // Bounds & data
  const [bounds, setBounds] = useState<{
    ne: { lat: number; lng: number }
    sw: { lat: number; lng: number }
  } | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [dogs, setDogs] = useState<Dog[]>([])
  const [locations, setLocations] = useState<Record<string, Location>>({})
  const [childClicked, setChildClicked] = useState<string | null>(null)

  // Favorites & match
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null)

  // ask for geolocation once
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude })
        setInitialLoading(false)
      },
      () => {
        toast({ title: 'Location permission denied', status: 'warning' })
        setInitialLoading(false)
      }
    )
  }, [toast])

  // fetch dogs whenever bounds changes
  useEffect(() => {
    if (!bounds) return
    setLoadingData(true)
    ;(async () => {
      try {
        // 1) fetch zips in bounds
        const zipRes = await fetch('/api/locations/search', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            geoBoundingBox: {
              bottom_left: { lat: bounds.sw.lat, lon: bounds.sw.lng },
              top_right: { lat: bounds.ne.lat, lon: bounds.ne.lng },
            },
            size: 10000,
          }),
        })
        const { results } = await zipRes.json()
        const zips: string[] = results.map((l: Location) => l.zip_code)
        if (!zips.length) {
          setDogs([])
          setLocations({})
          return
        }
        // 2) get matching dog IDs
        const searchRes = await searchDogs({ size: 50, sort: 'breed:asc', zipCodes: zips })
        const ids = searchRes.data.resultIds
        if (!ids.length) {
          setDogs([])
          setLocations({})
          return
        }
        // 3) fetch full dog objects + their location metadata
        const det = await fetchDogDetails(ids).then(r => r.data)
        setDogs(det)
        const uniqueZips = Array.from(new Set(det.map(d => d.zip_code)))
        const locArr = await fetchLocations(uniqueZips).then(r => r.data)
        const locMap: Record<string, Location> = {}
        locArr.forEach(l => (locMap[l.zip_code] = l))
        setLocations(locMap)
      } catch {
        toast({ title: 'Failed to load nearby dogs', status: 'error' })
      } finally {
        setLoadingData(false)
      }
    })()
  }, [bounds, toast])

  // favorites
  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const nxt = new Set(prev)
      nxt.has(id) ? nxt.delete(id) : nxt.add(id)
      return nxt
    })
  }

  // match
  const doMatch = async () => {
    if (!favorites.size) return
    try {
      const { data } = await generateMatch(Array.from(favorites))
      const md = await fetchDogDetails([data.match]).then(r => r.data[0])
      setMatchedDog(md)
      onOpen()
    } catch {
      toast({ title: 'Match failed', status: 'error' })
    }
  }

  const clearFavorites = () => setFavorites(new Set())

  // still waiting for geolocation?
  if (initialLoading) {
    return <DogPawLoading />
  }

  return (
    <Box w="100vw" minH="100vh" p={4} bg="brand.50">
      <Button
        leftIcon={<FaArrowLeft />}
        mb={4}
        onClick={() => navigate('/search')}
        variant="outline"
        colorScheme="brand"
        _hover={{ bg: 'brand.600', color: 'white' }}
      >
        Back to Search
      </Button>

      <Heading mb={4} color="brand.700">
        Sniff out pups near you!
      </Heading>

      <HStack spacing={3} mb={4} wrap="wrap">
        <Button colorScheme="brand" onClick={doMatch} isDisabled={!favorites.size}>
          Match ({favorites.size})
        </Button>
        <Button
          variant="outline"
          colorScheme="brand"
          onClick={clearFavorites}
          isDisabled={!favorites.size}
          _hover={{ bg: 'brand.600', color: 'white' }}
        >
          Clear Favorites
        </Button>
      </HStack>

      <Grid
        templateColumns={{ base: '1fr', md: '1fr 2fr' }}
        gap={4}
      >
        {/*
          On mobile (base) we show the map first with a fixed height,
          then list below. On md+, map/list are side-by-side and full height.
        */}
        <Box
          order={{ base: 1, md: 2 }}
          h={{ base: '300px', md: 'calc(100vh - 200px)' }}
          borderRadius="md"
          overflow="hidden"
        >
          <Map
            center={coords}
            places={dogs.map(d => ({
              dog: d,
              lat: locations[d.zip_code]?.latitude ?? coords.lat,
              lng: locations[d.zip_code]?.longitude ?? coords.lng,
            }))}
            onChange={({ ne, sw }) => setBounds({ ne, sw })}
            onChildClick={id => setChildClicked(id as string)}
          />
        </Box>

        <Box
          order={{ base: 2, md: 1 }}
          bg="white"
          p={3}
          borderRadius="md"
          overflowY="auto"
          h={{ base: 'auto', md: 'calc(100vh - 200px)' }}
        >
          {loadingData ? (
            <Center h="100%"><Spinner size="lg" /></Center>
          ) : (
            <List
              dogs={dogs}
              locations={locations}
              loading={loadingData}
              favorites={favorites}
              toggleFav={toggleFav}
              childClicked={childClicked}
            />
          )}
        </Box>
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent position="relative" bg="brand.50">
          {isOpen && <HeartFireworks />}
          <ModalHeader>Meet Your Fur-ever Friend!</ModalHeader>
          <ModalCloseButton />
          <ModalBody textAlign="center" pb={6}>
            {matchedDog && (
              <VStack spacing={4}>
                <ChakraImage
                  src={matchedDog.img}
                  alt={matchedDog.name}
                  borderRadius="md"
                  maxH="250px"
                />
                <Text fontSize="xl" fontWeight="bold">
                  {matchedDog.name}
                </Text>
                <Text>Breed: {matchedDog.breed}</Text>
                <Text>Age: {matchedDog.age}</Text>
                <Text>City: {locations[matchedDog.zip_code]?.city}</Text>
                <Text>State: {locations[matchedDog.zip_code]?.state}</Text>
                <Text>County: {locations[matchedDog.zip_code]?.county}</Text>
                <Text>Zipcode: {matchedDog.zip_code}</Text>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
