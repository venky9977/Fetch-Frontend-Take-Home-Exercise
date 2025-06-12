// src/components/Map/Map.tsx
import React from 'react'
import GoogleMapReact from 'google-map-react'
import { Box, useBreakpointValue, Image, Text } from '@chakra-ui/react'
import type { Dog } from '../../api/dogs'
import mapStyles from './mapStyles'

interface Place {
  dog: Dog
  lat: number
  lng: number
}

interface MarkerProps {
  lat: number
  lng: number
  place: Place
  onClick: () => void
}

const DogMarker: React.FC<MarkerProps> = ({ place, onClick }) => {
  const isDesktop = useBreakpointValue({ base: false, md: true })

  if (!isDesktop) {
    return (
      <Box
        onClick={onClick}
        transform="translate(-50%, -100%)"
        cursor="pointer"
      >
        <Image
          src={place.dog.img}
          alt={place.dog.breed}
          boxSize="60px"
          borderRadius="full"
          objectFit="cover"
        />
      </Box>
    )
  }

  return (
    <Box
      onClick={onClick}
      position="absolute"
      transform="translate(-50%, -100%)"
      bg="white"
      boxShadow="md"
      borderRadius="md"
      width="120px"
      p={1}
      textAlign="center"
      cursor="pointer"
      transition="transform 0.15s"
      _hover={{ transform: 'translate(-50%, -100%) scale(1.1)' }}
    >
      <Image
        src={place.dog.img}
        alt={place.dog.breed}
        objectFit="cover"
        width="100%"
        height="70px"
        borderRadius="md"
      />
      <Text fontSize="sm" mt={1} noOfLines={1}>
        {place.dog.breed}
      </Text>
    </Box>
  )
}

interface MapProps {
  center: { lat: number; lng: number }
  places: Place[]
  onChange: (bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => void
  onChildClick: (key: string) => void
}

export default function Map({
  center,
  places,
  onChange,
  onChildClick,
}: MapProps) {
  return (
    <Box w="100%" h="100%">
      <GoogleMapReact
        bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAP_API_KEY }}
        center={center}
        defaultZoom={12}
        options={{ disableDefaultUI: true, zoomControl: true, styles: mapStyles }}
        onChange={({ marginBounds }) =>
          onChange({
            ne: { lat: marginBounds.ne.lat, lng: marginBounds.ne.lng },
            sw: { lat: marginBounds.sw.lat, lng: marginBounds.sw.lng },
          })
        }
        onChildClick={(key) => onChildClick(key as string)}
      >
        {places.map((place) => (
          <DogMarker
            key={place.dog.id}
            lat={place.lat}
            lng={place.lng}
            place={place}
            onClick={() => onChildClick(place.dog.id)}
          />
        ))}
      </GoogleMapReact>
    </Box>
  )
}
