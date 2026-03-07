import React from 'react';
import { ResearchPageLayout } from '../components/sections/ResearchPageLayout';

interface StudioReferenceProps {
  user?: { id: string; username: string; avatar?: string | null; isPresetAdmin?: boolean } | null;
}

export const StudioReference: React.FC<StudioReferenceProps> = ({ user }) => {
  return <ResearchPageLayout presetKey="studio" user={user} />;
};
