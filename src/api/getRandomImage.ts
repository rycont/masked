import { supabase } from "./setup"

export const getRandomImage = async () => {
    const items = ((await supabase.from("image").select("id")).data)
    if (!items || items.length === 0) return null

    const randomIndex = Math.floor(Math.random() * items.length)
    const randomImage = items[randomIndex]

    return randomImage.id
}