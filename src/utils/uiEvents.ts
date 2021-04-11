export function listen(id: string, eventName: string, func: (event: CustomEvent) => void) {
    document.getElementById(id)?.addEventListener(eventName, func)
}

export function emitToCanvas(eventName: string, data: any) {
    document.getElementById('webgl-app')?.dispatchEvent(new CustomEvent(eventName, { detail: data }))
}