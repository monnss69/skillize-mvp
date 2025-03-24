"use server";

import { syncGoogleCalendar } from "@/lib/actions";

export async function syncCalendar() {
    try {
        const result = await syncGoogleCalendar();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to sync calendar');
        }
        
        return result;
    } catch (error: any) {
        console.error('Error syncing calendar:', error);
        throw new Error(error.message || 'Failed to sync calendar');
    }
}

