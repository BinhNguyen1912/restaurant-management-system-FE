import http from '@/lib/http';

export const revalidateApiRequest = (tag: string) => {
  // POST + cookie httpOnly (route handler se kiem tra role ADMIN/STAFF)
  return http.post(`/api/revalidate?tag=${tag}`, {}, {
    baseUrl: '',
  });
};
