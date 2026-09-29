import JSZip from 'jszip';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Catalog } from '../types/catalog';

export function generateStandaloneHtml(catalog: Catalog): string {
  const customBody = catalog.sanitizedHtml || generateDefaultCatalogHtml(catalog);
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${catalog.business.name} — Katalog Produk</title>
  <meta name="description" content="${catalog.business.description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${catalog.theme.primaryColor || '#0284c7'};
      --secondary: ${catalog.theme.secondaryColor || '#e0f2fe'};
      --bg: ${catalog.theme.backgroundColor || '#f8fafc'};
      --text: ${catalog.theme.textColor || '#0f172a'};
      --button: ${catalog.theme.buttonColor || '#0284c7'};
      --font: '${catalog.theme.fontFamily || 'Plus Jakarta Sans'}', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font); background-color: var(--bg); color: var(--text); line-height: 1.6; }
    img { max-width: 100%; height: auto; }
    ${catalog.cssContent || ''}
  </style>
</head>
<body>
  ${customBody}
</body>
</html>`;
}

export function generateDefaultCatalogHtml(catalog: Catalog): string {
  const { business, products, categories, theme } = catalog;

  const categorySections = categories.map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id);
    if (catProducts.length === 0) return '';

    const productCards = catProducts.map(p => `
      <div data-cb-type="product-card" data-cb-id="${p.id}" class="cb-product-card" style="background:#ffffff; border-radius: 12px; border:1px solid #e2e8f0; overflow:hidden; display:flex; flex-direction:column;">
        <div style="position:relative;">
          <img data-cb-field="image" data-cb-id="${p.id}" src="${p.images[0] || 'https://via.placeholder.com/400'}" alt="${p.name}" style="width:100%; height:200px; object-fit:cover;" />
          ${p.badge ? `<span data-cb-field="badge" data-cb-id="${p.id}" style="position:absolute; top:12px; left:12px; background:${theme.primaryColor}; color:#fff; padding:4px 10px; font-size:12px; border-radius:20px; font-weight:600;">${p.badge}</span>` : ''}
        </div>
        <div style="padding:16px; display:flex; flex-direction:column; flex:1;">
          <h3 data-cb-field="name" data-cb-id="${p.id}" style="font-size:18px; font-weight:700; margin-bottom:6px;">${p.name}</h3>
          <p data-cb-field="description" data-cb-id="${p.id}" style="font-size:14px; color:#64748b; margin-bottom:12px; flex:1;">${p.description}</p>
          <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:16px;">
            <span data-cb-field="price" data-cb-id="${p.id}" style="font-size:20px; font-weight:800; color:${theme.primaryColor};">Rp ${p.price.toLocaleString('id-ID')}</span>
            ${p.discountPrice ? `<span data-cb-field="discountPrice" data-cb-id="${p.id}" style="font-size:14px; text-decoration:line-through; color:#94a3b8;">Rp ${p.discountPrice.toLocaleString('id-ID')}</span>` : ''}
          </div>
          <a data-cb-field="cta" data-cb-id="${p.id}" href="https://wa.me/${business.whatsapp}?text=Halo%20${encodeURIComponent(business.name)},%20saya%20ingin%20memesan%20${encodeURIComponent(p.name)}" target="_blank" style="display:block; text-align:center; background:${theme.buttonColor}; color:#ffffff; padding:10px 16px; border-radius:8px; font-weight:600; text-decoration:none;">${p.ctaText || 'Pesan via WA'}</a>
        </div>
      </div>
    `).join('');

    return `
      <section style="margin-bottom:40px;">
        <h2 style="font-size:24px; font-weight:700; border-bottom:2px solid ${theme.primaryColor}; padding-bottom:8px; margin-bottom:20px;">${cat.name}</h2>
        <div data-cb-type="product-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:24px;">
          ${productCards}
        </div>
      </section>
    `;
  }).join('');

  return `
    <header data-cb-type="header" style="background:${theme.primaryColor}; color:#ffffff; padding:40px 20px; text-align:center;">
      <div style="max-width:800px; margin:0 auto;">
        ${business.logo ? `<img data-cb-field="business-logo" src="${business.logo}" alt="${business.name}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:16px; border:3px solid #ffffff;" />` : ''}
        <h1 data-cb-field="business-name" style="font-size:32px; font-weight:800; margin-bottom:8px;">${business.name}</h1>
        <p data-cb-field="business-description" style="font-size:16px; opacity:0.9; margin-bottom:16px;">${business.description}</p>
        <div style="font-size:14px; opacity:0.8; display:flex; justify-content:center; gap:16px; flex-wrap:wrap;">
          <span>📍 ${business.address}</span>
          <span>⏰ ${business.openingHours}</span>
        </div>
      </div>
    </header>

    <main style="max-width:1100px; margin:40px auto; padding:0 20px;">
      ${categorySections}
    </main>

    <footer data-cb-type="footer" style="background:#0f172a; color:#94a3b8; padding:30px 20px; text-align:center; font-size:14px; border-top:1px solid #1e293b;">
      <p style="margin-bottom:8px;">&copy; ${new Date().getFullYear()} ${business.name}. All rights reserved.</p>
      <p>Hubungi Kami: ${business.whatsapp || business.phone} | ${business.email}</p>
    </footer>
  `;
}

export async function exportToZip(catalog: Catalog): Promise<Blob> {
  const zip = new JSZip();
  const htmlContent = generateStandaloneHtml(catalog);

  zip.file('index.html', htmlContent);
  zip.file('style.css', `/* Custom Styles for ${catalog.name} */\nbody { font-family: '${catalog.theme.fontFamily}', sans-serif; }`);
  zip.file('README.txt', `Katalog Website: ${catalog.name}\nBisnis: ${catalog.business.name}\nDibuat dengan Catalog Builder Pro.\n\nBuka index.html di browser untuk melihat katalog.`);

  return await zip.generateAsync({ type: 'blob' });
}

export async function exportToPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Elemen katalog untuk PDF tidak ditemukan');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
