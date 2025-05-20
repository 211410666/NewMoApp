import { createClient } from '@supabase/supabase-js'

export const supabaseClient = createClient(
  'https://xyekrnvpffqtnrgmplby.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZWtybnZwZmZxdG5yZ21wbGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MTU0ODEsImV4cCI6MjA1Mzk5MTQ4MX0.sZOGD78wOCGoV8qFPZgdXbUovCOV0fZaiEI1FKOTfzw'
)
