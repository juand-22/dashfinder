import { useAuth } from "../../auth/context/auth.context";
import { DashboardLayout } from "../../find/components/layout/DashboardLayout";
import { FeaturePlaceholder } from "../../shared/components/FeaturePlaceholder";

export function DehashesPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout username={user?.username} section="DEHASHES">
      <FeaturePlaceholder
        title="Dehashes"
        description="Aquí podrás dehashear las contraseñas encontradas en tus servidores."
      />
    </DashboardLayout>
  );
}
