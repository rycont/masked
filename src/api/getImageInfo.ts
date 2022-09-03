import { notification } from "antd"
import { supabase } from "./setup"

export const getImageInfo = async (id: string) => {
    const result = await supabase.from("image").select("*").eq("id", +id)

    if (!result.data || result.data?.length === 0) {
        notification.error({
            message: "이미지를 찾을 수 없어요"
        })
        throw ""
    }

    console.log(result)
    return (result.data[0])
}
