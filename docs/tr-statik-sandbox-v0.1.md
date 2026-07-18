# Statics Sandbox v0.1

## 1. Amaç

Statics Sandbox, kullanıcının iki boyutlu bir rijit cisim modeli
oluşturmasına ve statik dengeyi temel prensiplerden incelemesine
olanak sağlayan sezgisel bir mühendislik aracıdır.

İlk sürümün amacı belirli bir kiriş veya hazır mesnet kombinasyonunu
çözmek değildir.

Çözücü:

- Kullanıcının oluşturduğu fiziksel modeli okuyacak,
- bilinmeyen reaksiyonları modelden çıkaracak,
- denge denklemlerini otomatik kuracak,
- çözümün mümkün olup olmadığını değerlendirecek,
- sonucu ve modeldeki problemleri anlaşılır biçimde açıklayacaktır.

---

## 2. Temel kullanıcı akışı

1. Kullanıcı sandbox sayfasını açar.
2. Sahne üzerinde bir rijit dikdörtgen gövde bulunur.
3. Kullanıcı gövdeye mesnetler ekler.
4. Kullanıcı kuvvet veya moment ekler.
5. Kullanıcı nesneleri seçerek özelliklerini düzenler.
6. Kullanıcı Solve düğmesine basar.
7. Çözücü denge denklemlerini kurar.
8. Reaksiyonlar veya model uyarıları gösterilir.
9. Kullanıcı serbest cisim diyagramı görünümüne geçebilir.

---

## 3. Desteklenen model

### Boyut

- İki boyutlu düzlem
- Global x ve y koordinat sistemi
- Saat yönünün tersine moment pozitif

### Gövdeler

- Tek rijit gövde
- İlk görsel biçim: dikdörtgen
- Gövde deformasyonu yok
- Gövdenin kütlesi ve ağırlığı ilk sürümde otomatik eklenmez

### Referans dünya

- Sabit zemin
- Zemin yalnızca mesnetlerin bağlandığı referanstır
- Doğrudan temas çözümü yapılmaz

---

## 4. Desteklenen nesneler

### RigidBody

Özellikler:

- Kimlik
- Merkez konumu
- Genişlik
- Yükseklik
- Dönme açısı

### Ground

Özellikler:

- Düşey konum
- Görsel uzunluk

Ground çözüm sistemine doğrudan kuvvet eklemez.

### PinSupport

İki bilinmeyen reaksiyon oluşturur:

- Yatay reaksiyon
- Düşey reaksiyon

### RollerSupport

Tek bilinmeyen reaksiyon oluşturur.

Reaksiyon doğrultusu, destek yüzeyinin normal doğrultusudur.

İlk sürümde varsayılan doğrultu düşeydir.

### PointForce

Özellikler:

- Büyüklük
- Yön veya açı
- Uygulama noktası
- Bağlı olduğu gövde

### AppliedMoment

Özellikler:

- Büyüklük
- Pozitif veya negatif yön
- Bağlı olduğu gövde

---

## 5. Denge denklemleri

Çözücü aşağıdaki üç bağımsız düzlemsel denge denklemini kuracaktır:

- Toplam yatay kuvvet sıfır
- Toplam düşey kuvvet sıfır
- Seçilen referans noktasına göre toplam moment sıfır

Matris gösterimi:

A r = b

Burada:

- A: denge ve reaksiyon katsayı matrisi
- r: bilinmeyen reaksiyonlar
- b: dış yüklerin oluşturduğu sağ taraf

Denklemler hazır mesnet kombinasyonlarına göre yazılmayacaktır.
Modeldeki mesnetlerin konum ve doğrultularından otomatik üretilecektir.

---

## 6. Çözüm sınıflandırması

Çözücü modeli aşağıdaki durumlardan biriyle sınıflandıracaktır.

### Solvable

Reaksiyonlar tekil ve tutarlı biçimde hesaplanabilir.

### Underconstrained

Gövdenin en az bir serbest rijit cisim hareketi vardır.

