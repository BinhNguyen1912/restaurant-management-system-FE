import { redirect } from 'next/navigation'

/**
 * BE redirect về `${FRONTEND_URL}/payment-error?error=...` khi không xác định được giao dịch
 * (amount_mismatch, intent_expired, no_pending_orders_found...). Chuyển tiếp sang trang thất bại
 * của khách để họ thấy lý do và gọi nhân viên, thay vì 404.
 */
export default function PaymentErrorRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  redirect(`/guest/payment-failed?${toQueryString(searchParams)}`)
}

function toQueryString(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item))
    else if (value !== undefined) query.set(key, value)
  }
  return query.toString()
}
