<div align="center">
  <div style="font-size: 64px; margin-bottom: 20px;">🥗</div>
  <h1>Akıllı Gıda İsrafını Önleme Sistemi</h1>
  <p>Ev içi gıda israfını en aza indirmek için tasarlanmış; son kullanma tarihi takibi yapan ve eldeki ürünlere göre Yapay Zeka destekli yaratıcı yemek tarifleri sunan modern Full-Stack web uygulaması.</p>
  
  <div>
    <img src="https://img.shields.io/badge/.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white" alt=".NET" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/Groq_AI-F59E0B?style=for-the-badge&logo=groq&logoColor=white" alt="Groq AI" />
  </div>
</div>

---

## 📖 Proje Hakkında

Her yıl dünya çapında tonlarca gıda, buzdolabında unutulduğu veya nasıl değerlendirileceği bilinmediği için çöpe gidiyor. **Akıllı Gıda İsrafını Önleme Sistemi**, kullanıcıların satın aldıkları gıdaları takip etmelerini, yaklaşan son kullanma tarihlerinden anında haberdar olmalarını ve **Yapay Zeka** sayesinde bozulmak üzere olan ürünlerle neler pişirebileceklerini keşfetmelerini sağlar.

Proje, **Clean Architecture (Temiz Mimari)** prensipleriyle geliştirilmiş sağlam bir **.NET 9** backend'i ile **Next.js** tabanlı ultra modern ve duyarlı (responsive) bir frontend arayüzünü bir araya getirir.

### ✨ Temel Özellikler

- **🔐 Güvenli Kimlik Doğrulama:** JWT (JSON Web Token) altyapısı ile güvenli kayıt olma, giriş yapma ve e-posta doğrulama akışları.
- **📦 Gelişmiş Envanter Yönetimi:** Kullanıcıya özel gıda dolabı. Ürün ekleme, miktar/tarih düzenleme ve silme işlemleri (Tam CRUD yeteneği).
- **🚦 Akıllı SKT (Son Kullanma Tarihi) Takibi:** Ürünlerin bozulmasına kalan gün sayısına göre otomatik renk kodlaması (Taze, Dikkat, Kritik, Süresi Doldu) ve görsel ilerleme çubukları.
- **🤖 Yapay Zeka Destekli Tarif Motoru:** **Groq AI (Llama 3.3)** entegrasyonu. Sistem, son kullanma tarihi 7 günden az kalan ürünleri otomatik algılar ve bu ürünleri kullanarak israfı önleyecek detaylı (adım adım, malzeme ölçülü ve zorluk seviyeli) yemek tarifleri üretir.
- **🌙 Premium UI/UX:** Özel tasarım tokenleri, Glassmorphism (cam efekti) detayları, pürüzsüz mikro-animasyonlar ve göz yormayan modern Dark Theme.
- **🐳 Tam Konteynerizasyon:** Frontend, Backend ve Veritabanı tek bir `docker-compose` komutuyla her ortamda eksiksiz ve sorunsuz çalışır.

## 🛠️ Kullanılan Teknolojiler

**Backend (Sunucu Tarafı):**
- ASP.NET Core Web API (.NET 9)
- Entity Framework Core (Code-First)
- PostgreSQL
- Clean Architecture (Domain, Application, Infrastructure, Presentation)
- JWT Authentication & Bcrypt Password Hashing

**Frontend (Kullanıcı Arayüzü):**
- Next.js (App Router yapısı)
- React.js
- Vanilla CSS (Tailwind mantığında yazılmış özel yardımcı sınıflar ve CSS değişkenleri)
- TypeScript

**Yapay Zeka & DevOps:**
- Groq API (LLaMA-3.3-70b-versatile Modeli - Doğal Dil İşleme)
- Docker & Docker Compose

## 🚀 Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak oldukça basittir. 

### Gereksinimler
- Bilgisayarınızda [Docker Desktop](https://www.docker.com/products/docker-desktop) kurulu ve açık olmalıdır.

### Adımlar

1. **Projeyi Klonlayın**
   ```bash
   git clone https://github.com/kullaniciadiniz/FoodApp.git
   cd FoodApp
   ```

2. **Uygulamayı Başlatın**
   Aşağıdaki komut; PostgreSQL veritabanını oluşturur, Backend .NET kodlarını derler ve Next.js uygulamasını ayağa kaldırır.
   ```bash
   docker-compose up -d --build
   ```

3. **Erişim Adresleri**
   - **Kullanıcı Arayüzü (Frontend):** [http://localhost:3000](http://localhost:3000)
   - **API Sunucusu (Backend):** [http://localhost:5050](http://localhost:5050)
   - **Swagger (API Dökümantasyonu):** [http://localhost:5050/swagger](http://localhost:5050/swagger)

## 📸 Ekran Görüntüleri

*(Projenizi GitHub'a yükledikten sonra buraya uygulamanın Dashboard, Kayıt ekranı ve Yapay Zeka Tarif Önerileri kısmının fotoğraflarını eklemeyi unutmayın!)*

## 📂 Proje Mimarisi

```text
FoodApp/
├── src/
│   ├── FoodApp.API/            # Sunum Katmanı (Controller'lar)
│   ├── FoodApp.Application/    # İş Kuralları, DTO'lar ve Arayüzler
│   ├── FoodApp.Domain/         # Temel Varlıklar (Entities)
│   ├── FoodApp.Infrastructure/ # Veritabanı (EF Core), Groq AI ve Jwt Entegrasyonu
├── frontend/                   # Next.js Uygulaması
│   ├── app/                    # Sayfalar (Dashboard, Recipes vs.) ve Layout
│   ├── public/                 # Statik Dosyalar
│   ├── globals.css             # Tasarım Sistemi (Design System)
│   └── Dockerfile              # Frontend imaj dosyası
├── docker-compose.yml          # Konteyner orkestrasyon dosyası
└── README.md                   # Proje dokümantasyonu
```

## 🤝 Geliştirme Katkıları
Bu proje staj/mülakat değerlendirmeleri ve kişisel gelişim amaçlı oluşturulmuştur. Fikir ve önerilerinize her zaman açıktır.

## 📜 Lisans
MIT Lisansı ile dağıtılmaktadır. İstediğiniz gibi kullanabilir ve geliştirebilirsiniz.
