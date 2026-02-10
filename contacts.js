export const contactService = {
    list: async () => {
        return [
            { id: 'c1', name: 'Alice Johnson', email: 'alice@corp.com', company: 'Corp Inc', stage: 'QUALIFIED' },
            { id: 'c2', name: 'Bob Brown', email: 'bob@start.up', company: 'StartUp', stage: 'LEAD' },
        ];
    },
    create: async (contact) => {
        return { ...contact, id: Math.random().toString(36).substr(2, 9) };
    }
};
