import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/auth.config";
import { getServerSession } from "next-auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createCourseSchema = z.object({
    title: z.string(),
    description: z.string(),
    duration: z.string(),
    difficulty_level: z.string(),
    estimated_completion_time: z.string(),
});

const updateCourseSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    duration: z.string().optional(),
    difficulty_level: z.string().optional(),
    estimated_completion_time: z.string().optional(),
});

/**
 * Retrieves all courses for a user
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

    const { data, error } = await supabase.from("courses").select("*").eq("user_id", user_id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

/**
 * Creates a new course for a user
 * 
 * @param request NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
export async function POST(request: NextRequest) {
    const body = await request.json();
    const validatedBody = createCourseSchema.parse(body);

    if (!validatedBody) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;
    const supabase = createClient();

    const { data, error } = await supabase.from("courses").insert({ user_id, ...validatedBody }).select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
} 

/**
 * Updates a course for a user
 * 
 * @param request NextRequest object containing the request
 * @returns NextResponse object with the response data
 */
export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const validatedBody = updateCourseSchema.parse(body);

    if (!validatedBody) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;
    const supabase = createClient();

    const { data, error } = await supabase.from("courses").update(validatedBody).eq("user_id", user_id).eq("id", validatedBody.id).select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}