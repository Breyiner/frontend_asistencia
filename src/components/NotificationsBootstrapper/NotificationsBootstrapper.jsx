import { useEffect } from "react";
import { useNotificationsStore } from "../../stores/notificationsStore";
import { getCurrentRoleCode, getUser } from "../../utils/auth";

export default function NotificationsBootstrapper() {
  useEffect(() => {
    const user = getUser();
    const roleCode = getCurrentRoleCode();
    if (!user?.id) return;

    useNotificationsStore.getState().bootstrap({ userId: user.id, actingRoleCode: roleCode });
  }, []);

  return null;
}
