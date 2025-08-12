
import React, { useState, useCallback } from 'react';
import { Role } from './types';
import { PublicView } from './pages/Public';
import { StaffView } from './pages/Staff';

function App() {
  const [isStaffArea, setIsStaffArea] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const handleStaffLoginClick = useCallback(() => {
    setIsStaffArea(true);
  }, []);

  const handleRoleSelect = useCallback((role: Role) => {
    setCurrentRole(role);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentRole(null);
    setIsStaffArea(false); // Go back to public page
  }, []);

  if (isStaffArea) {
    return <StaffView role={currentRole} onRoleSelect={handleRoleSelect} onLogout={handleLogout} />;
  }

  return <PublicView onStaffLoginClick={handleStaffLoginClick} />;
}

export default App;
