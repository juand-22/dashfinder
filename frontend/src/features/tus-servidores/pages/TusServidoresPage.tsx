import { useAuth } from "../../auth/context/auth.context";
import { DashboardLayout } from "../../find/components/layout/DashboardLayout";
import { FeaturePlaceholder } from "../../shared/components/FeaturePlaceholder";

export function TusServidoresPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout username={user?.username} section="TUS SERVIDORES">
      <FeaturePlaceholder
        title="Tus servidores"
        description="Aquí podrás guardar y administrar tus servidores de Minecraft."
      />
    </DashboardLayout>
  );
}
