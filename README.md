## Helpdesk (Next.js + Supabase)

Sistema de tickets con:
- Next.js (App Router) + TypeScript
- Supabase (Auth + Postgres + Storage + Realtime)
- Tailwind + shadcn/ui

## Setup

1) Crea un proyecto en Supabase y ejecuta `supabase/schema.sql` en el SQL editor.
2) Activa Realtime para la tabla `public.messages` (Database → Replication / Realtime).
3) Crea `.env.local` desde `.env.example` y completa:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (necesaria para crear usuarios desde el panel admin)
4) Arranca el proyecto:

```bash
npm run dev
```

## Primer admin

El registro público crea siempre usuarios con rol `user`. Para crear el primer admin:
- Regístrate con tu email.
- En Supabase SQL editor ejecuta:

```sql
update public.profiles set role = 'admin' where email = 'TU_EMAIL';
```

Luego entra en `/dashboard/admin/users` para gestionar usuarios.

## Deploy (Vercel)

Configura las mismas variables de entorno en Vercel y despliega. La protección de rutas se hace con `proxy.ts` (Next.js 16).

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
