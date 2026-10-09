"use client"

import { TxFeedback as TxFeedbackBase } from "@/components/ui/tx-feedback"
import type { TxState } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"

/** @monark/ui TxFeedback fed by a demo transaction's state and the app's translated labels. */
export function TxFeedback({
  state,
  pendingLabel,
  confirmedLabel,
  onRetry,
  onDismiss,
  className,
}: {
  state: TxState
  pendingLabel?: string
  confirmedLabel?: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}) {
  const { app } = useAppCopy()
  const tx = app.tx
  return (
    <TxFeedbackBase
      phase={state.phase}
      hash={state.hash}
      error={state.error}
      signingLabel={tx.signing}
      pendingLabel={pendingLabel ?? tx.pending}
      pendingStatusLabel={tx.pendingStatus}
      confirmedLabel={confirmedLabel ?? tx.confirmed}
      failedLabel={tx.failed}
      reasons={{ rejected: tx.rejected, reverted: tx.reverted }}
      retryLabel={tx.retry}
      dismissLabel={tx.dismiss}
      onRetry={onRetry}
      onDismiss={onDismiss}
      className={className}
    />
  )
}
