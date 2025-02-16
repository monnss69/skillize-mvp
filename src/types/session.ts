import { Session } from "next-auth";
import { Profile } from "next-auth";

export interface ExtendedSession extends Session {
    user: {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        accessToken?: string;
        refreshToken?: string;
        googleId?: string;
    }
}

export interface ExtendedProfile extends Profile {
    email_verified?: boolean;
    email?: string;
    accessToken?: string;
    refreshToken?: string;
}