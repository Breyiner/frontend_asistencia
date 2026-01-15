import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useUserShow from "../../hooks/useUserShow";
import useCatalog from "../../hooks/useCatalog";

export default function UsersShowPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        user,
        loading,
        isEditing,
        form,
        errors,
        saving,
        startEdit,
        cancelEdit,
        onChange,
        save,
        deleteUser,
        setRolesCatalog,
    } = useUserShow(id);

    const rolesCatalog = useCatalog("roles", { includeEmpty: false });

    const statusCatalog = useCatalog("user_statuses");
    const docTypesCatalog = useCatalog("document_types");

    useEffect(() => {
        if (setRolesCatalog) {
            setRolesCatalog(rolesCatalog.options);
        }
    }, [rolesCatalog.options, setRolesCatalog]);

    const left = useMemo(
        () => [
            {
                title: "Información Personal",
                content: isEditing ? (
                    <>
                        <InputField
                            label="Nombres"
                            name="first_name"
                            value={form.first_name}
                            onChange={onChange}
                            error={errors.first_name}
                        />
                        <InputField
                            label="Apellidos"
                            name="last_name"
                            value={form.last_name}
                            onChange={onChange}
                            error={errors.last_name}
                        />
                        <InputField
                            label="Tipo de Documento"
                            name="document_type_id"
                            value={form.document_type_id}
                            onChange={onChange}
                            options={docTypesCatalog.options}
                            disabled={docTypesCatalog.loading || saving}
                            error={errors.document_type_id}
                            select
                        />
                        <InputField
                            label="Documento"
                            name="document_number"
                            value={form.document_number}
                            onChange={onChange}
                            error={errors.document_number}
                            disabled={saving}
                        />
                        <InputField
                            label="Correo"
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            error={errors.email}
                            disabled={saving}
                        />
                        <InputField
                            label="Teléfono"
                            name="telephone_number"
                            value={form.telephone_number}
                            onChange={onChange}
                            error={errors.telephone_number}
                            disabled={saving}
                        />
                    </>
                ) : (
                    <>
                        <InfoRow label="Nombres" value={user?.first_name} />
                        <InfoRow label="Apellidos" value={user?.last_name} />
                        <InfoRow label="Tipo de Documento" value={user?.document_type_name} />
                        <InfoRow label="Documento" value={user?.document_number} />
                        <InfoRow label="Correo" value={user?.email} />
                        <InfoRow label="Teléfono" value={user?.telephone_number} />
                    </>
                ),
            },
        ],
        [
            isEditing,
            form,
            errors,
            onChange,
            user,
            docTypesCatalog.options,
            docTypesCatalog.loading,
            saving,
        ]
    );

    const right = useMemo(
        () => [
            {
                title: "Información Sistema",
                content: isEditing ? (
                    <>
                        <InputField
                            label="Roles"
                            name="roles"
                            value={form.roles}
                            options={rolesCatalog.options}
                            multiple
                            size={6}
                            disabled={rolesCatalog.loading || saving}
                            error={errors.roles}
                            onChange={onChange}
                        />

                        <InputField
                            label="Estado"
                            name="status_id"
                            value={form.status_id}
                            onChange={onChange}
                            options={statusCatalog.options}
                            disabled={statusCatalog.loading || saving}
                            error={errors.status_id}
                        />
                    </>
                ) : (
                    <>
                        <InfoRow
                            label="Rol"
                            value={Array.isArray(user?.roles) ? user.roles.join(", ") : user?.roles}
                        />
                        <InfoRow label="Estado" value={user?.status} />
                    </>
                ),
            },
        ],
        [
            isEditing,
            form.roles,
            form.status_id,
            errors,
            onChange,
            user,
            rolesCatalog.options,
            rolesCatalog.loading,
            statusCatalog.options,
            statusCatalog.loading,
            saving,
        ]
    );

    const side = useMemo(
        () =>
            [
                !isEditing && user
                    ? {
                        title: "Información Adicional",
                        variant: "default",
                        content: (
                            <>
                                <InfoRow label="ID" value={user.id} />
                                <InfoRow label="Fecha registro" value={user.created_at} />
                                <InfoRow label="Última actualización" value={user.updated_at} />
                            </>
                        ),
                    }
                    : null,
                {
                    title: "Nota",
                    variant: "info",
                    content: (
                        <p>Los cambios realizados se guardarán automáticamente en el sistema</p>
                    ),
                },
            ].filter(Boolean),
        [isEditing, user]
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
                    <Button variant="primary" onClick={startEdit}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={deleteUser}>Eliminar</Button>
                </>
            ),
        [isEditing, saving, cancelEdit, save, startEdit]
    );

    if (loading) return <div>Cargando...</div>;
    if (!user) return <div>No encontrado</div>;

    return (
        <div className="user-show">
            <UserLayout onBack={() => navigate("/users")} actions={actions}>
                <BlocksGrid left={left} right={right} side={side} />
            </UserLayout>
        </div>
    );
}
