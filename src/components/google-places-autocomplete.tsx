'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@googlemaps/js-api-loader'
import { useEffect, useRef, useState } from 'react'

interface GooglePlacesAutocompleteProps {
  value: string
  onChange: (place: Place) => void
  placeholder?: string
  required?: boolean
  id?: string
}

export interface Place {
  address: string
  houseNumber: string
  postalCode: string
  city: string
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = 'Voer je adres in...',
  required = false,
  id = 'google-autocomplete',
}: GooglePlacesAutocompleteProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [warningText, setWarningText] = useState<string | null>(null)
  const [place, setPlace] = useState<Place>({
    address: '',
    houseNumber: '',
    postalCode: '',
    city: '',
  })

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places'],
        })

        await loader.importLibrary('places').then(() => {
          if (!inputRef.current) return

          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'nl' },
            fields: ['address_components', 'formatted_address', 'place_id'],
          })
        })

        // to do: recreate on tab back in browser
        console.log('✅ Autocomplete created successfully:', autocompleteRef.current)
        setIsLoaded(true)
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    if (!window.google?.maps) {
      setIsLoaded(false)

      loadGoogleMaps()
    }
  }, [])

  useEffect(() => {
    if (!autocompleteRef.current) return

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace()

      if (!place) return

      // check if either 'postal_code', 'locality', 'street_number', 'route' is missing
      const missingFields = ['postal_code', 'locality', 'street_number', 'route'].filter(
        (field) => !place.address_components?.some((component) => component.types[0] === field),
      )

      if (missingFields.length === 4) {
        setWarningText('Selecteer een adres uit de lijst')
        return
      }

      if (missingFields.includes('route')) {
        setWarningText('Voeg een straatnaam toe')
        return
      }

      if (missingFields.includes('street_number')) {
        setWarningText('Voeg een huisnummer toe')
        return
      }

      setWarningText(null)

      const address =
        place.address_components?.find((component) => component.types[0] === 'route')?.long_name ||
        ''

      const houseNumber =
        place.address_components?.find((component) => component.types[0] === 'street_number')
          ?.long_name || ''

      const postalCode =
        place.address_components?.find((component) => component.types[0] === 'postal_code')
          ?.long_name || ''
      const city =
        place.address_components?.find((component) => component.types[0] === 'locality')
          ?.long_name || ''

      setPlace({
        address,
        houseNumber,
        postalCode,
        city,
      })
    })
  }, [autocompleteRef.current])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Adres *</Label>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder={placeholder}
        required={required}
        defaultValue={value}
        className={!isLoaded ? 'opacity-50' : ''}
        onChange={(e) => onChange(place)}
      />
      {warningText && <p className="text-sm text-amber-600">⚠️ {warningText}</p>}
    </div>
  )
}
