import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getToken } from "../utils/auth";

window.Pusher = Pusher;

const token = getToken();

const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: false,
    enabledTransports: ["ws", "wss"],

    authEndpoint: "http://localhost:8000/api/broadcasting/auth",

    auth: {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    },
});

export default echo;