// src/pages/SearchPage.tsx
import { useState, useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  HStack,
  Heading,
  Stack,
  Select,
  Button,
  Grid,
  Image,
  Text,
  Spinner,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'
import { TbMapSearch } from 'react-icons/tb'
import {
  fetchBreeds,
  searchDogs,
  fetchDogDetails,
  fetchLocations,
  generateMatch,
} from '../api/dogs'
import type { Dog, Location } from '../api/dogs'
import HeartFireworks from '../components/HeartFireworks'

export default function SearchPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // --- Error handler ---
  function handleError(err: any) {
    if (err.response) {
      const status = err.response.status
      if (status === 401) {
        navigate('/login', { replace: true })
      } else if (status >= 500) {
        toast({ title: 'Server error', description: 'Something went wrong.', status: 'error' })
      } else {
        console.warn('Client error', status, err.response.data)
      }
    } else {
      console.warn('Network error', err)
    }
  }

  // --- Filters & sort ---
  const [breeds, setBreeds] = useState<string[]>([])
  const [breed, setBreed] = useState('')
  // immediate inputs
  const [ageMinInput, setAgeMinInput] = useState<number|undefined>()
  const [ageMaxInput, setAgeMaxInput] = useState<number|undefined>()
  // debounced values
  const [ageMin, setAgeMin] = useState<number|undefined>()
  const [ageMax, setAgeMax] = useState<number|undefined>()

  const [sortField, setSortField] = useState<'breed'|'name'>('breed')
  const [sortAsc, setSortAsc] = useState(true)

  // --- Pagination & data ---
  const [offset, setOffset] = useState(0)
  const [dogs, setDogs] = useState<Dog[]>([])
  const [locations, setLocations] = useState<Record<string,Location>>({})
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [nextCursor, setNextCursor] = useState<string|null>(null)
  const [prevCursor, setPrevCursor] = useState<string|null>(null)

  // --- Favorites & match ---
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [matchedDog, setMatchedDog] = useState<Dog|null>(null)

  // load breeds once
  useEffect(() => {
    fetchBreeds().then(r => setBreeds(r.data)).catch(handleError)
  }, [])

  // debounce ageMinInput → ageMin
  useEffect(() => {
    const h = setTimeout(() => setAgeMin(ageMinInput), 500)
    return () => clearTimeout(h)
  }, [ageMinInput])

  // debounce ageMaxInput → ageMax
  useEffect(() => {
    const h = setTimeout(() => setAgeMax(ageMaxInput), 500)
    return () => clearTimeout(h)
  }, [ageMaxInput])

  // reload whenever any actual filter/sort changes
  useEffect(() => {
    loadPage()
  }, [breed, ageMin, ageMax, sortField, sortAsc])

  // core search function
  async function loadPage(cursor?:string|null) {
    setLoading(true)
    try {
      const params:Record<string,any> = {
        size:12,
        sort:`${sortField}:${sortAsc?'asc':'desc'}`,
      }
      if (breed) params.breeds = [breed]
      if (ageMin != null) params.ageMin = ageMin
      if (ageMax != null) params.ageMax = ageMax

      const res = await searchDogs(params, cursor ? formatCursor(cursor) : undefined)
      const { resultIds, total: tot, next, prev } = res.data
      setTotal(tot)
      setNextCursor(next)
      setPrevCursor(prev)
      setOffset(cursor ? extractOffset(cursor) : 0)

      if (resultIds.length) {
        const det = await fetchDogDetails(resultIds).then(r => r.data)
        setDogs(det)
        const zips = Array.from(new Set(det.map(d=>d.zip_code)))
        const locs = await fetchLocations(zips).then(r=>r.data)
        const map:Record<string,Location> = {}
        locs.forEach(l=>map[l.zip_code]=l)
        setLocations(map)
      } else {
        setDogs([])
        setLocations({})
      }
    } catch(err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  // cursor helpers
  function formatCursor(c:string) {
    const i = c.indexOf('?'); return i>=0?c.substring(i):c
  }
  function extractOffset(c:string) {
    const q = formatCursor(c)
    const p = new URLSearchParams(q)
    return parseInt(p.get('from')||'0',10)
  }

  // toggle favorite
  const toggleFav = (id:string) =>
    setFavorites(prev => {
      const nxt = new Set(prev)
      nxt.has(id) ? nxt.delete(id) : nxt.add(id)
      return nxt
    })

  // generate match
  const doMatch = async () => {
    if (!favorites.size) return
    try {
      const { data } = await generateMatch(Array.from(favorites))
      const dog = await fetchDogDetails([data.match]).then(r=>r.data[0])
      setMatchedDog(dog)
      onOpen()
    } catch(err) {
      handleError(err)
    }
  }

  // clear filters
  const clearFilters = () => {
    setBreed('')
    setAgeMinInput(undefined)
    setAgeMaxInput(undefined)
    setSortField('breed')
    setSortAsc(true)
    setNextCursor(null)
    setPrevCursor(null)
    setOffset(0)
    loadPage()
  }
  // clear favorites
  const clearFavorites = () => setFavorites(new Set())

  return (
    <Box w="100vw" minH="100vh" p={4} bg="brand.50">
      {/* Responsive header */}
      <Stack
        direction={{ base:'column', md:'row' }}
        align={{ base:'center', md:'flex-start' }}
        justify={{ base:'center', md:'space-between' }}
        spacing={4} mb={6}
      >
        <Heading
          color="brand.700"
          textAlign={{ base:'center', md:'left' }}
          size="lg"
        >
          Ready to Paw-ty? 🐾 Find Your Furry BFF!
        </Heading>

        <Button
          as={RouterLink}
          to="/location-search"
          colorScheme="brand"
          variant="outline"
          w={{ base:'100%', md:'auto' }}
          maxW="xs"
          _hover={{ bg:'brand.600', color:'white' }}
        >
          🗺️ CLICK to Map Your Pup Match!
        </Button>
      </Stack>

      {/* Filters */}
      <Stack direction={{ base:'column', md:'row' }} spacing={4} mb={6}>
        <Select
          placeholder="Breed"
          value={breed}
          onChange={e=>setBreed(e.target.value)}
          maxW="200px"
          bg="white"
        >
          {breeds.map(b=>(
            <option key={b} value={b}>{b}</option>
          ))}
        </Select>

        <NumberInput
          value={ageMinInput ?? ''}
          min={0}
          onChange={(_, v)=> setAgeMinInput(Number.isNaN(v)?undefined:v)}
          maxW="120px"
        >
          <NumberInputField placeholder="Min age" bg="white"/>
          <NumberInputStepper>
            <NumberIncrementStepper/>
            <NumberDecrementStepper/>
          </NumberInputStepper>
        </NumberInput>

        <NumberInput
          value={ageMaxInput ?? ''}
          min={0}
          onChange={(_, v)=> setAgeMaxInput(Number.isNaN(v)?undefined:v)}
          maxW="120px"
        >
          <NumberInputField placeholder="Max age" bg="white"/>
          <NumberInputStepper>
            <NumberIncrementStepper/>
            <NumberDecrementStepper/>
          </NumberInputStepper>
        </NumberInput>

        <Button
          bg="brand.500"
          color="white"
          _hover={{ bg:'brand.600' }}
          onClick={()=>{
            if(sortField==='breed') setSortAsc(a=>!a)
            else { setSortField('breed'); setSortAsc(true) }
          }}
          leftIcon={
            sortField==='breed'
              ? (sortAsc? <FaSortAlphaDown/> : <FaSortAlphaUp/>)
              : <FaSortAlphaDown/>
          }
        >
          Breed {sortField==='breed'?(sortAsc?'A→Z':'Z→A'):''}
        </Button>

        <Button
          bg="brand.500"
          color="white"
          _hover={{ bg:'brand.600' }}
          onClick={()=>{
            if(sortField==='name') setSortAsc(a=>!a)
            else { setSortField('name'); setSortAsc(true) }
          }}
          leftIcon={
            sortField==='name'
              ? (sortAsc? <FaSortAlphaDown/> : <FaSortAlphaUp/>)
              : <FaSortAlphaDown/>
          }
        >
          Name {sortField==='name'?(sortAsc?'A→Z':'Z→A'):''}
        </Button>

        <Button colorScheme="brand" onClick={()=>loadPage()}>
          Search
        </Button>
        <Button
          variant="outline"
          colorScheme="brand"
          onClick={clearFilters}
          _hover={{ bg:'brand.600', color:'white' }}
        >
          Clear Filters
        </Button>
        <Button colorScheme="brand" onClick={doMatch} isDisabled={!favorites.size}>
          Match ({favorites.size})
        </Button>
        <Button
          variant="outline"
          colorScheme="pink"
          onClick={clearFavorites}
          isDisabled={!favorites.size}
          _hover={{ bg:'pink.600', color:'white' }}
        >
          Clear Favorites
        </Button>
      </Stack>

      {/* Results */}
      {loading
        ? <Box textAlign="center"><Spinner size="xl"/></Box>
        : dogs.length===0
          ? <Text textAlign="center" mt={10}>Sorry, no furry matches found! 🐾</Text>
          : <>
              <Grid templateColumns={{ base:'repeat(2,1fr)', md:'repeat(4,1fr)' }} gap={6}>
                {dogs.map(dog=>{
                  const loc = locations[dog.zip_code]
                  return (
                    <Box key={dog.id} boxShadow="md" borderRadius="md" overflow="hidden" bg="white">
                      <Image src={dog.img} alt={dog.name} w="100%" h="400px" objectFit="cover"/>
                      <VStack align="start" p={4} spacing={1}>
                        <HStack justify="space-between" w="100%">
                          <Text fontWeight="bold">{dog.name}</Text>
                          <Button size="sm" variant="ghost" onClick={()=>toggleFav(dog.id)}>
                            {favorites.has(dog.id)?'💖':'🤍'}
                          </Button>
                        </HStack>
                        <Text>Breed: {dog.breed}</Text>
                        <Text>Age: {dog.age}</Text>
                        {loc && (
                          <VStack align="start" spacing={0} pt={2}>
                            <Text>City: {loc.city}</Text>
                            <Text>State: {loc.state}</Text>
                            <Text>County: {loc.county}</Text>
                            <Text>Zipcode: {loc.zip_code}</Text>
                          </VStack>
                        )}
                      </VStack>
                    </Box>
                  )
                })}
              </Grid>

              <Text textAlign="center" mt={4} color="brand.700">
                Showing {offset+1}-{offset+dogs.length} of {total} results
              </Text>
              <HStack justify="center" mt={4} spacing={4}>
                <Button onClick={()=>prevCursor&&loadPage(prevCursor)} isDisabled={offset===0}>
                  Previous
                </Button>
                <Button onClick={()=>nextCursor&&loadPage(nextCursor)} isDisabled={offset+dogs.length>=total}>
                  Next
                </Button>
              </HStack>
            </>}

      {/* Match modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay/>
        <ModalContent position="relative" bg="brand.50">
          {isOpen && <HeartFireworks/>}
          <ModalHeader>Meet Your Fur-ever Friend!</ModalHeader>
          <ModalCloseButton/>
          <ModalBody textAlign="center" pb={6}>
            {matchedDog && (
              <VStack spacing={4}>
                <Image src={matchedDog.img} alt={matchedDog.name} borderRadius="md" maxH="250px"/>
                <Text fontSize="xl" fontWeight="bold">{matchedDog.name}</Text>
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
