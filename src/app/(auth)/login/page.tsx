import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to Snehbharat LIMS',
};

import React from 'react'
import LoginPage from './Login'

export default function page() {
  return (
   <>
   <LoginPage/>
   </>
  )
}
