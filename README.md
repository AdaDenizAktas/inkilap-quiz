# İnkılap Tarihi Quiz

Tek sayfalık, mobil uyumlu, Vue tabanlı soru uygulaması.

## Özellikler

- 645 soruluk JSON veri kaynağı
- Her yeni soruda rastgele soru seçimi
- Her soruda şıkların yeri tekrar karıştırılır
- Doğru seçimde doğru şık yeşil görünür
- Yanlış seçimde seçilen şık kırmızı, doğru şık yeşil görünür
- Yanlış durumda **Tekrar dene** ile aynı soru sıfırlanır ve şıklar yeniden karışır
- Kısa şıklarda 2x2 görünüm, uzun şıklarda tek kolon görünüm
- Mobil öncelikli tasarım

## Dosya yapısı

```text
inkilap-vue-quiz/
├─ index.html
├─ app.js
├─ style.css
├─ .nojekyll
├─ data/
│  └─ questions.json
└─ README.md
```

## Lokal önizleme

Basit bir sunucu ile aç:

### Python

```bash
python -m http.server 8080
```

Sonra tarayıcıda:

```text
http://localhost:8080
```

## GitHub repo oluşturma ve push

### 1) Yeni repo aç

GitHub üzerinde örnek repo adı:

```text
inkilap-quiz
```

### 2) Projeyi yerelde aç

```bash
cd path/to/inkilap-vue-quiz
```

### 3) Git başlat

```bash
git init
git add .
git commit -m "Initial commit - inkilap quiz app"
```

### 4) GitHub remote ekle

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inkilap-quiz.git
git push -u origin main
```

## GitHub Pages ile yayınlama

Bu proje build gerektirmeyen statik dosyalardan oluşur.

### Kolay yöntem

GitHub repo içinde:

- **Settings**
- **Pages**
- **Build and deployment**
- **Source = Deploy from a branch**
- **Branch = main**
- **Folder = /(root)**
- **Save**

Bundan sonra site şu yapıda açılır:

```text
https://YOUR_USERNAME.github.io/inkilap-quiz/
```

## JSON güncelleme

Yeni soru bankası kullanacaksan sadece şu dosyayı değiştir:

```text
data/questions.json
```

Format:

```json
{
  "data": [
    {
      "id": 1,
      "question": "...",
      "o1": "...",
      "o2": "...",
      "o3": "...",
      "o4": "...",
      "correctOption": "o2"
    }
  ]
}
```
