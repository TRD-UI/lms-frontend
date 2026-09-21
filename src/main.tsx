import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { supabaseConfigError } from './lib/supabase'
import { ConfigError } from './components/shared/ConfigError'
import './index.css'

// A misconfigured build should say so, not render nothing.
createRoot(document.getElementById("root")!).render(
    supabaseConfigError ? <ConfigError detail={supabaseConfigError} /> : <App />
);
