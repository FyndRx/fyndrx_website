<script setup lang="ts">
import logoIcon from '@/assets/logo/logo_icon_white_plain_bg.png';
</script>

<template>
  <div class="py-20 overflow-hidden bg-gray-900 relative">
    <!-- Abstract Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
    <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-[#246BFD]/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FE9615]/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
    
    <!-- Grid Pattern -->
    <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row items-center gap-16">
        
        <!-- Text Content -->
        <div class="flex-1 text-center lg:text-left z-10">
          <div class="inline-block px-4 py-1.5 mb-6 rounded-full border border-[#246BFD]/30 bg-[#246BFD]/10 backdrop-blur-sm">
            <span class="text-sm font-semibold tracking-wide text-[#246BFD] uppercase">
              Coming Soon on iOS & Android
            </span>
          </div>
          
          <h2 class="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Healthcare in <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#246BFD] to-[#60A5FA]">
              Your Pocket
            </span>
          </h2>
          
          <p class="text-lg text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Manage your prescriptions, track orders, and consult with doctors instantly. 
            Experience the full power of FyndRx with our mobile app.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            
            <!-- App Store Button -->
            <button class="group relative flex items-center gap-4 bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all active:scale-95 min-w-[200px]">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-1.11 3.73-.89 1.57.25 2.65.65 3.37 1.72-2.73 1.63-2.28 6.16.48 7.32-.61 1.74-1.49 3.5-2.66 4.04zm-4.22-17.5c1.34.02 2.51 1.34 2.19 3.29-1.3.17-2.61-1.12-2.61-3.29.13-.02.26-.03.42-.03z"/>
              </svg>
              <div class="text-left leading-tight">
                 <div class="text-[0.65rem] font-semibold uppercase tracking-wide opacity-80">Download on the</div>
                 <div class="text-xl font-bold -mt-0.5">App Store</div>
              </div>
            </button>

            <!-- Play Store Button -->
            <button class="group relative flex items-center gap-4 bg-transparent border border-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all active:scale-95 min-w-[220px]">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85M21.5,12C21.5,12.5 21.18,12.95 20.72,13.2L18.16,14.68L15.6,12.12L18.16,9.56L20.72,11.05C21.18,11.3 21.5,11.75 21.5,12M16.81,8.88L14.54,11.15L6.05,2.66L16.81,8.88Z" />
              </svg>
              <div class="text-left leading-tight w-full">
                <div class="text-[0.65rem] font-semibold uppercase tracking-wide opacity-70">Get it on</div>
                <div class="text-xl font-bold -mt-0.5 whitespace-nowrap">Google Play</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Phone Mockup Visual -->
        <div class="flex-1 relative flex justify-center items-center perspective-1000">
          <!-- Abstract Phone Shape -->
          <div class="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-700 shadow-2xl transform rotate-y-12 hover:rotate-y-0 transition-transform duration-700 ease-out z-10 overflow-hidden">
             <!-- Bezel inner shadow -->
             <div class="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-20 pointer-events-none"></div>

            <!-- Screen Content -->
            <div class="absolute inset-0 bg-[#0F172A] flex flex-col pt-4">
                <!-- Status Bar -->
                <div class="h-6 w-full flex justify-between items-center px-6 mb-2 opacity-50">
                    <div class="w-12 h-3 bg-white rounded-full"></div>
                    <div class="flex gap-1">
                        <div class="w-3 h-3 bg-white rounded-full"></div>
                        <div class="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                </div>

                <!-- App Header -->
                <div class="px-6 py-4 flex items-center justify-between">
                     <div class="flex items-center gap-3">
                        <!-- Project Logo used here -->
                        <img :src="logoIcon" alt="FyndRx" class="w-10 h-10 object-contain" />
                        <div>
                           <div class="h-3 w-20 bg-gray-700 rounded-sm mb-1.5"></div>
                           <div class="h-2 w-12 bg-gray-800 rounded-sm"></div>
                        </div>
                     </div>
                     <div class="w-8 h-8 rounded-full bg-gray-800"></div>
                </div>

                <!-- App Cards -->
                <div class="px-4 space-y-4 overflow-hidden">
                    <!-- Hero Card -->
                    <div class="h-36 w-full bg-gradient-to-r from-[#246BFD] to-[#5089FF] rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-blue-900/20">
                        <div class="flex justify-between items-start">
                           <div class="h-4 w-24 bg-white/30 rounded"></div>
                           <div class="h-6 w-6 bg-white/20 rounded-full"></div>
                        </div>
                        <div class="h-8 w-2/3 bg-white rounded-lg opacity-90"></div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="flex gap-3">
                        <div class="h-28 flex-1 bg-gray-800 rounded-2xl p-3 flex flex-col justify-end">
                            <div class="w-8 h-8 rounded-full bg-[#FE9615]/20 mb-2"></div>
                             <div class="h-3 w-16 bg-gray-600 rounded"></div>
                        </div>
                        <div class="h-28 flex-1 bg-gray-800 rounded-2xl p-3 flex flex-col justify-end">
                             <div class="w-8 h-8 rounded-full bg-[#246BFD]/20 mb-2"></div>
                             <div class="h-3 w-16 bg-gray-600 rounded"></div>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="h-48 w-full bg-gray-800 rounded-2xl p-4">
                         <div class="flex items-center justify-between mb-4">
                            <div class="h-4 w-24 bg-gray-600 rounded"></div>
                            <div class="h-3 w-12 bg-gray-700 rounded"></div>
                         </div>
                         <div class="space-y-3">
                             <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gray-700"></div>
                                <div class="flex-1">
                                    <div class="h-3 w-24 bg-gray-600 rounded mb-1.5"></div>
                                    <div class="h-2 w-16 bg-gray-700 rounded"></div>
                                </div>
                             </div>
                             <div class="separator h-px w-full bg-gray-700/50"></div>
                             <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gray-700"></div>
                                <div class="flex-1">
                                    <div class="h-3 w-24 bg-gray-600 rounded mb-1.5"></div>
                                    <div class="h-2 w-16 bg-gray-700 rounded"></div>
                                </div>
                             </div>
                         </div>
                    </div>
                </div>
                
                 <!-- Bottom Nav -->
                <div class="mt-auto h-20 bg-gray-900/80 backdrop-blur-md flex justify-around items-center px-6 border-t border-gray-800">
                   <div class="w-6 h-6 bg-[#246BFD] rounded-full shadow-[0_0_10px_rgba(36,107,253,0.5)]"></div>
                   <div class="w-6 h-6 bg-gray-700 rounded-full"></div>
                   <div class="w-6 h-6 bg-gray-700 rounded-full"></div>
                   <div class="w-6 h-6 bg-gray-700 rounded-full"></div>
                </div>
            </div>
          </div>
          
          <!-- Back Glow -->
          <div class="absolute inset-0 bg-blue-500/20 blur-[100px] -z-10 transform scale-75"></div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.rotate-y-12 {
  transform: rotateY(-12deg) rotateX(5deg);
}
</style>
