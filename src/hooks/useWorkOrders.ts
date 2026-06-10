import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/mockApi';
import { WorkOrder } from '@/types/weldcloud';

export function useWorkOrders() {
  return useQuery({ queryKey: ['workOrders'], queryFn: api.listWorkOrders });
}

export function useParts() {
  return useQuery({ queryKey: ['parts'], queryFn: api.listParts });
}

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: api.listUsers });
}

export function useSaveWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (wo: WorkOrder) => api.saveWorkOrder(wo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workOrders'] }),
  });
}

export function useDeleteWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteWorkOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workOrders'] }),
  });
}
