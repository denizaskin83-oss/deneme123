# PENIONTALE — Gerçek Multiplayer

Bu paket, `Peniontale_Multiplayer.html` istemcisini Node.js + Socket.IO server'a bağlar.

## Kurulum

Node.js 18+ kurulu olmalı.

```bash
npm install
npm start
```

Sonra tarayıcıdan:

`http://localhost:3000`

Aynı ağdaki başka cihazlardan test etmek için server'ın çalıştığı bilgisayarın yerel IP'siyle `http://IP:3000` açılabilir.

## Şu an senkronize edilenler

- Her oyuncunun konumu
- Yönü
- Oyuncu adı
- Oyuncunun bağlanması / ayrılması
- Ortak gece-gündüz durumu
- Menction Star'ların ortak toplanması
- Oyuncu etkileşim bildirimi

## Mimari

- `Peniontale_Multiplayer.html`: client
- `server.js`: ortak dünya ve gerçek zamanlı bağlantı
- `Socket.IO`: WebSocket tabanlı iletişim
- Oyuncu hareketi server'a yaklaşık 20 kez/saniye gönderilir.

## Sonraki aşama

Kalıcı hesap/progress, ortak NPC state'i, ortak diyalog/choice state'i, oda sistemi ve server-authoritative collision/interactions eklenebilir. Bu sürüm önce gerçek zamanlı ortak dünyayı çalışır hale getirir.
