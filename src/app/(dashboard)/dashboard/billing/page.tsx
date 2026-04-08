"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import {
  CreditCard, CheckCircle2, AlertTriangle, X,
  Shield, Clock, RefreshCw, Loader2, Zap, CalendarDays,
  TrendingUp, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { PRICING } from "@/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface UserData {
  id: string; email: string; name: string | null;
  stripeCustomerId?: string | null;
  subscription?: {
    status: string;
    trialEnd: string | null;
    stripeCurrentPeriodEnd: string;
    stripeCancelAtPeriodEnd: boolean;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active:   { label: "Activo",      color: "bg-green-100 text-green-800",     dot: "bg-green-500"   },
  trialing: { label: "Prueba",      color: "bg-blue-100 text-blue-800",       dot: "bg-blue-500"    },
  past_due: { label: "Pago fallido",color: "bg-red-100 text-red-800",         dot: "bg-red-500"     },
  canceled: { label: "Cancelado",   color: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
  free:     { label: "Gratuito",    color: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
};

export default function BillingPage() {
  const [user,           setUser]           = useState<UserData | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [canceling,      setCanceling]      = useState(false);
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [cancelAtEnd,    setCancelAtEnd]    = useState(false);
  const [updatingCard,   setUpdatingCard]   = useState(false);
  const { t, messages } = useLanguage();
  const d = messages ? t("dashboard") : null;

  const fetchUser = async () => {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
        setCancelAtEnd(data.user.subscription?.stripeCancelAtPeriodEnd ?? false);
      }
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  const sub    = user?.subscription;
  const status = (sub?.status ?? "free") as keyof typeof STATUS_CONFIG;
  const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG.free;

  const trialExpired  = sub?.trialEnd              ? new Date(sub.trialEnd).getTime()              < Date.now() : false;
  const periodExpired = sub?.stripeCurrentPeriodEnd ? new Date(sub.stripeCurrentPeriodEnd).getTime() < Date.now() : false;

  const isPremium =
    (status === "trialing" && !trialExpired) ||
    (status === "active"   && !periodExpired);

  const fmt = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : null;

  const periodEnd  = fmt(sub?.stripeCurrentPeriodEnd);
  const trialEnd   = fmt(sub?.trialEnd);
  const trialDaysLeft = sub?.trialEnd
    ? Math.max(0, Math.ceil((new Date(sub.trialEnd).getTime() - Date.now()) / 86400000))
    : null;

  const handleUpdateCard = async () => {
    if (!user?.stripeCustomerId) {
      toast.error("No se encontró el cliente de Stripe.");
      return;
    }
    setUpdatingCard(true);
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: user.stripeCustomerId }),
      });
      const data = await res.json();
      if (data?.url) window.open(data.url, "_blank");
      else toast.error("No se pudo abrir el portal de pago.");
    } catch {
      toast.error("Error al conectar con Stripe.");
    } finally {
      setUpdatingCard(false);
    }
  };

  const handleCancelAction = async (action: "cancel" | "reactivate") => {
    setCanceling(true);
    try {
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCancelAtEnd(action === "cancel");
      setShowConfirm(false);
      toast.success(action === "cancel"
        ? "Suscripción cancelada. Mantendrás el acceso hasta el fin del período."
        : "Suscripción reactivada. Tu renovación automática está activa."
      );
      await fetchUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar la suscripción.");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return (
    <DashboardShell>
      <div className="flex items-center justify-center h-64 text-neutral-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        {d?.loading ?? "Cargando..."}
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell user={user ?? undefined}>
      <div className="min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-8 py-5">
          <h1 className="text-xl font-bold text-neutral-900">{d?.billing ?? "Facturación"}</h1>
        </div>

        <div className="px-8 py-6">

          {/* ── Stats row ── */}
          {isPremium && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Estado</span>
                </div>
                <p className="text-xl font-bold text-neutral-900 capitalize">{cfg.label}</p>
                <div className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cancelAtEnd ? "Cancela al final del período" : "Renovación automática"}
                </div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    {status === "trialing" ? "Fin del trial" : "Próxima renovación"}
                  </span>
                </div>
                <p className="text-xl font-bold text-neutral-900">
                  {status === "trialing" ? (trialEnd ?? "—") : (periodEnd ?? "—")}
                </p>
                {status === "trialing" && trialDaysLeft !== null && (
                  <p className="text-xs text-blue-600 mt-1">{trialDaysLeft} días restantes</p>
                )}
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Próximo cargo</span>
                </div>
                <p className="text-xl font-bold text-neutral-900">
                  {cancelAtEnd ? "—" : `${PRICING.monthly.label}`}
                </p>
                <p className="text-xs text-neutral-400 mt-1">{cancelAtEnd ? "Sin cargos futuros" : "por mes"}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            {/* ── Main subscription card ── */}
            <div className="col-span-2 space-y-5">

              {/* Subscription details */}
              <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">PDFCraft Premium</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {status === "trialing" && trialEnd
                        ? `Trial activo · termina el ${trialEnd}. Luego ${PRICING.monthly.label}/mes.`
                        : status === "active" && periodEnd
                        ? `${PRICING.monthly.label}/mes · Renovación: ${periodEnd}`
                        : "Sin suscripción activa"}
                    </p>
                  </div>
                  {sub && (
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-extrabold text-neutral-900">{PRICING.monthly.label}</p>
                      <p className="text-xs text-neutral-400">{d?.perMonth ?? "por mes"}</p>
                    </div>
                  )}
                </div>

                {/* Trial warning */}
                {status === "trialing" && trialEnd && (
                  <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Tu trial termina el <strong>{trialEnd}</strong>. Se te cobrará <strong>{PRICING.monthly.label}/mes</strong> automáticamente a menos que canceles antes.
                    </p>
                  </div>
                )}

                {/* Cancel notice */}
                {cancelAtEnd && sub && (
                  <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium">Suscripción cancelada</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Mantén el acceso hasta el {status === "trialing" ? trialEnd : periodEnd}. No se realizarán más cargos.
                      </p>
                    </div>
                  </div>
                )}

                {/* Past due */}
                {status === "past_due" && (
                  <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">
                      Tu último pago falló. Actualiza tu método de pago para mantener el acceso.
                    </p>
                  </div>
                )}

                {/* Actions */}
                {sub && !cancelAtEnd && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 h-9 text-sm rounded-md border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setShowConfirm(true)}
                    >
                      {status === "trialing" ? "Cancelar prueba" : "Cancelar suscripción"}
                    </Button>
                  </div>
                )}

                {sub && cancelAtEnd && (
                  <div className="mt-5">
                    <Button
                      className="gap-2 h-9 text-sm rounded-md bg-neutral-900 hover:bg-neutral-800 text-white"
                      onClick={() => handleCancelAction("reactivate")}
                      disabled={canceling}
                    >
                      {canceling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      Reactivar suscripción
                    </Button>
                  </div>
                )}

                {!sub && (
                  <div className="mt-5">
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-white h-9 text-sm rounded-md" asChild>
                      <Link href="/pricing">Activar suscripción</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Payment method */}
              {sub && (
                <div className="rounded-xl border border-neutral-200 bg-white p-6">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> {d?.paymentMethod ?? "Método de pago"}
                  </h3>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                  <CreditCard className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">•••• •••• •••• ••••</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Tarjeta guardada de forma segura</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-md gap-1.5"
                  onClick={handleUpdateCard}
                  disabled={updatingCard}
                >
                  {updatingCard ? <Loader2 className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />}
                  Actualizar tarjeta
                </Button>
              </div>
                </div>
              )}
            </div>

            {/* ── Right: legal + features ── */}
            <div className="space-y-5">
              {/* Features included */}
              {isPremium && (
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3">Incluido en tu plan</h3>
                  <ul className="space-y-2">
                    {[
                      "Editar y anotar PDFs",
                      "Convertir a Word, JPG…",
                      "Fusionar y dividir",
                      "Comprimir PDFs",
                      "Sin marcas de agua",
                      "Almacenamiento ilimitado",
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-neutral-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Legal */}
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  {d?.subscriptionTerms ?? "Condiciones de suscripción"}
                </h3>
                <div className="space-y-2 text-xs text-neutral-500 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400 mt-0.5 shrink-0" />
                    <span>Tu trial cuesta <strong className="text-neutral-700">0,50 €</strong> y da 2 días de acceso completo.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-neutral-400 mt-0.5 shrink-0" />
                    <span>Tras el trial, la suscripción se renueva automáticamente a <strong className="text-neutral-700">{PRICING.monthly.label}/mes</strong> hasta que canceles.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-3.5 w-3.5 text-neutral-400 mt-0.5 shrink-0" />
                    <span>Cancela cuando quieras desde esta página. Sin preguntas.</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href="/legal/subscription" className="text-xs text-neutral-500 underline hover:text-neutral-800">Suscripción</Link>
                  <Link href="/legal/refund"       className="text-xs text-neutral-500 underline hover:text-neutral-800">Reembolso</Link>
                  <Link href="/legal/terms"        className="text-xs text-neutral-500 underline hover:text-neutral-800">Términos</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cancel confirmation modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-900">
                {status === "trialing" ? "¿Cancelar prueba?" : "¿Cancelar suscripción?"}
              </h3>
              <button onClick={() => setShowConfirm(false)} className="rounded-full p-1 hover:bg-neutral-100 text-neutral-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {status === "trialing"
                ? `Si cancelas, perderás el acceso al final del trial (${trialEnd}). No se realizarán más cargos.`
                : `Si cancelas, mantendrás el acceso hasta el ${periodEnd}. Tu suscripción no se renovará.`}
            </p>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Mantener suscripción
              </button>
              <button
                onClick={() => handleCancelAction("cancel")}
                disabled={canceling}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {canceling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {status === "trialing" ? "Cancelar prueba" : "Cancelar suscripción"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
