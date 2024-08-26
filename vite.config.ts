import { defineConfig, loadEnv ,type UserConfigExport, type ConfigEnv} from 'vite'

import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({command, mode})=>{
  const env = loadEnv(mode, process.cwd())
  return {
    base:'./',
    server: {
      // 端口号
      port: 5173,
      host: "0.0.0.0",
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: 'https://open.feishu.cn',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        },
      },
    },
    plugins: [
      vue(),
      AutoImport({
        dts: './auto-import.d.ts',
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }

})