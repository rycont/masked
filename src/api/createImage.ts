import { Boundary } from "../contatnts/types"
import { supabase } from "./setup"

export const createImage = async (masks: Boundary[], image: Blob, name: string, description?: string) => {
    const uuid = crypto.randomUUID()
    const result = await supabase.storage.from("images").upload(uuid + ".png", image)
    if (result.error) {
        throw result.error
    }

    const insertResult = await supabase.from("image").insert({
        image_uri: result.data.path,
        name,
        masks,
        description,
    }).select()

    return (insertResult.data?.[0].id)
}
