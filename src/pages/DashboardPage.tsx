import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { Catalog } from '../types/catalog';
import { catalogRepository } from '../services';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);

  useEffect(() => {
    loadCatalogs();
  }, [user]);

  const loadCatalogs = async () => {
    const list = await catalogRepository.getAllCatalogs(user?.email);
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
