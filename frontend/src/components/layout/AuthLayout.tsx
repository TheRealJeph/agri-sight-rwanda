import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart3, Leaf, Lightbulb, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const HIGHLIGHTS = [
  { icon: BarChart3, label: 'Explore real data' }, { icon: MapPin, label: 'Compare districts' },
  { icon: Leaf, label: 'Discover trends' }, { icon: Lightbulb, label: 'Make better decisions' },
];

interface Props { headline: ReactNode; description: string; children: ReactNode; backTo?: { to: string; label: string } }

/** Split layout from the approved design: landscape/brand panel on the left, the form on the right. */
export default function AuthLayout({ headline, description, children, backTo }: Props) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, bgcolor: 'background.paper' }}>
      <Box component="aside" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(180deg,#E3F1F7 0%,#F4F9F4 70%)', pt: 4, minHeight: { xs: 380, md: 'auto' } }}>
        <Box sx={{ px: { xs: 3, md: 7 } }}>
          <Link to="/" aria-label="Agri-Sight Rwanda home"><img src="/logo/agri-sight-logo-transparent.png" alt="Agri-Sight Rwanda" style={{ height: 48, maxWidth: '100%' }} /></Link>
          <Typography variant="h2" component="p" sx={{ fontSize: { xs: 30, md: 44 }, lineHeight: 1.15, mt: { xs: 4, md: 8 }, mb: 2 }}>{headline}</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 480, mb: 3 }}>{description}</Typography>
          <Box component="ul" sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, listStyle: 'none', p: 0, m: 0 }}>
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} style={{ textAlign: 'center', width: 80 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(16,185,129,.14)', color: 'primary.main', display: 'grid', placeItems: 'center', mx: 'auto', mb: 0.5 }}><Icon size={20} aria-hidden /></Box>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
              </li>))}
          </Box>
        </Box>
        <Box aria-hidden sx={{ mt: 4, height: { xs: 160, md: 300 }, backgroundImage: 'url(/images/auth.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderTopRightRadius: 96, position: 'relative' }}>
          <Typography sx={{ position: 'absolute', left: { xs: 24, md: 56 }, bottom: 18, color: '#fff', fontWeight: 700, textShadow: '0 1px 6px rgba(0,0,0,.55)' }}>
            Better data. Stronger agriculture.
          </Typography>
        </Box>
      </Box>
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 3, sm: 8, md: 9 }, py: 6 }}>
        {backTo && <Box sx={{ alignSelf: 'flex-end', mb: 2 }}><Link to={backTo.to} style={{ color: '#047857', fontWeight: 600 }}>← {backTo.label}</Link></Box>}
        <Box sx={{ maxWidth: 560, width: '100%', mx: 'auto' }}>{children}</Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 6, textAlign: 'center' }}>© 2026 Agri-Sight Rwanda. NISR Seasonal Agricultural Survey data.</Typography>
      </Box>
    </Box>
  );
}
