import React from 'react'
import { emitToCanvas } from '../utils/uiEvents'

const DrawButtons = () => {
    const handleDrawEvent = (type: string) => {
        if (type === "LINE") {
            emitToCanvas('draw', { type: 1 })
        } else if (type === "SQUARE") {

        } else if (type === "QUAD") {

        } else if (type === "POLY") {

        } else {

        }
    } 

    return (
        <div>
            <button onClick={() => handleDrawEvent("LINE")}>Draw Line</button>
        </div>
    )
}

export default DrawButtons
