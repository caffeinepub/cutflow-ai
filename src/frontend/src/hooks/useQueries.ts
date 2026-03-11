import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetAllProjects() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideoProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProject(projectId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["project", projectId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVideoProject(projectId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      platform: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createVideoProject(
        data.title,
        data.description,
        data.platform,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      platform: string;
      status: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateVideoProject(
        data.id,
        data.title,
        data.description,
        data.platform,
        data.status,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteVideoProject(projectId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useGetSocialAccounts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["socialAccounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSocialAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSocialAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { platform: string; accountHandle: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.addSocialAccount(data.platform, data.accountHandle);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["socialAccounts"] }),
  });
}

export function useGetAllScheduledPosts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["scheduledPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllScheduledPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSchedulePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      projectId: bigint;
      platform: string;
      scheduledTime: bigint;
      title: string;
      description: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.schedulePost(
        data.projectId,
        data.platform,
        data.scheduledTime,
        data.title,
        data.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduledPosts"] }),
  });
}

export function useUpdatePostStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      projectId: bigint;
      postIndex: bigint;
      newStatus: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updatePostStatus(
        data.projectId,
        data.postIndex,
        data.newStatus,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduledPosts"] }),
  });
}
