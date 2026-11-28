import { redirect } from 'next/navigation'

/**
 * VNPay redirect về `${FRONTEND_URL}/payment-success` (BE không biết FE đặt trang dưới `/guest`).
 * Thiếu route này thì khách vừa trả tiền xong thấy 404 và tưởng giao dịch thất bại.
 *
 * Trang chỉ chuyển tiếp, giữ nguyên query (`status`, `amount`, `guestId`, ...).
 */
export default function PaymentSuccessRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  redirect(`/guest/payment-success?${toQueryString(searchParams)}`)
}

function toQueryString(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item))
    else if (value !== undefined) query.set(key, value)
  }
  return query.toString()
}
