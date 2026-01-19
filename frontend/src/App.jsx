import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import EnhancedDashboard from './pages/EnhancedDashboard'
import EnhancedCampaigns from './pages/EnhancedCampaigns'
import CampaignDetail from './pages/CampaignDetail'
import CampaignCreate from './pages/CampaignCreate'
import CampaignEdit from './pages/CampaignEdit'
import Settings from './pages/Settings'
import TrafficSources from './pages/TrafficSources'
import Alerts from './pages/Alerts'
import LandingPages from './pages/LandingPages'
import Conversions from './pages/Conversions'
import CustomDomains from './pages/CustomDomains'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<EnhancedDashboard />} />
        <Route path="campaigns" element={<EnhancedCampaigns />} />
        <Route path="campaigns/new" element={<CampaignCreate />} />
        <Route path="campaigns/:id" element={<CampaignDetail />} />
        <Route path="campaigns/:id/edit" element={<CampaignEdit />} />
        <Route path="traffic-sources" element={<TrafficSources />} />
        <Route path="landing-pages" element={<LandingPages />} />
        <Route path="conversions" element={<Conversions />} />
        <Route path="custom-domains" element={<CustomDomains />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
