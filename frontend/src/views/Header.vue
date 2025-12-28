<script setup>
import { ref, h, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useIsMobile } from '../utils/composables'
import {
    DarkModeFilled, LightModeFilled, MenuFilled,
    AdminPanelSettingsFilled
} from '@vicons/material'
import { GithubAlt, Language, User, Home } from '@vicons/fa'

import { useGlobalState } from '../store'
import { api } from '../api'
import { getRouterPathWithLang } from '../utils'

const message = useMessage()
const notification = useNotification()

const {
    toggleDark, isDark, isTelegram, showAdminPage,
    showAuth, auth, loading, openSettings, userSettings
} = useGlobalState()
const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()

const showMobileMenu = ref(false)
const menuValue = computed(() => {
    if (route.path.includes("user")) return "user";
    if (route.path.includes("admin")) return "admin";
    return "home";
});

const authFunc = async () => {
    try {
        location.reload()
    } catch (error) {
        message.error(error.message || "error");
    }
}

const changeLocale = async (lang) => {
    if (lang == 'zh') {
        await router.push(route.fullPath.replace('/en', ''));
    } else {
        await router.push(`/${lang}${route.fullPath}`);
    }
}

const { locale, t } = useI18n({
    messages: {
        en: {
            title: 'Cloudflare Temp Email',
            dark: 'Dark',
            light: 'Light',
            accessHeader: 'Access Password',
            accessTip: 'Please enter the correct access password',
            home: 'Home',
            menu: 'Menu',
            user: 'User',
            ok: 'OK',
        },
        zh: {
            title: 'Cloudflare 临时邮件',
            dark: '暗色',
            light: '亮色',
            accessHeader: '访问密码',
            accessTip: '请输入站点访问密码',
            home: '主页',
            menu: '菜单',
            user: '用户',
            ok: '确定',
        }
    }
});

const version = import.meta.env.PACKAGE_VERSION ? `v${import.meta.env.PACKAGE_VERSION}` : "";

const menuOptions = computed(() => [
    {
        label: () => h(NButton,
            {
                text: true,
                size: "small",
                type: menuValue.value == "home" ? "primary" : "default",
                style: "width: 100%",
                onClick: async () => {
                    await router.push(getRouterPathWithLang('/', locale.value));
                    showMobileMenu.value = false;
                }
            },
            {
                default: () => t('home'),
                icon: () => h(NIcon, { component: Home })
            }),
        key: "home"
    },
    {
        label: () => h(
            NButton,
            {
                text: true,
                size: "small",
                type: menuValue.value == "user" ? "primary" : "default",
                style: "width: 100%",
                onClick: async () => {
                    await router.push(getRouterPathWithLang("/user", locale.value));
                    showMobileMenu.value = false;
                }
            },
            {
                default: () => t('user'),
                icon: () => h(NIcon, { component: User }),
            }
        ),
        key: "user",
        show: !isTelegram.value
    },
    {
        label: () => h(
            NButton,
            {
                text: true,
                size: "small",
                type: menuValue.value == "admin" ? "primary" : "default",
                style: "width: 100%",
                onClick: async () => {
                    loading.value = true;
                    await router.push(getRouterPathWithLang('/admin', locale.value));
                    loading.value = false;
                    showMobileMenu.value = false;
                }
            },
            {
                default: () => "Admin",
                icon: () => h(NIcon, { component: AdminPanelSettingsFilled }),
            }
        ),
        show: showAdminPage.value,
        key: "admin"
    },
    {
        label: () => h(
            NButton,
            {
                text: true,
                size: "small",
                style: "width: 100%",
                onClick: () => { toggleDark(); showMobileMenu.value = false; }
            },
            {
                default: () => isDark.value ? t('light') : t('dark'),
                icon: () => h(
                    NIcon, { component: isDark.value ? LightModeFilled : DarkModeFilled }
                )
            }
        ),
        key: "theme"
    },
    {
        label: () => h(
            NButton,
            {
                text: true,
                size: "small",
                style: "width: 100%",
                onClick: async () => {
                    locale.value == 'zh' ? await changeLocale('en') : await changeLocale('zh');
                    showMobileMenu.value = false;
                }
            },
            {
                default: () => locale.value == 'zh' ? "English" : "中文",
                icon: () => h(
                    NIcon, { component: Language }
                )
            }
        ),
        key: "lang"
    },
    {
        label: () => h(
            NButton,
            {
                text: true,
                size: "small",
                style: "width: 100%",
                tag: "a",
                target: "_blank",
                href: "https://github.com/dreamhunter2333/cloudflare_temp_email",
            },
            {
                default: () => version || "Github",
                icon: () => h(NIcon, { component: GithubAlt })
            }
        ),
        show: openSettings.value?.showGithub,
        key: "github"
    }
]);

