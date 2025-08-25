import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.lovable.53a97f78c45b4048805bcbf3b8b46b86',
  appName: 'globcoders-spark-ui',
  webDir: 'dist',
  server: {
    url: 'https://53a97f78-c45b-4048-805b-cbf3b8b46b86.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3b82f6",
      sound: "beep.wav"
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true
    }
  },
  ios: {
    scheme: "GlobCoders"
  },
  android: {
    allowMixedContent: true
  }
}

export default config