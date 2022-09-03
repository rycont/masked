import { Vexile } from "@haechi/flexile"
import { styled } from "@stitches/react"
import { ImageFitter } from "../../components"

export const Image = styled(ImageFitter, {
    width: "100%",
    height: "100%",
    objectFit: "contain",
})

export const ImageMaskerWrapper = styled("div", {
    width: "100%",
    height: "100%",
    userSelect: "none",
})

export const Container = styled(Vexile, {

})