import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/auth.config";
import { getServerSession } from "next-auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * Retrieves the user's OAuth connections
 * 
 * @param request NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;
    const supabase = createClient();

    const { data, error } = await supabase.from("oauth_connections").select("*").eq("user_id", user_id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

/**
 * Creates a new OAuth connection for a user
 * 
 * @param request NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
