// Mock interfaces for demonstration - in real app these would be imported from libs/prospector and libs/hub
interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface Contact {
  id: string;
  fullName: string;
  emailAddress: string;
  organizationName: string;
  source: 'PROSPECTOR';
}

interface Deal {
  title: string;
  value: number;
  contactId: string;
}

export const mapLeadToContact = (lead: Lead): Omit<Contact, 'id'> => {
  return {
    fullName: lead.name,
    emailAddress: lead.email,
    organizationName: lead.company,
    source: 'PROSPECTOR',
  };
};

export const mapLeadToDeal = (lead: Lead): Deal => {
  return {
    title: `Deal with ${lead.company}`,
    value: 0, // Default value
    contactId: lead.id, // Assuming ID is carried over or mapped
  };
};
