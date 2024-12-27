export interface Subtitle {
    id: string
    startTime: number
    endTime: number
    text: string
    translation?: string
    layer?: number
}
