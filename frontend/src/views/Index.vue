<script setup>
import { defineAsyncComponent, onMounted, watch, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import useClipboard from 'vue-clipboard3'
import { useGlobalState } from '../store'
import { api } from '../api'
import { useIsMobile } from '../utils/composables'

// Icons
import { Refresh, QrCode, Edit, Delete } from '@vicons/material'
import { Copy, User } from '@vicons/fa'

// Components
import MailBox from '../components/MailBox.vue'
import Login from './common/Login.vue'
import AddressManagement from './user/AddressManagement.vue'
import TelegramAddress from './index/TelegramAddress.vue'
import LocalAddress from './index/LocalAddress.vue'
import { NIcon } from 'naive-ui'

const { loading, settings, openSettings, indexTab, jwt, userJwt, isTelegram } = useGlobalState()
const message = useMessage()
const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const { toClipboard } = useClipboard()

const { t } = useI18n({
  messages: {
    en: {
      yourTempEmail: 'Your Temporary Email Address',
      timeUsed: 'Time Used',
      expiresIn: 'Expires in 24 hours', // Mock text
      refreshEmail: 'Refresh Email',
      qrCode: 'QR Code',
      changeEmail: 'Change Email',
      deleteEmail: 'Delete Email',
      inbox: 'Inbox',
      copy: 'Copy',
      copied: 'Copied',
      domain: 'Domain',
      createEmail: 'Create a Temp Email',
      generateSecure: 'Generate a free, secure temporary email address to protect your privacy.',
    },
    zh: {
      yourTempEmail: '您的临时邮箱地址',
      timeUsed: '已使用时间',
      expiresIn: '24小时后过期',
      refreshEmail: '刷新邮箱',
      qrCode: '二维码',
      changeEmail: '更换邮箱',
      deleteEmail: '删除邮箱',
      inbox: '收件箱',
      copy: '复制',
      copied: '已复制',
      domain: '域名',
      createEmail: '创建临时邮箱',
      generateSecure: '生成免费、安全的临时邮箱地址以保护您的隐私。',
    }
  }
});

// Mock Timer Data
const timeUsedPercentage = ref(5)

// State for Modals
const showChangeAddress = ref(false)
const showLocalAddress = ref(false)
const showQrCode = ref(false)

// Data Fetching
const fetchMailData = async (limit, offset) => {
  return await api.fetch(`/api/mails?limit=${limit}&offset=${offset}`);
};

const deleteMail = async (curMailId) => {
  await api.fetch(`/api/mails/${curMailId}`, { method: 'DELETE' });
};

// Clipboard
const copyAddress = async () => {
    try {
        await toClipboard(settings.value.address)
        message.success(t('copied'));
    } catch (e) {
        message.error(e.message || "error");
    }
}

// Actions
const refreshPage = () => {
   location.reload();
}

const openChangeEmail = () => {
    if (isTelegram.value) {
        // Handle Telegram logic
    } else if (userJwt.value) {
        showChangeAddress.value = true;
    } else {
        showLocalAddress.value = true;
    }
}

const handleDeleteEmail = async () => {
    // Logic to delete/reset email usually involves logging out or requesting new one
    // Here we can open the local address management which allows delete/new
    showLocalAddress.value = true;
}

const init = async () => {
    await api.getSettings();
}

onMounted(() => {
    init();
})
</script>

<template>
  <div class="dashboard-wrapper">
    
    <!-- State 1: No Email (Landing) -->
    <div v-if="!settings.address && !loading" class="landing-state">
       <div class="landing-content">
          <n-icon size="64" color="#22c55e">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5l-8-5V6l8 5l8-5v2z"/></svg>
          </n-icon>
          <h2>{{ t('createEmail') }}</h2>
          <p>{{ t('generateSecure') }}</p>
          
          <div class="action-area">
             <n-button type="primary" size="large" @click="showLocalAddress = true">
                <template #icon><n-icon><Refresh /></n-icon></template>
                {{ t('createEmail') }}
             </n-button>
          </div>
       </div>
       
       <!-- Login Component Hidden but functional if needed -->
       <div style="display:none"><Login /></div>
    </div>

    <!-- State 2: Active Dashboard -->
    <div v-else class="active-dashboard">
       
       <!-- Address Card -->
       <div class="address-card">
          <label>{{ t('yourTempEmail') }}</label>
          <div class="address-display">
             <span class="address-text">{{ settings.address }}</span>
             <n-button text class="copy-btn" @click="copyAddress">
                <n-icon size="20"><Copy /></n-icon>
             </n-button>
          </div>
          
          <div class="timer-row">
             <span>{{ t('timeUsed') }}</span>
             <div class="progress-bar-container">
                <div class="progress-bar" style="width: 5%;"></div>
             </div>
             <span class="expires-tag">{{ t('expiresIn') }}</span>
          </div>
       </div>

       <!-- Action Buttons -->
       <div class="action-grid">
          <n-button class="action-btn" @click="refreshPage">
             <template #icon><n-icon><Refresh /></n-icon></template>
             {{ t('refreshEmail') }}
          </n-button>
          
          <n-button class="action-btn" @click="showQrCode = true">
             <template #icon><n-icon><QrCode /></n-icon></template>
             {{ t('qrCode') }}
          </n-button>
          
          <n-button class="action-btn" @click="openChangeEmail">
             <template #icon><n-icon><Edit /></n-icon></template>
             {{ t('changeEmail') }}
          </n-button>

          <n-button class="action-btn delete-btn" type="error" @click="handleDeleteEmail">
             <template #icon><n-icon><Delete /></n-icon></template>
             {{ t('deleteEmail') }}
          </n-button>
       </div>

       <!-- Domain Selector (Visual mostly, or functional via modal) -->
       <div class="domain-row" v-if="openSettings.domains && openSettings.domains.length > 0">
           <n-select :options="openSettings.domains" placeholder="Select Domain" />
       </div>

       <!-- Inbox Section -->
       <div class="inbox-section">
          <h3 class="inbox-title">
             <n-icon color="#22c55e" size="18"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"/></svg></n-icon>
             {{ t('inbox') }}
          </h3>
          <div class="inbox-container">
             <MailBox 
                :fetchMailData="fetchMailData" 
                :deleteMail="deleteMail" 
                :showFilterInput="false"
                :showEMailTo="false"
             />
          </div>
       </div>

    </div>

    <!-- Modals -->
    <n-modal v-model:show="showLocalAddress" preset="card" :title="t('changeEmail')" style="width: 600px">
        <LocalAddress />
    </n-modal>
    <n-modal v-model:show="showChangeAddress" preset="card" :title="t('changeEmail')" style="width: 600px">
        <AddressManagement />
    </n-modal>
    <n-modal v-model:show="showQrCode" preset="card" title="QR Code" style="width: 400px; text-align: center;">
        <n-qr-code :value="settings.address" :size="200" style="margin: 0 auto;"/>
    </n-modal>

  </div>
</template>

<style scoped>
.dashboard-wrapper {
  padding: 24px;
  color: white;
}

/* Landing State */
.landing-state {
  text-align: center;
  padding: 60px 20px;
}
.landing-content h2 {
  font-size: 2rem;
  margin: 20px 0 10px;
}
.landing-content p {
  color: var(--text-secondary);
  margin-bottom: 40px;
}

/* Address Card */
.address-card {
  background-color: #0f1012; /* Slightly darker than card for contrast */
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.address-card label {
  display: block;
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 1rem;
}

.address-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #000;
  border: 1px solid #333;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.address-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.copy-btn {
  color: #666;
}
.copy-btn:hover {
  color: var(--primary-color);
}

.timer-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.85rem;
  color: #888;
}

.progress-bar-container {
  flex: 1;
  height: 6px;
  background-color: #333;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
}

.expires-tag {
  background-color: #064e3b;
  color: var(--primary-color);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* Action Grid */
.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .action-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.action-btn {
  height: 48px;
  background-color: #0f1012;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-weight: 600;
  color: white;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.delete-btn {
  background-color: #7f1d1d !important;
  color: #fecaca !important;
  border-color: #991b1b !important;
}

.delete-btn:hover {
  background-color: #ef4444 !important;
  color: white !important;
}

/* Domain Row */
.domain-row {
  margin-bottom: 24px;
}

/* Inbox Section */
.inbox-section {
  background-color: #0f1012;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.inbox-title {
  padding: 16px 24px;
  margin: 0;
  background-color: #1a1a1a;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.inbox-container {
  min-height: 400px;
}
</style>
