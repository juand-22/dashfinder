import { DashboardLayout } from "../../find/components/layout/DashboardLayout";
import { useAuth } from "../../auth/context/auth.context";
import { FeaturePlaceholder } from "../../shared/components/FeaturePlaceholder";

export function DashmodPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout username={user?.username} section="DASHMOD">
      <FeaturePlaceholder
        title="Dashmod"
        description="Administra y explora las herramientas de Dashmod desde aquí."
      />
    </DashboardLayout>
  );
}
