import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { JobsProvider } from './context/JobsContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Analytics from './pages/Analytics'
import AddJob from './pages/AddJob'
import JobDetail from './pages/JobDetail'
import './App.css'

/* ── Page transition wrapper ── */
const pageVariants = {
  initial: { opacity: 0, y: 14 },
  enter:   { opacity: 1, y: 0,   transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.18, ease: 'easeIn' } },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Routes location={location}>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/jobs"      element={<Jobs />} />
          <Route path="/jobs/new"  element={<AddJob />} />
          <Route path="/jobs/:id"  element={<JobDetail />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <JobsProvider>
        <Navbar />
        <div className="app-body">
          <main className="main-content">
            <AnimatedRoutes />
          </main>
        </div>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          theme="dark"
          toastStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-h)',
          }}
        />
      </JobsProvider>
    </BrowserRouter>
  )
}

export default App
