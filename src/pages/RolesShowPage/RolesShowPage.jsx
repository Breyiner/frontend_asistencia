import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useRoleShow from "../../hooks/useRoleShow";
import PermissionsModal from "../../components/PermissionsModal/PermissionsModal";

export default function RoleShowPage() {
    const { roleId } = useParams();
    const navigate = useNavigate();

    const {
        role,
        loading,
        notFound,

        isEditing,
        form,
        errors,
        saving,

        startEdit,
        cancelEdit,
        onChange,
        save,
        deleteRole,

        allPermissions,
        syncPermissions,
    } = useRoleShow(roleId);

    const [openPermModal, setOpenPermModal] = useState(false);

    const initialSelectedIds = useMemo(
        () => role?.permissions?.map((p) => p.id) || [],
        [role]
    );

    const sections = useMemo(
        () => [
            {
                left: [
                    {
                        title: "Información del Rol",
                        content: isEditing ? (
                            <>
                                <InputField
                                    label="Nombre"
                                    name="name"
                                    value={form.name}
                                    onChange={onChange}
                                    error={errors.name}
                                    disabled={saving}
                                />
                            </>
                        ) : (
                            <>
                                <InfoRow label="Nombre" value={role?.name} />
                                <InfoRow label="Código" value={role?.code} />
                            </>
                        ),
                    },
                ],
                right: [
                    {
                        title: "Descripción",
                        content: isEditing ? (
                            <InputField
                                label="Descripción"
                                name="description"
                                textarea
                                rows={4}
                                value={form.description}
                                onChange={onChange}
                                disabled={saving}
                                error={errors.description}
                            />
                        ) : (
                            <InfoRow label="Descripción" value={role?.description || "Sin descripción"} />
                        ),
                    },
                ],
            },
        ],
        [isEditing, form, errors, onChange, role, saving]
    );

    const side = useMemo(
        () =>
            [
                !isEditing && role
                    ? {
                        title: "Información Sistema",
                        variant: "default",
                        content: (
                            <>
                                <InfoRow label="ID" value={role.id} />
                                <InfoRow label="Fecha registro" value={role.created_at} />
                                <InfoRow label="Última actualización" value={role.updated_at} />
                            </>
                        ),
                    }
                    : null,

                role
                    ? {
                        title: "Permisos",
                        variant: "default",
                        content: (
                            <>
                                <Button
                                    variant="primary"
                                    onClick={() => setOpenPermModal(true)}
                                    disabled={saving}
                                >
                                    Vincular permisos
                                </Button>

                                <div style={{ marginTop: 12 }}>
                                    <InfoRow label="Total permisos" value={role.permissions?.length ?? 0} />
                                </div>
                            </>
                        ),
                    }
                    : null,
            ].filter(Boolean),
        [isEditing, role, saving]
    );

    const actions = useMemo(
        () =>
            isEditing ? (
                <>
                    <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={save} disabled={saving}>
                        {saving ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="primary" onClick={startEdit} disabled={saving}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={deleteRole} disabled={saving}>
                        Eliminar
                    </Button>
                </>
            ),
        [isEditing, saving, cancelEdit, save, startEdit, deleteRole]
    );

    if (loading) return <div>Cargando...</div>;
    if (notFound) return <div>No encontrado</div>;
    if (!role) return null;

    return (
        <div className="role-show">
            <UserLayout onBack={() => navigate("/roles")} actions={actions}>
                <BlocksGrid sections={sections} side={side} />
            </UserLayout>

            <PermissionsModal
                isOpen={openPermModal}
                onClose={() => setOpenPermModal(false)}
                permissions={allPermissions}
                initialSelectedIds={role.permissions?.map(p => p.id) ?? []}
                loading={saving}
                onSave={async (ids) => {
                    const ok = await syncPermissions(ids);
                    if (ok) setOpenPermModal(false);
                }}
            />
        </div>
    );
}
