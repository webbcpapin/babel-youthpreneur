import RegistrationForm from '@/auth/RegistrationForm'
import { REGISTRATION_PROFILES } from '@/auth/registration-profiles'
import '@/monitoring/MonitoringPage.css'

export default function RegisterUmkmPage() {
  return <RegistrationForm profile={REGISTRATION_PROFILES.umkm} />
}
