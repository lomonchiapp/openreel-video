import React, { useState, useEffect, useCallback } from "react";
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ExternalLink,
  Shield,
  KeyRound,
} from "lucide-react";
import { Input } from "@openreel/ui";
import { Button } from "@openreel/ui";
import { useSettingsStore, SERVICE_REGISTRY } from "../../../stores/settings-store";
import {
  isMasterPasswordSet,
  isSessionUnlocked,
  setupMasterPassword,
  unlockSession,
  lockSession,
  saveSecret,
  getSecret,
  deleteSecret,
  listSecrets,
  changeMasterPassword,
} from "../../../services/secure-storage";
import { MasterPasswordDialog } from "./MasterPasswordDialog";
import { toast } from "../../../stores/notification-store";

export const ApiKeysPanel: React.FC = () => {
  const { addConfiguredService, removeConfiguredService } =
    useSettingsStore();

  const [passwordSet, setPasswordSet] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [passwordDialogMode, setPasswordDialogMode] = useState<
    "setup" | "unlock" | "change" | null
  >(null);
  const [storedKeys, setStoredKeys] = useState<
    Array<{ id: string; label: string; createdAt: number; updatedAt: number }>
  >([]);
  const [addingService, setAddingService] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState("");
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const refreshState = useCallback(async () => {
    const isSet = await isMasterPasswordSet();
    setPasswordSet(isSet);
    setUnlocked(isSessionUnlocked());

    if (isSessionUnlocked()) {
      const keys = await listSecrets();
      setStoredKeys(keys);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const handlePasswordSubmit = useCallback(
    async (password: string, newPassword?: string): Promise<boolean> => {
      if (passwordDialogMode === "setup") {
        await setupMasterPassword(password);
        setPasswordDialogMode(null);
        await refreshState();
        toast.success("Contraseña maestra establecida", "Tus claves API se cifrarán con AES-256-GCM.");
        return true;
      }

      if (passwordDialogMode === "unlock") {
        const success = await unlockSession(password);
        if (success) {
          setPasswordDialogMode(null);
          await refreshState();
          toast.success("Sesión desbloqueada", "Ya puedes administrar tus claves API.");
        }
        return success;
      }

      if (passwordDialogMode === "change" && newPassword) {
        const success = await changeMasterPassword(password, newPassword);
        if (success) {
          setPasswordDialogMode(null);
          await refreshState();
          toast.success("Contraseña cambiada", "Todas las claves se volvieron a cifrar.");
        }
        return success;
      }

      return false;
    },
    [passwordDialogMode, refreshState],
  );

  const handleSaveKey = useCallback(
    async (serviceId: string) => {
      if (!newKeyValue.trim()) return;

      const service = SERVICE_REGISTRY.find((s) => s.id === serviceId);
      if (!service) return;

      try {
        await saveSecret(serviceId, service.label, newKeyValue.trim());
        addConfiguredService(serviceId);
        setNewKeyValue("");
        setAddingService(null);
        await refreshState();
        toast.success(`Clave de ${service.label} guardada`, "Clave API cifrada y almacenada.");
      } catch (err) {
        toast.error("Error al guardar", err instanceof Error ? err.message : "Error desconocido");
      }
    },
    [newKeyValue, addConfiguredService, refreshState],
  );

  const handleDeleteKey = useCallback(
    async (serviceId: string) => {
      const service = SERVICE_REGISTRY.find((s) => s.id === serviceId);
      try {
        await deleteSecret(serviceId);
        removeConfiguredService(serviceId);
        setRevealedKeys((prev) => {
          const next = { ...prev };
          delete next[serviceId];
          return next;
        });
        await refreshState();
        toast.success(`Clave de ${service?.label ?? serviceId} eliminada`);
      } catch (err) {
        toast.error("Error al eliminar", err instanceof Error ? err.message : "Error desconocido");
      }
    },
    [removeConfiguredService, refreshState],
  );

  const handleRevealKey = useCallback(async (serviceId: string) => {
    if (revealedKeys[serviceId]) {
      setShowKey((prev) => ({ ...prev, [serviceId]: !prev[serviceId] }));
      return;
    }

    try {
      const value = await getSecret(serviceId);
      if (value) {
        setRevealedKeys((prev) => ({ ...prev, [serviceId]: value }));
        setShowKey((prev) => ({ ...prev, [serviceId]: true }));
      }
    } catch (err) {
      toast.error("Error al descifrar", err instanceof Error ? err.message : "Error desconocido");
    }
  }, [revealedKeys]);

  const handleLock = useCallback(() => {
    lockSession();
    setUnlocked(false);
    setStoredKeys([]);
    setRevealedKeys({});
    setShowKey({});
  }, []);

  const availableServices = SERVICE_REGISTRY.filter(
    (s) => !storedKeys.some((k) => k.id === s.id),
  );

  // Not set up yet
  if (!passwordSet) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Shield size={32} className="text-primary" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          Almacenamiento seguro de claves API
        </h3>
        <p className="text-sm text-text-muted mb-6 max-w-sm">
          Configura una contraseña maestra para cifrar y guardar tus claves API
          localmente. Las claves se cifran con AES-256-GCM y nunca salen de tu navegador.
        </p>
        <Button onClick={() => setPasswordDialogMode("setup")}>
          <KeyRound size={16} className="mr-2" />
          Configurar contraseña maestra
        </Button>

        {passwordDialogMode && (
          <MasterPasswordDialog
            isOpen={!!passwordDialogMode}
            onClose={() => setPasswordDialogMode(null)}
            mode={passwordDialogMode}
            onSubmit={handlePasswordSubmit}
          />
        )}
      </div>
    );
  }

  // Locked
  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <Lock size={32} className="text-amber-500" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          Sesión bloqueada
        </h3>
        <p className="text-sm text-text-muted mb-6 max-w-sm">
          Ingresa tu contraseña maestra para ver y administrar tus claves API.
        </p>
        <Button onClick={() => setPasswordDialogMode("unlock")}>
          <Unlock size={16} className="mr-2" />
          Desbloquear
        </Button>

        {passwordDialogMode && (
          <MasterPasswordDialog
            isOpen={!!passwordDialogMode}
            onClose={() => setPasswordDialogMode(null)}
            mode={passwordDialogMode}
            onSubmit={handlePasswordSubmit}
          />
        )}
      </div>
    );
  }

  // Unlocked — full management UI
  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Shield size={14} className="text-primary" />
          <span>
            {storedKeys.length}{" "}
            {storedKeys.length !== 1 ? "claves guardadas" : "clave guardada"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPasswordDialogMode("change")}
          >
            <Key size={14} className="mr-1" />
            Cambiar contraseña
          </Button>
          <Button variant="outline" size="sm" onClick={handleLock}>
            <Lock size={14} className="mr-1" />
            Bloquear
          </Button>
        </div>
      </div>

      {/* Stored keys list */}
      <div className="space-y-3">
        {storedKeys.map((stored) => {
          const service = SERVICE_REGISTRY.find((s) => s.id === stored.id);
          const isRevealed = showKey[stored.id] && revealedKeys[stored.id];

          return (
            <div
              key={stored.id}
              className="border border-border rounded-lg p-4 bg-background-secondary"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Key size={14} className="text-primary" />
                  <span className="text-sm font-medium text-text-primary">
                    {service?.label ?? stored.label}
                  </span>
                  {service?.docsUrl && (
                    <a
                      href={service.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-primary transition-colors"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRevealKey(stored.id)}
                    className="p-1.5 rounded hover:bg-background-tertiary text-text-muted hover:text-text-primary transition-colors"
                    title={isRevealed ? "Ocultar clave" : "Mostrar clave"}
                  >
                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => handleDeleteKey(stored.id)}
                    className="p-1.5 rounded hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                    title="Eliminar clave"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {service && (
                <p className="text-xs text-text-muted mb-2">
                  {service.description}
                </p>
              )}

              <div className="font-mono text-xs bg-background rounded px-3 py-2 text-text-secondary">
                {isRevealed
                  ? revealedKeys[stored.id]
                  : "••••••••••••••••••••••••••••••••"}
              </div>

              <div className="text-[10px] text-text-muted mt-2">
                Agregada {new Date(stored.createdAt).toLocaleDateString()} &middot;
                Actualizada {new Date(stored.updatedAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add new key */}
      {addingService ? (
        <div className="border border-primary/30 rounded-lg p-4 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <Plus size={14} className="text-primary" />
            <span className="text-sm font-medium text-text-primary">
              Agregar clave de{" "}
              {SERVICE_REGISTRY.find((s) => s.id === addingService)?.label}
            </span>
          </div>
          <Input
            type="password"
            value={newKeyValue}
            onChange={(e) => setNewKeyValue(e.target.value)}
            placeholder="Pega tu clave API aquí"
            autoFocus
            className="mb-3 font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAddingService(null);
                setNewKeyValue("");
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => handleSaveKey(addingService)}
              disabled={!newKeyValue.trim()}
            >
              Guardar clave
            </Button>
          </div>
        </div>
      ) : availableServices.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3">
            Agregar clave API
          </h4>
          <div className="grid gap-2">
            {availableServices.map((service) => (
              <button
                key={service.id}
                onClick={() => setAddingService(service.id)}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-background-tertiary group-hover:bg-primary/10 transition-colors">
                  <Plus
                    size={14}
                    className="text-text-muted group-hover:text-primary transition-colors"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {service.label}
                  </div>
                  <div className="text-xs text-text-muted">
                    {service.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {passwordDialogMode && (
        <MasterPasswordDialog
          isOpen={!!passwordDialogMode}
          onClose={() => setPasswordDialogMode(null)}
          mode={passwordDialogMode}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  );
};
