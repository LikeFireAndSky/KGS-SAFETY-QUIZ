import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateParticipantInput, Participant } from "@/lib/types";

const BASE = "/api/participants";

export const participantsApi = {
  getAll: (): Promise<Participant[]> =>
    axios.get<Participant[]>(BASE).then((r) => r.data),

  create: (data: CreateParticipantInput): Promise<Participant> =>
    axios.post<Participant>(BASE, data).then((r) => r.data),
};

export const participantKeys = {
  all: ["participants"] as const,
};

export function useParticipants() {
  return useQuery({
    queryKey: participantKeys.all,
    queryFn: participantsApi.getAll,
    staleTime: 60 * 1000, // 1분
  });
}

export function useCreateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: participantsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantKeys.all });
    },
  });
}
