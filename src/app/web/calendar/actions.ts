"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.config";

export async function syncCalendar() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/sync`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: session.user.id,
            accessToken: session.user.accessToken,
        }),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sync calendar');
    }
    
    return response.json();
}

