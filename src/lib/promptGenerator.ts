import { Catalog } from '../types/catalog';

export function generateAiPrompt(catalog: Catalog): string {
  const { business, products, categories, theme } = catalog;

  const productListStr = products.map((p, idx) => {
    const catName = categories.find(c => c.id === p.categoryId)?.name || 'Umum';
    return `[Product ID: ${p.id}]
- Nama: ${p.name} (SKU: ${p.sku})
- Kategori: ${catName}
- Harga: Rp ${p.price.toLocaleString('id-ID')}${p.discountPrice ? ` (Harga Coret: Rp ${p.discountPrice.toLocaleString('id-ID')})` : ''}
- Badge: ${p.badge || 'Tidak ada'}
- Stok: ${p.stockStatus}
- Deskripsi: ${p.description}
- Gambar URL: ${p.images[0] || 'https://via.placeholder.com/400'}
- Text CTA: ${p.ctaText || 'Pesan Sekarang'}`;
  }).join('\n\n');

  const categoryListStr = categories.map(c => `- ${c.name} (ID: ${c.id})`).join('\n');

  return `Buatkan halaman website HTML5 & CSS3 katalog produk digital modern, responsif, dan profesional untuk bisnis berikut:

=== DATA BISNIS ===
Nama Bisnis: ${business.name}
Kategori Bisnis: ${business.category}
Deskripsi: ${business.description}
Logo URL: ${business.logo || 'https://via.placeholder.com/150'}
Telepon / WhatsApp: ${business.whatsapp || business.phone}
Email: ${business.email}
Alamat: ${business.address}
Jam Operasional: ${business.openingHours}
Social Media: Instagram (${business.instagram}), TikTok (${business.tiktok})

=== PILIHAN TEMA & DESAIN ===
Tema: ${theme.themeName}
Warna Utama (Primary): ${theme.primaryColor}
Warna Sekunder: ${theme.secondaryColor}
Warna Latar Belakang: ${theme.backgroundColor}
Warna Teks: ${theme.textColor}
Warna Tombol CTA: ${theme.buttonColor}
Font Family: ${theme.fontFamily}

=== DAFTAR KATEGORI PRODUK ===
${categoryListStr}

=== DAFTAR PRODUK (${products.length} Produk) ===
${productListStr}

=== SYARAT & WAJIB MARKER HTML (SANGAT PENTING!) ===
Agar katalog ini dapat di-edit tanpa coding di aplikasi Catalog Builder Pro, kamu WAJIB menyematkan atribut marker HTML data-cb-type, data-cb-id, dan data-cb-field pada setiap elemen terkait!

Gunakan aturan marker berikut:
1. Container produk utama:
   <div data-cb-type="product-card" data-cb-id="[PRODUCT_ID]">
2. Elemen Nama Produk:
   <h3 data-cb-field="name" data-cb-id="[PRODUCT_ID]">${products[0]?.name || 'Nama Produk'}</h3>
3. Elemen Harga Produk:
   <span data-cb-field="price" data-cb-id="[PRODUCT_ID]">Rp ${products[0]?.price.toLocaleString('id-ID') || '0'}</span>
4. Elemen Harga Coret / Diskon:
   <span data-cb-field="discountPrice" data-cb-id="[PRODUCT_ID]">Rp ...</span>
5. Elemen Deskripsi Produk:
   <p data-cb-field="description" data-cb-id="[PRODUCT_ID]">${products[0]?.description || ''}</p>
6. Elemen Gambar Produk:
   <img data-cb-field="image" data-cb-id="[PRODUCT_ID]" src="..." alt="...">
7. Elemen Badge (Best Seller / New / Promo):
   <span data-cb-field="badge" data-cb-id="[PRODUCT_ID]">...</span>
8. Elemen Tombol CTA:
   <a data-cb-field="cta" data-cb-id="[PRODUCT_ID]" href="...">Pesan Sekarang</a>
9. Informasi Bisnis Header & Footer:
   <h1 data-cb-field="business-name">${business.name}</h1>
   <img data-cb-field="business-logo" src="${business.logo}" />
   <p data-cb-field="business-description">${business.description}</p>
   <a data-cb-field="business-whatsapp" href="https://wa.me/${business.whatsapp}">WhatsApp</a>

=== KETENTUAN TEKNIS LENGKAPAN ===
- Berikan KODE UTUH HTML5 dalam satu blok kode \`\`\`html ... \`\`\` lengkap dengan tag <style> di dalam <head>.
- Desain harus sangat elegan, bersih, responsive (mobile & desktop look great), dan modern.
- TIDAK BOLEH menggunakan JavaScript/JS eksternal maupun frameworks JS (seperti React/Vue). HANYA MURNI HTML + CSS!
- Dilarang keras mengubah atau mengurangi nama produk, harga, maupun deskripsi yang sudah diberikan di atas.
- Sertakan grid layout yang rapi untuk menampilkan daftar produk sesuai kategori.`;
}
