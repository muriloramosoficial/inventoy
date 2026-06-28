import { SupabaseClient } from "@supabase/supabase-js";
import type { AsaasWebhookPayload, AsaasEvent } from "../domain/asaas.types";

const EVENT_STATUS_MAP: Record<string, string> = {
  PAYMENT_CONFIRMED: "active",
  PAYMENT_RECEIVED: "active",
  PAYMENT_OVERDUE: "past_due",
  PAYMENT_REFUNDED: "canceled",
  PAYMENT_FAILED: "incomplete",
  SUBSCRIPTION_CANCELED: "canceled",
};

export async function handleWebhookUseCase(
  supabase: SupabaseClient,
  payload: AsaasWebhookPayload
): Promise<void> {
  const event = payload.event as AsaasEvent;
  const subId = payload.subscription?.id || payload.payment?.subscription;

  if (!subId) return;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("subscription_id", subId)
    .single();

  if (!tenant) return;

  if (event === "SUBSCRIPTION_UPDATED" && payload.subscription?.status) {
    const statusMap: Record<string, string> = {
      ACTIVE: "active", OVERDUE: "past_due",
      CANCELED: "canceled", EXPIRED: "canceled",
    };
    const mappedStatus = statusMap[payload.subscription.status] || "active";
    await supabase.from("tenants").update({ subscription_status: mappedStatus }).eq("id", tenant.id);
  } else {
    const status = EVENT_STATUS_MAP[event];
    if (status) {
      await supabase.from("tenants").update({ subscription_status: status }).eq("id", tenant.id);
    }
  }
}
