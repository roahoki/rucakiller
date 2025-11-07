'use client';

import { useState } from 'react';

interface KillAttemptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: string, weapon: string) => void;
  targetName: string;
  requiredLocation: string;
  requiredWeapon: string;
  hasAsesinoSerial: boolean;
}

export default function KillAttemptModal({
  isOpen,
  onClose,
  onConfirm,
  targetName,
  requiredLocation,
  requiredWeapon,
  hasAsesinoSerial,
}: KillAttemptModalProps) {
  const [location, setLocation] = useState('');
  const [weapon, setWeapon] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError('');

    // Validar arma (siempre requerida)
    if (weapon.trim().toLowerCase() !== requiredWeapon.toLowerCase()) {
      setError('❌ Arma incorrecta');
      return;
    }

    // Validar ubicación (solo si NO tiene poder asesino_serial)
    if (!hasAsesinoSerial && location.trim().toLowerCase() !== requiredLocation.toLowerCase()) {
      setError('❌ Ubicación incorrecta');
      return;
    }

    // Todo correcto
    onConfirm(location, weapon);
    setLocation('');
    setWeapon('');
  };

  const handleClose = () => {
    setLocation('');
    setWeapon('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-red-500/30 shadow-2xl">
        <h2 className="text-3xl font-bold text-red-500 mb-6 text-center">
          ⚔️ Intento de Asesinato
        </h2>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
          <p className="text-gray-300 text-center">
            Objetivo: <span className="text-white font-bold">{targetName}</span>
          </p>
        </div>

        {hasAsesinoSerial && (
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-3 mb-4">
            <p className="text-purple-300 text-sm text-center font-semibold">
              🔪 Poder Asesino Serial Activo
            </p>
            <p className="text-purple-200 text-xs text-center mt-1">
              No necesitas estar en el lugar correcto
            </p>
          </div>
        )}

        <div className="space-y-4">
          {!hasAsesinoSerial && (
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                📍 ¿Dónde estás?
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="Escribe el lugar..."
              />
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              🔪 ¿Qué arma usas?
            </label>
            <input
              type="text"
              value={weapon}
              onChange={(e) => setWeapon(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
              placeholder="Escribe el arma..."
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-300 text-sm text-center font-semibold">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Asesinar
          </button>
        </div>
      </div>
    </div>
  );
}
