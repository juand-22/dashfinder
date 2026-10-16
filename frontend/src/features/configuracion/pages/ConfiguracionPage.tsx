import { useAuth } from "../../auth/context/auth.context";
import { DashboardLayout } from "../../find/components/layout/DashboardLayout";
import { FeaturePlaceholder } from "../../shared/components/FeaturePlaceholder";

export function ConfiguracionPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout username={user?.username} section="CONFIGURACIÓN">
      <FeaturePlaceholder
        title="Configuración"
        description="Las preferencias de tu cuenta y de la aplicación estarán disponibles aquí."
      />
    </DashboardLayout>
  );
}
