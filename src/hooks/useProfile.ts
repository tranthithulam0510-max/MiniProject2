import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, updateProfile } from "@/api/mockApi";

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: fetchProfile, staleTime: 60_000 });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => queryClient.setQueryData(["profile"], profile),
  });
}
