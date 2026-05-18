import posthog from "posthog-js";

export const track = (event: string, properties?: Record<string, any>) => {
    if (typeof window === "undefined") return;
    posthog.capture(event, properties);
};

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
    if (typeof window === "undefined") return;
    posthog.identify(userId, traits);
};
