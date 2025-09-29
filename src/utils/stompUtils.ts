/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@stomp/stompjs";

export function publishJSON(stompClient: Client, destination: string, data: any) {
    stompClient.publish({
        destination,
        body: JSON.stringify(data)
    })
}