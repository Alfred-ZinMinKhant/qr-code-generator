<template>
  <div class="dashboard-bg min-h-screen flex w-screen h-screen overflow-hidden">
    <!-- Sidebar (Desktop) -->
    <aside
      class="dashboard-sidebar hidden md:flex flex-col items-center py-10 px-4 bg-white/80 shadow-2xl backdrop-blur-xl min-w-[260px] max-w-[320px] border-r border-blue-100"
    >
      <img src="/src/assets/logo.svg" alt="Logo" class="h-16 w-16 mb-4 drop-shadow-lg" />
      <h1 class="text-2xl font-extrabold text-blue-700 mb-8 tracking-wide text-center">QR Dashboard</h1>
      <nav class="flex flex-col gap-4 w-full">
        <a href="#generator" class="dashboard-nav-link">QR Generator</a>
        <a href="#history" class="dashboard-nav-link">History</a>
      </nav>
      <div class="mt-auto text-xs text-gray-400 pt-10 text-center">
        &copy; {{ new Date().getFullYear() }}<br />QR Code Generator
      </div>
    </aside>
    <!-- Mobile Menu Button -->
    <button
      class="fixed top-4 left-4 z-30 md:hidden bg-white/90 rounded-full shadow-lg p-3 border border-blue-100 focus:outline-none"
      @click="mobileMenuOpen = true"
      aria-label="Open menu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
    </button>
    <!-- Mobile Sidebar -->
    <transition name="fade">
      <aside
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 flex md:hidden"
        @click.self="mobileMenuOpen = false"
      >
        <div class="dashboard-sidebar flex flex-col items-center py-10 px-4 bg-white/95 shadow-2xl backdrop-blur-xl min-w-[220px] max-w-[80vw] border-r border-blue-100 h-full animate-fade-in">
          <button class="absolute top-4 right-4 text-blue-700" @click="mobileMenuOpen = false" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src="/src/assets/logo.svg" alt="Logo" class="h-16 w-16 mb-4 drop-shadow-lg" />
          <h1 class="text-2xl font-extrabold text-blue-700 mb-8 tracking-wide text-center">QR Dashboard</h1>
          <nav class="flex flex-col gap-4 w-full">
            <a href="#generator" class="dashboard-nav-link" @click="mobileMenuOpen = false">QR Generator</a>
            <a href="#history" class="dashboard-nav-link" @click="mobileMenuOpen = false">History</a>
          </nav>
          <div class="mt-auto text-xs text-gray-400 pt-10 text-center">
            &copy; {{ new Date().getFullYear() }}<br />QR Code Generator
          </div>
        </div>
        <div class="flex-1 bg-black/30" @click="mobileMenuOpen = false"></div>
      </aside>
    </transition>
    <!-- Main Content -->
    <div class="flex-1 flex flex-col dashboard-main-bg min-h-screen w-full h-full overflow-auto">
      <header class="dashboard-header flex items-center justify-between px-4 md:px-10 py-8">
        <h2 class="text-3xl font-bold text-blue-800 tracking-tight">QR Code Generator</h2>
        <span class="text-base text-gray-400 font-medium hidden md:inline">Modern Dashboard</span>
      </header>
      <main class="flex-1 flex flex-col lg:flex-row gap-10 px-2 md:px-6 pb-10 w-full h-full">
        <!-- Generator Card -->
        <section id="generator" class="dashboard-card flex-1 max-w-xl mx-auto lg:mx-0 mb-10 lg:mb-0">
          <form @submit.prevent="generateQR" class="space-y-6" autocomplete="off">
            <div>
              <label class="block text-lg font-semibold text-gray-700 mb-2" for="url-input">URL to encode</label>
              <input
                id="url-input"
                v-model="url"
                placeholder="Paste a link (e.g. https://...)"
                class="dashboard-input"
                required
                aria-label="URL to encode"
              />
            </div>
            <div class="flex items-center space-x-4">
              <label class="font-medium text-gray-700" for="color-input">Color</label>
              <input
                id="color-input"
                v-model="color"
                type="color"
                class="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                aria-label="QR color"
              />
            </div>
            <div class="flex gap-2">
              <button
                type="submit"
                class="dashboard-btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="loader mr-2"></span>
                <span>{{ loading ? 'Generating...' : 'Generate QR' }}</span>
              </button>
              <button
                type="button"
                class="dashboard-btn-secondary"
                @click="clearForm"
                :disabled="loading"
                aria-label="Clear form"
              >
                Clear
              </button>
            </div>
            <p v-if="error" class="text-red-500 text-center mt-2">{{ error }}</p>
            <transition name="fade">
              <div v-if="success" class="flex items-center justify-center gap-2 text-green-600 font-semibold mt-2 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                QR code generated!
              </div>
            </transition>
          </form>
          <transition name="fade">
            <div v-if="qrImage" class="text-center mt-8 animate-fade-in">
              <p class="text-base text-gray-600 mb-2">QR Code Preview</p>
              <img :src="qrImage" class="mx-auto my-3 w-48 h-48 rounded-xl border-2 border-blue-200 shadow-lg transition-transform hover:scale-105 cursor-pointer" @click="copyQR" :alt="'QR code for ' + url" />
              <div class="flex flex-col sm:flex-row justify-center gap-2 mt-2">
                <a
                  :href="qrImage"
                  download="qr.png"
                  class="dashboard-btn-success"
                >
                  Download PNG
                </a>
                <button
                  type="button"
                  class="dashboard-btn-info flex items-center gap-2"
                  @click="copyQR"
                  aria-label="Copy QR image to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Copy
                </button>
              </div>
            </div>
          </transition>
        </section>
        <!-- History Timeline / Gallery -->
        <section v-if="history.length" id="history" class="dashboard-card flex-1 max-w-2xl mx-auto lg:mx-0">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-2xl font-bold text-blue-800">Recent QR Codes</h2>
            <button
              class="dashboard-btn-danger"
              @click="clearHistory"
              aria-label="Clear QR history"
            >
              Clear History
            </button>
          </div>
          <div class="dashboard-gallery grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div
              v-for="item in history"
              :key="item.file"
              class="dashboard-gallery-item group"
            >
              <div class="relative">
                <img
                  :src="backendUrl + item.file"
                  alt="QR"
                  class="dashboard-gallery-img group-hover:scale-110"
                  @click="copyQR(backendUrl + item.file)"
                />
                <div class="dashboard-gallery-overlay group-hover:opacity-100">
                  <button class="dashboard-btn-info w-full flex items-center justify-center gap-2" @click="copyQR(backendUrl + item.file)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Copy
                  </button>
                </div>
              </div>
              <div class="mt-2 text-center">
                <p class="text-xs text-gray-700 break-all mb-1">{{ item.url }}</p>
                <p class="text-xs text-gray-400">{{ new Date(item.timestamp).toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from "vue";
import axios from "axios";

const mobileMenuOpen = ref(false);

const backendUrl = "http://localhost:3000";
const url = ref("");
const color = ref("#000000");
const qrImage = ref(null);
const history = ref([]);
const loading = ref(false);
const error = ref("");
const success = ref(false);

const generateQR = async () => {
  loading.value = true;
  error.value = "";
  success.value = false;
  try {
    const res = await axios.post(`${backendUrl}/api/generate`, {
      url: url.value,
      color: color.value,
    });
    qrImage.value = backendUrl + res.data.file;
    fetchHistory();
    success.value = true;
    setTimeout(() => (success.value = false), 1800);
  } catch (e) {
    error.value = "Failed to generate QR code. Please try again.";
  } finally {
    loading.value = false;
  }
};

const fetchHistory = async () => {
  try {
    const res = await axios.get(`${backendUrl}/api/history`);
    history.value = res.data;
  } catch (e) {
    // ignore
  }
};

const clearForm = () => {
  url.value = "";
  color.value = "#000000";
  qrImage.value = null;
  error.value = "";
  success.value = false;
};

const clearHistory = () => {
  history.value = [];
};

const copyQR = async (imgSrc = qrImage.value) => {
  if (!imgSrc) return;
  try {
    const data = await fetch(imgSrc);
    const blob = await data.blob();
    await navigator.clipboard.write([
      new window.ClipboardItem({ [blob.type]: blob })
    ]);
    success.value = true;
    setTimeout(() => (success.value = false), 1200);
  } catch (e) {
    error.value = "Failed to copy QR image.";
  }
};

onMounted(fetchHistory);
</script>

<style>
/* Dashboard Layout */
.dashboard-bg {
  background: linear-gradient(120deg, #e0e7ff 0%, #f0f4ff 100%);
  min-height: 100vh;
  display: flex;
}
.dashboard-sidebar {
  background: rgba(255,255,255,0.85);
  box-shadow: 0 8px 32px 0 rgba(60, 80, 180, 0.10);
  border-top-right-radius: 2rem;
  border-bottom-right-radius: 2rem;
  min-width: 260px;
  max-width: 320px;
  z-index: 10;
}
.dashboard-nav-link {
  display: block;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  color: #334155;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
  text-align: center;
}
.dashboard-nav-link:hover, .dashboard-nav-link:focus {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  color: #fff;
}
.dashboard-main-bg {
  background: linear-gradient(120deg, #f0f4ff 0%, #e0e7ff 100%);
}
.dashboard-header {
  border-bottom: 1px solid #e0e7ff;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(2px);
}
.dashboard-card {
  background: rgba(255,255,255,0.95);
  box-shadow: 0 8px 32px 0 rgba(60, 80, 180, 0.10);
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(2px);
}
.dashboard-input {
  border: 1.5px solid #c7d2fe;
  border-radius: 0.75rem;
  padding: 0.9rem 1.1rem;
  width: 100%;
  font-size: 1.1rem;
  transition: border 0.2s, box-shadow 0.2s;
  outline: none;
}
.dashboard-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px #6366f1;
}
.dashboard-btn-primary {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  color: #fff;
  font-weight: 700;
  border-radius: 0.75rem;
  padding: 0.9rem 1.5rem;
  box-shadow: 0 2px 8px 0 rgba(99,102,241,0.10);
  transition: background 0.2s, box-shadow 0.2s;
}
.dashboard-btn-primary:hover, .dashboard-btn-primary:focus {
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
  box-shadow: 0 4px 16px 0 rgba(99,102,241,0.15);
}
.dashboard-btn-secondary {
  background: #f1f5f9;
  color: #334155;
  font-weight: 600;
  border-radius: 0.75rem;
  padding: 0.9rem 1.5rem;
  box-shadow: 0 2px 8px 0 rgba(99,102,241,0.05);
  transition: background 0.2s, color 0.2s;
}
.dashboard-btn-secondary:hover, .dashboard-btn-secondary:focus {
  background: #e0e7ff;
  color: #6366f1;
}
.dashboard-btn-success {
  background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
  color: #fff;
  font-weight: 600;
  border-radius: 0.75rem;
  padding: 0.7rem 1.2rem;
  box-shadow: 0 2px 8px 0 rgba(34,197,94,0.10);
  transition: background 0.2s, box-shadow 0.2s;
}
.dashboard-btn-success:hover, .dashboard-btn-success:focus {
  background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
}
.dashboard-btn-info {
  background: linear-gradient(90deg, #38bdf8 0%, #818cf8 100%);
  color: #fff;
  font-weight: 600;
  border-radius: 0.75rem;
  padding: 0.7rem 1.2rem;
  box-shadow: 0 2px 8px 0 rgba(59,130,246,0.10);
  transition: background 0.2s, box-shadow 0.2s;
}
.dashboard-btn-info:hover, .dashboard-btn-info:focus {
  background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
}
.dashboard-btn-danger {
  background: #fee2e2;
  color: #dc2626;
  font-weight: 600;
  border-radius: 0.75rem;
  padding: 0.7rem 1.2rem;
  box-shadow: 0 2px 8px 0 rgba(220,38,38,0.10);
  transition: background 0.2s, color 0.2s;
}
.dashboard-btn-danger:hover, .dashboard-btn-danger:focus {
  background: #fecaca;
  color: #b91c1c;
}
/* Gallery / Timeline */
.dashboard-gallery {
  width: 100%;
}
.dashboard-gallery-item {
  background: rgba(255,255,255,0.95);
  border-radius: 1.2rem;
  box-shadow: 0 4px 16px 0 rgba(60, 80, 180, 0.08);
  padding: 1.2rem 1rem 0.7rem 1rem;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}
.dashboard-gallery-img {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 0.7rem;
  border: 2px solid #c7d2fe;
  box-shadow: 0 2px 8px 0 rgba(99,102,241,0.10);
  margin: 0 auto;
  display: block;
  transition: transform 0.2s;
}
.dashboard-gallery-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(120deg, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.10) 100%);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1.2rem;
  transition: opacity 0.2s;
  z-index: 2;
}
.dashboard-gallery-item:hover .dashboard-gallery-overlay,
.dashboard-gallery-item:focus-within .dashboard-gallery-overlay {
  opacity: 1;
}
.loader {
  border: 3px solid #e0e7ff;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  width: 1.2em;
  height: 1.2em;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.animate-fade-in {
  animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: none; }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
