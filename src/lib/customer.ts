import { supabase } from "@/integrations/supabase/client";

export type CustomerProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  default_address: {
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
  } | null;
};

/** Fetches (and lazily creates) the customer row for the signed-in user. */
export async function getOrCreateCustomer(): Promise<CustomerProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data: existing } = await supabase
    .from("customers")
    .select("id,full_name,email,phone,default_address")
    .eq("supabase_auth_id", user.id)
    .maybeSingle();
  if (existing) return existing as CustomerProfile;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const { data: created } = await supabase
    .from("customers")
    .insert({
      supabase_auth_id: user.id,
      email: user.email ?? null,
      full_name: typeof meta.full_name === "string" ? meta.full_name : null,
      phone: typeof meta.phone === "string" ? meta.phone : null,
    })
    .select("id,full_name,email,phone,default_address")
    .maybeSingle();
  return (created as CustomerProfile | null) ?? null;
}

/** Insert-or-update the signed-in customer's profile. */
export async function saveCustomerProfile(values: {
  full_name: string;
  phone: string;
  default_address: CustomerProfile["default_address"];
}) {
  const current = await getOrCreateCustomer();
  if (!current) throw new Error("Please sign in first");
  const { error } = await supabase
    .from("customers")
    .update({
      full_name: values.full_name,
      phone: values.phone,
      default_address: values.default_address,
    })
    .eq("id", current.id);
  if (error) throw new Error(error.message);
}
