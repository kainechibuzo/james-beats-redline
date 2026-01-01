import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";

export const usePaystackUrl = () => {
  return useQuery({
    queryKey: ["paystack-url"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "paystack_payment_url")
        .single();
      
      if (error) throw error;
      return data?.value || "";
    },
  });
};

export const useUpdatePaystackUrl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (url: string) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: url })
        .eq("key", "paystack_payment_url");
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paystack-url"] });
    },
  });
};

export const useSubscriptionTier = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["subscription-tier", user?.id],
    queryFn: async () => {
      if (!user?.id) return "free";
      
      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("user_id", user.id)
        .single();
      
      if (error) return "free";
      return data?.subscription_tier || "free";
    },
    enabled: !!user?.id,
  });
};

export const useUpdateSubscriptionTier = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (tier: "free" | "premium" | "artist") => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_tier: tier })
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-tier"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useIsPremium = () => {
  const { user } = useAuth();
  const { data: tier } = useSubscriptionTier();
  const { data: isAdmin } = useIsAdmin();
  
  // Admins always have premium access
  if (isAdmin) return true;
  
  // No user means free access (no restrictions)
  if (!user) return true;
  
  return tier === "premium" || tier === "artist";
};

export const useCanAccessPremiumFeature = () => {
  const { data: paystackUrl } = usePaystackUrl();
  const isPremium = useIsPremium();
  
  // If no Paystack URL is configured, all features are free
  if (!paystackUrl || paystackUrl.trim() === "") {
    return { canAccess: true, requiresPayment: false, paystackUrl: "" };
  }
  
  // If user is premium or admin, they can access
  if (isPremium) {
    return { canAccess: true, requiresPayment: false, paystackUrl };
  }
  
  // Free user with Paystack configured
  return { canAccess: false, requiresPayment: true, paystackUrl };
};
