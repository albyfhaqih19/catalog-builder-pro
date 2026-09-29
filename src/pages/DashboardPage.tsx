import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { Catalog } from '../types/catalog';
import { catalogRepository } from '../services';

export const DashboardPage: React.FC = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    const list = await catalogRepository.getAllCatalogs();
    setCatalogs(list);
  };

  const handleDeleteCatalog = async (id: string) => {
    await catalogRepository.deleteCatalog(id);
    await loadCatalogs();
  };

  return (
    <MainLayout
      title="Selamat Datang 👋"
      subtitle="Buat dan kelola katalog produk digital profesional Anda."
    >
      <DashboardOverview
        catalogs={catalogs}
        onDeleteCatalog={handleDeleteCatalog}
      />
    </MainLayout>
  );
};
