import { useProfile } from "../../hooks/useProfile";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";
import "./ProfilePage.css";

export default function ProfilePage() {
  const {
    user,
    currentRole,
    currentData,
    initialLoading,
    personalLoading,
    passwordLoading,
    editMode,
    passwordMode,
    personalForm,
    passwordForm,
    personalErrors,
    passwordErrors,
    documentTypes,
    documentTypesLoading,
    toggleEdit,
    togglePassword,
    onPersonalChange,
    onPasswordChange,
    savePersonal,
    savePassword,
    handleLogout,
    logoutLoading,
  } = useProfile();

  if (initialLoading) {
    return <div className="profile-page__loading">Cargando perfil...</div>;
  }

  if (logoutLoading) {
    return (
      <div className="logout-loading">
        <div className="logout-spinner"></div>
        <div className="logout-text">
          Cerrando sesión
          <div
            style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "0.5rem" }}
          >
            Redirigiendo al login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <section className="profile-page__header">
        <div className="profile-page__avatar">
          {user?.profile?.first_name
            ? `${user?.profile.first_name[0]}${
                user?.profile.last_name?.[0] || ""
              }`.toUpperCase()
            : "??"}
        </div>
        <div className="profile-page__info">
          <h1 className="profile-page__name">
            {user?.profile?.first_name} {user?.profile?.last_name}
          </h1>
          <span className="profile-page__role">
            {currentRole?.name || "Usuario"}
          </span>
        </div>
        <Button
          variant="secondary"
          onClick={toggleEdit}
          disabled={personalLoading}
        >
          {personalLoading ? "Guardando..." : editMode ? "Cancelar" : "Editar"}
        </Button>
      </section>

      <section className="profile-page__section profile-page__section-personal">
        <h2 className="profile-page__section-title">Datos personales</h2>
        <form onSubmit={savePersonal} className="profile-page__personal-form">
          <div className="profile-page__grid">
            <InputField
              name="first_name"
              label="Nombres"
              value={personalForm.first_name}
              onChange={onPersonalChange}
              disabled={!editMode || personalLoading}
              error={personalErrors.first_name}
            />
            <InputField
              name="last_name"
              label="Apellidos"
              value={personalForm.last_name}
              onChange={onPersonalChange}
              disabled={!editMode || personalLoading}
              error={personalErrors.last_name}
            />
            <InputField
              name="email"
              label="Correo"
              value={personalForm.email}
              onChange={onPersonalChange}
              disabled={!editMode || personalLoading}
              error={personalErrors.email}
            />
            <InputField
              name="telephone_number"
              label="Teléfono"
              value={personalForm.telephone_number}
              onChange={onPersonalChange}
              disabled={!editMode || personalLoading}
              error={personalErrors.telephone_number}
            />
            <InputField
              name="document_type_id"
              label="Tipo documento"
              select
              value={personalForm.document_type_id}
              onChange={onPersonalChange}
              disabled={!editMode || documentTypesLoading || personalLoading}
              error={personalErrors.document_type_id}
              options={documentTypes.map((dt) => ({
                value: dt.id,
                label: dt.name,
              }))}
            />
            <InputField
              name="document_number"
              label="Documento"
              value={personalForm.document_number}
              onChange={onPersonalChange}
              disabled={!editMode || personalLoading}
              error={personalErrors.document_number}
            />
          </div>
          {editMode && (
            <div className="profile-page__actions">
              <Button type="submit" disabled={personalLoading}>
                {personalLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          )}
        </form>
      </section>

      <section className="profile-page__section">
        <h2 className="profile-page__section-title">Información del sistema</h2>
        <div className="profile-page__grid">
          <div className="profile-page__field">
            <label>Rol</label>
            <span>{currentRole?.name}</span>
          </div>
          <div className="profile-page__field">
            <label>Fecha ingreso</label>
            <span>{currentData?.created_at}</span>
          </div>
        </div>
      </section>

      <section className="profile-page__section">
        <h2 className="profile-page__section-title">Seguridad</h2>
        <Button variant="primary" onClick={togglePassword}>
          Cambiar contraseña
        </Button>
        {passwordMode && (
          <form className="profile-page__password-form" onSubmit={savePassword}>
            <InputField
              name="current_password"
              label="Contraseña actual"
              type="password"
              value={passwordForm.current_password}
              onChange={onPasswordChange}
              disabled={passwordLoading}
              error={passwordErrors.current_password}
            />
            <InputField
              name="new_password"
              label="Nueva contraseña"
              type="password"
              value={passwordForm.new_password}
              onChange={onPasswordChange}
              disabled={passwordLoading}
              error={passwordErrors.new_password}
            />
            <InputField
              name="password_confirmation"
              label="Confirmar contraseña"
              type="password"
              value={passwordForm.password_confirmation}
              onChange={onPasswordChange}
              disabled={passwordLoading}
              error={passwordErrors.password_confirmation}
            />
            <div className="profile-page__actions">
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
              <Button
                variant="secondary"
                onClick={togglePassword}
                disabled={passwordLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </section>

      <section className="profile-page__section">
        <h2 className="profile-page__section-title">Sesión</h2>
        <Button
          variant="danger"
          onClick={handleLogout}
          disabled={logoutLoading}
        >
          Cerrar sesión
        </Button>
      </section>
    </div>
  );
}