useHead({
    title: () => openSettings.value.title || t('title'),
    meta: [
        { name: "description", content: openSettings.value.description || t('title') },
    ]
});

const logoClickCount = ref(0);
const logoClick = async () => {
    if (route.path.includes("admin")) {
        logoClickCount.value = 0;
        return;
    }
    if (logoClickCount.value >= 5) {
        logoClickCount.value = 0;
        message.info("Change to admin Page");
        loading.value = true;
        await router.push(getRouterPathWithLang('/admin', locale.value));
        loading.value = false;
    } else {
        logoClickCount.value++;
    }
    if (logoClickCount.value > 0) {
        message.info(`Click ${5 - logoClickCount.value + 1} times to enter the admin page`);
    }
}

onMounted(async () => {
    await api.getOpenSettings(message, notification);
    // make sure user_id is fetched
    if (!userSettings.value.user_id) await api.getUserSettings(message);
});
</script>

<template>
    <div class="header-container glass-panel">
        <div class="logo-section" @click="logoClick">
            <n-avatar round size="medium" src="/logo.png" fallback-src="https://0.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=512" />
            <span class="site-title">{{ openSettings.title || t('title') }}</span>
        </div>
        
        <div class="nav-section">
            <n-space v-if="!isMobile" align="center" size="large">
                <router-link :to="getRouterPathWithLang('/', locale)" class="nav-link" :class="{ active: menuValue === 'home' }">
                    <n-icon :component="Home" /> {{ t('home') }}
                </router-link>
                
                <router-link v-if="!isTelegram && userSettings.user_id" :to="getRouterPathWithLang('/user', locale)" class="nav-link" :class="{ active: menuValue === 'user' }">
                    <n-icon :component="User" /> {{ t('user') }}
                </router-link>

                <router-link v-if="showAdminPage" :to="getRouterPathWithLang('/admin', locale)" class="nav-link" :class="{ active: menuValue === 'admin' }">
                    <n-icon :component="AdminPanelSettingsFilled" /> Admin
                </router-link>

                <n-button quaternary circle @click="toggleDark">
                    <template #icon>
                        <n-icon :component="isDark ? LightModeFilled : DarkModeFilled" />
                    </template>
                </n-button>
                
                <n-button quaternary circle @click="locale == 'zh' ? changeLocale('en') : changeLocale('zh')">
                    <template #icon>
                        <n-icon :component="Language" />
                    </template>
                </n-button>
            </n-space>

            <n-button v-else text style="font-size: 24px;" @click="showMobileMenu = !showMobileMenu">
                <n-icon :component="MenuFilled" />
            </n-button>
        </div>

        <n-drawer v-model:show="showMobileMenu" placement="right" style="width: 250px;">
            <n-drawer-content :title="t('menu')">
                <n-menu :options="menuOptions" />
            </n-drawer-content>
        </n-drawer>

        <n-modal v-model:show="showAuth" preset="dialog" :title="t('accessHeader')">
            <p>{{ t('accessTip') }}</p>
            <n-input v-model:value="auth" type="password" show-password-on="click" />
            <template #action>
                <n-button :loading="loading" @click="authFunc" type="primary">
                    {{ t('ok') }}
                </n-button>
            </template>
        </n-modal>
    </div>
</template>

<style scoped>
.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 25px;
    margin-bottom: 20px;
    border-radius: 16px;
    background: rgba(30, 41, 59, 0.6); /* Slightly more transparent than default glass */
    backdrop-filter: blur(20px);
}

.logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: transform 0.2s;
}

.logo-section:hover {
    transform: scale(1.02);
}

.site-title {
    font-size: 1.25rem;
    font-weight: 700;
    background: linear-gradient(to right, #fff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.3s;
}

.nav-link:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
}

.nav-link.active {
    color: #fff;
    background: var(--primary-gradient);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.n-button {
    color: var(--text-secondary);
}

.n-button:hover {
    color: var(--accent-color);
}
</style>
