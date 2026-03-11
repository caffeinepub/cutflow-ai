import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SocialAccount {
    platform: string;
    accountHandle: string;
}
export interface VideoProject {
    id: bigint;
    status: string;
    title: string;
    owner: Principal;
    createdAt: bigint;
    description: string;
    platform: string;
}
export interface UserProfile {
    name: string;
}
export interface ScheduledPost {
    status: string;
    title: string;
    scheduledTime: bigint;
    description: string;
    platform: string;
    projectId: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSocialAccount(platform: string, accountHandle: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createVideoProject(title: string, description: string, platform: string): Promise<bigint>;
    deleteVideoProject(projectId: bigint): Promise<void>;
    getAllScheduledPosts(): Promise<Array<ScheduledPost>>;
    getAllVideoProjects(): Promise<Array<VideoProject>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getScheduledPosts(projectId: bigint): Promise<Array<ScheduledPost>>;
    getSocialAccounts(): Promise<Array<SocialAccount>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideoProject(projectId: bigint): Promise<VideoProject>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    schedulePost(projectId: bigint, platform: string, scheduledTime: bigint, title: string, description: string): Promise<void>;
    updatePostStatus(projectId: bigint, postIndex: bigint, newStatus: string): Promise<void>;
    updateVideoProject(projectId: bigint, title: string, description: string, platform: string, status: string): Promise<void>;
}
