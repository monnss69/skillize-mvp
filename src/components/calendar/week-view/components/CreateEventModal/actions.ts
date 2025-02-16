"use server";

import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/event`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create event');
        }

        // Revalidate the calendar page to fetch the new event
        revalidatePath("/web/calendar");
        return { success: true };
    } catch (error: any) {
        console.error('Error creating event:', error);
        throw new Error(error.message || 'An unexpected error occurred');
    }
}
