// Type definitions for Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
          }
          chat_instance?: string
          chat_type?: string
          start_param?: string
        }
        version: string
        platform: string
        colorScheme: 'light' | 'dark'
        themeParams: any
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        isClosingConfirmationEnabled: boolean
        headerColor: string
        backgroundColor: string
        BackButton: {
          isVisible: boolean
          show(): void
          hide(): void
          onClick(callback: () => void): void
          offClick(callback: () => void): void
        }
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          setText(text: string): void
          onClick(callback: () => void): void
          offClick(callback: () => void): void
          show(): void
          hide(): void
          enable(): void
          disable(): void
          showProgress(leaveActive?: boolean): void
          hideProgress(): void
          setParams(params: any): void
        }
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
          notificationOccurred(type: 'error' | 'success' | 'warning'): void
          selectionChanged(): void
        }
        ready(): void
        expand(): void
        close(): void
        sendData(data: string): void
        openLink(url: string): void
        openTelegramLink(url: string): void
        showPopup(params: any, callback?: (buttonId: string) => void): void
        showAlert(message: string, callback?: () => void): void
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void
        requestWriteAccess(callback?: (granted: boolean) => void): void
        requestContact(callback?: (granted: boolean) => void): void
        onEvent(eventType: string, eventHandler: () => void): void
        offEvent(eventType: string, eventHandler: () => void): void
      }
    }
  }
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export class TelegramWebApp {
  private static instance: TelegramWebApp
  private webApp: any
  private user: TelegramUser | null = null

  private constructor() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp
      this.initialize()
    }
  }

  public static getInstance(): TelegramWebApp {
    if (!TelegramWebApp.instance) {
      TelegramWebApp.instance = new TelegramWebApp()
    }
    return TelegramWebApp.instance
  }

  private initialize() {
    if (this.webApp) {
      this.webApp.ready()
      this.webApp.expand()
      
      // Set theme colors
      this.webApp.setHeaderColor('#627d98') // JUV primary color
      this.webApp.setBackgroundColor('#fdf2e9') // JUV cream color
      
      // Get user data
      if (this.webApp.initDataUnsafe?.user) {
        this.user = this.webApp.initDataUnsafe.user
      }
    }
  }

  public getUser(): TelegramUser | null {
    return this.user
  }

  public getUserId(): number | null {
    return this.user?.id || null
  }

  public getUsername(): string | null {
    return this.user?.username || null
  }

  public showMainButton(text: string, onClick: () => void) {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.setText(text)
      this.webApp.MainButton.show()
      this.webApp.MainButton.onClick(onClick)
    }
  }

  public hideMainButton() {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.hide()
    }
  }

  public showBackButton(onClick: () => void) {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.show()
      this.webApp.BackButton.onClick(onClick)
    }
  }

  public hideBackButton() {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.hide()
    }
  }

  public hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light') {
    if (this.webApp?.HapticFeedback) {
      if (type === 'success' || type === 'error' || type === 'warning') {
        this.webApp.HapticFeedback.notificationOccurred(type)
      } else {
        this.webApp.HapticFeedback.impactOccurred(type)
      }
    }
  }

  public close() {
    if (this.webApp) {
      this.webApp.close()
    }
  }

  public sendData(data: any) {
    if (this.webApp) {
      this.webApp.sendData(JSON.stringify(data))
    }
  }

  public showAlert(message: string, callback?: () => void) {
    if (this.webApp) {
      this.webApp.showAlert(message, callback)
    }
  }

  public showConfirm(message: string, callback?: (confirmed: boolean) => void) {
    if (this.webApp) {
      this.webApp.showConfirm(message, callback)
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp
  }
} 