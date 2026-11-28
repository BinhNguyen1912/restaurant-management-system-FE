import { redirect } from 'next/navigation'

/**
 * VNPay redirect về `${FRONTEND_URL}/payment-failed`. Chuyển tiếp sang trang kết quả của khách,
 * giữ nguyên query để hiện đúng thông báo.
 */
export default function PaymentFailedRedirect({
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
