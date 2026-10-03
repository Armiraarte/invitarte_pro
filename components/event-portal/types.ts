import type { PackageType } from '../../types';
import type { InvitationData } from '../../laboratorio/types';

export type GuestStatus = 'confirmado' | 'pendiente' | 'declinado';
export type EventPortalStatus = 'activo' | 'borrador' | 'inactivo' | 'cancelado';

export type EventPortalEventDraft = {
  eventCode: string;
  eventTitle: string;
  hostName: string;
  eventDate: string;
  venue: string;
  venueMapsUrl: string;
  status: EventPortalStatus;
  createdDate: string;
  packageId: PackageType;
};

export type EventPortalGuestDraft = {
  name: string;
  companions: number;
  group: string;
  tableLabel?: string;
  email?: string;
  phone?: string;
  status: GuestStatus;
  note?: string;
};

export type EventPortalGuest = {
  id: string;
  name: string;
  companions: number;
  group: string;
  tableLabel?: string;
  guestCode: string;
  guestUrl: string;
  email?: string;
  phone?: string;
  status: GuestStatus;
  checkedInAt?: string;
  checkInCount?: number;
  note?: string;
};

export type EventPortalRecord = {
  code: string;
  invitationId: string | null;
  designId: string;
  packageId: PackageType;
  eventTitle: string;
  hostName: string;
  eventDate: string;
  eventDateValue: string;
  venue: string;
  venueMapsUrl: string;
  status: EventPortalStatus;
  createdDate: string;
  shareUrl: string;
  featureLabels: string[];
  guests: EventPortalGuest[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type InvitationProjectRecord = {
  eventCode: string;
  eventId: number;
  projectPath: string;
  appEntry: string;
  templateSource: string;
  designId: string | null;
  invitationId: string | null;
  shareUrl: string | null;
  projectExists: boolean;
  appEntryExists: boolean;
  metadataExists: boolean;
  projectAbsolutePath: string;
  appEntryAbsolutePath: string;
  metadataAbsolutePath: string;
  distPath: string;
  distAbsolutePath: string;
  previewUrl: string | null;
  previewExists: boolean;
  downloadFileName: string;
};

export type InvitationProjectSourceRecord = {
  project: InvitationProjectRecord;
  source: string;
  sourceUpdatedAt: string | null;
};

export type InvitationProjectBuilderStateRecord = {
  project: InvitationProjectRecord;
  packageId: string | null;
  formData: InvitationData | null;
  builderStateUpdatedAt: string | null;
  hasBuilderState: boolean;
};

export type EventAdminWorkspaceItem = {
  record: EventPortalRecord;
  projectPath: string;
  appEntry: string;
  previewPath: string;
};

export type EventCountdown = {
  target: Date;
  isPast: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export type EventMetrics = {
  totalGuests: number;
  totalSeats: number;
  confirmedGuests: number;
  confirmedSeats: number;
  checkedInGuests: number;
  checkedInSeats: number;
  pendingGuests: number;
  declinedGuests: number;
};

export type EventRecordResolution = {
  record: EventPortalRecord | null;
  failed: boolean;
};
