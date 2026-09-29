import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { WizardContainer } from '../components/wizard/WizardContainer';

export const CreateCatalogPage: React.FC = () => {
  return (
    <MainLayout
      title="Buat Katalog Baru"
      subtitle="Ikuti langkah wizard berikut untuk membuat katalog produk profesional Anda."
    >
      <WizardContainer />
    </MainLayout>
  );
};
