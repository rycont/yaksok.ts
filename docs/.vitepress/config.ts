import { defineConfig } from 'vitepress'
import { getSidebar } from 'vitepress-plugin-auto-sidebar'

const sidebar = getSidebar({
    contentRoot: '/docs',
    contentDirs: [''],
    collapsible: true,
    collapsed: false,
    useFrontmatter: true,
})

const TOP_LEVEL_ITEMS_ORDER = ['Home', '약속 언어 이해하기', 'Api']

// @ts-ignore: sidebar[0] is always an object
sidebar[0].items = sidebar[0].items.sort((a, b) => {
    const aIndex = TOP_LEVEL_ITEMS_ORDER.indexOf(a.text)
    const bIndex = TOP_LEVEL_ITEMS_ORDER.indexOf(b.text)
    return aIndex - bIndex
})

export default defineConfig({
    title: 'yaksok.ts',
    description: '약속 프로그래밍 언어의 타입스크립트 구현체',
    themeConfig: {
        nav: [{ text: 'Home', link: '/' }],
        sidebar,
        socialLinks: [
            { icon: 'github', link: 'https://github.com/rycont/yaksok.ts' },
            {
                icon: {
                    svg: '<svg viewBox="0 0 13 7" aria-hidden="true" height="28"><path d="M0,2h2v-2h7v1h4v4h-2v2h-7v-1h-4" fill="#083344"></path><g fill="#f7df1e"><path d="M1,3h1v1h1v-3h1v4h-3"></path><path d="M5,1h3v1h-2v1h2v3h-3v-1h2v-1h-2"></path><path d="M9,2h3v2h-1v-1h-1v3h-1"></path></g></svg>',
                },
                link: 'https://jsr.io/@yaksok-ts/core',
            },
        ],
        search: {
            provider: 'local',
        },
    },
    vite: {
        build: {
            minify: false,
        },
    },
})
