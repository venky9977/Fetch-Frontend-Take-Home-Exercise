// src/main.tsx
import { createRoot } from 'react-dom/client'
import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import chakraTheme from './theme'
import './index.css'

// MUI theme imports
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles'

const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#dd6b20' },  
  },
})

createRoot(document.getElementById('root')!).render(
  <MUIThemeProvider theme={muiTheme}>
    <ChakraProvider theme={chakraTheme}>
      <BrowserRouter>
        <Box w="100vw" minH="100vh" bg="brand.50">
          <App />
        </Box>
      </BrowserRouter>
    </ChakraProvider>
  </MUIThemeProvider>
)
