import { Outlet } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

export default function AppLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
