export const mapLeadToContact = (lead) => {
    return {
        fullName: lead.name,
        emailAddress: lead.email,
        organizationName: lead.company,
        source: 'PROSPECTOR',
    };
};
export const mapLeadToDeal = (lead) => {
    return {
        title: `Deal with ${lead.company}`,
        value: 0, // Default value
        contactId: lead.id, // Assuming ID is carried over or mapped
    };
};
