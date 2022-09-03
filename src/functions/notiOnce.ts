import { notification } from "antd"

export const notiOnce = (message: string, key: string) => {
    if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, 'true')
        notification.info({ message, duration: 10 })
    }
}
