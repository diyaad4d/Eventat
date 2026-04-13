import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Toast from './components/ui/Toast';

import Landing  from './components/Landing/Landing.jsx';
import Signup   from './components/Signup/Signup.jsx';
import Login    from './components/Login/Login.jsx';
import Home     from './components/Home/Home.jsx';
import Services from './components/Services/Services.jsx';

// ─────────────────────────────────────────────────────────────
//  React Query — global client configuration
//  staleTime : 5 min  → cached data is considered fresh for 5 min
//  retry     : 1      → failed requests are retried once before error
// ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<Landing />}  />
          <Route path="/signup"   element={<Signup />}   />
          <Route path="/Login"    element={<Login />}    />
          <Route path="/Home"     element={<Home />}     />
          <Route path="/Services" element={<Services />} />
        </Routes>
      </BrowserRouter>

      {/* React Query Devtools — only bundled in development */}
      <ReactQueryDevtools initialIsOpen={false} />

      {/* Global toast notifications */}
      <Toast />
    </QueryClientProvider>
  );
}

export default App;