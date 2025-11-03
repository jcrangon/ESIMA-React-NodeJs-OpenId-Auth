import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "@/styles/globalStyle";
import { theme } from "./styles/theme";
import App from '@/App'
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from "@/auth/AuthProvider";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
        <BrowserRouter>
            <AuthProvider>
            <App />
            </AuthProvider>
        </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
