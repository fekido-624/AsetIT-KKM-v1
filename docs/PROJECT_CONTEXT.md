# PROJECT CONTEXT - AsetIT KKM

## Tujuan
Nota ini simpan konteks menyeluruh projek (architecture, DB, API, flow operasi) supaya kerja susulan boleh sambung tanpa mula dari kosong.

## Ringkasan Sistem
- App: Next.js 15 (App Router) + TypeScript.
- Data layer: Prisma + SQLite.
- UI layer: shadcn/radix + Tailwind.
- Data import/export: XLSX.
- Mobile wrapper: Capacitor Android.
- APK mode: load web production melalui `server.url`.

## Konfigurasi Utama
- App Name: AsetIT KKM
- App ID: uk.iztech.kkmasset
- Production URL (APK): https://kkmasset.iztech.uk
- Scripts penting:
  - `npm run dev`
  - `npm run build`
  - `npm run android:sync`
  - `npm run android:open`

## Database (Prisma)
### Model User
- `id` (Int, PK, autoincrement)
- `username` (String, unique)
- `passwordHash` (String)
- `role` (String: admin/user)
- `createdAt`, `updatedAt`

### Model Staff
- Identiti: `Bil`, `Nama`, `Jawatan`, `Gred`, `Emel` (unique), `Cawangan`, `Wing`, `StatusPerjawatan`, `Avatar`
- Medan aset PC/NB/Printer disimpan secara flatten dalam jadual `Staff`

## Authentication dan Authorization
- Auth cookie session signed: `asetit_session`
- Session duration: 30 hari
- Default admin auto-bootstrap jika tiada admin
- Endpoint auth:
  - `POST /api/auth/login`
  - `GET /api/auth/session`
  - `POST /api/auth/logout`
- Operasi kritikal data (staff/users/manage-data/avatar upload) dikawal role, kebanyakannya admin-only

## API Surface
### Staff
- `GET /api/staff` - list staff (optional wing filter)
- `POST /api/staff` - create/update staff by email
- `PATCH /api/staff` - update profil atau aset (PC/NB/Printer)
- `DELETE /api/staff` - delete staff by email

### Avatar
- `POST /api/staff/avatar` - upload avatar file
- `PATCH /api/staff/avatar` - set/reset avatar reference
- `GET /api/staff/avatar/files/[fileName]` - serve image (cache immutable)

### Users (Admin)
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users`
- `DELETE /api/users`

### Manage Data (Admin)
- `POST /api/admin/clear-data`
  - perlu keyword pengesahan
  - auto generate backup XLSX (base64 response)
  - delete semua staff
  - archive activity log
  - cleanup avatar uploaded files

### Activity Log
- `GET /api/activity-log/today`
- `GET /api/activity-log/by-date?date=YYYY-MM-DD`
- `GET /api/activity-log/archive-dates`
- `GET /api/activity-log/archive-by-date?date=YYYY-MM-DD`

## Proses Log Aktiviti
- Live log: `data/activity-log.jsonl`
- Archive log: `data/activity-log-archive/*.jsonl`
- Trigger pada create/update/delete/completed
- Clear-data akan archive log semasa, bukan padam terus sejarah

## Export/Import Flow
### Export Data Staff
- UI: `/dashboard/export-data`
- Web browser: `XLSX.writeFile` (download biasa)
- APK native:
  - guna `@capacitor/filesystem` + `@capacitor/share`
  - simpan ke `Documents/Exports`
  - buka share sheet untuk simpan/kongsi
  - ada guard `Capacitor.isPluginAvailable('Filesystem'/'Share')`

### Bulk Upload
- UI: `/dashboard/bulk-upload`
- guna template Excel

## Android/Capacitor Operational Flow
Untuk perubahan native/plugin:
1. `npm install` (jika dependency berubah)
2. `npm run android:sync`
3. `npm run android:open`
4. Build APK dari Android Studio
5. Jika plugin issue, uninstall app lama dan install APK baru

## Bila Perlu Rebuild APK
- Tidak perlu rebuild jika hanya perubahan web logic/UI (server.url mode)
- Perlu rebuild jika ubah plugin Capacitor, permission native, icon/splash, atau config native

## Feature Status Stabil
- Date-based activity log + archive mode
- Auto backup XLSX sebelum clear-data
- Avatar circular popup + crop editor + cache optimization
- Session persistence 30 hari
- Butang `Kosongkan` pada edit asset staf
- Export APK native save/share flow

## Git Hygiene
- Repo kadang ada fail tempatan besar/tidak berkaitan (backup/image/android artifacts)
- Semasa commit, guna selective staging supaya hanya fail berkaitan dipush

## Sambungan Kerja (Next Session)
- Untuk task baru, mula dari `src/lib` domain berkaitan dan route API terlibat
- Jika isu berbeza antara web vs APK, semak cabang `Capacitor.isNativePlatform` dan plugin availability dahulu


- Projek: AsetIT KKM (Next.js 15 + TypeScript + Prisma SQLite + shadcn/ui) dengan wrapper Android via Capacitor.
- Domain production untuk APK (server.url): https://kkmasset.iztech.uk ; appId: uk.iztech.kkmasset.
- Auth: cookie session bertandatangan; tempoh sesi dilanjutkan ke 30 hari untuk pengalaman mobile.
- Avatar staf: dialog bulat + crop drag/zoom; output 512x512, quality 0.82; cache avatar immutable.
- Activity log: ada mode Live + Archive; clear-data tidak padam log terus, sebaliknya archive ke data/activity-log-archive/.
- Clear data: auto backup XLSX sebelum padam rekod staf.
- Edit asset staf: ada butang Kosongkan untuk clear semua field asset sebelum Save.
- APK export fix: halaman Export Data detect native plugin; guna Filesystem+Share di APK, browser download kekal untuk web.
- Jika notis "Filesystem plugin is not implemented on android": biasanya APK lama; buat semula sync + rebuild + install APK terbaru (uninstall app lama jika perlu).
- Command workflow Android yang biasa: npm run android:sync -> npm run android:open -> Build APK di Android Studio.
- Bila ubah plugin/dependency Capacitor: wajib rebuild APK baru; jika hanya ubah code web, APK berasaskan server.url biasanya ikut update tanpa rebuild native.
- Repo ada perubahan tempatan tak berkaitan pada beberapa sesi (contoh backup/image/android folder); masa commit guna selective staging untuk elak tersalah push fail besar.