Olası durumlar:

- Yatay öteleme
- Düşey öteleme
- Dönme
- Bunların bir kombinasyonu

### Statically indeterminate

Bilinmeyen reaksiyon sayısı, bağımsız denge denklemlerinin
belirleyebileceğinden fazladır.

Bu sürüm deformasyon uyumluluğu kullanmayacağı için reaksiyonlar
yalnızca statik dengeyle hesaplanamaz.

### Inconsistent

Kurulan denklemler birbiriyle veya uygulanan yüklerle tutarlı değildir.

### Invalid model

Modelde eksik, bozuk veya fiziksel anlamı olmayan veri vardır.

---

## 7. Kullanıcı uyarıları

Uyarılar yalnızca teknik hata kodu olarak gösterilmeyecektir.

Örnek mesajlar:

- Gövde yatay doğrultuda serbestçe hareket edebilir.
- Gövdenin dönmesini engelleyen yeterli kısıt bulunmuyor.
- Bu modelde reaksiyon sayısı statik denge denklemlerinden fazladır.
- Kuvvet büyüklüğü geçerli bir sayı olmalıdır.
- Kuvvetin uygulama noktası bir gövdeye bağlı değildir.
- Modelde çözülecek bilinmeyen reaksiyon bulunmuyor.
- Denge matrisi tekildir; reaksiyonlar benzersiz olarak belirlenemiyor.

---

## 8. Arayüz ilkeleri

Arayüz mümkün olduğunca sade olacaktır.

### Orta alan

- Sandbox sahnesi
- Gövde
- Zemin
- Mesnetler
- Kuvvet ve moment sembolleri

### Sol araç çubuğu

- Seç
- Gövde ekle
- Mafsal ekle
- Makara ekle
- Kuvvet ekle
- Moment ekle
- Sil

### Sağ özellik paneli

Yalnızca seçili nesneye ait özellikleri gösterir.

Hiçbir nesne seçili değilken panel boş veya daraltılmış olabilir.

### Alt durum alanı

Modelin çözüm durumunu kısa ve anlaşılır biçimde gösterir.

### Temel düğmeler

- Solve
- Reset
- Free Body Diagram

---

## 9. İlk sürümde bulunmayacak özellikler

Aşağıdaki özellikler v0.1 kapsamı dışındadır:

- Kutu ile zemin arasında doğrudan temas
- Sürtünme
- Temas basıncı dağılımı
- Devrilme
- Yerden ayrılma
- Birden fazla rijit gövde
- İç mafsallar
- Kablo veya çubuk elemanlar
- Dağıtılmış yükler
- Gövde ağırlığının otomatik hesaplanması
- Deformasyon
- Gerilme
- Şekil değiştirme
- Kiriş teorisi
- Sonlu elemanlar
- Dinamik analiz
- Üç boyutlu analiz
- Kullanıcı hesabı
- Model kaydetme
- PDF raporu

Bu özelliklerin kapsam dışında olması geçici ve bilinçli bir karardır.

---

## 10. Yazılım mimarisi ilkeleri

- Fiziksel model ile ekrandaki çizim birbirinden ayrılacaktır.
- Çözücü, HTML elemanlarına doğrudan bağımlı olmayacaktır.
- Matematik fonksiyonları arayüz kodundan bağımsız olacaktır.
- Nesneler kimliklerle takip edilecektir.
- Kullanıcı girdileri çözümden önce doğrulanacaktır.
- Sayısal toleranslar tek bir yerde tanımlanacaktır.
- Her aşamada küçük ve test edilebilir fonksiyonlar kullanılacaktır.
- Hazır mesnet kombinasyonları için özel formüller yazılmayacaktır.

---

## 11. Planlanan dosya yapısı

```text
statics.html

css/
  statics-sandbox.css

js/
  statics/
    app.js
    model.js
    objects.js
    equilibrium.js
    linear-algebra.js
    solver.js
    validation.js
    renderer.js
    interaction.js
    ui.js
