import { useState } from "react";
import { getUser, getCurrentRole } from "../../utils/auth";
import TextField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";
import "./ProfilePage.css";

export default function ProfilePage() {
  const user = getUser();
  const currentRole = getCurrentRole();
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  return (
    <div className="profile-page">
      <section className="profile-page__header">
        <div className="profile-page__avatar">
          {user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2) || "??"}
        </div>
        <div className="profile-page__info">
          <h1 className="profile-page__name">{user?.name || "Usuario"}</h1>
          <span className="profile-page__role">
            {currentRole?.name || user?.roles?.[0]?.name}
          </span>
          <Button
            className="profile-page__edit-btn"
            variant="secondary"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Cancelar" : "Editar"}
          </Button>
        </div>
      </section>

      <section className="profile-page__section">
        <h2 className="profile-page__section-title">Datos personales</h2>
        <div className="profile-page__grid">
          <TextField label="Nombres" disabled={!editMode} />
          <TextField label="Apellidos" disabled={!editMode} />
          <TextField label="Correo" disabled value={user?.email} />
          <TextField label="Teléfono" disabled={!editMode} />
          <TextField label="Tipo documento" select disabled={!editMode} />
          <TextField label="Documento" disabled={!editMode} />
        </div>
        {editMode && (
          <div className="profile-page__actions">
            <Button>Guardar</Button>
          </div>
        )}
      </section>

      <section className="profile-page__section">
        <h2 className="profile-page__section-title">Información del sistema</h2>
        <div className="profile-page__grid">
          <div className="profile-page__field">
            <label>Rol</label>
            <span>{currentRole?.name || user?.roles?.[0]?.name}</span>
          </div>
          <div className="profile-page__field">
            <label>Fecha ingreso</label>
            <span>13 Oct 2025</span>
          </div>
        </div>
      </section>

      <section className="profile-page__section">
        <h2 className="profile-page__section-title">Seguridad</h2>
        <Button
          className="profile-page__password-btn"
          variant="secondary"
          fullWidth
          onClick={() => setPasswordMode(!passwordMode)}
        >
          Cambiar contraseña
        </Button>
        {passwordMode && (
          <form className="profile-page__password-form">
            <TextField label="Contraseña actual" type="password" />
            <TextField label="Nueva contraseña" type="password" />
            <TextField label="Confirmar contraseña" type="password" />
            <div className="profile-page__actions">
              <Button>Actualizar</Button>
              <Button variant="outline">Cancelar</Button>
            </div>
          </form>
        )}
      </section>

      <footer className="profile-page__footer">
        <Button variant="danger" fullWidth>
          Cerrar sesión
        </Button>
      </footer>
    </div>
  );
}
