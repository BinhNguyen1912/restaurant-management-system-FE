# Deploy FE lên VPS (Docker riêng, tách khỏi BE)

BE có Docker **riêng** (repo `restaurant-management-system`). Proxy + HTTPS nằm trong repo BE
(`deploy/proxy`). Repo này chỉ build 1 container Next.js và join network chung `res-mana`.

## Kiến trúc

```
Caddy (repo BE: deploy/proxy) ── app.<domain> ──► fe:3000
                              └─ api.<domain> ──► be:4000
network: res-mana (external)
```

## Chuẩn bị (một lần)

```bash
docker network create res-mana          # nếu repo BE chưa tạo
cp .env.production.example .env.production   # điền domain thật
```

## Deploy

```bash
docker compose --env-file .env.production up -d --build fe
```

## ⚠️ Điều dễ sai nhất: `NEXT_PUBLIC_*` là BUILD-TIME

`NEXT_PUBLIC_API_ENDPOINT` được **nhúng vào JS bundle** lúc `next build`. Nên:

- Đổi domain API ⇒ **phải build lại image**: `docker compose build --no-cache fe`
- Sửa `.env.production` rồi `up -d` mà **không build lại** ⇒ FE vẫn gọi domain cũ, không có lỗi nào báo.
- Sửa `.env.production` chỉ có tác dụng với các biến **runtime** (hiện chỉ `PORT`, `TZ`).

## Kiểm tra

```bash
docker compose --env-file .env.production logs -f fe
curl -fsS -H 'Cookie: locale=en' https://app.<domain>/
```

## Ghi chú
- Image dùng `output: 'standalone'` → chạy `node server.js`, không cần `npm start`.
- Không publish port 3000 ra ngoài: chỉ proxy gọi được.
