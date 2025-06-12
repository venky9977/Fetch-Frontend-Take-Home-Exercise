# Paw-fect Match Finder

A React single-page application that helps dog lovers browse and “paw-ty” adoptable shelter dogs. Includes both a traditional search interface and a location-based map view, with fun dog-themed animations and responsive design powered by **Chakra UI**.

---

## 🚀 Features

### Landing & Login

- Animated paw icon and quirky messaging on the landing page  
- Dog-themed background animation on the login page  
- Authentication via Fetch’s `/auth/login` endpoint with HttpOnly cookies  

### Search Page

- Filter by **breed**, **age range** (min/max)  
- Sort by **breed** or **name**, ascending/descending  
- Pagination: 12 cards per page, mobile adapts to 2 columns  
- Favorites: click heart icon to add/remove; clear favorites button  
- Match Generation: send selected IDs to `/dogs/match`, show result in a modal with heart-fireworks animation  
- Responsive Layout: mobile-first stacks header, filters, then grid  

### Location Search Page

- Asks for geolocation once, shows a loading animation until permission/result  
- Interactive Google Map + List view side-by-side (desktop) or stacked (mobile)  
- Queries `/locations/search` with a geo-bounding box, then `/dogs/search` for nearby pups  
- Same favorites & match flow as the main search page  
- Back button to return to the traditional search  

### Reusable Components

- `<Map>`: custom dog markers with picture & breed, hover/scale effects  
- `<List>`: scrollable details list with highlighting on map click  
- `<HeartFireworks>` & `<DogPawLoading>`: fun canvas animations for match and loading  

---

## 🛠 Tech Stack
- **React** + **TypeScript**  
- **Chakra UI** for component styling and responsive design  
- **React Router v6** for client-side routing  
- **Axios** for HTTP requests with `withCredentials`  
- **Google Maps React** for map integration  
- **React Icons** for playful iconography  

---

## 🎉 Acknowledgements
- Thanks to **Fetch** for providing the Take-Home API service  