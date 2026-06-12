import { Activity, Heart, Shield, Stethoscope } from 'lucide-react'
import React from 'react'

export default function SnehBharatEmr_Info() {
  return (
    <div className="hidden xl:flex bg-gradient-to-br from-dark-teal to-navy p-12 flex-col justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-16 right-16 w-32 h-32 border-2 border-white rotate-45"></div>
        <div className="absolute bottom-16 left-16 w-24 h-24 border-2 border-white rotate-12"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-white rounded-full"></div>
      </div>

      <div className="relative z-10 text-white max-w-md">
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sneh Bharat</h1>
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest">Electronic Medical Records</p>
          </div>
        </div>

        <h2 className="text-4xl font-bold mb-6 leading-tight">
          Secure Lab
          <span className="block text-teal">Management System</span>
        </h2>

        <p className="text-lg text-white/80 mb-8 leading-relaxed">
          Access your comprehensive medical records platform designed for healthcare professionals.
        </p>

        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Real-time Updates</h4>
              <p className="text-white/60 text-sm">Instant access to patient information</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Patient-Centered</h4>
              <p className="text-white/60 text-sm">Designed to improve care outcomes</p>
            </div>
          </div>
        </div>

     
      </div>
    </div>
  )
}
