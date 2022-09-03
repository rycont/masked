import { ImageItem } from "../contatnts/types"
import { supabase } from "./setup"

export const getImageLists = async () => {
    const result = await supabase.from("image").select("*").order("created_at", { ascending: false }).limit(20)
    return result.data as ImageItem[]
}

export const getImageListsSuspend = () => {
    let result: ImageItem[]
    const promise = getImageLists().then(
        (data) => {
            result = data
        }
    )

    return {
        read() {
            if (result) {
                return result
            }
            throw promise
        }
    }
}